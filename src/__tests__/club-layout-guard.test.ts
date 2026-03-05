import { describe, it, expect, vi, beforeEach } from 'vitest'

// redirect/notFound throw in real Next.js (return `never`); mocks must replicate this
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(async () => null),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    club: { findUnique: vi.fn() },
    clubMembership: { findFirst: vi.fn() },
  },
}))
vi.mock('@/lib/country', () => ({
  isValidCountry: vi.fn((country: string) => ['ch', 'fr', 'de'].includes(country)),
}))
vi.mock('@/components/app/auth/TotpEnrollmentBanner', () => ({
  TotpEnrollmentBanner: vi.fn(() => null),
}))

import { redirect, notFound } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import ClubLayout from '@/app/[lang]/(country)/[country]/[club]/layout'

const MOCK_CHILDREN = null

function makeParams(slug = 'ski-club-valais', country = 'ch', lang = 'fr') {
  return Promise.resolve({ lang, country, club: slug })
}

describe('ClubLayout membership guard', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('redirects to /{lang}/auth/login when there is no session', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    await expect(ClubLayout({ children: MOCK_CHILDREN, params: makeParams() })).rejects.toThrow('NEXT_REDIRECT:/fr/auth/login')
    expect(redirect).toHaveBeenCalledWith('/fr/auth/login')
  })

  it('redirects to /{lang}/auth/totp when totpEnabled but not totpVerified', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: true, totpVerified: false } } as any)
    await expect(ClubLayout({ children: MOCK_CHILDREN, params: makeParams() })).rejects.toThrow('NEXT_REDIRECT:/fr/auth/totp')
    expect(redirect).toHaveBeenCalledWith('/fr/auth/totp')
  })

  it('calls notFound() when country path segment is not supported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: false, totpVerified: false } } as any)
    await expect(ClubLayout({ children: MOCK_CHILDREN, params: makeParams('ski-club-valais', 'unknown') })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('calls notFound() when club does not exist in DB', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: false, totpVerified: false } } as any)
    vi.mocked(prisma.club.findUnique).mockResolvedValue(null)
    await expect(ClubLayout({ children: MOCK_CHILDREN, params: makeParams('nonexistent-slug') })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('redirects to /{lang}/my-clubs when user has no active membership', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: false, totpVerified: false } } as any)
    vi.mocked(prisma.club.findUnique).mockResolvedValue({ id: 'club-1' } as never)
    vi.mocked(prisma.clubMembership.findFirst).mockResolvedValue(null)
    await expect(ClubLayout({ children: MOCK_CHILDREN, params: makeParams() })).rejects.toThrow('NEXT_REDIRECT:/fr/my-clubs')
    expect(redirect).toHaveBeenCalledWith('/fr/my-clubs')
  })

  it('renders children when user has an active membership', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: false, totpVerified: false } } as any)
    vi.mocked(prisma.club.findUnique).mockResolvedValue({ id: 'club-1' } as never)
    vi.mocked(prisma.clubMembership.findFirst).mockResolvedValue({ role: 'OWNER' } as never)
    const result = await ClubLayout({ children: MOCK_CHILDREN, params: makeParams() })
    expect(redirect).not.toHaveBeenCalled()
    expect(notFound).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('resolves club by (slug, country) composite key — never slug alone', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: false, totpVerified: false } } as any)
    vi.mocked(prisma.club.findUnique).mockResolvedValue({ id: 'club-1' } as never)
    vi.mocked(prisma.clubMembership.findFirst).mockResolvedValue({ role: 'OWNER' } as never)
    await ClubLayout({ children: MOCK_CHILDREN, params: makeParams('ski-club-valais', 'ch') })
    expect(prisma.club.findUnique).toHaveBeenCalledWith({
      where: { slug_country: { slug: 'ski-club-valais', country: 'ch' } },
      select: { id: true, name: true },
    })
  })

  it('checks membership with userId and clubId — never bypasses the check', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', totpEnabled: false, totpVerified: false } } as any)
    vi.mocked(prisma.club.findUnique).mockResolvedValue({ id: 'club-abc' } as never)
    vi.mocked(prisma.clubMembership.findFirst).mockResolvedValue({ role: 'EDITOR' } as never)
    await ClubLayout({ children: MOCK_CHILDREN, params: makeParams() })
    expect(prisma.clubMembership.findFirst).toHaveBeenCalledWith({
      where: { userId: 'u1', clubId: 'club-abc', status: 'ACTIVE' },
      select: { role: true },
    })
  })
})
