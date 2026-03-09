import { prisma } from '@/server/db'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { ApplicationQueue } from '@/components/app/admin/ApplicationQueue'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { SUPPORTED_COUNTRIES, getCountryName } from '@/lib/country'
import { ACTIVITY_TYPES } from '@/lib/activity-types'

interface ApplicationsPageProps {
  params: Promise<{ lang: string }>
}

export default async function ApplicationsPage({ params }: ApplicationsPageProps) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const activityTypes = ACTIVITY_TYPES.map((slug) => ({
    slug,
    name: t.activityTypes[slug] ?? slug,
  })).sort((a, b) => a.name.localeCompare(b.name, uiLang))

  const countries = SUPPORTED_COUNTRIES.map((code) => ({
    code,
    label: getCountryName(code, uiLang),
  }))

  const [applications, cantons] = await Promise.all([
    prisma.application.findMany({
      where: { status: 'PENDING' },
      include: {
        location: {
          include: {
            swissLocation: {
              include: {
                translations: { where: { language: uiLang } },
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    }),
    prisma.swissCanton.findMany({
      select: {
        code: true,
        translations: { where: { language: uiLang }, select: { name: true } },
      },
      orderBy: { code: 'asc' },
    }),
  ])

  const cantonOptions = cantons.map((c) => ({
    code: c.code,
    name: c.translations[0]?.name ?? c.code,
  }))

  return (
    <div className="flex flex-col h-full min-h-0">
      <AdminPageTitle title={t.admin.applications.title} />
      <div className="flex-1 min-h-0">
        <ApplicationQueue applications={applications} activityTypes={activityTypes} countries={countries} cantons={cantonOptions} translations={t} locale={uiLang} />
      </div>
    </div>
  )
}
