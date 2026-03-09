import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(async () => null),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    club: { findMany: vi.fn().mockResolvedValue([]) },
    clubMembership: { findMany: vi.fn().mockResolvedValue([]) },
    conversationReadCursor: { findMany: vi.fn().mockResolvedValue([]) },
    supportMessage: { count: vi.fn().mockResolvedValue(0), groupBy: vi.fn().mockResolvedValue([]) },
  },
}))
vi.mock('@/components/app/AppSidebar', () => ({
  AppSidebar: vi.fn(() => null),
}))
vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: vi.fn(({ children }: { children: unknown }) => children),
  SidebarInset: vi.fn(({ children }: { children: unknown }) => children),
  SidebarTrigger: vi.fn(() => null),
}))
vi.mock('@/components/ui/separator', () => ({
  Separator: vi.fn(() => null),
}))
vi.mock('@/components/app/club-admin/AdminDirtyContext', () => ({
  AdminDirtyProvider: vi.fn(({ children }: { children: unknown }) => children),
}))
vi.mock('@/components/app/SearchStateContext', () => ({
  SearchStateProvider: vi.fn(({ children }: { children: unknown }) => children),
}))
vi.mock('@/components/app/AdminSelectionContext', () => ({
  AdminSelectionProvider: vi.fn(({ children }: { children: unknown }) => children),
}))
vi.mock('@/components/app/admin/AdminPageTitle', () => ({
  PageTitleProvider: vi.fn(({ children }: { children: unknown }) => children),
  PageTitleDisplay: vi.fn(() => null),
}))

import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import DashboardLayout from '@/app/[lang]/(dashboard)/layout'

function makeParams(lang = 'en') {
  return Promise.resolve({ lang })
}

describe('DashboardLayout (universal)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(prisma.club.findMany).mockResolvedValue([])
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([])
    vi.mocked(prisma.conversationReadCursor.findMany).mockResolvedValue([])
    vi.mocked(prisma.supportMessage.count).mockResolvedValue(0)
    vi.mocked(prisma.supportMessage.groupBy).mockResolvedValue([])
  })

  it('renders for unauthenticated visitors (no redirect)', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    const result = await DashboardLayout({ children: null, params: makeParams() })
    expect(result).toBeTruthy()
  })

  it('renders for authenticated users', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', role: 'CLUB_ADMIN', totpEnabled: false, totpVerified: true } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([
      { club: { id: 'club-1', name: 'Test Club', slug: 'test-club', country: 'ch' } },
    ] as never)
    const result = await DashboardLayout({ children: null, params: makeParams() })
    expect(result).toBeTruthy()
  })

  it('fetches club memberships for authenticated users', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', role: 'OPERATOR', totpEnabled: false, totpVerified: true } } as any)
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([])
    await DashboardLayout({ children: null, params: makeParams() })
    expect(prisma.clubMembership.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1', status: 'ACTIVE' } })
    )
  })

  it('does not fetch memberships for unauthenticated visitors', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    await DashboardLayout({ children: null, params: makeParams() })
    expect(prisma.clubMembership.findMany).not.toHaveBeenCalled()
  })
})
