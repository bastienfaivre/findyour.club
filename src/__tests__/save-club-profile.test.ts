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

vi.mock('@/server/db', () => ({
  prisma: {
    club: {
      update: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/r2', () => ({
  generateUploadUrl: vi.fn(),
  deleteObject: vi.fn(),
  getPublicUrl: vi.fn(),
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGE_SIZE_BYTES: 5242880,
}))

const validInput = {
  name: 'Test',
  email: 'test@club.ch',
  description: null,
  schedule: null,
  howToJoin: null,
  contactPhone: null,
  contactAddress: null,
  externalWebsiteUrl: null,
  instagramUrl: null,
  facebookUrl: null,
  xUrl: null,
  tiktokUrl: null,
  discordUrl: null,
  youtubeUrl: null,
  whatsappUrl: null,
  telegramUrl: null,
  githubUrl: null,
}

describe('saveClubProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns UNAUTHORIZED when not authenticated', async () => {
    const { getAuthSession } = await import('@/server/auth')
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const { saveClubProfile } = await import(
      '@/app/[lang]/(dashboard)/club/[clubId]/actions'
    )
    const result = await saveClubProfile('club-1', validInput)

    expect(result).toEqual({
      success: false,
      error: 'Not authenticated.',
      code: 'UNAUTHORIZED',
    })
  })

  it('returns NOT_FOUND when club does not exist', async () => {
    const { getAuthSession } = await import('@/server/auth')
    const { prisma } = await import('@/server/db')

    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'user-1' },
      expires: '',
    } as Awaited<ReturnType<typeof getAuthSession>>)
    vi.mocked(prisma.club.findUnique).mockResolvedValue(null)

    const { saveClubProfile } = await import(
      '@/app/[lang]/(dashboard)/club/[clubId]/actions'
    )
    const result = await saveClubProfile('nonexistent', validInput)

    expect(result).toEqual({
      success: false,
      error: 'Club not found.',
      code: 'NOT_FOUND',
    })
  })

  it('returns FORBIDDEN when user is not a member', async () => {
    const { getAuthSession } = await import('@/server/auth')
    const { getClubActiveMembership } = await import('@/lib/server/club-queries')
    const { prisma } = await import('@/server/db')

    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'user-1' },
      expires: '',
    } as Awaited<ReturnType<typeof getAuthSession>>)
    vi.mocked(prisma.club.findUnique).mockResolvedValue({ id: 'club-1', name: 'Test Club', slug: 'test-club', country: 'ch' } as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue(null)

    const { saveClubProfile } = await import(
      '@/app/[lang]/(dashboard)/club/[clubId]/actions'
    )
    const result = await saveClubProfile('club-1', validInput)

    expect(result).toEqual({
      success: false,
      error: 'Not a member of this club.',
      code: 'FORBIDDEN',
    })
  })

  it('returns success with savedAt timestamp on valid input', async () => {
    const { getAuthSession } = await import('@/server/auth')
    const { getClubActiveMembership } = await import('@/lib/server/club-queries')
    const { revalidatePath } = await import('next/cache')
    const { prisma } = await import('@/server/db')

    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'user-1' },
      expires: '',
    } as Awaited<ReturnType<typeof getAuthSession>>)
    vi.mocked(prisma.club.findUnique).mockResolvedValue({ id: 'club-1', name: 'Test Club', slug: 'test-club', country: 'ch' } as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue({ id: 'mem-1', role: 'OWNER' } as never)

    const { saveClubProfile } = await import(
      '@/app/[lang]/(dashboard)/club/[clubId]/actions'
    )
    const result = await saveClubProfile('club-1', { ...validInput, name: 'Updated' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.savedAt).toBeDefined()
      expect(new Date(result.data.savedAt).toISOString()).toBe(result.data.savedAt)
    }
    expect(revalidatePath).toHaveBeenCalledWith('/[lang]/[country]/[club]', 'page')
  })

  it('returns VALIDATION_ERROR for invalid input', async () => {
    const { getAuthSession } = await import('@/server/auth')
    const { getClubActiveMembership } = await import('@/lib/server/club-queries')
    const { prisma } = await import('@/server/db')

    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'user-1' },
      expires: '',
    } as Awaited<ReturnType<typeof getAuthSession>>)
    vi.mocked(prisma.club.findUnique).mockResolvedValue({ id: 'club-1', name: 'Test Club', slug: 'test-club', country: 'ch' } as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue({ id: 'mem-1', role: 'OWNER' } as never)

    const { saveClubProfile } = await import(
      '@/app/[lang]/(dashboard)/club/[clubId]/actions'
    )
    // Pass invalid data (name is empty string, fails min(1))
    const result = await saveClubProfile('club-1', { ...validInput, name: '' })

    expect(result).toEqual({
      success: false,
      error: 'Invalid input.',
      code: 'VALIDATION_ERROR',
    })
  })
})
