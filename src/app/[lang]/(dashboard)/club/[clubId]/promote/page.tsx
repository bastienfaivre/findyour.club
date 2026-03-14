import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { prisma } from '@/server/db'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { DownloadButton } from '@/components/app/admin/DownloadButton'
import { Card, CardContent } from '@/components/ui/card'

interface PromotePageProps {
  params: Promise<{ lang: string; clubId: string }>
}

export default async function PromotePage({ params }: PromotePageProps) {
  const { clubId, lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const p = t.club.admin.promote

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { name: true },
  })
  if (!club) notFound()

  return (
    <>
      <AdminPageTitle title={p.title} />
      <div className="max-w-xl space-y-6">
        <p className="text-muted-foreground">{p.description}</p>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{p.poster}</p>
              <p className="text-sm text-muted-foreground">{p.posterDescription}</p>
            </div>
            <DownloadButton
              href={`/api/club/${clubId}/poster?lang=${uiLang}`}
              filename={`${club.name.toLowerCase().replace(/\s+/g, '-')}-poster.pdf`}
              label={p.download}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
