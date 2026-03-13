'use server'

import { randomBytes, createHash } from 'crypto'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { slugRegex } from '@/lib/schemas/application'
import type { ApplicationEditableFields } from '@/lib/schemas/application'
import { isReservedSlug } from '@/lib/slug'
import { inferDefaultLanguage } from '@/lib/country'
import { sendEmail } from '@/lib/email'
import { buildAcceptanceEmailHtml, buildRejectionEmailHtml } from '@/lib/email-templates'
import { upsertSwissLocation } from '@/lib/server/location'
import { isEmailEnabled } from '@/lib/server/email-settings'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

export type { ApplicationEditableFields } from '@/lib/schemas/application'

export type ApplicationActionResult =
  | { success: true }
  | { success: false; error: string; code: 'NOT_FOUND' | 'ALREADY_REVIEWED' | 'UNAUTHORIZED' | 'SLUG_REQUIRED' | 'SLUG_INVALID' | 'SLUG_CONFLICT' | 'EMAIL_FAILED' | 'SERVER_ERROR' }

export async function approveApplication(applicationId: string, fields: ApplicationEditableFields, operatorMessage?: string): Promise<ApplicationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    const trimmedSlug = fields.desiredSlug.trim()
    const trimmedMessage = operatorMessage?.trim() || undefined

    if (!trimmedSlug) {
      return { success: false, error: 'A URL slug is required.', code: 'SLUG_REQUIRED' }
    }
    if (trimmedSlug.length > 60) {
      return { success: false, error: 'Slug must be 60 characters or less.', code: 'SLUG_INVALID' }
    }
    if (!slugRegex.test(trimmedSlug)) {
      return { success: false, error: 'Only lowercase letters, numbers, and hyphens allowed.', code: 'SLUG_INVALID' }
    }
    if (isReservedSlug(trimmedSlug)) {
      return { success: false, error: 'This slug is reserved and cannot be used.', code: 'SLUG_CONFLICT' }
    }
    if (trimmedMessage && trimmedMessage.length > 1000) {
      return { success: false, error: 'Operator message must be 1000 characters or less.', code: 'SERVER_ERROR' }
    }

    // Resolve location: if operator provided location data, upsert it; otherwise keep original
    let resolvedLocationId: string | null = null
    if (fields.location) {
      const { locationId } = await upsertSwissLocation({
        swisstopoId: fields.location.swisstopoId,
        plz: fields.location.plz,
        cantonCode: fields.location.cantonCode,
        displayName: fields.location.name,
      })
      resolvedLocationId = locationId
    }

    // Fetch the application to verify status
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true, status: true,
      },
    })

    if (!application) {
      return { success: false, error: 'Application not found.', code: 'NOT_FOUND' }
    }
    if (application.status !== 'PENDING') {
      return { success: false, error: 'Application already reviewed.', code: 'ALREADY_REVIEWED' }
    }

    // Provisioning transaction: slug check, approval, club + user + membership creation
    const result = await prisma.$transaction(async (tx) => {
      // Check operator-provided slug for conflicts
      const [clubConflict, appConflict] = await Promise.all([
        tx.club.findUnique({
          where: { slug_country: { slug: trimmedSlug, country: fields.country } },
          select: { id: true },
        }),
        tx.application.findFirst({
          where: {
            desiredSlug: trimmedSlug,
            country: fields.country,
            status: 'APPROVED',
            id: { not: applicationId },
          },
          select: { id: true },
        }),
      ])

      if (clubConflict || appConflict) {
        return { status: 'SLUG_CONFLICT' as const }
      }

      // Approve the application and persist operator edits
      const updated = await tx.application.updateMany({
        where: { id: applicationId, status: 'PENDING' },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          desiredSlug: trimmedSlug,
          applicantFirstName: fields.applicantFirstName,
          applicantLastName: fields.applicantLastName,
          applicantPhone: fields.applicantPhone,
          applicantPreferredLanguage: fields.applicantPreferredLanguage,
          name: fields.name,
          email: fields.email,
          clubEmail: fields.clubEmail,
          country: fields.country,
          description: fields.description,
          activityType: fields.activityType,
          locationId: resolvedLocationId,
          schedule: fields.schedule,
          contactPhone: fields.contactPhone,
          contactAddress: fields.contactAddress,
          howToJoin: fields.howToJoin,
          externalWebsiteUrl: fields.externalWebsiteUrl,
          instagramUrl: fields.instagramUrl,
          facebookUrl: fields.facebookUrl,
          xUrl: fields.xUrl,
          tiktokUrl: fields.tiktokUrl,
          discordUrl: fields.discordUrl,
          youtubeUrl: fields.youtubeUrl,
          whatsappUrl: fields.whatsappUrl,
          telegramUrl: fields.telegramUrl,
          githubUrl: fields.githubUrl,
        },
      })

      if (updated.count === 0) {
        return { status: 'ALREADY_REVIEWED' as const }
      }

      const defaultLanguage = inferDefaultLanguage(fields.country)

      // Club email: use clubEmail if provided, otherwise fall back to applicant email
      const clubEmail = fields.clubEmail || fields.email

      // Create club record with operator-edited fields
      const club = await tx.club.create({
        data: {
          name: fields.name,
          slug: trimmedSlug,
          country: fields.country,
          status: 'ACTIVE',
          email: clubEmail,
          activityType: fields.activityType,
          locationId: resolvedLocationId,
          defaultLanguage,
          description: fields.description,
          schedule: fields.schedule,
          contactPhone: fields.contactPhone,
          contactAddress: fields.contactAddress,
          howToJoin: fields.howToJoin,
          externalWebsiteUrl: fields.externalWebsiteUrl,
          instagramUrl: fields.instagramUrl,
          facebookUrl: fields.facebookUrl,
          xUrl: fields.xUrl,
          tiktokUrl: fields.tiktokUrl,
          discordUrl: fields.discordUrl,
          youtubeUrl: fields.youtubeUrl,
          whatsappUrl: fields.whatsappUrl,
          telegramUrl: fields.telegramUrl,
          githubUrl: fields.githubUrl,
          isPublished: true,
          forceOffline: false,
        },
      })

      // Create support message if provided
      if (trimmedMessage) {
        await tx.supportMessage.create({
          data: { clubId: club.id, senderId: session.user!.id, senderRole: 'OPERATOR', body: trimmedMessage },
        })
      }

      // Find or create user by the (possibly edited) email, populating profile from application
      let user = await tx.user.findUnique({
        where: { email: fields.email },
        select: { id: true, firstName: true },
      })

      if (!user) {
        user = await tx.user.create({
          data: {
            email: fields.email,
            role: 'CLUB_ADMIN',
            firstName: fields.applicantFirstName,
            lastName: fields.applicantLastName,
            phone: fields.applicantPhone,
            preferredLanguage: fields.applicantPreferredLanguage,
          },
          select: { id: true, firstName: true },
        })
      } else if (!user.firstName) {
        // Existing user without profile — populate from application data
        await tx.user.update({
          where: { id: user.id },
          data: {
            firstName: fields.applicantFirstName,
            lastName: fields.applicantLastName,
            phone: fields.applicantPhone,
            preferredLanguage: fields.applicantPreferredLanguage,
          },
        })
      }

      // Generate magic-link token
      const rawToken = randomBytes(32).toString('hex')
      const tokenHash = createHash('sha256').update(rawToken).digest('hex')

      await tx.user.update({
        where: { id: user.id },
        data: {
          magicToken: tokenHash,
          magicTokenExp: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      })

      // Create club membership
      await tx.clubMembership.create({
        data: {
          userId: user.id,
          clubId: club.id,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      })

      return {
        status: 'SUCCESS' as const,
        club: { id: club.id, name: club.name, slug: club.slug, country: club.country, defaultLanguage: club.defaultLanguage },
        userId: user.id,
        rawToken,
      }
    })

    if (result.status === 'SLUG_CONFLICT') {
      return { success: false, error: 'This slug is already taken.', code: 'SLUG_CONFLICT' }
    }
    if (result.status === 'ALREADY_REVIEWED') {
      return { success: false, error: 'Application already reviewed.', code: 'ALREADY_REVIEWED' }
    }

    // Send acceptance email (outside transaction — compensate on failure)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://findyour.club'

      const clubUrl = `${baseUrl}/${result.club.defaultLanguage}/${result.club.country}/${result.club.slug}`
      const magicLinkUrl = `${baseUrl}/${result.club.defaultLanguage}/auth/magic-link?token=${result.rawToken}`

      const emailLang = resolveUILang(fields.applicantPreferredLanguage ?? 'en')
      const emailT = getTranslations(emailLang).emails.acceptance

      const html = buildAcceptanceEmailHtml({
        clubName: result.club.name,
        clubUrl,
        magicLinkUrl,
        operatorMessage: trimmedMessage,
        lang: emailLang,
      })

      await sendEmail({
        to: fields.email,
        subject: emailT.subject,
        html,
      })
    } catch {
      // Compensating action: roll back provisioned records
      try {
        await prisma.$transaction(async (tx) => {
          await tx.clubMembership.deleteMany({ where: { clubId: result.club.id } })
          await tx.supportMessage.deleteMany({ where: { clubId: result.club.id } })
          await tx.club.delete({ where: { id: result.club.id } })
          await tx.user.update({
            where: { id: result.userId },
            data: { magicToken: null, magicTokenExp: null },
          })
          await tx.application.updateMany({
            where: { id: applicationId },
            data: { status: 'PENDING', reviewedAt: null, desiredSlug: null },
          })
        })
      } catch {
        return { success: false, error: 'Email delivery failed and rollback also failed. Manual cleanup required.', code: 'EMAIL_FAILED' }
      }
      return { success: false, error: 'Email delivery failed', code: 'EMAIL_FAILED' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}

export async function getApplicantClubs(email: string): Promise<{ id: string; name: string; role: string }[]> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      memberships: {
        where: { status: 'ACTIVE' },
        select: {
          role: true,
          club: { select: { id: true, name: true } },
        },
      },
    },
  })
  if (!user) return []
  return user.memberships.map((m) => ({ id: m.club.id, name: m.club.name, role: m.role }))
}

