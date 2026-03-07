import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------- Mocks ----------

vi.mock('next/link', () => ({
  default: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'Link',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/en'),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  notFound: vi.fn(),
}))

vi.mock('@/components/app/LanguageSwitcher', () => ({
  LanguageSwitcher: vi.fn(({ ...props }: Record<string, unknown>) => ({
    type: 'LanguageSwitcher',
    props,
    key: null,
  })),
}))

vi.mock('@/components/layout/nav-link', () => ({
  NavLink: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'NavLink',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('@/components/layout/mobile-nav-menu', () => ({
  MobileNavMenu: vi.fn(({ ...props }: Record<string, unknown>) => ({
    type: 'MobileNavMenu',
    props,
    key: null,
  })),
}))

vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: vi.fn(({ ...props }: Record<string, unknown>) => ({
    type: 'ThemeToggle',
    props,
    key: null,
  })),
}))

vi.mock('@/components/app/club-site/PoweredByBanner', () => ({
  PoweredByBanner: vi.fn(({ ...props }: Record<string, unknown>) => ({
    type: 'PoweredByBanner',
    props,
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
  X: vi.fn(() => ({ type: 'XIcon', props: {}, key: null })),
  Check: vi.fn(() => ({ type: 'Check', props: {}, key: null })),
  Sun: vi.fn(() => ({ type: 'Sun', props: {}, key: null })),
  Moon: vi.fn(() => ({ type: 'Moon', props: {}, key: null })),
}))

vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    theme: 'system',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
  })),
}))

vi.mock('@/server/db', () => ({
  prisma: {},
}))

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(async () => null),
}))

vi.mock('@/lib/server/club-queries', () => ({
  getClubBySlug: vi.fn(),
  getClubPublicData: vi.fn(async () => ({
    id: 'club-1',
    name: 'Test Club',
    slug: 'test-club',
    country: 'ch',
    logoUrl: null,
    logoAlt: null,
    welcomeText: null,
    accentColor: null,
    defaultLanguage: 'fr',
    activityType: { slug: 'skiing' },
    location: null,
    pages: [
      { id: 'p1', slug: 'about-us', label: 'About Us', isAnchor: false, position: 1, parentId: null },
    ],
  })),
}))

vi.mock('@/components/app/auth/TotpEnrollmentBanner', () => ({
  TotpEnrollmentBanner: vi.fn(() => ({
    type: 'TotpEnrollmentBanner',
    props: {},
    key: null,
  })),
}))

vi.mock('@/lib/i18n/get-language', () => ({
  getLanguage: vi.fn(async () => 'en'),
}))

vi.mock('@/components/ui/sonner', () => ({
  Toaster: vi.fn(() => ({ type: 'Toaster', props: {}, key: null })),
}))

vi.mock('@/components/app/auth/DevAuthPanel', () => ({
  DevAuthPanel: vi.fn(() => ({ type: 'DevAuthPanel', props: {}, key: null })),
}))

// ---------- Helpers ----------

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = { type: string | ((...args: any[]) => any); props: Record<string, any>; key: null }

function findByMockRef(node: unknown, mockFn: unknown): AnyElement[] {
  return findInTree(node, (n) => {
    const el = n as AnyElement
    return el.type === mockFn
  }) as AnyElement[]
}

const layoutTranslations = {
  skipToContent: 'Skip to main content',
  mainNavigation: 'Main navigation',
  openMenu: 'Open menu',

  copyright: '© {year} Clashware',
  platformLinks: 'Platform',
  legalLinks: 'Legal',
  privacy: 'Privacy',
  terms: 'Terms',
}

// ---------- Tests ----------

describe('PublicNavbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps = {
    title: 'Clashware',
    titleHref: '/en',
    navItems: [
      { label: 'About', href: '/en/about' },
      { label: 'Support', href: '/en/support' },
    ],
    ctaLabel: 'Apply',
    ctaHref: '/en/apply',
    lang: 'en',
    translations: layoutTranslations,
  }

  it('renders <nav> with aria-label', async () => {
    const { PublicNavbar } = await import('@/components/layout/public-navbar')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = PublicNavbar(defaultProps) as any
    expect(result.type).toBe('nav')
    expect(result.props['aria-label']).toBe('Main navigation')
  })

  it('renders title as a link', async () => {
    const { PublicNavbar } = await import('@/components/layout/public-navbar')
    const result = PublicNavbar(defaultProps)
    const text = findText(result)
    expect(text).toContain('Clashware')
  })

  it('renders nav links', async () => {
    const { PublicNavbar } = await import('@/components/layout/public-navbar')
    const result = PublicNavbar(defaultProps)
    const text = findText(result)
    expect(text).toContain('About')
    expect(text).toContain('Support')
  })

  it('renders CTA button', async () => {
    const { PublicNavbar } = await import('@/components/layout/public-navbar')
    const result = PublicNavbar(defaultProps)
    const text = findText(result)
    expect(text).toContain('Apply')
  })

  it('renders LanguageSwitcher', async () => {
    const { PublicNavbar } = await import('@/components/layout/public-navbar')
    const { LanguageSwitcher } = await import('@/components/app/LanguageSwitcher')
    const result = PublicNavbar(defaultProps)
    const switchers = findByMockRef(result, LanguageSwitcher)
    expect(switchers.length).toBeGreaterThanOrEqual(1)
  })
})

