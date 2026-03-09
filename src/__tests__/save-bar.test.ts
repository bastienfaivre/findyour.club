import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'Button',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('@/components/app/club-admin/UnsavedChangesDialog', () => ({
  UnsavedChangesDialog: vi.fn(({ open }: { open: boolean }) => ({
    type: 'UnsavedChangesDialog',
    props: { open },
    key: null,
  })),
}))

vi.mock('lucide-react', () => ({
  Loader2: vi.fn(({ className }: { className?: string }) => ({
    type: 'Loader2',
    props: { className },
    key: null,
  })),
}))

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: vi.fn((initial: unknown) => [initial, vi.fn()]),
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const defaultTranslations = {
  save: 'Save',
  discard: 'Discard',
  discardConfirmTitle: 'Discard changes?',
  discardConfirmDescription: 'All unsaved changes will be lost.',
  keepEditing: 'Keep editing',
}

describe('SaveBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Save and Discard buttons', async () => {
    const { SaveBar } = await import('@/components/app/club-admin/SaveBar')
    const result = SaveBar({
      isDirty: false,
      isPending: false,
      isValid: true,
      translations: defaultTranslations,
      onDiscard: vi.fn(),
    })

    const text = findText(result)
    expect(text).toContain('Save')
    expect(text).toContain('Discard')
  })

  it('renders amber dot when isDirty is true', async () => {
    const { SaveBar } = await import('@/components/app/club-admin/SaveBar')
    const result = SaveBar({
      isDirty: true,
      isPending: false,
      isValid: true,
      translations: defaultTranslations,
      onDiscard: vi.fn(),
    })

    const amberDots = findInTree(result, (n) => {
      const el = n as AnyElement
      return typeof el.props?.className === 'string' && el.props.className.includes('bg-amber-500')
    })
    expect(amberDots.length).toBeGreaterThanOrEqual(1)
  })

  it('does not render amber dot when isDirty is false', async () => {
    const { SaveBar } = await import('@/components/app/club-admin/SaveBar')
    const result = SaveBar({
      isDirty: false,
      isPending: false,
      isValid: true,
      translations: defaultTranslations,
      onDiscard: vi.fn(),
    })

    const amberDots = findInTree(result, (n) => {
      const el = n as AnyElement
      return typeof el.props?.className === 'string' && el.props.className.includes('bg-amber-500')
    })
    expect(amberDots.length).toBe(0)
  })

  it('shows spinner when isPending is true', async () => {
    const { SaveBar } = await import('@/components/app/club-admin/SaveBar')
    const result = SaveBar({
      isDirty: true,
      isPending: true,
      isValid: true,
      translations: defaultTranslations,
      onDiscard: vi.fn(),
    })

    const spinners = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === 'Loader2' || (typeof el.props?.className === 'string' && el.props.className.includes('animate-spin'))
    })
    expect(spinners.length).toBeGreaterThanOrEqual(1)
  })

  it('disables buttons when isDirty is false', async () => {
    const { SaveBar } = await import('@/components/app/club-admin/SaveBar')
    const { Button } = await import('@/components/ui/button')
    const result = SaveBar({
      isDirty: false,
      isPending: false,
      isValid: true,
      translations: defaultTranslations,
      onDiscard: vi.fn(),
    })

    const buttons = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === Button
    }) as AnyElement[]

    for (const btn of buttons) {
      expect(btn.props.disabled).toBe(true)
    }
  })

  it('disables Save button when form is dirty but invalid', async () => {
    const { SaveBar } = await import('@/components/app/club-admin/SaveBar')
    const { Button } = await import('@/components/ui/button')
    const result = SaveBar({
      isDirty: true,
      isPending: false,
      isValid: false,
      translations: defaultTranslations,
      onDiscard: vi.fn(),
    })

    const buttons = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === Button
    }) as AnyElement[]

    // Submit button (type="submit") should be disabled
    const submitBtn = buttons.find((b) => b.props.type === 'submit')
    expect(submitBtn?.props.disabled).toBe(true)

    // Discard button should still be enabled (dirty + not pending)
    const discardBtn = buttons.find((b) => b.props.type === 'button')
    expect(discardBtn?.props.disabled).toBe(false)
  })
})
