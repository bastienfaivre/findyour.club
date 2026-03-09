import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { ChatThread } from '@/components/app/messaging/ChatThread'
import { sendClubMessage, markConversationRead } from '../actions'

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

  // Fetch messages
  const messages = await prisma.supportMessage.findMany({
    where: { clubId: club.id },
    orderBy: { createdAt: 'asc' },
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

  const chatMessages = messages.map((m) => ({
    id: m.id,
    body: m.body,
    senderRole: m.senderRole,
    senderName: m.sender?.name ?? null,
    createdAt: m.createdAt.toISOString(),
  }))

  async function handleSend(body: string) {
    'use server'
    const result = await sendClubMessage(clubId, body)
    return { success: result.success, error: result.success ? undefined : result.error }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 -mb-4 sm:-mb-6 lg:-mb-8">
      <AdminPageTitle title={t.club.admin.messages.title} />
      <ChatThread
        messages={chatMessages}
        sendAction={handleSend}
        isOperator={false}
        translations={t.club.admin.messages}
      />
    </div>
  )
}
