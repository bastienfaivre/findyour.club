/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/app/[lang]/(dashboard)/account/actions', () => ({
  getAccountDeletionInfo: vi.fn(),
  deleteAccount: vi.fn(),
}))

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, ...props }: any) => ({
    type: 'Button',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('@/components/ui/input', () => ({
  Input: vi.fn((props: any) => ({
    type: 'Input',
    props,
    key: null,
  })),
}))

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: vi.fn(({ children }: any) => ({
    type: 'AlertDialog',
    props: { children },
    key: null,
  })),
  AlertDialogTrigger: vi.fn(({ children }: any) => ({
    type: 'AlertDialogTrigger',
    props: { children },
    key: null,
  })),
  AlertDialogContent: vi.fn(({ children }: any) => ({
    type: 'AlertDialogContent',
    props: { children },
    key: null,
  })),
  AlertDialogHeader: vi.fn(({ children }: any) => ({
    type: 'AlertDialogHeader',
    props: { children },
    key: null,
  })),
  AlertDialogTitle: vi.fn(({ children }: any) => ({
    type: 'AlertDialogTitle',
    props: { children },
    key: null,
  })),
  AlertDialogDescription: vi.fn(({ children }: any) => ({
    type: 'AlertDialogDescription',
    props: { children },
    key: null,
  })),
  AlertDialogFooter: vi.fn(({ children }: any) => ({
    type: 'AlertDialogFooter',
    props: { children },
    key: null,
  })),
  AlertDialogCancel: vi.fn(({ children, ...props }: any) => ({
    type: 'AlertDialogCancel',
    props: { ...props, children },
    key: null,
  })),
}))

// Track useState calls
let useStateCalls: Array<[unknown, Mock]> = []
let mockStartTransition = vi.fn()
const mockedUseState = vi.fn()

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: (...args: any[]) => mockedUseState(...args),
    useTransition: () => [false, mockStartTransition],
  }
})

import { AlertDialog } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { getAccountDeletionInfo } from '@/app/[lang]/(dashboard)/account/actions'

type AnyElement = { type: string | ((...args: any[]) => any); props: Record<string, any>; key: null }

function findInTree(node: unknown, predicate: (n: unknown) => boolean): unknown[] {
  const results: unknown[] = []
  if (node === null || node === undefined || typeof node !== 'object') return results
  if (predicate(node)) results.push(node)
  if (typeof node !== 'object') return results
  if (Array.isArray(node)) {
    for (const child of node) results.push(...findInTree(child, predicate))
    return results
  }
  const el = node as { props?: Record<string, unknown> }
  if (el.props) {
    for (const val of Object.values(el.props)) {
      results.push(...findInTree(val, predicate))
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
    const el = node as { props?: Record<string, unknown> }
    if (el.props) {
      return Object.values(el.props).map(findText).join('')
    }
  }
  return ''
}


// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function findByRef(node: unknown, ref: Function): AnyElement[] {
  return findInTree(node, (n) => {
    if (n === null || n === undefined || typeof n !== 'object') return false
    const el = n as AnyElement
    return el.type === ref
  }) as AnyElement[]
}

const t = {
  title: 'Delete Account',
  description: 'This action is irreversible.',
  button: 'Delete my account',
  dialogTitle: 'Are you sure?',
  dialogDescription: 'This will permanently delete your account.',
  clubsWarning: 'These clubs will be deleted: {clubs}',
  editorOnlyNote: 'Your editor memberships will be removed.',
  noClubsNote: 'You have no clubs.',
  confirmLabel: 'Type club names to confirm',
  confirmHint: 'Type: {names}',
  deleting: 'Deleting...',
  confirm: 'Delete',
  cancel: 'Cancel',
}

/**
 * Render the component with controlled useState values.
 * stateOverrides maps by index:
 *   0: open, 1: info, 2: loading, 3: confirmText, 4: error
 */
async function renderWithStates(overrides: Record<number, unknown> = {}) {
  useStateCalls = []
  let callIndex = 0
  mockedUseState.mockImplementation((initial: unknown) => {
    const value = callIndex in overrides ? overrides[callIndex] : initial
    const setter = vi.fn()
    const pair: [unknown, Mock] = [value, setter]
    useStateCalls.push(pair)
    callIndex++
    return pair
  })

  // Use dynamic import — Vitest resolves path aliases for ESM imports
  const { DeleteAccountSection } = await import('@/components/app/auth/DeleteAccountSection') as {
    DeleteAccountSection: (props: any) => any
  }
  return DeleteAccountSection({ lang: 'en', t })
}

