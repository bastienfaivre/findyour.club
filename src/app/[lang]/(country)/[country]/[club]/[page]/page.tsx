import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry } from '@/lib/country'
import { getAuthSession } from '@/server/auth'
import { getClubPublicData, getClubOwnership } from '@/lib/server/club-queries'
import { getPageBySlug } from '@/lib/server/page-queries'
import { generateClubMetadata } from '@/components/app/seo/metadata'
import { ClubSidebarNav } from '@/components/app/club-site/ClubSidebarNav'
import { ElementRenderer } from '@/components/app/club-site/ElementRenderer'
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
    ? t.activityTypes[club.activityType.slug] ?? null
    : null

  return generateClubMetadata({
    clubName: club.name,
    clubDescription: club.welcomeText ?? page.label,
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

  return (
    <div
      className="flex min-h-screen"
      style={{
        '--primary': accentColor.primary,
        '--primary-foreground': accentColor.primaryForeground,
      } as React.CSSProperties}
    >
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
        currentPath={`${clubBase}/${pageSlug}`}
        isAdmin={isAdmin}
        t={t.clubSite}
      />

      <main className="flex-1 flex items-start justify-center pt-16 md:pt-0">
        <div className="max-w-4xl w-full px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">{page.label}</h1>
          {page.elements.length > 0 ? (
            <div className="flex flex-col gap-4">
              {page.elements.map(element => (
                <ElementRenderer key={element.id} element={element} />
              ))}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
