import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------- Mocks ----------

vi.mock('@/server/db', () => ({
  prisma: {
    club: { findMany: vi.fn(), findFirst: vi.fn() },
  },
}))

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(async () => null),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('@/lib/server/club-queries', () => ({
  getClubBySlug: vi.fn(async () => ({
    id: 'club-1',
    name: 'Ski Club Valais',
    slug: 'ski-club-valais',
    country: 'ch',
    defaultLanguage: 'fr',
  })),
}))

vi.mock('@/lib/country', () => ({
  isValidCountry: vi.fn((c: string) => c === 'ch'),
  SUPPORTED_COUNTRIES: ['ch'],
}))

vi.mock('@/lib/i18n', () => ({
  resolveUILang: vi.fn((lang: string) => lang === 'fr' ? 'fr' : 'en'),
}))

vi.mock('@/lib/i18n/translations', () => ({
  getTranslations: vi.fn((lang: string) => ({
    clubSite: {
      poweredBy: lang === 'fr' ? 'Propulsé par Clashware' : 'Powered by Clashware',
      poweredByAriaLabel: lang === 'fr'
        ? "Propulsé par Clashware — visiter la page d'accueil"
        : 'Powered by Clashware — visit platform homepage',
    },
    auth: { banner: {} },
  })),
}))

vi.mock('next/link', () => ({
  default: vi.fn(({ children, ...props }: { children: unknown; href: string; [key: string]: unknown }) => {
    return { type: 'a', props: { ...props, children }, key: null }
  }),
}))

// ---------- Helpers ----------

function findText(node: unknown): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (node === null || node === undefined) return ''
  if (Array.isArray(node)) return node.map(findText).join('')
  if (typeof node === 'object') {
    const el = node as { props?: { children?: unknown } }
    if (el.props?.children) return findText(el.props.children)
  }
  return ''
}

function findInTree(node: unknown, predicate: (n: unknown) => boolean): unknown[] {
  const results: unknown[] = []
  if (node === null || node === undefined || typeof node !== 'object') return results
  if (predicate(node)) results.push(node)
  if (Array.isArray(node)) {
    for (const child of node) results.push(...findInTree(child, predicate))
  } else {
    const el = node as { props?: { children?: unknown } }
    if (el.props?.children) results.push(...findInTree(el.props.children, predicate))
  }
  return results
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findByType(node: unknown, type: string | ((...args: any[]) => any)): unknown[] {
  return findInTree(node, (n) => {
    const el = n as { type?: unknown }
    if (typeof type === 'string') return el.type === type
    return el.type === type || (typeof el.type === 'function' && (el.type as { name?: string }).name === (type as { name?: string }).name)
  })
}

function makeParams(lang = 'en', country = 'ch', club = 'ski-club-valais') {
  return Promise.resolve({ lang, country, club })
}

// ---------- Tests ----------

import { prisma } from '@/server/db'

describe('PoweredByBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a link to the platform homepage with correct /{lang}/ href', async () => {
    const { PoweredByBanner } = await import(
      '@/components/app/club-site/PoweredByBanner'
    )
    const result = PoweredByBanner({ lang: 'fr' })
    const links = findInTree(result, (n) => {
      const el = n as { props?: { href?: string } }
      return typeof el.props?.href === 'string'
    })
    expect(links).toHaveLength(1)
    const link = links[0] as { props: { href: string } }
    expect(link.props.href).toBe('/fr/')
  })

  it('has aria-label on the link for accessibility', async () => {
    const { PoweredByBanner } = await import(
      '@/components/app/club-site/PoweredByBanner'
    )
    const result = PoweredByBanner({ lang: 'en' })
    const links = findInTree(result, (n) => {
      const el = n as { props?: { 'aria-label'?: string } }
      return typeof el.props?.['aria-label'] === 'string'
    })
    expect(links).toHaveLength(1)
    const link = links[0] as { props: { 'aria-label': string } }
    expect(link.props['aria-label']).toContain('Powered by Clashware')
  })

  it('renders the "Powered by" text from translations', async () => {
    const { PoweredByBanner } = await import(
      '@/components/app/club-site/PoweredByBanner'
    )
    const result = PoweredByBanner({ lang: 'fr' })
    const text = findText(result)
    expect(text).toContain('Propulsé par Clashware')
  })
})

