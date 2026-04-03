import { ClubHeroSection } from '@/components/app/club-site/ClubHeroSection'
// import { PhotoCarousel } from './PhotoCarousel' // photos disabled temporarily
import { ProfileSection } from './ProfileSection'
import { ContactInfo } from './ContactInfo'
import type { SocialFieldKey } from '@/lib/social-platforms'

type ProfilePageProps = {
  expiredBanner?: string
  club: {
    name: string
    logoUrl: string | null
    logoAlt: string | null
    activityTypeLabel?: string | null
    country?: string | null
    countryName?: string | null
    cantonCode?: string | null
    locationName?: string | null
    description: string | null
    schedule: string | null
    howToJoin: string | null
    email: string
    contactPhone: string | null
    contactAddress: string | null
    externalWebsiteUrl: string | null
    photos: Array<{ id: string; url: string; alt: string }>
  } & Partial<Record<SocialFieldKey, string | null>>
  translations: {
    description: string
    schedule: string
    howToJoin: string
    contactInfo: string
    email: string
    phone: string
    address: string
    visitWebsite: string
    photos: string
    goToPhoto: string
    closeLightbox: string
  }
}

export function ProfilePage({ club, translations, expiredBanner }: ProfilePageProps) {
  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        {expiredBanner && (
          <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
            {expiredBanner}
          </div>
        )}
        <ClubHeroSection
          club={{
            name: club.name,
            logoUrl: club.logoUrl,
            logoAlt: club.logoAlt,
            activityTypeLabel: club.activityTypeLabel,
            country: club.country,
            countryName: club.countryName,
            cantonCode: club.cantonCode,
            locationName: club.locationName,
          }}
        />
        {/* TODO: re-enable when photo feature is ready
        <PhotoCarousel photos={club.photos} ariaLabel={translations.photos} goToPhotoLabel={translations.goToPhoto} closeLabel={translations.closeLightbox} />
        */}

        {club.description && (
          <ProfileSection title={translations.description}>
            <p className="text-sm whitespace-pre-line text-justify">{club.description}</p>
          </ProfileSection>
        )}

        {club.schedule && (
          <ProfileSection title={translations.schedule}>
            <p className="text-sm whitespace-pre-line text-justify">{club.schedule}</p>
          </ProfileSection>
        )}

        {club.howToJoin && (
          <ProfileSection title={translations.howToJoin}>
            <p className="text-sm whitespace-pre-line text-justify">{club.howToJoin}</p>
          </ProfileSection>
        )}

        <ProfileSection title={translations.contactInfo}>
          <ContactInfo
            email={club.email}
            phone={club.contactPhone}
            address={club.contactAddress}
            websiteUrl={club.externalWebsiteUrl}
            websiteLabel={translations.visitWebsite}
            socialLinks={club}
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
