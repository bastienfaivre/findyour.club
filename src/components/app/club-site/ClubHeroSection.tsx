import { ClubAvatar } from '@/components/app/ClubAvatar'
import { Badge } from '@/components/ui/badge'
import { CountryFlag, CantonFlag } from '@/components/ui/country-flag'

export type ClubHeroSectionProps = {
  club: {
    name: string
    logoUrl: string | null
    logoAlt: string | null
    activityType?: string | null
    activityTypeLabel?: string | null
    country?: string | null
    countryName?: string | null
    cantonCode?: string | null
    locationName?: string | null
  }
}

export function ClubHeroSection({ club }: ClubHeroSectionProps) {
  const hasLocation = club.country && club.countryName

  return (
    <section className="flex flex-col items-center text-center gap-4 sm:gap-6 rounded-xl border p-4">
      <ClubAvatar
        name={club.name}
        activityType={club.activityType ?? null}
        logoUrl={club.logoUrl}
        logoAlt={club.logoAlt}
        size="xl"
      />

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl sm:text-4xl font-bold">{club.name}</h1>
        {club.activityTypeLabel && (
          <Badge variant="secondary">{club.activityTypeLabel}</Badge>
        )}
        {hasLocation && (
          <span className="text-sm text-muted-foreground">
            <CountryFlag code={club.country!} /> {club.countryName}
            {club.cantonCode && <>{', '}<CantonFlag code={club.cantonCode} /> {club.cantonCode}</>}
            {club.locationName && <>{', '}{club.locationName}</>}
          </span>
        )}
      </div>
    </section>
  )
}
