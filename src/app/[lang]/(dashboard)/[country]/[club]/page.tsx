import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry, getCountryName } from '@/lib/country'
import { isValidActivityType } from '@/lib/activity-types'
import { getClubPublicData } from '@/lib/server/club-queries'
import { isValidCanton } from '@/lib/server/canton-queries'
import { trackPageEvent } from '@/lib/server/page-tracking'
import {
  generateClubMetadata,
  generateClubJsonLd,
  generateBreadcrumbJsonLd,
  BASE_URL,
} from '@/components/app/seo/metadata'
import { ProfilePage } from '@/components/app/club-profile/ProfilePage'
import { ACCENT_COLORS } from '@/components/app/club-site/accent-colors'
import { SharePrompt } from '@/components/app/club-site/SharePrompt'
import { SearchBackTitle } from '@/components/app/club-profile/SearchBackTitle'
import { VERIFICATION_CYCLE_DAYS } from '@/lib/verification'

type Props = {
  params: Promise<{ lang: string; country: string; club: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, country, club: slug } = await params
  if (!isValidCountry(country)) return {}

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  // Activity type landing page (redirected at runtime)
  if (isValidActivityType(slug)) {
    return {}
  }

  // Canton landing page (redirected at runtime)
  if (await isValidCanton(slug.toUpperCase())) {
    return {}
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

  // Redirect activity type pages to /search
  if (isValidActivityType(slug)) {
    redirect(`/${lang}/search?country=${country}&activity=${slug}`)
  }

  // Redirect canton pages to /search
  if (await isValidCanton(slug.toUpperCase())) {
    redirect(`/${lang}/search?country=${country}&canton=${slug.toUpperCase()}`)
  }

  // Club page
  const club = await getClubPublicData(slug, country)
  if (!club) notFound()

  // Track page view (fire-and-forget, server-side, no cookies)
  const hdrs = await headers()
  trackPageEvent({
    clubId: club.id,
    pageSlug: slug,
    eventType: 'page_view',
    ip: hdrs.get('x-forwarded-for')?.split(',')[0]?.trim(),
    referrer: hdrs.get('referer'),
    country,
  })

  const accentColor = ACCENT_COLORS[club.accentColor] ?? ACCENT_COLORS.zinc
  const isVerificationExpired = !club.lastVerifiedAt
    || Math.floor((new Date().getTime() - new Date(club.lastVerifiedAt).getTime()) / (1000 * 60 * 60 * 24)) >= VERIFICATION_CYCLE_DAYS
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
      <SearchBackTitle title={club.name} lang={lang} defaultCountry={country} />
      {isVerificationExpired && (
        <div role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          {t.clubSite.freshnessExpiredBanner}
        </div>
      )}
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
          instagramUrl: club.instagramUrl,
          facebookUrl: club.facebookUrl,
          xUrl: club.xUrl,
          tiktokUrl: club.tiktokUrl,
          discordUrl: club.discordUrl,
          youtubeUrl: club.youtubeUrl,
          whatsappUrl: club.whatsappUrl,
          telegramUrl: club.telegramUrl,
          githubUrl: club.githubUrl,
          photos: club.photos,
          activityTypeLabel,
          country,
          countryName,
          cantonCode,
          locationName,
        }}
        translations={{
          description: t.clubSite.description,
          schedule: t.clubSite.schedule,
          howToJoin: t.clubSite.howToJoin,
          contactInfo: t.clubSite.contactInfo,
          email: t.clubSite.email,
          phone: t.clubSite.phone,
          address: t.clubSite.address,
          visitWebsite: t.clubSite.visitWebsite,
          photos: t.clubSite.photos,
          goToPhoto: t.clubSite.goToPhoto,
          closeLightbox: t.clubSite.closeLightbox,
        }}
      />
      <SharePrompt
        clubName={club.name}
        clubUrl={`${BASE_URL}/${lang}/${country}/${club.slug}`}
        translations={{
          shareButton: t.clubSite.shareButton,
          linkCopied: t.clubSite.linkCopied,
        }}
      />
    </div>
  )
}
