import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

interface AdminDashboardPageProps {
  params: Promise<{ lang: string }>
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { lang } = await params
  const t = getTranslations(resolveUILang(lang))

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">{t.admin.dashboardTitle}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Full implementation in Epic 7.</p>
    </main>
  )
}
