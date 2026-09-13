import type { Metadata } from 'next'
import { resolveUILang, SUPPORTED_LANGUAGES } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import {
  generatePlatformMetadata,
  generateWebSiteJsonLd,
  generatePlatformOrgJsonLd,
} from '@/components/app/seo/metadata'
import { CountryButton } from '@/components/app/directory/CountryButton'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { RotatingWords } from '@/components/app/RotatingWords'
import { HomeCitySearch } from '@/components/app/HomeCitySearch'
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
    description: t.seo.homeDescription,
    path: `/${lang}`,
    lang,
  })
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }))
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const clubsByCountry = await prisma.club.groupBy({
    by: ['country'],
    where: { status: 'ACTIVE', isPublished: true, forceOffline: false },
    _count: { id: true },
  })

  const countryClubCounts = new Map(
    clubsByCountry.map((g) => [g.country, g._count.id])
  )

  const countries = SUPPORTED_COUNTRIES.map((code) => ({
    code,
    name: getCountryName(code, uiLang),
    clubCount: countryClubCounts.get(code) ?? 0,
  }))

  const comingSoonCountries = COMING_SOON_COUNTRIES.map((code) => ({
    code,
    name: getComingSoonCountryName(code, uiLang),
  }))

  const webSiteJsonLd = generateWebSiteJsonLd(lang)
  const orgJsonLd = generatePlatformOrgJsonLd()

  return (
    <>
      <AdminPageTitle title={t.nav.home} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, '\\u003c') }}
      />
    <div className="w-full mx-auto max-w-2xl space-y-4">
      {/* Hero */}
      <div className="rounded-xl border p-4 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
          <RotatingWords
            prefix={t.platform.headlinePrefix}
            words={t.platform.headlineRotatingWords}
          />
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{t.platform.taglineBullets.intro}</p>
        <p className="mt-2 text-lg font-semibold tracking-wide text-foreground">{t.platform.taglineBullets.slogan}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t.platform.taglineBullets.subtitle} {t.platform.taglineBullets.closing}</p>
      </div>

      {/* City search */}
      <div className="rounded-xl border p-4">
        <HomeCitySearch
          lang={lang}
          placeholder={t.platform.searchCityPlaceholder}
          buttonLabel={t.platform.searchCityButton}
        />
      </div>

      {/* Countries */}
      <div className="rounded-xl border p-4 text-center">
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

        {comingSoonCountries.length > 0 && (
          <>
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
          </>
        )}

        <p className="mt-8 text-sm text-muted-foreground">
          {t.platform.trustLine}
        </p>
      </div>
    </div>
    </>
  )
}
