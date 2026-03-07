import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

type ClubCardProps = {
  name: string
  slug: string
  country: string
  lang: string
  logoUrl?: string | null
  logoAlt?: string | null
  activityType?: string | null
  locationName?: string | null
  cantonName?: string | null
  ariaLabel: string
}

function ClubMonogram({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-sm">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export function ClubCard({
  name,
  slug,
  country,
  lang,
  logoUrl,
  logoAlt,
  activityType,
  locationName,
  cantonName,
  ariaLabel,
}: ClubCardProps) {
  const location = [locationName, cantonName].filter(Boolean).join(', ')

  return (
    <Link
      href={`/${lang}/${country}/${slug}`}
      aria-label={ariaLabel}
      className="flex items-center gap-3 rounded-[10px] border p-4 text-card-foreground transition-all hover:border-muted-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring min-h-[44px]"
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={logoAlt ?? name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <ClubMonogram name={name} />
      )}
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-semibold truncate">{name}</span>
        <div className="flex items-center gap-2 flex-wrap">
          {activityType && <Badge variant="secondary">{activityType}</Badge>}
          {location && (
            <span className="text-sm text-muted-foreground truncate">
              {location}
            </span>
          )}
        </div>
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
