import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { prisma } from '@/server/db'
import { upsertSwissLocation } from '@/lib/server/location'
import { GET } from '@/app/api/locations/route'
import { type NextRequest } from 'next/server'

vi.mock('@/server/db', () => ({
  prisma: {
    swissLocation: { findUnique: vi.fn(), create: vi.fn() },
    location: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}))

const LOCATION = { id: 'location-1' }

const VALID_INPUT = {
  swisstopoId: '2117',
  plz: '1200',
  cantonCode: 'GE',
  nameFr: 'Genève',
}

// Build a minimal swisstopo response for a given language name
function makeSwisstopoResponse(id: string, name: string) {
  return {
    ok: true,
    json: async () => ({
      results: [
        { id, attrs: { origin: 'gg25', label: `<b>${name} (GE)</b>` } },
      ],
    }),
  } as Response
}

// Build a minimal NextRequest mock for route handler tests
function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/locations')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return { nextUrl: url } as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
  global.fetch = vi.fn() // ensure fetch is always a fresh mock (M3)
  vi.mocked(prisma.swissLocation.findUnique).mockResolvedValue(null)
  vi.mocked(prisma.swissLocation.create).mockResolvedValue({ id: 'swiss-loc-1' } as never)
  vi.mocked(prisma.location.create).mockResolvedValue(LOCATION as never)
  vi.mocked(prisma.$transaction).mockImplementation(async (fn) => fn(prisma as never))
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('upsertSwissLocation', () => {
  it('creates SwissLocation + 4 translations + Location for a new city and returns locationId', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(makeSwisstopoResponse('2117', 'Genève'))  // fr
      .mockResolvedValueOnce(makeSwisstopoResponse('2117', 'Genf'))    // de
      .mockResolvedValueOnce(makeSwisstopoResponse('2117', 'Ginevra')) // it
      .mockResolvedValueOnce(makeSwisstopoResponse('2117', 'Geneva'))  // en

    const result = await upsertSwissLocation(VALID_INPUT)

    expect(result).toEqual({ locationId: 'location-1' })
    expect(prisma.swissLocation.findUnique).toHaveBeenCalledWith({
      where: { swisstopoId: '2117' },
      select: { id: true, location: { select: { id: true } } },
    })
    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.swissLocation.create).toHaveBeenCalledWith({
      data: {
        swisstopoId: '2117',
        plz: '1200',
        cantonCode: 'GE',
        translations: {
          createMany: {
            data: [
              { language: 'fr', name: 'Genève' },
              { language: 'de', name: 'Genf' },
              { language: 'it', name: 'Ginevra' },
              { language: 'en', name: 'Geneva' },
            ],
          },
        },
      },
    })
    expect(prisma.location.create).toHaveBeenCalledWith({
      data: { country: 'ch', swissLocationId: 'swiss-loc-1' },
    })
  })

  it('returns existing locationId without creating new rows when swisstopoId already exists', async () => {
    vi.mocked(prisma.swissLocation.findUnique).mockResolvedValue({
      id: 'existing-swiss-loc-id',
      location: { id: 'existing-location-id' },
    } as never)

    const result = await upsertSwissLocation(VALID_INPUT)

    expect(result).toEqual({ locationId: 'existing-location-id' })
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(prisma.swissLocation.create).not.toHaveBeenCalled()
    expect(prisma.location.create).not.toHaveBeenCalled()
  })

  it('creates only the Location bridge when SwissLocation exists without one (orphaned state)', async () => {
    vi.mocked(prisma.swissLocation.findUnique).mockResolvedValue({
      id: 'orphaned-swiss-loc-id',
      location: null,
    } as never)

    const result = await upsertSwissLocation(VALID_INPUT)

    expect(result).toEqual({ locationId: 'location-1' })
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(prisma.swissLocation.create).not.toHaveBeenCalled()
    expect(prisma.location.create).toHaveBeenCalledWith({
      data: { country: 'ch', swissLocationId: 'orphaned-swiss-loc-id' },
    })
  })

  it('falls back to nameFr when swisstopo API returns no match for a language', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(makeSwisstopoResponse('2117', 'Genève'))  // fr — match
      .mockResolvedValueOnce({                                          // de — no match
        ok: true,
        json: async () => ({ results: [] }),
      } as Response)
      .mockResolvedValueOnce(makeSwisstopoResponse('2117', 'Ginevra')) // it — match
      .mockResolvedValueOnce(makeSwisstopoResponse('2117', 'Geneva'))  // en — match

    const result = await upsertSwissLocation(VALID_INPUT)

    expect(result).toEqual({ locationId: 'location-1' })
    const createCall = vi.mocked(prisma.swissLocation.create).mock.calls[0][0]
    const translations = createCall.data.translations!.createMany!.data as Array<{ language: string; name: string }>
    const deTrans = translations.find(t => t.language === 'de')
    expect(deTrans?.name).toBe('Genève') // fallback to nameFr
  })

  it('falls back to nameFr when fetch throws for a language', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(makeSwisstopoResponse('2117', 'Genève'))  // fr — ok
      .mockRejectedValueOnce(new Error('network error'))               // de — throws
      .mockResolvedValueOnce(makeSwisstopoResponse('2117', 'Ginevra')) // it — ok
      .mockResolvedValueOnce(makeSwisstopoResponse('2117', 'Geneva'))  // en — ok

    const result = await upsertSwissLocation(VALID_INPUT)

    expect(result).toEqual({ locationId: 'location-1' })
    const createCall = vi.mocked(prisma.swissLocation.create).mock.calls[0][0]
    const translations = createCall.data.translations!.createMany!.data as Array<{ language: string; name: string }>
    const deTrans = translations.find(t => t.language === 'de')
    expect(deTrans?.name).toBe('Genève') // fallback to nameFr
  })
})

