import { cache } from 'react'
import { prisma } from '@/server/db'

/**
 * Fetch a page by slug within a club.
 * Requires clubId directly to satisfy the multi-tenant Prisma middleware.
 * Returns null if the page doesn't exist, is inactive, or is an anchor page.
 * Includes page elements ordered by position.
 */
export const getPageBySlug = cache(async (pageSlug: string, clubId: string) =>
  prisma.page.findFirst({
    where: {
      slug: pageSlug,
      clubId,
      isActive: true,
      isAnchor: false,
    },
    select: {
      id: true,
      slug: true,
      label: true,
      elements: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          type: true,
          position: true,
          data: true,
        },
      },
    },
  }),
)

/**
 * Fetch elements for the club's "home" page (slug = 'home').
 * Returns an empty array if no home page exists or it has no elements.
 */
export const getHomePageElements = cache(async (clubId: string) => {
  const page = await prisma.page.findFirst({
    where: {
      clubId,
      slug: 'home',
      isActive: true,
    },
    select: {
      elements: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          type: true,
          position: true,
          data: true,
        },
      },
    },
  })
  return page?.elements ?? []
})
