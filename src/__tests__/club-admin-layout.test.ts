import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
  usePathname: vi.fn(() => '/en/ch/test-club/admin'),
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(async () => null),
}))
vi.mock('@/lib/server/club-queries', () => ({
  getClubBySlug: vi.fn(),
  getClubActiveMembership: vi.fn(),
}))
vi.mock('@/components/app/club-admin/AdminSidebar', () => ({
  AdminSidebar: vi.fn(() => null),
}))

import { redirect, notFound } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { getClubBySlug, getClubActiveMembership } from '@/lib/server/club-queries'
import AdminLayout from '@/app/[lang]/(country)/[country]/[club]/admin/layout'

const MOCK_CLUB = { id: 'club-1', name: 'Test Club' }

function makeParams(lang = 'en', country = 'ch', club = 'test-club') {
  return Promise.resolve({ lang, country, club })
}

function mockSession(overrides: Record<string, unknown> = {}) {
  return {
    user: {
      id: 'user-1',
      role: 'CLUB_ADMIN',
      totpEnabled: false,
      totpVerified: true,
      ...overrides,
    },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

describe('Club Admin Layout — membership guard', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('redirects unauthenticated users to login', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    await expect(AdminLayout({ children: null, params: makeParams() }))
      .rejects.toThrow('NEXT_REDIRECT:/en/auth/login')
    expect(redirect).toHaveBeenCalledWith('/en/auth/login')
  })

  it('redirects to TOTP when enabled but not verified', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(mockSession({ totpEnabled: true, totpVerified: false }))
    await expect(AdminLayout({ children: null, params: makeParams() }))
      .rejects.toThrow('NEXT_REDIRECT:/en/auth/totp')
    expect(redirect).toHaveBeenCalledWith('/en/auth/totp')
  })

  it('returns 404 when club does not exist', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(mockSession())
    vi.mocked(getClubBySlug).mockResolvedValue(null)
    await expect(AdminLayout({ children: null, params: makeParams() }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('returns 404 when user has no active membership', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(mockSession())
    vi.mocked(getClubBySlug).mockResolvedValue(MOCK_CLUB as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue(null)
    await expect(AdminLayout({ children: null, params: makeParams() }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('renders for ACTIVE OWNER', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(mockSession())
    vi.mocked(getClubBySlug).mockResolvedValue(MOCK_CLUB as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue({ id: 'm1', role: 'OWNER' } as never)
    const result = await AdminLayout({ children: null, params: makeParams() })
    expect(redirect).not.toHaveBeenCalled()
    expect(notFound).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('renders for ACTIVE EDITOR', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(mockSession())
    vi.mocked(getClubBySlug).mockResolvedValue(MOCK_CLUB as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue({ id: 'm2', role: 'EDITOR' } as never)
    const result = await AdminLayout({ children: null, params: makeParams() })
    expect(redirect).not.toHaveBeenCalled()
    expect(notFound).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('returns 404 for PENDING membership (not ACTIVE)', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(mockSession())
    vi.mocked(getClubBySlug).mockResolvedValue(MOCK_CLUB as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue(null)
    await expect(AdminLayout({ children: null, params: makeParams() }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
    expect(getClubActiveMembership).toHaveBeenCalledWith('user-1', 'club-1')
  })

  it('returns 404 for REVOKED membership (not ACTIVE)', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(mockSession())
    vi.mocked(getClubBySlug).mockResolvedValue(MOCK_CLUB as never)
    vi.mocked(getClubActiveMembership).mockResolvedValue(null)
    await expect(AdminLayout({ children: null, params: makeParams() }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('passes correct lang in redirect URL', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    await expect(AdminLayout({ children: null, params: makeParams('fr') }))
      .rejects.toThrow('NEXT_REDIRECT:/fr/auth/login')
    expect(redirect).toHaveBeenCalledWith('/fr/auth/login')
  })
})
