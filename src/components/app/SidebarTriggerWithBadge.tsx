'use client'

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'

interface SidebarTriggerWithBadgeProps {
  hasBadges: boolean
  className?: string
}

export function SidebarTriggerWithBadge({ hasBadges, className }: SidebarTriggerWithBadgeProps) {
  const { open } = useSidebar()

  return (
    <div className="relative">
      <SidebarTrigger className={className} />
      {hasBadges && !open && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse pointer-events-none" aria-hidden="true" />
      )}
    </div>
  )
}
