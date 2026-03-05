import { redirect, notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { getClubBySlug, getClubOwnership } from '@/lib/server/club-queries'
import { MembershipPanel } from '@/components/app/settings/MembershipPanel'
import { inviteEditor, transferOwnership, revokeAccess } from './actions'

export default async function ClubSettingsPage({
  params,
}: {
  params: Promise<{ lang: string; country: string; club: string }>
}) {
  const session = await getAuthSession()
  if (!session?.user) redirect('/auth/login')

  const { lang, country, club: slug } = await params // ⚠️ ALWAYS await params in Next.js 15/16
  const t = getTranslations(resolveUILang(lang))

  // getClubBySlug is React-cached: deduplicates the DB call already made by the club layout
  const club = await getClubBySlug(slug, country)
  if (!club) notFound()

  // Only OWNERs can access settings
  if (!(await getClubOwnership(session.user.id, club.id))) redirect(`/${lang}/${country}/${slug}`)

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
  const boundTransferOwnership = transferOwnership.bind(null, country, slug)
  const boundRevokeAccess = revokeAccess.bind(null, country, slug)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">{club.name} — {t.club.settings}</h1>
        <MembershipPanel
          memberships={memberships}
          currentUserId={session.user.id}
          inviteAction={boundInviteEditor}
          transferOwnershipAction={boundTransferOwnership}
          revokeAccessAction={boundRevokeAccess}
          t={t.club.membership}
        />
      </div>
    </main>
  )
}
