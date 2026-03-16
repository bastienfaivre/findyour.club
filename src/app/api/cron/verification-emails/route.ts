import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { sendEmail } from '@/lib/email'
import { buildVerificationReminderEmailHtml, buildVerificationExpiredEmailHtml } from '@/lib/email-templates'
import { resolveUILang, type SupportedLanguage } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { APPROACHING_THRESHOLD_DAYS, VERIFICATION_CYCLE_DAYS } from '@/lib/verification'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Daily CRON job to send verification reminder (day 80) and expiry (day 90) emails.
 * Secured via CRON_SECRET header.
 *
 * Idempotency: uses 1-day windows so each club is only matched on the exact day.
 * If lastVerifiedAt resets between day 80 and day 90, no day-90 email is sent.
 */
export async function GET(request: Request) {
  const secret = request.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  // Reminder window: clubs verified exactly APPROACHING_THRESHOLD_DAYS ago (±1 day)
  const reminderWindowEnd = new Date(now.getTime() - APPROACHING_THRESHOLD_DAYS * MS_PER_DAY)
  const reminderWindowStart = new Date(now.getTime() - (APPROACHING_THRESHOLD_DAYS + 1) * MS_PER_DAY)
  // Expiry window: clubs verified exactly VERIFICATION_CYCLE_DAYS ago (±1 day)
  const expiryWindowEnd = new Date(now.getTime() - VERIFICATION_CYCLE_DAYS * MS_PER_DAY)
  const expiryWindowStart = new Date(now.getTime() - (VERIFICATION_CYCLE_DAYS + 1) * MS_PER_DAY)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://findyour.club'

  // Day-80 reminders: clubs where lastVerifiedAt is between 80 and 81 days ago
  const reminderClubs = await prisma.club.findMany({
    where: {
      status: 'ACTIVE',
      lastVerifiedAt: { gte: reminderWindowStart, lt: reminderWindowEnd },
    },
    select: {
      id: true,
      name: true,
      defaultLanguage: true,
      memberships: {
        where: { status: 'ACTIVE' },
        select: { user: { select: { email: true, preferredLanguage: true } } },
      },
    },
  })

  // Day-90 expiry: clubs where lastVerifiedAt is between 90 and 91 days ago
  const expiredClubs = await prisma.club.findMany({
    where: {
      status: 'ACTIVE',
      lastVerifiedAt: { gte: expiryWindowStart, lt: expiryWindowEnd },
    },
    select: {
      id: true,
      name: true,
      defaultLanguage: true,
      memberships: {
        where: { status: 'ACTIVE' },
        select: { user: { select: { email: true, preferredLanguage: true } } },
      },
    },
  })

  let sent = 0
  let errors = 0

  // Send reminder emails
  for (const club of reminderClubs) {
    for (const membership of club.memberships) {
      const email = membership.user.email
      if (!email) continue

      const lang = resolveUILang(membership.user.preferredLanguage ?? club.defaultLanguage)
      const t = getTranslations(lang).emails.verificationReminder
      const settingsUrl = `${baseUrl}/${lang}/club/${club.id}/settings`

      try {
        await sendEmail({
          to: email,
          subject: t.subject,
          html: buildVerificationReminderEmailHtml({ clubName: club.name, settingsUrl, lang }),
        })
        sent++
      } catch {
        errors++
      }
    }
  }

  // Send expiry emails
  for (const club of expiredClubs) {
    for (const membership of club.memberships) {
      const email = membership.user.email
      if (!email) continue

      const lang: SupportedLanguage = resolveUILang(membership.user.preferredLanguage ?? club.defaultLanguage)
      const t = getTranslations(lang).emails.verificationExpired
      const settingsUrl = `${baseUrl}/${lang}/club/${club.id}/settings`

      try {
        await sendEmail({
          to: email,
          subject: t.subject,
          html: buildVerificationExpiredEmailHtml({ clubName: club.name, settingsUrl, lang }),
        })
        sent++
      } catch {
        errors++
      }
    }
  }

  return NextResponse.json({
    reminderClubs: reminderClubs.length,
    expiredClubs: expiredClubs.length,
    emailsSent: sent,
    emailErrors: errors,
  })
}
