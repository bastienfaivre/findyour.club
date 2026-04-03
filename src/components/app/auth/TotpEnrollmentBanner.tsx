// Server Component — no client-side JS needed
import Link from 'next/link'
import type { Session } from 'next-auth'
import type { Translations } from '@/lib/i18n/translations'

interface TotpEnrollmentBannerProps {
  session: Session | null
  lang: string
  t: Translations['auth']['banner']
}

export function TotpEnrollmentBanner({ session, lang, t }: TotpEnrollmentBannerProps) {
  if (!session?.user || session.user.totpEnabled || session.user.role !== 'CLUB_ADMIN') {
    return null
  }

  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-300 px-4 py-3 text-sm font-medium flex items-center justify-between"
    >
      <span>
        {t.pre}{' '}
        <Link href={`/${lang}/account/totp-setup`} className="underline font-semibold">
          {t.link}
        </Link>{' '}
        {t.post}
      </span>
      {/* No dismiss button — non-dismissible per AC4 */}
    </div>
  )
}
