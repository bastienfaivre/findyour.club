import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/en/ch/test-club/admin'),
}))

vi.mock('next/link', () => ({
  default: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'Link',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'Button',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('@/components/ui/sheet', () => ({
  Sheet: vi.fn(({ children }: { children: unknown }) => ({
    type: 'Sheet',
    props: { children },
    key: null,
  })),
  SheetContent: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'SheetContent',
    props: { ...props, children },
    key: null,
  })),
  SheetTitle: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'SheetTitle',
    props: { ...props, children },
    key: null,
  })),
  SheetTrigger: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'SheetTrigger',
    props: { ...props, children },
    key: null,
  })),
  SheetClose: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'SheetClose',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('lucide-react', () => ({
  Menu: vi.fn(() => ({ type: 'MenuIcon', props: {}, key: null })),
  ExternalLink: vi.fn(() => ({ type: 'ExternalLinkIcon', props: {}, key: null })),
}))

vi.mock('@/components/app/club-admin/AdminDirtyContext', () => ({
  useAdminDirty: vi.fn(() => ({ isDirty: false, setIsDirty: vi.fn() })),
}))

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: vi.fn((initial: unknown) => [initial, vi.fn()]),
  }
})

import { usePathname } from 'next/navigation'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = { type: string | ((...args: any[]) => any); props: Record<string, any>; key: null }

function findText(node: unknown): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (node === null || node === undefined) return ''
  if (Array.isArray(node)) return node.map(findText).join('')
  if (typeof node === 'object') {
    const el = node as { props?: { children?: unknown } }
    if (el.props?.children) return findText(el.props.children)
  }
  return ''
}

function findInTree(node: unknown, predicate: (n: unknown) => boolean): unknown[] {
  const results: unknown[] = []
  if (node === null || node === undefined || typeof node !== 'object') return results
  if (predicate(node)) results.push(node)
  if (Array.isArray(node)) {
    for (const child of node) results.push(...findInTree(child, predicate))
  } else {
    const el = node as { props?: { children?: unknown } }
    if (el.props?.children) results.push(...findInTree(el.props.children, predicate))
  }
  return results
}

const defaultTranslations = {
  sidebar: {
    clubProfile: 'Club Profile',
    settings: 'Settings',
    viewPublicPage: 'View public page',
  },
  clubProfile: {
    title: 'Club Profile',
    placeholder: 'Profile editing coming soon.',
    fields: { name: '', description: '', schedule: '', howToJoin: '', contactEmail: '', contactPhone: '', contactAddress: '', externalWebsiteUrl: '' },
    placeholders: { name: '', description: '', schedule: '', howToJoin: '', contactPhone: '', contactAddress: '', externalWebsiteUrl: '' },
    validation: { nameRequired: '', descriptionMaxLength: '', scheduleMaxLength: '', howToJoinMaxLength: '', contactPhoneMaxLength: '', contactAddressMaxLength: '', externalWebsiteUrlInvalid: '' },
    logo: { title: '', change: '', remove: '', altLabel: '', altPlaceholder: '', altRequired: '', uploading: '', errorType: '', errorSize: '' },
    photos: { title: '', add: '', delete: '', deleteConfirm: '', maxReached: '', constraints: '', uploading: '', errorType: '', errorSize: '' },
  },
  settings: { title: 'Settings', placeholder: 'Settings coming soon.' },
  save: {
    save: 'Save',
    discard: 'Discard',
    unsavedChanges: 'Unsaved changes',
    savedSuccessfully: 'Saved',
    discardConfirmTitle: 'Discard changes?',
    discardConfirmDescription: 'All unsaved changes will be lost.',
    leaveConfirmTitle: 'Unsaved changes',
    leaveConfirmDescription: 'You have unsaved changes that will be lost.',
    stay: 'Stay',
    leave: 'Leave',
    keepEditing: 'Keep editing',
  },
  navigation: 'Admin navigation',
  openMenu: 'Open menu',
  skipToContent: 'Skip to main content',
}

const defaultProps = {
  clubName: 'Test Club',
  adminBasePath: '/en/ch/test-club/admin',
  publicClubPath: '/en/ch/test-club',
  translations: defaultTranslations,
}

