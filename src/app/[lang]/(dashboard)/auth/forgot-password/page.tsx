import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { ForgotPasswordForm } from './forgot-password-form'

interface ForgotPasswordPageProps {
  params: Promise<{ lang: string }>
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { lang } = await params
  const t = getTranslations(resolveUILang(lang))

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <AdminPageTitle title={t.auth.forgotPassword.title} />
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">{t.auth.forgotPassword.title}</h1>
          <p className="text-muted-foreground text-sm">{t.auth.forgotPassword.subtitle}</p>
        </div>
        <ForgotPasswordForm
          lang={lang}
          t={{
            email: t.auth.fields.email,
            sendLink: t.auth.forgotPassword.sendLink,
            sending: t.auth.forgotPassword.sending,
            successMessage: t.auth.forgotPassword.successMessage,
            backToLogin: t.auth.forgotPassword.backToLogin,
          }}
        />
      </div>
    </div>
  )
}
