import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    club: { findUnique: vi.fn() },
    clubMembership: { findFirst: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
    invitation: { findFirst: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}))
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { sendEmail } from '@/lib/email'
import { inviteEditor } from '@/app/(country)/[country]/[club]/settings/actions'

const COUNTRY = 'ch'
const SLUG = 'test-club'

function makeFormData(email: string) {
  const fd = new FormData()
  fd.append('email', email)
  return fd
}

const OWNER_SESSION = {
  user: { id: 'owner-id', role: 'CLUB_ADMIN' },
} as never

const CLUB = { id: 'club-1', name: 'Test Club' }
const OWNER_MEMBERSHIP = { id: 'mem-1', role: 'OWNER', status: 'ACTIVE' }

describe('inviteEditor()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.club.findUnique).mockResolvedValue(CLUB as never)
    vi.mocked(prisma.clubMembership.findFirst).mockResolvedValue(OWNER_MEMBERSHIP as never)
    vi.mocked(prisma.clubMembership.create).mockResolvedValue({} as never)
    vi.mocked(prisma.clubMembership.deleteMany).mockResolvedValue({ count: 0 } as never)
    vi.mocked(prisma.invitation.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.invitation.create).mockResolvedValue({} as never)
    vi.mocked(prisma.invitation.deleteMany).mockResolvedValue({ count: 0 } as never)
  })

  it('returns UNAUTHORIZED when not authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    const result = await inviteEditor(COUNTRY, SLUG, null, makeFormData('editor@example.com'))
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns UNAUTHORIZED when club is not found', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(OWNER_SESSION)
    vi.mocked(prisma.club.findUnique).mockResolvedValue(null)
    const result = await inviteEditor(COUNTRY, SLUG, null, makeFormData('editor@example.com'))
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns FORBIDDEN when caller is not an OWNER', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(OWNER_SESSION)
    vi.mocked(prisma.clubMembership.findFirst).mockResolvedValue(null)
    const result = await inviteEditor(COUNTRY, SLUG, null, makeFormData('editor@example.com'))
    expect(result).toMatchObject({ success: false, code: 'FORBIDDEN' })
  })

  it('returns VALIDATION_ERROR for an invalid email', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(OWNER_SESSION)
    const result = await inviteEditor(COUNTRY, SLUG, null, makeFormData('not-an-email'))
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('returns VALIDATION_ERROR for an empty email', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(OWNER_SESSION)
    const result = await inviteEditor(COUNTRY, SLUG, null, makeFormData(''))
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('returns ALREADY_MEMBER when the email already has an ACTIVE membership', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(OWNER_SESSION)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'existing-user',
      memberships: [{ id: 'mem-existing', status: 'ACTIVE' }],
    } as never)
    const result = await inviteEditor(COUNTRY, SLUG, null, makeFormData('existing@example.com'))
    expect(result).toMatchObject({ success: false, code: 'ALREADY_MEMBER' })
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('returns ALREADY_MEMBER when the email has a PENDING membership with a still-valid invitation', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(OWNER_SESSION)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'existing-user',
      memberships: [{ id: 'mem-existing', status: 'PENDING' }],
    } as never)
    vi.mocked(prisma.invitation.findFirst).mockResolvedValue({ id: 'inv-1' } as never)
    const result = await inviteEditor(COUNTRY, SLUG, null, makeFormData('existing@example.com'))
    expect(result).toMatchObject({ success: false, code: 'ALREADY_MEMBER' })
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('cleans up stale PENDING membership and re-invites when the previous invitation has expired', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(OWNER_SESSION)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'existing-user',
      memberships: [{ id: 'mem-stale', status: 'PENDING' }],
    } as never)
    // invitation.findFirst returns null → invitation is expired
    vi.mocked(prisma.invitation.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.invitation.create).mockResolvedValue({} as never)
    vi.mocked(prisma.clubMembership.create).mockResolvedValue({} as never)

    const result = await inviteEditor(COUNTRY, SLUG, null, makeFormData('existing@example.com'))

    expect(result).toMatchObject({ success: true })
    // Cleanup transaction called once (stale cleanup) + create transaction called once
    expect(prisma.clubMembership.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'existing-user', status: 'PENDING' }) })
    )
    expect(prisma.clubMembership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'existing-user', clubId: 'club-1', role: 'EDITOR', status: 'PENDING' }),
      })
    )
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'existing@example.com' })
    )
  })

  it('rolls back membership and invitation and returns SERVER_ERROR when sendEmail fails', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(OWNER_SESSION)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 'new-user-id' } as never)
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error('SMTP error'))

    const result = await inviteEditor(COUNTRY, SLUG, null, makeFormData('newuser@example.com'))

    expect(result).toMatchObject({ success: false, code: 'SERVER_ERROR' })
    expect(prisma.invitation.deleteMany).toHaveBeenCalled()
    expect(prisma.clubMembership.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'new-user-id', status: 'PENDING' }) })
    )
  })

  it('creates a new user, membership, and invitation when the email is unknown — returns success', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(OWNER_SESSION)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 'new-user-id' } as never)

    const result = await inviteEditor(COUNTRY, SLUG, null, makeFormData('newuser@example.com'))

    expect(result).toMatchObject({ success: true })
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: 'newuser@example.com', role: 'CLUB_ADMIN' }) })
    )
    expect(prisma.clubMembership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'new-user-id', clubId: 'club-1', role: 'EDITOR', status: 'PENDING' }),
      })
    )
    expect(prisma.invitation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'newuser@example.com', clubId: 'club-1' }),
      })
    )
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'newuser@example.com' })
    )
  })

  it('reuses an existing user without creating a new one, when the email is known without a membership', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(OWNER_SESSION)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'existing-user-id',
      memberships: [],
    } as never)

    const result = await inviteEditor(COUNTRY, SLUG, null, makeFormData('existing@example.com'))

    expect(result).toMatchObject({ success: true })
    expect(prisma.user.create).not.toHaveBeenCalled()
    expect(prisma.clubMembership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'existing-user-id', clubId: 'club-1', role: 'EDITOR', status: 'PENDING' }),
      })
    )
    expect(prisma.invitation.create).toHaveBeenCalled()
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'existing@example.com' })
    )
  })
})
