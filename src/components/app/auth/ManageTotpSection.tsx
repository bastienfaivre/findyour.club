'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { removeTotp } from '@/app/[lang]/auth/account/actions'

interface ManageTotpSectionT {
  totpEnabled: string
  totpNotEnrolled: string
  totpEnabledDesc: string
  totpNotEnrolledDesc: string
  enrollTotp: string
  resetTotp: string
  removing: string
  disable2fa: string
  totpConfirmDisable: string
}

interface ManageTotpSectionProps {
  totpEnabled: boolean
  lang: string
  t: ManageTotpSectionT
}

export function ManageTotpSection({ totpEnabled, lang, t }: ManageTotpSectionProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    if (!confirm(t.totpConfirmDisable)) return
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
          {totpEnabled ? t.totpEnabled : t.totpNotEnrolled}
        </span>
        <span className="text-sm text-muted-foreground">
          {totpEnabled ? t.totpEnabledDesc : t.totpNotEnrolledDesc}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/${lang}/auth/totp-setup`)}
          disabled={isPending}
        >
          {totpEnabled ? t.resetTotp : t.enrollTotp}
        </Button>

        {totpEnabled && (
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isPending}
          >
            {isPending ? t.removing : t.disable2fa}
          </Button>
        )}
      </div>
    </div>
  )
}
