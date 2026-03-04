import { cache } from 'react'
import { prisma } from '@/server/db'

/**
 * Cached club lookup — deduplicates identical DB calls within the same request
 * when multiple server components (e.g. layout + page) fetch the same club.
 */
export const getClubBySlug = cache(async (slug: string, country: string) =>
  prisma.club.findUnique({
    where: { slug_country: { slug, country } },
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
