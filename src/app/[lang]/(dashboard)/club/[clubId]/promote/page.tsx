import { notFound } from 'next/navigation'
import { Construction } from 'lucide-react'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { prisma } from '@/server/db'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

interface PromotePageProps {
  params: Promise<{ lang: string; clubId: string }>
}

export default async function PromotePage({ params }: PromotePageProps) {
  const { clubId } = await params
  const uiLang = resolveUILang((await params).lang)
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
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-center dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-center justify-center gap-2">
            <Construction className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {t.club.admin.promote.comingSoon}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
