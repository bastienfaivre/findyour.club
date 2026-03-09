import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/db', () => ({
  prisma: {
    club: { findMany: vi.fn() },
    swissCanton: { findMany: vi.fn() },
  },
}))
vi.mock('@/lib/i18n/translations', () => ({
  getTranslations: vi.fn(() => ({
    nav: { search: 'Search' },
    platform: { philosophy: 'Find clubs near you' },
    directory: {
      clubCount: '{count} clubs',
      noResults: 'No clubs found',
      noResultsHint: 'Try adjusting your filters',
      filterCountry: 'Country',
      filterCanton: 'Canton',
      filterCity: 'City',
      filterActivity: 'Activity',
      allCountries: 'All',
      allCantons: 'All cantons',
      allActivities: 'All activities',
      resetFilters: 'Reset',
      clubAriaLabel: '{name} - {activity} in {location}',
    },
    country: { ch: 'Switzerland', fr: 'France', de: 'Germany' },
    activityTypes: {} as Record<string, string>,
  })),
}))
vi.mock('@/lib/i18n', () => ({
  resolveUILang: vi.fn(() => 'en'),
}))
vi.mock('@/lib/country', () => ({
  isValidCountry: vi.fn((c: string) => ['ch', 'fr', 'de'].includes(c)),
  SUPPORTED_COUNTRIES: ['ch', 'fr', 'de'],
  getCountryName: vi.fn((code: string) => {
    const names: Record<string, string> = { ch: 'Switzerland', fr: 'France', de: 'Germany' }
    return names[code] ?? code
  }),
}))
vi.mock('@/components/app/directory/ClubCard', () => ({
  ClubCard: vi.fn(() => null),
  ClubCardSkeleton: vi.fn(() => null),
}))
vi.mock('@/components/app/directory/DirectoryFilters', () => ({
  DirectoryFilters: vi.fn(() => null),
}))
vi.mock('@/components/app/admin/AdminPageTitle', () => ({
  AdminPageTitle: vi.fn(() => null),
}))
vi.mock('@/components/app/seo/metadata', () => ({
  generatePlatformMetadata: vi.fn(() => ({})),
}))

import { prisma } from '@/server/db'
import { ClubCard } from '@/components/app/directory/ClubCard'
import SearchPage from '@/app/[lang]/(dashboard)/search/page'

function makeParams(lang = 'en') {
  return Promise.resolve({ lang })
}

function makeSearchParams(p: Record<string, string> = {}) {
  return Promise.resolve(p)
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

function findText(node: unknown): string {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(findText).join('')
  if (typeof node === 'object' && 'props' in (node as Record<string, unknown>)) {
    const el = node as { props: { children?: unknown } }
    return findText(el.props.children)
  }
  return ''
}


const mockClub = (overrides: Record<string, unknown> = {}) => ({
  id: 'club-1',
  name: 'Ski Club Valais',
  slug: 'ski-club-valais',
  country: 'ch',
  logoUrl: null,
  logoAlt: null,
  activityType: 'skiing',
  location: {
    swissLocation: {
      cantonCode: 'VS',
      translations: [{ name: 'Sion' }],
    },
  },
  ...overrides,
})

describe('SearchPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(prisma.club.findMany).mockResolvedValue([])
    vi.mocked(prisma.swissCanton.findMany).mockResolvedValue([])
  })

  it('renders club cards for active published clubs', async () => {
    const clubs = [
      mockClub(),
      mockClub({ id: 'club-2', name: 'Tennis Club Zurich', slug: 'tennis-club-zurich', activityType: 'tennis' }),
    ]
    vi.mocked(prisma.club.findMany).mockResolvedValue(clubs as never)

    const result = await SearchPage({ params: makeParams(), searchParams: makeSearchParams() })

    // Count ClubCard elements by looking at direct type matches in the rendered tree
    const cards = findInTree(result, (n) => {
      if (n === null || n === undefined || typeof n !== 'object') return false
      const el = n as { type?: unknown; props?: Record<string, unknown> }
      return el.type === ClubCard && el.props?.name !== undefined
    })
    expect(cards).toHaveLength(2)
  })

  it('passes correct visibility filters to prisma query (ACTIVE, isPublished, !forceOffline)', async () => {
    await SearchPage({ params: makeParams(), searchParams: makeSearchParams() })

    expect(prisma.club.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACTIVE',
          isPublished: true,
          forceOffline: false,
        }),
      }),
    )
  })

  it('filters by country when country param is valid', async () => {
    await SearchPage({ params: makeParams(), searchParams: makeSearchParams({ country: 'ch' }) })

    expect(prisma.club.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          country: 'ch',
        }),
      }),
    )
  })

  it('ignores invalid country param', async () => {
    await SearchPage({ params: makeParams(), searchParams: makeSearchParams({ country: 'zz' }) })

    const call = vi.mocked(prisma.club.findMany).mock.calls[0][0] as { where: Record<string, unknown> }
    expect(call.where).not.toHaveProperty('country')
  })

  it('shows "no results" when no clubs match', async () => {
    vi.mocked(prisma.club.findMany).mockResolvedValue([])

    const result = await SearchPage({ params: makeParams(), searchParams: makeSearchParams() })

    const text = findText(result)
    expect(text).toContain('No clubs found')
  })

  it('fetches cantons only when country is selected', async () => {
    // Without country — cantons should NOT be fetched
    await SearchPage({ params: makeParams(), searchParams: makeSearchParams() })
    expect(prisma.swissCanton.findMany).not.toHaveBeenCalled()

    vi.resetAllMocks()

    // With valid country — cantons SHOULD be fetched
    vi.mocked(prisma.club.findMany).mockResolvedValue([])
    vi.mocked(prisma.swissCanton.findMany).mockResolvedValue([])
    await SearchPage({ params: makeParams(), searchParams: makeSearchParams({ country: 'ch' }) })
    expect(prisma.swissCanton.findMany).toHaveBeenCalled()
  })
})
