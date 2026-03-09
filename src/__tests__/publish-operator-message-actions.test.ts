import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))

vi.mock('@/lib/server/club-queries', () => ({
  getClubActiveMembership: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const mockClub = {
  findUnique: vi.fn(),
  update: vi.fn().mockResolvedValue({}),
}

vi.mock('@/server/db', () => ({
  prisma: {
    club: mockClub,
    conversationReadCursor: {
      upsert: vi.fn().mockResolvedValue({}),
    },
    clubPhoto: { count: vi.fn().mockResolvedValue(5) },
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => {
      return fn({ club: mockClub, clubPhoto: { count: vi.fn().mockResolvedValue(5) } })
    }),
  },
}))

function mockAuth() {
  return {
    async setup() {
      const { getAuthSession } = await import('@/server/auth')
      const { getClubActiveMembership } = await import('@/lib/server/club-queries')
      vi.mocked(getAuthSession).mockResolvedValue({
        user: { id: 'user-1' },
        expires: '',
      } as Awaited<ReturnType<typeof getAuthSession>>)
      vi.mocked(mockClub.findUnique).mockResolvedValue({ id: 'club-1', name: 'Test Club', slug: 'test-club', country: 'ch' } as never)
      vi.mocked(getClubActiveMembership).mockResolvedValue({ id: 'mem-1', role: 'OWNER' } as never)
    },
  }
}

// ── togglePublish ──

describe('togglePublish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns UNAUTHORIZED when not authenticated', async () => {
    const { getAuthSession } = await import('@/server/auth')
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const { togglePublish } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await togglePublish('club-1')

    expect(result).toEqual({ success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' })
  })

  it('returns NOT_FOUND when club does not exist in DB', async () => {
    const { getAuthSession } = await import('@/server/auth')
    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'user-1' },
      expires: '',
    } as Awaited<ReturnType<typeof getAuthSession>>)
    vi.mocked(mockClub.findUnique).mockResolvedValue(null)

    const { togglePublish } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await togglePublish('club-1')

    expect(result).toEqual({ success: false, error: 'Club not found.', code: 'NOT_FOUND' })
  })

  it('returns FORCE_OFFLINE when forceOffline is true', async () => {
    await mockAuth().setup()
    // First call returns club info (authGuard), second call returns publish state ($transaction)
    vi.mocked(mockClub.findUnique)
      .mockResolvedValueOnce({ id: 'club-1', name: 'Test Club', slug: 'test-club', country: 'ch' } as never)
      .mockResolvedValueOnce({ isPublished: false, forceOffline: true } as never)

    const { togglePublish } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await togglePublish('club-1')

    expect(result).toEqual({
      success: false,
      error: 'Your page has been taken offline by the platform.',
      code: 'FORCE_OFFLINE',
    })
  })

  it('toggles from offline to online', async () => {
    await mockAuth().setup()
    vi.mocked(mockClub.findUnique)
      .mockResolvedValueOnce({ id: 'club-1', name: 'Test Club', slug: 'test-club', country: 'ch' } as never)
      .mockResolvedValueOnce({ isPublished: false, forceOffline: false } as never)

    const { togglePublish } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await togglePublish('club-1')

    expect(result).toEqual({ success: true, data: { isPublished: true } })
    expect(mockClub.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isPublished: true } }),
    )
  })

  it('toggles from online to offline', async () => {
    await mockAuth().setup()
    vi.mocked(mockClub.findUnique)
      .mockResolvedValueOnce({ id: 'club-1', name: 'Test Club', slug: 'test-club', country: 'ch' } as never)
      .mockResolvedValueOnce({ isPublished: true, forceOffline: false } as never)

    const { togglePublish } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await togglePublish('club-1')

    expect(result).toEqual({ success: true, data: { isPublished: false } })
    expect(mockClub.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isPublished: false } }),
    )
  })

  it('calls revalidatePath after toggling', async () => {
    await mockAuth().setup()
    const { revalidatePath } = await import('next/cache')
    vi.mocked(mockClub.findUnique)
      .mockResolvedValueOnce({ id: 'club-1', name: 'Test Club', slug: 'test-club', country: 'ch' } as never)
      .mockResolvedValueOnce({ isPublished: false, forceOffline: false } as never)

    const { togglePublish } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    await togglePublish('club-1')

    expect(revalidatePath).toHaveBeenCalledWith('/[lang]/[country]/[club]', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/[lang]/admin', 'layout')
  })
})
