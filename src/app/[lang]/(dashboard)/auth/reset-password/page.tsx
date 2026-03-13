import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { decodeSetupCookie, SETUP_COOKIE_NAME } from '@/lib/setup-cookie'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { ResetPasswordForm } from './reset-password-form'

interface ResetPasswordPageProps {
  params: Promise<{ lang: string }>
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { lang } = await params
  const t = getTranslations(resolveUILang(lang))

  // Verify setup cookie is present and valid
  const cookieStore = await cookies()
  const setupCookie = cookieStore.get(SETUP_COOKIE_NAME)
  const userId = setupCookie ? decodeSetupCookie(setupCookie.value) : null

  if (!userId) {
    redirect(`/${lang}/auth/login`)
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <AdminPageTitle title={t.auth.resetPassword.title} />
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">{t.auth.resetPassword.title}</h1>
          <p className="text-muted-foreground text-sm">{t.auth.resetPassword.subtitle}</p>
        </div>
        <ResetPasswordForm
          t={{
            newPassword: t.auth.fields.newPassword,
            confirmPassword: t.auth.fields.confirmPassword,
            resetting: t.auth.resetPassword.resetting,
            resetBtn: t.auth.resetPassword.resetBtn,
            passwordHint: t.auth.form.passwordHint,
            strength: t.auth.form.strength,
            strengthTooShort: t.auth.form.strengthTooShort,
            strengthWeak: t.auth.form.strengthWeak,
            strengthFair: t.auth.form.strengthFair,
            strengthStrong: t.auth.form.strengthStrong,
          }}
        />
      </div>
    </div>
  )
}
