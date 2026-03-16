'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'

interface SaveBarTranslations {
  save: string
  discard: string
  discardConfirmTitle: string
  discardConfirmDescription: string
  keepEditing: string
  confirmUpToDate?: string
}

interface SaveBarProps {
  isDirty: boolean
  isPending: boolean
  isValid: boolean
  isConfirming?: boolean
  translations: SaveBarTranslations
  onDiscard: () => void
  onConfirmUpToDate?: () => void
}

export function SaveBar({ isDirty, isPending, isValid, isConfirming, translations: t, onDiscard, onConfirmUpToDate }: SaveBarProps) {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)

  return (
    <>
      <div className="sticky bottom-0 z-30 flex items-center justify-end gap-3 border-t border-border bg-background px-4 py-3">
        {isDirty ? (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setShowDiscardDialog(true)}
            >
              {t.discard}
            </Button>
            <Button type="submit" disabled={isPending || !isValid}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="relative flex items-center gap-2">
                  {t.save}
                  <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                </span>
              )}
            </Button>
          </>
        ) : onConfirmUpToDate && t.confirmUpToDate ? (
          <Button
            type="button"
            disabled={isConfirming}
            onClick={onConfirmUpToDate}
            className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            {isConfirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {t.confirmUpToDate}
              </>
            )}
          </Button>
        ) : (
          <Button type="submit" disabled>
            {t.save}
          </Button>
        )}
      </div>

      <UnsavedChangesDialog
        open={showDiscardDialog}
        variant="discard"
        translations={{
          discardConfirmTitle: t.discardConfirmTitle,
          discardConfirmDescription: t.discardConfirmDescription,
          keepEditing: t.keepEditing,
          discard: t.discard,
        }}
        onConfirm={() => {
          setShowDiscardDialog(false)
          onDiscard()
        }}
        onCancel={() => setShowDiscardDialog(false)}
      />
    </>
  )
}
