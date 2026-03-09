'use server'

import { headers } from 'next/headers'
import { prisma } from '@/server/db'
import { applicationSchema } from '@/lib/schemas/application'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { checkRateLimit } from '@/lib/rate-limit'
import { upsertSwissLocation } from '@/lib/server/location'

export type SubmitApplicationResult =
  | { success: true }
  | { success: false; error: string; code: 'RATE_LIMITED' | 'VALIDATION_ERROR' | 'TURNSTILE_FAILED' | 'SERVER_ERROR' }

export async function submitApplication(data: unknown): Promise<SubmitApplicationResult> {
  try {
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'

    if (checkRateLimit('apply:' + ip, { windowMs: 600000, maxAttempts: 3 })) {
      return { success: false, error: 'Too many submissions.', code: 'RATE_LIMITED' }
    }

    const parsed = applicationSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Invalid form data.', code: 'VALIDATION_ERROR' }
    }

    const { name, email, country, activityType, otherDescription, location, description, schedule, contactPhone, contactAddress, howToJoin, externalWebsiteUrl, desiredSlug, turnstileToken } = parsed.data

    const turnstileValid = await verifyTurnstileToken(turnstileToken)
    if (!turnstileValid) {
      return { success: false, error: 'Bot protection failed.', code: 'TURNSTILE_FAILED' }
    }

    const { locationId } = await upsertSwissLocation({
      swisstopoId: location.swisstopoId,
      plz: location.plz,
      cantonCode: location.cantonCode,
      displayName: location.name,
    })

    await prisma.application.create({
      data: {
        name,
        email,
        country,
        activityType: activityType === 'other' ? null : activityType,
        otherDescription: activityType === 'other' ? otherDescription : null,
        locationId,
        description,
        schedule,
        contactPhone,
        contactAddress,
        howToJoin,
        externalWebsiteUrl: externalWebsiteUrl || null,
        desiredSlug,
      },
    })

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}
