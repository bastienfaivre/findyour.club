/**
 * Hardcoded activity type slugs.
 *
 * Activity types are defined in code because their translations require a deploy anyway.
 * The philosophy is to add a new type only when an actual club of that type registers.
 *
 * To add a new type:
 * 1. Add the slug here
 * 2. Add translations in all language files (en, fr, de, it)
 * 3. Add a fallback icon in ActivityTypeIcon.tsx
 * 4. Deploy
 */
export const ACTIVITY_TYPES = ['nature', 'volleyball', 'tennis-de-table'] as const

export type ActivityTypeSlug = (typeof ACTIVITY_TYPES)[number]

export function isValidActivityType(slug: string): slug is ActivityTypeSlug {
  return (ACTIVITY_TYPES as readonly string[]).includes(slug)
}
