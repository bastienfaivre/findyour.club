import { type NextRequest } from 'next/server'
import { SWISSTOPO_SEARCH_API } from '@/lib/server/swisstopo-constants'
import { checkRateLimit } from '@/lib/rate-limit'

// In-memory cache: key = `${country}:${lang}:${q}`, value = { data, expiresAt }
const cache = new Map<string, { data: SwissLocationResult[]; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 500

export type SwissLocationResult = {
  swisstopoId: string // swisstopo feature id (BFS number)
  name: string       // localized municipality name for the requested lang
  cantonCode: string // 2-letter canton code, e.g. "GE"
}

const VALID_LANGS = new Set(['en', 'fr', 'de', 'it'])

/**
 * GET /api/locations?country=ch&q=<query>&lang=<lang>
 *
 * Server-side proxy for Swiss locality autocomplete (municipalities + postal code areas).
 * Calls swisstopo SearchServer to avoid CORS and rate-limit exposure.
 * Results are cached in-memory for 5 minutes per query+lang combination.
 * Supports searching by locality name (e.g. "Verbier").
 *
 * Returns: Array<{ swisstopoId: string; name: string; cantonCode: string }>
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

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'
  if (checkRateLimit('locations:' + ip, { windowMs: 60_000, maxAttempts: 30 })) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
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
    featureId?: string
    objectclass?: string
  }
}

async function fetchSwissLocations(q: string, lang: string): Promise<SwissLocationResult[]> {
  const url = new URL(SWISSTOPO_SEARCH_API)
  url.searchParams.set('searchText', q)
  url.searchParams.set('type', 'locations')
  url.searchParams.set('lang', lang)
  url.searchParams.set('sr', '4326')
  url.searchParams.set('returnGeometry', 'false')
  url.searchParams.set('limit', '20')

  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`swisstopo responded with ${res.status}`)

  const data = await res.json() as { results: SwisstopoFeature[] }

  // Only accept gg25 (official municipalities) — stable BFS IDs, consistent data
  // Deduplicate by swisstopoId, keeping the longest name variant
  // (bilingual names like "Biel/Bienne" are more complete than "Bienne" alone)
  const byId = new Map<string, SwissLocationResult>()

  for (const r of data.results) {
    if (r.attrs.origin !== 'gg25') continue
    const parsed = parseSwisstopoResult(r)
    if (!parsed) continue
    const existing = byId.get(parsed.swisstopoId)
    if (!existing || parsed.name.length > existing.name.length) {
      byId.set(parsed.swisstopoId, parsed)
    }
  }

  return Array.from(byId.values()).slice(0, 10)
}

/**
 * Parse a swisstopo gg25 feature into a SwissLocationResult.
 *
 * gg25 (municipalities): label = "<b>Moutier (JU)</b>"
 */
function parseSwisstopoResult(r: SwisstopoFeature): SwissLocationResult | null {
  const label = r.attrs.label.replace(/<[^>]+>/g, '') // strip HTML tags

  // gg25 (municipality): "Moutier (JU)"
  const cantonMatch = label.match(/\(([A-Z]{2})\)$/)
  if (!cantonMatch) return null
  const cantonCode = cantonMatch[1]
  const name = label.replace(/\s*\([A-Z]{2}\)$/, '').trim()
  // Use featureId (stable municipality BFS number) when available, fall back to r.id
  const swisstopoId = r.attrs.featureId ?? String(r.id)
  return { swisstopoId, name, cantonCode }
}
