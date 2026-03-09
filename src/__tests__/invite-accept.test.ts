import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    invitation: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    clubMembership: {
      updateMany: vi.fn(),
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}))
vi.mock('@/lib/setup-cookie', () => ({
  encodeSetupCookie: vi.fn((userId: string) => `encoded:${userId}`),
  SETUP_COOKIE_NAME: 'setup_session',
}))

import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { GET } from '@/app/[lang]/(dashboard)/auth/invite/accept/route'

const BASE = 'http://localhost'

function makeRequest(token?: string) {
  const url = token
    ? `${BASE}/auth/invite/accept?token=${token}`
    : `${BASE}/auth/invite/accept`
  return new NextRequest(url)
}

const FUTURE_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
const PAST_DATE = new Date(Date.now() - 1000)

const VALID_INVITATION = {
  email: 'invited@example.com',
  clubId: 'club-1',
  tokenHash: 'some-hash',
  expiresAt: FUTURE_DATE,
}

const INVITED_USER = {
  id: 'invited-user-id',
  passwordHash: null,
}

describe('GET /auth/invite/accept', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSession).mockResolvedValue(null)
    vi.mocked(prisma.invitation.delete).mockResolvedValue({} as never)
    vi.mocked(prisma.clubMembership.updateMany).mockResolvedValue({ count: 1 } as never)
  })

  it('redirects to InviteExpired when no token is provided', async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null)
    const response = await GET(makeRequest())
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/auth/error?error=InviteExpired`)
  })

  it('redirects to /auth/login when token is not found and user is unauthenticated', async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null)
    const response = await GET(makeRequest('unknown-token'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/auth/login`)
    expect(prisma.invitation.delete).not.toHaveBeenCalled()
  })

  it('redirects to /auth/login and deletes invitation when token is expired and user is unauthenticated', async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
      ...VALID_INVITATION,
      expiresAt: PAST_DATE,
    } as never)
    const response = await GET(makeRequest('expired-token'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/auth/login`)
    expect(prisma.invitation.delete).toHaveBeenCalled()
  })

  it('redirects to / when invitation is not found but user is already authenticated (re-click after acceptance)', async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null)
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'invited-user-id' } } as never)
    const response = await GET(makeRequest('already-accepted-token'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/`)
    expect(prisma.invitation.delete).not.toHaveBeenCalled()
  })

  it('redirects to / when invitation is expired but user is already authenticated', async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
      ...VALID_INVITATION,
      expiresAt: PAST_DATE,
    } as never)
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'invited-user-id' } } as never)
    const response = await GET(makeRequest('expired-token'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/`)
    expect(prisma.invitation.delete).toHaveBeenCalled()
  })

  it('redirects to InviteExpired when invited user is not found', async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(VALID_INVITATION as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    const response = await GET(makeRequest('valid-token'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/auth/error?error=InviteExpired`)
  })

  it('activates membership and redirects to / when authenticated as the invited user', async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(VALID_INVITATION as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(INVITED_USER as never)
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'invited-user-id' } } as never)

    const response = await GET(makeRequest('valid-token'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/`)
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.clubMembership.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'invited-user-id', status: 'PENDING' }),
        data: expect.objectContaining({ status: 'ACTIVE' }),
      })
    )
    expect(prisma.invitation.delete).toHaveBeenCalled()
  })

  it('redirects to InviteEmailMismatch when authenticated as a different user', async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(VALID_INVITATION as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(INVITED_USER as never)
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'different-user-id' } } as never)

    const response = await GET(makeRequest('valid-token'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/auth/error?error=InviteEmailMismatch`)
    expect(prisma.invitation.delete).not.toHaveBeenCalled()
    expect(prisma.clubMembership.updateMany).not.toHaveBeenCalled()
  })

  it('redirects to /auth/login when unauthenticated and the invited user already has a password', async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(VALID_INVITATION as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'invited-user-id', passwordHash: '$argon2id$hashed' } as never)
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const response = await GET(makeRequest('valid-token'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/auth/login')
    // Invitation must stay intact — user needs to log in and click the link again
    expect(prisma.invitation.delete).not.toHaveBeenCalled()
    expect(prisma.clubMembership.updateMany).not.toHaveBeenCalled()
  })

  it('sets setup cookie and redirects to /auth/setup when unauthenticated', async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(VALID_INVITATION as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(INVITED_USER as never)
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const response = await GET(makeRequest('valid-token'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(`${BASE}/auth/setup`)

    const cookie = response.cookies.get('setup_session')
    expect(cookie).toBeDefined()
    expect(cookie?.value).toBe('encoded:invited-user-id')
    expect(cookie?.httpOnly).toBe(true)

    // Invitation is NOT deleted here — it stays alive so the user can re-open the link
    // before completing setup. Deletion happens inside setupPassword.
    expect(prisma.invitation.delete).not.toHaveBeenCalled()
    expect(prisma.clubMembership.updateMany).not.toHaveBeenCalled()
  })
})
