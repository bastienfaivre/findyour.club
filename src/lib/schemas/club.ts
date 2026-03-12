import { z } from 'zod'
import type { SocialFieldKey } from '@/lib/social-platforms'
import { SOCIAL_FIELD_KEYS } from '@/lib/social-platforms'
import { phoneSchema } from '@/lib/schemas/profile'

const optionalUrl = z.union([z.string().url(), z.literal('')]).nullable()

export const clubProfileSaveSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.union([z.string().email(), z.literal('')]),
  description: z.string().trim().min(1).max(50000), // Dynamic limit enforced in server action
  schedule: z.string().trim().min(1).max(50000), // Dynamic limit enforced in server action
  howToJoin: z.string().trim().min(1).max(50000), // Dynamic limit enforced in server action
  contactPhone: phoneSchema.nullable(),
  contactAddress: z.string().max(500).nullable(),
  externalWebsiteUrl: optionalUrl,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  xUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  discordUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  whatsappUrl: optionalUrl,
  telegramUrl: optionalUrl,
  githubUrl: optionalUrl,
})

export type ClubProfileSaveInput = z.infer<typeof clubProfileSaveSchema>

export type SocialLinks = Record<SocialFieldKey, string | null>

export function extractSocialLinks(record: Partial<Record<SocialFieldKey, string | null>>): SocialLinks {
  const links = {} as SocialLinks
  for (const key of SOCIAL_FIELD_KEYS) {
    links[key] = record[key] ?? null
  }
  return links
}

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
  schedule: string
  howToJoin: string
  contactPhone: string | null
  contactAddress: string | null
  externalWebsiteUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  xUrl: string | null
  tiktokUrl: string | null
  discordUrl: string | null
  youtubeUrl: string | null
  whatsappUrl: string | null
  telegramUrl: string | null
  githubUrl: string | null
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
  instagramUrl?: string | null
  facebookUrl?: string | null
  xUrl?: string | null
  tiktokUrl?: string | null
  discordUrl?: string | null
  youtubeUrl?: string | null
  whatsappUrl?: string | null
  telegramUrl?: string | null
  githubUrl?: string | null
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
    schedule: club.schedule ?? '',
    howToJoin: club.howToJoin ?? '',
    contactPhone: club.contactPhone,
    contactAddress: club.contactAddress,
    externalWebsiteUrl: club.externalWebsiteUrl,
    ...extractSocialLinks(club),
    slug: club.slug,
  }
}
