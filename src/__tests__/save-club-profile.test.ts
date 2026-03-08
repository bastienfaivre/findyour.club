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

describe('saveClubProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns UNAUTHORIZED when not authenticated', async () => {
    const { getAuthSession } = await import('@/server/auth')
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const { saveClubProfile } = await import(
      '@/app/[lang]/(country)/[country]/[club]/admin/actions'
    )
    const result = await saveClubProfile('ch', 'test-club', { name: 'Test' })

    expect(result).toEqual({
      success: false,
      error: 'Not authenticated.',
      code: 'UNAUTHORIZED',
    })
  })

  it('returns NOT_FOUND when club does not exist', async () => {
    const { getAuthSession } = await import('@/server/auth')
    const { getClubBySlug } = await import('@/lib/server/club-queries')

    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'user-1' },
      expires: '',
    } as Awaited<ReturnType<typeof getAuthSession>>)
    vi.mocked(getClubBySlug).mockResolvedValue(null)

    const { saveClubProfile } = await import(
      '@/app/[lang]/(country)/[country]/[club]/admin/actions'
    )
    const result = await saveClubProfile('ch', 'nonexistent', { name: 'Test' })

    expect(result).toEqual({
      success: false,
      error: 'Club not found.',
      code: 'NOT_FOUND',
    })
  })

  it('returns FORBIDDEN when user is not a member', async () => {
    const { getAuthSession } = await import('@/server/auth')
    const { getClubBySlug, getClubActiveMembership } = await import(
      '@/lib/server/club-queries'
    )

    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'user-1' },
      expires: '',
    } as Awaited<ReturnType<typeof getAuthSession>>)
    vi.mocked(getClubBySlug).mockResolvedValue({ id: 'club-1', name: 'Test Club' } as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue(null)

    const { saveClubProfile } = await import(
      '@/app/[lang]/(country)/[country]/[club]/admin/actions'
    )
    const result = await saveClubProfile('ch', 'test-club', { name: 'Test' })

    expect(result).toEqual({
      success: false,
      error: 'Not a member of this club.',
      code: 'FORBIDDEN',
    })
  })

  it('returns success with savedAt timestamp on valid input', async () => {
    const { getAuthSession } = await import('@/server/auth')
    const { getClubBySlug, getClubActiveMembership } = await import(
      '@/lib/server/club-queries'
    )
    const { revalidatePath } = await import('next/cache')

    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'user-1' },
      expires: '',
    } as Awaited<ReturnType<typeof getAuthSession>>)
    vi.mocked(getClubBySlug).mockResolvedValue({ id: 'club-1', name: 'Test Club' } as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue({ id: 'mem-1', role: 'OWNER' } as never)

    const { saveClubProfile } = await import(
      '@/app/[lang]/(country)/[country]/[club]/admin/actions'
    )
    const result = await saveClubProfile('ch', 'test-club', { name: 'Updated' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.savedAt).toBeDefined()
      expect(new Date(result.data.savedAt).toISOString()).toBe(result.data.savedAt)
    }
    expect(revalidatePath).toHaveBeenCalledWith('/ch/test-club')
  })

  it('returns VALIDATION_ERROR for invalid input', async () => {
    const { getAuthSession } = await import('@/server/auth')
    const { getClubBySlug, getClubActiveMembership } = await import(
      '@/lib/server/club-queries'
    )

    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'user-1' },
      expires: '',
    } as Awaited<ReturnType<typeof getAuthSession>>)
    vi.mocked(getClubBySlug).mockResolvedValue({ id: 'club-1', name: 'Test Club' } as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue({ id: 'mem-1', role: 'OWNER' } as never)

    const { saveClubProfile } = await import(
      '@/app/[lang]/(country)/[country]/[club]/admin/actions'
    )
    // Pass invalid data (name is empty string, fails min(1))
    const result = await saveClubProfile('ch', 'test-club', { name: '' })

    expect(result).toEqual({
      success: false,
      error: 'Invalid input.',
      code: 'VALIDATION_ERROR',
    })
  })
})
