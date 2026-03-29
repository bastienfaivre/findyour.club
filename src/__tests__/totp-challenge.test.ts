import { describe, it, expect, vi, beforeEach } from 'vitest'
import { _resetStore } from '@/lib/rate-limit'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
}))
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({ get: vi.fn(() => '1.2.3.4') })),
  cookies: vi.fn(async () => ({ set: vi.fn(), get: vi.fn() })),
}))
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
  default: vi.fn(() => vi.fn()),
}))
vi.mock('@/server/auth', () => ({
  authOptions: {},
  getAuthSession: vi.fn(),
  nextAuthHandler: vi.fn(),
}))
vi.mock('@/server/db', () => ({
  prisma: { user: { findUnique: vi.fn() } },
}))
vi.mock('@/lib/totp', () => ({
  verifyTotpCode: vi.fn(),
  generateTotpSecret: vi.fn(),
  generateTotpUri: vi.fn(),
  generateTotpCode: vi.fn(),
}))
vi.mock('@/lib/setup-cookie', () => ({
  encodeTotpVerifiedCookie: vi.fn(() => 'encrypted-uid'),
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/server/db'
import { verifyTotpCode } from '@/lib/totp'
import { redirect } from 'next/navigation'
import { verifyTotpChallenge } from '@/app/[lang]/(dashboard)/auth/totp/actions'

describe('verifyTotpChallenge()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    _resetStore()
  })

  it('returns UNAUTHENTICATED when no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const result = await verifyTotpChallenge({ code: '123456' })
    expect(result).toMatchObject({ success: false, code: 'UNAUTHENTICATED' })
  })

  it('returns VALIDATION_ERROR for non-6-digit code', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'u1' } } as never)
    const result = await verifyTotpChallenge({ code: '123' })
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('returns TOTP_NOT_CONFIGURED when user has no totpSecret', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ totpSecret: null } as never)
    const result = await verifyTotpChallenge({ code: '123456' })
    expect(result).toMatchObject({ success: false, code: 'TOTP_NOT_CONFIGURED' })
  })

  it('returns TOTP_INVALID for wrong code', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ totpSecret: 'SECRET' } as never)
    vi.mocked(verifyTotpCode).mockResolvedValue(false)
    const result = await verifyTotpChallenge({ code: '000000' })
    expect(result).toMatchObject({ success: false, code: 'TOTP_INVALID' })
  })

  it('sets encrypted totp_verified cookie and redirects CLUB_ADMIN to club page', async () => {
    const mockCookieSet = vi.fn()
    const mockCookieGet = vi.fn((name: string) => name === 'platform_lang' ? { value: 'en' } : undefined)
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValueOnce({ set: mockCookieSet, get: mockCookieGet } as never)

    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'u1', role: 'CLUB_ADMIN' } } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ totpSecret: 'SECRET', role: 'CLUB_ADMIN', memberships: [{ clubId: 'club-1' }] } as never)
    vi.mocked(verifyTotpCode).mockResolvedValue(true)

    await expect(verifyTotpChallenge({ code: '123456' })).rejects.toThrow('NEXT_REDIRECT:/en/club/club-1')

    expect(mockCookieSet).toHaveBeenCalledWith(
      'totp_verified',
      expect.any(String),
      expect.objectContaining({ httpOnly: true })
    )
    expect(redirect).toHaveBeenCalledWith('/en/club/club-1')
  })

  it('redirects OPERATOR to admin stats after successful TOTP verification', async () => {
    const mockCookieSet = vi.fn()
    const mockCookieGet = vi.fn((name: string) => name === 'platform_lang' ? { value: 'en' } : undefined)
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValueOnce({ set: mockCookieSet, get: mockCookieGet } as never)

    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'u1', role: 'OPERATOR' } } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ totpSecret: 'SECRET', role: 'OPERATOR', memberships: [] } as never)
    vi.mocked(verifyTotpCode).mockResolvedValue(true)

    await expect(verifyTotpChallenge({ code: '123456' })).rejects.toThrow('NEXT_REDIRECT:/en/admin/stats')

    expect(redirect).toHaveBeenCalledWith('/en/admin/stats')
  })

  it('blocks after 5 failed attempts from same IP (rate limit)', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ totpSecret: 'SECRET' } as never)
    vi.mocked(verifyTotpCode).mockResolvedValue(false)

    // 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await verifyTotpChallenge({ code: '000000' })
    }

    // 6th attempt should be rate-limited
    const result = await verifyTotpChallenge({ code: '000000' })
    expect(result).toMatchObject({ success: false, code: 'RATE_LIMITED' })
  })

  it('different IPs are isolated by rate limiter', async () => {
    const { headers } = await import('next/headers')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ totpSecret: 'SECRET' } as never)
    vi.mocked(verifyTotpCode).mockResolvedValue(false)

    // Exhaust IP A with user A
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-a' } } as never)
    vi.mocked(headers).mockResolvedValue({ get: vi.fn(() => '10.0.0.1') } as never)
    for (let i = 0; i < 5; i++) {
      await verifyTotpChallenge({ code: '000000' })
    }

    // IP B with user B should still be allowed (both IP and user are different)
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-b' } } as never)
    vi.mocked(headers).mockResolvedValue({ get: vi.fn(() => '10.0.0.2') } as never)
    const result = await verifyTotpChallenge({ code: '000000' })
    // Not rate-limited (but may get TOTP_INVALID since code is wrong)
    expect(result).not.toMatchObject({ code: 'RATE_LIMITED' })
  })
})
