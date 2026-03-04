import { redirect, notFound } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { getClubBySlug, getClubOwnership } from '@/lib/server/club-queries'
import { MembershipPanel } from '@/components/app/settings/MembershipPanel'
import { inviteEditor } from './actions'

export default async function ClubSettingsPage({
  params,
}: {
  params: Promise<{ country: string; club: string }>
}) {
  const session = await getAuthSession()
  if (!session?.user) redirect('/auth/login')

  const { country, club: slug } = await params // ⚠️ ALWAYS await params in Next.js 15/16

  // getClubBySlug is React-cached: deduplicates the DB call already made by the club layout
  const club = await getClubBySlug(slug, country)
  if (!club) notFound()

  // Only OWNERs can access settings
  if (!(await getClubOwnership(session.user.id, club.id))) redirect(`/${country}/${slug}`)

  // Load memberships + valid (non-expired) invitations in parallel
  const [allMemberships, validInvitations] = await Promise.all([
    prisma.clubMembership.findMany({
      where: { clubId: club.id, status: { in: ['ACTIVE', 'PENDING'] } },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.invitation.findMany({
      where: { clubId: club.id, expiresAt: { gt: new Date() } },
      select: { email: true },
    }),
  ])

  // Only show PENDING memberships that still have a live invitation
  const validInviteEmails = new Set(validInvitations.map(i => i.email))
  const memberships = allMemberships.filter(
    m => m.status === 'ACTIVE' || validInviteEmails.has(m.user.email ?? ''),
  )

  const boundInviteEditor = inviteEditor.bind(null, country, slug)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">{club.name} — Settings</h1>
        <MembershipPanel
          memberships={memberships}
          inviteAction={boundInviteEditor}
        />
      </div>
    </main>
  )
}
