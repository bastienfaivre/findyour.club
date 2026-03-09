import { notFound } from 'next/navigation'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { getClubActiveMembership } from '@/lib/server/club-queries'

interface ClubAdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string; clubId: string }>
}

export default async function ClubAdminLayout({ children, params }: ClubAdminLayoutProps) {
  const { clubId } = await params

  const session = await getAuthSession()
  if (!session?.user) notFound()

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true, name: true },
  })
  if (!club) notFound()

  const membership = await getClubActiveMembership(session.user.id, club.id)
  if (!membership) notFound()

  return <>{children}</>
}
