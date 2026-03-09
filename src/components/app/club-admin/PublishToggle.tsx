'use client'

import { useTransition, useOptimistic } from 'react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { togglePublish } from '@/app/[lang]/(dashboard)/club/[clubId]/actions'

interface VisibilityToggleTranslations {
  title: string
  online: string
  offline: string
  onlineSuccess: string
  offlineSuccess: string
  forceOfflineWarning: string
  minPhotosRequired: string
  error: string
}

const MIN_PHOTOS = 5

interface VisibilityToggleProps {
  isPublished: boolean
  forceOffline: boolean
  clubId: string
  photoCount: number
  translations: VisibilityToggleTranslations
}

export function VisibilityToggle({
  isPublished,
  forceOffline,
  clubId,
  photoCount,
  translations: t,
}: VisibilityToggleProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticPublished, setOptimisticPublished] = useOptimistic(isPublished)

  const needsMorePhotos = !optimisticPublished && photoCount < MIN_PHOTOS
  const disabled = forceOffline || isPending || needsMorePhotos

  function handleToggle() {
    startTransition(async () => {
      setOptimisticPublished(!optimisticPublished)
      const result = await togglePublish(clubId)
      if (result.success) {
        toast(result.data.isPublished ? t.onlineSuccess : t.offlineSuccess)
      } else {
        toast.error(t.error, { description: result.error })
      }
    })
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{t.title}</p>
        {forceOffline ? (
          <p className="text-sm text-destructive">{t.forceOfflineWarning}</p>
        ) : needsMorePhotos ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {t.minPhotosRequired.replace('{min}', String(MIN_PHOTOS)).replace('{count}', String(photoCount))}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {optimisticPublished ? t.online : t.offline}
          </p>
        )}
      </div>
      <Switch
        checked={optimisticPublished}
        onCheckedChange={handleToggle}
        disabled={disabled}
        aria-label={t.title}
        className={optimisticPublished
          ? 'data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-500'
          : 'data-[state=unchecked]:bg-red-400 dark:data-[state=unchecked]:bg-red-500'
        }
      />
    </div>
  )
}
