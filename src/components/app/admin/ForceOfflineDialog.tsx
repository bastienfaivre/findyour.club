'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toggleForceOffline } from '@/app/[lang]/(dashboard)/admin/clubs/[id]/actions'
import type { Translations } from '@/lib/i18n/translations/types'

interface ForceOfflineDialogProps {
  clubId: string
  clubName: string
  clubs: Translations['admin']['clubs']
  common: Translations['common']
}

export function ForceOfflineDialog({ clubId, clubName, clubs, common }: ForceOfflineDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    const trimmed = reason.trim()
    if (!trimmed) return

    startTransition(async () => {
      const result = await toggleForceOffline(clubId, trimmed)
      if (result.success) {
        toast.success(clubs.clubForcedOffline)
        setReason('')
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">{clubs.forceOffline}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{clubs.forceOffline} — {clubName}</AlertDialogTitle>
          <AlertDialogDescription>{clubs.reasonRequired}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={clubs.reasonPlaceholder}
            maxLength={1000}
            rows={5}
          />
          <p className="text-xs text-muted-foreground text-right">{reason.length}/1000</p>
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>{common.cancel}</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending || !reason.trim()}>
            {isPending ? common.loading : common.confirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
