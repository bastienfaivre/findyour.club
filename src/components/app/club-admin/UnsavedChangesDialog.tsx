'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface LeaveDialogTranslations {
  leaveConfirmTitle: string
  leaveConfirmDescription: string
  stay: string
  leave: string
}

export interface DiscardDialogTranslations {
  discardConfirmTitle: string
  discardConfirmDescription: string
  keepEditing: string
  discard: string
}

type UnsavedChangesDialogProps = {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
} & (
  | { variant: 'leave'; translations: LeaveDialogTranslations }
  | { variant: 'discard'; translations: DiscardDialogTranslations }
)

export function UnsavedChangesDialog(props: UnsavedChangesDialogProps) {
  const { open, onConfirm, onCancel } = props

  let title: string, description: string, cancelLabel: string, confirmLabel: string
  if (props.variant === 'leave') {
    title = props.translations.leaveConfirmTitle
    description = props.translations.leaveConfirmDescription
    cancelLabel = props.translations.stay
    confirmLabel = props.translations.leave
  } else {
    title = props.translations.discardConfirmTitle
    description = props.translations.discardConfirmDescription
    cancelLabel = props.translations.keepEditing
    confirmLabel = props.translations.discard
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
