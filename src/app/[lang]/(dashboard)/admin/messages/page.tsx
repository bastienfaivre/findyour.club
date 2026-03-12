import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { ConversationQueue, type ConversationEntry } from '@/components/app/admin/ConversationQueue'
import { sendSupportMessage } from '../clubs/[id]/actions'
import { notFound } from 'next/navigation'
import type { ChatMessage } from '@/components/app/messaging/ChatThread'

const PAGE_SIZE = 10

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

  // Get all clubs that have messages — only load last PAGE_SIZE messages + total count per club
  const clubsWithMessages = await prisma.club.findMany({
    where: { supportMessages: { some: {} } },
    select: {
      id: true,
      name: true,
      _count: { select: { supportMessages: true } },
      supportMessages: {
        orderBy: { createdAt: 'desc' },
        take: PAGE_SIZE,
        select: {
          id: true,
          body: true,
          senderRole: true,
          createdAt: true,
          sender: { select: { name: true } },
        },
      },
      memberships: {
        where: { status: 'ACTIVE' },
        select: {
          role: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
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
    // Messages are in desc order from query, reverse for display
    const messagesAsc = [...club.supportMessages].reverse()
    const lastMsg = messagesAsc[messagesAsc.length - 1]
    const cursor = cursorMap.get(club.id)
    // Unread count is based on loaded messages — accurate for recent messages
    const unreadCount = cursor
      ? messagesAsc.filter((m) => m.createdAt > cursor && m.senderRole !== 'OPERATOR').length
      : messagesAsc.filter((m) => m.senderRole !== 'OPERATOR').length

    return {
      clubId: club.id,
      clubName: club.name,
      lastMessageBody: lastMsg?.body ?? '',
      lastMessageAt: lastMsg?.createdAt.toISOString() ?? '',
      unreadCount,
      hasOlderMessages: club._count.supportMessages > PAGE_SIZE,
      members: club.memberships.map((m) => ({
        role: m.role,
        user: m.user,
      })),
      messages: messagesAsc.map((m) => ({
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

  async function handleLoadOlder(clubId: string, beforeId: string) {
    'use server'
    const anchor = await prisma.supportMessage.findUnique({
      where: { id: beforeId },
      select: { createdAt: true },
    })
    if (!anchor) return { messages: [] as ChatMessage[], hasMore: false }

    const older = await prisma.supportMessage.findMany({
      where: { clubId, createdAt: { lt: anchor.createdAt } },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      select: {
        id: true,
        body: true,
        senderRole: true,
        createdAt: true,
        sender: { select: { name: true } },
      },
    })

    const remaining = older.length > 0
      ? await prisma.supportMessage.count({
          where: { clubId, createdAt: { lt: older[older.length - 1].createdAt } },
        })
      : 0

    return {
      messages: older.reverse().map((m) => ({
        id: m.id,
        body: m.body,
        senderRole: m.senderRole,
        senderName: m.sender?.name ?? null,
        createdAt: m.createdAt.toISOString(),
      })),
      hasMore: remaining > 0,
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <AdminPageTitle title={t.admin.messages.title} />
      <ConversationQueue
        conversations={conversations}
        sendAction={handleSend}
        markReadAction={handleMarkRead}
        loadOlderAction={handleLoadOlder}
        locale={uiLang}
        translations={{
          admin: t.admin.messages,
          chat: t.club.admin.messages,
          users: t.admin.users,
          searchPlaceholder: t.admin.searchPlaceholder,
          showingCount: t.admin.showingCount,
          showMore: t.admin.showMore,
          noResults: t.directory.noResults,
        }}
      />
    </div>
  )
}
