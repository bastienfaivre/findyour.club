'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteAccount, getAccountDeletionInfo, type AccountDeletionInfo } from '@/app/[lang]/(dashboard)/account/actions'

interface DeleteAccountSectionProps {
  lang: string
  t: {
    title: string
    description: string
    button: string
    dialogTitle: string
    dialogDescription: string
    clubsWarning: string
    editorOnlyNote: string
    noClubsNote: string
    confirmLabel: string
    confirmHint: string
    deleting: string
    confirm: string
    cancel: string
  }
}

export function DeleteAccountSection({ lang, t }: DeleteAccountSectionProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [info, setInfo] = useState<AccountDeletionInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const soleOwnerClubs = info?.soleOwnerClubs ?? []
  const requiredConfirmation = soleOwnerClubs.map((c) => c.name).join(', ')
  const needsConfirmation = soleOwnerClubs.length > 0
  const canDelete = !needsConfirmation || confirmText === requiredConfirmation

  async function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setLoading(true)
      setError(null)
      setConfirmText('')
      const result = await getAccountDeletionInfo()
      if (!result) {
        // Session expired — close dialog and bail
        setLoading(false)
        setOpen(false)
        return
      }
      setInfo(result)
      setLoading(false)
    }
    setOpen(isOpen)
  }

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteAccount()
      if (result.success) {
        router.push(`/${lang}/auth/login`)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <section className="space-y-4">
      <div className="border-b border-destructive/30 pb-2">
        <h2 className="text-lg font-medium text-destructive">{t.title}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{t.description}</p>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">{t.button}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>

          {loading ? (
            <p className="text-sm text-muted-foreground py-2">…</p>
          ) : info ? (
            <div className="space-y-3 text-sm">
              {soleOwnerClubs.length > 0 && (
                <p className="text-destructive font-medium">
                  {t.clubsWarning.replace('{clubs}', soleOwnerClubs.map((c) => c.name).join(', '))}
                </p>
              )}

              {info.otherClubs.length > 0 && (
                <p className="text-muted-foreground">{t.editorOnlyNote}</p>
              )}

              {soleOwnerClubs.length === 0 && info.otherClubs.length === 0 && (
                <p className="text-muted-foreground">{t.noClubsNote}</p>
              )}

              {needsConfirmation && (
                <div className="space-y-2">
                  <label htmlFor="confirm-delete" className="text-sm font-medium">
                    {t.confirmLabel}
                  </label>
                  <p className="text-xs text-muted-foreground font-mono">
                    {t.confirmHint.replace('{names}', requiredConfirmation)}
                  </p>
                  <Input
                    id="confirm-delete"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t.cancel}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || loading || !canDelete}
            >
              {isPending ? t.deleting : t.confirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
