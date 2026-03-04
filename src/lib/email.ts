/**
 * Unified email sender.
 * - Production (RESEND_API_KEY set): uses Resend SDK
 * - Dev/local (no RESEND_API_KEY): uses nodemailer SMTP → Mailpit on localhost:1025
 */

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const from = process.env.EMAIL_FROM
  if (!from) throw new Error('EMAIL_FROM environment variable is required')

  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({ from, to, subject, html })
    if (error) throw new Error(`Resend error: ${error.message}`)
  } else {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'localhost',
      port: parseInt(process.env.SMTP_PORT ?? '1025', 10),
      secure: false,
    })
    await transporter.sendMail({ from, to, subject, html })
  }
}
