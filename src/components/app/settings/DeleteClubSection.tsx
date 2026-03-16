'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Download, Loader2 } from 'lucide-react'
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
import type { DeleteClubResult } from '@/app/[lang]/(dashboard)/club/[clubId]/settings/actions'

interface DeleteClubSectionProps {
  clubId: string
  clubName: string
  lang: string
  exportUrl: string
  t: {
    title: string
    description: string
    button: string
    /** Use {clubName} as placeholder */
    dialogTitle: string
    dialogDescription: string
    consequences: string[]
    exportReminder: string
    /** Use {clubName} as placeholder */
    confirmHint: string
    acknowledge: string
    deleting: string
    confirm: string
    cancel: string
  }
}

export function DeleteClubSection({ clubId, clubName, lang, exportUrl, t }: DeleteClubSectionProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const canDelete = confirmText === clubName && acknowledged

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setConfirmText('')
      setAcknowledged(false)
      setError(null)
    }
    setOpen(isOpen)
  }

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const { ownerDeleteClub } = await import('@/app/[lang]/(dashboard)/club/[clubId]/settings/actions')
      const result: DeleteClubResult = await ownerDeleteClub(clubId)
      if (result.success) {
        router.push(`/${lang}/account`)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <section className="space-y-4">
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
            <AlertDialogTitle>{t.dialogTitle.replace('{clubName}', clubName)}</AlertDialogTitle>
            <AlertDialogDescription>{t.dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 text-sm">
            {/* Detailed consequences */}
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {t.consequences.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            {/* Export reminder */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{t.exportReminder}</span>
              <Button variant="outline" size="xs" asChild>
                <a
                  href={exportUrl}
                  download
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="h-3 w-3" />
                </a>
              </Button>
            </div>

            {/* Confirmation input */}
            <div className="space-y-2">
              <label htmlFor="confirm-delete-club" className="text-sm font-medium">
                {t.confirmHint.replace('{clubName}', clubName)}
              </label>
              <Input
                id="confirm-delete-club"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
              />
            </div>

            {/* Acknowledge checkbox */}
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-destructive"
              />
              <span className="text-sm font-medium">{t.acknowledge}</span>
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t.cancel}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || !canDelete}
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
