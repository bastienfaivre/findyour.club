import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

interface AdminSettingsPageProps {
  params: Promise<{ lang: string }>
}

export default async function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  return (
    <div>
      <h1 className="text-2xl font-bold">{t.club.admin.settings.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.club.admin.settings.placeholder}</p>
    </div>
  )
}
