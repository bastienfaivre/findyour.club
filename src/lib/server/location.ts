import { prisma } from '@/server/db'
import { SWISSTOPO_SEARCH_API } from './swisstopo-constants'

export type UpsertSwissLocationInput = {
  swisstopoId: string
  plz: string
  cantonCode: string
  displayName: string // localized name used as swisstopo search reference
}

export async function upsertSwissLocation(
  input: UpsertSwissLocationInput,
): Promise<{ locationId: string }> {
  // Idempotency check — also selects `id` to handle orphaned SwissLocation
  const existing = await prisma.swissLocation.findUnique({
    where: { swisstopoId: input.swisstopoId },
    select: { id: true, location: { select: { id: true } } },
  })

  if (existing) {
    if (existing.location) {
      return { locationId: existing.location.id }
    }
    // Orphaned: SwissLocation exists but Location bridge is missing (e.g. prior partial failure)
    const location = await prisma.location.create({
      data: { country: 'ch', swissLocationId: existing.id },
    })
    return { locationId: location.id }
  }

  // Resolve all 4 language names from swisstopo
  const languages = ['fr', 'de', 'it', 'en'] as const
  const translations: { language: string; name: string }[] = []

  for (const lang of languages) {
    try {
      const name = await resolveNameForLanguage(input.swisstopoId, input.displayName, lang)
      translations.push({ language: lang, name })
    } catch {
      // Graceful fallback: use display name if API fails for this language
      translations.push({ language: lang, name: input.displayName })
    }
  }

  // Create all records in a single transaction
  const location = await prisma.$transaction(async (tx) => {
    const swissLoc = await tx.swissLocation.create({
      data: {
        swisstopoId: input.swisstopoId,
        plz: input.plz,
        cantonCode: input.cantonCode,
        translations: { createMany: { data: translations } },
      },
    })
    return tx.location.create({
      data: { country: 'ch', swissLocationId: swissLoc.id },
    })
  })

  return { locationId: location.id }
}

async function resolveNameForLanguage(
  swisstopoId: string,
  displayName: string,
  lang: string,
): Promise<string> {
  const url = new URL(SWISSTOPO_SEARCH_API)
  url.searchParams.set('searchText', displayName)
  url.searchParams.set('type', 'locations')
  url.searchParams.set('lang', lang)
  url.searchParams.set('sr', '4326')
  url.searchParams.set('returnGeometry', 'false')
  url.searchParams.set('limit', '20')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`swisstopo ${lang} lookup failed: ${res.status}`)

  const data = await res.json() as { results: Array<{ id: number | string; attrs: { label: string; origin: string; featureId?: string } }> }
  // Filter to municipalities (gg25) only — match on featureId (stable BFS number)
  const match = data.results.find(r => r.attrs.origin === 'gg25' && (r.attrs.featureId === swisstopoId || String(r.id) === swisstopoId))
  if (!match) throw new Error(`swisstopoId ${swisstopoId} not found in ${lang} results`)

  // Strip HTML and canton suffix: "<b>Genf (GE)</b>" → "Genf"
  return match.attrs.label
    .replace(/<[^>]+>/g, '')
    .replace(/\s*\([A-Z]{2}\)$/, '')
    .trim()
}
