'use client'

import { useState, useTransition } from 'react'
import { Info, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { markOperatorMessageAsRead } from '@/app/[lang]/(country)/[country]/[club]/admin/actions'

interface OperatorMessage {
  id: string
  message: string
  createdAt: string
}

interface OperatorMessageBannerTranslations {
  title: string
  markAsRead: string
  viewAll: string
  hideAll: string
}

interface OperatorMessageBannerProps {
  messages: OperatorMessage[]
  lang: string
  country: string
  slug: string
  translations: OperatorMessageBannerTranslations
}

export function OperatorMessageBanner({
  messages: initialMessages,
  lang,
  country,
  slug,
  translations: t,
}: OperatorMessageBannerProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (messages.length === 0) return null

  const latestMessage = messages[0]
  const hasMultiple = messages.length > 1

  function handleMarkAsRead(messageId: string) {
    startTransition(async () => {
      const result = await markOperatorMessageAsRead(messageId, lang, country, slug)
      if (result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
      }
    })
  }

  return (
    <Alert className="mb-4 border-primary/30 bg-primary/5">
      <Info className="size-4 text-primary" />
      <AlertTitle className="flex items-center justify-between">
        <span>{t.title}</span>
        {hasMultiple && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-xs font-normal text-primary hover:text-primary/80"
          >
            {expanded ? t.hideAll : `${t.viewAll} (${messages.length})`}
            {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        )}
      </AlertTitle>
      <AlertDescription>
        {!expanded ? (
          <div className="flex items-start justify-between gap-2">
            <div>
              <p>{latestMessage.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(latestMessage.createdAt).toLocaleDateString()}</p>
            </div>
            <button
              type="button"
              onClick={() => handleMarkAsRead(latestMessage.id)}
              disabled={isPending}
              className="shrink-0 text-xs text-blue-600 underline hover:text-blue-800 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-200"
              aria-label={t.markAsRead}
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {messages.map((msg) => (
              <li key={msg.id} className="flex items-start justify-between gap-2">
                <div>
                  <p>{msg.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(msg.id)}
                  disabled={isPending}
                  className="shrink-0 text-xs text-blue-600 underline hover:text-blue-800 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-200"
                  aria-label={t.markAsRead}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  )
}
