import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from '@/components/app/AppSidebar'
import { AdminDirtyProvider } from '@/components/app/club-admin/AdminDirtyContext'
import { PageTitleProvider, PageTitleDisplay } from '@/components/app/admin/AdminPageTitle'
import { SearchStateProvider } from '@/components/app/SearchStateContext'
import { AdminSelectionProvider } from '@/components/app/AdminSelectionContext'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { lang } = await params
  const session = await getAuthSession()

  const isAuthenticated = !!session?.user
  const isOperator = session?.user?.role === 'OPERATOR'

  // Fetch user's active club memberships (only if authenticated)
  let clubs: Array<{ id: string; name: string; slug: string; country: string; unreadMessages: number }> = []
  let operatorUnreadMessages = 0

  if (session?.user?.id) {
    const memberships = await prisma.clubMembership.findMany({
      where: { userId: session.user.id, status: 'ACTIVE' },
      select: {
        club: {
          select: { id: true, name: true, slug: true, country: true },
        },
      },
      orderBy: { club: { name: 'asc' } },
    })

    // Fetch read cursors for all clubs the user is a member of
    const clubIds = memberships.map((m) => m.club.id)
    const readCursors = clubIds.length > 0
      ? await prisma.conversationReadCursor.findMany({
          where: { userId: session.user.id, clubId: { in: clubIds } },
          select: { clubId: true, lastReadAt: true },
        })
      : []
    const cursorMap = new Map(readCursors.map((c) => [c.clubId, c.lastReadAt]))

    // Count unread messages per club for this user
    const unreadCounts = clubIds.length > 0
      ? await Promise.all(
          clubIds.map(async (clubId) => {
            const lastRead = cursorMap.get(clubId)
            const count = await prisma.supportMessage.count({
              where: {
                clubId,
                senderId: { not: session.user!.id },
                ...(lastRead ? { createdAt: { gt: lastRead } } : {}),
              },
            })
            return { clubId, count }
          }),
        )
      : []
    const unreadMap = new Map(unreadCounts.map((u) => [u.clubId, u.count]))

    clubs = memberships.map((m) => ({
      ...m.club,
      unreadMessages: unreadMap.get(m.club.id) ?? 0,
    }))

    // Operator unread: count across all conversations
    if (isOperator) {
      // Get all active club IDs to satisfy the multi-tenant guard
      const allClubs = await prisma.club.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      })
      const allClubIds = allClubs.map((c) => c.id)

      if (allClubIds.length > 0) {
        const operatorCursors = await prisma.conversationReadCursor.findMany({
          where: { userId: session.user.id, clubId: { in: allClubIds } },
          select: { clubId: true, lastReadAt: true },
        })
        const opCursorMap = new Map(operatorCursors.map((c) => [c.clubId, c.lastReadAt]))

        // Count unread messages for operator
        const clubIdsWithCursor = operatorCursors.map((c) => c.clubId)
        const clubIdsWithoutCursor = allClubIds.filter((id) => !clubIdsWithCursor.includes(id))

        const [unreadWithCursor, unreadWithoutCursor] = await Promise.all([
          // For clubs with a cursor, count messages newer than cursor (parallel)
          clubIdsWithCursor.length > 0
            ? Promise.all(
                clubIdsWithCursor.map((clubId) =>
                  prisma.supportMessage.count({
                    where: {
                      clubId,
                      senderRole: 'CLUB_ADMIN',
                      createdAt: { gt: opCursorMap.get(clubId)! },
                    },
                  }),
                ),
              ).then((counts) => counts.reduce((sum, c) => sum + c, 0))
            : 0,
          // For clubs without a cursor, all club-admin messages are unread
          clubIdsWithoutCursor.length > 0
            ? prisma.supportMessage.count({
                where: {
                  clubId: { in: clubIdsWithoutCursor },
                  senderRole: 'CLUB_ADMIN',
                },
              })
            : 0,
        ])
        operatorUnreadMessages = unreadWithCursor + unreadWithoutCursor
      }
    }
  }

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  return (
    <SearchStateProvider>
      <AdminSelectionProvider>
      <AdminDirtyProvider>
        <PageTitleProvider>
          <SidebarProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg"
            >
              {t.layout.skipToContent}
            </a>
            <AppSidebar
              lang={lang}
              isAuthenticated={isAuthenticated}
              isOperator={isOperator}
              clubs={clubs}
              operatorUnreadMessages={operatorUnreadMessages}
              translations={{
                nav: t.nav,
                admin: t.admin,
                club: t.club.admin,
                layout: t.layout,
                theme: t.theme,
                auth: { accountSettings: t.auth.accountSettings, logout: t.nav.logout },
              }}
              totpEnabled={session?.user?.totpEnabled ?? false}
            />
          <SidebarInset className="h-svh overflow-hidden">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 !h-4" />
              <PageTitleDisplay />
            </header>
            <div id="main-content" className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </SidebarInset>
          </SidebarProvider>
        </PageTitleProvider>
      </AdminDirtyProvider>
      </AdminSelectionProvider>
    </SearchStateProvider>
  )
}
