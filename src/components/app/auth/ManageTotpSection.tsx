'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { removeTotp } from '@/app/[lang]/(dashboard)/account/actions'

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
        <Badge variant={totpEnabled ? 'success' : 'destructive'}>
          {totpEnabled ? t.totpEnabled : t.totpNotEnrolled}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {totpEnabled ? t.totpEnabledDesc : t.totpNotEnrolledDesc}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/${lang}/account/totp-setup`)}
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
