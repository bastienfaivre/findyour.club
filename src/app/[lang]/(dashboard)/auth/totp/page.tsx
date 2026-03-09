import { redirect } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { getAuthSession } from '@/server/auth'
import { TotpForm } from '@/components/app/auth/TotpForm'

interface TotpChallengePageProps {
  params: Promise<{ lang: string }>
}

export default async function TotpChallengePage({ params }: TotpChallengePageProps) {
  const { lang } = await params
  const t = getTranslations(resolveUILang(lang))
  // Single getAuthSession() call: checks DB session + totp_verified cookie
  const session = await getAuthSession()

  if (!session?.user) {
    redirect(`/${lang}/auth/login`)
  }

  // Already verified (totpEnabled=false or cookie set) → redirect to home
  if (session.user.totpVerified) {
    redirect(`/${lang}/`)
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">{t.auth.twoFactor}</h1>
          <p className="text-muted-foreground text-sm">{t.auth.twoFactorSubtitle}</p>
        </div>
        <TotpForm t={{ codeTotp: t.auth.fields.codeTotp, verifying: t.auth.form.verifying, verify: t.auth.form.verify }} />
      </div>
    </div>
  )
}
