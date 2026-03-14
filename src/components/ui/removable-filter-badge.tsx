import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface RemovableFilterBadgeProps {
  children: React.ReactNode
  onRemove: () => void
}

export function RemovableFilterBadge({ children, onRemove }: RemovableFilterBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="cursor-pointer gap-1"
      role="button"
      tabIndex={0}
      onClick={onRemove}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onRemove()
        }
      }}
    >
      {children}
      <X className="size-3" />
    </Badge>
  )
}
