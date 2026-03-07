import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export type ClubHeroSectionProps = {
  club: {
    name: string
    logoUrl: string | null
    logoAlt: string | null
    description: string | null
  }
  ctaLabel: string
  ctaHref: string
}

export function ClubHeroSection({ club, ctaLabel, ctaHref }: ClubHeroSectionProps) {
  return (
    <section className="flex flex-col items-center text-center gap-6 py-16">
      {club.logoUrl ? (
        <Image
          src={club.logoUrl}
          alt={club.logoAlt ?? club.name}
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-4xl font-bold">
          {club.name.charAt(0).toUpperCase()}
        </div>
      )}

      <h1 className="text-2xl sm:text-4xl font-bold">{club.name}</h1>

      {club.description && (
        <p className="text-base text-muted-foreground max-w-[600px]">
          {club.description}
        </p>
      )}

      <Button asChild>
        <Link href={ctaHref} className="min-h-[44px] min-w-[44px]">
          {ctaLabel}
        </Link>
      </Button>
    </section>
  )
}
