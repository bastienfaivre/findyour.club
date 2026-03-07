import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry } from '@/lib/country'
import { getClubPublicData } from '@/lib/server/club-queries'
import { generateClubMetadata } from '@/components/app/seo/metadata'
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
    clubDescription: club.description ?? club.name,
    clubLogoUrl: club.logoUrl,
    clubSlug: club.slug,
    country,
    lang,
    activityTypeLabel,
    pageTitle: 'Contact',
    pageSlug: 'contact',
  })
}

export default async function ContactPage({ params }: Props) {
  const { lang, country, club: slug } = await params

  if (!isValidCountry(country)) notFound()

  const club = await getClubPublicData(slug, country)
  if (!club) notFound()

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const accentColor = ACCENT_COLORS[club.accentColor] ?? ACCENT_COLORS.zinc

  return (
    <div
      className="py-16 lg:py-24"
      style={{
        '--primary': accentColor.primary,
        '--primary-foreground': accentColor.primaryForeground,
      } as React.CSSProperties}
    >
      <h1 className="text-2xl font-bold mb-6">{t.clubSite.contact}</h1>
      <div className="rounded-lg border bg-card p-6 text-card-foreground">
        <p className="text-muted-foreground">
          {club.name}
        </p>
      </div>
    </div>
  )
}
