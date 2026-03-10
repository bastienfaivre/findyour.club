import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry, getCountryName } from '@/lib/country'
import { isValidActivityType } from '@/lib/activity-types'
import { getClubPublicData } from '@/lib/server/club-queries'
import { isValidCanton } from '@/lib/server/canton-queries'
import {
  generateClubMetadata,
  generateClubJsonLd,
  generateBreadcrumbJsonLd,
  generateCategoryMetadata,
  BASE_URL,
} from '@/components/app/seo/metadata'
import { ProfilePage } from '@/components/app/club-profile/ProfilePage'
import { ACCENT_COLORS } from '@/components/app/club-site/accent-colors'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { CategoryLanding } from '@/components/app/seo/CategoryLanding'
import { SharePrompt } from '@/components/app/club-site/SharePrompt'

type Props = {
  params: Promise<{ lang: string; country: string; club: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, country, club: slug } = await params
  if (!isValidCountry(country)) return {}

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const countryName = getCountryName(country, uiLang)

  // Activity type landing page
  if (isValidActivityType(slug)) {
    const activityLabel = t.activityTypes[slug] ?? slug
    return generateCategoryMetadata({
      title: `${activityLabel} — ${t.seo.clubsIn} ${countryName}`,
      description: t.seo.activityDescription
        .replace('{activity}', activityLabel)
        .replace('{country}', countryName),
      lang,
      country,
      activity: slug,
    })
  }

  // Canton landing page
  if (await isValidCanton(slug.toUpperCase())) {
    return generateCategoryMetadata({
      title: `${t.seo.clubsIn} ${slug.toUpperCase()} — ${countryName}`,
      description: t.seo.cantonDescription
        .replace('{canton}', slug.toUpperCase())
        .replace('{country}', countryName),
      lang,
      country,
      canton: slug,
    })
  }

  // Club page
  const club = await getClubPublicData(slug, country)
  if (!club) return {}

  const activityTypeLabel = club.activityType
    ? t.activityTypes[club.activityType] ?? null
    : null

  return generateClubMetadata({
    clubName: club.name,
    clubDescription: club.description ?? club.name,
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

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const countryName = getCountryName(country, uiLang)

  // Activity type landing page
  if (isValidActivityType(slug)) {
    return (
      <CategoryLanding
        lang={lang}
        uiLang={uiLang}
        country={country}
        countryName={countryName}
        activity={slug}
      />
    )
  }

  // Canton landing page
  if (await isValidCanton(slug.toUpperCase())) {
    return (
      <CategoryLanding
        lang={lang}
        uiLang={uiLang}
        country={country}
        countryName={countryName}
        canton={slug.toUpperCase()}
      />
    )
  }

  // Club page
  const club = await getClubPublicData(slug, country)
  if (!club) notFound()

  const accentColor = ACCENT_COLORS[club.accentColor] ?? ACCENT_COLORS.zinc
  const activityTypeLabel = club.activityType
    ? t.activityTypes[club.activityType] ?? null
    : null

  const locationName =
    club.location?.swissLocation?.translations?.find((tr) => tr.language === uiLang)?.name
    ?? club.location?.swissLocation?.translations?.[0]?.name
    ?? null
  const cantonCode = club.location?.swissLocation?.cantonCode ?? null

  const jsonLd = generateClubJsonLd({
    clubName: club.name,
    clubDescription: club.description ?? club.name,
    clubLogoUrl: club.logoUrl,
    clubSlug: club.slug,
    country,
    lang,
    countryName,
    activityTypeLabel,
    locationName,
    cantonName: cantonCode,
    contactPhone: club.contactPhone,
    contactAddress: club.contactAddress,
    email: club.email,
    schedule: club.schedule,
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'findyour.club', url: `${BASE_URL}/${lang}` },
    { name: countryName, url: `${BASE_URL}/${lang}/${country}` },
    ...(activityTypeLabel && club.activityType
      ? [{ name: activityTypeLabel, url: `${BASE_URL}/${lang}/${country}/${club.activityType}` }]
      : []),
    { name: club.name, url: `${BASE_URL}/${lang}/${country}/${club.slug}` },
  ])

  return (
    <div
      style={{
        '--primary': accentColor.primary,
        '--primary-foreground': accentColor.primaryForeground,
      } as React.CSSProperties}
    >
      <AdminPageTitle title={club.name} backHref={`/${lang}/search?country=${country}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <ProfilePage
        club={{
          name: club.name,
          logoUrl: club.logoUrl,
          logoAlt: club.logoAlt,
          description: club.description,
          schedule: club.schedule,
          howToJoin: club.howToJoin,
          email: club.email,
          contactPhone: club.contactPhone,
          contactAddress: club.contactAddress,
          externalWebsiteUrl: club.externalWebsiteUrl,
          photos: club.photos,
        }}
        translations={{
          schedule: t.clubSite.schedule,
          howToJoin: t.clubSite.howToJoin,
          contactInfo: t.clubSite.contactInfo,
          email: t.clubSite.email,
          phone: t.clubSite.phone,
          address: t.clubSite.address,
          visitWebsite: t.clubSite.visitWebsite,
          photos: t.clubSite.photos,
          goToPhoto: t.clubSite.goToPhoto,
        }}
      />
      <SharePrompt
        clubName={club.name}
        clubUrl={`${BASE_URL}/${lang}/${country}/${club.slug}`}
        translations={{
          sharePrompt: t.clubSite.sharePrompt,
          shareButton: t.clubSite.shareButton,
          linkCopied: t.clubSite.linkCopied,
        }}
      />
    </div>
  )
}
