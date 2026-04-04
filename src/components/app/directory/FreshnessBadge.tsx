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
  healthy: 'border-green-300 tint-green text-green-800 dark:border-green-800 dark:tint-green dark:text-green-300',
  approaching: 'border-amber-300 tint-amber text-amber-800 dark:border-amber-800 dark:tint-amber dark:text-amber-300',
  expired: 'border-red-300 tint-red text-red-800 dark:border-red-800 dark:tint-red dark:text-red-300',
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
