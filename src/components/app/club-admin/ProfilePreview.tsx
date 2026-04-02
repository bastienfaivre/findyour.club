'use client'

import type { ClubProfileSaveInput } from '@/lib/schemas/club'
import type { ClubPhoto } from './ClubProfileForm'
import { ProfilePage } from '@/components/app/club-profile/ProfilePage'

interface ProfilePreviewProps {
  formValues: ClubProfileSaveInput
  logoUrl: string | null
  logoAlt: string | null
  activityTypeLabel?: string | null
  country?: string | null
  countryName?: string | null
  cantonCode?: string | null
  locationName?: string | null
  photos: ClubPhoto[]
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
    contactCta: string
    preview: string
  }
}

export function ProfilePreview({ formValues, logoUrl, logoAlt, activityTypeLabel, country, countryName, cantonCode, locationName, photos, translations: t }: ProfilePreviewProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">{t.preview}</p>
      <div className="flex-1 min-h-0 rounded-lg border bg-background shadow-sm overflow-hidden overflow-y-auto">
        <ProfilePage
          club={{
            ...formValues,
            name: formValues.name || '…',
            logoUrl,
            logoAlt,
            description: formValues.description || null,
            schedule: formValues.schedule || null,
            howToJoin: formValues.howToJoin || null,
            email: formValues.email,
            activityTypeLabel,
            country,
            countryName,
            cantonCode,
            locationName,
            photos,
          }}
          translations={{
            description: t.description,
            schedule: t.schedule,
            howToJoin: t.howToJoin,
            contactInfo: t.contactInfo,
            email: t.email,
            phone: t.phone,
            address: t.address,
            visitWebsite: t.visitWebsite,
            photos: t.photos,
            goToPhoto: t.goToPhoto,
            closeLightbox: t.closeLightbox,
          }}
        />
      </div>
    </div>
  )
}
