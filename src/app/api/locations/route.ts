import { type NextRequest } from 'next/server'
import { SWISSTOPO_SEARCH_API } from '@/lib/server/swisstopo-constants'

// In-memory cache: key = `${country}:${lang}:${q}`, value = { data, expiresAt }
const cache = new Map<string, { data: SwissLocationResult[]; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 500

export type SwissLocationResult = {
  swisstopoId: string // swisstopo feature id (e.g. "2117")
  plz: string        // postal code
  name: string       // localized city name for the requested lang
  cantonCode: string // 2-letter canton code, e.g. "GE"
}

const VALID_LANGS = new Set(['en', 'fr', 'de', 'it'])

/**
 * GET /api/locations?country=ch&q=<query>&lang=<lang>
 *
 * Server-side proxy for Swiss municipality autocomplete.
 * Calls swisstopo SearchServer to avoid CORS and rate-limit exposure.
 * Results are cached in-memory for 5 minutes per query+lang combination.
 *
 * Returns: Array<{ swisstopoId: string; plz: string; name: string; cantonCode: string }>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const country = searchParams.get('country')?.toLowerCase()
  const q = searchParams.get('q')?.trim() ?? ''
  const rawLang = searchParams.get('lang')?.toLowerCase() ?? 'en'
  const lang = VALID_LANGS.has(rawLang) ? rawLang : 'en'

  if (!country) {
    return Response.json({ error: 'country parameter is required' }, { status: 400 })
  }

  if (country !== 'ch') {
    // Only Switzerland is supported in this version; other countries return empty
    return Response.json([])
  }

  if (q.length < 2) {
    return Response.json([])
  }

  const cacheKey = `${country}:${lang}:${q.toLowerCase()}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return Response.json(cached.data)
  }

  try {
    const results = await fetchSwissLocations(q, lang)
    // Evict the oldest entry before inserting if at capacity
    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value
      if (oldestKey !== undefined) cache.delete(oldestKey)
    }
    cache.set(cacheKey, { data: results, expiresAt: Date.now() + CACHE_TTL_MS })
    return Response.json(results)
  } catch {
    return Response.json({ error: 'Location service unavailable' }, { status: 503 })
  }
}

type SwisstopoFeature = {
  id: number | string
  attrs: {
    origin: string
    label: string
    detail?: string
  }
}

async function fetchSwissLocations(q: string, lang: string): Promise<SwissLocationResult[]> {
  const url = new URL(SWISSTOPO_SEARCH_API)
  url.searchParams.set('searchText', q)
  url.searchParams.set('type', 'locations')
  url.searchParams.set('lang', lang)
  url.searchParams.set('sr', '4326')
  url.searchParams.set('returnGeometry', 'false')
  url.searchParams.set('limit', '10')

  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`swisstopo responded with ${res.status}`)

  const data = await res.json() as { results: SwisstopoFeature[] }

  return data.results
    .filter(r => r.attrs.origin === 'gg25') // municipalities only
    .map(r => {
      const label = r.attrs.label.replace(/<[^>]+>/g, '') // strip HTML tags
      const cantonMatch = label.match(/\(([A-Z]{2})\)$/)
      const cantonCode = cantonMatch?.[1] ?? ''
      const name = label.replace(/\s*\([A-Z]{2}\)$/, '').trim()
      const plz = r.attrs.detail?.match(/\d{4}/)?.[0] ?? ''
      return { swisstopoId: String(r.id), plz, name, cantonCode }
    })
    .filter(r => r.cantonCode !== '') // discard malformed results
}
