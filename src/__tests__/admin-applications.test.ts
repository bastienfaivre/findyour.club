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
    supportMessage: {
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
vi.mock('@/lib/server/location', () => ({
  upsertSwissLocation: vi.fn(async () => ({ locationId: 'loc-1' })),
}))

import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { sendEmail } from '@/lib/email'
import {
  approveApplication,
  rejectApplication,
} from '@/app/[lang]/(dashboard)/admin/applications/actions'
import type { ApplicationEditableFields } from '@/app/[lang]/(dashboard)/admin/applications/actions'

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
  activityType: 'skiing',
  locationId: 'loc-1',
  description: 'A great ski club in Valais',
  schedule: 'Saturdays 09:00–12:00',
  contactPhone: '+41 27 123 45 67',
  contactAddress: 'Rue de la Gare 1, 1950 Sion',
  howToJoin: 'Send us an email',
  externalWebsiteUrl: 'https://skiclub-valais.ch',
}

const DEFAULT_FIELDS: ApplicationEditableFields = {
  name: 'Ski Club Valais',
  email: 'admin@skiclub.ch',
  country: 'ch',
  description: 'A great ski club in Valais',
  activityType: 'skiing',
  location: { swisstopoId: '2117', plz: '1950', cantonCode: 'VS', name: 'Sion' },
  schedule: 'Saturdays 09:00–12:00',
  contactPhone: '+41 27 123 45 67',
  contactAddress: 'Rue de la Gare 1, 1950 Sion',
  howToJoin: 'Send us an email',
  externalWebsiteUrl: 'https://skiclub-valais.ch',
  desiredSlug: 'ski-club-valais',
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
    vi.mocked(prisma.supportMessage.create).mockResolvedValue({} as never)
    vi.mocked(sendEmail).mockResolvedValue(undefined)
  })

  it('provisions club, user, membership and sends email (happy path)', async () => {
    const result = await approveApplication('app-1', DEFAULT_FIELDS)

    expect(result).toEqual({ success: true })
    expect(prisma.application.updateMany).toHaveBeenCalledWith({
      where: { id: 'app-1', status: 'PENDING' },
      data: expect.objectContaining({
        status: 'APPROVED',
        reviewedAt: expect.any(Date),
        desiredSlug: 'ski-club-valais',
        name: 'Ski Club Valais',
        email: 'admin@skiclub.ch',
      }),
    })
    expect(prisma.club.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Ski Club Valais',
        slug: 'ski-club-valais',
        country: 'ch',
        status: 'ACTIVE',
        email: 'admin@skiclub.ch',
        activityType: 'skiing',
        locationId: 'loc-1', // resolved via upsertSwissLocation mock
        defaultLanguage: 'fr',
        description: 'A great ski club in Valais',
        schedule: 'Saturdays 09:00–12:00',
        contactPhone: '+41 27 123 45 67',
        contactAddress: 'Rue de la Gare 1, 1950 Sion',
        howToJoin: 'Send us an email',
        externalWebsiteUrl: 'https://skiclub-valais.ch',
        isPublished: false,
        forceOffline: false,
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

  it('uses operator-edited fields for club creation', async () => {
    const editedFields: ApplicationEditableFields = {
      ...DEFAULT_FIELDS,
      name: 'Corrected Club Name',
      email: 'corrected@skiclub.ch',
      description: 'Updated description',
    }

    vi.mocked(prisma.club.create).mockResolvedValue({
      id: 'club-1', name: 'Corrected Club Name', slug: 'ski-club-valais',
      country: 'ch', defaultLanguage: 'fr',
    } as never)

    const result = await approveApplication('app-1', editedFields)

    expect(result).toEqual({ success: true })
    expect(prisma.club.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Corrected Club Name',
        email: 'corrected@skiclub.ch',
        description: 'Updated description',
      }),
    })
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'corrected@skiclub.ch' },
      select: { id: true },
    })
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'corrected@skiclub.ch' }),
    )
  })

  it('reuses existing user when email matches', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'existing-user' } as never)

    const result = await approveApplication('app-1', DEFAULT_FIELDS)

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

    const result = await approveApplication('app-1', DEFAULT_FIELDS)

    expect(result).toMatchObject({ success: false, code: 'EMAIL_FAILED' })
    // Compensating transaction should have been called (second $transaction call)
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
    expect(prisma.clubMembership.deleteMany).toHaveBeenCalledWith({ where: { clubId: 'club-1' } })
    expect(prisma.supportMessage.deleteMany).toHaveBeenCalledWith({ where: { clubId: 'club-1' } })
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
    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: 'custom-slug' })

    expect(result).toEqual({ success: true })
    expect(prisma.club.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'custom-slug' }),
    })
  })

  it('returns SLUG_REQUIRED when slug is empty', async () => {
    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: '' })

    expect(result).toMatchObject({ success: false, code: 'SLUG_REQUIRED' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns SLUG_REQUIRED when slug is whitespace only', async () => {
    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: '   ' })

    expect(result).toMatchObject({ success: false, code: 'SLUG_REQUIRED' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns SLUG_INVALID for uppercase characters', async () => {
    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: 'My-Club' })

    expect(result).toMatchObject({ success: false, code: 'SLUG_INVALID' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns SLUG_INVALID for special characters', async () => {
    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: 'club_name!' })

    expect(result).toMatchObject({ success: false, code: 'SLUG_INVALID' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns SLUG_INVALID for leading hyphen', async () => {
    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: '-club' })

    expect(result).toMatchObject({ success: false, code: 'SLUG_INVALID' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns SLUG_CONFLICT when slug matches an existing club', async () => {
    vi.mocked(prisma.club.findUnique).mockResolvedValue({ id: 'club-1' } as never)

    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: 'taken-slug' })

    expect(result).toMatchObject({ success: false, code: 'SLUG_CONFLICT' })
    expect(prisma.club.create).not.toHaveBeenCalled()
  })

  it('returns SLUG_CONFLICT when slug matches another approved application', async () => {
    vi.mocked(prisma.application.findFirst).mockResolvedValue({ id: 'app-2' } as never)

    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: 'taken-slug' })

    expect(result).toMatchObject({ success: false, code: 'SLUG_CONFLICT' })
    expect(prisma.club.create).not.toHaveBeenCalled()
  })

  it('returns NOT_FOUND when application does not exist', async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(null)

    const result = await approveApplication('nonexistent', { ...DEFAULT_FIELDS, desiredSlug: 'some-slug' })

    expect(result).toMatchObject({ success: false, code: 'NOT_FOUND' })
  })

  it('returns ALREADY_REVIEWED when application already approved', async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue({ ...PENDING_APPLICATION, status: 'APPROVED' } as never)

    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: 'some-slug' })

    expect(result).toMatchObject({ success: false, code: 'ALREADY_REVIEWED' })
  })

  it('returns UNAUTHORIZED for non-OPERATOR user', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(NON_OPERATOR_SESSION as never)

    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: 'some-slug' })

    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('returns UNAUTHORIZED when not authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: 'some-slug' })

    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns SERVER_ERROR when database update fails', async () => {
    vi.mocked(prisma.application.updateMany).mockRejectedValue(new Error('DB error'))

    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: 'some-slug' })

    expect(result).toMatchObject({ success: false, code: 'SERVER_ERROR' })
  })

  it('creates OperatorMessage when operator message is provided', async () => {
    const result = await approveApplication('app-1', DEFAULT_FIELDS,'Please add schedule details')

    expect(result).toEqual({ success: true })
    expect(prisma.supportMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ clubId: 'club-1', senderRole: 'OPERATOR', body: 'Please add schedule details' }),
    })
  })

  it('does not create OperatorMessage when message is not provided', async () => {
    const result = await approveApplication('app-1', DEFAULT_FIELDS)

    expect(result).toEqual({ success: true })
    expect(prisma.supportMessage.create).not.toHaveBeenCalled()
  })

  it('does not create OperatorMessage when message is empty string', async () => {
    const result = await approveApplication('app-1', DEFAULT_FIELDS,'')

    expect(result).toEqual({ success: true })
    expect(prisma.supportMessage.create).not.toHaveBeenCalled()
  })

  it('does not create OperatorMessage when message is whitespace only', async () => {
    const result = await approveApplication('app-1', DEFAULT_FIELDS,'   ')

    expect(result).toEqual({ success: true })
    expect(prisma.supportMessage.create).not.toHaveBeenCalled()
  })

  it('sets isPublished false and forceOffline false on created club', async () => {
    await approveApplication('app-1', DEFAULT_FIELDS)

    expect(prisma.club.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        isPublished: false,
        forceOffline: false,
      }),
    })
  })
})

