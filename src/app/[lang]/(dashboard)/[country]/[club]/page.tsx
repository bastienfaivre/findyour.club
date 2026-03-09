import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry, getCountryName } from '@/lib/country'
import { getClubPublicData } from '@/lib/server/club-queries'
import { generateClubMetadata, generateClubJsonLd } from '@/components/app/seo/metadata'
import { ProfilePage } from '@/components/app/club-profile/ProfilePage'
import { ACCENT_COLORS } from '@/components/app/club-site/accent-colors'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

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

  const club = await getClubPublicData(slug, country)
  if (!club) notFound()

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const accentColor = ACCENT_COLORS[club.accentColor] ?? ACCENT_COLORS.zinc
  const activityTypeLabel = club.activityType
    ? t.activityTypes[club.activityType] ?? null
    : null
  const jsonLd = generateClubJsonLd({
    clubName: club.name,
    clubDescription: club.description ?? club.name,
    clubLogoUrl: club.logoUrl,
    clubSlug: club.slug,
    country,
    lang,
    countryName: getCountryName(country, uiLang),
    activityTypeLabel,
  })

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
    </div>
  )
}
