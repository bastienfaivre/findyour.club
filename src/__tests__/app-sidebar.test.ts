/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock React hooks
const mockSetState = vi.fn()
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: (init: unknown) => [typeof init === 'function' ? (init as () => unknown)() : init, mockSetState],
    useEffect: vi.fn(),
    useCallback: (fn: unknown) => fn,
  }
})

const mockPathname = vi.fn(() => '/en/')
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => ({
    type: 'a',
    props: { href, ...props, children },
    key: null,
  }),
}))

vi.mock('@/components/app/club-admin/AdminDirtyContext', () => ({
  useAdminDirty: () => ({ isDirty: false }),
}))

vi.mock('@/components/app/SearchStateContext', () => ({
  useSearchState: () => ({ searchQuery: '' }),
}))

vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children }: any) => ({ type: 'Sidebar', props: { children }, key: null }),
  SidebarContent: ({ children }: any) => ({ type: 'SidebarContent', props: { children }, key: null }),
  SidebarGroup: ({ children }: any) => ({ type: 'SidebarGroup', props: { children }, key: null }),
  SidebarGroupLabel: ({ children }: any) => ({ type: 'SidebarGroupLabel', props: { children }, key: null }),
  SidebarGroupContent: ({ children }: any) => ({ type: 'SidebarGroupContent', props: { children }, key: null }),
  SidebarMenu: ({ children }: any) => ({ type: 'SidebarMenu', props: { children }, key: null }),
  SidebarMenuItem: ({ children }: any) => ({ type: 'SidebarMenuItem', props: { children }, key: null }),
  SidebarMenuButton: ({ children, ...props }: any) => ({ type: 'SidebarMenuButton', props: { ...props, children }, key: null }),
  SidebarMenuSub: ({ children }: any) => ({ type: 'SidebarMenuSub', props: { children }, key: null }),
  SidebarMenuSubItem: ({ children }: any) => ({ type: 'SidebarMenuSubItem', props: { children }, key: null }),
  SidebarMenuSubButton: ({ children, ...props }: any) => ({ type: 'SidebarMenuSubButton', props: { ...props, children }, key: null }),
  SidebarFooter: ({ children }: any) => ({ type: 'SidebarFooter', props: { children }, key: null }),
  SidebarHeader: ({ children }: any) => ({ type: 'SidebarHeader', props: { children }, key: null }),
  SidebarSeparator: () => ({ type: 'SidebarSeparator', props: {}, key: null }),
}))

vi.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children }: any) => ({ type: 'Collapsible', props: { children }, key: null }),
  CollapsibleTrigger: ({ children }: any) => ({ type: 'CollapsibleTrigger', props: { children }, key: null }),
  CollapsibleContent: ({ children }: any) => ({ type: 'CollapsibleContent', props: { children }, key: null }),
}))

vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => ({ type: 'ThemeToggle', props: { 'data-testid': 'theme-toggle' }, key: null }),
}))

vi.mock('@/components/app/LanguageSwitcher', () => ({
  LanguageSwitcher: () => ({ type: 'LanguageSwitcher', props: { 'data-testid': 'language-switcher' }, key: null }),
}))

vi.mock('lucide-react', () => {
  const icon = (name: string) => () => ({ type: name, props: {}, key: null })
  return {
    ChevronRight: icon('ChevronRight'),
    Home: icon('Home'),
    Search: icon('Search'),
    Info: icon('Info'),
    Heart: icon('Heart'),
    ClipboardList: icon('ClipboardList'),
    FileText: icon('FileText'),
    Building2: icon('Building2'),
    LogIn: icon('LogIn'),
    LogOut: icon('LogOut'),
    User: icon('User'),
    MessageSquare: icon('MessageSquare'),
  }
})

import { AppSidebar, type AppSidebarProps } from '@/components/app/AppSidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher'
import Link from 'next/link'

type AnyElement = { type: any; props: Record<string, any>; key: null }

function findInTree(node: unknown, predicate: (n: unknown) => boolean): unknown[] {
  const results: unknown[] = []
  if (node === null || node === undefined || typeof node !== 'object') return results
  if (predicate(node)) results.push(node)
  if (Array.isArray(node)) {
    for (const child of node) results.push(...findInTree(child, predicate))
  } else {
    const el = node as { props?: Record<string, unknown> }
    if (el.props) {
      for (const value of Object.values(el.props)) {
        results.push(...findInTree(value, predicate))
      }
    }
  }
  return results
}

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

function findLinks(node: unknown): AnyElement[] {
  return findInTree(node, (n) => {
    const el = n as AnyElement
    return (el.type === 'a' || el.type === Link) && typeof el.props?.href === 'string'
  }) as AnyElement[]
}

