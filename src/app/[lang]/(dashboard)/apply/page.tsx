import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { ACTIVITY_TYPES } from '@/lib/activity-types'
import { ApplyForm } from '@/components/app/apply/ApplyForm'
import { SUPPORTED_COUNTRIES, getCountryName } from '@/lib/country'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { generatePlatformMetadata } from '@/components/app/seo/metadata'

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  return generatePlatformMetadata({
    title: t.apply.title,
    description: t.seo.applyDescription,
    path: `/${lang}/apply`,
    lang,
  })
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const activityTypes = ACTIVITY_TYPES
    .map((slug) => ({
      slug,
      name: t.activityTypes[slug] ?? slug,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, uiLang))

  const benefits = [
    t.apply.benefits.free,
    t.apply.benefits.verified,
    t.apply.benefits.simple,
    t.apply.benefits.visible,
  ]

  return (
    <div className="py-8 sm:py-16 lg:py-24">
      <AdminPageTitle title={t.nav.apply} />
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t.apply.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {t.apply.subtitle}
        </p>

        <ul className="mt-6 space-y-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              <span className="text-sm">{benefit}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm font-medium">{t.apply.noCatch}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.apply.reviewCommitment}
        </p>

        <div className="mt-10">
          <ApplyForm
            lang={uiLang}
            t={t}
            activityTypes={activityTypes}
            countries={SUPPORTED_COUNTRIES.map((code) => ({
              code,
              label: getCountryName(code, uiLang),
            }))}
          />
        </div>
      </div>
    </div>
  )
}
