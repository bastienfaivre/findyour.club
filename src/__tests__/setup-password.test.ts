import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => ({ value: 'valid-setup-cookie' })),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    user: { update: vi.fn(), findUnique: vi.fn() },
    session: { create: vi.fn() },
  },
}))
vi.mock('argon2', () => ({
  default: { hash: vi.fn(async () => '$hashed'), verify: vi.fn() },
  hash: vi.fn(async () => '$hashed'),
  verify: vi.fn(),
}))
vi.mock('@/lib/setup-cookie', () => ({
  decodeSetupCookie: vi.fn(() => 'user-123'),
  SETUP_COOKIE_NAME: 'setup_session',
  encodeTotpVerifiedCookie: vi.fn(() => 'encrypted-uid'),
}))
vi.mock('@/server/auth', () => ({
  SESSION_COOKIE_NAME: 'next-auth.session-token',
}))

import { prisma } from '@/server/db'
import { decodeSetupCookie } from '@/lib/setup-cookie'
import { redirect } from 'next/navigation'
import { setupPassword } from '@/app/auth/setup/actions'

const STRONG_PASSWORD = 'Str0ng!P@ssw0rd'

describe('setupPassword()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: user has no existing password (new account)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ passwordHash: null } as never)
    vi.mocked(prisma.session.create).mockResolvedValue({} as never)
  })

  it('returns UNAUTHORIZED when setup cookie is missing or invalid', async () => {
    vi.mocked(decodeSetupCookie).mockReturnValue(null)
    const result = await setupPassword({ password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD })
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns ALREADY_CONFIGURED when user already has a password', async () => {
    vi.mocked(decodeSetupCookie).mockReturnValue('user-123')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ passwordHash: '$existing_hash' } as never)
    const result = await setupPassword({ password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD })
    expect(result).toMatchObject({ success: false, code: 'ALREADY_CONFIGURED' })
  })

  it('returns VALIDATION_ERROR for a short password', async () => {
    vi.mocked(decodeSetupCookie).mockReturnValue('user-123')
    const result = await setupPassword({ password: 'Short1!', confirmPassword: 'Short1!' })
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('returns VALIDATION_ERROR for mismatched passwords', async () => {
    vi.mocked(decodeSetupCookie).mockReturnValue('user-123')
    const result = await setupPassword({
      password: STRONG_PASSWORD,
      confirmPassword: 'Different!Passw0rd',
    })
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('returns VALIDATION_ERROR for password without uppercase', async () => {
    vi.mocked(decodeSetupCookie).mockReturnValue('user-123')
    const result = await setupPassword({ password: 'alllower!abc1234', confirmPassword: 'alllower!abc1234' })
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('hashes password, clears magic token, creates session, and redirects to /', async () => {
    vi.mocked(decodeSetupCookie).mockReturnValue('user-123')
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    // Mock fetch (HIBP) to return no breached passwords
    global.fetch = vi.fn(async () => ({
      ok: true,
      text: async () => 'AAAAA:5\nBBBBB:3',
    })) as never

    await setupPassword({ password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD })

    // AC2: password hash and magic token cleared in one atomic update
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: expect.objectContaining({
        passwordHash: '$hashed',
        magicToken: null,
        magicTokenExp: null,
      }),
    })

    // L5: DB session created immediately after password setup
    expect(prisma.session.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'user-123' }) })
    )

    // L5: Redirect to home, not to /auth/totp-setup
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('returns PASSWORD_BREACHED when HIBP returns a matching SHA-1 suffix', async () => {
    vi.mocked(decodeSetupCookie).mockReturnValue('user-123')

    // Compute the real SHA-1 suffix so the mock response actually matches
    const { createHash } = await import('crypto')
    const sha1 = createHash('sha1').update(STRONG_PASSWORD).digest('hex').toUpperCase()
    const suffix = sha1.slice(5)

    global.fetch = vi.fn(async () => ({
      ok: true,
      text: async () => `${suffix}:3\nBBBBB:1`,
    })) as never

    const result = await setupPassword({ password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD })
    expect(result).toMatchObject({ success: false, code: 'PASSWORD_BREACHED' })
  })

  it('proceeds even if HIBP API is unreachable', async () => {
    vi.mocked(decodeSetupCookie).mockReturnValue('user-123')
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)
    global.fetch = vi.fn(async () => { throw new Error('network error') }) as never

    await setupPassword({ password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD })

    expect(prisma.user.update).toHaveBeenCalled()
    expect(prisma.session.create).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/')
  })
})
