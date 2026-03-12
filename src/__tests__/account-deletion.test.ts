import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ set: vi.fn() })),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    clubMembership: { findMany: vi.fn(), count: vi.fn() },
    user: { delete: vi.fn() },
    $transaction: vi.fn(),
  },
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))

import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { deleteAccount, getAccountDeletionInfo } from '@/app/[lang]/(dashboard)/account/actions'

// ─── getAccountDeletionInfo ──────────────────────────────────────────────────

describe('getAccountDeletionInfo()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when not authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    const result = await getAccountDeletionInfo()
    expect(result).toBeNull()
  })

  it('returns empty arrays when user has no clubs', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([] as never)

    const result = await getAccountDeletionInfo()
    expect(result).toEqual({ soleOwnerClubs: [], otherClubs: [] })
  })

  it('identifies sole-owner clubs correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([
      { role: 'OWNER', club: { id: 'c1', name: 'Club One' } },
    ] as never)
    // No other owners
    vi.mocked(prisma.clubMembership.count).mockResolvedValue(0 as never)

    const result = await getAccountDeletionInfo()
    expect(result).toEqual({
      soleOwnerClubs: [{ id: 'c1', name: 'Club One' }],
      otherClubs: [],
    })
  })

  it('identifies co-owned clubs correctly (puts them in otherClubs)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([
      { role: 'OWNER', club: { id: 'c1', name: 'Club One' } },
    ] as never)
    // Another owner exists
    vi.mocked(prisma.clubMembership.count).mockResolvedValue(1 as never)

    const result = await getAccountDeletionInfo()
    expect(result).toEqual({
      soleOwnerClubs: [],
      otherClubs: [{ id: 'c1', name: 'Club One' }],
    })
  })

  it('identifies editor memberships correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([
      { role: 'EDITOR', club: { id: 'c1', name: 'Club One' } },
    ] as never)

    const result = await getAccountDeletionInfo()
    expect(result).toEqual({
      soleOwnerClubs: [],
      otherClubs: [{ id: 'c1', name: 'Club One' }],
    })
    // count should not be called for editor memberships
    expect(prisma.clubMembership.count).not.toHaveBeenCalled()
  })

  it('handles mix of sole-owner, co-owner, and editor', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([
      { role: 'OWNER', club: { id: 'c1', name: 'Sole Club' } },
      { role: 'OWNER', club: { id: 'c2', name: 'Co-owned Club' } },
      { role: 'EDITOR', club: { id: 'c3', name: 'Editor Club' } },
    ] as never)
    // c1: sole owner (0 other owners), c2: co-owned (1 other owner)
    vi.mocked(prisma.clubMembership.count)
      .mockResolvedValueOnce(0 as never)
      .mockResolvedValueOnce(1 as never)

    const result = await getAccountDeletionInfo()
    expect(result).toEqual({
      soleOwnerClubs: [{ id: 'c1', name: 'Sole Club' }],
      otherClubs: [
        { id: 'c3', name: 'Editor Club' },
        { id: 'c2', name: 'Co-owned Club' },
      ],
    })
  })
})

// ─── deleteAccount ───────────────────────────────────────────────────────────

describe('deleteAccount()', () => {
  beforeEach(() => vi.clearAllMocks())

  function mockTransaction() {
    const txMethods = {
      user: { delete: vi.fn() },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prisma.$transaction as any).mockImplementation(async (fn: (tx: any) => Promise<void>) => {
      await fn(txMethods)
    })
    return txMethods
  }

  it('returns error when not authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    const result = await deleteAccount()
    expect(result).toEqual({ success: false, error: 'Not authenticated.' })
  })

  it('blocks deletion when user is sole owner of a club', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([
      { clubId: 'c1' },
    ] as never)
    // sole owner
    vi.mocked(prisma.clubMembership.count).mockResolvedValue(0 as never)

    const result = await deleteAccount()
    expect(result).toEqual({
      success: false,
      error: 'Please delete or transfer ownership of your clubs before deleting your account.',
    })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('allows deletion when user is co-owner (another owner exists)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([
      { clubId: 'c1' },
    ] as never)
    // co-owned (another owner exists)
    vi.mocked(prisma.clubMembership.count).mockResolvedValue(1 as never)
    const tx = mockTransaction()

    const result = await deleteAccount()

    expect(result).toEqual({ success: true })
    expect(tx.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } })
  })

  it('deletes user when they have no clubs', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([] as never)
    const tx = mockTransaction()

    const result = await deleteAccount()

    expect(result).toEqual({ success: true })
    expect(tx.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } })
  })

  it('clears session cookies on success', async () => {
    const mockCookieSet = vi.fn()
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValueOnce({ set: mockCookieSet } as never)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([] as never)
    mockTransaction()

    await deleteAccount()

    expect(mockCookieSet).toHaveBeenCalledWith(
      'next-auth.session-token',
      '',
      expect.objectContaining({ httpOnly: true, maxAge: 0 }),
    )
    expect(mockCookieSet).toHaveBeenCalledWith(
      '__Secure-next-auth.session-token',
      '',
      expect.objectContaining({ httpOnly: true, maxAge: 0 }),
    )
    expect(mockCookieSet).toHaveBeenCalledWith(
      'totp_verified',
      '',
      expect.objectContaining({ httpOnly: true, maxAge: 0 }),
    )
  })

  it('returns error when transaction fails', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([] as never)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prisma.$transaction as any).mockRejectedValue(new Error('DB error'))

    const result = await deleteAccount()
    expect(result).toEqual({ success: false, error: 'Failed to delete account. Please try again.' })
  })
})
