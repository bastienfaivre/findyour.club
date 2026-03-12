import { prisma } from '@/server/db'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { UserQueue } from '@/components/app/admin/UserQueue'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

interface UsersPageProps {
  params: Promise<{ lang: string }>
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const rawUsers = await prisma.user.findMany({
    where: { email: { not: null } },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      preferredLanguage: true,
      role: true,
      memberships: {
        where: { status: 'ACTIVE' },
        select: {
          role: true,
          club: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { email: 'asc' },
  })

  const users = rawUsers.filter((u): u is typeof u & { email: string } => u.email !== null)

  return (
    <div className="flex flex-col h-full min-h-0">
      <AdminPageTitle title={t.admin.users.title} />
      <div className="flex-1 min-h-0">
        <UserQueue users={users} translations={t} locale={uiLang} />
      </div>
    </div>
  )
}
