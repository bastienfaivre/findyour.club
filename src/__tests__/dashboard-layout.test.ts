/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: vi.fn(() => undefined) })),
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    club: { findMany: vi.fn() },
    clubMembership: { findMany: vi.fn() },
    conversationReadCursor: { findMany: vi.fn() },
    supportMessage: { count: vi.fn() },
  },
}))
vi.mock('@/lib/i18n/translations', () => ({
  getTranslations: vi.fn(() => ({
    nav: { search: 'Search', logout: 'Logout' },
    admin: {},
    club: { admin: {} },
    layout: {},
    theme: {},
    auth: { accountSettings: 'Account' },
  })),
}))
vi.mock('@/lib/i18n', () => ({
  resolveUILang: vi.fn(() => 'en'),
}))
vi.mock('@/components/app/AppSidebar', () => ({
  AppSidebar: vi.fn((_props: Record<string, unknown>) => null),
}))
vi.mock('@/components/app/club-admin/AdminDirtyContext', () => ({
  AdminDirtyProvider: vi.fn(({ children }: { children: unknown }) => children),
}))
vi.mock('@/components/app/admin/AdminPageTitle', () => ({
  PageTitleProvider: vi.fn(({ children }: { children: unknown }) => children),
  PageTitleDisplay: vi.fn(() => null),
}))
vi.mock('@/components/app/SearchStateContext', () => ({
  SearchStateProvider: vi.fn(({ children }: { children: unknown }) => children),
}))
vi.mock('@/components/app/AdminSelectionContext', () => ({
  AdminSelectionProvider: vi.fn(({ children }: { children: unknown }) => children),
}))
vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: vi.fn(({ children }: { children: unknown }) => children),
  SidebarInset: vi.fn(({ children }: { children: unknown }) => children),
  SidebarTrigger: vi.fn(() => null),
}))
vi.mock('@/components/ui/separator', () => ({
  Separator: vi.fn(() => null),
}))

import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { AppSidebar } from '@/components/app/AppSidebar'
import DashboardLayout from '@/app/[lang]/(dashboard)/layout'

function makeParams(lang = 'en') {
  return Promise.resolve({ lang })
}

