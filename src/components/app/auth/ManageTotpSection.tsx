'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { removeTotp } from '@/app/auth/account/actions'

interface ManageTotpSectionProps {
  totpEnabled: boolean
}

export function ManageTotpSection({ totpEnabled }: ManageTotpSectionProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    if (!confirm('Are you sure you want to disable two-factor authentication? Your account will be less secure.')) return
    setError(null)

    startTransition(async () => {
      const result = await removeTotp()
      if (!result.success) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          totpEnabled ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {totpEnabled ? 'Enabled' : 'Not enrolled'}
        </span>
        <span className="text-sm text-muted-foreground">
          {totpEnabled
            ? 'Your account is protected with TOTP 2FA.'
            : 'Your account is not protected with 2FA.'}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push('/auth/totp-setup')}
          disabled={isPending}
        >
          {totpEnabled ? 'Reset TOTP (re-enroll)' : 'Enroll TOTP'}
        </Button>

        {totpEnabled && (
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isPending}
          >
            {isPending ? 'Removing…' : 'Disable 2FA'}
          </Button>
        )}
      </div>
    </div>
  )
}
