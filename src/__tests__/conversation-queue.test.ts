import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------- State tracking ----------
const mockSetSelectedClubId = vi.fn()
const mockSetActiveTab = vi.fn()

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: (init: unknown) => {
      // activeTab state
      if (init === 'list' || init === 'detail') return [init, mockSetActiveTab]
      // searchQuery state (string '')
      if (init === '') return ['', vi.fn()]
      // pageSize state (number 20)
      if (init === 20) return [20, vi.fn()]
      return [init, vi.fn()]
    },
    useMemo: (fn: () => unknown) => fn(),
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('@/components/app/AdminSelectionContext', () => ({
  useAdminSelection: vi.fn(() => ({
    selectedConversationId: null,
    setSelectedConversationId: mockSetSelectedClubId,
  })),
}))

vi.mock('@/components/app/messaging/ChatThread', () => ({
  ChatThread: vi.fn(({ messages }: { messages: unknown[] }) => ({
    type: 'ChatThread',
    props: { messageCount: messages.length },
    key: null,
  })),
}))

vi.mock('@/components/ui/tabs', () => ({
  Tabs: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'Tabs',
    props: { ...props, children },
    key: null,
  })),
  TabsList: vi.fn(({ children }: { children: unknown }) => ({
    type: 'TabsList',
    props: { children },
    key: null,
  })),
  TabsTrigger: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'TabsTrigger',
    props: { ...props, children },
    key: null,
  })),
  TabsContent: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'TabsContent',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'Badge',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, ...props }: { children: unknown; [key: string]: unknown }) => ({
    type: 'Button',
    props: { ...props, children },
    key: null,
  })),
}))

