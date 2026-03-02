import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { TotpEnrollmentBanner } from '@/components/app/auth/TotpEnrollmentBanner'

interface ClubLayoutProps {
  children: React.ReactNode
  params: Promise<{ club: string }>
}

export default async function ClubLayout({ children }: ClubLayoutProps) {
  const session = await getAuthSession()

  // TOTP bypass guard: user completed password login but hasn't passed the TOTP challenge yet.
  // Without this server-side redirect, a user could skip /auth/totp by navigating directly here.
  // Comprehensive middleware enforcement (including API routes) is Story 1.4.
  if (session?.user?.totpEnabled && !session.user.totpVerified) {
    redirect('/auth/totp')
  }

  return (
    <>
      <TotpEnrollmentBanner session={session} />
      {children}
    </>
  )
}
