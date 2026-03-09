import type { Metadata } from 'next'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { generatePlatformMetadata } from '@/components/app/seo/metadata'
import { CountryButton } from '@/components/app/directory/CountryButton'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { Card, CardContent } from '@/components/ui/card'
import { RotatingWords } from '@/components/app/RotatingWords'
import { prisma } from '@/server/db'
import {
  SUPPORTED_COUNTRIES,
  getCountryName,
  COMING_SOON_COUNTRIES,
  getComingSoonCountryName,
} from '@/lib/country'

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  return generatePlatformMetadata({
    title: t.platform.headline,
    description: t.platform.philosophy,
    path: `/${lang}`,
    lang,
  })
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const [clubsByCountry, activityTypesCount] = await Promise.all([
    prisma.club.groupBy({
      by: ['country'],
      where: { status: 'ACTIVE', isPublished: true, forceOffline: false },
      _count: { id: true },
    }),
    prisma.club.groupBy({
      by: ['activityType'],
      where: { status: 'ACTIVE', isPublished: true, forceOffline: false, activityType: { not: null } },
    }),
  ])

  const countryClubCounts = new Map(
    clubsByCountry.map((g) => [g.country, g._count.id])
  )

  const totalClubs = clubsByCountry.reduce((sum, g) => sum + g._count.id, 0)
  const totalCountries = clubsByCountry.length

  const countries = SUPPORTED_COUNTRIES.map((code) => ({
    code,
    name: getCountryName(code, uiLang),
    clubCount: countryClubCounts.get(code) ?? 0,
  }))

  const comingSoonCountries = COMING_SOON_COUNTRIES.map((code) => ({
    code,
    name: getComingSoonCountryName(code, uiLang),
  }))

  return (
    <>
      <AdminPageTitle title={t.nav.home} />
      {/* Hero */}
      <section className="py-8 sm:py-16 lg:py-24 text-center">
        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            <RotatingWords
              prefix={t.platform.headlinePrefix}
              words={t.platform.headlineRotatingWords}
            />
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            {t.platform.tagline}
          </p>
          <p className="mt-1 text-base font-medium text-foreground">
            {t.platform.philosophy}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto grid max-w-xl grid-cols-3 gap-2 sm:gap-4">
        {[
          { value: totalClubs, label: t.platform.associations },
          { value: totalCountries, label: t.platform.countriesLabel },
          { value: activityTypesCount.length, label: t.platform.activityTypes },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex flex-col items-center gap-1 py-0">
              <span className="text-2xl font-extrabold">{stat.value}</span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Countries */}
      <section className="py-8 sm:py-16 lg:py-24 text-center">
        {/* Available now */}
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {t.platform.availableNow}
        </h2>
        <div className="mb-8 flex flex-wrap justify-center gap-[10px]">
          {countries.map((c) => (
            <CountryButton
              key={c.code}
              country={c.code}
              countryName={c.name}
              clubCountLabel={t.platform.stats.clubs.replace('{count}', String(c.clubCount))}
              ariaLabel={t.platform.exploreCountry.replace('{country}', c.name)}
              lang={lang}
            />
          ))}
        </div>

        {/* Coming soon */}
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {t.platform.comingSoon}
        </h2>
        <div className="flex flex-wrap justify-center gap-[10px]">
          {comingSoonCountries.map((c) => (
            <CountryButton
              key={c.code}
              country={c.code}
              countryName={c.name}
              clubCountLabel={t.platform.comingSoon}
              ariaLabel={c.name}
              lang={lang}
              comingSoon
            />
          ))}
        </div>
      </section>
    </>
  )
}
