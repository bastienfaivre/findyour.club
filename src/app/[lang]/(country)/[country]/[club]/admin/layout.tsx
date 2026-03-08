import { redirect, notFound } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { getClubBySlug, getClubActiveMembership } from '@/lib/server/club-queries'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { AdminSidebar } from '@/components/app/club-admin/AdminSidebar'
import { AdminDirtyProvider } from '@/components/app/club-admin/AdminDirtyContext'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string; country: string; club: string }>
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { lang, country, club: slug } = await params

  const session = await getAuthSession()
  if (!session?.user) redirect(`/${lang}/auth/login`)

  if (session.user.totpEnabled && !session.user.totpVerified) {
    redirect(`/${lang}/auth/totp`)
  }

  const club = await getClubBySlug(slug, country)
  if (!club) notFound()

  const membership = await getClubActiveMembership(session.user.id, club.id)
  if (!membership) notFound()

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const adminBasePath = `/${lang}/${country}/${slug}/admin`
  const publicClubPath = `/${lang}/${country}/${slug}`

  return (
    <AdminDirtyProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-md focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring"
          >
            {t.club.admin.skipToContent}
          </a>
          <AdminSidebar
            clubName={club.name}
            adminBasePath={adminBasePath}
            publicClubPath={publicClubPath}
            translations={t.club.admin}
          />
          <main id="main-content" className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminDirtyProvider>
  )
}
