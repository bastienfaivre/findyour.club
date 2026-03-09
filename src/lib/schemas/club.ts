import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'

export const clubProfileSaveSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.union([z.string().email(), z.literal('')]),
  description: z.string().max(5000).nullable(),
  schedule: z.string().max(2000).nullable(),
  howToJoin: z.string().max(2000).nullable(),
  contactPhone: z.string().refine((val) => val === '' || isValidPhoneNumber(val), {
    message: 'invalidPhone',
  }).nullable(),
  contactAddress: z.string().max(500).nullable(),
  externalWebsiteUrl: z.union([z.string().url(), z.literal('')]).nullable(),
})

export type ClubProfileSaveInput = z.infer<typeof clubProfileSaveSchema>

/**
 * Central definition of all operator-editable club fields.
 */
export interface ClubEditableFields {
  name: string
  email: string
  country: string
  activityType: string | null
  location: import('@/lib/schemas/application').LocationInput | null
  description: string
  schedule: string | null
  howToJoin: string | null
  contactPhone: string | null
  contactAddress: string | null
  externalWebsiteUrl: string | null
  slug: string
}

/**
 * Extract editable fields from a club record (with relations).
 */
export function extractClubEditableFields(club: {
  name: string
  email: string
  country: string
  slug: string
  activityType?: string | null
  description: string | null
  schedule: string | null
  howToJoin: string | null
  contactPhone: string | null
  contactAddress: string | null
  externalWebsiteUrl: string | null
  location?: {
    swissLocation?: {
      swisstopoId: string
      plz: string
      cantonCode: string
      translations: { name: string }[]
    } | null
  } | null
}): ClubEditableFields {
  const swissLoc = club.location?.swissLocation
  return {
    name: club.name,
    email: club.email,
    country: club.country,
    activityType: club.activityType ?? null,
    location: swissLoc
      ? {
          swisstopoId: swissLoc.swisstopoId,
          plz: swissLoc.plz,
          cantonCode: swissLoc.cantonCode,
          name: swissLoc.translations[0]?.name ?? '',
        }
      : null,
    description: club.description ?? '',
    schedule: club.schedule,
    howToJoin: club.howToJoin,
    contactPhone: club.contactPhone,
    contactAddress: club.contactAddress,
    externalWebsiteUrl: club.externalWebsiteUrl,
    slug: club.slug,
  }
}
