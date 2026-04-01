import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------- Mocks ----------

vi.mock('@/server/db', () => ({
  prisma: {
    club: { findMany: vi.fn(), findFirst: vi.fn() },
  },
}))

vi.mock('@/lib/country', () => ({
  SUPPORTED_COUNTRIES: ['ch'],
}))

// ---------- Tests ----------

import { prisma } from '@/server/db'

describe('Platform sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns entries for all ACTIVE clubs in all 4 languages', async () => {
    vi.mocked(prisma.club.findMany).mockResolvedValue([
      { slug: 'ski-club', country: 'ch', activityType: 'skiing', updatedAt: new Date('2026-01-01'), location: null },
      { slug: 'tennis-club', country: 'ch', activityType: null, updatedAt: new Date('2026-02-01'), location: null },
    ] as never)

    const sitemap = (await import('@/app/sitemap')).default
    const entries = await sitemap()

    // Each club × 4 languages = 8 club entries
    const skiEntries = entries.filter((e) => e.url.includes('/ski-club'))
    expect(skiEntries).toHaveLength(4)
    expect(skiEntries.map((e) => e.url)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('/fr/ch/ski-club'),
        expect.stringContaining('/de/ch/ski-club'),
        expect.stringContaining('/it/ch/ski-club'),
        expect.stringContaining('/en/ch/ski-club'),
      ]),
    )
  })

  it('excludes SUSPENDED, unpublished, and force-offline clubs', async () => {
    vi.mocked(prisma.club.findMany).mockResolvedValue([] as never)

    const sitemap = (await import('@/app/sitemap')).default
    await sitemap()

    expect(prisma.club.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'ACTIVE', isPublished: true, forceOffline: false },
      })
    )
  })

  it('includes platform pages for all 4 languages', async () => {
    vi.mocked(prisma.club.findMany).mockResolvedValue([] as never)

    const sitemap = (await import('@/app/sitemap')).default
    const entries = await sitemap()

    const urls = entries.map((e) => e.url)
    // Each platform page × 4 languages = 16 entries
    for (const lang of ['fr', 'de', 'it', 'en']) {
      expect(urls.some((u) => u.includes(`/${lang}/search`))).toBe(true)
      expect(urls.some((u) => u.includes(`/${lang}/about`))).toBe(true)
      expect(urls.some((u) => u.includes(`/${lang}/support`))).toBe(true)
    }
  })

  it('includes category landing pages for active activity types', async () => {
    vi.mocked(prisma.club.findMany).mockResolvedValue([
      { slug: 'club-x', country: 'ch', activityType: 'skiing', updatedAt: new Date(), location: null },
    ] as never)

    const sitemap = (await import('@/app/sitemap')).default
    const entries = await sitemap()

    const categoryEntries = entries.filter((e) => e.url.includes('/ch/skiing'))
    // 4 languages × 1 activity type
    expect(categoryEntries.length).toBeGreaterThanOrEqual(4)
  })

  it('sets correct priority and changeFrequency for entries', async () => {
    vi.mocked(prisma.club.findMany).mockResolvedValue([
      { slug: 'my-club', country: 'ch', activityType: null, updatedAt: new Date(), location: null },
    ] as never)

    const sitemap = (await import('@/app/sitemap')).default
    const entries = await sitemap()

    const homepage = entries.find((e) => e.url.endsWith('/en'))
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

  it('generateClubMetadata includes hreflang alternates for all languages', async () => {
    const { generateClubMetadata } = await import('@/components/app/seo/metadata')

    const metadata = generateClubMetadata({
      clubName: 'Ski Club',
      clubDescription: 'A ski club',
      clubSlug: 'ski-club',
      country: 'ch',
      lang: 'fr',
    })

    const languages = metadata.alternates?.languages as Record<string, string>
    expect(languages).toBeDefined()
    expect(languages['fr-CH']).toContain('/fr/ch/ski-club')
    expect(languages['de-CH']).toContain('/de/ch/ski-club')
    expect(languages['it-CH']).toContain('/it/ch/ski-club')
    expect(languages['en']).toContain('/en/ch/ski-club')
    expect(languages['x-default']).toContain('/en/ch/ski-club')
  })
})
