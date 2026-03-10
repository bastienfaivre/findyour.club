import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { prisma } from '@/server/db'
import { ClubProfileForm } from '@/components/app/club-admin/ClubProfileForm'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

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
  if (!club) notFound()

  return (
    <>
    <AdminPageTitle title={t.club.admin.clubProfile.title} />
    <ClubProfileForm
      clubId={clubId}
      translations={t.club.admin}
      clubSiteTranslations={{
        contactCta: t.clubSite.contactCta,
        visitWebsite: t.clubSite.visitWebsite,
        goToPhoto: t.clubSite.goToPhoto,
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
    </>
  )
}
