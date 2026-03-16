import type { SupportedLanguage } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

// ── Shared email layout ──

const PLATFORM_NAME = 'findyour.club'
const PLATFORM_URL = 'https://findyour.club'
const CONTACT_EMAIL = 'contact@findyour.club'

function emailLayout(content: string, lang: SupportedLanguage): string {
  const t = getTranslations(lang).emails.footer
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${PLATFORM_NAME}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f4f4f5;color:#18181b;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 16px;">
    <tr><td align="center">

      <!-- Header -->
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:8px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <a href="${PLATFORM_URL}" style="text-decoration:none;font-size:18px;font-weight:700;letter-spacing:-0.02em;color:#18181b;">${PLATFORM_NAME}</a>
        </td></tr>
      </table>

      <!-- Body -->
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;">
        <tr><td style="padding:40px 36px;">
          ${content}
        </td></tr>
      </table>

      <!-- Footer -->
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:24px;">
        <tr><td align="center" style="padding:0 16px;">
          <p style="margin:0 0 8px;font-size:12px;color:#a1a1aa;line-height:1.5;">
            ${t.noreply}
          </p>
          <p style="margin:0 0 8px;font-size:12px;color:#a1a1aa;line-height:1.5;">
            ${t.contact.replace('{email}', `<a href="mailto:${CONTACT_EMAIL}" style="color:#71717a;text-decoration:underline;">${CONTACT_EMAIL}</a>`)}
          </p>
          <p style="margin:0;font-size:11px;color:#d4d4d8;line-height:1.5;">
            ${t.copyright.replace('{year}', String(new Date().getFullYear()))}
          </p>
        </td></tr>
      </table>

    </td></tr>
  </table>
</body>
</html>`
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 20px;font-size:22px;font-weight:700;letter-spacing:-0.01em;color:#18181b;line-height:1.3;">${text}</h1>`
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3f3f46;">${text}</p>`
}

function calloutBox(content: string): string {
  return `<div style="background:#fafafa;border-left:3px solid #18181b;padding:16px 20px;margin:20px 0;border-radius:0 6px 6px 0;">
    <p style="margin:0;font-size:15px;line-height:1.7;color:#3f3f46;">${content}</p>
  </div>`
}

function primaryButton(text: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
    <tr><td style="background:#18181b;border-radius:8px;padding:13px 28px;">
      <a href="${escapeHtml(href)}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">${text}</a>
    </td></tr>
  </table>`
}

function smallText(text: string): string {
  return `<p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">${text}</p>`
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #f4f4f5;margin:24px 0;">`
}

// ── Email templates ──

interface AcceptanceEmailParams {
  clubName: string
  clubUrl: string
  magicLinkUrl: string
  operatorMessage?: string
  lang: SupportedLanguage
}

export function buildAcceptanceEmailHtml({ clubName, clubUrl, magicLinkUrl, operatorMessage, lang }: AcceptanceEmailParams): string {
  const t = getTranslations(lang).emails.acceptance

  const operatorBlock = operatorMessage
    ? calloutBox(`<strong style="color:#18181b;">${t.platformMessage}</strong><br>${escapeHtml(operatorMessage)}`)
    : ''

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.congratulations.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${operatorBlock}
    ${paragraph(t.liveLine)}
    <p style="margin:0 0 20px;">
      <a href="${escapeHtml(clubUrl)}" style="color:#18181b;text-decoration:underline;font-size:15px;font-weight:500;">${escapeHtml(clubUrl)}</a>
    </p>
    ${paragraph(t.setupLine)}
    ${primaryButton(t.setupButton, magicLinkUrl)}
    ${divider()}
    ${smallText(t.expiry)}
  `, lang)
}

interface RejectionEmailParams {
  clubName: string
  rejectionReason?: string
  lang: SupportedLanguage
}

export function buildRejectionEmailHtml({ clubName, rejectionReason, lang }: RejectionEmailParams): string {
  const t = getTranslations(lang).emails.rejection

  const explanation = rejectionReason
    ? escapeHtml(rejectionReason)
    : t.defaultReason

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.thankYou.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${calloutBox(explanation)}
    ${paragraph(t.reapply)}
    ${divider()}
    ${smallText(t.regards)}
  `, lang)
}

interface OperatorMessageEmailParams {
  clubName: string
  message: string
  lang: SupportedLanguage
}

export function buildOperatorMessageEmailHtml({ clubName, message, lang }: OperatorMessageEmailParams): string {
  const t = getTranslations(lang).emails.operatorMessage

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${calloutBox(escapeHtml(message))}
    ${divider()}
    ${smallText(t.regards)}
  `, lang)
}

interface ForceOfflineEmailParams {
  clubName: string
  reason: string
  lang: SupportedLanguage
}

export function buildForceOfflineEmailHtml({ clubName, reason, lang }: ForceOfflineEmailParams): string {
  const t = getTranslations(lang).emails.forceOffline

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${calloutBox(escapeHtml(reason))}
    ${paragraph(t.resolution)}
    ${divider()}
    ${smallText(t.regards)}
  `, lang)
}

interface InvitationEmailParams {
  clubName: string
  acceptUrl: string
  lang: SupportedLanguage
}

export function buildInvitationEmailHtml({ clubName, acceptUrl, lang }: InvitationEmailParams): string {
  const t = getTranslations(lang).emails.invitation

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${paragraph(t.cta)}
    ${primaryButton(t.acceptButton, acceptUrl)}
    ${divider()}
    ${smallText(t.expiry)}
  `, lang)
}

interface PasswordResetEmailParams {
  resetUrl: string
  lang: SupportedLanguage
}

export function buildPasswordResetEmailHtml({ resetUrl, lang }: PasswordResetEmailParams): string {
  const t = getTranslations(lang).emails.passwordReset

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro)}
    ${primaryButton(t.resetButton, resetUrl)}
    ${divider()}
    ${smallText(t.expiry)}
  `, lang)
}

interface VerificationReminderEmailParams {
  clubName: string
  settingsUrl: string
  lang: SupportedLanguage
}

export function buildVerificationReminderEmailHtml({ clubName, settingsUrl, lang }: VerificationReminderEmailParams): string {
  const t = getTranslations(lang).emails.verificationReminder

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${paragraph(t.cta)}
    ${primaryButton(t.verifyButton, settingsUrl)}
  `, lang)
}

interface VerificationExpiredEmailParams {
  clubName: string
  settingsUrl: string
  lang: SupportedLanguage
}

export function buildVerificationExpiredEmailHtml({ clubName, settingsUrl, lang }: VerificationExpiredEmailParams): string {
  const t = getTranslations(lang).emails.verificationExpired

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${paragraph(t.cta)}
    ${primaryButton(t.verifyButton, settingsUrl)}
  `, lang)
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
