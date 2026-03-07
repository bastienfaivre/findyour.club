import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    club: { findFirst: vi.fn() },
    page: { findFirst: vi.fn() },
  },
}))
vi.mock('@/lib/country', () => ({
  isValidCountry: vi.fn((country: string) => country === 'ch'),
  getCountryName: vi.fn(() => 'Switzerland'),
}))
vi.mock('@/components/app/auth/TotpEnrollmentBanner', () => ({
  TotpEnrollmentBanner: vi.fn(() => null),
}))
vi.mock('next/image', () => ({
  default: vi.fn((_props: Record<string, unknown>) => null),
}))
vi.mock('next/link', () => ({
  default: vi.fn(({ children }: { children: unknown }) => children),
}))

import { notFound } from 'next/navigation'
import { prisma } from '@/server/db'
import InnerPage, { generateMetadata as innerPageMetadata } from '@/app/[lang]/(country)/[country]/[club]/[page]/page'
import ContactPage, { generateMetadata as contactMetadata } from '@/app/[lang]/(country)/[country]/[club]/contact/page'
import InnerPageLoading from '@/app/[lang]/(country)/[country]/[club]/[page]/loading'
import { ElementRenderer } from '@/components/app/club-site/ElementRenderer'

function makeParams(lang = 'en', country = 'ch', club = 'ski-club-valais', page = 'calendar') {
  return Promise.resolve({ lang, country, club, page })
}

function makeClubParams(lang = 'en', country = 'ch', club = 'ski-club-valais') {
  return Promise.resolve({ lang, country, club })
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
    return el.type === type || (typeof el.type === 'function' && (el.type as { name?: string }).name === (type as { name?: string }).name)
  })
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

const mockClub = {
  id: 'club-1',
  name: 'Ski Club Valais',
  slug: 'ski-club-valais',
  country: 'ch',
  logoUrl: null as string | null,
  logoAlt: null as string | null,
  description: 'Welcome to our ski club!',
  accentColor: 'blue',
  defaultLanguage: 'fr',
  activityType: { slug: 'skiing' },
  location: {
    swissLocation: {
      cantonCode: 'VS',
      translations: [{ language: 'en', name: 'Sion' }],
    },
  } as { swissLocation: { cantonCode: string; translations: { language: string; name: string }[] } } | null,
  pages: [
    { id: 'p1', slug: 'about', label: 'About', isAnchor: false, position: 1, parentId: null },
    { id: 'p2', slug: 'calendar', label: 'Calendar', isAnchor: false, position: 2, parentId: null },
    { id: 'p3', slug: 'events', label: 'Events', isAnchor: false, position: 3, parentId: 'p2' },
  ],
}

const mockPage = {
  id: 'page-1',
  slug: 'calendar',
  label: 'Calendar',
  elements: [
    { id: 'el-1', type: 'calendar', position: 1, data: {} },
    { id: 'el-2', type: 'rich_text', position: 2, data: {} },
  ],
}

function setupMocks(club = mockClub, page: typeof mockPage | null = mockPage) {
  vi.mocked(prisma.club.findFirst).mockResolvedValue(club as never)
  vi.mocked(prisma.page.findFirst).mockResolvedValue(page as never)
}

