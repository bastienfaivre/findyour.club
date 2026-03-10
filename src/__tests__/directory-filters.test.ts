/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------- Mocks ----------

const mockPush = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

vi.mock('@/components/app/SearchStateContext', () => ({
  useSearchState: () => ({ setSearchQuery: vi.fn() }),
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => ({
    type: 'Select',
    props: { children, onValueChange, value, 'data-testid': 'select' },
    key: null,
  }),
  SelectTrigger: ({ children, ...props }: any) => ({
    type: 'SelectTrigger',
    props: { ...props, children },
    key: null,
  }),
  SelectValue: ({ placeholder }: any) => ({
    type: 'SelectValue',
    props: { placeholder },
    key: null,
  }),
  SelectContent: ({ children }: any) => ({
    type: 'SelectContent',
    props: { children },
    key: null,
  }),
  SelectItem: ({ children, value }: any) => ({
    type: 'SelectItem',
    props: { children, value },
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

vi.mock('@/components/app/admin/LocationTypeahead', () => ({
  LocationTypeahead: (props: any) => ({
    type: 'LocationTypeahead',
    props: { ...props, 'data-testid': 'location-typeahead' },
    key: null,
  }),
}))

vi.mock('@/lib/country', () => ({
  countryCodeToFlag: (code: string) => `flag-${code}`,
}))

vi.mock('lucide-react', () => ({
  X: ({ className }: any) => ({
    type: 'X',
    props: { className },
    key: null,
  }),
}))

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useTransition: () => [false, (fn: () => void) => fn()],
    useEffect: vi.fn(),
    useCallback: (fn: unknown) => fn,
    useState: (init: unknown) => [typeof init === 'function' ? (init as () => unknown)() : init, vi.fn()],
  }
})

import { DirectoryFilters } from '@/components/app/directory/DirectoryFilters'
import { Select, SelectTrigger } from '@/components/ui/select'
import { LocationTypeahead } from '@/components/app/admin/LocationTypeahead'

type AnyElement = { type: string | ((...args: any[]) => any); props: Record<string, any>; key: null }

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

const defaultLabels = {
  filterCountry: 'Country',
  filterCanton: 'Canton',
  filterCity: 'City',
  filterActivity: 'Activity',
  allCountries: 'All countries',
  allCantons: 'All cantons',
  allActivities: 'All activities',
  resetFilters: 'Reset filters',
}

const defaultProps = {
  countries: [
    { code: 'ch', name: 'Switzerland' },
    { code: 'fr', name: 'France' },
    { code: 'de', name: 'Germany' },
  ],
  cantons: [] as { code: string; name: string }[],
  activityTypes: [
    { slug: 'skiing', name: 'Skiing' },
    { slug: 'hiking', name: 'Hiking' },
  ],
  lang: 'en',
  labels: defaultLabels,
}

describe('DirectoryFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
  })

  it('renders country and activity dropdowns', () => {
    const tree = DirectoryFilters(defaultProps) as AnyElement
    const selects = findInTree(tree, (n) => {
      const el = n as AnyElement
      return el.type === Select
    }) as AnyElement[]
    // At minimum: country select + activity select
    expect(selects.length).toBeGreaterThanOrEqual(2)

    // Country select should have country items
    const triggers = findInTree(tree, (n) => {
      const el = n as AnyElement
      return el.type === SelectTrigger
    }) as AnyElement[]
    const triggerLabels = triggers.map((t) => t.props['aria-label']).filter(Boolean)
    expect(triggerLabels).toContain('Country')
    expect(triggerLabels).toContain('Activity')
  })

  it('does NOT render canton dropdown when no country selected', () => {
    // cantons is empty and no country selected
    const tree = DirectoryFilters(defaultProps) as AnyElement
    const triggers = findInTree(tree, (n) => {
      const el = n as AnyElement
      return el.type === SelectTrigger
    }) as AnyElement[]
    const triggerLabels = triggers.map((t) => t.props['aria-label']).filter(Boolean)
    expect(triggerLabels).not.toContain('Canton')
  })

  it('renders canton dropdown when country is selected and cantons are provided', () => {
    mockSearchParams = new URLSearchParams('country=ch')
    const tree = DirectoryFilters({
      ...defaultProps,
      cantons: [
        { code: 'vs', name: 'Valais' },
        { code: 'vd', name: 'Vaud' },
      ],
    }) as AnyElement
    const triggers = findInTree(tree, (n) => {
      const el = n as AnyElement
      return el.type === SelectTrigger
    }) as AnyElement[]
    const triggerLabels = triggers.map((t) => t.props['aria-label']).filter(Boolean)
    expect(triggerLabels).toContain('Canton')
  })

  it('does NOT render location typeahead when country is not ch', () => {
    mockSearchParams = new URLSearchParams('country=fr')
    const tree = DirectoryFilters(defaultProps) as AnyElement
    const typeaheads = findInTree(tree, (n) => {
      const el = n as AnyElement
      return el.type === LocationTypeahead
    })
    expect(typeaheads).toHaveLength(0)
  })

  it('renders location typeahead when country is ch', () => {
    mockSearchParams = new URLSearchParams('country=ch')
    const tree = DirectoryFilters(defaultProps) as AnyElement
    const typeaheads = findInTree(tree, (n) => {
      const el = n as AnyElement
      return el.type === LocationTypeahead
    })
    expect(typeaheads).toHaveLength(1)
  })

  it('renders reset button when filters are active', () => {
    mockSearchParams = new URLSearchParams('country=ch')
    const tree = DirectoryFilters(defaultProps) as AnyElement
    const text = findText(tree)
    expect(text).toContain('Reset filters')
  })
})
