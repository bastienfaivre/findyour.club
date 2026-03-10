'use client'

import type { ClubProfileSaveInput } from '@/lib/schemas/club'
import type { ClubPhoto } from './ClubProfileForm'
import { ClubHeroSection } from '@/components/app/club-site/ClubHeroSection'
import { PhotoCarousel } from '@/components/app/club-profile/PhotoCarousel'
import { ProfileSection } from '@/components/app/club-profile/ProfileSection'
import { ContactInfo } from '@/components/app/club-profile/ContactInfo'

interface ProfilePreviewProps {
  formValues: ClubProfileSaveInput
  logoUrl: string | null
  logoAlt: string | null
  photos: ClubPhoto[]
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
    contactCta: string
    preview: string
  }
}

export function ProfilePreview({ formValues, logoUrl, logoAlt, photos, translations: t }: ProfilePreviewProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">{t.preview}</p>
      <div className="flex-1 min-h-0 rounded-lg border bg-background shadow-sm overflow-hidden overflow-y-auto">
          <ClubHeroSection
            club={{
              name: formValues.name || '…',
              logoUrl,
              logoAlt,
              description: formValues.description ?? null,
            }}
          />

          <div className="mx-auto w-full max-w-3xl px-4">
            <PhotoCarousel photos={photos} ariaLabel={t.photos} goToPhotoLabel={t.goToPhoto} />

            {formValues.schedule && (
              <ProfileSection title={t.schedule}>
                <p className="text-sm whitespace-pre-line">{formValues.schedule}</p>
              </ProfileSection>
            )}

            {formValues.howToJoin && (
              <ProfileSection title={t.howToJoin}>
                <p className="text-sm whitespace-pre-line">{formValues.howToJoin}</p>
              </ProfileSection>
            )}

            <ProfileSection title={t.contactInfo}>
              <ContactInfo
                email={formValues.email || null}
                phone={formValues.contactPhone}
                address={formValues.contactAddress}
                websiteUrl={formValues.externalWebsiteUrl}
                websiteLabel={t.visitWebsite}
                socialLinks={formValues}
                translations={{
                  email: t.email,
                  phone: t.phone,
                  address: t.address,
                }}
              />
            </ProfileSection>
          </div>
      </div>
    </div>
  )
}
