import { Leaf, Users } from 'lucide-react'
import { VolleyballIcon } from '@/components/icons/VolleyballIcon'
import { isValidActivityType, type ActivityTypeSlug } from '@/lib/activity-types'

const ICONS: Record<ActivityTypeSlug, React.FC<{ className?: string; strokeWidth?: number }>> = {
  volleyball: VolleyballIcon,
  nature: Leaf,
}

const DEFAULT_ICON = Users

export function ActivityTypeIcon({ slug, className }: { slug: string | null | undefined; className?: string }) {
  const Icon = slug && isValidActivityType(slug) ? ICONS[slug] : DEFAULT_ICON
  return <Icon className={className} strokeWidth={1.5} style={{ opacity: 0.2 }} />
}