describe('rejectApplication()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSession).mockResolvedValue(OPERATOR_SESSION as never)
    vi.mocked(prisma.application.findUnique).mockResolvedValue(PENDING_APPLICATION as never)
    vi.mocked(prisma.application.updateMany).mockResolvedValue({ count: 1 } as never)
    vi.mocked(sendEmail).mockResolvedValue(undefined)
  })

  it('sends rejection email with reason and updates status (happy path)', async () => {
    const result = await rejectApplication('app-1', 'Not a real club')

    expect(result).toEqual({ success: true })
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'admin@skiclub.ch',
      subject: 'Regarding your application for Ski Club Valais',
      html: expect.stringContaining('Not a real club'),
    })
    expect(prisma.application.updateMany).toHaveBeenCalledWith({
      where: { id: 'app-1', status: 'PENDING' },
      data: {
        status: 'REJECTED',
        rejectionReason: 'Not a real club',
        reviewedAt: expect.any(Date),
      },
    })
  })

  it('sends rejection email with default text when no reason provided', async () => {
    const result = await rejectApplication('app-1')

    expect(result).toEqual({ success: true })
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'admin@skiclub.ch',
      subject: 'Regarding your application for Ski Club Valais',
      html: expect.stringContaining('non-profit clubs'),
    })
    expect(prisma.application.updateMany).toHaveBeenCalledWith({
      where: { id: 'app-1', status: 'PENDING' },
      data: {
        status: 'REJECTED',
        rejectionReason: null,
        reviewedAt: expect.any(Date),
      },
    })
  })

  it('returns EMAIL_FAILED and does NOT update status when email fails', async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error('Resend error'))

    const result = await rejectApplication('app-1', 'Not a real club')

    expect(result).toMatchObject({ success: false, code: 'EMAIL_FAILED' })
    expect(prisma.application.updateMany).not.toHaveBeenCalled()
  })

  it('calls sendEmail with correct to, subject, and html args', async () => {
    await rejectApplication('app-1', 'Duplicate application')

    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'admin@skiclub.ch',
      subject: 'Regarding your application for Ski Club Valais',
      html: expect.any(String),
    })
  })

  it('returns NOT_FOUND when application does not exist', async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(null)

    const result = await rejectApplication('nonexistent')

    expect(result).toMatchObject({ success: false, code: 'NOT_FOUND' })
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('returns ALREADY_REVIEWED when application already rejected', async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue({ ...PENDING_APPLICATION, status: 'REJECTED' } as never)

    const result = await rejectApplication('app-1')

    expect(result).toMatchObject({ success: false, code: 'ALREADY_REVIEWED' })
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('returns UNAUTHORIZED for non-OPERATOR user', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(NON_OPERATOR_SESSION as never)

    const result = await rejectApplication('app-1')

    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('returns SERVER_ERROR when database query fails', async () => {
    vi.mocked(prisma.application.findUnique).mockRejectedValue(new Error('DB error'))

    const result = await rejectApplication('app-1')

    expect(result).toMatchObject({ success: false, code: 'SERVER_ERROR' })
  })

  it('returns ALREADY_REVIEWED on race condition (concurrent rejection)', async () => {
    vi.mocked(prisma.application.updateMany).mockResolvedValue({ count: 0 } as never)

    const result = await rejectApplication('app-1', 'Too late')

    expect(result).toMatchObject({ success: false, code: 'ALREADY_REVIEWED' })
    // Email was still sent (can't un-send), but DB update failed due to race
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('returns UNAUTHORIZED when not authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const result = await rejectApplication('app-1')

    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
    expect(sendEmail).not.toHaveBeenCalled()
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

  it('includes operator message section when provided', async () => {
    const { buildAcceptanceEmailHtml } = await import('@/lib/email-templates')
    const html = buildAcceptanceEmailHtml({
      clubName: 'Ski Club',
      clubUrl: 'http://localhost:3000/fr/ch/ski-club',
      magicLinkUrl: 'http://localhost:3000/fr/auth/magic-link?token=abc',
      operatorMessage: 'Please update your schedule',
    })

    expect(html).toContain('Message from the platform')
    expect(html).toContain('Please update your schedule')
  })

  it('omits operator message section when not provided', async () => {
    const { buildAcceptanceEmailHtml } = await import('@/lib/email-templates')
    const html = buildAcceptanceEmailHtml({
      clubName: 'Ski Club',
      clubUrl: 'http://localhost:3000/fr/ch/ski-club',
      magicLinkUrl: 'http://localhost:3000/fr/auth/magic-link?token=abc',
    })

    expect(html).not.toContain('Message from the platform')
  })

  it('escapes HTML in operator message to prevent XSS', async () => {
    const { buildAcceptanceEmailHtml } = await import('@/lib/email-templates')
    const html = buildAcceptanceEmailHtml({
      clubName: 'Ski Club',
      clubUrl: 'http://localhost:3000/fr/ch/ski-club',
      magicLinkUrl: 'http://localhost:3000/fr/auth/magic-link?token=abc',
      operatorMessage: '<script>alert("xss")</script>',
    })

    expect(html).not.toContain('<script>alert')
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('buildRejectionEmailHtml()', () => {
  it('includes club name and rejection reason', async () => {
    const { buildRejectionEmailHtml } = await import('@/lib/email-templates')
    const html = buildRejectionEmailHtml({
      clubName: 'Ski Club Valais',
      rejectionReason: 'Not a registered club',
    })

    expect(html).toContain('Ski Club Valais')
    expect(html).toContain('Not a registered club')
  })

  it('uses default explanation when no reason provided', async () => {
    const { buildRejectionEmailHtml } = await import('@/lib/email-templates')
    const html = buildRejectionEmailHtml({ clubName: 'Test Club' })

    expect(html).toContain('non-profit clubs')
    expect(html).toContain('real-world community activities')
  })

  it('escapes HTML in club name to prevent XSS', async () => {
    const { buildRejectionEmailHtml } = await import('@/lib/email-templates')
    const html = buildRejectionEmailHtml({
      clubName: '<script>alert(1)</script>',
    })

    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('escapes HTML in rejection reason to prevent XSS', async () => {
    const { buildRejectionEmailHtml } = await import('@/lib/email-templates')
    const html = buildRejectionEmailHtml({
      clubName: 'Test Club',
      rejectionReason: '<img onerror="alert(1)" src="x">',
    })

    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
  })

  it('includes encouragement to reapply', async () => {
    const { buildRejectionEmailHtml } = await import('@/lib/email-templates')
    const html = buildRejectionEmailHtml({ clubName: 'Test Club' })

    expect(html).toContain('welcome to submit a new application')
  })
})

describe('reserved slug validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSession).mockResolvedValue(OPERATOR_SESSION as never)
    vi.mocked(prisma.application.findUnique).mockResolvedValue(PENDING_APPLICATION as never)
  })

  it('returns SLUG_CONFLICT for reserved slug "admin"', async () => {
    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: 'admin' })
    expect(result).toMatchObject({ success: false, code: 'SLUG_CONFLICT' })
    expect(prisma.club.create).not.toHaveBeenCalled()
  })

  it('returns SLUG_CONFLICT for reserved slug "auth"', async () => {
    const result = await approveApplication('app-1', { ...DEFAULT_FIELDS, desiredSlug: 'auth' })
    expect(result).toMatchObject({ success: false, code: 'SLUG_CONFLICT' })
  })
})
