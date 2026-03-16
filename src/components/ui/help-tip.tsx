'use client'

import { CircleHelp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface HelpTipProps {
  content: string
  className?: string
}

export function HelpTip({ content, className }: HelpTipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger type="button" className={className} tabIndex={-1}>
          <CircleHelp className="size-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
          <span className="sr-only">Help</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
