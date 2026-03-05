import { redirect } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { ChangePasswordForm } from '@/components/app/auth/ChangePasswordForm'
import { ManageTotpSection } from '@/components/app/auth/ManageTotpSection'
import { ManagePasskeysSection } from '@/components/app/auth/ManagePasskeysSection'

interface AccountPageProps {
  params: Promise<{ lang: string }>
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { lang } = await params
  const t = getTranslations(resolveUILang(lang))
  const session = await getAuthSession()

  if (!session?.user) redirect(`/${lang}/auth/login`)
  if (session.user.totpEnabled && !session.user.totpVerified) redirect(`/${lang}/auth/totp`)

  const passkeys = await prisma.webauthnCredential.findMany({
    where: { userId: session.user.id },
    select: { credentialId: true, deviceType: true, createdAt: true },
  })

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-lg mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-semibold">{t.auth.accountSettings}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.auth.signedInAs} <span className="font-medium">{session.user.email}</span>
          </p>
        </div>

        <section className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="text-lg font-medium">{t.auth.changePassword}</h2>
          </div>
          <ChangePasswordForm t={{
            currentPassword: t.auth.fields.currentPassword,
            newPassword: t.auth.fields.newPassword,
            confirmPassword: t.auth.fields.confirmPassword,
            passwordHint: t.auth.form.passwordHint,
            updatingPassword: t.auth.form.updatingPassword,
            updatePassword: t.auth.form.updatePassword,
            passwordChanged: t.auth.form.passwordChanged,
          }} />
        </section>

        <section className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="text-lg font-medium">{t.auth.twoFactor}</h2>
          </div>
          <ManageTotpSection totpEnabled={session.user.totpEnabled} lang={lang} t={{
            totpEnabled: t.auth.form.totpEnabled,
            totpNotEnrolled: t.auth.form.totpNotEnrolled,
            totpEnabledDesc: t.auth.form.totpEnabledDesc,
            totpNotEnrolledDesc: t.auth.form.totpNotEnrolledDesc,
            enrollTotp: t.auth.form.enrollTotp,
            resetTotp: t.auth.form.resetTotp,
            removing: t.auth.form.removing,
            disable2fa: t.auth.form.disable2fa,
            totpConfirmDisable: t.auth.form.totpConfirmDisable,
          }} />
        </section>

        <section className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="text-lg font-medium">{t.auth.passkeys}</h2>
          </div>
          <ManagePasskeysSection passkeys={passkeys} lang={lang} t={{
            noPasskeys: t.auth.form.noPasskeys,
            passkeyAdded: t.auth.form.passkeyAdded,
            remove: t.auth.form.remove,
            working: t.auth.form.working,
            addPasskey: t.auth.form.addPasskey,
            passkeyConfirmRemove: t.auth.form.passkeyConfirmRemove,
            passkeyDefaultName: t.auth.form.passkeyDefaultName,
            passkeyStartFailed: t.auth.form.passkeyStartFailed,
            passkeyCompleteFailed: t.auth.form.passkeyCompleteFailed,
            passkeyRegistrationFailed: t.auth.form.passkeyRegistrationFailed,
          }} />
        </section>
      </div>
    </div>
  )
}
