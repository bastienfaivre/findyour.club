import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { ChatThread, type ChatMessage } from '@/components/app/messaging/ChatThread'
import { sendClubMessage, markConversationRead } from '../actions'

const PAGE_SIZE = 10

interface ClubMessagesPageProps {
  params: Promise<{ lang: string; clubId: string }>
}

export default async function ClubMessagesPage({ params }: ClubMessagesPageProps) {
  const { lang, clubId } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const session = await getAuthSession()
  if (!session?.user?.id) notFound()

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true },
  })
  if (!club) notFound()

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE' },
    select: { id: true },
  })
  if (!membership) notFound()

  // Count total messages to know if there are older ones
  const totalCount = await prisma.supportMessage.count({ where: { clubId: club.id } })

  // Fetch only the last PAGE_SIZE messages
  const messages = await prisma.supportMessage.findMany({
    where: { clubId: club.id },
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

  // Mark conversation as read
  await markConversationRead(clubId)

  const chatMessages: ChatMessage[] = messages
    .reverse()
    .map((m) => ({
      id: m.id,
      body: m.body,
      senderRole: m.senderRole,
      senderName: m.sender?.name ?? null,
      createdAt: m.createdAt.toISOString(),
    }))

  const hasOlderMessages = totalCount > PAGE_SIZE

  async function handleSend(body: string) {
    'use server'
    const result = await sendClubMessage(clubId, body)
    return { success: result.success, error: result.success ? undefined : result.error }
  }

  async function loadOlderMessages(beforeId: string) {
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

    const remaining = await prisma.supportMessage.count({
      where: { clubId, createdAt: { lt: older[older.length - 1]?.createdAt ?? anchor.createdAt } },
    })

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
    <div className="w-full mx-auto max-w-2xl flex flex-col flex-1 min-h-0">
      <AdminPageTitle title={t.club.admin.messages.title} />
      <ChatThread
        messages={chatMessages}
        sendAction={handleSend}
        loadOlderAction={loadOlderMessages}
        hasOlderMessages={hasOlderMessages}
        isOperator={false}
        translations={t.club.admin.messages}
      />
    </div>
  )
}
