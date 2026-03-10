import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry, getCountryName } from '@/lib/country'
import { generateCategoryOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ lang: string; country: string }> }) {
  const { lang, country } = await params
  if (!isValidCountry(country)) {
    return generateCategoryOgImage({ title: 'findyour.club' })
  }

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const countryName = getCountryName(country, uiLang)

  return generateCategoryOgImage({
    title: `${t.seo.clubsIn} ${countryName}`,
    subtitle: t.seo.countryDescription.replace('{country}', countryName),
  })
}