describe('DeleteAccountSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useStateCalls = []
    mockStartTransition = vi.fn()
  })

  it('renders delete account button', async () => {
    const result = await renderWithStates()
    const text = findText(result)
    expect(text).toContain('Delete my account')
  })

  it('passes open=false to AlertDialog when dialog is closed', async () => {
    const result = await renderWithStates()

    // Find the AlertDialog element in the tree by function reference
    const dialogs = findByRef(result, AlertDialog)
    expect(dialogs).toHaveLength(1)
    expect(dialogs[0].props.open).toBe(false)
  })

  it('calls getAccountDeletionInfo and closes dialog when result is null (BUG-1 fix)', async () => {
    vi.mocked(getAccountDeletionInfo).mockResolvedValue(null)

    const result = await renderWithStates()

    // Find the AlertDialog element and extract onOpenChange
    const dialogs = findByRef(result, AlertDialog)
    const onOpenChange = dialogs[0].props.onOpenChange

    // Simulate opening the dialog
    await onOpenChange(true)

    // It should have called getAccountDeletionInfo
    expect(getAccountDeletionInfo).toHaveBeenCalled()

    // It should have called setOpen(false) — useStateCalls[0][1] is the setOpen setter
    const setOpen = useStateCalls[0][1]
    expect(setOpen).toHaveBeenCalledWith(false)
  })

  it('shows sole-owner warning with club names when soleOwnerClubs is non-empty', async () => {
    const info = {
      soleOwnerClubs: [{ id: '1', name: 'Ski Club' }, { id: '2', name: 'Tennis Club' }],
      otherClubs: [],
    }

    // State: open=true, info=..., loading=false
    const result = await renderWithStates({ 0: true, 1: info, 2: false })
    const text = findText(result)
    expect(text).toContain('These clubs will be deleted: Ski Club, Tennis Club')
  })

  it('shows editor-only note when user has otherClubs', async () => {
    const info = {
      soleOwnerClubs: [],
      otherClubs: [{ id: '3', name: 'Swim Club' }],
    }

    const result = await renderWithStates({ 0: true, 1: info, 2: false })
    const text = findText(result)
    expect(text).toContain('Your editor memberships will be removed.')
  })

  it('shows no-clubs note when user has zero clubs', async () => {
    const info = {
      soleOwnerClubs: [],
      otherClubs: [],
    }

    const result = await renderWithStates({ 0: true, 1: info, 2: false })
    const text = findText(result)
    expect(text).toContain('You have no clubs.')
  })

  it('disables confirm button when confirmation text does not match', async () => {
    const info = {
      soleOwnerClubs: [{ id: '1', name: 'Ski Club' }],
      otherClubs: [],
    }

    // State: open=true, info=..., loading=false, confirmText='wrong'
    const result = await renderWithStates({ 0: true, 1: info, 2: false, 3: 'wrong' })

    // Find the confirm button — it has onClick (handleDelete) and contains 'Delete' text
    const buttons = findByRef(result, Button)
    const confirmBtn = buttons.find(
      (b) => findText(b.props.children) === 'Delete' && b.props.onClick,
    )
    expect(confirmBtn).toBeDefined()
    expect(confirmBtn!.props.disabled).toBe(true)
  })

  it('enables confirm button when confirmation text matches exactly', async () => {
    const info = {
      soleOwnerClubs: [{ id: '1', name: 'Ski Club' }],
      otherClubs: [],
    }

    // State: open=true, info=..., loading=false, confirmText='Ski Club' (exact match)
    const result = await renderWithStates({ 0: true, 1: info, 2: false, 3: 'Ski Club' })

    const buttons = findByRef(result, Button)
    const confirmBtn = buttons.find(
      (b) => findText(b.props.children) === 'Delete' && b.props.onClick,
    )
    expect(confirmBtn).toBeDefined()
    expect(confirmBtn!.props.disabled).toBe(false)
  })
})
