import { describe, it, expect, vi, beforeEach } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'

vi.mock('@/server/db', () => ({
  prisma: {
    club: { findFirst: vi.fn() },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  },
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))

import { GET } from '@/app/api/club/[clubId]/export/route'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'

const mockGetAuthSession = getAuthSession as ReturnType<typeof vi.fn>
const mockClubFindFirst = prisma.club.findFirst as ReturnType<typeof vi.fn>

// Mock global fetch for image downloads
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const fakeImageData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]) // PNG header bytes

function setupFetchMock() {
  mockFetch.mockImplementation(async (url: string) => {
    // Let the route handler's own request go through for the test call
    if (url === 'http://localhost') return undefined
    // Return fake image data with appropriate Content-Type
    const contentType = url.endsWith('.png') ? 'image/png' : 'image/jpeg'
    return new Response(fakeImageData, {
      status: 200,
      headers: { 'Content-Type': contentType },
    })
  })
}

const mockClub = {
  name: 'Ski Club',
  slug: 'ski-club',
  country: 'ch',
  email: 'ski@example.com',
  activityType: 'skiing',
  description: 'A ski club',
  schedule: 'Weekends',
  howToJoin: 'Apply',
  contactPhone: '+41791234567',
  contactAddress: '123 Main St',
  externalWebsiteUrl: 'https://ski.example.com',
  instagramUrl: null,
  facebookUrl: null,
  xUrl: null,
  tiktokUrl: null,
  discordUrl: null,
  youtubeUrl: null,
  whatsappUrl: null,
  telegramUrl: null,
  githubUrl: null,
  isPublished: true,
  accentColor: 'blue',
  defaultLanguage: 'fr',
  createdAt: new Date('2026-01-01'),
  logoUrl: 'https://cdn.example.com/logo.png',
  logoAlt: 'Ski Club Logo',
  location: {
    swissLocation: {
      cantonCode: 'VS',
      translations: [{ language: 'fr', name: 'Sion' }],
    },
  },
  photos: [
    { url: 'https://cdn.example.com/photo1.jpg', alt: 'Mountain', position: 0 },
  ],
  supportMessages: [
    { senderRole: 'USER', body: 'Hello!', createdAt: new Date('2026-01-02') },
  ],
}

function callGET(clubId = 'club-1') {
  return GET(new Request('http://localhost'), {
    params: Promise.resolve({ clubId }),
  })
}

async function extractZip(response: Response) {
  const buffer = await response.arrayBuffer()
  const files = unzipSync(new Uint8Array(buffer))
  return files
}

async function extractData(response: Response) {
  const files = await extractZip(response)
  const json = strFromU8(files['data.json'])
  return JSON.parse(json)
}

describe('GET /api/club/[clubId]/export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupFetchMock()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetAuthSession.mockResolvedValue(null)

    const response = await callGET()

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 403 when user is not OWNER or club not found', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockClubFindFirst.mockResolvedValue(null)

    const response = await callGET()

    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toBe('Forbidden')
  })

  it('returns 200 ZIP archive with data.json for valid owner', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockClubFindFirst.mockResolvedValue(mockClub)

    const response = await callGET()

    expect(response.status).toBe(200)
    const data = await extractData(response)
    expect(data.version).toBe('2.0')
    expect(data.exportedAt).toBeDefined()
  })

  it('has Content-Disposition header with correct filename', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockClubFindFirst.mockResolvedValue(mockClub)

    const response = await callGET()

    const disposition = response.headers.get('Content-Disposition')
    expect(disposition).toContain('attachment')
    expect(disposition).toContain('ski-club-export-')
    expect(disposition).toMatch(/ski-club-export-\d{4}-\d{2}-\d{2}\.zip/)
    expect(response.headers.get('Content-Type')).toBe('application/zip')
  })

  it('includes club metadata, logo reference, photo references, and messages in data.json', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockClubFindFirst.mockResolvedValue(mockClub)

    const response = await callGET()
    const data = await extractData(response)

    expect(data.club.name).toBe('Ski Club')
    expect(data.club.slug).toBe('ski-club')
    expect(data.logo).toEqual({
      file: 'logo.png',
      alt: 'Ski Club Logo',
    })
    expect(data.photos).toEqual([]) // photos disabled temporarily
    expect(data.messages).toEqual([
      {
        senderRole: 'USER',
        body: 'Hello!',
        createdAt: new Date('2026-01-02').toISOString(),
      },
    ])
  })

  it('includes actual image files in the ZIP archive', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockClubFindFirst.mockResolvedValue(mockClub)

    const response = await callGET()
    const files = await extractZip(response)

    expect(files['logo.png']).toBeDefined()
    // expect(files['photos/0.jpg']).toBeDefined() // photos disabled temporarily
    expect(files['data.json']).toBeDefined()
    // Verify the image content matches what fetch returned
    expect(Array.from(files['logo.png'])).toEqual(Array.from(fakeImageData))
  })

  it('handles null location gracefully', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockClubFindFirst.mockResolvedValue({ ...mockClub, location: null })

    const response = await callGET()

    expect(response.status).toBe(200)
    const data = await extractData(response)
    expect(data.club.name).toBe('Ski Club')
    expect(data.club.location).toBeNull()
  })

  it('handles null logoUrl by setting logo to null and excluding logo file', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockClubFindFirst.mockResolvedValue({ ...mockClub, logoUrl: null, logoAlt: null })

    const response = await callGET()

    expect(response.status).toBe(200)
    const data = await extractData(response)
    expect(data.logo).toBeNull()

    const files = await extractZip(
      await callGET() // call again since response was consumed
    )
    expect(files['logo.png']).toBeUndefined()
  })
})