describe('GET /api/locations', () => {
  it('returns 400 when country param is missing', async () => {
    const req = makeRequest({ q: 'gen' })
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns empty array when country is not ch', async () => {
    const req = makeRequest({ country: 'fr', q: 'paris' })
    const res = await GET(req)
    expect(await res.json()).toEqual([])
  })

  it('returns empty array when q is shorter than 2 chars', async () => {
    const req = makeRequest({ country: 'ch', q: 'g' })
    const res = await GET(req)
    expect(await res.json()).toEqual([])
  })

  it('calls swisstopo with lang=de and returns German city name (AC#3)', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ id: 2117, attrs: { origin: 'gg25', label: '<b>Genf (GE)</b>', detail: '1200 Genève' } }],
      }),
    } as Response)

    const req = makeRequest({ country: 'ch', q: 'genf_de_ac3', lang: 'de' })
    const res = await GET(req)
    const data = await res.json() as Array<{ swisstopoId: string; name: string; cantonCode: string }>

    const fetchUrl = vi.mocked(global.fetch).mock.calls[0][0] as string
    expect(fetchUrl).toContain('lang=de')
    expect(data[0]).toMatchObject({ swisstopoId: '2117', name: 'Genf', cantonCode: 'GE' })
  })

  it('calls swisstopo with lang=fr and returns French city name (AC#4)', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ id: 2117, attrs: { origin: 'gg25', label: '<b>Genève (GE)</b>', detail: '1200 Genève' } }],
      }),
    } as Response)

    const req = makeRequest({ country: 'ch', q: 'geneve_fr_ac4', lang: 'fr' })
    const res = await GET(req)
    const data = await res.json() as Array<{ swisstopoId: string; name: string; cantonCode: string }>

    const fetchUrl = vi.mocked(global.fetch).mock.calls[0][0] as string
    expect(fetchUrl).toContain('lang=fr')
    expect(data[0]).toMatchObject({ swisstopoId: '2117', name: 'Genève', cantonCode: 'GE' })
  })

  it('defaults to lang=en when lang param is invalid', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response)

    const req = makeRequest({ country: 'ch', q: 'badlang_test', lang: 'xx' })
    await GET(req)

    const fetchUrl = vi.mocked(global.fetch).mock.calls[0][0] as string
    expect(fetchUrl).toContain('lang=en')
  })

  it('returns 503 when swisstopo API responds with an error', async () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: false, status: 503 } as Response)

    const req = makeRequest({ country: 'ch', q: 'error_test_q', lang: 'en' })
    const res = await GET(req)
    expect(res.status).toBe(503)
  })
})
