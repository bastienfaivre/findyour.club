'use client'

import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { getVerificationState } from '@/lib/verification'

interface VerificationCountdownProps {
  lastVerifiedAt: Date
  t: {
    healthy: string
    approaching: string
    expired: string
  }
}

export function VerificationCountdown({ lastVerifiedAt, t }: VerificationCountdownProps) {
  const { state, daysSince, daysRemaining } = getVerificationState(lastVerifiedAt)

  if (state === 'healthy') {
    return (
      <div className="rounded-xl border border-green-200 tint-green p-4 dark:border-green-900 dark:tint-green">
        <p className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
          {t.healthy.replace('{daysSince}', String(daysSince)).replace('{daysRemaining}', String(daysRemaining))}
        </p>
      </div>
    )
  }

  if (state === 'approaching') {
    return (
      <div className="rounded-xl border border-amber-200 tint-amber p-4 dark:border-amber-900 dark:tint-amber">
        <p className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {t.approaching.replace('{daysRemaining}', String(daysRemaining))}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 tint-red p-4 dark:border-red-900 dark:tint-red">
      <p className="flex items-center gap-2 text-sm font-medium text-red-800 dark:text-red-300">
        <XCircle className="h-4 w-4 shrink-0" />
        {t.expired}
      </p>
    </div>
  )
}
