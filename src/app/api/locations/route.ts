import { type NextRequest, NextResponse } from 'next/server'

// OpenData Swiss municipality API
// Docs: https://swissnames.opendata.swiss / geo.admin.ch
const SWISS_MUNICIPALITIES_API = 'https://nominatim.openstreetmap.org/search'

// In-memory cache: key = `${country}:${q}`, value = { data, expiresAt }
const cache = new Map<string, { data: SwissLocationResult[]; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export type SwissLocationResult = {
  plz: string
  name: string
  canton: string
}

/**
 * GET /api/locations?country=ch&q=<query>
 *
 * Server-side proxy for Swiss municipality autocomplete.
 * Calls OpenData Swiss / Nominatim to avoid CORS and rate-limit exposure.
 * Results are cached in-memory for 5 minutes per query.
 *
 * Returns: Array<{ plz: string; name: string; canton: string }>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const country = searchParams.get('country')?.toLowerCase()
  const q = searchParams.get('q')?.trim() ?? ''

  if (!country) {
    return NextResponse.json({ error: 'country parameter is required' }, { status: 400 })
  }

  if (country !== 'ch') {
    // Only Switzerland is supported in this version; other countries return empty
    return NextResponse.json([])
  }

  if (q.length < 2) {
    return NextResponse.json([])
  }

  const cacheKey = `${country}:${q.toLowerCase()}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data)
  }

  try {
    const results = await fetchSwissLocations(q)
    cache.set(cacheKey, { data: results, expiresAt: Date.now() + CACHE_TTL_MS })
    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: 'Location service unavailable' }, { status: 503 })
  }
}

async function fetchSwissLocations(q: string): Promise<SwissLocationResult[]> {
  const url = new URL(SWISS_MUNICIPALITIES_API)
  url.searchParams.set('q', q)
  url.searchParams.set('countrycodes', 'ch')
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '10')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('featuretype', 'city')

  const res = await fetch(url.toString(), {
    headers: {
      'Accept-Language': 'de,fr,it,en',
      'User-Agent': 'ClashwarePlatform/1.0',
    },
    next: { revalidate: 0 }, // no Next.js caching — we handle it ourselves
  })

  if (!res.ok) {
    throw new Error(`Upstream responded with ${res.status}`)
  }

  const data = await res.json() as NominatimResult[]

  // Deduplicate by plz+name and map to our format
  const seen = new Set<string>()
  const results: SwissLocationResult[] = []

  for (const item of data) {
    const plz = item.address?.postcode ?? ''
    const name = item.address?.city ?? item.address?.town ?? item.address?.village ?? item.name
    const canton = CANTON_CODES[item.address?.state ?? ''] ?? item.address?.state ?? ''

    if (!name) continue
    const key = `${plz}:${name}`
    if (seen.has(key)) continue
    seen.add(key)

    results.push({ plz, name, canton })
  }

  return results
}

type NominatimResult = {
  name: string
  address?: {
    postcode?: string
    city?: string
    town?: string
    village?: string
    state?: string
  }
}

// Map Swiss canton full names → 2-letter codes
const CANTON_CODES: Record<string, string> = {
  'Aargau': 'AG',
  'Appenzell Ausserrhoden': 'AR',
  'Appenzell Innerrhoden': 'AI',
  'Basel-Landschaft': 'BL',
  'Basel-Stadt': 'BS',
  'Bern': 'BE',
  'Fribourg': 'FR',
  'Geneva': 'GE',
  'Glarus': 'GL',
  'Graubünden': 'GR',
  'Jura': 'JU',
  'Lucerne': 'LU',
  'Neuchâtel': 'NE',
  'Nidwalden': 'NW',
  'Obwalden': 'OW',
  'Schaffhausen': 'SH',
  'Schwyz': 'SZ',
  'Solothurn': 'SO',
  'St. Gallen': 'SG',
  'Thurgau': 'TG',
  'Ticino': 'TI',
  'Uri': 'UR',
  'Valais': 'VS',
  'Vaud': 'VD',
  'Zug': 'ZG',
  'Zürich': 'ZH',
}
