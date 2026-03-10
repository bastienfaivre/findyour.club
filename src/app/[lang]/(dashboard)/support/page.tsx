import type { Metadata } from 'next'
import { Heart } from 'lucide-react'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { generatePlatformMetadata } from '@/components/app/seo/metadata'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  params: Promise<{ lang: string }>
}

/**
 * Hardcoded platform costs and funding state.
 * Update these values when costs change or new contributions come in.
 */
const COSTS = {
  domain: 22.95,
  server: 64.80,
}
const TOTAL_PER_YEAR = COSTS.domain + COSTS.server

const FUNDED_UNTIL_LOCALIZED: Record<string, string> = {
  en: 'March 2027',
  fr: 'mars 2027',
  de: 'März 2027',
  it: 'marzo 2027',
}

type Contributor = {
  name: string
  url: string
  roles: Record<string, string>
}

const CONTRIBUTORS: Contributor[] = [
  {
    name: 'Bastien Faivre',
    url: 'https://bastienfaivre.com/',
    roles: {
      en: 'Founder & Developer',
      fr: 'Fondateur & Développeur',
      de: 'Gründer & Entwickler',
      it: 'Fondatore & Sviluppatore',
    },
  },
  {
    name: 'Clashware Sàrl',
    url: 'https://clashware.com/',
    roles: {
      en: 'Funded the first year (CHF 87.75)',
      fr: 'A financé la première année (CHF 87.75)',
      de: 'Hat das erste Jahr finanziert (CHF 87.75)',
      it: 'Ha finanziato il primo anno (CHF 87.75)',
    },
  },
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  return generatePlatformMetadata({
    title: t.platform.support.title,
    description: t.seo.supportDescription,
    path: `/${lang}/support`,
    lang,
  })
}

export default async function SupportPage({ params }: Props) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const s = t.platform.support

  const fundedDate = FUNDED_UNTIL_LOCALIZED[uiLang] ?? FUNDED_UNTIL_LOCALIZED.en

  return (
    <div className="py-8 sm:py-16 lg:py-24">
      <AdminPageTitle title={t.nav.support} />
      <div className="max-w-2xl space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {s.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {s.intro}
          </p>
        </div>

        {/* Cost breakdown */}
        <Card>
          <CardContent className="space-y-4 py-0">
            <h2 className="text-lg font-semibold">{s.costBreakdownTitle}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{s.domain}</span>
                <span className="font-medium tabular-nums">CHF {COSTS.domain.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{s.server}</span>
                <span className="font-medium tabular-nums">CHF {COSTS.server.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>{s.totalPerYear}</span>
                <span className="tabular-nums">CHF {TOTAL_PER_YEAR.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{s.costsDisclaimer}</p>
          </CardContent>
        </Card>

        {/* Funded until */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/30">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            {s.fundedUntil}
          </p>
          <p className="mt-1 text-2xl font-bold text-green-900 dark:text-green-200">
            {fundedDate}
          </p>
          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
            {s.fundedUntilDate.replace('{date}', fundedDate)}
          </p>
        </div>

        {/* Contributors */}
        <div>
          <h2 className="text-lg font-semibold">{s.contributorsTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{s.contributorsIntro}</p>
          <ul className="mt-4 space-y-2">
            {CONTRIBUTORS.map((c) => (
              <li key={c.name} className="flex items-center gap-3 rounded-lg border p-3">
                <Heart className="h-4 w-4 text-red-500 fill-red-500 shrink-0" />
                <div>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {c.name}
                  </a>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {c.roles[uiLang] ?? c.roles.en}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Call to action */}
        <div className="rounded-lg border bg-muted/50 p-5">
          <h2 className="font-semibold">{s.helpTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{s.helpText}</p>
        </div>
      </div>
    </div>
  )
}