export async function rejectApplication(applicationId: string, reason?: string): Promise<ApplicationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    if (reason && reason.length > 2000) {
      return { success: false, error: 'Reason must be 2000 characters or less.', code: 'SERVER_ERROR' }
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true, status: true, email: true, name: true, applicantPreferredLanguage: true },
    })

    if (!application) {
      return { success: false, error: 'Application not found.', code: 'NOT_FOUND' }
    }
    if (application.status !== 'PENDING') {
      return { success: false, error: 'Application already reviewed.', code: 'ALREADY_REVIEWED' }
    }

    // Send rejection email if enabled
    if (await isEmailEnabled('email.application_rejected')) {
      try {
        const emailLang = resolveUILang(application.applicantPreferredLanguage ?? 'en')
        const emailT = getTranslations(emailLang).emails.rejection

        const html = buildRejectionEmailHtml({
          clubName: application.name,
          rejectionReason: reason,
          lang: emailLang,
        })

        await sendEmail({
          to: application.email,
          subject: emailT.subject.replace('{clubName}', application.name),
          html,
        })
      } catch {
        return { success: false, error: 'Email delivery failed', code: 'EMAIL_FAILED' }
      }
    }

    const result = await prisma.application.updateMany({
      where: { id: applicationId, status: 'PENDING' },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || null,
        reviewedAt: new Date(),
      },
    })

    if (result.count === 0) {
      // Race condition: another operator already reviewed this application
      // between our findUnique and updateMany. Email was already sent (can't un-send).
      return { success: false, error: 'Application already reviewed.', code: 'ALREADY_REVIEWED' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}
