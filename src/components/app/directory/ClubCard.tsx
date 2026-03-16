import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ClubAvatar } from '@/components/app/ClubAvatar'
import { FreshnessBadge } from '@/components/app/directory/FreshnessBadge'
import { countryCodeToFlag } from '@/lib/country'

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
  cantonName,
  lastVerifiedAt,
  freshnessLabels,
  ariaLabel,
}: ClubCardProps) {
  const location = [locationName, cantonName].filter(Boolean).join(', ')

  return (
    <Link
      href={`/${lang}/${country}/${slug}`}
      aria-label={ariaLabel}
      className="flex items-center gap-3 overflow-hidden rounded-[10px] border p-4 text-card-foreground transition-all hover:border-muted-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring min-h-[44px]"
    >
      <ClubAvatar name={name} logoUrl={logoUrl} logoAlt={logoAlt} size="md" />
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="font-semibold truncate">{name}</span>
        <div className="flex items-center gap-2 min-w-0">
          {activityType && <Badge variant="secondary">{activityType}</Badge>}
          {freshnessLabels && (
            <div className="ml-auto shrink-0">
              <FreshnessBadge
                lastVerifiedAt={lastVerifiedAt ?? null}
                upToDateLabel={freshnessLabels.upToDate}
                notVerifiedLabel={freshnessLabels.notVerified}
              />
            </div>
          )}
        </div>
        <span className="text-sm text-muted-foreground truncate">
          {countryCodeToFlag(country)} {[countryName, location].filter(Boolean).join(', ')}
        </span>
      </div>
    </Link>
  )
}

export function ClubCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border p-4">
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}
