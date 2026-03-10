import { cache } from 'react'
import { prisma } from '@/server/db'

/**
 * Check if a canton code exists in the database.
 * Cached per request to avoid duplicate DB calls.
 */
export const isValidCanton = cache(async (code: string): Promise<boolean> => {
  const canton = await prisma.swissCanton.findUnique({
    where: { code },
    select: { code: true },
  })
  return canton !== null
})

/**
 * Get canton name for a given code and language.
 */
export const getCantonName = cache(
  async (code: string, lang: string): Promise<string> => {
    const canton = await prisma.swissCanton.findUnique({
      where: { code },
      select: {
        code: true,
        translations: { where: { language: lang }, select: { name: true } },
      },
    })
    return canton?.translations[0]?.name ?? code
  },
)