function findInTree(node: unknown, predicate: (n: unknown) => boolean): unknown[] {
  const results: unknown[] = []
  if (node === null || node === undefined) return results
  if (predicate(node)) results.push(node)
  if (typeof node !== 'object') return results
  if (Array.isArray(node)) {
    for (const child of node) results.push(...findInTree(child, predicate))
    return results
  }
  const el = node as { props?: Record<string, unknown>; type?: unknown }
  if (el.props) {
    for (const val of Object.values(el.props)) {
      results.push(...findInTree(val, predicate))
    }
  }
  return results
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function findByType(node: unknown, type: string | Function): unknown[] {
  return findInTree(node, (n) => {
    if (n === null || n === undefined || typeof n !== 'object') return false
    const el = n as { type?: unknown }
    return el.type === type
  })
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function findProps(node: unknown, type: string | Function): Record<string, unknown> | null {
  const found = findByType(node, type)
  if (found.length === 0) return null
  return (found[0] as { props: Record<string, unknown> }).props
}

function findText(node: unknown): string {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(findText).join('')
  if (typeof node === 'object' && 'props' in (node as Record<string, unknown>)) {
    const el = node as { props: { children?: unknown } }
    return findText(el.props.children)
  }
  return ''
}

describe('DashboardLayout', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(prisma.club.findMany).mockResolvedValue([])
    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([])
    vi.mocked(prisma.conversationReadCursor.findMany).mockResolvedValue([])
    vi.mocked(prisma.supportMessage.count).mockResolvedValue(0)
  })

  it('renders sidebar for unauthenticated user (isAuthenticated=false, isOperator=false)', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const result = await DashboardLayout({
      children: null,
      params: makeParams(),
    })

    const sidebarProps = findProps(result, AppSidebar)
    expect(sidebarProps).not.toBeNull()
    expect(sidebarProps!.isAuthenticated).toBe(false)
    expect(sidebarProps!.isOperator).toBe(false)
    expect(sidebarProps!.clubs).toEqual([])
  })

  it('passes club entries with unread counts for authenticated user', async () => {

    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'u1', role: 'CLUB_ADMIN', totpEnabled: false, totpVerified: true },
    } as any)

    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([
      { club: { id: 'club-1', name: 'Test Club', slug: 'test-club', country: 'ch' } },
      { club: { id: 'club-2', name: 'Other Club', slug: 'other-club', country: 'fr' } },
    ] as never)

    vi.mocked(prisma.conversationReadCursor.findMany).mockResolvedValue([
      { clubId: 'club-1', lastReadAt: new Date('2026-01-01') },
    ] as never)

    // First call for club-1 (has cursor), second for club-2 (no cursor)
    vi.mocked(prisma.supportMessage.count)
      .mockResolvedValueOnce(3) // club-1: 3 unread
      .mockResolvedValueOnce(1) // club-2: 1 unread

    const result = await DashboardLayout({
      children: null,
      params: makeParams(),
    })

    const sidebarProps = findProps(result, AppSidebar)
    expect(sidebarProps).not.toBeNull()
    expect(sidebarProps!.isAuthenticated).toBe(true)

    const clubs = sidebarProps!.clubs as Array<{ id: string; name: string; unreadMessages: number }>
    expect(clubs).toHaveLength(2)
    expect(clubs[0]).toEqual(expect.objectContaining({ id: 'club-1', name: 'Test Club', unreadMessages: 3 }))
    expect(clubs[1]).toEqual(expect.objectContaining({ id: 'club-2', name: 'Other Club', unreadMessages: 1 }))
  })

  it('computes operator unread messages across all clubs when user is OPERATOR', async () => {

    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'op1', role: 'OPERATOR', totpEnabled: false, totpVerified: true },
    } as any)

    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([])

    // Operator path: fetch all active clubs
    vi.mocked(prisma.club.findMany).mockResolvedValue([
      { id: 'club-a' },
      { id: 'club-b' },
    ] as never)

    // Only one actual call to conversationReadCursor.findMany happens (operator path)
    // because the user has no memberships, so clubIds.length === 0 skips the first call
    vi.mocked(prisma.conversationReadCursor.findMany)
      .mockResolvedValueOnce([
        { clubId: 'club-a', lastReadAt: new Date('2026-01-01') },
      ] as never)

    vi.mocked(prisma.supportMessage.count)
      .mockResolvedValueOnce(5) // club-a: 5 unread (with cursor, senderRole=CLUB_ADMIN)
      .mockResolvedValueOnce(2) // club-b: 2 unread (without cursor, senderRole=CLUB_ADMIN)

    const result = await DashboardLayout({
      children: null,
      params: makeParams(),
    })

    const sidebarProps = findProps(result, AppSidebar)
    expect(sidebarProps).not.toBeNull()
    expect(sidebarProps!.isOperator).toBe(true)
    expect(sidebarProps!.operatorUnreadMessages).toBe(7)
  })

  it('renders children inside the layout', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)

    const childElement = { type: 'div', props: { 'data-testid': 'child-content', children: 'Hello' }, key: null }
    const result = await DashboardLayout({
      children: childElement as unknown as React.ReactNode,
      params: makeParams(),
    })

    const text = findText(result)
    expect(text).toContain('Hello')
  })

  it('handles user with no club memberships', async () => {

    vi.mocked(getAuthSession).mockResolvedValue({
      user: { id: 'u2', role: 'CLUB_ADMIN', totpEnabled: false, totpVerified: true },
    } as any)

    vi.mocked(prisma.clubMembership.findMany).mockResolvedValue([])

    const result = await DashboardLayout({
      children: null,
      params: makeParams(),
    })

    const sidebarProps = findProps(result, AppSidebar)
    expect(sidebarProps).not.toBeNull()
    expect(sidebarProps!.isAuthenticated).toBe(true)
    expect(sidebarProps!.clubs).toEqual([])
    // Should not attempt to count messages when there are no clubs
    expect(prisma.supportMessage.count).not.toHaveBeenCalled()
  })
})
