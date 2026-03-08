import Link from 'next/link'
import { prisma } from '@/server/db'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { Badge } from '@/components/ui/badge'

interface ClubsPageProps {
  params: Promise<{ lang: string }>
}

export default async function ClubsPage({ params }: ClubsPageProps) {
  const { lang } = await params
  const t = getTranslations(resolveUILang(lang))

  const clubs = await prisma.club.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      slug: true,
      country: true,
      logoUrl: true,
      isPublished: true,
      forceOffline: true,
      _count: { select: { photos: true, operatorMessages: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">{t.admin.clubs.title}</h1>
      <div className="mt-6">
        {clubs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.admin.clubs.noClubs}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4 font-medium">{t.admin.clubs.name}</th>
                  <th className="pb-3 pr-4 font-medium">{t.admin.clubs.country}</th>
                  <th className="pb-3 pr-4 font-medium">{t.admin.clubs.status}</th>
                  <th className="pb-3 pr-4 font-medium">{t.admin.clubs.photos}</th>
                  <th className="pb-3 font-medium">{t.admin.clubs.actions}</th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((club) => (
                  <tr key={club.id} className="border-b">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {club.logoUrl ? (
                          <img
                            src={club.logoUrl}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted" />
                        )}
                        <span className="font-medium">{club.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 uppercase">{club.country}</td>
                    <td className="py-3 pr-4">
                      {club.forceOffline ? (
                        <Badge variant="destructive">{t.admin.clubs.moderatedOffline}</Badge>
                      ) : club.isPublished ? (
                        <Badge variant="default">{t.admin.clubs.published}</Badge>
                      ) : (
                        <Badge variant="secondary">{t.admin.clubs.draft}</Badge>
                      )}
                    </td>
                    <td className="py-3 pr-4">{club._count.photos}</td>
                    <td className="py-3">
                      <Link
                        href={`/${lang}/admin/clubs/${club.id}`}
                        className="text-sm font-medium underline underline-offset-4 hover:text-primary"
                      >
                        {t.admin.clubs.viewClub}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
