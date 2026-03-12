'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    consequences: string[]
    /** Use {clubs} as placeholder for the list of club names */
    clubsBlockingNote: string
    editorOnlyNote: string
    noClubsNote: string
    acknowledge: string
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
  const [acknowledged, setAcknowledged] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const soleOwnerClubs = info?.soleOwnerClubs ?? []
  const isBlocked = soleOwnerClubs.length > 0

  async function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setLoading(true)
      setError(null)
      setAcknowledged(false)
      const result = await getAccountDeletionInfo()
      if (!result) {
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
          <Button variant="destructive">
            <Trash2 className="h-4 w-4" />
            {t.button}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>

          {loading ? (
            <p className="text-sm text-muted-foreground py-2">&hellip;</p>
          ) : info ? (
            <div className="space-y-4 text-sm">
              {/* Detailed consequences */}
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {t.consequences.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              {/* Club-specific warnings */}
              {isBlocked && (
                <p className="text-destructive font-medium">
                  {t.clubsBlockingNote.replace('{clubs}', soleOwnerClubs.map((c) => c.name).join(', '))}
                </p>
              )}

              {!isBlocked && info.otherClubs.length > 0 && (
                <p className="text-muted-foreground">{t.editorOnlyNote}</p>
              )}

              {!isBlocked && info.otherClubs.length === 0 && (
                <p className="text-muted-foreground">{t.noClubsNote}</p>
              )}

              {/* Acknowledge checkbox (only when not blocked) */}
              {!isBlocked && (
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-destructive"
                  />
                  <span className="text-sm font-medium">{t.acknowledge}</span>
                </label>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t.cancel}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || loading || isBlocked || !acknowledged}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {isPending ? t.deleting : t.confirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
