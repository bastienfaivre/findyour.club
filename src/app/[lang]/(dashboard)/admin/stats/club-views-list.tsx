'use client'

import { useState, useTransition } from 'react'
import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { loadClubViews, type ClubViewEntry } from './actions'

interface ClubViewsListProps {
  initialEntries: ClubViewEntry[]
  initialTotal: number
  days: number
  translations: {
    views: string
    noData: string
    showMore: string
    showingCount: string
  }
}

const PAGE_SIZE = 20

export function ClubViewsList({ initialEntries, initialTotal, days, translations: t }: ClubViewsListProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [total] = useState(initialTotal)
  const [isPending, startTransition] = useTransition()

  const hasMore = entries.length < total

  function handleLoadMore() {
    startTransition(async () => {
      const result = await loadClubViews(entries.length, PAGE_SIZE, days)
      setEntries((prev) => [...prev, ...result.entries])
    })
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-muted-foreground">
        <BarChart3 className="size-8 mb-2 opacity-50" />
        <p className="text-sm">{t.noData}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="divide-y rounded-lg border">
        {entries.map((entry, i) => (
          <div key={entry.clubId} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{entry.name}</p>
                <p className="text-xs text-muted-foreground">{entry.country}/{entry.slug}</p>
              </div>
            </div>
            <span className="text-sm font-medium tabular-nums shrink-0">
              {t.views.replace('{count}', String(entry.views))}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2 pt-2">
        {hasMore && (
          <Button variant="outline" className="w-full" onClick={handleLoadMore} disabled={isPending}>
            {t.showMore}
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          {t.showingCount.replace('{shown}', String(entries.length)).replace('{total}', String(total))}
        </p>
      </div>
    </div>
  )
}
