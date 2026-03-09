'use client'

import { useRef, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

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
  /** Whether the current user is the operator side */
  isOperator: boolean
  translations: {
    placeholder: string
    send: string
    you: string
    platform: string
    empty: string
  }
}

export function ChatThread({ messages, sendAction, isOperator, translations: t }: ChatThreadProps) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')
  const [isPending, startTransition] = useTransition()

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  // Poll for new messages every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 15_000)
    return () => clearInterval(interval)
  }, [router])

  function handleSend() {
    const body = draft.trim()
    if (!body) return
    setDraft('')
    startTransition(async () => {
      await sendAction(body)
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
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">{t.empty}</p>
        )}
        {messages.map((msg) => {
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
