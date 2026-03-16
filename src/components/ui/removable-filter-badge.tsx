import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface RemovableFilterBadgeProps {
  children: React.ReactNode
  onRemove: () => void
  removeLabel?: string
}

export function RemovableFilterBadge({ children, onRemove, removeLabel }: RemovableFilterBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="cursor-pointer gap-1"
      role="button"
      tabIndex={0}
      aria-label={removeLabel ?? `Remove filter: ${typeof children === 'string' ? children : ''}`}
      onClick={onRemove}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onRemove()
        }
      }}
    >
      {children}
      <X className="size-3" aria-hidden="true" />
    </Badge>
  )
}
