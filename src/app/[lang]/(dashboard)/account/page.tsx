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
import { ProfileSection } from '@/components/app/auth/ProfileSection'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

function SettingsSection({ title, variant, children }: { title: string; variant?: 'danger'; children: React.ReactNode }) {
  return (
    <section className={`rounded-xl border p-4 space-y-4 ${variant === 'danger' ? 'border-destructive/30' : ''}`}>
      <h2 className={`text-sm font-semibold uppercase tracking-wide ${variant === 'danger' ? 'text-destructive' : 'text-muted-foreground'}`}>{title}</h2>
      {children}
    </section>
  )
}

interface AccountPageProps {
  params: Promise<{ lang: string }>
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { lang } = await params
  const t = getTranslations(resolveUILang(lang))
  const session = await getAuthSession()

  if (!session?.user) redirect(`/${lang}/auth/login`)
  if (session.user.totpEnabled && !session.user.totpVerified) redirect(`/${lang}/auth/totp`)

  const [userProfile, passkeys] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, phone: true, preferredLanguage: true },
    }),
    prisma.webauthnCredential.findMany({
      where: { userId: session.user.id },
      select: { credentialId: true, deviceType: true, createdAt: true },
    }),
  ])

  return (
    <div className="w-full mx-auto max-w-2xl space-y-4">
      <AdminPageTitle title={t.auth.accountSettings} />
      <TotpEnrollmentBanner session={session} lang={lang} t={t.auth.banner} />
      <div className="rounded-xl border p-4">
        <p className="text-sm text-muted-foreground">
          {t.auth.signedInAs} <span className="font-medium">{session.user.email}</span>
        </p>
      </div>

      <SettingsSection title={t.auth.profile.title}>
        <p className="text-sm text-muted-foreground">{t.auth.profile.description}</p>
        <ProfileSection
          initialData={{
            firstName: userProfile?.firstName ?? '',
            lastName: userProfile?.lastName ?? '',
            phone: userProfile?.phone ?? '',
            preferredLanguage: userProfile?.preferredLanguage ?? resolveUILang(lang),
          }}
          t={t.auth.profile}
          commonT={{ save: t.common.save }}
        />
      </SettingsSection>

      <SettingsSection title={t.auth.changePassword}>
        <ChangePasswordForm t={{
          currentPassword: t.auth.fields.currentPassword,
          newPassword: t.auth.fields.newPassword,
          confirmPassword: t.auth.fields.confirmPassword,
          passwordHint: t.auth.form.passwordHint,
          updatingPassword: t.auth.form.updatingPassword,
          updatePassword: t.auth.form.updatePassword,
          passwordChanged: t.auth.form.passwordChanged,
        }} />
      </SettingsSection>

      <SettingsSection title={t.auth.twoFactor}>
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
      </SettingsSection>

      <SettingsSection title={t.auth.passkeys}>
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
      </SettingsSection>

      <DeleteAccountSection lang={lang} t={t.auth.deleteAccount} />
    </div>
  )
}
