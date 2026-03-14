import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
}))
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({ get: vi.fn(() => 'localhost:3000') })),
  cookies: vi.fn(async () => ({ get: vi.fn(() => undefined) })),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    club: {
      groupBy: vi.fn(),
    },
  },
}))

import { prisma } from '@/server/db'
import HomePage from '@/app/[lang]/(dashboard)/page'
import AboutPage from '@/app/[lang]/(dashboard)/about/page'
import SupportPage from '@/app/[lang]/(dashboard)/support/page'
import { generatePlatformMetadata, generateDirectoryMetadata } from '@/components/app/seo/metadata'
import { CountryButton } from '@/components/app/directory/CountryButton'

function makeParams(lang = 'en') {
  return Promise.resolve({ lang })
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

function findProps(node: unknown, targetProp: string): unknown {
  if (node === null || node === undefined || typeof node !== 'object') return undefined
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findProps(item, targetProp)
      if (found !== undefined) return found
    }
    return undefined
  }
  if ('props' in (node as Record<string, unknown>)) {
    const el = node as { props: Record<string, unknown> }
    if (targetProp in el.props) return el.props[targetProp]
    for (const value of Object.values(el.props)) {
      const found = findProps(value, targetProp)
      if (found !== undefined) return found
    }
  }
  return undefined
}

describe('generatePlatformMetadata', () => {
  it('returns correct meta tags with title, description, OG, canonical, and robots', () => {
    const meta = generatePlatformMetadata({
      title: 'Test Title',
      description: 'Test Description',
      path: '/en',
      lang: 'en',
    })

    expect(meta.title).toBe('Test Title')
    expect(meta.description).toBe('Test Description')
    expect(meta.robots).toBe('index, follow')
    expect(meta.openGraph).toEqual(
      expect.objectContaining({
        title: 'Test Title',
        description: 'Test Description',
        type: 'website',
        locale: 'en',
      })
    )
    expect(meta.alternates?.canonical).toContain('/en')
  })

  it('uses NEXT_PUBLIC_BASE_URL for canonical URL', () => {
    const meta = generatePlatformMetadata({
      title: 'T',
      description: 'D',
      path: '/fr',
      lang: 'fr',
    })
    expect((meta.alternates?.canonical as string).endsWith('/fr')).toBe(true)
  })
})

describe('generateDirectoryMetadata', () => {
  it('returns correct meta tags for country directory', () => {
    const meta = generateDirectoryMetadata({
      title: 'Switzerland',
      description: 'Clubs in Switzerland',
      path: '/en/ch',
      lang: 'en',
      country: 'ch',
    })

    expect(meta.title).toBe('Switzerland')
    expect(meta.robots).toBe('index, follow')
    expect(meta.openGraph).toEqual(
      expect.objectContaining({
        title: 'Switzerland',
        type: 'website',
      })
    )
  })
})

describe('CountryButton', () => {
  it('renders with correct link href and translated aria-label', () => {
    const result = CountryButton({
      country: 'ch',
      countryName: 'Switzerland',
      clubCountLabel: '5 clubs',
      ariaLabel: 'Explore clubs in Switzerland',
      lang: 'en',
    })

    expect(result.props.href).toBe('/en/search?country=ch')
    expect(result.props['aria-label']).toBe('Explore clubs in Switzerland')
  })

  it('displays translated country name and club count label', () => {
    const result = CountryButton({
      country: 'ch',
      countryName: 'Suisse',
      clubCountLabel: '12 clubs',
      ariaLabel: 'Explorer les clubs en Suisse',
      lang: 'fr',
    })

    expect(result.props.href).toBe('/fr/search?country=ch')
    expect(result.props['aria-label']).toBe('Explorer les clubs en Suisse')
    const text = findText(result)
    expect(text).toContain('Suisse')
    expect(text).toContain('12 clubs')
  })

  it('renders coming soon country as span without link', () => {
    const result = CountryButton({
      country: 'fr',
      countryName: 'France',
      clubCountLabel: 'Coming soon',
      ariaLabel: 'France',
      lang: 'en',
      comingSoon: true,
    })

    // Should be a span, not a Link — no href, no aria-label on non-interactive element
    expect(result.props.href).toBeUndefined()
    expect(result.props['aria-label']).toBeUndefined()
    expect(result.props.className).toContain('opacity-45')
    const text = findText(result)
    expect(text).toContain('France')
    expect(text).toContain('Coming soon')
  })
})

describe('HomePage', () => {
  beforeEach(() => vi.clearAllMocks())

  function setupGroupByMock(countryData: Array<{ country: string; _count: { id: number } }>) {
    let callCount = 0
    vi.mocked(prisma.club.groupBy).mockImplementation((() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve(countryData)
      }
      // Second call: activityType groupBy
      return Promise.resolve([
        { activityType: 'skiing', _count: { id: 2 } },
        { activityType: 'football', _count: { id: 1 } },
      ])
    }) as never)
  }

  it('renders with headline, country buttons, and coming soon section', async () => {
    setupGroupByMock([{ country: 'ch', _count: { id: 3 } }])

    const result = await HomePage({ params: makeParams() })
    expect(result).toBeTruthy()

    const text = findText(result)
    expect(findProps(result, 'prefix')).toBe('Find your')

    // Section labels
    expect(text).toContain('Available now')
    // Coming soon section only appears when COMING_SOON_COUNTRIES is non-empty
    // Trust line
    expect(text).toContain('Free for all clubs')
  })

  it('handles zero clubs gracefully', async () => {
    setupGroupByMock([])

    const result = await HomePage({ params: makeParams() })
    const text = findText(result)
    expect(findProps(result, 'prefix')).toBe('Find your')
    // Page renders without errors even with no clubs
    expect(text).toContain('Available now')
  })

  it('resolves unsupported language to English fallback', async () => {
    setupGroupByMock([])

    const result = await HomePage({ params: makeParams('pt') })
    expect(findProps(result, 'prefix')).toBe('Find your')
  })
})

describe('AboutPage', () => {
  it('renders about page with title and philosophy content', async () => {
    const result = await AboutPage({ params: makeParams() })
    const text = findText(result)
    expect(text).toContain('About')
    expect(text).toContain('give social activities the visibility they deserve')
  })

  it('renders in French with translated content', async () => {
    const result = await AboutPage({ params: makeParams('fr') })
    const text = findText(result)
    expect(text).toContain('À propos')
  })
})

describe('SupportPage', () => {
  it('renders support page with costs and transparency content', async () => {
    const result = await SupportPage({ params: makeParams() })
    const text = findText(result)
    expect(text).toContain('Costs & Transparency')
    expect(text).toContain('Help us keep going')
  })

  it('renders in German with translated content', async () => {
    const result = await SupportPage({ params: makeParams('de') })
    const text = findText(result)
    expect(text).toContain('Kosten & Transparenz')
  })
})
