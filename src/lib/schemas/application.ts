import { z } from 'zod'
import { SUPPORTED_COUNTRIES } from '@/lib/country'
import { ACTIVITY_TYPES } from '@/lib/activity-types'
import { extractSocialLinks } from '@/lib/schemas/club'
import { SUPPORTED_LANGUAGES, phoneSchema } from '@/lib/schemas/profile'

export const locationSchema = z.object({
  swisstopoId: z.string().min(1).max(20),
  cantonCode: z.string().regex(/^[A-Z]{2}$/),
  name: z.string().min(1).max(200),
})

export type LocationInput = z.infer<typeof locationSchema>

// Slug: lowercase alphanumeric + hyphens, no leading/trailing/consecutive hyphens
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const optionalUrl = z.union([z.string().url(), z.literal('')]).optional()

const otherDescriptionRefinement = {
  check: (data: { activityType: string; otherDescription?: string }) =>
    data.activityType !== 'other' || (!!data.otherDescription && data.otherDescription.trim().length > 0),
  message: 'Please describe your activity type',
  path: ['otherDescription'] as const,
}

const applicationBaseSchema = z.object({
  // Step 1 — Applicant info
  applicantFirstName: z.string().trim().min(1, 'First name is required').max(100),
  applicantLastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().max(254).email('Invalid email address'),
  applicantPhone: phoneSchema.optional().or(z.literal('')),
  applicantPreferredLanguage: z.enum(SUPPORTED_LANGUAGES),

  // Step 2 — Club info
  name: z.string().trim().min(1, 'Name is required').max(200),
  clubEmail: z.string().max(254).email('Invalid email address').optional().or(z.literal('')),
  country: z.enum(SUPPORTED_COUNTRIES),
  activityType: z.enum([...ACTIVITY_TYPES, 'other'] as [string, ...string[]]),
  otherDescription: z.string().max(200).optional(),
  location: locationSchema,
  description: z.string().trim().min(1, 'Description is required').max(1000, 'Description must be 1000 characters or less'),
  schedule: z.string().trim().min(1, 'Schedule is required').max(500),
  contactPhone: phoneSchema.optional().or(z.literal('')),
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
  logoKey: z.string().max(500).optional(),
})

export const applicationSchema = applicationBaseSchema
  .extend({ turnstileToken: z.string().min(1, 'Bot protection is required') })
  .refine(otherDescriptionRefinement.check, { message: otherDescriptionRefinement.message, path: [...otherDescriptionRefinement.path] })

/** Client-side schema without turnstileToken — used for form validation before showing the captcha dialog. */
export const applicationFormSchema = applicationBaseSchema
  .refine(otherDescriptionRefinement.check, { message: otherDescriptionRefinement.message, path: [...otherDescriptionRefinement.path] })

export type ApplicationInput = z.infer<typeof applicationSchema>
export type ApplicationFormInput = z.infer<typeof applicationFormSchema>

/**
 * Central definition of all operator-editable application fields.
 */
export interface ApplicationEditableFields {
  applicantFirstName: string | null
  applicantLastName: string | null
  email: string
  applicantPhone: string | null
  applicantPreferredLanguage: string | null
  name: string
  clubEmail: string | null
  country: string
  activityType: string | null
  otherDescription: string | null
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
  applicantFirstName?: string | null
  applicantLastName?: string | null
  applicantPhone?: string | null
  applicantPreferredLanguage?: string | null
  name: string
  email: string
  clubEmail?: string | null
  country: string
  activityType: string | null
  otherDescription?: string | null
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
      cantonCode: string
      translations: { name: string }[]
    } | null
  } | null
}): ApplicationEditableFields {
  const swissLoc = app.location?.swissLocation
  return {
    applicantFirstName: app.applicantFirstName ?? null,
    applicantLastName: app.applicantLastName ?? null,
    email: app.email,
    applicantPhone: app.applicantPhone ?? null,
    applicantPreferredLanguage: app.applicantPreferredLanguage ?? null,
    name: app.name,
    clubEmail: app.clubEmail ?? null,
    country: app.country,
    activityType: app.activityType ?? (app.otherDescription ? 'other' : null),
    otherDescription: app.otherDescription ?? null,
    location: swissLoc
      ? {
          swisstopoId: swissLoc.swisstopoId,
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
  const canton = loc.cantonCode ? ` (${loc.cantonCode})` : ''
  return `${loc.name}${canton}`
}
