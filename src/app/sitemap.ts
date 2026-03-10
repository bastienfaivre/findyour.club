import type { MetadataRoute } from 'next'
import { prisma } from '@/server/db'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

const LANGS = [...SUPPORTED_LANGUAGES] as const

/** Platform pages that exist for every language */
const PLATFORM_PATHS = [
  { path: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
  { path: '/search', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/support', changeFrequency: 'monthly' as const, priority: 0.5 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Platform pages × all languages
  const platformEntries: MetadataRoute.Sitemap = LANGS.flatMap((lang) =>
    PLATFORM_PATHS.map(({ path, changeFrequency, priority }) => ({
      url: `${BASE_URL}/${lang}${path === '/' ? '' : path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
  )

  let clubs: {
    slug: string
    country: string
    activityType: string | null
    updatedAt: Date
    location: { swissLocation: { cantonCode: string } | null } | null
  }[] = []

  try {
    clubs = await prisma.club.findMany({
      where: { status: 'ACTIVE' },
      select: {
        slug: true,
        country: true,
        activityType: true,
        updatedAt: true,
        location: {
          select: {
            swissLocation: { select: { cantonCode: true } },
          },
        },
      },
    })
  } catch {
    return platformEntries
  }

  // Club pages × all languages
  const clubEntries: MetadataRoute.Sitemap = clubs.flatMap((club) =>
    LANGS.map((lang) => ({
      url: `${BASE_URL}/${lang}/${club.country}/${club.slug}`,
      lastModified: club.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  )

  // Category landing pages: /{lang}/{country}/{activity}
  const activitySlugs = [...new Set(clubs.map((c) => c.activityType).filter(Boolean))] as string[]
  const countries = [...new Set(clubs.map((c) => c.country))]

  const categoryEntries: MetadataRoute.Sitemap = LANGS.flatMap((lang) =>
    countries.flatMap((country) => [
      // Country-level landing
      {
        url: `${BASE_URL}/${lang}/${country}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      // Activity landing pages per country
      ...activitySlugs.map((activity) => ({
        url: `${BASE_URL}/${lang}/${country}/${activity}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ]),
  )

  // Canton-level landing pages: /{lang}/{country}/{canton} and /{lang}/{country}/{canton}/{activity}
  const cantonsByCountry = new Map<string, Set<string>>()
  for (const club of clubs) {
    const canton = club.location?.swissLocation?.cantonCode
    if (canton) {
      const set = cantonsByCountry.get(club.country) ?? new Set()
      set.add(canton.toLowerCase())
      cantonsByCountry.set(club.country, set)
    }
  }

  const cantonEntries: MetadataRoute.Sitemap = LANGS.flatMap((lang) =>
    [...cantonsByCountry.entries()].flatMap(([country, cantons]) =>
      [...cantons].flatMap((canton) => [
        {
          url: `${BASE_URL}/${lang}/${country}/${canton}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        },
        ...activitySlugs.map((activity) => ({
          url: `${BASE_URL}/${lang}/${country}/${canton}/${activity}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        })),
      ]),
    ),
  )

  return [...platformEntries, ...clubEntries, ...categoryEntries, ...cantonEntries]
}
