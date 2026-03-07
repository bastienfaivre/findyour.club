import { z } from 'zod'
import { SUPPORTED_COUNTRIES } from '@/lib/country'

export const locationSchema = z.object({
  swisstopoId: z.string().min(1).max(20),
  plz: z.string().max(10),
  cantonCode: z.string().regex(/^[A-Z]{2}$/),
  name: z.string().min(1).max(200),
})

export type LocationInput = z.infer<typeof locationSchema>

// Slug: lowercase alphanumeric + hyphens, no leading/trailing/consecutive hyphens
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const applicationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().max(254).email('Invalid email address'),
  country: z.enum(SUPPORTED_COUNTRIES),
  activityTypeId: z.string().cuid(),
  location: locationSchema,
  description: z.string().trim().min(1, 'Description is required').max(1000, 'Description must be 1000 characters or less'),
  schedule: z.string().max(500).optional(),
  contactPhone: z.string().max(30).optional(),
  contactAddress: z.string().max(500).optional(),
  howToJoin: z.string().trim().min(1, 'How to join is required').max(1000),
  externalWebsiteUrl: z.union([z.string().url(), z.literal('')]).optional(),
  desiredSlug: z.string().trim().min(1, 'Desired URL slug is required').max(60).regex(slugRegex, 'Only lowercase letters, numbers, and hyphens allowed'),
  turnstileToken: z.string().min(1, 'Bot protection is required'),
})

export type ApplicationInput = z.infer<typeof applicationSchema>
