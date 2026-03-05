import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ set: vi.fn() })),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
  },
}))
vi.mock('argon2', () => ({
  default: { hash: vi.fn(async () => '$new-hash'), verify: vi.fn() },
  hash: vi.fn(async () => '$new-hash'),
  verify: vi.fn(),
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))

import argon2 from 'argon2'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { changePassword, removeTotp } from '@/app/[lang]/auth/account/actions'

const STRONG_PASSWORD = 'Str0ng!P@ssw0rd'

// ─── changePassword ──────────────────────────────────────────────────────────

describe('changePassword()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns UNAUTHORIZED when no session', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    const result = await changePassword({ currentPassword: 'x', password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD })
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns VALIDATION_ERROR for password shorter than 12 characters', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    const result = await changePassword({ currentPassword: 'x', password: 'Short1!', confirmPassword: 'Short1!' })
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('returns VALIDATION_ERROR for mismatched passwords', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    const result = await changePassword({ currentPassword: 'x', password: STRONG_PASSWORD, confirmPassword: 'Different!Pass#9' })
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('returns UNAUTHORIZED when the user account has no password hash', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ passwordHash: null } as never)
    const result = await changePassword({ currentPassword: 'x', password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD })
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns WRONG_PASSWORD when current password does not match', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ passwordHash: '$hash' } as never)
    vi.mocked(argon2.verify).mockResolvedValue(false)
    const result = await changePassword({ currentPassword: 'wrong', password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD })
    expect(result).toMatchObject({ success: false, code: 'WRONG_PASSWORD' })
  })

  it('returns PASSWORD_BREACHED when HIBP returns a matching suffix', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ passwordHash: '$hash' } as never)
    vi.mocked(argon2.verify).mockResolvedValue(true)

    const { createHash } = await import('crypto')
    const sha1 = createHash('sha1').update(STRONG_PASSWORD).digest('hex').toUpperCase()
    const suffix = sha1.slice(5)

    global.fetch = vi.fn(async () => ({
      ok: true,
      text: async () => `${suffix}:3\nBBBBB:1`,
    })) as never

    const result = await changePassword({ currentPassword: 'current', password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD })
    expect(result).toMatchObject({ success: false, code: 'PASSWORD_BREACHED' })
  })

  it('updates passwordHash in DB on success', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ passwordHash: '$hash' } as never)
    vi.mocked(argon2.verify).mockResolvedValue(true)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)
    global.fetch = vi.fn(async () => ({ ok: true, text: async () => 'AAAAA:5' })) as never

    const result = await changePassword({ currentPassword: 'current', password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD })

    expect(result).toMatchObject({ success: true })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { passwordHash: '$new-hash' },
    })
  })

  it('proceeds and updates password even if HIBP is unreachable', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ passwordHash: '$hash' } as never)
    vi.mocked(argon2.verify).mockResolvedValue(true)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)
    global.fetch = vi.fn(async () => { throw new Error('network error') }) as never

    const result = await changePassword({ currentPassword: 'current', password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD })
    expect(result).toMatchObject({ success: true })
    expect(prisma.user.update).toHaveBeenCalled()
  })
})

// ─── removeTotp ──────────────────────────────────────────────────────────────

describe('removeTotp()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns UNAUTHORIZED when no session', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    const result = await removeTotp()
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns UNAUTHORIZED when totpVerified is false (TOTP challenge not completed)', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'u1', totpVerified: false },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    const result = await removeTotp()
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('clears totpSecret, totpEnabled and pendingTotpSecret on success', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'u1', totpVerified: true },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const result = await removeTotp()

    expect(result).toMatchObject({ success: true })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { totpSecret: null, totpEnabled: false, pendingTotpSecret: null },
    })
  })

  it('clears the totp_verified cookie on success', async () => {
    const mockCookieSet = vi.fn()
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValueOnce({ set: mockCookieSet } as never)

    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'u1', totpVerified: true },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    await removeTotp()

    expect(mockCookieSet).toHaveBeenCalledWith(
      'totp_verified',
      '',
      expect.objectContaining({ httpOnly: true, maxAge: 0 })
    )
  })
})
