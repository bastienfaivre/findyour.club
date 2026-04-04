'use server'

import { headers } from 'next/headers'
import { prisma } from '@/server/db'
import { applicationSchema } from '@/lib/schemas/application'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { checkRateLimit } from '@/lib/rate-limit'
import { upsertSwissLocation } from '@/lib/server/location'
import { getBooleanSetting, getNumberSetting, getStringSetting } from '@/lib/server/platform-settings'
import { generateSlug } from '@/lib/slug'
import { sendEmail } from '@/lib/email'
import { buildApplicationSubmittedEmailHtml } from '@/lib/email-templates'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { generateUploadUrl, getPublicUrl, ALLOWED_IMAGE_TYPES } from '@/lib/r2'

export type SubmitApplicationResult =
  | { success: true }
  | { success: false; error: string; code: 'REGISTRATIONS_CLOSED' | 'RATE_LIMITED' | 'VALIDATION_ERROR' | 'TURNSTILE_FAILED' | 'SERVER_ERROR' }

export async function submitApplication(data: unknown, lang?: string): Promise<SubmitApplicationResult> {
  const t = getTranslations(resolveUILang(lang ?? 'en'))
  try {
    const registrationsOpen = await getBooleanSetting('registrations_enabled')
    if (!registrationsOpen) {
      return { success: false, error: t.errors.registrationsClosed, code: 'REGISTRATIONS_CLOSED' }
    }

    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'

    const maxAttempts = await getNumberSetting('rate.applications_per_hour')
    if (checkRateLimit('apply:' + ip, { windowMs: 3_600_000, maxAttempts })) {
      return { success: false, error: t.errors.tooManyAttempts, code: 'RATE_LIMITED' }
    }

    const parsed = applicationSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: t.errors.validationError, code: 'VALIDATION_ERROR' }
    }

    const { applicantFirstName, applicantLastName, applicantPhone, applicantPreferredLanguage, name, email, clubEmail, country, activityType, otherDescription, location, description, schedule, contactPhone, contactAddress, howToJoin, externalWebsiteUrl, instagramUrl, facebookUrl, xUrl, tiktokUrl, discordUrl, youtubeUrl, whatsappUrl, telegramUrl, githubUrl, logoKey, turnstileToken } = parsed.data

    const turnstileValid = await verifyTurnstileToken(turnstileToken)
    if (!turnstileValid) {
      return { success: false, error: t.errors.botProtectionFailed, code: 'TURNSTILE_FAILED' }
    }

    const { locationId } = await upsertSwissLocation({
      swisstopoId: location.swisstopoId,
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
        location: { connect: { id: locationId } },
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
        desiredSlug: generateSlug(name),
        ...(logoKey && {
          logoUrl: getPublicUrl(logoKey),
          logoAlt: `Logo of ${name}`,
        }),
      },
    })

    // Fire-and-forget: notify the operator about the new application
    getBooleanSetting('email.application_submitted').then(async (enabled) => {
      if (!enabled) return
      try {
        const recipient = await getStringSetting('email.application_submitted_recipient')
        if (!recipient) return
        const lang = 'en' as const
        const t = getTranslations(lang).emails.applicationSubmitted
        const applicantName = `${applicantFirstName} ${applicantLastName}`
        const reviewUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://findyour.club'}/en/admin/applications`
        const html = buildApplicationSubmittedEmailHtml({ applicantName, clubName: name, reviewUrl, lang })
        const subject = t.subject.replace('{clubName}', name)
        await sendEmail({ to: recipient, subject, html })
      } catch (err) {
        console.error('[application-submitted-email] Failed to send notification:', err)
      }
    })

    return { success: true }
  } catch {
    return { success: false, error: t.errors.serverError, code: 'SERVER_ERROR' }
  }
}

export type ApplicationLogoUploadResult =
  | { success: true; data: { uploadUrl: string; key: string } }
  | { success: false; error: string }

export async function getApplicationLogoUploadUrl(contentType: string, lang?: string): Promise<ApplicationLogoUploadResult> {
  const t = getTranslations(resolveUILang(lang ?? 'en'))
  try {
    if (!ALLOWED_IMAGE_TYPES.includes(contentType as typeof ALLOWED_IMAGE_TYPES[number])) {
      return { success: false, error: t.errors.invalidImageType }
    }

    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'

    if (checkRateLimit('apply-logo:' + ip, { windowMs: 3_600_000, maxAttempts: 10 })) {
      return { success: false, error: t.errors.tooManyAttempts }
    }

    const ext = contentType.split('/')[1] === 'svg+xml' ? 'svg' : contentType.split('/')[1]
    const { uploadUrl, key } = await generateUploadUrl('applications', ext)

    return { success: true, data: { uploadUrl, key } }
  } catch {
    return { success: false, error: t.errors.uploadFailed }
  }
}

