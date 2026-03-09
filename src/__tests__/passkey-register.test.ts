import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    webauthnCredential: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))
vi.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: vi.fn(),
  verifyRegistrationResponse: vi.fn(),
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

import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'
import { cookies } from 'next/headers'

// ─── POST /api/auth/passkey/register/begin ───────────────────────────────────

describe('POST /api/auth/passkey/register/begin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    const { POST } = await import('@/app/api/auth/passkey/register/begin/route')
    const res = await POST()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('returns 403 when TOTP is enrolled but not yet verified', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com', totpEnabled: true, totpVerified: false },
    } as never)
    const { POST } = await import('@/app/api/auth/passkey/register/begin/route')
    const res = await POST()
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('returns options JSON and sets challenge cookie when authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com', totpEnabled: false, totpVerified: true },
    } as never)
    vi.mocked(prisma.webauthnCredential.findMany).mockResolvedValue([])
    const mockOptions = { challenge: 'test-challenge', rp: { name: 'Test', id: 'localhost' } }
    vi.mocked(generateRegistrationOptions).mockResolvedValue(mockOptions as never)

    const mockCookieSet = vi.fn()
    vi.mocked(cookies).mockResolvedValue({ get: vi.fn(), set: mockCookieSet } as never)

    const { POST } = await import('@/app/api/auth/passkey/register/begin/route')
    const res = await POST()

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.challenge).toBe('test-challenge')
    expect(mockCookieSet).toHaveBeenCalledWith(
      'passkey_challenge',
      expect.stringContaining('encoded:'),
      expect.objectContaining({ httpOnly: true })
    )
  })

  it('passes existing credentials as excludeCredentials to prevent duplicate registration', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com', totpEnabled: false, totpVerified: true },
    } as never)
    vi.mocked(prisma.webauthnCredential.findMany).mockResolvedValue([
      { credentialId: 'existing-cred', transports: ['internal'] },
    ] as never)
    vi.mocked(generateRegistrationOptions).mockResolvedValue({ challenge: 'x' } as never)
    vi.mocked(cookies).mockResolvedValue({ get: vi.fn(), set: vi.fn() } as never)

    const { POST } = await import('@/app/api/auth/passkey/register/begin/route')
    await POST()

    expect(generateRegistrationOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeCredentials: expect.arrayContaining([
          expect.objectContaining({ id: 'existing-cred' }),
        ]),
      })
    )
  })
})

// ─── POST /api/auth/passkey/register/complete ────────────────────────────────

describe('POST /api/auth/passkey/register/complete', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    const { POST } = await import('@/app/api/auth/passkey/register/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/register/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(401)
  })

  it('returns 400 when no challenge cookie present', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(cookies).mockResolvedValue({ get: vi.fn(() => undefined), set: vi.fn() } as never)

    const { POST } = await import('@/app/api/auth/passkey/register/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/register/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('returns 400 when challenge cookie is tampered', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: 'tampered-value' })),
      set: vi.fn(),
    } as never)

    const { POST } = await import('@/app/api/auth/passkey/register/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/register/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
  })

  it('returns 403 on complete when TOTP is enrolled but not yet verified', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'u1', totpEnabled: true, totpVerified: false },
    } as never)
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: 'encoded:test-challenge' })),
      set: vi.fn(),
    } as never)

    const { POST } = await import('@/app/api/auth/passkey/register/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/register/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: { transports: [] } }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('returns 400 when verifyRegistrationResponse throws (e.g. malformed attestation)', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: false } } as never)
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: 'encoded:test-challenge' })),
      set: vi.fn(),
    } as never)
    vi.mocked(verifyRegistrationResponse).mockRejectedValue(new Error('Invalid attestation format'))

    const { POST } = await import('@/app/api/auth/passkey/register/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/register/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: { transports: [] } }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when verifyRegistrationResponse returns verified: false', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: false } } as never)
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: 'encoded:test-challenge' })),
      set: vi.fn(),
    } as never)
    vi.mocked(verifyRegistrationResponse).mockResolvedValue({ verified: false } as never)

    const { POST } = await import('@/app/api/auth/passkey/register/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/register/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: { transports: [] } }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
  })

  it('creates credential record and returns { success: true } on success', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: 'encoded:test-challenge' })),
      set: vi.fn(),
    } as never)
    vi.mocked(verifyRegistrationResponse).mockResolvedValue({
      verified: true,
      registrationInfo: {
        credential: {
          id: 'cred-id-base64url',
          publicKey: new Uint8Array([1, 2, 3]),
          counter: 0,
        },
        credentialDeviceType: 'singleDevice',
        credentialBackedUp: false,
      },
    } as never)
    vi.mocked(prisma.webauthnCredential.create).mockResolvedValue({} as never)

    const { POST } = await import('@/app/api/auth/passkey/register/complete/route')
    const req = new Request('http://localhost/api/auth/passkey/register/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'cred-id-base64url', response: { transports: ['internal'] } }),
    })
    const res = await POST(req as never)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(prisma.webauthnCredential.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'u1',
          credentialId: 'cred-id-base64url',
          deviceType: 'singleDevice',
          backedUp: false,
        }),
      })
    )
  })
})
