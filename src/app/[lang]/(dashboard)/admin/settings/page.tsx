import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { getAllSettings } from '@/lib/server/platform-settings'
import { EmailToggleRow } from './email-toggle-row'
import { NumberSettingRow } from './number-setting-row'
import { TextSettingRow } from './text-setting-row'

interface AdminSettingsPageProps {
  params: Promise<{ lang: string }>
}

export default async function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const s = t.admin.settings

  const { booleans, numbers, strings } = await getAllSettings()

  return (
    <div className="w-full mx-auto max-w-2xl space-y-4">
      <AdminPageTitle title={s.title} />

        {/* ── Platform Controls ── */}
        <SettingsSection title={s.platformControls} description={s.platformControlsDescription}>
          <div className="divide-y rounded-lg border">
            <EmailToggleRow
              settingKey="registrations_enabled"
              label={s.registrationsEnabled}
              description={s.registrationsEnabledDescription}
              defaultChecked={booleans['registrations_enabled']}
              savedLabel={s.saved}
            />
            <TextSettingRow
              settingKey="maintenance_banner"
              label={s.maintenanceBanner}
              description={s.maintenanceBannerDescription}
              defaultValue={strings['maintenance_banner']}
              savedLabel={s.saved}
              placeholder={s.maintenanceBannerPlaceholder}
            />
          </div>
        </SettingsSection>

        {/* ── Email Notifications ── */}
        <SettingsSection title={s.emailToggles} description={s.emailTogglesDescription}>
          <div className="divide-y rounded-lg border">
            <div className="flex items-center justify-between gap-4 px-4 py-3 opacity-60">
              <div>
                <p className="font-medium">{s.applicationApproved}</p>
                <p className="text-sm text-muted-foreground">{s.applicationApprovedDescription}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{s.alwaysEnabled}</span>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3 opacity-60">
              <div>
                <p className="font-medium">{s.editorInvited}</p>
                <p className="text-sm text-muted-foreground">{s.editorInvitedDescription}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{s.alwaysEnabled}</span>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3 opacity-60">
              <div>
                <p className="font-medium">{s.passwordReset}</p>
                <p className="text-sm text-muted-foreground">{s.passwordResetDescription}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{s.alwaysEnabled}</span>
            </div>
            <EmailToggleRow
              settingKey="email.application_submitted"
              label={s.applicationSubmitted}
              description={s.applicationSubmittedDescription}
              defaultChecked={booleans['email.application_submitted']}
              savedLabel={s.saved}
            />
            {booleans['email.application_submitted'] && (
              <TextSettingRow
                settingKey="email.application_submitted_recipient"
                label={s.applicationSubmittedRecipient}
                description={s.applicationSubmittedRecipientDescription}
                defaultValue={strings['email.application_submitted_recipient']}
                savedLabel={s.saved}
                placeholder="contact@findyour.club"
              />
            )}
            <EmailToggleRow
              settingKey="email.application_rejected"
              label={s.applicationRejected}
              description={s.applicationRejectedDescription}
              defaultChecked={booleans['email.application_rejected']}
              savedLabel={s.saved}
            />
            <EmailToggleRow
              settingKey="email.operator_message"
              label={s.operatorMessage}
              description={s.operatorMessageDescription}
              defaultChecked={booleans['email.operator_message']}
              savedLabel={s.saved}
            />
            <EmailToggleRow
              settingKey="email.force_offline"
              label={s.forceOffline}
              description={s.forceOfflineDescription}
              defaultChecked={booleans['email.force_offline']}
              savedLabel={s.saved}
            />
          </div>
        </SettingsSection>

        {/* ── Rate Limits ── */}
        <SettingsSection title={s.rateLimits} description={s.rateLimitsDescription}>
          <div className="divide-y rounded-lg border">
            <NumberSettingRow
              settingKey="rate.applications_per_hour"
              label={s.applicationsPerHour}
              description={s.applicationsPerHourDescription}
              defaultValue={numbers['rate.applications_per_hour']}
              savedLabel={s.saved}
              suffix={s.perHour}
            />
            <NumberSettingRow
              settingKey="rate.login_attempts_per_hour"
              label={s.loginAttemptsPerHour}
              description={s.loginAttemptsPerHourDescription}
              defaultValue={numbers['rate.login_attempts_per_hour']}
              savedLabel={s.saved}
              suffix={s.perHour}
            />
            <NumberSettingRow
              settingKey="rate.support_messages_per_hour"
              label={s.supportMessagesPerHour}
              description={s.supportMessagesPerHourDescription}
              defaultValue={numbers['rate.support_messages_per_hour']}
              savedLabel={s.saved}
              suffix={s.perHour}
            />
            <NumberSettingRow
              settingKey="rate.invitations_per_hour"
              label={s.invitationsPerHour}
              description={s.invitationsPerHourDescription}
              defaultValue={numbers['rate.invitations_per_hour']}
              savedLabel={s.saved}
              suffix={s.perHour}
            />
          </div>
        </SettingsSection>

        {/* ── Club Limits ── */}
        <SettingsSection title={s.clubLimits} description={s.clubLimitsDescription}>
          <div className="divide-y rounded-lg border">
            <NumberSettingRow
              settingKey="limit.max_editors_per_club"
              label={s.maxEditorsPerClub}
              description={s.maxEditorsPerClubDescription}
              defaultValue={numbers['limit.max_editors_per_club']}
              savedLabel={s.saved}
            />
            <NumberSettingRow
              settingKey="limit.max_photos_per_club"
              label={s.maxPhotosPerClub}
              description={s.maxPhotosPerClubDescription}
              defaultValue={numbers['limit.max_photos_per_club']}
              savedLabel={s.saved}
            />
            <NumberSettingRow
              settingKey="limit.max_image_size_mb"
              label={s.maxImageSizeMb}
              description={s.maxImageSizeMbDescription}
              defaultValue={numbers['limit.max_image_size_mb']}
              savedLabel={s.saved}
              suffix="MB"
            />
            <NumberSettingRow
              settingKey="limit.max_description_length"
              label={s.maxDescriptionLength}
              description={s.maxDescriptionLengthDescription}
              defaultValue={numbers['limit.max_description_length']}
              savedLabel={s.saved}
              suffix={s.chars}
            />
            <NumberSettingRow
              settingKey="limit.max_schedule_length"
              label={s.maxScheduleLength}
              description={s.maxScheduleLengthDescription}
              defaultValue={numbers['limit.max_schedule_length']}
              savedLabel={s.saved}
              suffix={s.chars}
            />
            <NumberSettingRow
              settingKey="limit.max_how_to_join_length"
              label={s.maxHowToJoinLength}
              description={s.maxHowToJoinLengthDescription}
              defaultValue={numbers['limit.max_how_to_join_length']}
              savedLabel={s.saved}
              suffix={s.chars}
            />
            <NumberSettingRow
              settingKey="limit.image_transactions_per_day"
              label={s.imageTransactionsPerDay}
              description={s.imageTransactionsPerDayDescription}
              defaultValue={numbers['limit.image_transactions_per_day']}
              savedLabel={s.saved}
              suffix={s.perDay}
            />
          </div>
        </SettingsSection>
    </div>
  )
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}
