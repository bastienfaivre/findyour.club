import { notFound } from 'next/navigation'
import { prisma } from '@/server/db'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { Badge } from '@/components/ui/badge'
import { SendMessageDialog } from '@/components/app/admin/SendMessageDialog'
import { ForceOfflineDialog } from '@/components/app/admin/ForceOfflineDialog'
import { LiftOfflineButton } from '@/components/app/admin/LiftOfflineButton'

interface ClubDetailPageProps {
  params: Promise<{ lang: string; id: string }>
}

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { lang, id } = await params
  const t = getTranslations(resolveUILang(lang))

  const club = await prisma.club.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      country: true,
      logoUrl: true,
      email: true,
      description: true,
      schedule: true,
      howToJoin: true,
      contactPhone: true,
      contactAddress: true,
      externalWebsiteUrl: true,
      isPublished: true,
      forceOffline: true,
      status: true,
      _count: { select: { photos: true } },
      operatorMessages: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, message: true, createdAt: true, readAt: true },
      },
    },
  })

  if (!club) notFound()

  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold">{t.admin.clubs.clubModeration}</h1>

      {/* Club profile overview */}
      <section className="mt-6 space-y-4">
        <div className="flex items-center gap-4">
          {club.logoUrl ? (
            <img src={club.logoUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-muted" />
          )}
          <div>
            <h2 className="text-lg font-semibold">{club.name}</h2>
            <p className="text-sm text-muted-foreground">{club.slug} — {club.country.toUpperCase()}</p>
          </div>
        </div>

        {club.description && (
          <p className="text-sm text-muted-foreground">{club.description}</p>
        )}

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>{t.admin.clubs.photoCount.replace('{count}', String(club._count.photos))}</span>
          {club.email && <span>· {club.email}</span>}
          {club.contactPhone && <span>· {club.contactPhone}</span>}
        </div>
      </section>

      {/* Visibility status & actions */}
      <section className="mt-8 space-y-4">
        <h3 className="text-base font-semibold">{t.admin.clubs.status}</h3>
        <div className="flex items-center gap-3">
          {club.forceOffline ? (
            <Badge variant="destructive">{t.admin.clubs.moderatedOffline}</Badge>
          ) : club.isPublished ? (
            <Badge variant="default">{t.admin.clubs.published}</Badge>
          ) : (
            <Badge variant="secondary">{t.admin.clubs.draft}</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <SendMessageDialog clubId={club.id} clubName={club.name} clubs={t.admin.clubs} common={t.common} />
          {club.forceOffline ? (
            <LiftOfflineButton clubId={club.id} clubName={club.name} clubs={t.admin.clubs} common={t.common} />
          ) : (
            <ForceOfflineDialog clubId={club.id} clubName={club.name} clubs={t.admin.clubs} common={t.common} />
          )}
        </div>
      </section>

      {/* Recent operator messages */}
      <section className="mt-8 space-y-4">
        <h3 className="text-base font-semibold">{t.admin.clubs.recentMessages}</h3>
        {club.operatorMessages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.admin.clubs.noMessages}</p>
        ) : (
          <ul className="space-y-3">
            {club.operatorMessages.map((msg) => (
              <li key={msg.id} className="rounded-md border p-3 text-sm">
                <p className="mb-1">{msg.message}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <time dateTime={msg.createdAt.toISOString()}>
                    {msg.createdAt.toLocaleDateString()}
                  </time>
                  <Badge variant={msg.readAt ? 'secondary' : 'outline'} className="text-xs">
                    {msg.readAt ? t.admin.clubs.read : t.admin.clubs.unread}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
