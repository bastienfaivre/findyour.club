import type { MetadataRoute } from 'next'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

const platformEntries: MetadataRoute.Sitemap = [
  {
    url: `${BASE_URL}/en/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/en/search`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/en/about`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  },
  {
    url: `${BASE_URL}/en/support`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let clubs: { slug: string; country: string; defaultLanguage: string; updatedAt: Date }[] = []

  try {
    clubs = await prisma.club.findMany({
      where: { status: 'ACTIVE' },
      select: {
        slug: true,
        country: true,
        defaultLanguage: true,
        updatedAt: true,
      },
    })
  } catch {
    return platformEntries
  }

  const clubEntries: MetadataRoute.Sitemap = clubs.map((club) => ({
    url: `${BASE_URL}/${club.defaultLanguage}/${club.country}/${club.slug}`,
    lastModified: club.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...platformEntries, ...clubEntries]
}
