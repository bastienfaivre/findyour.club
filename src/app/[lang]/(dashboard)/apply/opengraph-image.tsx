import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { generateStaticOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = getTranslations(resolveUILang(lang))

  return generateStaticOgImage({
    title: t.apply.title,
    subtitle: t.seo.applyDescription,
  })
}
