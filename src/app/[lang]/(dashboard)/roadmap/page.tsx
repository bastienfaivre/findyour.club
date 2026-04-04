import type { Metadata } from 'next'
import { resolveUILang, SUPPORTED_LANGUAGES } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { generatePlatformMetadata } from '@/components/app/seo/metadata'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  return generatePlatformMetadata({
    title: t.platform.roadmap.title,
    description: t.seo.roadmapDescription,
    path: `/${lang}/roadmap`,
    lang,
  })
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }))
}

export default async function RoadmapPage({ params }: Props) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  return (
    <>
      <AdminPageTitle title={t.nav.roadmap} />
      <div className="w-full mx-auto max-w-2xl space-y-4">
        <div className="rounded-xl border p-4 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {t.platform.roadmap.title}
          </h1>
          {t.platform.roadmap.content.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground text-justify">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </>
  )
}