describe('Club layout renders PoweredByBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders PoweredByBanner after children', async () => {
    const { default: ClubLayout } = await import(
      '@/app/[lang]/(country)/[country]/[club]/layout'
    )
    const { PoweredByBanner } = await import(
      '@/components/app/club-site/PoweredByBanner'
    )

    const result = await ClubLayout({
      children: 'main-content',
      params: makeParams('fr', 'ch', 'ski-club-valais'),
    })

    const banners = findByType(result, PoweredByBanner)
    expect(banners.length).toBeGreaterThanOrEqual(1)

    const banner = banners[0] as { props: { lang: string } }
    expect(banner.props.lang).toBe('fr')
  })
})

describe('Platform sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns entries for all ACTIVE clubs with correct URL format', async () => {
    vi.mocked(prisma.club.findMany).mockResolvedValue([
      { slug: 'ski-club', country: 'ch', defaultLanguage: 'fr', updatedAt: new Date('2026-01-01') },
      { slug: 'tennis-club', country: 'ch', defaultLanguage: 'de', updatedAt: new Date('2026-02-01') },
    ] as never)

    const sitemap = (await import('@/app/sitemap')).default
    const entries = await sitemap()

    const clubEntries = entries.filter((e) => e.url.includes('/ski-club') || e.url.includes('/tennis-club'))
    expect(clubEntries).toHaveLength(2)
    expect(clubEntries[0].url).toContain('/fr/ch/ski-club')
    expect(clubEntries[1].url).toContain('/de/ch/tennis-club')
  })

  it('excludes SUSPENDED clubs (only queries ACTIVE)', async () => {
    vi.mocked(prisma.club.findMany).mockResolvedValue([] as never)

    const sitemap = (await import('@/app/sitemap')).default
    await sitemap()

    expect(prisma.club.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'ACTIVE' },
      })
    )
  })

  it('includes platform pages (homepage, directory, about, support)', async () => {
    vi.mocked(prisma.club.findMany).mockResolvedValue([] as never)

    const sitemap = (await import('@/app/sitemap')).default
    const entries = await sitemap()

    const urls = entries.map((e) => e.url)
    expect(urls.some((u) => u.endsWith('/en/'))).toBe(true)
    expect(urls.some((u) => u.includes('/en/ch/'))).toBe(true)
    expect(urls.some((u) => u.includes('/en/about'))).toBe(true)
    expect(urls.some((u) => u.includes('/en/support'))).toBe(true)
  })

  it('uses club.defaultLanguage as the language segment in URLs', async () => {
    vi.mocked(prisma.club.findMany).mockResolvedValue([
      { slug: 'club-x', country: 'ch', defaultLanguage: 'it', updatedAt: new Date() },
    ] as never)

    const sitemap = (await import('@/app/sitemap')).default
    const entries = await sitemap()

    const clubEntry = entries.find((e) => e.url.includes('/club-x'))
    expect(clubEntry).toBeDefined()
    expect(clubEntry!.url).toContain('/it/ch/club-x')
  })

  it('sets correct priority and changeFrequency for entries', async () => {
    vi.mocked(prisma.club.findMany).mockResolvedValue([
      { slug: 'my-club', country: 'ch', defaultLanguage: 'fr', updatedAt: new Date() },
    ] as never)

    const sitemap = (await import('@/app/sitemap')).default
    const entries = await sitemap()

    const homepage = entries.find((e) => e.url.endsWith('/en/'))
    expect(homepage?.priority).toBe(1.0)

    const clubEntry = entries.find((e) => e.url.includes('/my-club'))
    expect(clubEntry?.priority).toBe(0.7)
    expect(clubEntry?.changeFrequency).toBe('weekly')
  })
})

describe('Canonical and robots meta (verification)', () => {
  it('generateClubMetadata sets canonical and robots for club home page', async () => {
    const { generateClubMetadata } = await import('@/components/app/seo/metadata')

    const metadata = generateClubMetadata({
      clubName: 'Ski Club',
      clubDescription: 'A ski club',
      clubSlug: 'ski-club',
      country: 'ch',
      lang: 'fr',
    })

    expect(metadata.alternates?.canonical).toContain('/fr/ch/ski-club')
    expect(metadata.robots).toBe('index, follow')
  })

  it('generateClubMetadata sets canonical for inner pages', async () => {
    const { generateClubMetadata } = await import('@/components/app/seo/metadata')

    const metadata = generateClubMetadata({
      clubName: 'Ski Club',
      clubDescription: 'A ski club',
      clubSlug: 'ski-club',
      country: 'ch',
      lang: 'fr',
      pageTitle: 'Calendar',
      pageSlug: 'calendar',
    })

    expect(metadata.alternates?.canonical).toContain('/fr/ch/ski-club/calendar')
    expect(metadata.robots).toBe('index, follow')
  })
})