describe('AdminSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePathname).mockReturnValue('/en/ch/test-club/admin')
  })

  it('renders club name in desktop sidebar and mobile header', async () => {
    const { AdminSidebar } = await import('@/components/app/club-admin/AdminSidebar')
    const result = AdminSidebar(defaultProps)
    const text = findText(result)
    expect(text).toContain('Test Club')
  })

  it('renders nav items with correct labels', async () => {
    const { AdminSidebar } = await import('@/components/app/club-admin/AdminSidebar')
    const result = AdminSidebar(defaultProps)
    const text = findText(result)
    expect(text).toContain('Club Profile')
    expect(text).toContain('Settings')
  })

  it('renders FooterLink components for "View public page"', async () => {
    const { AdminSidebar } = await import('@/components/app/club-admin/AdminSidebar')
    const result = AdminSidebar(defaultProps)

    // FooterLink is a sub-component; find it by checking for elements with matching props
    const footerLinks = findInTree(result, (n) => {
      const el = n as AnyElement
      return typeof el.type === 'function' && el.props?.href === '/en/ch/test-club'
    })
    // One in mobile Sheet, one in desktop aside
    expect(footerLinks.length).toBeGreaterThanOrEqual(2)
  })

  it('sets aria-current="page" on the active nav item (Club Profile at /admin)', async () => {
    vi.mocked(usePathname).mockReturnValue('/en/ch/test-club/admin')
    const { AdminSidebar } = await import('@/components/app/club-admin/AdminSidebar')
    const Link = (await import('next/link')).default
    const result = AdminSidebar(defaultProps)

    const links = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === Link && el.props?.['aria-current'] === 'page'
    })
    expect(links.length).toBeGreaterThanOrEqual(1)
    const activeLink = links[0] as AnyElement
    expect(activeLink.props.href).toBe('/en/ch/test-club/admin')
  })

  it('sets aria-current="page" on Settings when pathname is /admin/settings', async () => {
    vi.mocked(usePathname).mockReturnValue('/en/ch/test-club/admin/settings')
    const { AdminSidebar } = await import('@/components/app/club-admin/AdminSidebar')
    const Link = (await import('next/link')).default
    const result = AdminSidebar(defaultProps)

    const links = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === Link && el.props?.['aria-current'] === 'page'
    })
    expect(links.length).toBeGreaterThanOrEqual(1)
    const activeLink = links[0] as AnyElement
    expect(activeLink.props.href).toBe('/en/ch/test-club/admin/settings')
  })

  it('renders hamburger button with aria-expanded and aria-controls for mobile', async () => {
    const { AdminSidebar } = await import('@/components/app/club-admin/AdminSidebar')
    const result = AdminSidebar(defaultProps)
    const { Button } = await import('@/components/ui/button')

    const buttons = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === Button
    }) as AnyElement[]

    const hamburger = buttons.find(b => b.props['aria-label'] === 'Open menu')
    expect(hamburger).toBeTruthy()
    expect(hamburger!.props['aria-expanded']).toBe(false)
    expect(hamburger!.props['aria-controls']).toBe('admin-sidebar-menu')
  })

  it('renders Sheet with side="left" for mobile drawer', async () => {
    const { AdminSidebar } = await import('@/components/app/club-admin/AdminSidebar')
    const result = AdminSidebar(defaultProps)
    const { SheetContent } = await import('@/components/ui/sheet')

    const sheets = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === SheetContent
    }) as AnyElement[]

    expect(sheets.length).toBe(1)
    expect(sheets[0].props.side).toBe('left')
    expect(sheets[0].props.id).toBe('admin-sidebar-menu')
  })

  it('renders <nav> with aria-label for admin navigation', async () => {
    const { AdminSidebar } = await import('@/components/app/club-admin/AdminSidebar')
    const result = AdminSidebar(defaultProps)

    const navs = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === 'nav' && el.props?.['aria-label'] === 'Admin navigation'
    })
    expect(navs.length).toBeGreaterThanOrEqual(1)
  })

  it('shows amber dot on active nav item when isDirty is true', async () => {
    const { useAdminDirty } = await import('@/components/app/club-admin/AdminDirtyContext')
    vi.mocked(useAdminDirty).mockReturnValue({ isDirty: true, setIsDirty: vi.fn() })

    const { AdminSidebar } = await import('@/components/app/club-admin/AdminSidebar')
    const result = AdminSidebar(defaultProps)

    const amberDots = findInTree(result, (n) => {
      const el = n as AnyElement
      return typeof el.props?.className === 'string' && el.props.className.includes('bg-amber-500')
    })
    // Should have amber dots (at least in mobile and desktop views)
    expect(amberDots.length).toBeGreaterThanOrEqual(1)
  })

  it('does NOT show amber dot when isDirty is false', async () => {
    const { useAdminDirty } = await import('@/components/app/club-admin/AdminDirtyContext')
    vi.mocked(useAdminDirty).mockReturnValue({ isDirty: false, setIsDirty: vi.fn() })

    const { AdminSidebar } = await import('@/components/app/club-admin/AdminSidebar')
    const result = AdminSidebar(defaultProps)

    const amberDots = findInTree(result, (n) => {
      const el = n as AnyElement
      return typeof el.props?.className === 'string' && el.props.className.includes('bg-amber-500')
    })
    expect(amberDots.length).toBe(0)
  })
})
