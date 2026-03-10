'use client'

import { Info, ShieldCheck } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

type VerifiedBadgeProps = {
  label: string
  detail: string
}

export function VerifiedBadge({ label, detail }: VerifiedBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <ShieldCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
      <span>{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-full"
            aria-label="More info"
          >
            <Info className="size-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="max-w-xs text-sm">
          {detail}
        </PopoverContent>
      </Popover>
    </div>
  )
}
