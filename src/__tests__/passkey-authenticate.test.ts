import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/db', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prismaMock: any = {
    user: { findUnique: vi.fn() },
    webauthnCredential: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    session: { create: vi.fn() },
  }
  // Pass prismaMock itself as tx so mocked methods are reachable inside the transaction
  prismaMock.$transaction = vi.fn(async (fn: (tx: typeof prismaMock) => Promise<unknown>) => fn(prismaMock))
  return { prisma: prismaMock }
})
vi.mock('@simplewebauthn/server', () => ({
  generateAuthenticationOptions: vi.fn(),
  verifyAuthenticationResponse: vi.fn(),
}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: vi.fn(), set: vi.fn() })),
  headers: vi.fn(async () => ({ get: vi.fn(() => '127.0.0.1') })),
}))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => false),
  clearRateLimit: vi.fn(),
}))
vi.mock('@/lib/webauthn', () => ({
  getWebAuthnConfig: vi.fn(() => ({ rpID: 'localhost', rpName: 'Test', origin: 'http://localhost:3000' })),
  encodeChallengeCookie: vi.fn((c: string) => `encoded:${c}`),
  decodeChallengeCookie: vi.fn((v: string) => (v.startsWith('encoded:') ? v.replace('encoded:', '') : null)),
  PASSKEY_CHALLENGE_COOKIE: 'passkey_challenge',
}))
vi.mock('@/server/auth', () => ({
  SESSION_COOKIE_NAME: 'next-auth.session-token',
}))
vi.mock('@/lib/setup-cookie', () => ({
  encodeTotpVerifiedCookie: vi.fn(() => 'encrypted-uid'),
}))

import { prisma } from '@/server/db'
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server'
import { cookies } from 'next/headers'

// ─── POST /api/auth/passkey/authenticate/begin ───────────────────────────────

describe('POST /api/auth/passkey/authenticate/begin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns options JSON and sets challenge cookie', async () => {
    const mockOptions = { challenge: 'auth-challenge', allowCredentials: [] }
    vi.mocked(generateAuthenticationOptions).mockResolvedValue(mockOptions as never)

    const mockCookieSet = vi.fn()
    vi.mocked(cookies).mockResolvedValue({ get: vi.fn(), set: mockCookieSet } as never)

    const { POST } = await import('@/app/api/auth/passkey/authenticate/begin/route')
    const req = new Request('http://localhost/api/auth/passkey/authenticate/begin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req as never)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.challenge).toBe('auth-challenge')
    expect(mockCookieSet).toHaveBeenCalledWith(
      'passkey_challenge',
      expect.stringContaining('encoded:'),
      expect.objectContaining({ httpOnly: true })
    )
  })

  it('narrows allowCredentials when email is provided and user is found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1' } as never)
    vi.mocked(prisma.webauthnCredential.findMany).mockResolvedValue([
      { credentialId: 'cred1', transports: ['internal'] },
    ] as never)
    vi.mocked(generateAuthenticationOptions).mockResolvedValue({ challenge: 'x' } as never)
    vi.mocked(cookies).mockResolvedValue({ get: vi.fn(), set: vi.fn() } as never)

    const { POST } = await import('@/app/api/auth/passkey/authenticate/begin/route')
    const req = new Request('http://localhost/api/auth/passkey/authenticate/begin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com' }),
    })
    await POST(req as never)

    expect(generateAuthenticationOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        allowCredentials: expect.arrayContaining([
          expect.objectContaining({ id: 'cred1' }),
        ]),
      })
    )
  })
})

// ─── POST /api/auth/passkey/authenticate/complete ────────────────────────────

