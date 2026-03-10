import { ClubAvatar } from '@/components/app/ClubAvatar'

export type ClubHeroSectionProps = {
  club: {
    name: string
    logoUrl: string | null
    logoAlt: string | null
    description: string | null
  }
}

export function ClubHeroSection({ club }: ClubHeroSectionProps) {
  return (
    <section className="flex flex-col items-center text-center gap-4 sm:gap-6 py-8 sm:py-16">
      <ClubAvatar
        name={club.name}
        logoUrl={club.logoUrl}
        logoAlt={club.logoAlt}
        size="lg"
        neutralFallback
      />

      <h1 className="text-2xl sm:text-4xl font-bold">{club.name}</h1>

      {club.description && (
        <p className="text-base text-muted-foreground max-w-[600px]">
          {club.description}
        </p>
      )}
    </section>
  )
}
