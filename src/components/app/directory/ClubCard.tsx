import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ClubAvatar } from '@/components/app/ClubAvatar'
import { FreshnessBadge } from '@/components/app/directory/FreshnessBadge'
import { CountryFlag, CantonFlag } from '@/components/ui/country-flag'

type ClubCardProps = {
  name: string
  slug: string
  country: string
  countryName: string
  lang: string
  logoUrl?: string | null
  logoAlt?: string | null
  activityType?: string | null
  locationName?: string | null
  cantonCode?: string | null
  cantonName?: string | null
  lastVerifiedAt?: Date | null
  freshnessLabels?: { upToDate: string; notVerified: string }
  ariaLabel: string
}

export function ClubCard({
  name,
  slug,
  country,
  countryName,
  lang,
  logoUrl,
  logoAlt,
  activityType,
  locationName,
  cantonCode,
  cantonName,
  lastVerifiedAt,
  freshnessLabels,
  ariaLabel,
}: ClubCardProps) {
  return (
    <Link
      href={`/${lang}/${country}/${slug}`}
      aria-label={ariaLabel}
      className="group/card flex items-center gap-4 overflow-hidden rounded-xl border p-3 text-card-foreground transition-all hover:border-muted-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <ClubAvatar name={name} logoUrl={logoUrl} logoAlt={logoAlt} size="lg" className="size-14 shrink-0" />
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="font-semibold truncate leading-tight">{name}</span>
        <div className="flex items-center gap-1.5">
          {activityType && <Badge variant="secondary" className="text-xs group-hover/card:bg-muted-foreground/20">{activityType}</Badge>}
          {freshnessLabels && (
            <FreshnessBadge className="ml-auto"
              lastVerifiedAt={lastVerifiedAt ?? null}
              upToDateLabel={freshnessLabels.upToDate}
              notVerifiedLabel={freshnessLabels.notVerified}
            />
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate">
          <CountryFlag code={country} /> {countryName}
          {cantonCode && cantonName && <>{', '}<CantonFlag code={cantonCode} /> {cantonName}</>}
          {locationName && <>{', '}{locationName}</>}
        </span>
      </div>
    </Link>
  )
}

export function ClubCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-3">
      <div className="size-14 rounded-lg bg-muted animate-pulse shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
          <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="h-3 w-28 rounded bg-muted animate-pulse" />
      </div>
    </div>
  )
}
