'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { sendOperatorMessage } from '@/app/[lang]/admin/(protected)/clubs/[id]/actions'
import type { Translations } from '@/lib/i18n/translations/types'

interface SendMessageDialogProps {
  clubId: string
  clubName: string
  clubs: Translations['admin']['clubs']
  common: Translations['common']
}

export function SendMessageDialog({ clubId, clubName, clubs, common }: SendMessageDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    const trimmed = message.trim()
    if (!trimmed) return

    startTransition(async () => {
      const result = await sendOperatorMessage(clubId, trimmed)
      if (result.success) {
        toast.success(clubs.messageSent)
        setMessage('')
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">{clubs.sendMessage}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{clubs.sendMessage} — {clubName}</DialogTitle>
          <DialogDescription>
            {clubs.sendMessageDescription.replace('{clubName}', clubName)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={clubs.messagePlaceholder}
            maxLength={1000}
            rows={5}
          />
          <p className="text-xs text-muted-foreground text-right">{message.length}/1000</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>{common.cancel}</Button>
          <Button onClick={handleSubmit} disabled={isPending || !message.trim()}>
            {isPending ? common.loading : common.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
