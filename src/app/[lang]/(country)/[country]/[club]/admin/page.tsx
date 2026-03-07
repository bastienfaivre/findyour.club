import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

interface AdminPageProps {
  params: Promise<{ lang: string }>
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  return (
    <div>
      <h1 className="text-2xl font-bold">{t.club.admin.clubProfile.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.club.admin.clubProfile.placeholder}</p>
    </div>
  )
}
