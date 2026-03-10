import Link from 'next/link'
import type { SupportedLanguage } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { ACTIVITY_TYPES } from '@/lib/activity-types'
import { getCantonName } from '@/lib/server/canton-queries'
import {
  generateBreadcrumbJsonLd,
  BASE_URL,
} from '@/components/app/seo/metadata'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { ClubCard } from '@/components/app/directory/ClubCard'
import { prisma } from '@/server/db'

type CategoryLandingProps = {
  lang: string
  uiLang: SupportedLanguage
  country: string
  countryName: string
  activity?: string
  canton?: string
}

export async function CategoryLanding({
  lang,
  uiLang,
  country,
  countryName,
  activity,
  canton,
}: CategoryLandingProps) {
  const t = getTranslations(uiLang)
  const activityLabel = activity ? (t.activityTypes[activity] ?? activity) : null
  const cantonName = canton ? await getCantonName(canton, uiLang) : null

  // Build the page title
  let title: string
  if (activityLabel && cantonName) {
    title = `${activityLabel} — ${cantonName}, ${countryName}`
  } else if (activityLabel) {
    title = `${activityLabel} — ${t.seo.clubsIn} ${countryName}`
  } else if (cantonName) {
    title = `${t.seo.clubsIn} ${cantonName}, ${countryName}`
  } else {
    title = `${t.seo.clubsIn} ${countryName}`
  }

  // Build description
  let description: string
  if (activityLabel && cantonName) {
    description = t.seo.cantonActivityDescription
      .replace('{activity}', activityLabel)
      .replace('{canton}', cantonName)
      .replace('{country}', countryName)
  } else if (activityLabel) {
    description = t.seo.activityDescription
      .replace('{activity}', activityLabel)
      .replace('{country}', countryName)
  } else if (cantonName) {
    description = t.seo.cantonDescription
      .replace('{canton}', cantonName)
      .replace('{country}', countryName)
  } else {
    description = t.seo.countryDescription.replace('{country}', countryName)
  }

  // Query clubs matching the filters
  const clubs = await prisma.club.findMany({
    where: {
      status: 'ACTIVE',
      isPublished: true,
      forceOffline: false,
      country,
      ...(activity && { activityType: activity }),
      ...(canton && {
        location: { swissLocation: { cantonCode: canton } },
      }),
    },
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
  })

  // Build breadcrumbs
  const breadcrumbs = [
    { name: 'findyour.club', url: `${BASE_URL}/${lang}` },
    { name: countryName, url: `${BASE_URL}/${lang}/${country}` },
  ]
  if (cantonName && canton) {
    breadcrumbs.push({
      name: cantonName,
      url: `${BASE_URL}/${lang}/${country}/${canton.toLowerCase()}`,
    })
  }
  if (activityLabel && activity) {
    const base = canton
      ? `${BASE_URL}/${lang}/${country}/${canton.toLowerCase()}/${activity}`
      : `${BASE_URL}/${lang}/${country}/${activity}`
    breadcrumbs.push({ name: activityLabel, url: base })
  }
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs)

  // Get related activity types for cross-linking (only when not filtering by activity)
  const relatedActivities = !activity
    ? await prisma.club.groupBy({
        by: ['activityType'],
        where: {
          country,
          status: 'ACTIVE',
          isPublished: true,
          forceOffline: false,
          activityType: { not: null },
          ...(canton && { location: { swissLocation: { cantonCode: canton } } }),
        },
        _count: { id: true },
      })
    : []

  // Get related cantons for cross-linking (only when not filtering by canton)
  const relatedCantons = !canton
    ? await prisma.swissCanton.findMany({
        where: {
          locations: {
            some: {
              location: {
                clubs: {
                  some: {
                    country,
                    status: 'ACTIVE',
                    isPublished: true,
                    forceOffline: false,
                    ...(activity && { activityType: activity }),
                  },
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
      })
    : []

  const activityCountMap = new Map(
    relatedActivities.map((a) => [a.activityType, a._count.id]),
  )

  return (
    <div>
      <AdminPageTitle title={title} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
      <p className="text-muted-foreground mb-8">{description}</p>

      {/* Cross-link: activity types */}
      {relatedActivities.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{t.seo.browseByActivity}</h2>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.filter((slug) => activityCountMap.has(slug)).map(
              (slug) => {
                const href = canton
                  ? `/${lang}/${country}/${canton.toLowerCase()}/${slug}`
                  : `/${lang}/${country}/${slug}`
                return (
                  <Link
                    key={slug}
                    href={href}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                  >
                    {t.activityTypes[slug] ?? slug}
                    <span className="text-xs text-muted-foreground">
                      ({activityCountMap.get(slug)})
                    </span>
                  </Link>
                )
              },
            )}
          </div>
        </section>
      )}

      {/* Cross-link: cantons */}
      {relatedCantons.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{t.seo.browseByRegion}</h2>
          <div className="flex flex-wrap gap-2">
            {relatedCantons.map((c) => {
              const href = activity
                ? `/${lang}/${country}/${c.code.toLowerCase()}/${activity}`
                : `/${lang}/${country}/${c.code.toLowerCase()}`
              return (
                <Link
                  key={c.code}
                  href={href}
                  className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  {c.translations[0]?.name ?? c.code}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Club list */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          {t.directory.clubCount.replace('{count}', String(clubs.length))}
        </h2>
        {clubs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">{t.directory.noResults}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.directory.noResultsHint}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => {
              const actName = club.activityType
                ? (t.activityTypes[club.activityType] ?? club.activityType)
                : null
              const locName =
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
                  activityType={actName}
                  locationName={locName}
                  cantonName={null}
                  ariaLabel={club.name}
                />
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
