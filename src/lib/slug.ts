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

interface SlugCheckClient {
  club: {
    findUnique: (args: { where: { slug_country: { slug: string; country: string } }; select: { id: true } }) => Promise<{ id: string } | null>
  }
  application: {
    findFirst: (args: { where: { desiredSlug: string; country: string; status: string }; select: { id: true } }) => Promise<{ id: string } | null>
  }
}

const MAX_SLUG_SUFFIX = 100

/**
 * Generate a unique slug for a club within a country.
 * If the base slug is taken, appends -2, -3, etc. until unique.
 * Uses a Prisma transaction client to check within the same transaction.
 */
export async function generateUniqueSlug(
  baseName: string,
  country: string,
  tx: SlugCheckClient,
): Promise<string> {
  const base = generateSlug(baseName)
  let candidate = base
  let suffix = 2

  while (suffix <= MAX_SLUG_SUFFIX + 1) {
    if (!isReservedSlug(candidate)) {
      const [clubConflict, appConflict] = await Promise.all([
        tx.club.findUnique({
          where: { slug_country: { slug: candidate, country } },
          select: { id: true },
        }),
        tx.application.findFirst({
          where: { desiredSlug: candidate, country, status: 'APPROVED' },
          select: { id: true },
        }),
      ])

      if (!clubConflict && !appConflict) {
        return candidate
      }
    }

    candidate = `${base}-${suffix}`
    suffix++
  }

  throw new Error(`Could not generate unique slug after ${MAX_SLUG_SUFFIX} attempts for base "${base}"`)
}
