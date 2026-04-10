import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { prisma } from '@/server/db'
import { Eye, Users, Building2, ClipboardList } from 'lucide-react'
import { loadClubViews } from './actions'
import { ClubViewsList } from './club-views-list'

interface AdminStatsPageProps {
  params: Promise<{ lang: string }>
}

async function getOverviewStats() {
  const [totalClubs, publishedClubs, totalUsers, totalApplications, pendingApplications] =
    await Promise.all([
      prisma.club.count({ where: { status: 'ACTIVE' } }),
      prisma.club.count({ where: { status: 'ACTIVE', isPublished: true, forceOffline: false } }),
      prisma.user.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING' } }),
    ])

  return { totalClubs, publishedClubs, totalUsers, totalApplications, pendingApplications }
}

// Platform-wide PageEvent queries use $queryRaw to bypass multi-tenant middleware.
// This is safe because the admin layout already restricts access to OPERATOR role.
async function getPageViewStats() {
  type CountRow = { count: bigint }
  const countSince = (since?: Date) => {
    if (since) {
      return prisma.$queryRaw<CountRow[]>`
        SELECT COUNT(*) as count FROM page_events
        WHERE event_type = 'page_view' AND visited_at >= ${since}`
    }
    return prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*) as count FROM page_events
      WHERE event_type = 'page_view'`
  }
  const uniqueSince = (since: Date) =>
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(DISTINCT ip_hash) as count FROM page_events
      WHERE event_type = 'page_view' AND visited_at >= ${since} AND ip_hash IS NOT NULL`

  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [last24, last7, last30, allTime, unique24, unique7, unique30] = await Promise.all([
    countSince(oneDayAgo),
    countSince(sevenDaysAgo),
    countSince(thirtyDaysAgo),
    countSince(),
    uniqueSince(oneDayAgo),
    uniqueSince(sevenDaysAgo),
    uniqueSince(thirtyDaysAgo),
  ])

  return {
    last24: Number(last24[0]?.count ?? 0),
    last7: Number(last7[0]?.count ?? 0),
    last30: Number(last30[0]?.count ?? 0),
    allTime: Number(allTime[0]?.count ?? 0),
    unique24: Number(unique24[0]?.count ?? 0),
    unique7: Number(unique7[0]?.count ?? 0),
    unique30: Number(unique30[0]?.count ?? 0),
  }
}

const INITIAL_PAGE_SIZE = 20
const DAYS = 30

export default async function AdminStatsPage({ params }: AdminStatsPageProps) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const s = t.admin.stats

  const [overview, pageViews, initialClubViews] = await Promise.all([
    getOverviewStats(),
    getPageViewStats(),
    loadClubViews(0, INITIAL_PAGE_SIZE, DAYS),
  ])

  return (
    <div className="w-full mx-auto max-w-2xl space-y-4">
      <AdminPageTitle title={s.title} />

      {/* Overview */}
      <div className="rounded-xl border p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{s.overview}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard icon={<Building2 className="h-4 w-4" />} label={s.totalClubs} value={overview.totalClubs} />
          <StatCard icon={<Building2 className="h-4 w-4" />} label={s.publishedClubs} value={overview.publishedClubs} />
          <StatCard icon={<Users className="h-4 w-4" />} label={s.totalUsers} value={overview.totalUsers} />
          <StatCard icon={<ClipboardList className="h-4 w-4" />} label={s.totalApplications} value={overview.totalApplications} />
          <StatCard icon={<ClipboardList className="h-4 w-4" />} label={s.pendingApplications} value={overview.pendingApplications} />
        </div>
      </div>

      {/* Page Views */}
      <div className="rounded-xl border p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{s.pageViews}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{s.pageViewsDescription}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<Eye className="h-4 w-4" />} label={s.last24Hours} value={pageViews.last24} sub={`${pageViews.unique24} ${s.uniqueVisitors.toLowerCase()}`} />
          <StatCard icon={<Eye className="h-4 w-4" />} label={s.last7Days} value={pageViews.last7} sub={`${pageViews.unique7} ${s.uniqueVisitors.toLowerCase()}`} />
          <StatCard icon={<Eye className="h-4 w-4" />} label={s.last30Days} value={pageViews.last30} sub={`${pageViews.unique30} ${s.uniqueVisitors.toLowerCase()}`} />
          <StatCard icon={<Eye className="h-4 w-4" />} label={s.allTime} value={pageViews.allTime} />
        </div>
      </div>

      {/* Club Views */}
      <div className="rounded-xl border p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{s.topClubs}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{s.topClubsDescription}</p>
        </div>
        <ClubViewsList
          initialEntries={initialClubViews.entries}
          initialTotal={initialClubViews.total}
          days={DAYS}
          translations={{
            views: s.views,
            noData: s.noData,
            showMore: t.admin.showMore,
            showingCount: t.admin.showingCount,
          }}
        />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}