describe('MobileNavMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is rendered by PublicNavbar with correct props', async () => {
    const { PublicNavbar } = await import('@/components/layout/public-navbar')
    const { MobileNavMenu } = await import('@/components/layout/mobile-nav-menu')

    const result = PublicNavbar({
      title: 'Test',
      titleHref: '/en',
      navItems: [{ label: 'About', href: '/en/about' }],
      ctaLabel: 'Apply',
      ctaHref: '/en/apply',
      lang: 'en',
      translations: layoutTranslations,
    })

    const mobileMenus = findByMockRef(result, MobileNavMenu)
    expect(mobileMenus.length).toBe(1)
    expect(mobileMenus[0].props.navItems).toEqual([{ label: 'About', href: '/en/about' }])
    expect(mobileMenus[0].props.ctaLabel).toBe('Apply')
    expect(mobileMenus[0].props.lang).toBe('en')
  })
})

describe('PublicFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders <footer> with platform links, legal links, and copyright', async () => {
    const { PublicFooter } = await import('@/components/layout/public-footer')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = PublicFooter({ lang: 'en' }) as any
    expect(result.type).toBe('footer')
    const text = findText(result)
    expect(text).toContain('About')
    expect(text).toContain('Support')
    expect(text).toContain('Privacy')
    expect(text).toContain('Terms')
    expect(text).toContain(`© ${new Date().getFullYear()} Clashware`)
  })

  it('renders ThemeToggle', async () => {
    const { PublicFooter } = await import('@/components/layout/public-footer')
    const { ThemeToggle } = await import('@/components/ui/theme-toggle')
    const result = PublicFooter({ lang: 'en' })
    const toggles = findByMockRef(result, ThemeToggle)
    expect(toggles.length).toBeGreaterThanOrEqual(1)
  })

  it('renders PoweredByBanner when showPoweredBy is true', async () => {
    const { PublicFooter } = await import('@/components/layout/public-footer')
    const { PoweredByBanner } = await import('@/components/app/club-site/PoweredByBanner')
    const result = PublicFooter({ lang: 'en', showPoweredBy: true })
    const banners = findByMockRef(result, PoweredByBanner)
    expect(banners.length).toBeGreaterThanOrEqual(1)
  })

  it('does not render PoweredByBanner when showPoweredBy is false', async () => {
    const { PublicFooter } = await import('@/components/layout/public-footer')
    const { PoweredByBanner } = await import('@/components/app/club-site/PoweredByBanner')
    const result = PublicFooter({ lang: 'en', showPoweredBy: false })
    const banners = findByMockRef(result, PoweredByBanner)
    expect(banners).toHaveLength(0)
  })
})

describe('PublicLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders skip link, navbar, <main id="main-content">, and footer', async () => {
    const { PublicLayout } = await import('@/components/layout/public-layout')
    const child = { type: 'div', props: { children: 'Page content' }, key: null }

    const result = PublicLayout({
      children: child,
      skipToContentLabel: 'Skip to main content',
      navbarProps: {
        title: 'Test',
        titleHref: '/en',
        navItems: [],
        lang: 'en',
        translations: layoutTranslations,
      },
      footerProps: { lang: 'en' },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any

    const text = findText(result)
    expect(text).toContain('Skip to main content')
    expect(text).toContain('Page content')

    // Find skip link
    const skipLinks = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === 'a' && el.props?.href === '#main-content'
    })
    expect(skipLinks.length).toBeGreaterThanOrEqual(1)

    // Find <main id="main-content">
    const mains = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === 'main' && el.props?.id === 'main-content'
    })
    expect(mains.length).toBe(1)
  })
})

describe('Platform layout uses PublicLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders PublicLayout with correct props', async () => {
    const { default: PlatformLayout } = await import('@/app/[lang]/(platform)/layout')
    const { PublicLayout } = await import('@/components/layout/public-layout')
    const child = { type: 'div', props: { children: 'Platform page' }, key: null }

    const result = await PlatformLayout({
      children: child,
      params: Promise.resolve({ lang: 'en' }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any

    const layouts = findByMockRef(result, PublicLayout)
    expect(layouts.length).toBeGreaterThanOrEqual(1)

    const text = findText(result)
    expect(text).toContain('Platform page')
  })
})

describe('Club layout uses PublicLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders PublicLayout with showPoweredBy: true', async () => {
    const { default: ClubLayout } = await import('@/app/[lang]/(country)/[country]/[club]/layout')
    const { PublicLayout } = await import('@/components/layout/public-layout')
    const child = { type: 'div', props: { children: 'Club page' }, key: null }

    const result = await ClubLayout({
      children: child,
      params: Promise.resolve({ lang: 'en', country: 'ch', club: 'test-club' }),
    }) as AnyElement

    const layouts = findByMockRef(result, PublicLayout)
    expect(layouts.length).toBeGreaterThanOrEqual(1)

    const layout = layouts[0]
    expect(layout.props.footerProps.showPoweredBy).toBe(true)

    const text = findText(result)
    expect(text).toContain('Club page')
  })
})
