/** Number of days after which a club's data is considered expired. */
export const VERIFICATION_CYCLE_DAYS = 90

/** Number of days after which a club is warned that expiry is approaching. */
export const APPROACHING_THRESHOLD_DAYS = 80

export type VerificationState = 'healthy' | 'approaching' | 'expired'

export function getVerificationState(lastVerifiedAt: Date): {
  state: VerificationState
  daysSince: number
  daysRemaining: number
} {
  const now = new Date()
  const diffMs = now.getTime() - new Date(lastVerifiedAt).getTime()
  const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const daysRemaining = Math.max(0, VERIFICATION_CYCLE_DAYS - daysSince)

  let state: VerificationState = 'healthy'
  if (daysSince >= VERIFICATION_CYCLE_DAYS) {
    state = 'expired'
  } else if (daysSince >= APPROACHING_THRESHOLD_DAYS) {
    state = 'approaching'
  }

  return { state, daysSince, daysRemaining }
}
