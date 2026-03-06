import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    club: { findFirst: vi.fn() },
    clubMembership: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { revokeAccess } from '@/app/[lang]/(country)/[country]/[club]/settings/actions'

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

describe('revokeAccess()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSession).mockResolvedValue(OWNER_SESSION)
    vi.mocked(prisma.club.findFirst).mockResolvedValue(CLUB as never)
    vi.mocked(prisma.clubMembership.findFirst).mockResolvedValue(CALLER_MEMBERSHIP as never)
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue(TARGET_MEMBERSHIP as never)
    vi.mocked(prisma.clubMembership.delete).mockResolvedValue({} as never)
    vi.mocked(prisma.clubMembership.count).mockResolvedValue(2)
    // Interactive $transaction: call the callback with prisma itself as the tx proxy
    vi.mocked(prisma.$transaction).mockImplementation(
      (fn) => (fn as (tx: typeof prisma) => Promise<unknown>)(prisma),
    )
  })

  it('returns UNAUTHORIZED when not authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    const result = await revokeAccess(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns UNAUTHORIZED when club is not found', async () => {
    vi.mocked(prisma.club.findFirst).mockResolvedValue(null)
    const result = await revokeAccess(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns FORBIDDEN when caller is not an ACTIVE OWNER', async () => {
    vi.mocked(prisma.clubMembership.findFirst).mockResolvedValue(null)
    const result = await revokeAccess(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'FORBIDDEN' })
  })

  it('returns NOT_FOUND when target membership does not exist', async () => {
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue(null)
    const result = await revokeAccess(COUNTRY, SLUG, 'nonexistent-id')
    expect(result).toMatchObject({ success: false, code: 'NOT_FOUND' })
  })

  it('returns FORBIDDEN when target belongs to a different club', async () => {
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue({
      ...TARGET_MEMBERSHIP,
      clubId: 'other-club-id',
    } as never)
    const result = await revokeAccess(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'FORBIDDEN' })
  })

  it('returns FORBIDDEN when target is the caller themselves', async () => {
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue({
      ...TARGET_MEMBERSHIP,
      userId: 'owner-id',
    } as never)
    const result = await revokeAccess(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'FORBIDDEN' })
    expect(result).toMatchObject({ error: 'Cannot revoke your own membership.' })
  })

  it('returns FORBIDDEN when target status is not ACTIVE (e.g. PENDING)', async () => {
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue({
      ...TARGET_MEMBERSHIP,
      status: 'PENDING',
    } as never)
    const result = await revokeAccess(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'FORBIDDEN' })
    expect(result).toMatchObject({ error: 'Can only revoke active memberships.' })
  })

  it('returns LAST_OWNER when revoking the last active Owner', async () => {
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue({
      ...TARGET_MEMBERSHIP,
      role: 'OWNER',
    } as never)
    vi.mocked(prisma.clubMembership.count).mockResolvedValue(1)
    const result = await revokeAccess(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'LAST_OWNER' })
    expect(result).toMatchObject({ error: 'A club must always have at least one active Owner.' })
  })

  it('returns SERVER_ERROR when $transaction throws (e.g. DB connection lost)', async () => {
    vi.mocked(prisma.clubMembership.delete).mockRejectedValueOnce(new Error('DB connection lost'))
    const result = await revokeAccess(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: false, code: 'SERVER_ERROR' })
  })

  it('succeeds when revoking an Owner where another active Owner exists', async () => {
    vi.mocked(prisma.clubMembership.findUnique).mockResolvedValue({
      ...TARGET_MEMBERSHIP,
      role: 'OWNER',
    } as never)
    // count default is 2, so LAST_OWNER guard is not triggered
    const result = await revokeAccess(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: true })
    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.clubMembership.delete).toHaveBeenCalledWith({
      where: { id: TARGET_MEMBERSHIP.id },
    })
  })

  it('deletes the membership and returns success on happy path', async () => {
    const result = await revokeAccess(COUNTRY, SLUG, TARGET_MEMBERSHIP.id)
    expect(result).toMatchObject({ success: true })
    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.clubMembership.delete).toHaveBeenCalledWith({
      where: { id: TARGET_MEMBERSHIP.id },
    })
  })
})
