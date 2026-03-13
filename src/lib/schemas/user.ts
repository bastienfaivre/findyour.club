import { z } from 'zod'
import { SUPPORTED_LANGUAGES, phoneSchema } from '@/lib/schemas/profile'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{12,}$/

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password required'),
})

export const setupPasswordSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  phone: phoneSchema.optional().or(z.literal('')),
  preferredLanguage: z.enum(SUPPORTED_LANGUAGES),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(passwordRegex, 'Password must include uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const totpVerifySchema = z.object({
  code: z.string().length(6).regex(/^\d{6}$/, 'Code must be 6 digits'),
})

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(passwordRegex, 'Password must include uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(passwordRegex, 'Password must include uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
