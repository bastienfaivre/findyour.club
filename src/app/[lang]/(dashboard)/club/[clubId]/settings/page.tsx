import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Download, ExternalLink } from 'lucide-react'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { VisibilityToggle } from '@/components/app/club-admin/PublishToggle'
import { MembershipPanel } from '@/components/app/settings/MembershipPanel'
import { inviteEditor, transferOwnership, revokeAccess } from './actions'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

interface ClubSettingsPageProps {
  params: Promise<{ lang: string; clubId: string }>
}

export default async function ClubSettingsPage({ params }: ClubSettingsPageProps) {
  const { lang, clubId } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const session = await getAuthSession()
  if (!session?.user?.id) notFound()

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true, name: true, slug: true, country: true, isPublished: true, forceOffline: true, _count: { select: { photos: true } } },
  })
  if (!club) notFound()

  // Check if user is an OWNER (needed for membership management)
  const callerMembership = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE' },
    select: { role: true },
  })
  if (!callerMembership) notFound()

  const isOwner = callerMembership.role === 'OWNER'

  // Load memberships + valid invitations in parallel (only for owners)
  let memberships: Array<{
    id: string
    userId: string
    role: 'OWNER' | 'EDITOR'
    status: 'ACTIVE' | 'PENDING'
    user: { email: string | null; name: string | null }
  }> = []

  if (isOwner) {
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

    const validInviteEmails = new Set(validInvitations.map(i => i.email))
    memberships = allMemberships.filter(
      m => m.status === 'ACTIVE' || validInviteEmails.has(m.user.email ?? ''),
    ) as typeof memberships
  }

  const boundInviteEditor = inviteEditor.bind(null, clubId)
  const boundTransferOwnership = transferOwnership.bind(null, clubId)
  const boundRevokeAccess = revokeAccess.bind(null, clubId)

  const publicPageUrl = `/${lang}/${club.country}/${club.slug}`

  return (
    <div className="max-w-xl space-y-8">
      <AdminPageTitle title={t.club.admin.settings.title} />

      {/* Visibility Toggle */}
      {isOwner && (
        <VisibilityToggle
          isPublished={club.isPublished}
          forceOffline={club.forceOffline}
          clubId={clubId}
          photoCount={club._count.photos}
          translations={t.club.admin.visibility}
        />
      )}

      {/* View public page */}
      <Link
        href={publicPageUrl}
        target="_blank"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        {t.club.admin.sidebar.viewPublicPage}
      </Link>

      {/* Membership Panel (owners only) */}
      {isOwner && (
        <MembershipPanel
          memberships={memberships}
          currentUserId={session.user.id}
          inviteAction={boundInviteEditor}
          transferOwnershipAction={boundTransferOwnership}
          revokeAccessAction={boundRevokeAccess}
          t={t.club.membership}
        />
      )}

      {/* Data Export (owners only) */}
      {isOwner && (
        <section className="space-y-2">
          <p className="text-sm text-muted-foreground">{t.club.admin.settings.exportDescription}</p>
          <a
            href={`/api/club/${clubId}/export`}
            download
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="h-4 w-4" />
            {t.club.admin.settings.exportData}
          </a>
        </section>
      )}
    </div>
  )
}
