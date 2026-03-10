import { prisma } from '@/server/db'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { ClubQueue } from '@/components/app/admin/ClubQueue'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { SUPPORTED_COUNTRIES, getCountryName } from '@/lib/country'
import { ACTIVITY_TYPES } from '@/lib/activity-types'

interface ClubsPageProps {
  params: Promise<{ lang: string }>
}

export default async function ClubsPage({ params }: ClubsPageProps) {
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

  const clubs = await prisma.club.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      slug: true,
      country: true,
      logoUrl: true,
      logoAlt: true,
      email: true,
      description: true,
      schedule: true,
      howToJoin: true,
      contactPhone: true,
      contactAddress: true,
      externalWebsiteUrl: true,
      instagramUrl: true,
      facebookUrl: true,
      xUrl: true,
      tiktokUrl: true,
      discordUrl: true,
      youtubeUrl: true,
      whatsappUrl: true,
      telegramUrl: true,
      githubUrl: true,
      isPublished: true,
      forceOffline: true,
      activityType: true,
      location: {
        select: {
          swissLocation: {
            select: {
              swisstopoId: true,
              plz: true,
              cantonCode: true,
              translations: { where: { language: uiLang }, select: { name: true } },
            },
          },
        },
      },
      photos: {
        orderBy: { position: 'asc' as const },
        select: { id: true, url: true, alt: true, position: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="flex flex-col h-full min-h-0">
      <AdminPageTitle title={t.admin.clubs.title} />
      <div className="flex-1 min-h-0">
        <ClubQueue clubs={clubs} activityTypes={activityTypes} countries={countries} translations={t} locale={uiLang} />
      </div>
    </div>
  )
}