vi.mock('@/components/ui/input', () => ({
  Input: vi.fn((props: Record<string, unknown>) => ({
    type: 'Input',
    props,
    key: null,
  })),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

import { ConversationQueue } from '@/components/app/admin/ConversationQueue'
import type { ConversationEntry } from '@/components/app/admin/ConversationQueue'
import { useAdminSelection } from '@/components/app/AdminSelectionContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = { type: string | ((...args: any[]) => any); props: Record<string, any>; key: null }

/**
 * Deep-search tree including expanding function-type elements (internal sub-components
 * like ConversationList that JSX creates as element descriptors rather than invoking).
 */
function findInTree(node: unknown, predicate: (n: unknown) => boolean, expandFns = true): unknown[] {
  const results: unknown[] = []
  if (node === null || node === undefined || typeof node !== 'object') return results
  if (predicate(node)) results.push(node)
  if (Array.isArray(node)) {
    for (const child of node) results.push(...findInTree(child, predicate, expandFns))
  } else {
    const el = node as AnyElement
    // If the element type is a function (sub-component), call it to expand
    if (expandFns && typeof el.type === 'function' && el.props) {
      try {
        const expanded = el.type(el.props)
        results.push(...findInTree(expanded, predicate, expandFns))
      } catch {
        // Can't expand — skip
      }
    }
    if (el.props?.children) results.push(...findInTree(el.props.children, predicate, expandFns))
  }
  return results
}

function findText(node: unknown): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (node === null || node === undefined) return ''
  if (Array.isArray(node)) return node.map(findText).join('')
  if (typeof node === 'object') {
    const el = node as AnyElement
    // Expand function-type sub-components
    if (typeof el.type === 'function' && el.props) {
      try {
        const expanded = el.type(el.props)
        return findText(expanded)
      } catch {
        // fall through
      }
    }
    if (el.props?.children) return findText(el.props.children)
  }
  return ''
}

const defaultTranslations = {
  admin: {
    title: 'Conversations',
    noConversations: 'No conversations yet',
    lastMessage: 'Last message',
    selectConversation: 'Select a conversation to view',
  },
  chat: {
    title: 'Messages',
    placeholder: 'Type a message...',
    send: 'Send',
    you: 'You',
    platform: 'Platform',
    empty: 'No messages yet',
    unreadBadge: '{count} new',
  },
  searchPlaceholder: 'Search by name…',
  showingCount: 'Showing {shown} of {total}',
  showMore: 'Show more',
  noResults: 'No results',
}

function makeConversation(overrides: Partial<ConversationEntry> & { clubId: string }): ConversationEntry {
  return {
    clubName: 'Test Club',
    lastMessageBody: 'Last message',
    lastMessageAt: '2026-03-09T10:00:00Z',
    unreadCount: 0,
    messages: [],
    ...overrides,
  }
}

function renderQueue(props: Partial<Parameters<typeof ConversationQueue>[0]> = {}) {
  return ConversationQueue({
    conversations: [],
    sendAction: vi.fn().mockResolvedValue({ success: true }),
    markReadAction: vi.fn().mockResolvedValue(undefined),
    locale: 'en',
    translations: defaultTranslations,
    ...props,
  })
}

describe('ConversationQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAdminSelection).mockReturnValue({
      selectedConversationId: null,
      setSelectedConversationId: mockSetSelectedClubId,
      selectedApplicationId: null,
      setSelectedApplicationId: vi.fn(),
      selectedClubId: null,
      setSelectedClubId: vi.fn(),
    })
  })

  it('shows "no conversations" when array is empty', () => {
    const result = renderQueue({ conversations: [] })
    const text = findText(result)
    expect(text).toContain('No conversations yet')
  })

  it('renders conversation list with club names', () => {
    const conversations = [
      makeConversation({ clubId: '1', clubName: 'Alpha Club' }),
      makeConversation({ clubId: '2', clubName: 'Beta Club' }),
    ]
    const result = renderQueue({ conversations })
    const text = findText(result)
    expect(text).toContain('Alpha Club')
    expect(text).toContain('Beta Club')
  })

  it('shows unread badge for conversations with unreadCount > 0', () => {
    const conversations = [
      makeConversation({ clubId: '1', clubName: 'Club A', unreadCount: 3 }),
      makeConversation({ clubId: '2', clubName: 'Club B', unreadCount: 0 }),
    ]
    const result = renderQueue({ conversations })
    const badges = findInTree(result, (n) => {
      const el = n as AnyElement
      return el.type === 'Badge'
    })
    // Each conversation list appears twice (narrow tabs + wide side-by-side), only unreadCount>0 get Badge
    expect(badges.length).toBeGreaterThanOrEqual(1)
    expect(findText(badges[0])).toBe('3')
  })

  it('shows last message snippet', () => {
    const conversations = [
      makeConversation({ clubId: '1', lastMessageBody: 'Hey there, how are you?' }),
    ]
    const result = renderQueue({ conversations })
    const text = findText(result)
    expect(text).toContain('Hey there, how are you?')
  })

  it('calls markReadAction when conversation is selected', () => {
    const markReadAction = vi.fn().mockResolvedValue(undefined)
    const conversations = [
      makeConversation({ clubId: 'club-1', clubName: 'My Club' }),
    ]
    const result = renderQueue({ conversations, markReadAction })

    // Find native <button> elements rendered by ConversationList
    const buttons = findInTree(result, (n) => {
      const el = n as AnyElement
      return typeof el.props?.onClick === 'function' && el.type === 'button'
    }) as AnyElement[]

    const clubBtn = buttons.find((b) => findText(b).includes('My Club'))
    expect(clubBtn).toBeDefined()
    clubBtn!.props.onClick()

    expect(markReadAction).toHaveBeenCalledWith('club-1')
    expect(mockSetSelectedClubId).toHaveBeenCalledWith('club-1')
  })

  it('markReadAction error is caught silently', () => {
    const markReadAction = vi.fn().mockRejectedValue(new Error('network fail'))
    const conversations = [
      makeConversation({ clubId: 'club-1', clubName: 'Fail Club' }),
    ]
    const result = renderQueue({ conversations, markReadAction })

    const buttons = findInTree(result, (n) => {
      const el = n as AnyElement
      return typeof el.props?.onClick === 'function' && el.type === 'button'
    }) as AnyElement[]

    const clubBtn = buttons.find((b) => findText(b).includes('Fail Club'))
    // Should not throw — the .catch() in handleSelect swallows it
    expect(() => clubBtn!.props.onClick()).not.toThrow()
    expect(markReadAction).toHaveBeenCalledWith('club-1')
  })

  it('shows "select conversation" placeholder when nothing selected', () => {
    const conversations = [
      makeConversation({ clubId: '1', clubName: 'Some Club' }),
    ]
    const result = renderQueue({ conversations })
    const text = findText(result)
    expect(text).toContain('Select a conversation to view')
  })
})
