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
    club: { findFirst: vi.fn() },
    clubMembership: { findFirst: vi.fn() },
  },
}))
vi.mock('@/lib/country', () => ({
  isValidCountry: vi.fn((country: string) => ['ch', 'fr', 'de'].includes(country)),
}))
vi.mock('@/components/app/auth/TotpEnrollmentBanner', () => ({
  TotpEnrollmentBanner: vi.fn(() => null),
}))

import { notFound } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import ClubLayout from '@/app/[lang]/(country)/[country]/[club]/layout'

const MOCK_CHILDREN = null

function makeParams(slug = 'ski-club-valais', country = 'ch', lang = 'fr') {
  return Promise.resolve({ lang, country, club: slug })
}

describe('ClubLayout (public access)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('calls notFound() when country path segment is not supported', async () => {
    await expect(ClubLayout({ children: MOCK_CHILDREN, params: makeParams('ski-club-valais', 'unknown') })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('calls notFound() when club does not exist in DB', async () => {
    vi.mocked(prisma.club.findFirst).mockResolvedValue(null)
    await expect(ClubLayout({ children: MOCK_CHILDREN, params: makeParams('nonexistent-slug') })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('renders children without requiring authentication (public access)', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    vi.mocked(prisma.club.findFirst).mockResolvedValue({ id: 'club-1', name: 'Test Club' } as never)
    const result = await ClubLayout({ children: MOCK_CHILDREN, params: makeParams() })
    expect(notFound).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('resolves club by (slug, country, ACTIVE) — never slug alone', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    vi.mocked(prisma.club.findFirst).mockResolvedValue({ id: 'club-1', name: 'Test Club' } as never)
    await ClubLayout({ children: MOCK_CHILDREN, params: makeParams('ski-club-valais', 'ch') })
    expect(prisma.club.findFirst).toHaveBeenCalledWith({
      where: { slug: 'ski-club-valais', country: 'ch', status: 'ACTIVE' },
      select: { id: true, name: true },
    })
  })
})
