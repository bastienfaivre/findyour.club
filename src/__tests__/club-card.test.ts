/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------- Mocks ----------

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => ({
    type: 'a',
    props: { href, ...props, children },
    key: null,
  }),
}))

vi.mock('@/components/app/ClubAvatar', () => ({
  ClubAvatar: ({ name, logoUrl }: any) => ({
    type: 'ClubAvatar',
    props: { 'data-testid': 'club-avatar', 'data-name': name, 'data-logo': logoUrl },
    key: null,
  }),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => ({
    type: 'Badge',
    props: { ...props, children },
    key: null,
  }),
}))

import { ClubCard, ClubCardSkeleton } from '@/components/app/directory/ClubCard'
import { Badge } from '@/components/ui/badge'
import { ClubAvatar } from '@/components/app/ClubAvatar'

type AnyElement = { type: string | ((...args: any[]) => any); props: Record<string, any>; key: null }

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

const baseProps = {
  name: 'Ski Club Valais',
  slug: 'ski-club-valais',
  country: 'ch',
  countryName: 'Switzerland',
  lang: 'fr',
  ariaLabel: 'View Ski Club Valais',
}

describe('ClubCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders link to correct club URL /{lang}/{country}/{slug}', () => {
    const tree = ClubCard(baseProps) as AnyElement
    expect(tree.props.href).toBe('/fr/ch/ski-club-valais')
  })

  it('displays club name', () => {
    const tree = ClubCard(baseProps) as AnyElement
    const text = findText(tree)
    expect(text).toContain('Ski Club Valais')
  })

  it('shows activity badge when activityType is provided', () => {
    const tree = ClubCard({ ...baseProps, activityType: 'Skiing' }) as AnyElement
    const badges = findInTree(tree, (n) => {
      const el = n as AnyElement
      return el.type === Badge
    }) as AnyElement[]
    expect(badges.length).toBeGreaterThanOrEqual(1)
    const badgeText = findText(badges[0])
    expect(badgeText).toBe('Skiing')
  })

  it('hides activity badge when activityType is null', () => {
    const tree = ClubCard({ ...baseProps, activityType: null }) as AnyElement
    const badges = findInTree(tree, (n) => {
      const el = n as AnyElement
      return el.type === Badge
    })
    expect(badges).toHaveLength(0)
  })

  it('shows location name with canton', () => {
    const tree = ClubCard({
      ...baseProps,
      locationName: 'Sion',
      cantonName: 'Valais',
    }) as AnyElement
    const text = findText(tree)
    expect(text).toContain('Switzerland')
    expect(text).toContain('Valais')
    expect(text).toContain('Sion')
  })

  it('shows country name when no location', () => {
    const tree = ClubCard(baseProps) as AnyElement
    const text = findText(tree)
    expect(text).toContain('Switzerland')
  })

  it('passes logo to ClubAvatar', () => {
    const tree = ClubCard({
      ...baseProps,
      logoUrl: 'https://example.com/logo.png',
    }) as AnyElement
    const avatars = findInTree(tree, (n) => {
      const el = n as AnyElement
      return el.type === ClubAvatar
    }) as AnyElement[]
    expect(avatars).toHaveLength(1)
    expect(avatars[0].props.name).toBe('Ski Club Valais')
    expect(avatars[0].props.logoUrl).toBe('https://example.com/logo.png')
  })
})

describe('ClubCardSkeleton', () => {
  it('renders placeholder elements', () => {
    const tree = ClubCardSkeleton() as AnyElement
    // Skeleton renders a wrapper div with child divs for the placeholder
    expect(tree).toBeDefined()
    expect(tree.props).toBeDefined()
    expect(tree.props.children).toBeDefined()
    // Should contain animated pulse placeholders
    const pulses = findInTree(tree, (n) => {
      const el = n as AnyElement
      return typeof el.props?.className === 'string' && el.props.className.includes('animate-pulse')
    })
    expect(pulses.length).toBeGreaterThanOrEqual(1)
  })
})
