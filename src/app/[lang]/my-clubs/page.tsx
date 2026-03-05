import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { MyClubsList } from '@/components/app/my-clubs/MyClubsList'

interface MyClubsPageProps {
  params: Promise<{ lang: string }>
}

export default async function MyClubsPage({ params }: MyClubsPageProps) {
  const { lang } = await params
  const t = getTranslations(resolveUILang(lang))
  const session = await getAuthSession()
  if (!session?.user) redirect(`/${lang}/auth/login`)
  if (session.user.totpEnabled && !session.user.totpVerified) redirect(`/${lang}/auth/totp`)

  const headersList = await headers()
  const host = headersList.get('host') ?? ''

  const memberships = await prisma.clubMembership.findMany({
    where: { userId: session.user.id, status: 'ACTIVE' },
    include: {
      club: {
        select: { slug: true, country: true, name: true, logoUrl: true, logoAlt: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  if (memberships.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">
          {t.myClubs.noClubs}
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">{t.nav.myClubs}</h1>
        <MyClubsList memberships={memberships} host={host} lang={lang} />
      </div>
    </main>
  )
}
