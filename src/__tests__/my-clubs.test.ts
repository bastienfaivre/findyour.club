import { describe, it, expect, vi, beforeEach } from 'vitest'

// redirect throws in real Next.js (returns `never`); mock must replicate this
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
}))
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({ get: vi.fn(() => 'localhost:3000') })),
  cookies: vi.fn(async () => ({ get: vi.fn(() => undefined) })),
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(async () => null),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    clubMembership: { findMany: vi.fn() },
  },
}))
vi.mock('@/lib/url', () => ({
  buildClubAdminUrl: vi.fn((host: string, lang: string, country: string, slug: string) => `http://${host}/${lang}/${country}/${slug}`),
}))
vi.mock('@/components/app/my-clubs/MyClubsList', () => ({
  MyClubsList: vi.fn(() => null),
}))

import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import MyClubsPage from '@/app/[lang]/my-clubs/page'

function makeParams(lang = 'en') {
  return Promise.resolve({ lang })
}

describe('MyClubsPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to /{lang}/auth/login when unauthenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    await expect(MyClubsPage({ params: makeParams() })).rejects.toThrow('NEXT_REDIRECT:/en/auth/login')
    expect(redirect).toHaveBeenCalledWith('/en/auth/login')
  })

  it('redirects to /{lang}/auth/totp when totpEnabled but not totpVerified', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: true, totpVerified: false } } as any)
    await expect(MyClubsPage({ params: makeParams() })).rejects.toThrow('NEXT_REDIRECT:/en/auth/totp')
    expect(redirect).toHaveBeenCalledWith('/en/auth/totp')
  })

  it('queries only ACTIVE memberships for the authenticated user, ordered by creation date', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: false, totpVerified: false } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([])
    await MyClubsPage({ params: makeParams() })
    expect(prisma.clubMembership.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1', status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      })
    )
  })

  it('renders empty-state message when user has no active memberships', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: false, totpVerified: false } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([])
    const result = await MyClubsPage({ params: makeParams() })
    expect(redirect).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('renders club list (no redirect) when user has two or more active memberships', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: false, totpVerified: false } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([
      { role: 'OWNER', club: { slug: 'ski-club-valais', country: 'ch', name: 'Ski Club Valais', logoUrl: null, logoAlt: null } },
      { role: 'EDITOR', club: { slug: 'football-club', country: 'ch', name: 'Football Club', logoUrl: null, logoAlt: null } },
    ] as never)
    const result = await MyClubsPage({ params: makeParams() })
    expect(redirect).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })
})
