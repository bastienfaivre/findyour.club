'use client'

import { useState } from 'react'
import { Children } from 'react'
import { Button } from '@/components/ui/button'

interface PaginatedGridProps {
  children: React.ReactNode
  pageSize?: number
  showingLabel: string
  showMoreLabel: string
}

export function PaginatedGrid({ children, pageSize = 20, showingLabel, showMoreLabel }: PaginatedGridProps) {
  const [visible, setVisible] = useState(pageSize)
  const all = Children.toArray(children)
  const shown = all.slice(0, visible)
  const hasMore = all.length > visible

  return (
    <>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shown}
      </div>
      {all.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          {hasMore && (
            <Button variant="outline" size="lg" className="w-full max-w-xs" onClick={() => setVisible((v) => v + pageSize)}>
              {showMoreLabel}
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            {showingLabel.replace('{shown}', String(shown.length)).replace('{total}', String(all.length))}
          </p>
        </div>
      )}
    </>
  )
}
