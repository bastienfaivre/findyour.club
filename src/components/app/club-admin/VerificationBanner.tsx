import Link from 'next/link'
import { APPROACHING_THRESHOLD_DAYS, VERIFICATION_CYCLE_DAYS } from '@/lib/verification'

interface ClubVerificationInfo {
  id: string
  name: string
  lastVerifiedAt: Date
}

interface VerificationBannerProps {
  clubs: ClubVerificationInfo[]
  lang: string
  t: {
    approaching: string
    expired: string
    andMore: string
  }
}

const MAX_BANNERS = 3

export function VerificationBanner({ clubs, lang, t }: VerificationBannerProps) {
  const now = new Date()

  const clubsNeedingAttention = clubs
    .map((club) => {
      const diffMs = now.getTime() - new Date(club.lastVerifiedAt).getTime()
      const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const daysRemaining = Math.max(0, VERIFICATION_CYCLE_DAYS - daysSince)
      const isExpired = daysSince >= VERIFICATION_CYCLE_DAYS
      const isApproaching = daysSince >= APPROACHING_THRESHOLD_DAYS
      return { ...club, daysSince, daysRemaining, isExpired, isApproaching }
    })
    .filter((c) => c.isApproaching)
    .sort((a, b) => b.daysSince - a.daysSince) // most urgent first

  if (clubsNeedingAttention.length === 0) return null

  const visible = clubsNeedingAttention.slice(0, MAX_BANNERS)
  const overflow = clubsNeedingAttention.length - MAX_BANNERS

  return (
    <div className="shrink-0 space-y-0">
      {visible.map((club) => (
        <div
          key={club.id}
          role="alert"
          className={`px-4 py-2 text-sm font-medium flex items-center justify-between ${
            club.isExpired
              ? 'bg-red-500 text-white'
              : 'bg-amber-500 text-amber-950'
          }`}
        >
          <span>
            <strong>{club.name}</strong>
            {' — '}
            {club.isExpired
              ? t.expired
              : t.approaching.replace('{daysRemaining}', String(club.daysRemaining))}
          </span>
          <Link
            href={`/${lang}/club/${club.id}/settings`}
            className={`underline font-semibold text-sm shrink-0 ml-4 ${
              club.isExpired ? 'text-white' : 'text-amber-950'
            }`}
          >
            →
          </Link>
        </div>
      ))}
      {overflow > 0 && (
        <div className="bg-amber-500 text-amber-950 px-4 py-1 text-xs font-medium text-center">
          {t.andMore.replace('{count}', String(overflow))}
        </div>
      )}
    </div>
  )
}
