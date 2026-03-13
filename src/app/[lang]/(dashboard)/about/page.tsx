import type { Metadata } from 'next'
import { resolveUILang } from '@/lib/i18n'
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
    title: t.platform.about.title,
    description: t.seo.aboutDescription,
    path: `/${lang}/about`,
    lang,
  })
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  return (
    <div className="py-8 sm:py-16 lg:py-24">
      <AdminPageTitle title={t.nav.about} />
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t.platform.about.title}
        </h1>
        {t.platform.about.content.map((paragraph, i) => (
          <p key={i} className="mt-6 text-lg leading-relaxed text-muted-foreground text-justify">
            {paragraph}
          </p>
        ))}
        <p className="mt-8 text-base font-medium italic text-muted-foreground">
          {t.platform.about.author}
        </p>
        {/* TODO: uncomment when video is ready
        <div className="mt-8">
          <YouTubeEmbed videoId="dQw4w9WgXcQ" title="About findyour.club" />
        </div>
        */}
      </div>
    </div>
  )
}
