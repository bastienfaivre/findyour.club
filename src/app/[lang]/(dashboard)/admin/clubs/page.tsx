import { prisma } from '@/server/db'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { ClubQueue } from '@/components/app/admin/ClubQueue'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { SUPPORTED_COUNTRIES, getCountryName } from '@/lib/country'
import { ACTIVITY_TYPES } from '@/lib/activity-types'
import { APPROACHING_THRESHOLD_DAYS, VERIFICATION_CYCLE_DAYS } from '@/lib/verification'

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
      lastVerifiedAt: true,
      location: {
        select: {
          swissLocation: {
            select: {
              swisstopoId: true,
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
      memberships: {
        where: { status: 'ACTIVE' },
        select: {
          role: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const clubsWithMembers = clubs.map(({ memberships, ...rest }) => ({
    ...rest,
    members: memberships.map(({ role, user }) => ({ role, user })),
  }))

  // Freshness stats
  const now = new Date().getTime()
  const day80Ms = APPROACHING_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
  const day90Ms = VERIFICATION_CYCLE_DAYS * 24 * 60 * 60 * 1000
  let verified = 0, approaching = 0, expired = 0
  for (const club of clubs) {
    if (!club.lastVerifiedAt) { expired++; continue }
    const age = now - new Date(club.lastVerifiedAt).getTime()
    if (age >= day90Ms) expired++
    else if (age >= day80Ms) approaching++
    else verified++
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <AdminPageTitle title={t.admin.clubs.title} />

      {/* Data freshness overview */}
      <div className="mb-4 rounded-xl border p-4 space-y-2">
        <h3 className="text-sm font-semibold">{t.admin.clubs.freshness.title}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            {t.admin.clubs.freshness.verified}: <strong>{verified}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
            {t.admin.clubs.freshness.approaching}: <strong>{approaching}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
            {t.admin.clubs.freshness.expired}: <strong>{expired}</strong>
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ClubQueue clubs={clubsWithMembers} activityTypes={activityTypes} countries={countries} translations={t} locale={uiLang} />
      </div>
    </div>
  )
}
