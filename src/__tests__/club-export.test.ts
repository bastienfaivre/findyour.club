import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/db', () => ({
  prisma: {
    clubMembership: { findFirst: vi.fn() },
    club: { findUnique: vi.fn() },
  },
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))

import { GET } from '@/app/api/club/[clubId]/export/route'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'

const mockGetAuthSession = getAuthSession as ReturnType<typeof vi.fn>
const mockFindFirst = prisma.clubMembership.findFirst as ReturnType<typeof vi.fn>
const mockFindUnique = prisma.club.findUnique as ReturnType<typeof vi.fn>

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
  isPublished: true,
  accentColor: 'blue',
  defaultLanguage: 'fr',
  createdAt: new Date('2026-01-01'),
  logoUrl: 'https://cdn.example.com/logo.png',
  logoAlt: 'Ski Club Logo',
  location: {
    swissLocation: {
      plz: 1950,
      cantonCode: 'VS',
      translations: [{ language: 'fr', name: 'Sion' }],
    },
  },
  photos: [
    { url: 'https://cdn.example.com/photo1.jpg', alt: 'Mountain', position: 0 },
  ],
  supportMessages: [
    { senderRole: 'OPERATOR', body: 'Welcome!', createdAt: new Date('2026-01-02') },
  ],
}

function callGET(clubId = 'club-1') {
  return GET(new Request('http://localhost'), {
    params: Promise.resolve({ clubId }),
  })
}

describe('GET /api/club/[clubId]/export', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetAuthSession.mockResolvedValue(null)

    const response = await callGET()

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 403 when user is not OWNER', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindFirst.mockResolvedValue(null)

    const response = await callGET()

    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toBe('Forbidden')
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', clubId: 'club-1', status: 'ACTIVE', role: 'OWNER' },
      select: { id: true },
    })
  })

  it('returns 404 when club not found', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindFirst.mockResolvedValue({ id: 'membership-1' })
    mockFindUnique.mockResolvedValue(null)

    const response = await callGET()

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe('Not found')
  })

  it('returns 200 with JSON export data for valid owner', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindFirst.mockResolvedValue({ id: 'membership-1' })
    mockFindUnique.mockResolvedValue(mockClub)

    const response = await callGET()

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.version).toBe('1.0')
    expect(body.exportedAt).toBeDefined()
  })

  it('has Content-Disposition header with correct filename', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindFirst.mockResolvedValue({ id: 'membership-1' })
    mockFindUnique.mockResolvedValue(mockClub)

    const response = await callGET()

    const disposition = response.headers.get('Content-Disposition')
    expect(disposition).toContain('attachment')
    expect(disposition).toContain('ski-club-export-')
    expect(disposition).toMatch(/ski-club-export-\d{4}-\d{2}-\d{2}\.json/)
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })

  it('export data includes club metadata, logo, photos, messages', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindFirst.mockResolvedValue({ id: 'membership-1' })
    mockFindUnique.mockResolvedValue(mockClub)

    const response = await callGET()
    const body = await response.json()

    expect(body.club.name).toBe('Ski Club')
    expect(body.club.slug).toBe('ski-club')
    expect(body.logo).toEqual({
      url: 'https://cdn.example.com/logo.png',
      alt: 'Ski Club Logo',
    })
    expect(body.photos).toEqual([
      { url: 'https://cdn.example.com/photo1.jpg', alt: 'Mountain', position: 0 },
    ])
    expect(body.messages).toEqual([
      {
        senderRole: 'OPERATOR',
        body: 'Welcome!',
        createdAt: new Date('2026-01-02').toISOString(),
      },
    ])
  })

  it('handles null location gracefully', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindFirst.mockResolvedValue({ id: 'membership-1' })
    mockFindUnique.mockResolvedValue({ ...mockClub, location: null })

    const response = await callGET()

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.club.name).toBe('Ski Club')
  })

  it('handles null logoUrl by setting logo to null', async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindFirst.mockResolvedValue({ id: 'membership-1' })
    mockFindUnique.mockResolvedValue({ ...mockClub, logoUrl: null, logoAlt: null })

    const response = await callGET()

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.logo).toBeNull()
  })
})
