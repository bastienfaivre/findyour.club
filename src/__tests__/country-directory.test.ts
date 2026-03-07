import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({ get: vi.fn(() => 'localhost:3000') })),
  cookies: vi.fn(async () => ({ get: vi.fn(() => undefined) })),
}))
vi.mock('@/components/layout/public-layout', () => ({
  PublicLayout: vi.fn(({ children }: { children: unknown }) => children),
}))
vi.mock('@/components/layout/public-navbar', () => ({
  PublicNavbar: vi.fn(() => null),
}))
vi.mock('@/components/layout/public-footer', () => ({
  PublicFooter: vi.fn(() => null),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    club: { findMany: vi.fn() },
    swissCanton: { findMany: vi.fn() },
    activityType: { findMany: vi.fn() },
  },
}))

import { prisma } from '@/server/db'
import CountryDirectoryPage, { generateMetadata } from '@/app/[lang]/(country)/[country]/page'
import { ClubCard, ClubCardSkeleton } from '@/components/app/directory/ClubCard'
import { generateDirectoryMetadata } from '@/components/app/seo/metadata'

function makeParams(lang = 'en', country = 'ch') {
  return Promise.resolve({ lang, country })
}

function makeSearchParams(params: Record<string, string> = {}) {
  return Promise.resolve(params)
}

function findText(node: unknown): string {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(findText).join('')
  if (typeof node === 'object' && 'props' in (node as Record<string, unknown>)) {
    const el = node as { props: Record<string, unknown> }
    // Traverse all prop values that could contain children (children, fallback, etc.)
    return Object.values(el.props).map(findText).join('')
  }
  return ''
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findInTree(node: unknown, predicate: (n: any) => boolean): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = []
  if (node === null || node === undefined || typeof node !== 'object') return results
  if (predicate(node)) results.push(node)
  if (Array.isArray(node)) {
    for (const child of node) results.push(...findInTree(child, predicate))
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = node as { props?: Record<string, any> }
    if (el.props) {
      for (const val of Object.values(el.props)) {
        results.push(...findInTree(val, predicate))
      }
    }
  }
  return results
}

const mockClub = {
  id: 'club-1',
  name: 'Ski Club Valais',
  slug: 'ski-club-valais',
  logoUrl: null,
  logoAlt: null,
  activityType: { slug: 'skiing' },
  location: {
    swissLocation: {
      cantonCode: 'VS',
      translations: [{ name: 'Sion' }],
    },
  },
}


function setupMocks(clubs = [mockClub], cantons = [{ code: 'VS', translations: [{ name: 'Valais' }] }], activities = [{ slug: 'skiing' }]) {
  vi.mocked(prisma.club.findMany).mockResolvedValue(clubs as never)
  vi.mocked(prisma.swissCanton.findMany).mockResolvedValue(cantons as never)
  vi.mocked(prisma.activityType.findMany).mockResolvedValue(activities as never)
}

describe('ClubCard', () => {
  it('renders name, activity badge, location, and correct link href', () => {
    const result = ClubCard({
      name: 'Ski Club Valais',
      slug: 'ski-club-valais',
      country: 'ch',
      lang: 'en',
      activityType: 'Skiing',
      locationName: 'Sion',
      cantonName: 'Valais',
      ariaLabel: 'Ski Club Valais — Skiing in Sion',
    })

    expect(result.props.href).toBe('/en/ch/ski-club-valais')
    expect(result.props['aria-label']).toBe('Ski Club Valais — Skiing in Sion')
    const text = findText(result)
    expect(text).toContain('Ski Club Valais')
    expect(text).toContain('Skiing')
    expect(text).toContain('Sion, Valais')
  })

  it('renders monogram fallback when no logo', () => {
    const result = ClubCard({
      name: 'Ski Club Valais',
      slug: 'ski-club-valais',
      country: 'ch',
      lang: 'en',
      ariaLabel: 'Ski Club Valais',
    })

    const text = findText(result)
    expect(text).toContain('S')
    expect(text).toContain('Ski Club Valais')
  })

  it('renders logo image when logoUrl is provided', () => {
    const result = ClubCard({
      name: 'FC Zurich',
      slug: 'fc-zurich',
      country: 'ch',
      lang: 'en',
      logoUrl: '/logos/fc-zurich.png',
      logoAlt: 'FC Zurich logo',
      ariaLabel: 'FC Zurich',
    })

    // Find the img element in the tree
    const children = result.props.children
    const imgElement = Array.isArray(children) ? children[0] : children
    expect(imgElement.props.src).toBe('/logos/fc-zurich.png')
    expect(imgElement.props.alt).toBe('FC Zurich logo')
  })
})

