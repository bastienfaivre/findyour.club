import { prisma } from '@/server/db'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { ApplicationQueue } from '@/components/app/admin/ApplicationQueue'

interface ApplicationsPageProps {
  params: Promise<{ lang: string }>
}

export default async function ApplicationsPage({ params }: ApplicationsPageProps) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const applications = await prisma.application.findMany({
    where: { status: 'PENDING' },
    include: {
      activityType: true,
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
  })

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">{t.admin.applications.title}</h1>
      <div className="mt-6">
        <ApplicationQueue applications={applications} translations={t} locale={uiLang} />
      </div>
    </main>
  )
}
