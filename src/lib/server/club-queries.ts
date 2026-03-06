import { cache } from 'react'
import { prisma } from '@/server/db'

/**
 * Cached club lookup — deduplicates identical DB calls within the same request
 * when multiple server components (e.g. layout + page) fetch the same club.
 */
export const getClubBySlug = cache(async (slug: string, country: string) =>
  prisma.club.findFirst({
    where: { slug, country, status: 'ACTIVE' },
    select: { id: true, name: true },
  }),
)

/**
 * Returns the ACTIVE OWNER membership for a user in a club, or null if none.
 * Cached per request — safe to call from multiple server components without extra DB round-trips.
 */
export const getClubOwnership = cache(async (userId: string, clubId: string) =>
  prisma.clubMembership.findFirst({
    where: { userId, clubId, status: 'ACTIVE', role: 'OWNER' },
    select: { id: true },
  }),
)

/**
 * Full club data needed for the public-facing club site.
 * Separate from getClubBySlug to avoid changing its cached select shape.
 */
export const getClubPublicData = cache(async (slug: string, country: string) =>
  prisma.club.findFirst({
    where: { slug, country, status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      slug: true,
      country: true,
      logoUrl: true,
      logoAlt: true,
      welcomeText: true,
      accentColor: true,
      defaultLanguage: true,
      activityType: { select: { slug: true } },
      location: {
        select: {
          swissLocation: {
            select: {
              cantonCode: true,
              translations: { select: { language: true, name: true } },
            },
          },
        },
      },
      pages: {
        where: { isActive: true },
        select: { id: true, slug: true, label: true, isAnchor: true, position: true },
        orderBy: { position: 'asc' },
      },
    },
  }),
)