describe('ClubCardSkeleton', () => {
  it('renders without error', () => {
    const result = ClubCardSkeleton()
    expect(result).toBeTruthy()
    expect(result.props.className).toContain('rounded-xl')
  })
})

describe('generateDirectoryMetadata (for directory page)', () => {
  it('returns correct meta for country page', () => {
    const meta = generateDirectoryMetadata({
      title: 'Clubs in Switzerland',
      description: 'Browse clubs in Switzerland',
      path: '/en/ch',
      lang: 'en',
      country: 'ch',
    })

    expect(meta.title).toBe('Clubs in Switzerland')
    expect(meta.description).toBe('Browse clubs in Switzerland')
    expect(meta.robots).toBe('index, follow')
    expect(meta.openGraph).toEqual(
      expect.objectContaining({
        title: 'Clubs in Switzerland',
        type: 'website',
        locale: 'en',
      })
    )
    expect(meta.alternates?.canonical).toContain('/en/ch')
  })
})

describe('page generateMetadata', () => {
  it('returns populated metadata for valid country', async () => {
    const meta = await generateMetadata({
      params: makeParams('en', 'ch'),
      searchParams: makeSearchParams(),
    })

    expect(meta.title).toContain('Switzerland')
    expect(meta.description).toContain('Switzerland')
  })

  it('returns empty metadata for invalid country', async () => {
    const meta = await generateMetadata({
      params: makeParams('en', 'xx'),
      searchParams: makeSearchParams(),
    })

    expect(meta).toEqual({})
  })
})

describe('CountryDirectoryPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders clubs from DB', async () => {
    setupMocks()

    const result = await CountryDirectoryPage({
      params: makeParams(),
      searchParams: makeSearchParams(),
    })

    const text = findText(result)
    expect(text).toContain('Clubs in Switzerland')
    expect(text).toContain('1 clubs')

    // Find ClubCard elements in the tree by matching the mock function reference
    const clubCards = findInTree(result, (n: { type?: unknown }) => n.type === ClubCard)
    expect(clubCards).toHaveLength(1)
    expect(clubCards[0].props.name).toBe('Ski Club Valais')
    expect(clubCards[0].props.slug).toBe('ski-club-valais')
    expect(clubCards[0].props.activityType).toBe('Skiing')
    expect(clubCards[0].props.locationName).toBe('Sion')
  })

  it('shows empty state when no clubs match filters', async () => {
    setupMocks([])

    const result = await CountryDirectoryPage({
      params: makeParams(),
      searchParams: makeSearchParams(),
    })

    const text = findText(result)
    expect(text).toContain('No clubs match these filters')
    expect(text).toContain('Try a different canton or activity type')
  })

  it('filters by activity and canton from searchParams', async () => {
    setupMocks()

    await CountryDirectoryPage({
      params: makeParams(),
      searchParams: makeSearchParams({ activity: 'skiing', canton: 'VS' }),
    })

    const findManyCall = vi.mocked(prisma.club.findMany).mock.calls[0][0]
    expect(findManyCall?.where).toEqual(
      expect.objectContaining({
        country: 'ch',
        status: 'ACTIVE',
        activityType: { slug: 'skiing' },
        location: { swissLocation: { cantonCode: 'VS' } },
      })
    )
  })

  it('redirects to platform homepage for invalid country', async () => {
    setupMocks()

    await expect(
      CountryDirectoryPage({
        params: makeParams('en', 'xx'),
        searchParams: makeSearchParams(),
      })
    ).rejects.toThrow('NEXT_REDIRECT:/en')
  })

  it('resolves unsupported language to English fallback', async () => {
    setupMocks()

    const result = await CountryDirectoryPage({
      params: makeParams('pt', 'ch'),
      searchParams: makeSearchParams(),
    })

    const text = findText(result)
    expect(text).toContain('Clubs in Switzerland')
  })
})
