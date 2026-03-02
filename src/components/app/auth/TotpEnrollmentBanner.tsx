// Server Component — no client-side JS needed
import Link from 'next/link'
import type { Session } from 'next-auth'

interface TotpEnrollmentBannerProps {
  session: Session | null
}

export function TotpEnrollmentBanner({ session }: TotpEnrollmentBannerProps) {
  if (!session?.user || session.user.totpEnabled || session.user.role !== 'CLUB_ADMIN') {
    return null
  }

  return (
    <div
      role="alert"
      className="bg-amber-500 text-amber-950 px-4 py-3 text-sm font-medium flex items-center justify-between"
    >
      <span>
        Your account is not yet protected by two-factor authentication.{' '}
        <Link href="/auth/totp-setup" className="underline font-semibold">
          Set up 2FA now
        </Link>{' '}
        to secure your club site.
      </span>
      {/* No dismiss button — non-dismissible per AC4 */}
    </div>
  )
}
