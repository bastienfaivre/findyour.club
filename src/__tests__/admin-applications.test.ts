import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/db', () => ({
  prisma: {
    application: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    club: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(prisma)),
  },
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))

import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import {
  approveApplication,
  rejectApplication,
} from '@/app/[lang]/admin/(protected)/applications/actions'

const OPERATOR_SESSION = {
  user: { id: 'op-1', role: 'OPERATOR', totpEnabled: false, totpVerified: true, clubId: null, clubRole: null },
  expires: '2099-01-01',
}

const NON_OPERATOR_SESSION = {
  user: { id: 'u-1', role: 'CLUB_ADMIN', totpEnabled: false, totpVerified: true, clubId: null, clubRole: null },
  expires: '2099-01-01',
}

describe('approveApplication()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSession).mockResolvedValue(OPERATOR_SESSION as never)
    // Default: application exists and is PENDING, no slug conflicts
    vi.mocked(prisma.application.findUnique).mockResolvedValue({ id: 'app-1', status: 'PENDING', country: 'ch' } as never)
    vi.mocked(prisma.club.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.application.findFirst).mockResolvedValue(null)
  })

  it('approves a pending application with slug (happy path)', async () => {
    vi.mocked(prisma.application.updateMany).mockResolvedValue({ count: 1 } as never)

    const result = await approveApplication('app-1', 'test-club')

    expect(result).toEqual({ success: true })
    expect(prisma.application.updateMany).toHaveBeenCalledWith({
      where: { id: 'app-1', status: 'PENDING' },
      data: { status: 'APPROVED', reviewedAt: expect.any(Date), desiredSlug: 'test-club' },
    })
  })

  it('approves with an operator-modified slug', async () => {
    vi.mocked(prisma.application.updateMany).mockResolvedValue({ count: 1 } as never)

    const result = await approveApplication('app-1', 'custom-slug')

    expect(result).toEqual({ success: true })
    expect(prisma.application.updateMany).toHaveBeenCalledWith({
      where: { id: 'app-1', status: 'PENDING' },
      data: { status: 'APPROVED', reviewedAt: expect.any(Date), desiredSlug: 'custom-slug' },
    })
  })

  it('returns SLUG_REQUIRED when slug is empty', async () => {
    const result = await approveApplication('app-1', '')

    expect(result).toMatchObject({ success: false, code: 'SLUG_REQUIRED' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns SLUG_REQUIRED when slug is whitespace only', async () => {
    const result = await approveApplication('app-1', '   ')

    expect(result).toMatchObject({ success: false, code: 'SLUG_REQUIRED' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns SLUG_INVALID for uppercase characters', async () => {
    const result = await approveApplication('app-1', 'My-Club')

    expect(result).toMatchObject({ success: false, code: 'SLUG_INVALID' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns SLUG_INVALID for special characters', async () => {
    const result = await approveApplication('app-1', 'club_name!')

    expect(result).toMatchObject({ success: false, code: 'SLUG_INVALID' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns SLUG_INVALID for leading hyphen', async () => {
    const result = await approveApplication('app-1', '-club')

    expect(result).toMatchObject({ success: false, code: 'SLUG_INVALID' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns SLUG_CONFLICT when slug matches an existing club', async () => {
    vi.mocked(prisma.club.findUnique).mockResolvedValue({ id: 'club-1' } as never)

    const result = await approveApplication('app-1', 'taken-slug')

    expect(result).toMatchObject({ success: false, code: 'SLUG_CONFLICT' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns SLUG_CONFLICT when slug matches another approved application', async () => {
    vi.mocked(prisma.application.findFirst).mockResolvedValue({ id: 'app-2' } as never)

    const result = await approveApplication('app-1', 'taken-slug')

    expect(result).toMatchObject({ success: false, code: 'SLUG_CONFLICT' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns NOT_FOUND when application does not exist', async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(null)

    const result = await approveApplication('nonexistent', 'some-slug')

    expect(result).toMatchObject({ success: false, code: 'NOT_FOUND' })
  })

  it('returns ALREADY_REVIEWED when application already approved', async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue({ id: 'app-1', status: 'APPROVED', country: 'ch' } as never)

    const result = await approveApplication('app-1', 'some-slug')

    expect(result).toMatchObject({ success: false, code: 'ALREADY_REVIEWED' })
  })

  it('returns UNAUTHORIZED for non-OPERATOR user', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(NON_OPERATOR_SESSION as never)

    const result = await approveApplication('app-1', 'some-slug')

    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns UNAUTHORIZED when not authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const result = await approveApplication('app-1', 'some-slug')

    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns SERVER_ERROR when database update fails', async () => {
    vi.mocked(prisma.application.updateMany).mockRejectedValue(new Error('DB error'))

    const result = await approveApplication('app-1', 'some-slug')

    expect(result).toMatchObject({ success: false, code: 'SERVER_ERROR' })
  })
})

describe('rejectApplication()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSession).mockResolvedValue(OPERATOR_SESSION as never)
  })

  it('rejects a pending application with reason (happy path)', async () => {
    vi.mocked(prisma.application.updateMany).mockResolvedValue({ count: 1 } as never)

    const result = await rejectApplication('app-1', 'Not a real club')

    expect(result).toEqual({ success: true })
    expect(prisma.application.updateMany).toHaveBeenCalledWith({
      where: { id: 'app-1', status: 'PENDING' },
      data: {
        status: 'REJECTED',
        rejectionReason: 'Not a real club',
        reviewedAt: expect.any(Date),
      },
    })
  })

  it('rejects a pending application without reason', async () => {
    vi.mocked(prisma.application.updateMany).mockResolvedValue({ count: 1 } as never)

    const result = await rejectApplication('app-1')

    expect(result).toEqual({ success: true })
    expect(prisma.application.updateMany).toHaveBeenCalledWith({
      where: { id: 'app-1', status: 'PENDING' },
      data: {
        status: 'REJECTED',
        rejectionReason: null,
        reviewedAt: expect.any(Date),
      },
    })
  })

  it('returns NOT_FOUND when application does not exist', async () => {
    vi.mocked(prisma.application.updateMany).mockResolvedValue({ count: 0 } as never)
    vi.mocked(prisma.application.findUnique).mockResolvedValue(null)

    const result = await rejectApplication('nonexistent')

    expect(result).toMatchObject({ success: false, code: 'NOT_FOUND' })
  })

  it('returns ALREADY_REVIEWED when application already rejected', async () => {
    vi.mocked(prisma.application.updateMany).mockResolvedValue({ count: 0 } as never)
    vi.mocked(prisma.application.findUnique).mockResolvedValue({ id: 'app-1' } as never)

    const result = await rejectApplication('app-1')

    expect(result).toMatchObject({ success: false, code: 'ALREADY_REVIEWED' })
  })

  it('returns UNAUTHORIZED for non-OPERATOR user', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(NON_OPERATOR_SESSION as never)

    const result = await rejectApplication('app-1')

    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns SERVER_ERROR when database update fails', async () => {
    vi.mocked(prisma.application.updateMany).mockRejectedValue(new Error('DB error'))

    const result = await rejectApplication('app-1')

    expect(result).toMatchObject({ success: false, code: 'SERVER_ERROR' })
  })
})
