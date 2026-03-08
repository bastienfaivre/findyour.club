import type { Metadata } from 'next'
import { Suspense } from 'react'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import type { Country } from '@/lib/country'
import { isValidCountry, getCountryName, countryCodeToFlag } from '@/lib/country'
import { generateDirectoryMetadata } from '@/components/app/seo/metadata'
import { ClubCard, ClubCardSkeleton } from '@/components/app/directory/ClubCard'
import { DirectoryFilters } from '@/components/app/directory/DirectoryFilters'
import { PublicLayout } from '@/components/layout/public-layout'
import { prisma } from '@/server/db'

type Props = {
  params: Promise<{ lang: string; country: string }>
  searchParams: Promise<{ activity?: string; canton?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, country } = await params
  if (!isValidCountry(country)) return {}
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const countryName = getCountryName(country, uiLang)
  return generateDirectoryMetadata({
    title: t.directory.title.replace('{country}', countryName),
    description: t.directory.description.replace('{country}', countryName),
    path: `/${lang}/${country}`,
    lang,
    country,
  })
}

export default async function CountryDirectoryPage({ params, searchParams }: Props) {
  const { lang, country } = await params

  const { activity, canton } = await searchParams
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const validCountry = country as Country
  const countryName = getCountryName(validCountry, uiLang)

  const [clubs, cantons, activityTypes] = await Promise.all([
    prisma.club.findMany({
      where: {
        country,
        status: 'ACTIVE',
        isPublished: true,
        forceOffline: false,
        ...(activity && { activityType: { slug: activity } }),
        ...(canton && {
          location: { swissLocation: { cantonCode: canton } },
        }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        logoAlt: true,
        activityType: { select: { slug: true } },
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
            location: { clubs: { some: { country, status: 'ACTIVE', isPublished: true, forceOffline: false } } },
          },
        },
      },
      select: {
        code: true,
        translations: { where: { language: uiLang }, select: { name: true } },
      },
      orderBy: { code: 'asc' },
    }),
    prisma.activityType.findMany({
      where: {
        clubs: { some: { country, status: 'ACTIVE', isPublished: true, forceOffline: false } },
      },
      select: { slug: true },
      orderBy: { slug: 'asc' },
    }),
  ])

  const cantonOptions = cantons.map((c) => ({
    code: c.code,
    name: c.translations[0]?.name ?? c.code,
  }))

  const activityOptions = activityTypes.map((a) => ({
    slug: a.slug,
    name: t.activityTypes[a.slug] ?? a.slug,
  }))

  return (
    <PublicLayout
      skipToContentLabel={t.layout.skipToContent}
      navbarProps={{
        title: `${countryCodeToFlag(validCountry)} ${countryName}`,
        titleHref: `/${lang}/${country}`,
        navItems: [],
        ctaLabel: t.nav.apply,
        ctaHref: `/${lang}/apply`,
        lang,
        translations: t.layout,
      }}
      footerProps={{ lang }}
    >
    <div className="py-16 lg:py-24">
      <h1 className="text-2xl font-bold mb-6">
        {t.directory.title.replace('{country}', countryName)}
      </h1>

      <Suspense fallback={null}>
        <DirectoryFilters
          cantons={cantonOptions}
          activityTypes={activityOptions}
          lang={lang}
          country={country}
          labels={{
            filterCanton: t.directory.filterCanton,
            filterActivity: t.directory.filterActivity,
            allCantons: t.directory.allCantons,
            allActivities: t.directory.allActivities,
            resetFilters: t.directory.resetFilters,
          }}
        />
      </Suspense>

      <p className="mt-4 text-sm text-muted-foreground">
        {t.directory.clubCount.replace('{count}', String(clubs.length))}
      </p>

      {clubs.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">{t.directory.noResults}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.directory.noResultsHint}
          </p>
          {(activity || canton) && (
            <a
              href={`/${lang}/${country}`}
              className="mt-3 inline-block text-sm text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {t.directory.resetFilters}
            </a>
          )}
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <ClubCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => {
              const activitySlug = club.activityType?.slug
              const activityName = activitySlug
                ? (t.activityTypes[activitySlug] ?? activitySlug)
                : null
              const locationName =
                club.location?.swissLocation?.translations[0]?.name ?? null
              const cantonCode =
                club.location?.swissLocation?.cantonCode ?? null
              const cantonLabel = cantonCode
                ? (cantonOptions.find((c) => c.code === cantonCode)?.name ?? cantonCode)
                : null

              return (
                <ClubCard
                  key={club.id}
                  name={club.name}
                  slug={club.slug}
                  country={country}
                  lang={lang}
                  logoUrl={club.logoUrl}
                  logoAlt={club.logoAlt}
                  activityType={activityName}
                  locationName={locationName}
                  cantonName={cantonLabel}
                  ariaLabel={t.directory.clubAriaLabel
                    .replace('{name}', club.name)
                    .replace('{activity}', activityName ?? '')
                    .replace('{location}', locationName ?? '')}
                />
              )
            })}
          </div>
        </Suspense>
      )}
    </div>
    </PublicLayout>
  )
}
