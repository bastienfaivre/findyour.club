'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
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
import { Button } from '@/components/ui/button'
import { liftForceOffline } from '@/app/[lang]/(dashboard)/admin/clubs/[id]/actions'
import type { Translations } from '@/lib/i18n/translations/types'

interface LiftOfflineButtonProps {
  clubId: string
  clubName: string
  clubs: Translations['admin']['clubs']
  common: Translations['common']
}

export function LiftOfflineButton({ clubId, clubName, clubs, common }: LiftOfflineButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      const result = await liftForceOffline(clubId)
      if (result.success) {
        toast.success(clubs.offlineLifted)
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">{clubs.liftOffline}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{clubs.liftOffline} — {clubName}</AlertDialogTitle>
          <AlertDialogDescription>
            {clubs.liftOfflineDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{common.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending ? common.loading : common.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
