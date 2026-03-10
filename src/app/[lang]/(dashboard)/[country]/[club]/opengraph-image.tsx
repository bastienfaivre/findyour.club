import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry } from '@/lib/country'
import { getClubPublicData } from '@/lib/server/club-queries'
import { generateClubOgImage, generateStaticOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; country: string; club: string }>
}) {
  const { lang, country, club: slug } = await params

  if (!isValidCountry(country)) {
    return generateStaticOgImage({ title: 'findyour.club' })
  }

  const club = await getClubPublicData(slug, country)
  if (!club) {
    return generateStaticOgImage({ title: 'findyour.club' })
  }

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const activityTypeLabel = club.activityType
    ? t.activityTypes[club.activityType] ?? null
    : null

  const swiss = club.location?.swissLocation
  const locationTranslation = swiss?.translations?.find(
    (tr) => tr.language === uiLang,
  )
  const locationName = swiss
    ? locationTranslation?.name ?? swiss.cantonCode
    : null

  return generateClubOgImage({
    clubName: club.name,
    activityType: activityTypeLabel,
    location: locationName,
  })
}
