import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ClipboardList, SearchX } from 'lucide-react'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { generatePlatformMetadata } from '@/components/app/seo/metadata'
import { SharePlatformButton } from '@/components/app/SharePlatformButton'
import { Button } from '@/components/ui/button'
import { ClubCard, ClubCardSkeleton } from '@/components/app/directory/ClubCard'
import { PaginatedGrid } from '@/components/app/directory/PaginatedGrid'
import { DirectoryFilters } from '@/components/app/directory/DirectoryFilters'
import { VerifiedBadge } from '@/components/app/directory/VerifiedBadge'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { prisma } from '@/server/db'
import {
  SUPPORTED_COUNTRIES,
  getCountryName,
  isValidCountry,
} from '@/lib/country'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ country?: string; activity?: string; canton?: string; location?: string; locationName?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  return generatePlatformMetadata({
    title: t.nav.search,
    description: t.seo.searchDescription,
    path: `/${lang}/search`,
    lang,
  })
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { lang } = await params
  const { country, activity, canton, location } = await searchParams
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const validCountry = country && isValidCountry(country) ? country : undefined

  const [clubs, cantons] = await Promise.all([
    prisma.club.findMany({
      where: {
        status: 'ACTIVE',
        isPublished: true,
        forceOffline: false,
        ...(validCountry && { country: validCountry }),
        ...(activity && { activityType: activity }),
        ...(canton && {
          location: { swissLocation: { cantonCode: canton } },
        }),
        ...(location && {
          location: { swissLocation: { swisstopoId: location } },
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
        lastVerifiedAt: true,
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
    // Only show canton filter when a country is selected
    validCountry
      ? prisma.swissCanton.findMany({
          where: {
            locations: {
              some: {
                location: {
                  clubs: {
                    some: {
                      country: validCountry,
                      status: 'ACTIVE',
                      isPublished: true,
                      forceOffline: false,
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
      : Promise.resolve([]),
  ])

  const countryOptions = SUPPORTED_COUNTRIES.map((code) => ({
    code,
    name: getCountryName(code, uiLang),
  }))
  const countryNameMap = new Map<string, string>(countryOptions.map((c) => [c.code, c.name]))

  const cantonOptions = cantons.map((c) => ({
    code: c.code,
    name: c.translations[0]?.name ?? c.code,
  }))

  const activitySlugs = [...new Set(clubs.map((c) => c.activityType).filter(Boolean))] as string[]
  const activityOptions = activitySlugs.sort().map((slug) => ({
    slug,
    name: t.activityTypes[slug] ?? slug,
  }))

  return (
    <div>
      <AdminPageTitle title={t.nav.search} />
      <h1 className="text-2xl font-bold mb-6">{t.nav.search}</h1>

      <Suspense fallback={null}>
        <DirectoryFilters
          countries={countryOptions}
          cantons={cantonOptions}
          activityTypes={activityOptions}
          lang={lang}
          labels={{
            filterCountry: t.directory.filterCountry,
            filterCanton: t.directory.filterCanton,
            filterCity: t.directory.filterCity,
            filterActivity: t.directory.filterActivity,
            allCountries: t.directory.allCountries,
            allCantons: t.directory.allCantons,
            allActivities: t.directory.allActivities,
            resetFilters: t.directory.resetFilters,
          }}
        />
      </Suspense>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t.directory.clubCount.replace('{count}', String(clubs.length))}
        </p>
        <VerifiedBadge label={t.directory.verifiedBadge} detail={t.directory.verifiedDetail} />
      </div>

      {clubs.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center text-muted-foreground">
          <SearchX className="size-10 mb-3 opacity-50" />
          <p>{t.directory.noResults}</p>
          <p className="mt-1 text-sm">
            {t.directory.noResultsHint}
          </p>
          <div className="mt-6 rounded-lg border p-5 text-center max-w-md">
            <p className="text-sm text-foreground">{t.directory.shareCtaMessage}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <SharePlatformButton label={t.platform.bootstrapShare} copiedMessage={t.clubSite.linkCopied} className="" />
            </div>
            <p className="mt-4 text-sm text-foreground">{t.directory.listCtaMessage}</p>
            <div className="mt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${lang}/apply`}>
                  <ClipboardList className="h-3.5 w-3.5" />
                  {t.platform.bootstrapListClub}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Suspense
            fallback={
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <ClubCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <PaginatedGrid
              showingLabel={t.admin.showingCount}
              showMoreLabel={t.admin.showMore}
            >
              {clubs.map((club) => {
                const activitySlug = club.activityType
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
                    country={club.country}
                    countryName={countryNameMap.get(club.country) ?? club.country}
                    lang={lang}
                    logoUrl={club.logoUrl}
                    logoAlt={club.logoAlt}
                    activityType={activityName}
                    locationName={locationName}
                    cantonName={cantonLabel}
                    lastVerifiedAt={club.lastVerifiedAt}
                    freshnessLabels={{ upToDate: t.directory.freshnessBadgeUpToDate, notVerified: t.directory.freshnessBadgeNotVerified }}
                    ariaLabel={t.directory.clubAriaLabel
                      .replace('{name}', club.name)
                      .replace('{activity}', activityName ?? '')
                      .replace('{location}', locationName ?? '')}
                  />
                )
              })}
            </PaginatedGrid>
          </Suspense>
          <div className="mt-8 rounded-lg border p-5 text-center">
            <p className="text-sm text-muted-foreground">{t.directory.shareCtaMessage}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <SharePlatformButton label={t.platform.bootstrapShare} copiedMessage={t.clubSite.linkCopied} className="" />
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${lang}/apply`}>
                  <ClipboardList className="h-3.5 w-3.5" />
                  {t.platform.bootstrapListClub}
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
