import { redirect, notFound } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { isValidCountry } from '@/lib/country'
import { getClubBySlug } from '@/lib/server/club-queries'
import { TotpEnrollmentBanner } from '@/components/app/auth/TotpEnrollmentBanner'

interface ClubLayoutProps {
  children: React.ReactNode
  params: Promise<{ country: string; club: string }>
}

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
  const session = await getAuthSession()

  if (!session?.user) redirect('/auth/login')

  if (session.user.totpEnabled && !session.user.totpVerified) {
    redirect('/auth/totp')
  }

  const { country, club: slug } = await params

  if (!isValidCountry(country)) notFound()

  const club = await getClubBySlug(slug, country)
  if (!club) notFound()

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE' },
    select: { role: true },
  })
  if (!membership) redirect('/my-clubs')

  return (
    <>
      <TotpEnrollmentBanner session={session} />
      {children}
    </>
  )
}
