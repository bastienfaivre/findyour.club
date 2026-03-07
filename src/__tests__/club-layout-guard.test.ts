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
vi.mock('@/components/app/auth/TotpEnrollmentBanner', () => ({
  TotpEnrollmentBanner: vi.fn(() => null),
}))
vi.mock('@/components/layout/mobile-nav-menu', () => ({
  MobileNavMenu: vi.fn(() => null),
}))
vi.mock('@/components/app/LanguageSwitcher', () => ({
  LanguageSwitcher: vi.fn(() => null),
}))
vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: vi.fn(() => null),
}))
vi.mock('@/components/app/club-site/PoweredByBanner', () => ({
  PoweredByBanner: vi.fn(() => null),
}))
vi.mock('@/components/layout/nav-link', () => ({
  NavLink: vi.fn(() => null),
}))

import { notFound } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { getClubPublicData } from '@/lib/server/club-queries'
import ClubLayout from '@/app/[lang]/(country)/[country]/[club]/layout'

const MOCK_CLUB = {
  id: 'club-1',
  name: 'Test Club',
  slug: 'ski-club-valais',
  country: 'ch',
  logoUrl: null,
  logoAlt: null,
  welcomeText: null,
  accentColor: null,
  defaultLanguage: 'fr',
  activityType: { slug: 'skiing' },
  location: null,
  pages: [],
}

const MOCK_CHILDREN = null

function makeParams(slug = 'ski-club-valais', country = 'ch', lang = 'fr') {
  return Promise.resolve({ lang, country, club: slug })
}

describe('ClubLayout (public access)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('calls notFound() when club does not exist in DB', async () => {
    vi.mocked(getClubPublicData).mockResolvedValue(null)
    await expect(ClubLayout({ children: MOCK_CHILDREN, params: makeParams('nonexistent-slug') })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('renders children without requiring authentication (public access)', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    vi.mocked(getClubPublicData).mockResolvedValue(MOCK_CLUB as never)
    const result = await ClubLayout({ children: MOCK_CHILDREN, params: makeParams() })
    expect(notFound).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('resolves club by (slug, country) via getClubPublicData', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    vi.mocked(getClubPublicData).mockResolvedValue(MOCK_CLUB as never)
    await ClubLayout({ children: MOCK_CHILDREN, params: makeParams('ski-club-valais', 'ch') })
    expect(vi.mocked(getClubPublicData)).toHaveBeenCalledWith('ski-club-valais', 'ch')
  })
})
