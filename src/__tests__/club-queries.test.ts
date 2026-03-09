import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/db', () => ({
  prisma: {
    club: { findFirst: vi.fn() },
    clubMembership: { findFirst: vi.fn() },
  },
}))

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return { ...actual, cache: (fn: (...args: unknown[]) => unknown) => fn }
})

import { prisma } from '@/server/db'
import {
  getClubBySlug,
  getClubOwnership,
  getClubActiveMembership,
  getClubPublicData,
} from '@/lib/server/club-queries'

const clubFindFirst = prisma.club.findFirst as ReturnType<typeof vi.fn>
const membershipFindFirst = prisma.clubMembership.findFirst as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
})

/* ------------------------------------------------------------------ */
/*  getClubBySlug                                                      */
/* ------------------------------------------------------------------ */
describe('getClubBySlug', () => {
  it('returns club when active club exists with matching slug and country', async () => {
    const club = { id: 'club-1', name: 'Test Club' }
    clubFindFirst.mockResolvedValue(club)

    const result = await getClubBySlug('test-club', 'ch')

    expect(result).toEqual(club)
    expect(clubFindFirst).toHaveBeenCalledOnce()
  })

  it('returns null when no matching club', async () => {
    clubFindFirst.mockResolvedValue(null)

    const result = await getClubBySlug('nonexistent', 'ch')

    expect(result).toBeNull()
  })

  it('passes correct where clause with status ACTIVE', async () => {
    clubFindFirst.mockResolvedValue(null)

    await getClubBySlug('my-club', 'de')

    expect(clubFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'my-club', country: 'de', status: 'ACTIVE' },
      }),
    )
  })
})

/* ------------------------------------------------------------------ */
/*  getClubOwnership                                                   */
/* ------------------------------------------------------------------ */
describe('getClubOwnership', () => {
  it('returns membership id when user is active OWNER', async () => {
    const membership = { id: 'mem-1' }
    membershipFindFirst.mockResolvedValue(membership)

    const result = await getClubOwnership('user-1', 'club-1')

    expect(result).toEqual(membership)
    expect(membershipFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', clubId: 'club-1', status: 'ACTIVE', role: 'OWNER' },
      }),
    )
  })

  it('returns null when user is EDITOR (not OWNER)', async () => {
    membershipFindFirst.mockResolvedValue(null)

    const result = await getClubOwnership('user-1', 'club-1')

    expect(result).toBeNull()
  })

  it('returns null when no membership exists', async () => {
    membershipFindFirst.mockResolvedValue(null)

    const result = await getClubOwnership('user-99', 'club-99')

    expect(result).toBeNull()
  })
})

/* ------------------------------------------------------------------ */
/*  getClubActiveMembership                                            */
/* ------------------------------------------------------------------ */
describe('getClubActiveMembership', () => {
  it('returns membership with role for OWNER', async () => {
    const membership = { id: 'mem-1', role: 'OWNER' }
    membershipFindFirst.mockResolvedValue(membership)

    const result = await getClubActiveMembership('user-1', 'club-1')

    expect(result).toEqual(membership)
    expect(membershipFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', clubId: 'club-1', status: 'ACTIVE' },
      }),
    )
  })

  it('returns membership with role for EDITOR', async () => {
    const membership = { id: 'mem-2', role: 'EDITOR' }
    membershipFindFirst.mockResolvedValue(membership)

    const result = await getClubActiveMembership('user-2', 'club-1')

    expect(result).toEqual(membership)
  })

  it('returns null when no active membership', async () => {
    membershipFindFirst.mockResolvedValue(null)

    const result = await getClubActiveMembership('user-1', 'club-1')

    expect(result).toBeNull()
  })
})

/* ------------------------------------------------------------------ */
/*  getClubPublicData                                                  */
/* ------------------------------------------------------------------ */
describe('getClubPublicData', () => {
  const fullClub = {
    id: 'club-1',
    name: 'Test Club',
    slug: 'test-club',
    country: 'ch',
    logoUrl: '/logo.png',
    logoAlt: 'Logo',
    description: 'A test club',
    accentColor: '#ff0000',
    defaultLanguage: 'fr',
    email: 'info@test.ch',
    schedule: 'Mon-Fri',
    howToJoin: 'Apply online',
    contactPhone: '+41 00 000 00 00',
    contactAddress: '123 Main St',
    externalWebsiteUrl: 'https://test.ch',
    activityType: 'SPORT',
    location: {
      swissLocation: {
        cantonCode: 'VS',
        translations: [{ language: 'fr', name: 'Sion' }],
      },
    },
    pages: [{ id: 'p1', slug: 'about', label: 'About', isAnchor: false, position: 0, parentId: null }],
    photos: [{ id: 'ph1', url: '/photo.jpg', alt: 'Photo', position: 0 }],
  }

  it('returns full club data when published and active', async () => {
    clubFindFirst.mockResolvedValue(fullClub)

    const result = await getClubPublicData('test-club', 'ch')

    expect(result).toEqual(fullClub)
    expect(clubFindFirst).toHaveBeenCalledOnce()
  })

  it('returns null for unpublished club', async () => {
    clubFindFirst.mockResolvedValue(null)

    const result = await getClubPublicData('unpublished-club', 'ch')

    expect(result).toBeNull()
  })

  it('returns null for force-offline club', async () => {
    clubFindFirst.mockResolvedValue(null)

    const result = await getClubPublicData('offline-club', 'ch')

    expect(result).toBeNull()
  })

  it('passes correct where clause with all 3 visibility flags', async () => {
    clubFindFirst.mockResolvedValue(null)

    await getClubPublicData('my-club', 'ch')

    expect(clubFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: 'my-club',
          country: 'ch',
          status: 'ACTIVE',
          isPublished: true,
          forceOffline: false,
        },
      }),
    )
  })
})