const defaultTranslations = {
  nav: {
    home: 'Home',
    search: 'Search',
    apply: 'Apply',
    myClubs: 'My Clubs',
    platform: 'Platform',
    login: 'Login',
    about: 'About',
    support: 'Support',
  },
  admin: {
    applications: { title: 'Applications' },
    clubs: { title: 'Clubs' },
    messages: { title: 'Messages' },
  },
  club: {
    sidebar: {
      clubProfile: 'Club Profile',
      messages: 'Club Messages',
      settings: 'Settings',
    },
  },
  layout: {
    privacy: 'Privacy',
    terms: 'Terms',
    copyright: '\u00a9 {year} Clashware',
  },
  theme: { toggleTheme: 'Toggle theme', light: 'Light', dark: 'Dark', system: 'System' },
  auth: { accountSettings: 'Account Settings', logout: 'Logout' },
} as AppSidebarProps['translations']

function buildProps(overrides: Partial<AppSidebarProps> = {}): AppSidebarProps {
  return {
    lang: 'en',
    isAuthenticated: false,
    isOperator: false,
    clubs: [],
    operatorUnreadMessages: 0,
    translations: defaultTranslations,
    totpEnabled: false,
    ...overrides,
  }
}

describe('AppSidebar', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/en/')
    vi.clearAllMocks()
  })

  describe('public navigation', () => {
    it('shows public nav items for unauthenticated users', () => {
      const tree = AppSidebar(buildProps())
      const text = findText(tree)
      expect(text).toContain('Home')
      expect(text).toContain('Search')
      expect(text).toContain('About')
      expect(text).toContain('Support')
    })

    it('shows Apply link when user is not authenticated', () => {
      const tree = AppSidebar(buildProps())
      const text = findText(tree)
      expect(text).toContain('Apply')
    })

    it('shows Apply link when authenticated user has no clubs and is not operator', () => {
      const tree = AppSidebar(buildProps({ isAuthenticated: true, clubs: [] }))
      const text = findText(tree)
      expect(text).toContain('Apply')
    })

    it('hides Apply link when authenticated user has clubs', () => {
      const tree = AppSidebar(
        buildProps({
          isAuthenticated: true,
          clubs: [{ id: 'c1', name: 'Test Club', slug: 'test-club', country: 'ch', unreadMessages: 0 }],
        }),
      )
      const text = findText(tree)
      expect(text).not.toContain('Apply')
    })

    it('hides Apply link when authenticated user is operator', () => {
      const tree = AppSidebar(
        buildProps({ isAuthenticated: true, isOperator: true }),
      )
      const text = findText(tree)
      expect(text).not.toContain('Apply')
    })
  })

  describe('operator section', () => {
    it('shows operator admin section when isOperator is true', () => {
      const tree = AppSidebar(
        buildProps({ isAuthenticated: true, isOperator: true }),
      )
      const text = findText(tree)
      expect(text).toContain('Platform')
      expect(text).toContain('Applications')
      expect(text).toContain('Clubs')
      expect(text).toContain('Messages')
    })

    it('hides operator section when isOperator is false', () => {
      const tree = AppSidebar(buildProps({ isAuthenticated: true }))
      const text = findText(tree)
      expect(text).not.toContain('Platform')
      expect(text).not.toContain('Applications')
    })

    it('shows unread badge when operatorUnreadMessages > 0', () => {
      const tree = AppSidebar(
        buildProps({ isAuthenticated: true, isOperator: true, operatorUnreadMessages: 3 }),
      )
      // Find the Messages link and check for orange dot
      const links = findLinks(tree)
      const messagesLink = links.find((l) => l.props.href === '/en/admin/messages')
      expect(messagesLink).toBeDefined()
      const dots = findInTree(messagesLink, (n) => {
        const el = n as AnyElement
        return typeof el.props?.className === 'string' && el.props.className.includes('bg-orange-500')
      })
      expect(dots.length).toBeGreaterThanOrEqual(1)
    })

    it('does not show unread badge when operatorUnreadMessages is 0', () => {
      const tree = AppSidebar(
        buildProps({ isAuthenticated: true, isOperator: true, operatorUnreadMessages: 0 }),
      )
      const links = findLinks(tree)
      const messagesLink = links.find((l) => l.props.href === '/en/admin/messages')
      expect(messagesLink).toBeDefined()
      const dots = findInTree(messagesLink, (n) => {
        const el = n as AnyElement
        return typeof el.props?.className === 'string' && el.props.className.includes('bg-orange-500')
      })
      expect(dots.length).toBe(0)
    })
  })

  describe('my clubs section', () => {
    it('shows MY CLUBS section with club entries when clubs array is non-empty', () => {
      const tree = AppSidebar(
        buildProps({
          isAuthenticated: true,
          clubs: [
            { id: 'c1', name: 'Alpine Club', slug: 'alpine-club', country: 'ch', unreadMessages: 0 },
            { id: 'c2', name: 'River Club', slug: 'river-club', country: 'ch', unreadMessages: 0 },
          ],
        }),
      )
      const text = findText(tree)
      expect(text).toContain('My Clubs')
      expect(text).toContain('Alpine Club')
      expect(text).toContain('River Club')
    })

    it('does not show MY CLUBS section when clubs array is empty', () => {
      const tree = AppSidebar(buildProps({ isAuthenticated: true, clubs: [] }))
      const text = findText(tree)
      expect(text).not.toContain('My Clubs')
    })

    it('shows club sub-items (Club Profile, Settings, Club Messages)', () => {
      const tree = AppSidebar(
        buildProps({
          isAuthenticated: true,
          clubs: [{ id: 'c1', name: 'Alpine Club', slug: 'alpine-club', country: 'ch', unreadMessages: 0 }],
        }),
      )
      const text = findText(tree)
      expect(text).toContain('Club Profile')
      expect(text).toContain('Settings')
      expect(text).toContain('Club Messages')
    })

    it('shows unread message badge when club has unreadMessages > 0', () => {
      const tree = AppSidebar(
        buildProps({
          isAuthenticated: true,
          clubs: [{ id: 'c1', name: 'Alpine Club', slug: 'alpine-club', country: 'ch', unreadMessages: 5 }],
        }),
      )
      const dots = findInTree(tree, (n) => {
        const el = n as AnyElement
        return typeof el.props?.className === 'string' &&
          el.props.className.includes('bg-orange-500') &&
          el.props.className.includes('animate-pulse')
      })
      expect(dots.length).toBeGreaterThanOrEqual(1)
    })

    it('does not show unread badge when club has 0 unread messages', () => {
      const tree = AppSidebar(
        buildProps({
          isAuthenticated: true,
          clubs: [{ id: 'c1', name: 'Alpine Club', slug: 'alpine-club', country: 'ch', unreadMessages: 0 }],
        }),
      )
      // Find dots within the club section (exclude account section)
      // The club links use /en/club/c1 paths
      const clubLinks = findLinks(tree).filter((l) => typeof l.props.href === 'string' && l.props.href.includes('/club/c1'))
      // Check for orange dots within club links
      let clubDots = 0
      for (const link of clubLinks) {
        const dots = findInTree(link, (n) => {
          const el = n as AnyElement
          return typeof el.props?.className === 'string' && el.props.className.includes('bg-orange-500')
        })
        clubDots += dots.length
      }
      expect(clubDots).toBe(0)
    })
  })

  describe('auth section', () => {
    it('shows Login when not authenticated', () => {
      const tree = AppSidebar(buildProps({ isAuthenticated: false }))
      const text = findText(tree)
      expect(text).toContain('Login')
      expect(text).not.toContain('Account Settings')
    })

    it('shows Account Settings and Logout when authenticated', () => {
      const tree = AppSidebar(buildProps({ isAuthenticated: true }))
      const text = findText(tree)
      expect(text).toContain('Account Settings')
      expect(text).toContain('Logout')
      expect(text).not.toContain('Login')
    })

    it('shows TOTP warning indicator when totpEnabled is false and user is authenticated', () => {
      const tree = AppSidebar(buildProps({ isAuthenticated: true, totpEnabled: false }))
      const links = findLinks(tree)
      const accountLink = links.find((l) => l.props.href === '/en/account')
      expect(accountLink).toBeDefined()
      const dots = findInTree(accountLink, (n) => {
        const el = n as AnyElement
        return typeof el.props?.className === 'string' && el.props.className.includes('bg-orange-500')
      })
      expect(dots.length).toBeGreaterThanOrEqual(1)
    })

    it('does not show TOTP warning indicator when totpEnabled is true', () => {
      const tree = AppSidebar(buildProps({ isAuthenticated: true, totpEnabled: true }))
      const links = findLinks(tree)
      const accountLink = links.find((l) => l.props.href === '/en/account')
      expect(accountLink).toBeDefined()
      const dots = findInTree(accountLink, (n) => {
        const el = n as AnyElement
        return typeof el.props?.className === 'string' && el.props.className.includes('bg-orange-500')
      })
      expect(dots.length).toBe(0)
    })
  })

  describe('footer', () => {
    it('renders Privacy and Terms links', () => {
      const tree = AppSidebar(buildProps())
      const text = findText(tree)
      expect(text).toContain('Privacy')
      expect(text).toContain('Terms')
    })

    it('renders theme toggle and language switcher', () => {
      const tree = AppSidebar(buildProps())
      const toggles = findInTree(tree, (n) => (n as AnyElement).type === ThemeToggle)
      const switchers = findInTree(tree, (n) => (n as AnyElement).type === LanguageSwitcher)
      expect(toggles.length).toBeGreaterThanOrEqual(1)
      expect(switchers.length).toBeGreaterThanOrEqual(1)
    })
  })
})
