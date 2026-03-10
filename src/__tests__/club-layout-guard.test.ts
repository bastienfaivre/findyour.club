import { describe, it, expect, vi, beforeEach } from 'vitest'

// redirect/notFound throw in real Next.js (return `never`); mocks must replicate this
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
  usePathname: vi.fn(() => '/fr/ch/ski-club-valais'),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(async () => null),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    club: { findFirst: vi.fn() },
    clubMembership: { findFirst: vi.fn() },
    swissCanton: { findUnique: vi.fn() },
  },
}))

vi.mock('@/lib/server/club-queries', () => ({
  getClubBySlug: vi.fn(),
  getClubPublicData: vi.fn(),
}))

vi.mock('@/lib/country', () => ({
  isValidCountry: vi.fn((country: string) => ['ch', 'fr', 'de'].includes(country)),
  getCountryName: vi.fn(() => 'Switzerland'),
}))
vi.mock('@/components/app/club-profile/ProfilePage', () => ({
  ProfilePage: vi.fn(() => null),
}))
vi.mock('@/components/app/admin/AdminPageTitle', () => ({
  AdminPageTitle: vi.fn(() => null),
}))
vi.mock('@/components/app/seo/metadata', () => ({
  generateClubMetadata: vi.fn(() => ({})),
  generateClubJsonLd: vi.fn(() => ({})),
  generateBreadcrumbJsonLd: vi.fn(() => ({})),
  generateCategoryMetadata: vi.fn(() => ({})),
  BASE_URL: 'http://localhost:3000',
}))
vi.mock('@/components/app/seo/CategoryLanding', () => ({
  CategoryLanding: vi.fn(() => null),
}))

import { notFound } from 'next/navigation'
import { prisma } from '@/server/db'
import { getClubPublicData } from '@/lib/server/club-queries'
import ClubPage from '@/app/[lang]/(dashboard)/[country]/[club]/page'

const MOCK_CLUB = {
  id: 'club-1',
  name: 'Test Club',
  slug: 'ski-club-valais',
  country: 'ch',
  logoUrl: null,
  logoAlt: null,
  description: null,
  accentColor: null,
  defaultLanguage: 'fr',
  activityType: { slug: 'skiing' },
  location: null,
  schedule: null,
  howToJoin: null,
  email: null,
  contactPhone: null,
  contactAddress: null,
  externalWebsiteUrl: null,
  photos: [],
}

function makeParams(slug = 'ski-club-valais', country = 'ch', lang = 'fr') {
  return Promise.resolve({ lang, country, club: slug })
}

describe('ClubPage (public access)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Default: slug is not a canton code
    vi.mocked(prisma.swissCanton.findUnique).mockResolvedValue(null)
  })

  it('calls notFound() when club does not exist in DB', async () => {
    vi.mocked(getClubPublicData).mockResolvedValue(null)
    await expect(ClubPage({ params: makeParams('nonexistent-slug') })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('renders without requiring authentication (public access)', async () => {
    vi.mocked(getClubPublicData).mockResolvedValue(MOCK_CLUB as never)
    const result = await ClubPage({ params: makeParams() })
    expect(notFound).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('resolves club by (slug, country) via getClubPublicData', async () => {
    vi.mocked(getClubPublicData).mockResolvedValue(MOCK_CLUB as never)
    await ClubPage({ params: makeParams('ski-club-valais', 'ch') })
    expect(vi.mocked(getClubPublicData)).toHaveBeenCalledWith('ski-club-valais', 'ch')
  })
})
