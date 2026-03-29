import { describe, it, expect, vi, beforeEach } from 'vitest'
import { _resetStore } from '@/lib/rate-limit'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn((name: string) => name === 'platform_lang' ? { value: 'en' } : undefined),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(async () => ({ get: vi.fn(() => '1.2.3.4') })),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
  },
}))
vi.mock('@/lib/totp', () => ({
  verifyTotpCode: vi.fn(),
  generateTotpSecret: vi.fn(() => 'FAKESECRETBASE32'),
  generateTotpUri: vi.fn(() => 'otpauth://totp/findyour.club:test'),
  generateTotpCode: vi.fn(),
}))
vi.mock('@/lib/setup-cookie', () => ({
  encodeTotpVerifiedCookie: vi.fn(() => 'encrypted-uid'),
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(async () => null),
  authOptions: {},
  SESSION_COOKIE_NAME: 'next-auth.session-token',
}))

import { prisma } from '@/server/db'
import { verifyTotpCode } from '@/lib/totp'
import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { enrollTotp } from '@/app/[lang]/(dashboard)/account/totp-setup/actions'

describe('enrollTotp()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    _resetStore()
  })

  it('returns RATE_LIMITED after 5 failed attempts from the same IP', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'user-abc' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ pendingTotpSecret: 'FAKESECRET' } as never)
    vi.mocked(verifyTotpCode).mockResolvedValue(false)

    for (let i = 0; i < 5; i++) {
      await enrollTotp({ code: '000000' })
    }

    const result = await enrollTotp({ code: '000000' })
    expect(result).toMatchObject({ success: false, code: 'RATE_LIMITED' })
  })

  it('returns UNAUTHORIZED when there is no auth session', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    const result = await enrollTotp({ code: '123456' })
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns UNAUTHORIZED when re-enrolling with totpEnabled=true but totpVerified=false (half-authenticated)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'user-abc', totpEnabled: true, totpVerified: false } } as any)
    const result = await enrollTotp({ code: '123456' })
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('allows re-enrollment when fully authenticated (totpEnabled=true, totpVerified=true)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'user-abc', totpEnabled: true, totpVerified: true } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ pendingTotpSecret: 'NEWSECRET32' } as never)
    vi.mocked(verifyTotpCode).mockResolvedValue(true)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    await expect(enrollTotp({ code: '123456' })).rejects.toThrow('NEXT_REDIRECT:/en/account')

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-abc' },
      data: expect.objectContaining({
        totpSecret: 'NEWSECRET32',
        totpEnabled: true,
        pendingTotpSecret: null,
      }),
    })
    expect(redirect).toHaveBeenCalledWith('/en/account')
  })

  it('returns VALIDATION_ERROR for non-6-digit code', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'user-abc' } } as any)
    const result = await enrollTotp({ code: '123' })
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('returns UNAUTHORIZED when no pendingTotpSecret in DB', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'user-abc' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ pendingTotpSecret: null } as never)
    const result = await enrollTotp({ code: '123456' })
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns TOTP_INVALID for wrong code', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'user-abc' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ pendingTotpSecret: 'FAKESECRET' } as never)
    vi.mocked(verifyTotpCode).mockResolvedValue(false)
    const result = await enrollTotp({ code: '000000' })
    expect(result).toMatchObject({ success: false, code: 'TOTP_INVALID' })
  })

  it('stores totpSecret, sets totpEnabled=true, clears pendingTotpSecret on valid code', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'user-abc' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ pendingTotpSecret: 'MYSECRET32' } as never)
    vi.mocked(verifyTotpCode).mockResolvedValue(true)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    await expect(enrollTotp({ code: '123456' })).rejects.toThrow('NEXT_REDIRECT:/en/account')

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-abc' },
      data: expect.objectContaining({
        totpSecret: 'MYSECRET32',
        totpEnabled: true,
        pendingTotpSecret: null,
      }),
    })

    expect(redirect).toHaveBeenCalledWith('/en/account')
  })

  it('does NOT create a new DB session (user is already logged in)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'user-abc' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ pendingTotpSecret: 'MYSECRET32' } as never)
    vi.mocked(verifyTotpCode).mockResolvedValue(true)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    await expect(enrollTotp({ code: '123456' })).rejects.toThrow('NEXT_REDIRECT:/en/account')

    // enrollTotp no longer creates sessions — setupPassword handles that
    expect((prisma as Record<string, unknown>).session).toBeUndefined()
  })

  it('sets totp_verified cookie on successful enrollment', async () => {
    const mockCookieSet = vi.fn()
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValueOnce({ set: mockCookieSet, get: vi.fn((name: string) => name === 'platform_lang' ? { value: 'en' } : undefined), delete: vi.fn() } as never)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'user-abc' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ pendingTotpSecret: 'MYSECRET32' } as never)
    vi.mocked(verifyTotpCode).mockResolvedValue(true)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    await expect(enrollTotp({ code: '123456' })).rejects.toThrow('NEXT_REDIRECT:/en/account')

    expect(mockCookieSet).toHaveBeenCalledWith(
      'totp_verified',
      expect.any(String),
      expect.objectContaining({ httpOnly: true })
    )
  })
})
