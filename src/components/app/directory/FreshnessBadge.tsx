import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { getVerificationState, type VerificationState } from '@/lib/verification'

interface FreshnessBadgeProps {
  lastVerifiedAt: Date | null
  upToDateLabel: string
  notVerifiedLabel: string
  /** When provided, enables the 3-state mode with a distinct "approaching" badge */
  approachingLabel?: string
  className?: string
}

function getState(lastVerifiedAt: Date | null): VerificationState {
  if (!lastVerifiedAt) return 'expired'
  return getVerificationState(lastVerifiedAt).state
}

const stateStyles: Record<VerificationState, string> = {
  healthy: 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300',
  approaching: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
  expired: 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300',
}

export function FreshnessBadge({ lastVerifiedAt, upToDateLabel, notVerifiedLabel, approachingLabel, className }: FreshnessBadgeProps) {
  const state = getState(lastVerifiedAt)

  // 2-state mode (public): healthy → green, approaching+expired → amber
  if (!approachingLabel) {
    const is2StateOk = state === 'healthy'
    return (
      <Badge variant="outline" className={cn(is2StateOk ? stateStyles.healthy : stateStyles.approaching, 'text-xs', className)}>
        {is2StateOk ? upToDateLabel : notVerifiedLabel}
      </Badge>
    )
  }

  // 3-state mode (admin): healthy → green, approaching → amber, expired → red
  const label = state === 'healthy' ? upToDateLabel : state === 'approaching' ? approachingLabel : notVerifiedLabel
  return (
    <Badge variant="outline" className={cn(stateStyles[state], 'text-xs', className)}>
      {label}
    </Badge>
  )
}
