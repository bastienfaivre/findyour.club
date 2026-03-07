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
