import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ set: vi.fn() })),
  headers: vi.fn(async () => ({ get: vi.fn(() => '1.2.3.4') })),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    session: { create: vi.fn() },
    featureFlag: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}))
vi.mock('argon2', () => ({
  default: { verify: vi.fn(), hash: vi.fn() },
  verify: vi.fn(),
  hash: vi.fn(),
}))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => false), // not rate-limited by default
  clearRateLimit: vi.fn(),
}))
vi.mock('@/server/auth', () => ({
  SESSION_COOKIE_NAME: 'next-auth.session-token',
}))
vi.mock('@/lib/setup-cookie', () => ({
  encodeTotpVerifiedCookie: vi.fn(() => 'encrypted-uid'),
}))

import argon2 from 'argon2'
import { prisma } from '@/server/db'
import { checkRateLimit } from '@/lib/rate-limit'
import { loginWithCredentials } from '@/app/[lang]/(dashboard)/auth/login/actions'

describe('loginWithCredentials()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns RATE_LIMITED when the IP has exceeded the attempt threshold', async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce(true)
    const result = await loginWithCredentials({ email: 'a@b.com', password: 'pass' })
    expect(result).toMatchObject({ success: false, code: 'RATE_LIMITED' })
  })

  it('returns VALIDATION_ERROR for invalid email', async () => {
    const result = await loginWithCredentials({ email: 'not-email', password: 'pass' })
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('returns INVALID_CREDENTIALS when user not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    const result = await loginWithCredentials({ email: 'a@b.com', password: 'pass' })
    expect(result).toMatchObject({ success: false, code: 'INVALID_CREDENTIALS' })
  })

  it('returns INVALID_CREDENTIALS when user has no passwordHash', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1', role: 'CLUB_ADMIN', passwordHash: null, totpEnabled: false } as never)
    const result = await loginWithCredentials({ email: 'a@b.com', password: 'pass' })
    expect(result).toMatchObject({ success: false, code: 'INVALID_CREDENTIALS' })
  })

  it('returns INVALID_CREDENTIALS when password does not match', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1', role: 'CLUB_ADMIN', passwordHash: '$hash', totpEnabled: false } as never)
    vi.mocked(argon2.verify).mockResolvedValue(false)
    const result = await loginWithCredentials({ email: 'a@b.com', password: 'wrong' })
    expect(result).toMatchObject({ success: false, code: 'INVALID_CREDENTIALS' })
  })

  it('returns SERVER_ERROR when DB session creation fails', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1', role: 'CLUB_ADMIN', passwordHash: '$hash', totpEnabled: false } as never)
    vi.mocked(argon2.verify).mockResolvedValue(true)
    vi.mocked(prisma.session.create).mockRejectedValue(new Error('DB down'))

    const result = await loginWithCredentials({ email: 'a@b.com', password: 'correct' })
    expect(result).toMatchObject({ success: false, code: 'SERVER_ERROR' })
  })

  it('returns { success: true, role: CLUB_ADMIN, totpEnabled: false } on valid CLUB_ADMIN login', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1', role: 'CLUB_ADMIN', passwordHash: '$hash', totpEnabled: false } as never)
    vi.mocked(argon2.verify).mockResolvedValue(true)
    vi.mocked(prisma.session.create).mockResolvedValue({} as never)

    const result = await loginWithCredentials({ email: 'a@b.com', password: 'correct' })

    expect(result).toMatchObject({ success: true, role: 'CLUB_ADMIN', totpEnabled: false })
    expect(prisma.session.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'u1' }) })
    )
  })

  it('returns { success: true, role: OPERATOR, totpEnabled: false } on valid OPERATOR login', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'op1', role: 'OPERATOR', passwordHash: '$hash', totpEnabled: false } as never)
    vi.mocked(argon2.verify).mockResolvedValue(true)
    vi.mocked(prisma.session.create).mockResolvedValue({} as never)

    const result = await loginWithCredentials({ email: 'op@platform.com', password: 'correct' })

    expect(result).toMatchObject({ success: true, role: 'OPERATOR', totpEnabled: false })
  })

  it('returns { success: true, totpEnabled: true } when TOTP is enrolled', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1', role: 'CLUB_ADMIN', passwordHash: '$hash', totpEnabled: true } as never)
    vi.mocked(argon2.verify).mockResolvedValue(true)
    vi.mocked(prisma.session.create).mockResolvedValue({} as never)

    const result = await loginWithCredentials({ email: 'a@b.com', password: 'correct' })

    expect(result).toMatchObject({ success: true, role: 'CLUB_ADMIN', totpEnabled: true })
  })
})
