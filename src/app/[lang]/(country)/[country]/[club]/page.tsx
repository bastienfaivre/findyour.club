import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry, getCountryName } from '@/lib/country'
import { getAuthSession } from '@/server/auth'
import { getClubPublicData, getClubOwnership } from '@/lib/server/club-queries'
import { generateClubMetadata, generateClubJsonLd } from '@/components/app/seo/metadata'
import { ClubHeroSection } from '@/components/app/club-site/ClubHeroSection'
import { ClubSidebarNav } from '@/components/app/club-site/ClubSidebarNav'
import { ACCENT_COLORS } from '@/components/app/club-site/accent-colors'

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

  const session = await getAuthSession()
  let isAdmin = false
  if (session?.user?.id) {
    isAdmin = !!(await getClubOwnership(session.user.id, club.id))
  }

  const clubBase = `/${lang}/${country}/${club.slug}`
  const swissLoc = club.location?.swissLocation
  const cityName = swissLoc?.translations.find(tr => tr.language === uiLang)?.name
    ?? swissLoc?.translations[0]?.name
    ?? null
  const locationLabel = [cityName, swissLoc?.cantonCode].filter(Boolean).join(', ') || null
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

  return (
    <div
      className="flex min-h-screen"
      style={{
        '--primary': accentColor.primary,
        '--primary-foreground': accentColor.primaryForeground,
      } as React.CSSProperties}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ClubSidebarNav
        club={{
          name: club.name,
          slug: club.slug,
          logoUrl: club.logoUrl,
          logoAlt: club.logoAlt,
        }}
        location={locationLabel}
        pages={club.pages.filter(p => !p.isAnchor)}
        clubBase={clubBase}
        currentPath={clubBase}
        isAdmin={isAdmin}
        t={t.clubSite}
      />

      <main className="flex-1 flex items-start justify-center pt-16 md:pt-0">
        <div className="max-w-4xl w-full">
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
        </div>
      </main>
    </div>
  )
}