describe('InnerPage route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders page elements for a valid page slug', async () => {
    setupMocks()
    const result = await InnerPage({ params: makeParams() })
    const elements = findByType(result, ElementRenderer)
    expect(elements).toHaveLength(2)
  })

  it('calls notFound() for non-existent page slug', async () => {
    setupMocks(mockClub, null)
    await expect(InnerPage({ params: makeParams('en', 'ch', 'ski-club-valais', 'nonexistent') }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('calls notFound() for inactive page (isActive: false) — query filters by isActive', async () => {
    setupMocks(mockClub, null)
    await expect(InnerPage({ params: makeParams('en', 'ch', 'ski-club-valais', 'inactive-page') }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
    // Verify the Prisma query includes isActive: true and clubId in the WHERE clause
    const callArgs = vi.mocked(prisma.page.findFirst).mock.calls[0]?.[0] as { where?: Record<string, unknown> } | undefined
    expect(callArgs?.where).toHaveProperty('isActive', true)
    expect(callArgs?.where).toHaveProperty('clubId', 'club-1')
  })

  it('calls notFound() for anchor page (isAnchor: true) — query filters by isAnchor', async () => {
    setupMocks(mockClub, null)
    await expect(InnerPage({ params: makeParams('en', 'ch', 'ski-club-valais', 'anchor-page') }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
    // Verify the Prisma query includes isAnchor: false and clubId in the WHERE clause
    const callArgs = vi.mocked(prisma.page.findFirst).mock.calls[0]?.[0] as { where?: Record<string, unknown> } | undefined
    expect(callArgs?.where).toHaveProperty('isAnchor', false)
    expect(callArgs?.where).toHaveProperty('clubId', 'club-1')
  })

  it('calls notFound() for invalid country', async () => {
    setupMocks()
    await expect(InnerPage({ params: makeParams('en', 'zz', 'ski-club-valais', 'calendar') }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('calls notFound() for non-existent club', async () => {
    vi.mocked(prisma.club.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.page.findFirst).mockResolvedValue(null)
    await expect(InnerPage({ params: makeParams('en', 'ch', 'nonexistent', 'calendar') }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })
})

describe('ElementRenderer', () => {
  it('renders placeholder cards for each element type', () => {
    const types = ['rich_text', 'image', 'gallery', 'calendar', 'documents', 'contact'] as const
    for (const type of types) {
      const result = ElementRenderer({ element: { id: '1', type, position: 1, data: {} } })
      expect(result).not.toBeNull()
      const text = findText(result)
      expect(text.length).toBeGreaterThan(0)
    }
  })

  it('returns null for unknown element type', () => {
    const result = ElementRenderer({ element: { id: '1', type: 'unknown_type' as never, position: 1, data: {} } })
    expect(result).toBeNull()
  })
})

describe('Inner page generateMetadata', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns correct title and canonical URL with page slug', async () => {
    setupMocks()
    const metadata = await innerPageMetadata({ params: makeParams() })
    expect(metadata.title).toBe('Calendar — Ski Club Valais')
    expect(metadata.alternates?.canonical).toContain('/en/ch/ski-club-valais/calendar')
  })

  it('returns empty object for invalid country', async () => {
    const metadata = await innerPageMetadata({ params: makeParams('en', 'zz') })
    expect(metadata).toEqual({})
  })

  it('returns empty object for non-existent club', async () => {
    vi.mocked(prisma.club.findFirst).mockResolvedValue(null)
    const metadata = await innerPageMetadata({ params: makeParams() })
    expect(metadata).toEqual({})
  })

  it('returns empty object for non-existent page', async () => {
    vi.mocked(prisma.club.findFirst).mockResolvedValue(mockClub as never)
    vi.mocked(prisma.page.findFirst).mockResolvedValue(null)
    const metadata = await innerPageMetadata({ params: makeParams() })
    expect(metadata).toEqual({})
  })
})

describe('Contact page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders correctly', async () => {
    vi.mocked(prisma.club.findFirst).mockResolvedValue(mockClub as never)
    const result = await ContactPage({ params: makeClubParams() })
    expect(result).toBeTruthy()
    const text = findText(result)
    expect(text).toContain('Contact')
  })

  it('calls notFound() for invalid country', async () => {
    await expect(ContactPage({ params: makeClubParams('en', 'zz') }))
      .rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('calls notFound() for non-existent club', async () => {
    vi.mocked(prisma.club.findFirst).mockResolvedValue(null)
    await expect(ContactPage({ params: makeClubParams() }))
      .rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('generateMetadata returns correct title without double club name', async () => {
    vi.mocked(prisma.club.findFirst).mockResolvedValue(mockClub as never)
    const metadata = await contactMetadata({ params: makeClubParams() })
    expect(metadata.title).toBe('Contact — Ski Club Valais')
  })
})

describe('Loading skeleton', () => {
  it('exports a valid component', () => {
    const result = InnerPageLoading()
    expect(result).toBeTruthy()
  })
})
