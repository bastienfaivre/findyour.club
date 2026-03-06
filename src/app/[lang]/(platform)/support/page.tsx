import type { Metadata } from 'next'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { generatePlatformMetadata } from '@/components/app/seo/metadata'

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  return generatePlatformMetadata({
    title: t.platform.support.title,
    description: t.platform.support.donationHeadline,
    path: `/${lang}/support`,
    lang,
  })
}

export default async function SupportPage({ params }: Props) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t.platform.support.title}
      </h1>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">
          {t.platform.support.donationHeadline}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {t.platform.support.donationText}
        </p>
      </section>

      <section className="mt-12 rounded-xl border bg-muted/50 p-6">
        <p className="text-muted-foreground">
          {t.platform.support.supportFormPlaceholder}
        </p>
      </section>
    </div>
  )
}
