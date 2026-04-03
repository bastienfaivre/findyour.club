import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { ACTIVITY_TYPES } from '@/lib/activity-types'
import { ApplyForm } from '@/components/app/apply/ApplyForm'
import { SUPPORTED_COUNTRIES, getCountryName } from '@/lib/country'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { generatePlatformMetadata } from '@/components/app/seo/metadata'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { getBooleanSetting } from '@/lib/server/platform-settings'

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  return generatePlatformMetadata({
    title: t.apply.title,
    description: t.seo.applyDescription,
    path: `/${lang}/apply`,
    lang,
  })
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const registrationsOpen = await getBooleanSetting('registrations_enabled')

  if (!registrationsOpen) {
    return (
      <>
        <AdminPageTitle title={t.nav.apply} />
        <div className="w-full mx-auto max-w-2xl space-y-4">
          <div className="rounded-xl border p-4 text-center space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {t.apply.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.apply.registrationsClosed}
            </p>
          </div>
        </div>
      </>
    )
  }

  // Prefill from authenticated user's profile if available
  const session = await getAuthSession()
  let userProfile: { firstName: string; lastName: string; email: string; phone: string; preferredLanguage: string } | null = null
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, email: true, phone: true, preferredLanguage: true },
    })
    if (user) {
      userProfile = {
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        preferredLanguage: user.preferredLanguage ?? uiLang,
      }
    }
  }

  const activityTypes = ACTIVITY_TYPES
    .map((slug) => ({
      slug,
      name: t.activityTypes[slug] ?? slug,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, uiLang))

  const benefits = [
    t.apply.benefits.free,
    t.apply.benefits.verified,
    t.apply.benefits.simple,
    t.apply.benefits.visible,
  ]

  return (
    <>
      <AdminPageTitle title={t.nav.apply} />
      <div className="w-full mx-auto max-w-2xl space-y-4">
        {/* Header */}
        <div className="rounded-xl border p-4 space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {t.apply.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.apply.subtitle}
          </p>
        </div>

        {/* Benefits */}
        <div className="rounded-xl border p-4 space-y-4">
          <ul className="space-y-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm font-medium">{t.apply.noCatch}</p>
          <p className="text-sm text-muted-foreground">
            {t.apply.reviewCommitment}
          </p>
        </div>

        {/* Application form */}
        <div className="rounded-xl border p-4">
          <ApplyForm
            lang={uiLang}
            t={t}
            activityTypes={activityTypes}
            countries={SUPPORTED_COUNTRIES.map((code) => ({
              code,
              label: getCountryName(code, uiLang),
            }))}
            userProfile={userProfile}
          />
        </div>
      </div>
    </>
  )
}
