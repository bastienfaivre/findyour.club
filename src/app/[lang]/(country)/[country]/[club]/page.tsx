import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry, getCountryName } from '@/lib/country'
import { getClubPublicData } from '@/lib/server/club-queries'
import { generateClubMetadata, generateClubJsonLd } from '@/components/app/seo/metadata'
import { ClubHeroSection } from '@/components/app/club-site/ClubHeroSection'
import { ElementRenderer } from '@/components/app/club-site/ElementRenderer'
import { ACCENT_COLORS } from '@/components/app/club-site/accent-colors'
import { getHomePageElements } from '@/lib/server/page-queries'

type Props = {
  params: Promise<{ lang: string; country: string; club: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, country, club: slug } = await params
  if (!isValidCountry(country)) return {}

  const club = await getClubPublicData(slug, country)
  if (!club) return {}

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const activityTypeLabel = club.activityType
    ? t.activityTypes[club.activityType.slug] ?? null
    : null

  return generateClubMetadata({
    clubName: club.name,
    clubDescription: club.welcomeText ?? club.name,
    clubLogoUrl: club.logoUrl,
    clubSlug: club.slug,
    country,
    lang,
    activityTypeLabel,
  })
}

export default async function ClubPage({ params }: Props) {
  const { lang, country, club: slug } = await params

  if (!isValidCountry(country)) notFound()

  const club = await getClubPublicData(slug, country)
  if (!club) notFound()

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const clubBase = `/${lang}/${country}/${club.slug}`
  const accentColor = ACCENT_COLORS[club.accentColor] ?? ACCENT_COLORS.zinc
  const activityTypeLabel = club.activityType
    ? t.activityTypes[club.activityType.slug] ?? null
    : null
  const jsonLd = generateClubJsonLd({
    clubName: club.name,
    clubDescription: club.welcomeText ?? club.name,
    clubLogoUrl: club.logoUrl,
    clubSlug: club.slug,
    country,
    lang,
    countryName: getCountryName(country, uiLang),
    activityTypeLabel,
  })

  const homeElements = await getHomePageElements(club.id)

  return (
    <div
      className=""
      style={{
        '--primary': accentColor.primary,
        '--primary-foreground': accentColor.primaryForeground,
      } as React.CSSProperties}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ClubHeroSection
        club={{
          name: club.name,
          logoUrl: club.logoUrl,
          logoAlt: club.logoAlt,
          welcomeText: club.welcomeText,
        }}
        ctaLabel={t.clubSite.contactCta}
        ctaHref={`${clubBase}/contact`}
      />
      {homeElements.length > 0 && (
        <div className="flex flex-col gap-4 py-8">
          {homeElements.map(element => (
            <ElementRenderer key={element.id} element={element} />
          ))}
        </div>
      )}
    </div>
  )
}
