'use server'

import { headers } from 'next/headers'
import { prisma } from '@/server/db'
import { applicationSchema } from '@/lib/schemas/application'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { checkRateLimit } from '@/lib/rate-limit'
import { upsertSwissLocation } from '@/lib/server/location'
import { getBooleanSetting, getNumberSetting } from '@/lib/server/platform-settings'

export type SubmitApplicationResult =
  | { success: true }
  | { success: false; error: string; code: 'REGISTRATIONS_CLOSED' | 'RATE_LIMITED' | 'VALIDATION_ERROR' | 'TURNSTILE_FAILED' | 'SERVER_ERROR' }

export async function submitApplication(data: unknown): Promise<SubmitApplicationResult> {
  try {
    const registrationsOpen = await getBooleanSetting('registrations_enabled')
    if (!registrationsOpen) {
      return { success: false, error: 'Registrations are currently closed.', code: 'REGISTRATIONS_CLOSED' }
    }

    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'

    const maxAttempts = await getNumberSetting('rate.applications_per_hour')
    if (checkRateLimit('apply:' + ip, { windowMs: 3_600_000, maxAttempts })) {
      return { success: false, error: 'Too many submissions.', code: 'RATE_LIMITED' }
    }

    const parsed = applicationSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Invalid form data.', code: 'VALIDATION_ERROR' }
    }

    const { applicantFirstName, applicantLastName, applicantPhone, applicantPreferredLanguage, name, email, clubEmail, country, activityType, otherDescription, location, description, schedule, contactPhone, contactAddress, howToJoin, externalWebsiteUrl, instagramUrl, facebookUrl, xUrl, tiktokUrl, discordUrl, youtubeUrl, whatsappUrl, telegramUrl, githubUrl, desiredSlug, turnstileToken } = parsed.data

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
        applicantFirstName,
        applicantLastName,
        applicantPhone: applicantPhone || null,
        applicantPreferredLanguage,
        name,
        email,
        clubEmail: clubEmail || null,
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
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
        xUrl: xUrl || null,
        tiktokUrl: tiktokUrl || null,
        discordUrl: discordUrl || null,
        youtubeUrl: youtubeUrl || null,
        whatsappUrl: whatsappUrl || null,
        telegramUrl: telegramUrl || null,
        githubUrl: githubUrl || null,
        desiredSlug,
      },
    })

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}
