import { z } from 'zod'
import { SUPPORTED_COUNTRIES } from '@/lib/country'
import { ACTIVITY_TYPES } from '@/lib/activity-types'
import { SOCIAL_FIELD_KEYS } from '@/lib/social-platforms'
import { extractSocialLinks } from '@/lib/schemas/club'

export const locationSchema = z.object({
  swisstopoId: z.string().min(1).max(20),
  plz: z.string().max(10),
  cantonCode: z.string().regex(/^[A-Z]{2}$/),
  name: z.string().min(1).max(200),
})

export type LocationInput = z.infer<typeof locationSchema>

// Slug: lowercase alphanumeric + hyphens, no leading/trailing/consecutive hyphens
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const optionalUrl = z.union([z.string().url(), z.literal('')]).optional()

export const applicationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().max(254).email('Invalid email address'),
  country: z.enum(SUPPORTED_COUNTRIES),
  activityType: z.enum([...ACTIVITY_TYPES, 'other'] as [string, ...string[]]),
  otherDescription: z.string().max(200).optional(),
  location: locationSchema,
  description: z.string().trim().min(1, 'Description is required').max(1000, 'Description must be 1000 characters or less'),
  schedule: z.string().max(500).optional(),
  contactPhone: z.string().max(30).optional(),
  contactAddress: z.string().max(500).optional(),
  howToJoin: z.string().trim().min(1, 'How to join is required').max(1000),
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
  desiredSlug: z.string().trim().min(1, 'Desired URL slug is required').max(60).regex(slugRegex, 'Only lowercase letters, numbers, and hyphens allowed'),
  turnstileToken: z.string().min(1, 'Bot protection is required'),
}).refine(
  (data) => data.activityType !== 'other' || (data.otherDescription && data.otherDescription.trim().length > 0),
  { message: 'Please describe your activity type', path: ['otherDescription'] },
)

export type ApplicationInput = z.infer<typeof applicationSchema>

/**
 * Central definition of all operator-editable application fields.
 */
export interface ApplicationEditableFields {
  name: string
  email: string
  country: string
  activityType: string | null
  location: LocationInput | null
  description: string
  schedule: string | null
  howToJoin: string | null
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
  desiredSlug: string
}

/**
 * Extract editable fields from an application record (with relations).
 */
export function extractEditableFields(app: {
  name: string
  email: string
  country: string
  activityType: string | null
  description: string
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
  desiredSlug: string | null
  location?: {
    swissLocation?: {
      swisstopoId: string
      plz: string
      cantonCode: string
      translations: { name: string }[]
    } | null
  } | null
}): ApplicationEditableFields {
  const swissLoc = app.location?.swissLocation
  return {
    name: app.name,
    email: app.email,
    country: app.country,
    activityType: app.activityType,
    location: swissLoc
      ? {
          swisstopoId: swissLoc.swisstopoId,
          plz: swissLoc.plz,
          cantonCode: swissLoc.cantonCode,
          name: swissLoc.translations[0]?.name ?? '',
        }
      : null,
    description: app.description,
    schedule: app.schedule,
    howToJoin: app.howToJoin,
    contactPhone: app.contactPhone,
    contactAddress: app.contactAddress,
    externalWebsiteUrl: app.externalWebsiteUrl,
    ...extractSocialLinks(app),
    desiredSlug: app.desiredSlug ?? '',
  }
}

/**
 * Build a human-readable display string for a location input.
 */
export function formatLocationDisplay(loc: LocationInput): string {
  return loc.plz
    ? `${loc.name} (${loc.cantonCode}) — ${loc.plz}`
    : `${loc.name} (${loc.cantonCode})`
}
