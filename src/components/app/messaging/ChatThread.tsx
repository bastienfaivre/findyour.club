'use client'

import { useRef, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, MessageSquare, Loader2 } from 'lucide-react'

export type ChatMessage = {
  id: string
  body: string
  senderRole: 'OPERATOR' | 'CLUB_ADMIN'
  senderName: string | null
  createdAt: string
}

interface ChatThreadProps {
  messages: ChatMessage[]
  sendAction: (body: string) => Promise<{ success: boolean; error?: string }>
  loadOlderAction?: (beforeId: string) => Promise<{ messages: ChatMessage[]; hasMore: boolean }>
  hasOlderMessages?: boolean
  /** Whether the current user is the operator side */
  isOperator: boolean
  translations: {
    placeholder: string
    send: string
    you: string
    platform: string
    empty: string
    loadOlder: string
  }
}

export function ChatThread({ messages: initialMessages, sendAction, loadOlderAction, hasOlderMessages: initialHasOlder = false, isOperator, translations: t }: ChatThreadProps) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')
  const [isPending, startTransition] = useTransition()
  const [allMessages, setAllMessages] = useState(initialMessages)
  const [hasOlder, setHasOlder] = useState(initialHasOlder)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const prevMessageCountRef = useRef(initialMessages.length)
  const isInitialMount = useRef(true)

  // Sync initial messages on prop change (e.g. selecting different conversation)
  useEffect(() => {
    setAllMessages(initialMessages)
    setHasOlder(initialHasOlder)
    prevMessageCountRef.current = initialMessages.length
    isInitialMount.current = true
  }, [initialMessages, initialHasOlder])

  // Auto-scroll to bottom on initial mount and new messages (not on load-older)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (isInitialMount.current) {
      el.scrollTop = el.scrollHeight
      isInitialMount.current = false
      return
    }
    // Only auto-scroll if messages were added at the end (new message, not load-older)
    if (allMessages.length > prevMessageCountRef.current) {
      const lastOld = prevMessageCountRef.current > 0 ? allMessages[allMessages.length - 1] : null
      const lastInitial = initialMessages.length > 0 ? initialMessages[initialMessages.length - 1] : null
      // If the last message changed, it's a new message — scroll to bottom
      if (lastOld?.id !== lastInitial?.id || allMessages.length <= prevMessageCountRef.current + 5) {
        el.scrollTop = el.scrollHeight
      }
    }
    prevMessageCountRef.current = allMessages.length
  }, [allMessages, initialMessages])

  // Poll for new messages every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 15_000)
    return () => clearInterval(interval)
  }, [router])

  async function handleLoadOlder() {
    if (!loadOlderAction || allMessages.length === 0) return
    const oldestId = allMessages[0].id
    setIsLoadingOlder(true)
    try {
      const el = scrollRef.current
      const prevScrollHeight = el?.scrollHeight ?? 0
      const result = await loadOlderAction(oldestId)
      setAllMessages((prev) => [...result.messages, ...prev])
      setHasOlder(result.hasMore)
      // Preserve scroll position after prepending
      requestAnimationFrame(() => {
        if (el) {
          el.scrollTop = el.scrollHeight - prevScrollHeight
        }
      })
    } finally {
      setIsLoadingOlder(false)
    }
  }

  function handleSend() {
    const body = draft.trim()
    if (!body) return
    setDraft('')
    startTransition(async () => {
      const result = await sendAction(body)
      if (!result.success) {
        setDraft(body) // Restore draft so the user can retry
        toast.error(result.error ?? 'Failed to send message')
      }
      router.refresh()
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function getSenderLabel(msg: ChatMessage) {
    const isSelf = isOperator ? msg.senderRole === 'OPERATOR' : msg.senderRole === 'CLUB_ADMIN'
    if (isSelf) return t.you
    if (msg.senderRole === 'OPERATOR') return t.platform
    return msg.senderName ?? t.you
  }

  function isSelf(msg: ChatMessage) {
    return isOperator ? msg.senderRole === 'OPERATOR' : msg.senderRole === 'CLUB_ADMIN'
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages area */}
      <div ref={scrollRef} role="log" aria-live="polite" className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {/* Load older button */}
        {hasOlder && loadOlderAction && (
          <div className="flex justify-center pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoadOlder}
              disabled={isLoadingOlder}
            >
              {isLoadingOlder && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.loadOlder}
            </Button>
          </div>
        )}
        {allMessages.length === 0 && !hasOlder && (
          <div className="flex flex-col items-center justify-center text-muted-foreground text-center py-8">
            <MessageSquare className="size-8 mb-2 opacity-50" />
            <p className="text-sm">{t.empty}</p>
          </div>
        )}
        {allMessages.map((msg) => {
          const self = isSelf(msg)
          return (
            <div key={msg.id} className={`flex ${self ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${self ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className={`text-xs font-medium mb-0.5 ${self ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {getSenderLabel(msg)}
                </p>
                <p className="text-sm whitespace-pre-line">{msg.body}</p>
                <p className={`text-[10px] mt-1 ${self ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input area */}
      <div className="border-t p-3 flex gap-2 items-end">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          rows={1}
          className="min-h-[44px] max-h-32 resize-none"
          disabled={isPending}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={isPending || !draft.trim()}
          className="shrink-0 h-11 w-11"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">{t.send}</span>
        </Button>
      </div>
    </div>
  )
}
