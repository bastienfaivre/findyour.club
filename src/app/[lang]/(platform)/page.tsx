import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">{t.nav.home}</h1>
      <p className="mt-2 text-muted-foreground">TODO: Implement in Epic 3</p>
    </div>
  )
}
