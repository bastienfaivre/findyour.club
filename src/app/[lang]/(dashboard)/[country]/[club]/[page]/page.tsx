import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry } from '@/lib/country'
import { getClubPublicData } from '@/lib/server/club-queries'
import { getPageBySlug } from '@/lib/server/page-queries'
import { generateClubMetadata } from '@/components/app/seo/metadata'
import { ElementRenderer } from '@/components/app/club-site/ElementRenderer'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { ACCENT_COLORS } from '@/components/app/club-site/accent-colors'

type Props = {
  params: Promise<{ lang: string; country: string; club: string; page: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, country, club: slug, page: pageSlug } = await params
  if (!isValidCountry(country)) return {}

  const club = await getClubPublicData(slug, country)
  if (!club) return {}

  const page = await getPageBySlug(pageSlug, club.id)
  if (!page) return {}

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const activityTypeLabel = club.activityType
    ? t.activityTypes[club.activityType] ?? null
    : null

  return generateClubMetadata({
    clubName: club.name,
    clubDescription: club.description ?? page.label,
    clubLogoUrl: club.logoUrl,
    clubSlug: club.slug,
    country,
    lang,
    activityTypeLabel,
    pageTitle: page.label,
    pageSlug: page.slug,
  })
}

export default async function InnerPage({ params }: Props) {
  const { lang, country, club: slug, page: pageSlug } = await params

  if (!isValidCountry(country)) notFound()

  const club = await getClubPublicData(slug, country)
  if (!club) notFound()

  const page = await getPageBySlug(pageSlug, club.id)
  if (!page) notFound()

  const accentColor = ACCENT_COLORS[club.accentColor] ?? ACCENT_COLORS.zinc

  return (
    <div
      className="py-8 sm:py-16 lg:py-24"
      style={{
        '--primary': accentColor.primary,
        '--primary-foreground': accentColor.primaryForeground,
      } as React.CSSProperties}
    >
      <AdminPageTitle title={`${club.name} — ${page.label}`} backHref={`/${lang}/${country}/${slug}`} />
      <h1 className="text-2xl font-bold mb-6">{page.label}</h1>
      {page.elements.length > 0 ? (
        <div className="flex flex-col gap-4">
          {page.elements.map(element => (
            <ElementRenderer key={element.id} element={element} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
