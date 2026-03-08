'use client'

import { useTransition, useOptimistic } from 'react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { togglePublish } from '@/app/[lang]/(country)/[country]/[club]/admin/actions'

interface PublishToggleTranslations {
  title: string
  published: string
  unpublished: string
  publishSuccess: string
  unpublishSuccess: string
  forceOfflineWarning: string
  error: string
}

interface PublishToggleProps {
  isPublished: boolean
  forceOffline: boolean
  lang: string
  country: string
  slug: string
  translations: PublishToggleTranslations
}

export function PublishToggle({
  isPublished,
  forceOffline,
  lang,
  country,
  slug,
  translations: t,
}: PublishToggleProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticPublished, setOptimisticPublished] = useOptimistic(isPublished)

  const disabled = forceOffline || isPending

  function handleToggle() {
    startTransition(async () => {
      setOptimisticPublished(!optimisticPublished)
      const result = await togglePublish(lang, country, slug)
      if (result.success) {
        toast(result.data.isPublished ? t.publishSuccess : t.unpublishSuccess)
      } else {
        toast(t.error, { description: result.error })
      }
    })
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{t.title}</p>
        {forceOffline ? (
          <p className="text-sm text-destructive">{t.forceOfflineWarning}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {optimisticPublished ? t.published : t.unpublished}
          </p>
        )}
      </div>
      <Switch
        checked={optimisticPublished}
        onCheckedChange={handleToggle}
        disabled={disabled}
        aria-label={t.title}
      />
    </div>
  )
}
