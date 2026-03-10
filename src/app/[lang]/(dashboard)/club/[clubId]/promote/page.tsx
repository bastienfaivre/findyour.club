import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { prisma } from '@/server/db'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { PromoteDownloads } from '@/components/app/club-admin/PromoteDownloads'

interface PromotePageProps {
  params: Promise<{ lang: string; clubId: string }>
}

export default async function PromotePage({ params }: PromotePageProps) {
  const { lang, clubId } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { name: true },
  })
  if (!club) notFound()

  return (
    <>
      <AdminPageTitle title={t.club.admin.promote.title} />
      <div className="max-w-xl space-y-6">
        <p className="text-muted-foreground">{t.club.admin.promote.description}</p>
        <PromoteDownloads clubId={clubId} translations={t.club.admin.promote} />
      </div>
    </>
  )
}
