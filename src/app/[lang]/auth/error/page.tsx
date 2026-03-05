import Link from 'next/link'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

interface AuthErrorPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ error?: string }>
}

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? 'support@clashware.io'

export default async function AuthErrorPage({ params, searchParams }: AuthErrorPageProps) {
  const { lang } = await params
  const t = getTranslations(resolveUILang(lang))
  const { error } = await searchParams

  const rawMessages: Record<string, string> = {
    Configuration:       t.auth.errors.configuration,
    AccessDenied:        t.auth.errors.accessDenied,
    Verification:        t.auth.errors.verification,
    TokenInvalid:        t.auth.errors.tokenInvalid.replace('{email}', SUPPORT_EMAIL),
    TokenExpired:        t.auth.errors.tokenExpired.replace('{email}', SUPPORT_EMAIL),
    InviteExpired:       t.auth.errors.inviteExpired,
    InviteEmailMismatch: t.auth.errors.inviteEmailMismatch,
  }

  const message = rawMessages[error ?? ''] ?? t.auth.errors.default

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">{t.auth.errorTitle}</h1>
        <p className="text-muted-foreground">{message}</p>
        <Link href={`/${lang}/auth/login`} className="underline text-sm">
          {t.auth.returnToSignIn}
        </Link>
      </div>
    </div>
  )
}
