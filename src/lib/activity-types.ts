import { Leaf, Users, type LucideIcon } from 'lucide-react'
import { VolleyballIcon } from '@/components/icons/VolleyballIcon'

/**
 * Hardcoded activity type slugs.
 *
 * Activity types are defined in code because their translations require a deploy anyway.
 * The philosophy is to add a new type only when an actual club of that type registers.
 *
 * To add a new type:
 * 1. Add the slug here
 * 2. Add translations in all language files (en, fr, de, it)
 * 3. Add a fallback icon in ACTIVITY_TYPE_ICONS
 * 4. Deploy
 */
export const ACTIVITY_TYPES = ['nature', 'volleyball'] as const

export type ActivityTypeSlug = (typeof ACTIVITY_TYPES)[number]

export function isValidActivityType(slug: string): slug is ActivityTypeSlug {
  return (ACTIVITY_TYPES as readonly string[]).includes(slug)
}

type IconComponent = LucideIcon | typeof VolleyballIcon

/** Icon used as logo fallback for each activity type. */
const ACTIVITY_TYPE_ICONS: Record<ActivityTypeSlug, IconComponent> = {
  volleyball: VolleyballIcon,
  nature: Leaf,
}

const DEFAULT_ICON: IconComponent = Users

export function getActivityTypeIcon(slug: string | null | undefined): IconComponent {
  if (slug && isValidActivityType(slug)) return ACTIVITY_TYPE_ICONS[slug]
  return DEFAULT_ICON
}
