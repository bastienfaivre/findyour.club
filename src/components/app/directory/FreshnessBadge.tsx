import { Badge } from '@/components/ui/badge'
import { VERIFICATION_CYCLE_DAYS } from '@/lib/verification'

interface FreshnessBadgeProps {
  lastVerifiedAt: Date | null
  upToDateLabel: string
  notVerifiedLabel: string
}

function isVerified(lastVerifiedAt: Date | null): boolean {
  if (!lastVerifiedAt) return false
  const daysSince = Math.floor((new Date().getTime() - new Date(lastVerifiedAt).getTime()) / (1000 * 60 * 60 * 24))
  return daysSince < VERIFICATION_CYCLE_DAYS
}

export function FreshnessBadge({ lastVerifiedAt, upToDateLabel, notVerifiedLabel }: FreshnessBadgeProps) {
  const upToDate = isVerified(lastVerifiedAt)

  if (!upToDate) {
    return (
      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300 text-xs">
        {notVerifiedLabel}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300 text-xs">
      {upToDateLabel}
    </Badge>
  )
}
