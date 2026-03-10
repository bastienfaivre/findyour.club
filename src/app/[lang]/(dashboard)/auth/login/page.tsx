import { getAuthSession } from '@/server/auth'
import { redirect } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { LoginForm } from '@/components/app/auth/LoginForm'
import { PasskeyButton } from '@/components/app/auth/PasskeyButton'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

interface LoginPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { lang } = await params
  const t = getTranslations(resolveUILang(lang))
  const session = await getAuthSession()

  // Already fully authenticated → redirect to personal homepage
  // Non-TOTP users: totpVerified is always false (no cookie), so check totpEnabled too
  if (session?.user && (!session.user.totpEnabled || session.user.totpVerified)) {
    redirect(`/${lang}/`)
  }

  const { callbackUrl } = await searchParams
  // Only allow relative paths to prevent open-redirect attacks
  const safeCallbackUrl = callbackUrl?.startsWith('/') ? callbackUrl : undefined

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <AdminPageTitle title={t.auth.signIn} />
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">{t.auth.signIn}</h1>
          <p className="text-muted-foreground text-sm">{t.auth.signInSubtitle}</p>
        </div>
        <LoginForm
          callbackUrl={safeCallbackUrl}
          lang={lang}
          t={{ email: t.auth.fields.email, password: t.auth.fields.password, signingIn: t.auth.form.signingIn, signIn: t.auth.form.signIn }}
        />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{t.auth.or}</span>
          </div>
        </div>
        <PasskeyButton t={{ authenticating: t.auth.form.authenticating, signInWithPasskey: t.auth.form.signInWithPasskey }} />
      </div>
    </div>
  )
}
