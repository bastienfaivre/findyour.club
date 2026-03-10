import { redirect } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { TotpEnrollmentBanner } from '@/components/app/auth/TotpEnrollmentBanner'
import { ChangePasswordForm } from '@/components/app/auth/ChangePasswordForm'
import { ManageTotpSection } from '@/components/app/auth/ManageTotpSection'
import { ManagePasskeysSection } from '@/components/app/auth/ManagePasskeysSection'
import { DeleteAccountSection } from '@/components/app/auth/DeleteAccountSection'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

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
    <div className="max-w-xl space-y-10">
      <AdminPageTitle title={t.auth.accountSettings} />
      <TotpEnrollmentBanner session={session} lang={lang} t={t.auth.banner} />
      <p className="text-sm text-muted-foreground">
        {t.auth.signedInAs} <span className="font-medium">{session.user.email}</span>
      </p>

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
        }} commonT={{ confirm: t.common.confirm, cancel: t.common.cancel }} />
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
        }} commonT={{ confirm: t.common.confirm, cancel: t.common.cancel }} />
      </section>

      <DeleteAccountSection lang={lang} t={t.auth.deleteAccount} />
    </div>
  )
}
