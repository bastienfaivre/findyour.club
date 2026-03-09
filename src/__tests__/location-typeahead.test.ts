import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch
global.fetch = vi.fn()

// State tracking for multiple useState calls
let stateIndex = 0
const stateOverrides: Record<number, unknown> = {}

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: (init: unknown) => {
      const idx = stateIndex++
      const value = idx in stateOverrides
        ? stateOverrides[idx]
        : (typeof init === 'function' ? (init as () => unknown)() : init)
      return [value, vi.fn()]
    },
    useRef: (init: unknown) => ({ current: init }),
    useCallback: (fn: unknown) => fn,
    useEffect: vi.fn(),
  }
})

vi.mock('@/lib/schemas/application', () => ({
  formatLocationDisplay: (v: { name: string; cantonCode: string; plz: string }) =>
    `${v.name} (${v.cantonCode}) — ${v.plz}`,
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => ({
    type: 'input',
    props,
    key: null,
  }),
}))

import { LocationTypeahead } from '@/components/app/admin/LocationTypeahead'
import { Input } from '@/components/ui/input'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const defaultProps = {
  id: 'location',
  value: null as { swisstopoId: string; plz: string; cantonCode: string; name: string } | null,
  country: 'ch',
  locale: 'en',
  placeholder: 'Search location...',
  onChange: vi.fn(),
}

const mockLocations = [
  { swisstopoId: '6266', plz: '1950', cantonCode: 'VS', name: 'Sion' },
  { swisstopoId: '5586', plz: '1000', cantonCode: 'VD', name: 'Lausanne' },
]

describe('LocationTypeahead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stateIndex = 0
    for (const key of Object.keys(stateOverrides)) {
      delete stateOverrides[Number(key)]
    }
  })

  it('renders input with placeholder', () => {
    const tree = LocationTypeahead(defaultProps) as AnyElement
    const inputs = findInTree(tree, (n) => (n as AnyElement).type === Input)
    expect(inputs.length).toBeGreaterThanOrEqual(1)
    expect((inputs[0] as AnyElement).props.placeholder).toBe('Search location...')
  })

  it('shows selected location name when value is provided', () => {
    const value = { swisstopoId: '6266', plz: '1950', cantonCode: 'VS', name: 'Sion' }
    const tree = LocationTypeahead({ ...defaultProps, value }) as AnyElement
    const inputs = findInTree(tree, (n) => (n as AnyElement).type === Input)
    expect(inputs.length).toBeGreaterThanOrEqual(1)
    expect((inputs[0] as AnyElement).props.value).toBe('Sion (VS) — 1950')
  })

  it('has correct ARIA attributes on input', () => {
    const tree = LocationTypeahead(defaultProps) as AnyElement
    const inputs = findInTree(tree, (n) => (n as AnyElement).type === Input)
    const input = inputs[0] as AnyElement
    expect(input.props.role).toBe('combobox')
    expect(input.props['aria-expanded']).toBe(false)
    expect(input.props.autoComplete).toBe('off')
  })

  it('does not render listbox when closed', () => {
    const tree = LocationTypeahead(defaultProps) as AnyElement
    const listboxes = findInTree(tree, (n) => {
      const el = n as AnyElement
      return el.props?.role === 'listbox'
    })
    expect(listboxes).toHaveLength(0)
  })

  it('renders dropdown with results when open', () => {
    // Override state: query='Sio', results=mockLocations, open=true, activeIndex=-1
    stateOverrides[0] = 'Sio'
    stateOverrides[1] = mockLocations
    stateOverrides[2] = true
    stateOverrides[3] = -1

    const tree = LocationTypeahead(defaultProps) as AnyElement
    const listboxes = findInTree(tree, (n) => {
      const el = n as AnyElement
      return el.props?.role === 'listbox'
    })
    expect(listboxes).toHaveLength(1)

    const options = findInTree(listboxes[0], (n) => {
      const el = n as AnyElement
      return el.props?.role === 'option'
    }) as AnyElement[]
    expect(options).toHaveLength(2)

    const optionTexts = options.map((o) => findText(o))
    expect(optionTexts[0]).toContain('Sion')
    expect(optionTexts[0]).toContain('VS')
    expect(optionTexts[1]).toContain('Lausanne')
    expect(optionTexts[1]).toContain('VD')
  })

  it('sets aria-expanded to true when open', () => {
    stateOverrides[0] = 'Sio'
    stateOverrides[1] = mockLocations
    stateOverrides[2] = true
    stateOverrides[3] = -1

    const tree = LocationTypeahead(defaultProps) as AnyElement
    const inputs = findInTree(tree, (n) => (n as AnyElement).type === Input)
    expect((inputs[0] as AnyElement).props['aria-expanded']).toBe(true)
  })

  it('highlights active option via aria-selected', () => {
    stateOverrides[0] = 'Sio'
    stateOverrides[1] = mockLocations
    stateOverrides[2] = true
    stateOverrides[3] = 0

    const tree = LocationTypeahead(defaultProps) as AnyElement
    const options = findInTree(tree, (n) => {
      const el = n as AnyElement
      return el.props?.role === 'option'
    }) as AnyElement[]
    expect(options[0].props['aria-selected']).toBe(true)
    expect(options[1].props['aria-selected']).toBe(false)
  })
})
