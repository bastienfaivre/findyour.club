import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))

vi.mock('@/lib/server/club-queries', () => ({
  getClubBySlug: vi.fn(),
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
    operatorMessage: {
      findFirst: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => {
      return fn({ club: mockClub })
    }),
  },
}))

function mockAuth() {
  return {
    async setup() {
      const { getAuthSession } = await import('@/server/auth')
      const { getClubBySlug, getClubActiveMembership } = await import('@/lib/server/club-queries')
      vi.mocked(getAuthSession).mockResolvedValue({
        user: { id: 'user-1' },
        expires: '',
      } as Awaited<ReturnType<typeof getAuthSession>>)
      vi.mocked(getClubBySlug).mockResolvedValue({ id: 'club-1', name: 'Test Club' } as never)
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

    const { togglePublish } = await import('@/app/[lang]/(country)/[country]/[club]/admin/actions')
    const result = await togglePublish('en', 'ch', 'test-club')

    expect(result).toEqual({ success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' })
  })

  it('returns NOT_FOUND when club does not exist in DB', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.club.findUnique).mockResolvedValue(null)

    const { togglePublish } = await import('@/app/[lang]/(country)/[country]/[club]/admin/actions')
    const result = await togglePublish('en', 'ch', 'test-club')

    expect(result).toEqual({ success: false, error: 'Club not found.', code: 'NOT_FOUND' })
  })

  it('returns FORCE_OFFLINE when forceOffline is true', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.club.findUnique).mockResolvedValue({
      isPublished: false,
      forceOffline: true,
    } as never)

    const { togglePublish } = await import('@/app/[lang]/(country)/[country]/[club]/admin/actions')
    const result = await togglePublish('en', 'ch', 'test-club')

    expect(result).toEqual({
      success: false,
      error: 'Your page has been taken offline by the platform.',
      code: 'FORCE_OFFLINE',
    })
  })

  it('toggles from unpublished to published', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.club.findUnique).mockResolvedValue({
      isPublished: false,
      forceOffline: false,
    } as never)

    const { togglePublish } = await import('@/app/[lang]/(country)/[country]/[club]/admin/actions')
    const result = await togglePublish('en', 'ch', 'test-club')

    expect(result).toEqual({ success: true, data: { isPublished: true } })
    expect(prisma.club.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isPublished: true } }),
    )
  })

  it('toggles from published to unpublished', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.club.findUnique).mockResolvedValue({
      isPublished: true,
      forceOffline: false,
    } as never)

    const { togglePublish } = await import('@/app/[lang]/(country)/[country]/[club]/admin/actions')
    const result = await togglePublish('en', 'ch', 'test-club')

    expect(result).toEqual({ success: true, data: { isPublished: false } })
    expect(prisma.club.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isPublished: false } }),
    )
  })

  it('calls revalidatePath for both public and admin paths', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    const { revalidatePath } = await import('next/cache')
    vi.mocked(prisma.club.findUnique).mockResolvedValue({
      isPublished: false,
      forceOffline: false,
    } as never)

    const { togglePublish } = await import('@/app/[lang]/(country)/[country]/[club]/admin/actions')
    await togglePublish('en', 'ch', 'test-club')

    expect(revalidatePath).toHaveBeenCalledWith('/en/ch/test-club')
    expect(revalidatePath).toHaveBeenCalledWith('/en/ch/test-club/admin')
  })
})

// ── markOperatorMessageAsRead ──

describe('markOperatorMessageAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns UNAUTHORIZED when not authenticated', async () => {
    const { getAuthSession } = await import('@/server/auth')
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const { markOperatorMessageAsRead } = await import('@/app/[lang]/(country)/[country]/[club]/admin/actions')
    const result = await markOperatorMessageAsRead('msg-1', 'en', 'ch', 'test-club')

    expect(result).toEqual({ success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' })
  })

  it('returns NOT_FOUND when message does not exist', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.operatorMessage.findFirst).mockResolvedValue(null)

    const { markOperatorMessageAsRead } = await import('@/app/[lang]/(country)/[country]/[club]/admin/actions')
    const result = await markOperatorMessageAsRead('msg-1', 'en', 'ch', 'test-club')

    expect(result).toEqual({ success: false, error: 'Message not found.', code: 'NOT_FOUND' })
  })

  it('verifies message belongs to the club (multi-tenant check)', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.operatorMessage.findFirst).mockResolvedValue(null)

    const { markOperatorMessageAsRead } = await import('@/app/[lang]/(country)/[country]/[club]/admin/actions')
    await markOperatorMessageAsRead('msg-1', 'en', 'ch', 'test-club')

    expect(prisma.operatorMessage.findFirst).toHaveBeenCalledWith({
      where: { id: 'msg-1', clubId: 'club-1', readAt: null },
    })
  })

  it('sets readAt timestamp on success', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.operatorMessage.findFirst).mockResolvedValue({
      id: 'msg-1',
      clubId: 'club-1',
      message: 'Hello',
      createdAt: new Date(),
      readAt: null,
    } as never)

    const { markOperatorMessageAsRead } = await import('@/app/[lang]/(country)/[country]/[club]/admin/actions')
    const result = await markOperatorMessageAsRead('msg-1', 'en', 'ch', 'test-club')

    expect(result).toEqual({ success: true, data: undefined })
    expect(prisma.operatorMessage.update).toHaveBeenCalledWith({
      where: { id: 'msg-1' },
      data: { readAt: expect.any(Date) },
    })
  })

  it('calls revalidatePath for admin path after marking as read', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    const { revalidatePath } = await import('next/cache')
    vi.mocked(prisma.operatorMessage.findFirst).mockResolvedValue({
      id: 'msg-1',
      clubId: 'club-1',
      message: 'Hello',
      createdAt: new Date(),
      readAt: null,
    } as never)

    const { markOperatorMessageAsRead } = await import('@/app/[lang]/(country)/[country]/[club]/admin/actions')
    await markOperatorMessageAsRead('msg-1', 'en', 'ch', 'test-club')

    expect(revalidatePath).toHaveBeenCalledWith('/en/ch/test-club/admin')
  })

  it('returns NOT_FOUND for already-read message (readAt guard)', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.operatorMessage.findFirst).mockResolvedValue(null)

    const { markOperatorMessageAsRead } = await import('@/app/[lang]/(country)/[country]/[club]/admin/actions')
    const result = await markOperatorMessageAsRead('msg-1', 'en', 'ch', 'test-club')

    expect(result).toEqual({ success: false, error: 'Message not found.', code: 'NOT_FOUND' })
    expect(prisma.operatorMessage.findFirst).toHaveBeenCalledWith({
      where: { id: 'msg-1', clubId: 'club-1', readAt: null },
    })
  })
})
