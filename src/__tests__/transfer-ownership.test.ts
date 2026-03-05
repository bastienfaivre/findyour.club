import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    club: { findUnique: vi.fn() },
    clubMembership: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}))

import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { transferOwnership } from '@/app/(country)/[country]/[club]/settings/actions'

const COUNTRY = 'ch'
const SLUG = 'test-club'

const OWNER_SESSION = {
  user: { id: 'owner-id', role: 'CLUB_ADMIN' },
} as never

const CLUB = { id: 'club-1', name: 'Test Club' }
const CALLER_MEMBERSHIP = { id: 'caller-mem-1' }
const TARGET_MEMBERSHIP = {
  id: 'target-mem-1',
  userId: 'editor-id',
  clubId: 'club-1',
  role: 'EDITOR',
  status: 'ACTIVE',
}

describe('transferOwnership()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSession).mockResolvedValue(OWNER_SESSION)
    vi.mocked(prisma.club.findUnique).mockResolvedValue(CLUB as never)
    vi.mocked(prisma.clubMembership.findFirst).mockResolvedValue(CALLER_MEMBERSHIP as never)
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue(TARGET_MEMBERSHIP as never)
    vi.mocked(prisma.clubMembership.update).mockResolvedValue({} as never)
  })

  it('returns UNAUTHORIZED when not authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    const result = await transferOwnership(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns UNAUTHORIZED when club is not found', async () => {
    vi.mocked(prisma.club.findUnique).mockResolvedValue(null)
    const result = await transferOwnership(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns FORBIDDEN when caller is not an ACTIVE OWNER', async () => {
    vi.mocked(prisma.clubMembership.findFirst).mockResolvedValue(null)
    const result = await transferOwnership(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'FORBIDDEN' })
  })

  it('returns NOT_FOUND when target membership does not exist', async () => {
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue(null)
    const result = await transferOwnership(COUNTRY, SLUG, 'nonexistent-id')
    expect(result).toMatchObject({ success: false, code: 'NOT_FOUND' })
  })

  it('returns FORBIDDEN when target belongs to a different club', async () => {
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue({
      ...TARGET_MEMBERSHIP,
      clubId: 'other-club-id',
    } as never)
    const result = await transferOwnership(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'FORBIDDEN' })
  })

  it('returns FORBIDDEN when target is the caller themselves', async () => {
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue({
      ...TARGET_MEMBERSHIP,
      userId: 'owner-id', // same as session.user.id
    } as never)
    const result = await transferOwnership(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'FORBIDDEN' })
  })

  it('returns FORBIDDEN when target is not an EDITOR', async () => {
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue({
      ...TARGET_MEMBERSHIP,
      role: 'OWNER',
    } as never)
    const result = await transferOwnership(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'FORBIDDEN' })
  })

  it('returns PENDING_MEMBER when target has PENDING status', async () => {
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue({
      ...TARGET_MEMBERSHIP,
      status: 'PENDING',
    } as never)
    const result = await transferOwnership(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'PENDING_MEMBER' })
    expect(result).toMatchObject({
      error: 'Cannot transfer ownership to a member who has not yet accepted their invitation.',
    })
  })

  it('returns SERVER_ERROR when prisma.$transaction throws', async () => {
    vi.mocked(prisma.$transaction).mockRejectedValueOnce(new Error('DB connection lost'))
    const result = await transferOwnership(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'SERVER_ERROR' })
  })

  it('calls $transaction with two updates and returns success on happy path', async () => {
    const result = await transferOwnership(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)

    expect(result).toMatchObject({ success: true })
    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.clubMembership.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: TARGET_MEMBERSHIP.id }, data: { role: 'OWNER' } }),
    )
    expect(prisma.clubMembership.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: CALLER_MEMBERSHIP.id }, data: { role: 'EDITOR' } }),
    )
  })
})
