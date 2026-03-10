import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry, getCountryName } from '@/lib/country'
import {
  generateCategoryMetadata,
  generateBreadcrumbJsonLd,
  BASE_URL,
} from '@/components/app/seo/metadata'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { ClubCard } from '@/components/app/directory/ClubCard'
import { prisma } from '@/server/db'
import { ACTIVITY_TYPES } from '@/lib/activity-types'
import Link from 'next/link'

type Props = {
  params: Promise<{ lang: string; country: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, country } = await params
  if (!isValidCountry(country)) return {}

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const countryName = getCountryName(country, uiLang)

  return generateCategoryMetadata({
    title: `${t.seo.clubsIn} ${countryName} — Clashware`,
    description: t.seo.countryDescription.replace('{country}', countryName),
    lang,
    country,
  })
}

export default async function CountryLandingPage({ params }: Props) {
  const { lang, country } = await params
  if (!isValidCountry(country)) notFound()

  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const countryName = getCountryName(country, uiLang)

  const [clubs, cantons, activityCounts] = await Promise.all([
    prisma.club.findMany({
      where: { status: 'ACTIVE', isPublished: true, forceOffline: false, country },
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        logoUrl: true,
        logoAlt: true,
        activityType: true,
        location: {
          select: {
            swissLocation: {
              select: {
                cantonCode: true,
                translations: { where: { language: uiLang }, select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.swissCanton.findMany({
      where: {
        locations: {
          some: {
            location: {
              clubs: {
                some: { country, status: 'ACTIVE', isPublished: true, forceOffline: false },
              },
            },
          },
        },
      },
      select: {
        code: true,
        translations: { where: { language: uiLang }, select: { name: true } },
      },
      orderBy: { code: 'asc' },
    }),
    prisma.club.groupBy({
      by: ['activityType'],
      where: { country, status: 'ACTIVE', isPublished: true, forceOffline: false, activityType: { not: null } },
      _count: { id: true },
    }),
  ])

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Clashware', url: `${BASE_URL}/${lang}` },
    { name: countryName, url: `${BASE_URL}/${lang}/${country}` },
  ])

  const activityCountMap = new Map(activityCounts.map((a) => [a.activityType, a._count.id]))

  return (
    <div>
      <AdminPageTitle title={`${t.seo.clubsIn} ${countryName}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />

      <h1 className="text-3xl font-bold tracking-tight mb-2">
        {t.seo.clubsIn} {countryName}
      </h1>
      <p className="text-muted-foreground mb-8">
        {t.seo.countryDescription.replace('{country}', countryName)}
      </p>

      {/* Activity type links */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">{t.seo.browseByActivity}</h2>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TYPES.filter((slug) => activityCountMap.has(slug)).map((slug) => (
            <Link
              key={slug}
              href={`/${lang}/${country}/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              {t.activityTypes[slug] ?? slug}
              <span className="text-xs text-muted-foreground">({activityCountMap.get(slug)})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Canton links */}
      {cantons.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{t.seo.browseByRegion}</h2>
          <div className="flex flex-wrap gap-2">
            {cantons.map((c) => (
              <Link
                key={c.code}
                href={`/${lang}/${country}/${c.code.toLowerCase()}`}
                className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                {c.translations[0]?.name ?? c.code}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All clubs */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          {t.directory.clubCount.replace('{count}', String(clubs.length))}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => {
            const activityName = club.activityType
              ? (t.activityTypes[club.activityType] ?? club.activityType)
              : null
            const locationName =
              club.location?.swissLocation?.translations[0]?.name ?? null

            return (
              <ClubCard
                key={club.id}
                name={club.name}
                slug={club.slug}
                country={club.country}
                countryName={countryName}
                lang={lang}
                logoUrl={club.logoUrl}
                logoAlt={club.logoAlt}
                activityType={activityName}
                locationName={locationName}
                cantonName={null}
                ariaLabel={club.name}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}
