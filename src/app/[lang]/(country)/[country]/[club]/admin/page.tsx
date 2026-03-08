import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { prisma } from '@/server/db'
import { getClubBySlug } from '@/lib/server/club-queries'
import { ClubProfileForm } from '@/components/app/club-admin/ClubProfileForm'
import { PublishToggle } from '@/components/app/club-admin/PublishToggle'

interface AdminPageProps {
  params: Promise<{ lang: string; country: string; club: string }>
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { lang, country, club: slug } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const clubRef = await getClubBySlug(slug, country)
  if (!clubRef) return null

  const club = await prisma.club.findUnique({
    where: { id: clubRef.id },
    select: {
      isPublished: true,
      forceOffline: true,
      name: true,
      email: true,
      description: true,
      schedule: true,
      howToJoin: true,
      contactPhone: true,
      contactAddress: true,
      externalWebsiteUrl: true,
      logoUrl: true,
      logoAlt: true,
      photos: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          url: true,
          alt: true,
          position: true,
        },
      },
    },
  })
  if (!club) return null

  return (
    <div className="space-y-6">
      <PublishToggle
        isPublished={club.isPublished}
        forceOffline={club.forceOffline}
        lang={lang}
        country={country}
        slug={slug}
        translations={t.club.admin.publish}
      />
      <ClubProfileForm
        lang={lang}
        country={country}
        slug={slug}
        translations={t.club.admin}
        initialData={{
          name: club.name,
          email: club.email,
          description: club.description,
          schedule: club.schedule,
          howToJoin: club.howToJoin,
          contactPhone: club.contactPhone,
          contactAddress: club.contactAddress,
          externalWebsiteUrl: club.externalWebsiteUrl,
          logoUrl: club.logoUrl,
          logoAlt: club.logoAlt,
          photos: club.photos,
        }}
      />
    </div>
  )
}
