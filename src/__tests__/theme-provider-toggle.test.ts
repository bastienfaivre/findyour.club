import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------- Mocks ----------

const mockSetTheme = vi.fn()

vi.mock('next-themes', () => ({
  ThemeProvider: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'NextThemesProvider',
    props: { ...props, children },
    key: null,
  })),
  useTheme: vi.fn(() => ({
    theme: 'system',
    setTheme: mockSetTheme,
    resolvedTheme: 'light',
  })),
}))

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'Button',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: vi.fn(({ children }: { children: unknown }) => ({
    type: 'DropdownMenu',
    props: { children },
    key: null,
  })),
  DropdownMenuTrigger: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'DropdownMenuTrigger',
    props: { ...props, children },
    key: null,
  })),
  DropdownMenuContent: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'DropdownMenuContent',
    props: { ...props, children },
    key: null,
  })),
  DropdownMenuItem: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'DropdownMenuItem',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('lucide-react', () => ({
  Check: vi.fn(() => ({ type: 'Check', props: {}, key: null })),
  Sun: vi.fn(() => ({ type: 'Sun', props: {}, key: null })),
  Moon: vi.fn(() => ({ type: 'Moon', props: {}, key: null })),
}))

// Layout dependency mocks (prevent DATABASE_URL crash)
vi.mock('@/server/db', () => ({
  prisma: {},
}))

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(async () => null),
}))

vi.mock('@/lib/i18n/get-language', () => ({
  getLanguage: vi.fn(async () => 'en'),
}))

vi.mock('@/components/ui/sonner', () => ({
  Toaster: vi.fn(({ ...props }: Record<string, unknown>) => ({
    type: 'Toaster',
    props,
    key: null,
  })),
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

// ---------- Tests ----------

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children wrapped in NextThemesProvider', async () => {
    const { ThemeProvider } = await import('@/components/providers/theme-provider')
    const child = { type: 'div', props: { children: 'Hello' }, key: null }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = ThemeProvider({ children: child }) as any
    // The returned React element wraps children with the next-themes provider
    const text = findText(result)
    expect(text).toContain('Hello')
    // Verify the element has the provider's config props
    expect(result.props.attribute).toBe('class')
  })

  it('passes correct props to next-themes provider', async () => {
    const { ThemeProvider } = await import('@/components/providers/theme-provider')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = ThemeProvider({ children: 'test' }) as any
    expect(result.props.attribute).toBe('class')
    expect(result.props.defaultTheme).toBe('system')
    expect(result.props.enableSystem).toBe(true)
    expect(result.props.disableTransitionOnChange).toBe(true)
  })
})

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const translations = {
    toggleTheme: 'Toggle theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  }

  it('renders with aria-label from translations', async () => {
    const { ThemeToggle } = await import('@/components/ui/theme-toggle')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = ThemeToggle({ translations }) as any
    // Find element with aria-label by searching the tree
    const ariaElements = findInTree(result, (n) => {
      const el = n as { props?: { 'aria-label'?: string } }
      return el.props?.['aria-label'] === 'Toggle theme'
    })
    expect(ariaElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders sr-only span with toggle theme text', async () => {
    const { ThemeToggle } = await import('@/components/ui/theme-toggle')
    const result = ThemeToggle({ translations })
    const text = findText(result)
    expect(text).toContain('Toggle theme')
  })

  it('renders dropdown menu with Light, Dark, System options', async () => {
    const { ThemeToggle } = await import('@/components/ui/theme-toggle')
    const result = ThemeToggle({ translations })
    const text = findText(result)
    expect(text).toContain('Light')
    expect(text).toContain('Dark')
    expect(text).toContain('System')
  })

  it('calls setTheme with correct value when onClick handlers are invoked', async () => {
    const { ThemeToggle } = await import('@/components/ui/theme-toggle')
    const result = ThemeToggle({ translations })
    // Find elements with onClick handlers
    const clickables = findInTree(result, (n) => {
      const el = n as { props?: { onClick?: () => void } }
      return typeof el.props?.onClick === 'function'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any[]

    // Should have 3 menu items with onClick
    expect(clickables).toHaveLength(3)

    // Trigger each onClick
    for (const el of clickables) {
      el.props.onClick()
    }

    expect(mockSetTheme).toHaveBeenCalledWith('light')
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
    expect(mockSetTheme).toHaveBeenCalledWith('system')
    expect(mockSetTheme).toHaveBeenCalledTimes(3)
  })

  it('uses translated strings for non-English locales', async () => {
    const { ThemeToggle } = await import('@/components/ui/theme-toggle')
    const frTranslations = {
      toggleTheme: 'Changer le thème',
      light: 'Clair',
      dark: 'Sombre',
      system: 'Système',
    }
    const result = ThemeToggle({ translations: frTranslations })
    const ariaElements = findInTree(result, (n) => {
      const el = n as { props?: { 'aria-label'?: string } }
      return el.props?.['aria-label'] === 'Changer le thème'
    })
    expect(ariaElements.length).toBeGreaterThanOrEqual(1)
    const text = findText(result)
    expect(text).toContain('Clair')
    expect(text).toContain('Sombre')
    expect(text).toContain('Système')
  })
})

describe('Root layout ThemeProvider integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders ThemeProvider wrapping content with suppressHydrationWarning on html', async () => {
    const { default: RootLayout } = await import('@/app/layout')
    const { ThemeProvider } = await import('@/components/providers/theme-provider')
    const child = { type: 'div', props: { children: 'page content' }, key: null }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await RootLayout({ children: child }) as any

    // Root element is <html> with suppressHydrationWarning
    expect(result.props.suppressHydrationWarning).toBe(true)
    expect(result.props.lang).toBe('en')

    // Find ThemeProvider element in the tree by matching its function reference
    const themeProviders = findInTree(result, (n) => {
      const el = n as { type?: unknown }
      return el.type === ThemeProvider
    })
    expect(themeProviders.length).toBeGreaterThanOrEqual(1)

    // Verify children are rendered within the provider tree
    const text = findText(result)
    expect(text).toContain('page content')
  })
})
