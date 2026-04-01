import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    club: { findFirst: vi.fn() },
    page: { findFirst: vi.fn() },
    swissCanton: { findUnique: vi.fn() },
  },
}))
vi.mock('@/lib/country', () => ({
  isValidCountry: vi.fn((country: string) => country === 'ch'),
  getCountryName: vi.fn(() => 'Switzerland'),
}))
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn(() => null),
  })),
}))
vi.mock('@/lib/server/page-tracking', () => ({
  trackPageEvent: vi.fn(),
}))
vi.mock('next/image', () => ({
  default: vi.fn((_props: Record<string, unknown>) => null),
}))
vi.mock('next/link', () => ({
  default: vi.fn(({ children }: { children: unknown }) => children),
}))

import { notFound } from 'next/navigation'
import { prisma } from '@/server/db'
import ClubPage from '@/app/[lang]/(dashboard)/[country]/[club]/page'
import { generateClubMetadata, generateClubJsonLd } from '@/components/app/seo/metadata'

function makeParams(lang = 'en', country = 'ch', club = 'ski-club-valais') {
  return Promise.resolve({ lang, country, club })
}

function findInTree(node: unknown, predicate: (n: unknown) => boolean): unknown[] {
  const results: unknown[] = []
  if (node === null || node === undefined) return results
  if (predicate(node)) results.push(node)
  if (typeof node !== 'object') return results
  if (Array.isArray(node)) {
    for (const child of node) results.push(...findInTree(child, predicate))
    return results
  }
  const el = node as { props?: Record<string, unknown>; type?: unknown }
  if (el.props) {
    for (const val of Object.values(el.props)) {
      results.push(...findInTree(val, predicate))
    }
  }
  return results
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function findByType(node: unknown, type: string | Function): unknown[] {
  return findInTree(node, (n) => {
    if (n === null || n === undefined || typeof n !== 'object') return false
    const el = n as { type?: unknown }
    return el.type === type || (typeof el.type === 'function' && (el.type as { name?: string }).name === (type as { name?: string }).name)
  })
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function findProps(node: unknown, type: string | Function): Record<string, unknown> | null {
  const found = findByType(node, type)
  if (found.length === 0) return null
  return (found[0] as { props: Record<string, unknown> }).props
}

const mockClub = {
  id: 'club-1',
  name: 'Ski Club Valais',
  slug: 'ski-club-valais',
  country: 'ch',
  logoUrl: null as string | null,
  logoAlt: null as string | null,
  description: 'Welcome to our ski club!',
  accentColor: 'blue',
  defaultLanguage: 'fr',
  email: 'info@skiclubvalais.ch',
  schedule: 'Every Saturday 9am-12pm' as string | null,
  howToJoin: 'Fill out the form on our website' as string | null,
  contactPhone: '+41 27 123 45 67' as string | null,
  contactAddress: '123 Alpine Road\nSion, VS' as string | null,
  externalWebsiteUrl: 'https://skiclubvalais.ch' as string | null,
  activityType: { slug: 'skiing' },
  location: {
    swissLocation: {
      cantonCode: 'VS',
      translations: [{ language: 'en', name: 'Sion' }],
    },
  } as { swissLocation: { cantonCode: string; translations: { language: string; name: string }[] } } | null,
  pages: [
    { id: 'p1', slug: 'about', label: 'About', isAnchor: false, position: 1, parentId: null },
  ],
  photos: [
    { id: 'photo-1', url: 'https://example.com/photo1.jpg', alt: 'Mountain view', position: 1 },
    { id: 'photo-2', url: 'https://example.com/photo2.jpg', alt: 'Ski slope', position: 2 },
  ],
}

function setupClubMock(club = mockClub) {
  vi.mocked(prisma.club.findFirst).mockResolvedValue(club as never)
}

describe('ClubPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Default: slug is not a canton code
    vi.mocked(prisma.swissCanton.findUnique).mockResolvedValue(null)
  })

  it('calls notFound() for non-existent club slug', async () => {
    vi.mocked(prisma.club.findFirst).mockResolvedValue(null)
    await expect(ClubPage({ params: makeParams('en', 'ch', 'nonexistent') }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('calls notFound() for invalid country', async () => {
    await expect(ClubPage({ params: makeParams('en', 'zz', 'ski-club-valais') }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('renders ProfilePage with club data and translations', async () => {
    setupClubMock()
    const result = await ClubPage({ params: makeParams() })
    const { ProfilePage } = await import('@/components/app/club-profile/ProfilePage')
    const profileProps = findProps(result, ProfilePage)
    expect(profileProps).not.toBeNull()
    expect(profileProps!.club).toEqual(expect.objectContaining({
      name: 'Ski Club Valais',
      description: 'Welcome to our ski club!',
      logoUrl: null,
      email: 'info@skiclubvalais.ch',
      schedule: 'Every Saturday 9am-12pm',
      howToJoin: 'Fill out the form on our website',
      contactPhone: '+41 27 123 45 67',
    }))
  })

  it('renders ProfilePage with monogram fallback when no logoUrl', async () => {
    setupClubMock()
    const result = await ClubPage({ params: makeParams() })
    const { ProfilePage } = await import('@/components/app/club-profile/ProfilePage')
    const profileProps = findProps(result, ProfilePage)
    expect(profileProps).not.toBeNull()
    expect((profileProps!.club as { logoUrl: unknown }).logoUrl).toBeNull()
  })

  it('renders ProfilePage with logo when logoUrl present', async () => {
    const clubWithLogo = { ...mockClub, logoUrl: 'https://example.com/logo.png', logoAlt: 'Logo' }
    setupClubMock(clubWithLogo)
    const result = await ClubPage({ params: makeParams() })
    const { ProfilePage } = await import('@/components/app/club-profile/ProfilePage')
    const profileProps = findProps(result, ProfilePage)
    expect(profileProps).not.toBeNull()
    expect((profileProps!.club as { logoUrl: unknown }).logoUrl).toBe('https://example.com/logo.png')
  })

  it('passes photos to ProfilePage', async () => {
    setupClubMock()
    const result = await ClubPage({ params: makeParams() })
    const { ProfilePage } = await import('@/components/app/club-profile/ProfilePage')
    const profileProps = findProps(result, ProfilePage)
    expect(profileProps).not.toBeNull()
    const club = profileProps!.club as { photos: unknown[] }
    expect(club.photos).toHaveLength(2)
  })

  it('passes empty photos array when club has no photos', async () => {
    setupClubMock({ ...mockClub, photos: [] })
    const result = await ClubPage({ params: makeParams() })
    const { ProfilePage } = await import('@/components/app/club-profile/ProfilePage')
    const profileProps = findProps(result, ProfilePage)
    expect(profileProps).not.toBeNull()
    const club = profileProps!.club as { photos: unknown[] }
    expect(club.photos).toHaveLength(0)
  })

  it('passes null optional fields when not set', async () => {
    const minimalClub = {
      ...mockClub,
      contactPhone: null,
      contactAddress: null,
      externalWebsiteUrl: null,
      schedule: null,
      howToJoin: null,
      photos: [],
    }
    setupClubMock(minimalClub)
    const result = await ClubPage({ params: makeParams() })
    const { ProfilePage } = await import('@/components/app/club-profile/ProfilePage')
    const profileProps = findProps(result, ProfilePage)
    expect(profileProps).not.toBeNull()
    const club = profileProps!.club as Record<string, unknown>
    expect(club.contactPhone).toBeNull()
    expect(club.contactAddress).toBeNull()
    expect(club.externalWebsiteUrl).toBeNull()
    expect(club.schedule).toBeNull()
    expect(club.howToJoin).toBeNull()
  })

  it('is publicly accessible without authentication', async () => {
    setupClubMock()
    const result = await ClubPage({ params: makeParams() })
    expect(result).toBeTruthy()
    expect(notFound).not.toHaveBeenCalled()
  })

  it('includes JSON-LD script in output', async () => {
    setupClubMock()
    const result = await ClubPage({ params: makeParams() })
    const scripts = findByType(result, 'script')
    expect(scripts.length).toBeGreaterThanOrEqual(1)
    const scriptEl = scripts[0] as { props: { type: string; dangerouslySetInnerHTML: { __html: string } } }
    expect(scriptEl.props.type).toBe('application/ld+json')
    const jsonLd = JSON.parse(scriptEl.props.dangerouslySetInnerHTML.__html)
    expect(jsonLd['@type']).toEqual(['SportsClub', 'LocalBusiness'])
    expect(jsonLd.name).toBe('Ski Club Valais')
  })

  it('renders page with accent color CSS custom properties', async () => {
    setupClubMock()
    const result = await ClubPage({ params: makeParams() })
    const el = result as { props: { style: Record<string, string> } }
    expect(el.props.style['--primary']).toBe('221.2 83.2% 53.3%')
    expect(el.props.style['--primary-foreground']).toBe('210 40% 98%')
  })
})

describe('generateClubMetadata', () => {
  it('returns correct title with activity type', () => {
    const metadata = generateClubMetadata({
      clubName: 'Ski Club Valais',
      clubDescription: 'Welcome to our ski club!',
      clubLogoUrl: 'https://example.com/logo.png',
      clubSlug: 'ski-club-valais',
      country: 'ch',
      lang: 'fr',
      activityTypeLabel: 'Skiing',
    })
    expect(metadata.title).toBe('Ski Club Valais')
    expect(metadata.description).toBe('Welcome to our ski club!')
    expect(metadata.robots).toBe('index, follow')
    expect(metadata.alternates?.canonical).toContain('/fr/ch/ski-club-valais')
    expect(metadata.openGraph).toBeDefined()
  })

  it('returns club name as title when no activity type', () => {
    const metadata = generateClubMetadata({
      clubName: 'Test Club',
      clubDescription: 'Hello world',
      clubSlug: 'test-club',
      country: 'ch',
      lang: 'en',
    })
    expect(metadata.title).toBe('Test Club')
  })

  it('truncates long descriptions to 160 chars', () => {
    const longDescription = 'A'.repeat(200)
    const metadata = generateClubMetadata({
      clubName: 'Test',
      clubDescription: longDescription,
      clubSlug: 'test',
      country: 'ch',
      lang: 'en',
    })
    expect(metadata.description!.length).toBeLessThanOrEqual(160)
  })

  it('includes OpenGraph images when logoUrl is provided', () => {
    const metadata = generateClubMetadata({
      clubName: 'Test',
      clubDescription: 'Hello',
      clubLogoUrl: 'https://example.com/logo.png',
      clubSlug: 'test',
      country: 'ch',
      lang: 'en',
    })
    expect(metadata.openGraph).toHaveProperty('images')
  })
})

describe('generateClubJsonLd', () => {
  it('returns valid Organization schema', () => {
    const jsonLd = generateClubJsonLd({
      clubName: 'Ski Club Valais',
      clubDescription: 'Welcome!',
      clubLogoUrl: 'https://example.com/logo.png',
      clubSlug: 'ski-club-valais',
      country: 'ch',
      lang: 'fr',
      countryName: 'Suisse',
    })
    expect(jsonLd['@context']).toBe('https://schema.org')
    expect(jsonLd['@type']).toEqual(['SportsClub', 'LocalBusiness'])
    expect(jsonLd.name).toBe('Ski Club Valais')
    expect(jsonLd.logo).toBe('https://example.com/logo.png')
    expect(jsonLd.description).toBe('Welcome!')
    expect(jsonLd.areaServed).toEqual({ '@type': 'Country', name: 'Suisse' })
    expect(jsonLd.url).toContain('/fr/ch/ski-club-valais')
  })

  it('omits logo when not provided', () => {
    const jsonLd = generateClubJsonLd({
      clubName: 'Test Club',
      clubDescription: 'Hello',
      clubSlug: 'test',
      country: 'ch',
      lang: 'en',
      countryName: 'Switzerland',
    })
    expect(jsonLd).not.toHaveProperty('logo')
  })
})
