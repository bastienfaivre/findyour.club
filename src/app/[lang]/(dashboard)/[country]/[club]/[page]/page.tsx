import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry, getCountryName } from '@/lib/country'
import { isValidActivityType } from '@/lib/activity-types'
import { isValidCanton } from '@/lib/server/canton-queries'
import { getClubPublicData } from '@/lib/server/club-queries'
import { getPageBySlug } from '@/lib/server/page-queries'
import { trackPageEvent } from '@/lib/server/page-tracking'
import { generateClubMetadata, generateCategoryMetadata } from '@/components/app/seo/metadata'
import { ElementRenderer } from '@/components/app/club-site/ElementRenderer'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { ACCENT_COLORS } from '@/components/app/club-site/accent-colors'

type Props = {
  params: Promise<{ lang: string; country: string; club: string; page: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, country, club: parentSlug, page: pageSlug } = await params
  if (!isValidCountry(country)) return {}

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const countryName = getCountryName(country, uiLang)

  // Canton + activity type landing page
  if (await isValidCanton(parentSlug.toUpperCase())) {
    if (isValidActivityType(pageSlug)) {
      const activityLabel = t.activityTypes[pageSlug] ?? pageSlug
      return generateCategoryMetadata({
        title: `${activityLabel} — ${parentSlug.toUpperCase()}, ${countryName}`,
        description: t.seo.cantonActivityDescription
          .replace('{activity}', activityLabel)
          .replace('{canton}', parentSlug.toUpperCase())
          .replace('{country}', countryName),
        lang,
        country,
        canton: parentSlug,
        activity: pageSlug,
      })
    }
    return {}
  }

  // Regular club inner page
  const club = await getClubPublicData(parentSlug, country)
  if (!club) return {}

  const page = await getPageBySlug(pageSlug, club.id)
  if (!page) return {}

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
  const { lang, country, club: parentSlug, page: pageSlug } = await params

  if (!isValidCountry(country)) notFound()

  // Canton + activity type landing page — redirect to /search
  if (await isValidCanton(parentSlug.toUpperCase())) {
    if (isValidActivityType(pageSlug)) {
      redirect(`/${lang}/search?country=${country}&canton=${parentSlug.toUpperCase()}&activity=${pageSlug}`)
    }
    notFound()
  }

  // Regular club inner page
  const club = await getClubPublicData(parentSlug, country)
  if (!club) notFound()

  const page = await getPageBySlug(pageSlug, club.id)
  if (!page) notFound()

  // Track page view (fire-and-forget, server-side, no cookies)
  const hdrs = await headers()
  trackPageEvent({
    clubId: club.id,
    pageSlug: `${parentSlug}/${pageSlug}`,
    eventType: 'page_view',
    ip: hdrs.get('x-forwarded-for')?.split(',')[0]?.trim(),
    referrer: hdrs.get('referer'),
    country,
  })

  const accentColor = ACCENT_COLORS[club.accentColor] ?? ACCENT_COLORS.zinc

  return (
    <div
      className="w-full mx-auto max-w-3xl space-y-4"
      style={{
        '--primary': accentColor.primary,
        '--primary-foreground': accentColor.primaryForeground,
      } as React.CSSProperties}
    >
      <AdminPageTitle title={`${club.name} — ${page.label}`} backHref={`/${lang}/${country}/${parentSlug}`} />
      <div className="rounded-xl border p-4">
        <h1 className="text-2xl font-bold">{page.label}</h1>
      </div>
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
