import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

beforeAll(() => {
  process.env.R2_PUBLIC_URL = 'http://localhost:9000/findyour-club'
})

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))

vi.mock('@/lib/server/club-queries', () => ({
  getClubActiveMembership: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const mockClubPhoto = {
  count: vi.fn().mockResolvedValue(0),
  aggregate: vi.fn().mockResolvedValue({ _max: { position: null } }),
  create: vi.fn().mockResolvedValue({ id: 'photo-1', url: 'http://localhost:9000/findyour-club/club-1/test.jpg', alt: 'test', position: 0 }),
  findFirst: vi.fn(),
  delete: vi.fn().mockResolvedValue({}),
}

const mockClub = {
  update: vi.fn().mockResolvedValue({}),
  findUnique: vi.fn(),
}

vi.mock('@/server/db', () => ({
  prisma: {
    club: mockClub,
    clubPhoto: mockClubPhoto,
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => {
      return fn({ clubPhoto: mockClubPhoto, club: mockClub })
    }),
    featureFlag: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}))

vi.mock('@/lib/r2', () => ({
  generateUploadUrl: vi.fn().mockResolvedValue({ uploadUrl: 'https://presigned-url.example.com', key: 'club-1/abc.jpg' }),
  deleteObject: vi.fn().mockResolvedValue(undefined),
  getPublicUrl: vi.fn((key: string) => `http://localhost:9000/findyour-club/${key}`),
  extractR2Key: vi.fn((url: string) => url.replace('http://localhost:9000/findyour-club/', '')),
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGE_SIZE_BYTES: 5242880,
}))

function mockAuth() {
  return {
    async setup() {
      const { getAuthSession } = await import('@/server/auth')
      const { getClubActiveMembership } = await import('@/lib/server/club-queries')
      const { prisma } = await import('@/server/db')
      vi.mocked(getAuthSession).mockResolvedValue({
        user: { id: 'user-1' },
        expires: '',
      } as Awaited<ReturnType<typeof getAuthSession>>)
      vi.mocked(prisma.club.findUnique).mockResolvedValue({ id: 'club-1', name: 'Test Club', slug: 'test-club', country: 'ch' } as never)
      vi.mocked(getClubActiveMembership).mockResolvedValue({ id: 'mem-1', role: 'OWNER' } as never)
    },
  }
}

describe('getPresignedUploadUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns UNAUTHORIZED when not authenticated', async () => {
    const { getAuthSession } = await import('@/server/auth')
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const { getPresignedUploadUrl } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await getPresignedUploadUrl('club-1', 'image/jpeg')

    expect(result).toEqual({ success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' })
  })

  it('returns INVALID_TYPE for disallowed MIME type', async () => {
    await mockAuth().setup()

    const { getPresignedUploadUrl } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await getPresignedUploadUrl('club-1', 'image/gif')

    expect(result).toEqual({
      success: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      code: 'INVALID_TYPE',
    })
  })

  it('returns MAX_PHOTOS when photo count is 10', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.clubPhoto.count).mockResolvedValue(10)

    const { getPresignedUploadUrl } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await getPresignedUploadUrl('club-1', 'image/jpeg')

    expect(result).toEqual({
      success: false,
      error: 'Maximum 10 photos reached.',
      code: 'MAX_PHOTOS',
    })
  })

  it('returns presigned URL on success', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.clubPhoto.count).mockResolvedValue(5)

    const { getPresignedUploadUrl } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await getPresignedUploadUrl('club-1', 'image/jpeg')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.uploadUrl).toBeDefined()
      expect(result.data.key).toBeDefined()
      expect(result.data.publicUrl).toBeDefined()
    }
  })
})

describe('createClubPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('creates photo with correct position', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.clubPhoto.aggregate).mockResolvedValue({ _max: { position: 2 } } as never)

    const { createClubPhoto } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await createClubPhoto('club-1', 'club-1/abc.jpg', 'test photo')

    expect(result.success).toBe(true)
    expect(prisma.clubPhoto.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ position: 3, clubId: 'club-1' }),
    }))
  })

  it('returns UNAUTHORIZED when not authenticated', async () => {
    const { getAuthSession } = await import('@/server/auth')
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const { createClubPhoto } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await createClubPhoto('club-1', 'key', 'alt')

    expect(result.success).toBe(false)
  })

  it('returns INVALID_KEY when key does not belong to club', async () => {
    await mockAuth().setup()

    const { createClubPhoto } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await createClubPhoto('club-1', 'other-club/abc.jpg', 'test')

    expect(result).toEqual({ success: false, error: 'Invalid file key.', code: 'INVALID_KEY' })
  })
})

describe('deleteClubPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns NOT_FOUND when photo does not exist', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.clubPhoto.findFirst).mockResolvedValue(null)

    const { deleteClubPhoto } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await deleteClubPhoto('club-1', 'nonexistent')

    expect(result).toEqual({ success: false, error: 'Photo not found.', code: 'NOT_FOUND' })
  })

  it('deletes from R2 and DB on success', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    const { deleteObject } = await import('@/lib/r2')

    vi.mocked(prisma.clubPhoto.findFirst).mockResolvedValue({
      id: 'photo-1',
      clubId: 'club-1',
      url: 'http://localhost:9000/findyour-club/club-1/test.jpg',
      alt: 'test',
      position: 0,
      createdAt: new Date(),
    })

    const { deleteClubPhoto } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await deleteClubPhoto('club-1', 'photo-1')

    expect(result).toEqual({ success: true, data: undefined })
    expect(deleteObject).toHaveBeenCalledWith('club-1/test.jpg')
    expect(prisma.clubPhoto.delete).toHaveBeenCalledWith({ where: { id: 'photo-1', clubId: 'club-1' } })
  })

  it('verifies multi-tenant check (photo.clubId)', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    vi.mocked(prisma.clubPhoto.findFirst).mockResolvedValue(null)

    const { deleteClubPhoto } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    await deleteClubPhoto('club-1', 'photo-other-club')

    expect(prisma.clubPhoto.findFirst).toHaveBeenCalledWith({
      where: { id: 'photo-other-club', clubId: 'club-1' },
    })
  })
})

describe('uploadLogo / deleteLogo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('uploadLogo returns presigned URL for valid type', async () => {
    await mockAuth().setup()

    const { uploadLogo } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await uploadLogo('club-1', 'image/png')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.uploadUrl).toBeDefined()
    }
  })

  it('uploadLogo rejects invalid type', async () => {
    await mockAuth().setup()

    const { uploadLogo } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await uploadLogo('club-1', 'image/svg+xml')

    expect(result.success).toBe(false)
  })

  it('deleteLogo removes logo from DB', async () => {
    await mockAuth().setup()
    const { prisma } = await import('@/server/db')
    // authGuard call returns club, then deleteLogo's findUnique returns logoUrl
    vi.mocked(prisma.club.findUnique)
      .mockResolvedValueOnce({ id: 'club-1', name: 'Test Club', slug: 'test-club', country: 'ch' } as never)
      .mockResolvedValueOnce({ logoUrl: null } as never)

    const { deleteLogo } = await import('@/app/[lang]/(dashboard)/club/[clubId]/actions')
    const result = await deleteLogo('club-1')

    expect(result.success).toBe(true)
    expect(prisma.club.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ logoUrl: null, logoAlt: null }),
    }))
  })
})
