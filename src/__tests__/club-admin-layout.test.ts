import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(async () => null),
}))
vi.mock('@/lib/server/club-queries', () => ({
  getClubActiveMembership: vi.fn(),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    club: { findUnique: vi.fn() },
  },
}))
vi.mock('@/components/app/club-admin/AdminDirtyContext', () => ({
  AdminDirtyProvider: vi.fn(({ children }: { children: unknown }) => children),
}))

import { notFound } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { getClubActiveMembership } from '@/lib/server/club-queries'
import { prisma } from '@/server/db'
import ClubAdminLayout from '@/app/[lang]/(dashboard)/club/[clubId]/layout'

const MOCK_CLUB = { id: 'club-1', name: 'Test Club' }

function makeParams(lang = 'en', clubId = 'club-1') {
  return Promise.resolve({ lang, clubId })
}

function mockSession(overrides: Record<string, unknown> = {}) {
  return {
    user: {
      id: 'user-1',
      role: 'CLUB_ADMIN',
      totpEnabled: false,
      totpVerified: true,
      ...overrides,
    },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

describe('Club Admin Layout — membership guard', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns 404 when user is not authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    await expect(ClubAdminLayout({ children: null, params: makeParams() }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('returns 404 when club does not exist', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(mockSession())
    vi.mocked(prisma.club.findUnique).mockResolvedValue(null)
    await expect(ClubAdminLayout({ children: null, params: makeParams() }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('returns 404 when user has no active membership', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(mockSession())
    vi.mocked(prisma.club.findUnique).mockResolvedValue(MOCK_CLUB as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue(null)
    await expect(ClubAdminLayout({ children: null, params: makeParams() }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('renders for ACTIVE OWNER', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(mockSession())
    vi.mocked(prisma.club.findUnique).mockResolvedValue(MOCK_CLUB as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue({ id: 'm1', role: 'OWNER' } as never)
    const result = await ClubAdminLayout({ children: null, params: makeParams() })
    expect(notFound).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('renders for ACTIVE EDITOR', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(mockSession())
    vi.mocked(prisma.club.findUnique).mockResolvedValue(MOCK_CLUB as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue({ id: 'm2', role: 'EDITOR' } as never)
    const result = await ClubAdminLayout({ children: null, params: makeParams() })
    expect(notFound).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('calls getClubActiveMembership with correct user and club IDs', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(mockSession())
    vi.mocked(prisma.club.findUnique).mockResolvedValue(MOCK_CLUB as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue(null)
    await expect(ClubAdminLayout({ children: null, params: makeParams() }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(getClubActiveMembership).toHaveBeenCalledWith('user-1', 'club-1')
  })
})
