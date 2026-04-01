import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { prisma } from '@/server/db'
import { getNumberSetting } from '@/lib/server/platform-settings'
import { ClubProfileForm } from '@/components/app/club-admin/ClubProfileForm'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { confirmClubData } from './actions'

interface ClubAdminPageProps {
  params: Promise<{ lang: string; clubId: string }>
}

export default async function ClubAdminPage({ params }: ClubAdminPageProps) {
  const { lang, clubId } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      name: true,
      email: true,
      activityType: true,
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
      logoUrl: true,
      logoAlt: true,
      lastVerifiedAt: true,
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
  if (!club) notFound()

  const [maxPhotos, maxImageSizeMb] = await Promise.all([
    getNumberSetting('limit.max_photos_per_club'),
    getNumberSetting('limit.max_image_size_mb'),
  ])
  const maxImageSizeBytes = maxImageSizeMb * 1024 * 1024

  return (
    <>
    <AdminPageTitle title={t.club.admin.clubProfile.title} />
    <ClubProfileForm
      clubId={clubId}
      translations={t.club.admin}
      activityTypeLabel={club.activityType ? (t.activityTypes[club.activityType] ?? club.activityType) : null}
      maxPhotos={maxPhotos}
      maxImageSizeBytes={maxImageSizeBytes}
      clubSiteTranslations={{
        contactCta: t.clubSite.contactCta,
        visitWebsite: t.clubSite.visitWebsite,
        goToPhoto: t.clubSite.goToPhoto,
        closeLightbox: t.clubSite.closeLightbox,
        description: t.clubSite.description,
        schedule: t.clubSite.schedule,
        howToJoin: t.clubSite.howToJoin,
        contactInfo: t.clubSite.contactInfo,
        email: t.clubSite.email,
        phone: t.clubSite.phone,
        address: t.clubSite.address,
        photos: t.clubSite.photos,
      }}
      initialData={{
        name: club.name,
        email: club.email,
        description: club.description ?? '',
        schedule: club.schedule ?? '',
        howToJoin: club.howToJoin ?? '',
        contactPhone: club.contactPhone,
        contactAddress: club.contactAddress,
        externalWebsiteUrl: club.externalWebsiteUrl,
        instagramUrl: club.instagramUrl,
        facebookUrl: club.facebookUrl,
        xUrl: club.xUrl,
        tiktokUrl: club.tiktokUrl,
        discordUrl: club.discordUrl,
        youtubeUrl: club.youtubeUrl,
        whatsappUrl: club.whatsappUrl,
        telegramUrl: club.telegramUrl,
        githubUrl: club.githubUrl,
        logoUrl: club.logoUrl,
        logoAlt: club.logoAlt,
        photos: club.photos,
      }}
      lastVerifiedAt={club.lastVerifiedAt}
      confirmAction={confirmClubData}
    />
    </>
  )
}
