import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => ({ value: 'session-token-abc' })),
  })),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    session: { deleteMany: vi.fn(async () => ({ count: 1 })) },
  },
}))
vi.mock('@/server/auth', () => ({
  SESSION_COOKIE_NAME: 'next-auth.session-token',
}))

import { cookies } from 'next/headers'
import { prisma } from '@/server/db'
import { GET } from '@/app/[lang]/(dashboard)/auth/logout/route'

const BASE = 'http://localhost'

function makeRequest() {
  return new NextRequest(`${BASE}/en/auth/logout`)
}

function makeParams(lang = 'en') {
  return Promise.resolve({ lang })
}

describe('GET /{lang}/auth/logout', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to /{lang}/', async () => {
    const response = await GET(makeRequest(), { params: makeParams() })
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/en/`)
  })

  it('deletes the DB session when a session token cookie is present', async () => {
    await GET(makeRequest(), { params: makeParams() })
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { sessionToken: 'session-token-abc' },
    })
  })

  it('skips DB deletion when no session token cookie is present', async () => {
    vi.mocked(cookies).mockResolvedValueOnce({
      get: vi.fn(() => undefined),
    } as never)

    await GET(makeRequest(), { params: makeParams() })
    expect(prisma.session.deleteMany).not.toHaveBeenCalled()
  })

  it('deletes all three auth cookies from the response', async () => {
    const response = await GET(makeRequest(), { params: makeParams() })
    // next-auth session token
    expect(response.cookies.get('next-auth.session-token')).toBeDefined()
    // totp_verified
    expect(response.cookies.get('totp_verified')).toBeDefined()
    // setup_session
    expect(response.cookies.get('setup_session')).toBeDefined()
  })

  it('proceeds gracefully even if DB session deletion fails', async () => {
    vi.mocked(prisma.session.deleteMany).mockRejectedValueOnce(new Error('DB down'))

    const response = await GET(makeRequest(), { params: makeParams() })
    // Should still redirect to home — .catch(() => {}) in route handles this
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/en/`)
  })
})
