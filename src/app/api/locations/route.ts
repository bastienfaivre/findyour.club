import { type NextRequest } from 'next/server'
import { SWISSTOPO_SEARCH_API } from '@/lib/server/swisstopo-constants'
import { checkRateLimit } from '@/lib/rate-limit'

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
 * Server-side proxy for Swiss locality autocomplete (municipalities + postal code areas).
 * Calls swisstopo SearchServer to avoid CORS and rate-limit exposure.
 * Results are cached in-memory for 5 minutes per query+lang combination.
 * Supports searching by locality name (e.g. "Verbier").
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

  // Accept: gg25 (municipalities), gazetteer settlements (villages like Verbier)
  const seen = new Set<string>()

  return data.results
    .filter(r =>
      r.attrs.origin === 'gg25' ||
      (r.attrs.origin === 'gazetteer' && r.attrs.objectclass === 'TLM_SIEDLUNGSNAME'),
    )
    .map(r => parseSwisstopoResult(r))
    .filter((r): r is SwissLocationResult => {
      if (r === null) return false
      // Deduplicate by name+cantonCode (different origins can refer to the same place)
      const key = `${r.name}:${r.cantonCode}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 10)
}

/**
 * Parse a swisstopo feature into a SwissLocationResult.
 *
 * gg25 (municipalities):          label = "<b>Moutier (JU)</b>"
 * gazetteer (settlements):        label = "<i>Lieu</i> <b>Verbier</b> (VS) - Val de Bagnes"
 */
function parseSwisstopoResult(r: SwisstopoFeature): SwissLocationResult | null {
  const label = r.attrs.label.replace(/<[^>]+>/g, '') // strip HTML tags

  if (r.attrs.origin === 'gazetteer') {
    // Format: "Lieu Verbier (VS) - Val de Bagnes" (after stripping HTML)
    // Extract name before canton, and canton code
    const cantonMatch = label.match(/\(([A-Z]{2})\)/)
    if (!cantonMatch) return null
    const cantonCode = cantonMatch[1]
    // Name is everything before " (XX)" but after any category prefix like "Lieu "
    const beforeCanton = label.slice(0, cantonMatch.index).trim()
    // Remove category prefix (e.g. "Lieu ", "Localité ") — take last meaningful word(s)
    const name = beforeCanton.replace(/^[A-Za-zÀ-ÿ]+\s+/, '').trim() || beforeCanton
    return { swisstopoId: String(r.id), plz: '', name, cantonCode }
  }

  // gg25 (municipality): "Moutier (JU)"
  const cantonMatch = label.match(/\(([A-Z]{2})\)$/)
  if (!cantonMatch) return null
  const cantonCode = cantonMatch[1]
  const name = label.replace(/\s*\([A-Z]{2}\)$/, '').trim()
  const plz = r.attrs.detail?.match(/\d{4}/)?.[0] ?? ''
  // Use featureId (stable municipality BFS number) when available, fall back to r.id
  const swisstopoId = r.attrs.featureId ?? String(r.id)
  return { swisstopoId, plz, name, cantonCode }
}
