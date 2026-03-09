'use client'

import { useState } from 'react'
import { List, MessageSquare } from 'lucide-react'
import { ChatThread, type ChatMessage } from '@/components/app/messaging/ChatThread'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAdminSelection } from '@/components/app/AdminSelectionContext'
import { cn } from '@/lib/utils'
import type { Translations } from '@/lib/i18n/translations/types'

export type ConversationEntry = {
  clubId: string
  clubName: string
  lastMessageBody: string
  lastMessageAt: string
  unreadCount: number
  messages: ChatMessage[]
}

interface ConversationQueueProps {
  conversations: ConversationEntry[]
  sendAction: (clubId: string, body: string) => Promise<{ success: boolean; error?: string }>
  markReadAction: (clubId: string) => Promise<void>
  locale: string
  translations: {
    admin: Translations['admin']['messages']
    chat: Translations['club']['admin']['messages']
  }
}

export function ConversationQueue({ conversations, sendAction, markReadAction, locale, translations: t }: ConversationQueueProps) {
  const { selectedConversationId: selectedClubId, setSelectedConversationId: setSelectedClubId } = useAdminSelection()
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>(selectedClubId ? 'detail' : 'list')

  const selected = conversations.find((c) => c.clubId === selectedClubId)

  function handleSelect(clubId: string) {
    setSelectedClubId(clubId)
    setActiveTab('detail')
    markReadAction(clubId).catch(() => {
      // Best-effort — badge will reappear on next load if this fails
    })
  }

  async function handleSend(body: string) {
    if (!selectedClubId) return { success: false, error: 'No conversation selected' }
    return sendAction(selectedClubId, body)
  }

  const listBlock = (
    <ConversationList conversations={conversations} selectedId={selectedClubId} onSelect={handleSelect} noConversations={t.admin.noConversations} locale={locale} />
  )

  const detailBlock = selected ? (
    <ChatThread messages={selected.messages} sendAction={handleSend} isOperator translations={t.chat} />
  ) : (
    <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
      {t.admin.selectConversation}
    </div>
  )

  return (
    <div className="@container flex flex-col h-full min-h-0">
      {/* Narrow: tabbed */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'detail')} className="flex flex-col flex-1 min-h-0 @[56rem]:hidden">
        <TabsList className="mb-4">
          <TabsTrigger value="list">
            <List />
            {t.admin.title}
          </TabsTrigger>
          <TabsTrigger value="detail" disabled={!selected}>
            <MessageSquare />
            {selected?.clubName ?? '…'}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="overflow-y-auto max-w-xl">
          {listBlock}
        </TabsContent>
        <TabsContent value="detail" className="flex-1 min-h-0">
          {detailBlock}
        </TabsContent>
      </Tabs>

      {/* Wide: side-by-side */}
      <div className="hidden @[56rem]:flex gap-6 flex-1 min-h-0">
        <div className="w-full max-w-xl min-w-0 overflow-y-auto">
          {listBlock}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          {detailBlock}
        </div>
      </div>
    </div>
  )
}

function ConversationList({
  conversations,
  selectedId,
  onSelect,
  noConversations,
  locale,
}: {
  conversations: ConversationEntry[]
  selectedId: string | null
  onSelect: (id: string) => void
  noConversations: string
  locale: string
}) {
  if (conversations.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">{noConversations}</p>
  }

  return (
    <div className="space-y-2">
      {conversations.map((c) => {
        const date = c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString(locale) : null

        return (
          <button
            key={c.clubId}
            type="button"
            onClick={() => onSelect(c.clubId)}
            className={cn(
              'w-full text-left rounded-lg border p-3 transition-colors',
              selectedId === c.clubId
                ? 'border-primary bg-accent'
                : 'hover:bg-muted/50'
            )}
          >
            <p className="font-medium truncate">{c.clubName}</p>
            <p className="text-xs text-muted-foreground truncate mt-1">{c.lastMessageBody}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {date && <span className="text-xs text-muted-foreground">{date}</span>}
              {c.unreadCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {c.unreadCount}
                </Badge>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