describe('POST /api/auth/passkey/authenticate/complete', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when no challenge cookie present', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: vi.fn(() => undefined), set: vi.fn() } as never)

    const { POST } = await import('@/app/api/auth/passkey/authenticate/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/authenticate/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'cred1' }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when challenge cookie is tampered', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: 'tampered-not-encoded' })),
      set: vi.fn(),
    } as never)

    const { POST } = await import('@/app/api/auth/passkey/authenticate/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/authenticate/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'cred1' }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/challenge/i)
  })

  it('returns 401 when credential not found in DB', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: 'encoded:challenge' })),
      set: vi.fn(),
    } as never)
    vi.mocked(prisma.webauthnCredential.findUnique).mockResolvedValue(null)

    const { POST } = await import('@/app/api/auth/passkey/authenticate/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/authenticate/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'unknown-cred' }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toMatch(/not found/i)
  })

  it('returns 400 when verifyAuthenticationResponse throws (e.g. counter rollback)', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: 'encoded:challenge' })),
      set: vi.fn(),
    } as never)
    vi.mocked(prisma.webauthnCredential.findUnique).mockResolvedValue({
      credentialId: 'cred1',
      publicKey: Buffer.from([1, 2, 3]).toString('base64'),
      counter: BigInt(5),
      transports: ['internal'],
      user: { id: 'u1', role: 'CLUB_ADMIN', totpEnabled: false },
    } as never)
    vi.mocked(verifyAuthenticationResponse).mockRejectedValue(new Error('Counter rollback detected'))

    const { POST } = await import('@/app/api/auth/passkey/authenticate/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/authenticate/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'cred1' }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when verifyAuthenticationResponse returns verified: false', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: 'encoded:challenge' })),
      set: vi.fn(),
    } as never)
    vi.mocked(prisma.webauthnCredential.findUnique).mockResolvedValue({
      credentialId: 'cred1',
      publicKey: Buffer.from([1, 2, 3]).toString('base64'),
      counter: BigInt(0),
      transports: ['internal'],
      user: { id: 'u1', role: 'CLUB_ADMIN', totpEnabled: false },
    } as never)
    vi.mocked(verifyAuthenticationResponse).mockResolvedValue({ verified: false } as never)

    const { POST } = await import('@/app/api/auth/passkey/authenticate/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/authenticate/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'cred1' }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
  })

  it('creates session and sets cookies on success (CLUB_ADMIN)', async () => {
    const mockCookieSet = vi.fn()
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: 'encoded:challenge' })),
      set: mockCookieSet,
    } as never)
    vi.mocked(prisma.webauthnCredential.findUnique).mockResolvedValue({
      credentialId: 'cred1',
      publicKey: Buffer.from([1, 2, 3]).toString('base64'),
      counter: BigInt(0),
      transports: ['internal'],
      user: { id: 'u1', role: 'CLUB_ADMIN', totpEnabled: false },
    } as never)
    vi.mocked(verifyAuthenticationResponse).mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 1 },
    } as never)
    vi.mocked(prisma.webauthnCredential.update).mockResolvedValue({} as never)
    vi.mocked(prisma.session.create).mockResolvedValue({} as never)

    const { POST } = await import('@/app/api/auth/passkey/authenticate/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/authenticate/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'cred1' }),
    })
    const res = await POST(req as never)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.role).toBe('CLUB_ADMIN')

    expect(prisma.session.create).toHaveBeenCalled()
    expect(prisma.webauthnCredential.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { counter: BigInt(1) } })
    )
    // SESSION_COOKIE_NAME cookie set
    expect(mockCookieSet).toHaveBeenCalledWith('next-auth.session-token', expect.any(String), expect.objectContaining({ httpOnly: true }))
    // totp_verified cookie set (passkey = MFA complete)
    expect(mockCookieSet).toHaveBeenCalledWith('totp_verified', 'encrypted-uid', expect.objectContaining({ httpOnly: true }))
  })

  it('returns role: OPERATOR on successful OPERATOR passkey auth', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: 'encoded:challenge' })),
      set: vi.fn(),
    } as never)
    vi.mocked(prisma.webauthnCredential.findUnique).mockResolvedValue({
      credentialId: 'cred-op',
      publicKey: Buffer.from([4, 5, 6]).toString('base64'),
      counter: BigInt(0),
      transports: ['usb'],
      user: { id: 'op1', role: 'OPERATOR', totpEnabled: false },
    } as never)
    vi.mocked(verifyAuthenticationResponse).mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 1 },
    } as never)
    vi.mocked(prisma.webauthnCredential.update).mockResolvedValue({} as never)
    vi.mocked(prisma.session.create).mockResolvedValue({} as never)

    const { POST } = await import('@/app/api/auth/passkey/authenticate/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/authenticate/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'cred-op' }),
    })
    const res = await POST(req as never)
    const body = await res.json()
    expect(body.role).toBe('OPERATOR')
  })
})
