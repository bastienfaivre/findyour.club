import type { Metadata } from 'next'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { generatePlatformMetadata } from '@/components/app/seo/metadata'
import { CountryButton } from '@/components/app/directory/CountryButton'
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
      where: { status: 'ACTIVE' },
      _count: { id: true },
    }),
    prisma.club.groupBy({
      by: ['activityTypeId'],
      where: { status: 'ACTIVE', activityTypeId: { not: null } },
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
      {/* Hero */}
      <section className="mx-auto max-w-[560px] px-10 pb-10 pt-16 text-center">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">
          {t.platform.headline}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {t.platform.philosophy}
        </p>
      </section>

      {/* Stats bar */}
      <section className="mx-10 flex border-y">
        <div className="flex-1 py-5 text-center">
          <div className="text-2xl font-extrabold">{totalClubs}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            {t.platform.associations}
          </div>
        </div>
        <div className="flex-1 border-l py-5 text-center">
          <div className="text-2xl font-extrabold">{totalCountries}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            {t.platform.countriesLabel}
          </div>
        </div>
        <div className="flex-1 border-l py-5 text-center">
          <div className="text-2xl font-extrabold">{activityTypesCount.length}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            {t.platform.activityTypes}
          </div>
        </div>
        <div className="flex-1 border-l py-5 text-center">
          <div className="text-2xl font-extrabold">{t.platform.marketingSpendValue}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            {t.platform.marketingSpend}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="px-10 pb-10 pt-8">
        {/* Available now */}
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {t.platform.availableNow}
        </h2>
        <div className="mb-8 flex flex-wrap gap-[10px]">
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
        <div className="flex flex-wrap gap-[10px]">
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
