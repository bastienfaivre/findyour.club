import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))
vi.mock('@/app/[lang]/(dashboard)/auth/magic-link/actions', () => ({
  verifyMagicLinkToken: vi.fn(),
}))
vi.mock('@/lib/setup-cookie', () => ({
  encodeSetupCookie: vi.fn(() => 'encoded-setup-cookie'),
  SETUP_COOKIE_NAME: 'setup_session',
}))

import { getAuthSession } from '@/server/auth'
import { verifyMagicLinkToken } from '@/app/[lang]/(dashboard)/auth/magic-link/actions'
import { GET } from '@/app/[lang]/(dashboard)/auth/magic-link/route'

const BASE = 'http://localhost'

function makeRequest(token?: string) {
  const url = token
    ? `${BASE}/auth/magic-link?token=${token}`
    : `${BASE}/auth/magic-link`
  return new NextRequest(url)
}

describe('GET /auth/magic-link', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to /auth/error?error=TokenInvalid for an invalid token', async () => {
    vi.mocked(verifyMagicLinkToken).mockResolvedValue({
      success: false,
      error: 'Invalid or already used link.',
      code: 'TOKEN_INVALID',
    })

    const response = await GET(makeRequest('bad-token'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/auth/error?error=TokenInvalid`)
    expect(response.cookies.get('setup_session')).toBeUndefined()
    expect(getAuthSession).not.toHaveBeenCalled()
  })

  it('redirects to /auth/error?error=TokenInvalid when token is absent', async () => {
    vi.mocked(verifyMagicLinkToken).mockResolvedValue({
      success: false,
      error: 'Invalid or already used link.',
      code: 'TOKEN_INVALID',
    })

    const response = await GET(makeRequest())

    expect(response.headers.get('location')).toBe(`${BASE}/auth/error?error=TokenInvalid`)
    expect(getAuthSession).not.toHaveBeenCalled()
  })

  it('redirects to /auth/error?error=TokenExpired for an expired token', async () => {
    vi.mocked(verifyMagicLinkToken).mockResolvedValue({
      success: false,
      error: 'This link has expired.',
      code: 'TOKEN_EXPIRED',
    })

    const response = await GET(makeRequest('expired-token'))

    expect(response.headers.get('location')).toBe(`${BASE}/auth/error?error=TokenExpired`)
    expect(response.cookies.get('setup_session')).toBeUndefined()
    expect(getAuthSession).not.toHaveBeenCalled()
  })

  it('sets setup_session cookie and redirects to /auth/setup on a valid first-time token', async () => {
    vi.mocked(verifyMagicLinkToken).mockResolvedValue({
      success: true,
      userId: 'u1',
      alreadyConfigured: false,
    })

    const response = await GET(makeRequest('valid-token'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/auth/setup`)

    const cookie = response.cookies.get('setup_session')
    expect(cookie).toBeDefined()
    expect(cookie?.value).toBe('encoded-setup-cookie')
    expect(cookie?.httpOnly).toBe(true)
    expect(cookie?.path).toBe('/')
    // getAuthSession must NOT be called for first-time users (they never have a session)
    expect(getAuthSession).not.toHaveBeenCalled()
  })

  describe('when user already has a password (alreadyConfigured)', () => {
    beforeEach(() => {
      vi.mocked(verifyMagicLinkToken).mockResolvedValue({
        success: true,
        userId: 'u1',
        alreadyConfigured: true,
      })
    })

    it('redirects to / when the user is already authenticated', async () => {
      vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as never)

      const response = await GET(makeRequest('stale-token'))

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(`${BASE}/`)
      expect(response.cookies.get('setup_session')).toBeUndefined()
    })

    it('redirects to /auth/login when the user is not authenticated', async () => {
      vi.mocked(getAuthSession).mockResolvedValue(null)

      const response = await GET(makeRequest('stale-token'))

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(`${BASE}/auth/login`)
      expect(response.cookies.get('setup_session')).toBeUndefined()
    })
  })
})
