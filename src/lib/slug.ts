/**
 * Slug utilities for club URL slugs.
 *
 * Reserved slugs are path segments that conflict with platform routes
 * and must never be assigned to a club.
 */

export const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'auth',
  'apply',
  'login',
  'logout',
  'register',
  'signup',
  'account',
  'settings',
  'profile',
  'dashboard',
  'my-clubs',
  'clubs',
  'help',
  'support',
  'about',
  'terms',
  'privacy',
  'status',
  'health',
])

/**
 * Convert a human-readable name into a URL-safe slug.
 * e.g. "Ski Club Valais" → "ski-club-valais"
 */
export function generateSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
}

/**
 * Returns true if the given slug is reserved and must not be used for a club.
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase())
}
