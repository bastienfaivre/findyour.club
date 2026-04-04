import { Loader2 } from 'lucide-react'
import type { Translations } from '@/lib/i18n/translations/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ApplicationActionsProps {
  isPending: boolean
  canApprove: boolean
  error: string | null
  message: string
  desiredSlug: string
  clubName: string
  approveDialogOpen: boolean
  rejectDialogOpen: boolean
  translations: Translations
  onMessageChange: (value: string) => void
  onSlugChange: (value: string) => void
  onSave: () => void
  onApprove: () => void
  onReject: () => void
  onApproveDialogOpenChange: (open: boolean) => void
  onRejectDialogOpenChange: (open: boolean) => void
}

export function ApplicationActions({
  isPending,
  canApprove,
  error,
  message,
  desiredSlug,
  clubName,
  approveDialogOpen,
  rejectDialogOpen,
  translations: t,
  onMessageChange,
  onSlugChange,
  onSave,
  onApprove,
  onReject,
  onApproveDialogOpenChange,
  onRejectDialogOpenChange,
}: ApplicationActionsProps) {
  const ta = t.admin.applications

  return (
    <>
      {/* URL Slug — operator-defined */}
      <div className="rounded-xl border p-4 space-y-2">
        <Label htmlFor="app-slug">{ta.desiredSlug} <span className="text-destructive">*</span></Label>
        <p className="text-sm text-muted-foreground">{ta.desiredSlugHint}</p>
        <Input id="app-slug" value={desiredSlug} onChange={(e) => onSlugChange(e.target.value)} maxLength={60} disabled={isPending} />
      </div>

      <div className="rounded-xl border p-4 space-y-2">
        <Label htmlFor="app-message">{ta.operatorMessage.label}</Label>
        <Textarea
          id="app-message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={ta.operatorMessage.placeholder}
          maxLength={1000}
          rows={3}
          disabled={isPending}
        />
      </div>

      {/* Action buttons */}
      <div className="rounded-xl border p-4 flex gap-3">
        <Button variant="outline" onClick={onSave} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {ta.saveChanges}
        </Button>
        <Button onClick={() => onApproveDialogOpenChange(true)} disabled={isPending || !canApprove}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {ta.approve}
        </Button>
        <Button variant="destructive" onClick={() => onRejectDialogOpenChange(true)} disabled={isPending}>
          {ta.reject}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Approve confirmation */}
      <Dialog open={approveDialogOpen} onOpenChange={onApproveDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ta.approve}</DialogTitle>
            <DialogDescription>{ta.approveConfirm.replace('{name}', clubName)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onApproveDialogOpenChange(false)}>{ta.keepReviewing}</Button>
            <Button onClick={onApprove}>{ta.confirmApprove}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject confirmation */}
      <Dialog open={rejectDialogOpen} onOpenChange={onRejectDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ta.rejectTitle}</DialogTitle>
            <DialogDescription>{ta.rejectDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onRejectDialogOpenChange(false)}>{ta.keepReviewing}</Button>
            <Button variant="destructive" onClick={onReject}>{ta.confirmReject}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
