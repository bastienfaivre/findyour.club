'use server'

import { prisma } from '@/server/db'
import { Prisma } from '@/generated/prisma/client'
import { getAuthSession } from '@/server/auth'

export type ClubViewEntry = {
  clubId: string
  name: string
  slug: string
  country: string
  views: number
}

/**
 * Load club view counts with pagination.
 * Platform-wide query uses $queryRaw to bypass multi-tenant middleware.
 * Access restricted to OPERATOR role.
 */
export async function loadClubViews(
  offset: number,
  limit: number,
  days: number,
): Promise<{ entries: ClubViewEntry[]; total: number }> {
  const session = await getAuthSession()
  if (session?.user?.role !== 'OPERATOR') {
    return { entries: [], total: 0 }
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  type CountRow = { count: bigint }
  type TopRow = { club_id: string; views: bigint }

  const [totalRows, results] = await Promise.all([
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(DISTINCT club_id) as count FROM page_events
      WHERE event_type = 'page_view' AND visited_at >= ${since}`,
    prisma.$queryRaw<TopRow[]>(
      Prisma.sql`
        SELECT club_id, COUNT(*) as views FROM page_events
        WHERE event_type = 'page_view' AND visited_at >= ${since}
        GROUP BY club_id ORDER BY views DESC
        LIMIT ${limit} OFFSET ${offset}`,
    ),
  ])

  const total = Number(totalRows[0]?.count ?? 0)

  if (results.length === 0) return { entries: [], total }

  const clubs = await prisma.club.findMany({
    where: { id: { in: results.map((r) => r.club_id) } },
    select: { id: true, name: true, slug: true, country: true },
  })

  const clubMap = new Map(clubs.map((c) => [c.id, c]))

  const entries = results.map((r) => {
    const club = clubMap.get(r.club_id)
    return {
      clubId: r.club_id,
      name: club?.name ?? 'Unknown',
      slug: club?.slug ?? '',
      country: club?.country ?? '',
      views: Number(r.views),
    }
  })

  return { entries, total }
}
