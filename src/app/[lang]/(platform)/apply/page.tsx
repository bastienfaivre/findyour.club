import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { prisma } from '@/server/db'
import { ApplyForm } from '@/components/app/apply/ApplyForm'
import { SUPPORTED_COUNTRIES, getCountryName } from '@/lib/country'

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const rawActivityTypes = await prisma.activityType.findMany({
    select: { id: true, name: true, slug: true },
  })

  const activityTypes = rawActivityTypes
    .map((at) => ({
      id: at.id,
      name: t.activityTypes[at.slug] ?? at.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, uiLang))

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold">{t.apply.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.apply.subtitle}</p>
        <div className="mt-8">
          <ApplyForm
            lang={uiLang}
            t={t}
            activityTypes={activityTypes}
            countries={SUPPORTED_COUNTRIES.map((code) => ({
              code,
              label: getCountryName(code, uiLang),
            }))}
          />
        </div>
      </div>
    </div>
  )
}
