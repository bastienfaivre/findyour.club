import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { prisma } from '@/server/db'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { DownloadButton } from '@/components/app/admin/DownloadButton'
import { EmbedBadge } from '@/components/app/club-admin/EmbedBadge'
import { Card, CardContent } from '@/components/ui/card'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

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
    select: { name: true, slug: true, country: true },
  })
  if (!club) notFound()

  const clubUrl = `${BASE_URL}/${uiLang}/${club.country}/${club.slug}`
  const badgeUrl = `${BASE_URL}/api/badge/${club.country}/${club.slug}`

  return (
    <>
      <AdminPageTitle title={p.title} />
      <div className="max-w-xl space-y-4">
        <p className="text-muted-foreground">{p.description}</p>

        <EmbedBadge
          badgeUrl={badgeUrl}
          clubUrl={clubUrl}
          clubName={club.name}
          labels={{
            title: p.embedTitle,
            description: p.embedDescription,
            copySnippet: p.copySnippet,
            copied: p.copied,
            preview: p.preview,
          }}
        />

        <Card className="py-0 gap-0">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{p.story}</p>
              <p className="text-sm text-muted-foreground">{p.storyDescription}</p>
            </div>
            <DownloadButton
              href={`/api/club/${clubId}/story?lang=${uiLang}`}
              filename={`${club.name.toLowerCase().replace(/\s+/g, '-')}-story.png`}
              label={p.download}
            />
          </CardContent>
        </Card>

        <Card className="py-0 gap-0">
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
