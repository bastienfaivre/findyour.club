'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

type DirectoryFiltersProps = {
  cantons: { code: string; name: string }[]
  activityTypes: { slug: string; name: string }[]
  lang: string
  country: string
  labels: {
    filterCanton: string
    filterActivity: string
    allCantons: string
    allActivities: string
    resetFilters: string
  }
}

const ALL = '__all__'

export function DirectoryFilters({
  cantons,
  activityTypes,
  lang,
  country,
  labels,
}: DirectoryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentCanton = searchParams.get('canton') ?? ''
  const currentActivity = searchParams.get('activity') ?? ''
  const hasFilters = currentCanton || currentActivity

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== ALL) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const qs = params.toString()
    startTransition(() => {
      router.push(`/${lang}/${country}${qs ? `?${qs}` : ''}`)
    })
  }

  function resetFilters() {
    startTransition(() => {
      router.push(`/${lang}/${country}`)
    })
  }

  const activeCantonName = cantons.find((c) => c.code === currentCanton)?.name
  const activeActivityName = activityTypes.find((a) => a.slug === currentActivity)?.name

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={currentCanton || ALL}
          onValueChange={(v) => updateParams('canton', v)}
        >
          <SelectTrigger aria-label={labels.filterCanton}>
            <SelectValue placeholder={labels.allCantons} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{labels.allCantons}</SelectItem>
            {cantons.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentActivity || ALL}
          onValueChange={(v) => updateParams('activity', v)}
        >
          <SelectTrigger aria-label={labels.filterActivity}>
            <SelectValue placeholder={labels.allActivities} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{labels.allActivities}</SelectItem>
            {activityTypes.map((a) => (
              <SelectItem key={a.slug} value={a.slug}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeCantonName && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              role="button"
              tabIndex={0}
              onClick={() => updateParams('canton', ALL)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  updateParams('canton', ALL)
                }
              }}
            >
              {activeCantonName}
              <X className="size-3" />
            </Badge>
          )}
          {activeActivityName && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              role="button"
              tabIndex={0}
              onClick={() => updateParams('activity', ALL)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  updateParams('activity', ALL)
                }
              }}
            >
              {activeActivityName}
              <X className="size-3" />
            </Badge>
          )}
          <a
            href={`/${lang}/${country}`}
            onClick={(e) => {
              e.preventDefault()
              resetFilters()
            }}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {labels.resetFilters}
          </a>
        </div>
      )}

      {isPending && (
        <div className="h-1 w-full overflow-hidden rounded bg-muted">
          <div className="h-full w-1/3 animate-pulse bg-primary/50 rounded" />
        </div>
      )}
    </div>
  )
}
