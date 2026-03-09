import { ClubHeroSection } from '@/components/app/club-site/ClubHeroSection'
import { PhotoCarousel } from './PhotoCarousel'
import { ProfileSection } from './ProfileSection'
import { ContactInfo } from './ContactInfo'

type ProfilePageProps = {
  club: {
    name: string
    logoUrl: string | null
    logoAlt: string | null
    description: string | null
    schedule: string | null
    howToJoin: string | null
    email: string
    contactPhone: string | null
    contactAddress: string | null
    externalWebsiteUrl: string | null
    photos: Array<{ id: string; url: string; alt: string }>
  }
  translations: {
    schedule: string
    howToJoin: string
    contactInfo: string
    email: string
    phone: string
    address: string
    visitWebsite: string
    photos: string
    goToPhoto: string
  }
}

export function ProfilePage({ club, translations }: ProfilePageProps) {
  return (
    <div className="flex flex-col">
      <ClubHeroSection
        club={{
          name: club.name,
          logoUrl: club.logoUrl,
          logoAlt: club.logoAlt,
          description: club.description,
        }}
      />

      <div className="mx-auto w-full max-w-3xl px-4">
        <PhotoCarousel photos={club.photos} ariaLabel={translations.photos} goToPhotoLabel={translations.goToPhoto} />

        {club.schedule && (
          <ProfileSection title={translations.schedule}>
            <p className="text-sm whitespace-pre-line">{club.schedule}</p>
          </ProfileSection>
        )}

        {club.howToJoin && (
          <ProfileSection title={translations.howToJoin}>
            <p className="text-sm whitespace-pre-line">{club.howToJoin}</p>
          </ProfileSection>
        )}

        <ProfileSection title={translations.contactInfo}>
          <ContactInfo
            email={club.email}
            phone={club.contactPhone}
            address={club.contactAddress}
            websiteUrl={club.externalWebsiteUrl}
            websiteLabel={translations.visitWebsite}
            translations={{
              email: translations.email,
              phone: translations.phone,
              address: translations.address,
            }}
          />
        </ProfileSection>
      </div>
    </div>
  )
}
