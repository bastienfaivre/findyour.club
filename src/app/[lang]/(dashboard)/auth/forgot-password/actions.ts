'use server'
import { randomBytes, createHash } from 'crypto'
import { headers } from 'next/headers'
import { prisma } from '@/server/db'
import { sendEmail } from '@/lib/email'
import { buildPasswordResetEmailHtml } from '@/lib/email-templates'
import { getTranslations } from '@/lib/i18n/translations'
import { resolveUILang, type SupportedLanguage } from '@/lib/i18n'
import { checkRateLimit } from '@/lib/rate-limit'
import { getNumberSetting } from '@/lib/server/platform-settings'

export type ForgotPasswordResult =
  | { success: true }
  | { success: false; error: string; code: 'RATE_LIMITED' | 'VALIDATION_ERROR' }

/**
 * Sends a password-reset email if an account exists for the given address.
 * Always returns success to prevent email enumeration.
 */
export async function requestPasswordReset(email: string, lang: string): Promise<ForgotPasswordResult> {
  // Rate-limit by IP
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'

  const maxAttempts = await getNumberSetting('rate.login_attempts_per_hour')

  // Rate-limit by IP (broad abuse prevention)
  if (checkRateLimit(`password-reset:ip:${ip}`, { windowMs: 3_600_000, maxAttempts })) {
    return { success: false, error: 'Too many attempts. Please wait before trying again.', code: 'RATE_LIMITED' }
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { success: false, error: 'Invalid email address.', code: 'VALIDATION_ERROR' }
  }

  const normalizedEmail = email.trim().toLowerCase()

  // Rate-limit per email (prevent spamming a single address from multiple IPs)
  if (checkRateLimit(`password-reset:email:${normalizedEmail}`, { windowMs: 3_600_000, maxAttempts: 3 })) {
    // Return success to avoid leaking whether the email exists
    return { success: true }
  }

  // Look up user — only send email if account exists with a password set
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, passwordHash: true, preferredLanguage: true },
  })

  if (user?.passwordHash) {
    try {
      // Generate magic token (same pattern as approval flow)
      const rawToken = randomBytes(32).toString('hex')
      const tokenHash = createHash('sha256').update(rawToken).digest('hex')

      await prisma.user.update({
        where: { id: user.id },
        data: {
          magicToken: tokenHash,
          magicTokenExp: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      })

      const emailLang = resolveUILang(user.preferredLanguage ?? lang) as SupportedLanguage
      const t = getTranslations(emailLang).emails.passwordReset
      const host = headersList.get('host') ?? 'localhost:3000'
      const protocol = host.startsWith('localhost') ? 'http' : 'https'
      const resetUrl = `${protocol}://${host}/${emailLang}/auth/magic-link?token=${rawToken}`

      await sendEmail({
        to: normalizedEmail,
        subject: t.subject,
        html: buildPasswordResetEmailHtml({ resetUrl, lang: emailLang }),
      })
    } catch {
      // Swallow errors to maintain consistent behavior (anti-enumeration)
    }
  }

  // Always return success to prevent email enumeration
  return { success: true }
}
