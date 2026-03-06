import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => name === 'host' ? 'localhost:3000' : null,
  })),
}))

vi.mock('@/server/db', () => ({
  prisma: {
    application: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    club: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    clubMembership: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(prisma)),
  },
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(),
}))

import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { sendEmail } from '@/lib/email'
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

const PENDING_APPLICATION = {
  id: 'app-1',
  status: 'PENDING',
  country: 'ch',
  name: 'Ski Club Valais',
  email: 'admin@skiclub.ch',
  activityTypeId: 'at-1',
  locationId: 'loc-1',
}

describe('approveApplication()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSession).mockResolvedValue(OPERATOR_SESSION as never)
    vi.mocked(prisma.application.findUnique).mockResolvedValue(PENDING_APPLICATION as never)
    vi.mocked(prisma.club.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.application.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.application.updateMany).mockResolvedValue({ count: 1 } as never)
    vi.mocked(prisma.club.create).mockResolvedValue({
      id: 'club-1', name: 'Ski Club Valais', slug: 'ski-club-valais',
      country: 'ch', defaultLanguage: 'fr',
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 'user-1' } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)
    vi.mocked(prisma.clubMembership.create).mockResolvedValue({} as never)
    vi.mocked(sendEmail).mockResolvedValue(undefined)
  })

  it('provisions club, user, membership and sends email (happy path)', async () => {
    const result = await approveApplication('app-1', 'ski-club-valais')

    expect(result).toEqual({ success: true })
    expect(prisma.application.updateMany).toHaveBeenCalledWith({
      where: { id: 'app-1', status: 'PENDING' },
      data: { status: 'APPROVED', reviewedAt: expect.any(Date), desiredSlug: 'ski-club-valais' },
    })
    expect(prisma.club.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Ski Club Valais',
        slug: 'ski-club-valais',
        country: 'ch',
        status: 'ACTIVE',
        email: 'admin@skiclub.ch',
        activityTypeId: 'at-1',
        locationId: 'loc-1',
        defaultLanguage: 'fr',
      }),
    })
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { email: 'admin@skiclub.ch', role: 'CLUB_ADMIN' },
      select: { id: true },
    })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        magicToken: expect.any(String),
        magicTokenExp: expect.any(Date),
      },
    })
    expect(prisma.clubMembership.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', clubId: 'club-1', role: 'OWNER', status: 'ACTIVE' },
    })
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'admin@skiclub.ch',
      subject: 'Your club site is ready — set up your account',
      html: expect.stringContaining('Ski Club Valais'),
    })
  })

  it('reuses existing user when email matches', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'existing-user' } as never)

    const result = await approveApplication('app-1', 'ski-club-valais')

    expect(result).toEqual({ success: true })
    expect(prisma.user.create).not.toHaveBeenCalled()
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'existing-user' },
      data: expect.objectContaining({ magicToken: expect.any(String) }),
    })
    expect(prisma.clubMembership.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'existing-user' }),
    })
  })

  it('rolls back provisioning and returns EMAIL_FAILED when email fails', async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error('Resend error'))

    const result = await approveApplication('app-1', 'ski-club-valais')

    expect(result).toMatchObject({ success: false, code: 'EMAIL_FAILED' })
    // Compensating transaction should have been called (second $transaction call)
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
    expect(prisma.clubMembership.deleteMany).toHaveBeenCalledWith({ where: { clubId: 'club-1' } })
    expect(prisma.club.delete).toHaveBeenCalledWith({ where: { id: 'club-1' } })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { magicToken: null, magicTokenExp: null },
    })
    expect(prisma.application.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'app-1' },
      data: { status: 'PENDING', reviewedAt: null, desiredSlug: null },
    })
  })

  it('approves with an operator-modified slug', async () => {
    const result = await approveApplication('app-1', 'custom-slug')

    expect(result).toEqual({ success: true })
    expect(prisma.club.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'custom-slug' }),
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
    expect(prisma.club.create).not.toHaveBeenCalled()
  })

  it('returns SLUG_CONFLICT when slug matches another approved application', async () => {
    vi.mocked(prisma.application.findFirst).mockResolvedValue({ id: 'app-2' } as never)

    const result = await approveApplication('app-1', 'taken-slug')

    expect(result).toMatchObject({ success: false, code: 'SLUG_CONFLICT' })
    expect(prisma.club.create).not.toHaveBeenCalled()
  })

  it('returns NOT_FOUND when application does not exist', async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(null)

    const result = await approveApplication('nonexistent', 'some-slug')

    expect(result).toMatchObject({ success: false, code: 'NOT_FOUND' })
  })

  it('returns ALREADY_REVIEWED when application already approved', async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue({ ...PENDING_APPLICATION, status: 'APPROVED' } as never)

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

describe('generateUniqueSlug()', () => {
  it('returns base slug when no conflicts exist', async () => {
    const { generateUniqueSlug } = await import('@/lib/slug')
    const mockTx = {
      club: { findUnique: vi.fn().mockResolvedValue(null) },
      application: { findFirst: vi.fn().mockResolvedValue(null) },
    }

    const slug = await generateUniqueSlug('Ski Club', 'ch', mockTx as never)

    expect(slug).toBe('ski-club')
  })

  it('appends suffix when base slug has conflicts', async () => {
    const { generateUniqueSlug } = await import('@/lib/slug')
    const mockTx = {
      club: {
        findUnique: vi.fn()
          .mockResolvedValueOnce({ id: 'existing' })
          .mockResolvedValueOnce(null),
      },
      application: { findFirst: vi.fn().mockResolvedValue(null) },
    }

    const slug = await generateUniqueSlug('Ski Club', 'ch', mockTx as never)

    expect(slug).toBe('ski-club-2')
  })

  it('increments suffix until unique', async () => {
    const { generateUniqueSlug } = await import('@/lib/slug')
    const mockTx = {
      club: {
        findUnique: vi.fn()
          .mockResolvedValueOnce({ id: 'c1' })
          .mockResolvedValueOnce({ id: 'c2' })
          .mockResolvedValueOnce(null),
      },
      application: { findFirst: vi.fn().mockResolvedValue(null) },
    }

    const slug = await generateUniqueSlug('Ski Club', 'ch', mockTx as never)

    expect(slug).toBe('ski-club-3')
  })
})

describe('inferDefaultLanguage()', () => {
  it('returns fr for ch', async () => {
    const { inferDefaultLanguage } = await import('@/lib/country')
    expect(inferDefaultLanguage('ch')).toBe('fr')
  })

  it('returns en for unknown country', async () => {
    const { inferDefaultLanguage } = await import('@/lib/country')
    expect(inferDefaultLanguage('us')).toBe('en')
  })
})

describe('buildAcceptanceEmailHtml()', () => {
  it('includes club name, club URL, and magic link URL', async () => {
    const { buildAcceptanceEmailHtml } = await import('@/lib/email-templates')
    const html = buildAcceptanceEmailHtml({
      clubName: 'Ski Club Valais',
      clubUrl: 'http://localhost:3000/fr/ch/ski-club-valais',
      magicLinkUrl: 'http://localhost:3000/fr/auth/magic-link?token=abc123',
    })

    expect(html).toContain('Ski Club Valais')
    expect(html).toContain('http://localhost:3000/fr/ch/ski-club-valais')
    expect(html).toContain('http://localhost:3000/fr/auth/magic-link?token=abc123')
    expect(html).toContain('1 hour')
    expect(html).toContain('set your password')
  })

  it('escapes HTML in club name to prevent XSS', async () => {
    const { buildAcceptanceEmailHtml } = await import('@/lib/email-templates')
    const html = buildAcceptanceEmailHtml({
      clubName: '<script>alert(1)</script>',
      clubUrl: 'http://localhost:3000/fr/ch/test',
      magicLinkUrl: 'http://localhost:3000/fr/auth/magic-link?token=abc',
    })

    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('escapes single quotes in parameters', async () => {
    const { buildAcceptanceEmailHtml } = await import('@/lib/email-templates')
    const html = buildAcceptanceEmailHtml({
      clubName: "Club d'Art",
      clubUrl: 'http://localhost:3000/fr/ch/club-dart',
      magicLinkUrl: 'http://localhost:3000/fr/auth/magic-link?token=abc',
    })

    expect(html).toContain('Club d&#39;Art')
  })
})

describe('reserved slug validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSession).mockResolvedValue(OPERATOR_SESSION as never)
    vi.mocked(prisma.application.findUnique).mockResolvedValue(PENDING_APPLICATION as never)
  })

  it('returns SLUG_CONFLICT for reserved slug "admin"', async () => {
    const result = await approveApplication('app-1', 'admin')
    expect(result).toMatchObject({ success: false, code: 'SLUG_CONFLICT' })
    expect(prisma.club.create).not.toHaveBeenCalled()
  })

  it('returns SLUG_CONFLICT for reserved slug "auth"', async () => {
    const result = await approveApplication('app-1', 'auth')
    expect(result).toMatchObject({ success: false, code: 'SLUG_CONFLICT' })
  })
})
