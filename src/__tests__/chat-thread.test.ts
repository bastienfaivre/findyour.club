import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------- React hooks mock ----------
const mockSetDraft = vi.fn()
let draftValue = ''
const mockStartTransition = vi.fn((fn: () => void) => fn())

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: (init: unknown) => {
      if (typeof init === 'string') return [draftValue, mockSetDraft]
      return [init, vi.fn()]
    },
    useTransition: () => [false, mockStartTransition],
    useEffect: vi.fn(),
    useRef: (init: unknown) => ({ current: init }),
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'Button',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: vi.fn((props: Record<string, unknown>) => ({
    type: 'Textarea',
    props,
    key: null,
  })),
}))

vi.mock('lucide-react', () => ({
  Send: vi.fn(({ className }: { className?: string }) => ({
    type: 'Send',
    props: { className },
    key: null,
  })),
  MessageSquare: vi.fn(({ className }: { className?: string }) => ({
    type: 'MessageSquare',
    props: { className },
    key: null,
  })),
}))

import { ChatThread } from '@/components/app/messaging/ChatThread'
import type { ChatMessage } from '@/components/app/messaging/ChatThread'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

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

const t = {
  placeholder: 'Type a message...',
  send: 'Send',
  you: 'You',
  platform: 'Platform',
  empty: 'No messages yet',
}

function makeMsg(overrides: Partial<ChatMessage> & { id: string }): ChatMessage {
  return {
    body: 'Hello',
    senderRole: 'OPERATOR',
    senderName: null,
    createdAt: '2026-03-09T10:00:00Z',
    ...overrides,
  }
}

function renderThread(props: Partial<Parameters<typeof ChatThread>[0]> = {}) {
  return ChatThread({
    messages: [],
    sendAction: vi.fn().mockResolvedValue({ success: true }),
    isOperator: true,
    translations: t,
    ...props,
  })
}

describe('ChatThread', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    draftValue = ''
  })

  it('renders empty state when no messages', () => {
    const result = renderThread({ messages: [] })
    const text = findText(result)
    expect(text).toContain('No messages yet')
  })

  it('renders messages with correct sender labels (operator perspective)', () => {
    const messages: ChatMessage[] = [
      makeMsg({ id: '1', body: 'From operator', senderRole: 'OPERATOR' }),
      makeMsg({ id: '2', body: 'From club', senderRole: 'CLUB_ADMIN', senderName: 'Alice' }),
    ]
    const result = renderThread({ messages, isOperator: true })
    const text = findText(result)
    // Operator sees own message as "You" and club admin by name
    expect(text).toContain('You')
    expect(text).toContain('Alice')
  })

  it('renders messages with correct sender labels (club admin perspective)', () => {
    const messages: ChatMessage[] = [
      makeMsg({ id: '1', body: 'From operator', senderRole: 'OPERATOR' }),
      makeMsg({ id: '2', body: 'From club', senderRole: 'CLUB_ADMIN', senderName: 'Alice' }),
    ]
    const result = renderThread({ messages, isOperator: false })
    const text = findText(result)
    // Club admin sees operator as "Platform" and own message as "You"
    expect(text).toContain('Platform')
    expect(text).toContain('You')
  })

  it('send button is disabled when textarea is empty', () => {
    draftValue = ''
    const result = renderThread()
    const buttons = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === Button
    }) as AnyElement[]
    expect(buttons.length).toBeGreaterThanOrEqual(1)
    // disabled = isPending || !draft.trim() → false || true → true
    expect(buttons[0].props.disabled).toBe(true)
  })

  it('clears textarea on send via handleSend', () => {
    draftValue = 'Hello world'
    const sendAction = vi.fn().mockResolvedValue({ success: true })
    const result = renderThread({ sendAction })

    // Find the Button mock element
    const buttons = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === Button
    }) as AnyElement[]
    expect(buttons.length).toBeGreaterThanOrEqual(1)

    buttons[0].props.onClick()

    // handleSend clears the draft first
    expect(mockSetDraft).toHaveBeenCalledWith('')
  })

  it('shows error toast when sendAction returns failure', async () => {
    draftValue = 'test'
    const sendAction = vi.fn().mockResolvedValue({ success: false, error: 'Network error' })
    const result = renderThread({ sendAction })

    const buttons = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === Button
    }) as AnyElement[]
    buttons[0].props.onClick()

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error')
    })
  })

  it('restores draft on send failure', async () => {
    draftValue = '  my draft  '
    const sendAction = vi.fn().mockResolvedValue({ success: false, error: 'fail' })
    const result = renderThread({ sendAction })

    const buttons = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === Button
    }) as AnyElement[]
    buttons[0].props.onClick()

    await vi.waitFor(() => {
      // First call clears draft, second restores trimmed body
      expect(mockSetDraft).toHaveBeenCalledWith('my draft')
    })
  })

  it('calls sendAction with trimmed body', async () => {
    draftValue = '  hello  '
    const sendAction = vi.fn().mockResolvedValue({ success: true })
    const result = renderThread({ sendAction })

    const buttons = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === Button
    }) as AnyElement[]
    buttons[0].props.onClick()

    await vi.waitFor(() => {
      expect(sendAction).toHaveBeenCalledWith('hello')
    })
  })
})
