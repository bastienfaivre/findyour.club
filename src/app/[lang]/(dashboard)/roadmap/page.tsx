import type { Metadata } from 'next'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { generatePlatformMetadata } from '@/components/app/seo/metadata'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { Card, CardContent } from '@/components/ui/card'

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

export default async function RoadmapPage({ params }: Props) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  return (
    <>
      <AdminPageTitle title={t.nav.roadmap} />
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t.platform.roadmap.title}
          </h1>
        </div>

        <Card className="py-0 gap-0">
          <CardContent className="space-y-4 p-4">
            {t.platform.roadmap.content.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground text-justify">
                {paragraph}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
