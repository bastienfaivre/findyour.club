'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
  commonT: { confirm: string; cancel: string }
}

export function ManageTotpSection({ totpEnabled, lang, t, commonT }: ManageTotpSectionProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      const result = await removeTotp(lang)
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

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/${lang}/account/totp-setup`)}
          disabled={isPending}
        >
          {totpEnabled ? t.resetTotp : t.enrollTotp}
        </Button>

        {totpEnabled && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isPending}>
                {isPending ? t.removing : t.disable2fa}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.disable2fa}</AlertDialogTitle>
                <AlertDialogDescription>{t.totpConfirmDisable}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{commonT.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {commonT.confirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
