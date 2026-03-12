import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { decodeSetupCookie, SETUP_COOKIE_NAME } from '@/lib/setup-cookie'
import { SetupPasswordForm } from '@/components/app/auth/SetupPasswordForm'
import { getAuthSession } from '@/server/auth'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

interface SetupPageProps {
  params: Promise<{ lang: string }>
}

export default async function SetupPage({ params }: SetupPageProps) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  // Already authenticated — account setup is complete; send user home.
  const session = await getAuthSession()
  if (session?.user?.id) {
    redirect(`/${lang}/`)
  }

  const cookieStore = await cookies()
  const setupCookie = cookieStore.get(SETUP_COOKIE_NAME)
  const userId = setupCookie ? decodeSetupCookie(setupCookie.value) : null

  if (!userId) {
    redirect(`/${lang}/auth/login`)
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <AdminPageTitle title={t.auth.setPassword} />
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">{t.auth.setPassword}</h1>
          <p className="text-muted-foreground text-sm">{t.auth.setPasswordSubtitle}</p>
        </div>
        <SetupPasswordForm defaultLanguage={uiLang} t={{
          newPassword: t.auth.fields.newPassword,
          confirmPassword: t.auth.fields.confirmPassword,
          settingPassword: t.auth.form.settingPassword,
          setPasswordBtn: t.auth.form.setPasswordBtn,
          strength: t.auth.form.strength,
          strengthTooShort: t.auth.form.strengthTooShort,
          strengthWeak: t.auth.form.strengthWeak,
          strengthFair: t.auth.form.strengthFair,
          strengthStrong: t.auth.form.strengthStrong,
          firstName: t.auth.profile.firstName,
          lastName: t.auth.profile.lastName,
          phone: t.auth.profile.phone,
          preferredLanguage: t.auth.profile.preferredLanguage,
          languageOptions: [
            { value: 'fr', label: t.language.fr },
            { value: 'de', label: t.language.de },
            { value: 'it', label: t.language.it },
            { value: 'en', label: t.language.en },
          ],
        }} />
      </div>
    </div>
  )
}
