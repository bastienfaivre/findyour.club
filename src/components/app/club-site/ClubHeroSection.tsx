import { ClubAvatar } from '@/components/app/ClubAvatar'
import { Badge } from '@/components/ui/badge'

export type ClubHeroSectionProps = {
  club: {
    name: string
    logoUrl: string | null
    logoAlt: string | null
    activityTypeLabel?: string | null
  }
}

export function ClubHeroSection({ club }: ClubHeroSectionProps) {
  return (
    <section className="flex flex-col items-center text-center gap-4 sm:gap-6 py-8 sm:py-16">
      <ClubAvatar
        name={club.name}
        logoUrl={club.logoUrl}
        logoAlt={club.logoAlt}
        size="xl"
      />

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl sm:text-4xl font-bold">{club.name}</h1>
        {club.activityTypeLabel && (
          <Badge variant="secondary">{club.activityTypeLabel}</Badge>
        )}
      </div>
    </section>
  )
}
