import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'

export const SUPPORTED_LANGUAGES = ['fr', 'de', 'it', 'en'] as const

export const phoneSchema = z.string().refine(
  (val) => val === '' || isValidPhoneNumber(val),
  { message: 'invalidPhone' },
)

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  phone: phoneSchema.optional().or(z.literal('')),
  preferredLanguage: z.enum(SUPPORTED_LANGUAGES),
})

export type ProfileInput = z.infer<typeof profileSchema>
