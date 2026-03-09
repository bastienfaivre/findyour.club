import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { ConversationQueue, type ConversationEntry } from '@/components/app/admin/ConversationQueue'
import { sendSupportMessage } from '../clubs/[id]/actions'
import { notFound } from 'next/navigation'

interface AdminMessagesPageProps {
  params: Promise<{ lang: string }>
}

export default async function AdminMessagesPage({ params }: AdminMessagesPageProps) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const session = await getAuthSession()
  if (!session?.user?.id || session.user.role !== 'OPERATOR') notFound()

  const operatorId = session.user.id

  // Get all clubs that have messages, with their messages
  const clubsWithMessages = await prisma.club.findMany({
    where: { supportMessages: { some: {} } },
    select: {
      id: true,
      name: true,
      supportMessages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          body: true,
          senderRole: true,
          createdAt: true,
          sender: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Get operator's read cursors (scoped to clubs with messages)
  const clubIdsWithMessages = clubsWithMessages.map((c) => c.id)
  const cursors = clubIdsWithMessages.length > 0
    ? await prisma.conversationReadCursor.findMany({
        where: { userId: operatorId, clubId: { in: clubIdsWithMessages } },
        select: { clubId: true, lastReadAt: true },
      })
    : []
  const cursorMap = new Map(cursors.map((c) => [c.clubId, c.lastReadAt]))

  const conversations: ConversationEntry[] = clubsWithMessages.map((club) => {
    const lastMsg = club.supportMessages[club.supportMessages.length - 1]
    const cursor = cursorMap.get(club.id)
    const unreadCount = cursor
      ? club.supportMessages.filter((m) => m.createdAt > cursor && m.senderRole !== 'OPERATOR').length
      : club.supportMessages.filter((m) => m.senderRole !== 'OPERATOR').length

    return {
      clubId: club.id,
      clubName: club.name,
      lastMessageBody: lastMsg?.body ?? '',
      lastMessageAt: lastMsg?.createdAt.toISOString() ?? '',
      unreadCount,
      messages: club.supportMessages.map((m) => ({
        id: m.id,
        body: m.body,
        senderRole: m.senderRole,
        senderName: m.sender?.name ?? null,
        createdAt: m.createdAt.toISOString(),
      })),
    }
  })

  // Sort: unread first, then by last message date
  conversations.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  })

  async function handleSend(clubId: string, body: string) {
    'use server'
    const result = await sendSupportMessage(clubId, body)
    return { success: result.success, error: result.success ? undefined : result.error }
  }

  async function handleMarkRead(clubId: string) {
    'use server'
    const session = await getAuthSession()
    if (!session?.user?.id) return
    await prisma.conversationReadCursor.upsert({
      where: { clubId_userId: { clubId, userId: session.user.id } },
      update: { lastReadAt: new Date() },
      create: { clubId, userId: session.user.id, lastReadAt: new Date() },
    })
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <AdminPageTitle title={t.admin.messages.title} />
      <ConversationQueue
        conversations={conversations}
        sendAction={handleSend}
        markReadAction={handleMarkRead}
        locale={uiLang}
        translations={{
          admin: t.admin.messages,
          chat: t.club.admin.messages,
        }}
      />
    </div>
  )
}
