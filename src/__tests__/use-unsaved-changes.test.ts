import { describe, it, expect, vi, beforeEach } from 'vitest'

const routerPushSpy = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: routerPushSpy })),
}))

// Track event listeners
const addEventListenerSpy = vi.fn()
const removeEventListenerSpy = vi.fn()
const pushStateSpy = vi.fn()

// Stub window in globalThis for Node environment
vi.stubGlobal('window', {
  addEventListener: addEventListenerSpy,
  removeEventListener: removeEventListenerSpy,
  history: { pushState: pushStateSpy },
  location: { href: 'http://localhost/en/ch/test/admin', origin: 'http://localhost' },
})

// Also stub document for click interception
vi.stubGlobal('document', {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})

// Mock React hooks
let hookState: { showDialog: boolean; pendingHref: string | null } = {
  showDialog: false,
  pendingHref: null,
}

const setShowDialog = vi.fn((v: boolean) => {
  hookState.showDialog = v
})
const setPendingHref = vi.fn((v: string | null) => {
  hookState.pendingHref = v
})

let useStateCalls = 0
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: vi.fn((_initial: unknown) => {
      useStateCalls++
      if (useStateCalls % 2 === 1) {
        return [hookState.showDialog, setShowDialog]
      }
      return [hookState.pendingHref, setPendingHref]
    }),
    useEffect: vi.fn((cb: () => void | (() => void)) => {
      const cleanup = cb()
      if (cleanup) cleanup()
    }),
    useCallback: vi.fn((cb: (...args: unknown[]) => unknown) => cb),
    useRef: vi.fn((v: unknown) => ({ current: v })),
  }
})

describe('useUnsavedChanges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useStateCalls = 0
    hookState = { showDialog: false, pendingHref: null }
  })

  it('registers beforeunload listener when isDirty is true', async () => {
    const { useUnsavedChanges } = await import('@/hooks/use-unsaved-changes')
    useUnsavedChanges({ isDirty: true })

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    )
  })

  it('does NOT register beforeunload listener when isDirty is false', async () => {
    const { useUnsavedChanges } = await import('@/hooks/use-unsaved-changes')
    useUnsavedChanges({ isDirty: false })

    const beforeUnloadCalls = addEventListenerSpy.mock.calls.filter(
      (call: unknown[]) => call[0] === 'beforeunload',
    )
    expect(beforeUnloadCalls.length).toBe(0)
  })

  it('returns showDialog, confirmNavigation, cancelNavigation', async () => {
    const { useUnsavedChanges } = await import('@/hooks/use-unsaved-changes')
    const result = useUnsavedChanges({ isDirty: false })

    expect(result).toHaveProperty('showDialog')
    expect(result).toHaveProperty('confirmNavigation')
    expect(result).toHaveProperty('cancelNavigation')
    expect(typeof result.confirmNavigation).toBe('function')
    expect(typeof result.cancelNavigation).toBe('function')
  })
})
