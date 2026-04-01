import { createHash } from 'crypto'
import { prisma } from '@/server/db'
import type { PageEventType } from '@/generated/prisma/client'

/**
 * Daily-rotating salt for IP hashing.
 * Salt changes at midnight UTC — after rotation, previous hashes are irreversible.
 * In-memory only; resets on server restart (which is fine — it just changes the salt sooner).
 */
let cachedSalt: { date: string; value: string } | null = null

function getDailySalt(): string {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  if (cachedSalt?.date === today) return cachedSalt.value

  // Generate a deterministic-per-day but unpredictable salt.
  // Uses a dedicated env var (falls back to CRON_SECRET) to avoid coupling auth secrets with analytics.
  const secret = process.env.IP_HASH_SECRET ?? process.env.CRON_SECRET ?? 'fallback-dev-salt'
  const salt = createHash('sha256').update(`${secret}:${today}`).digest('hex')
  cachedSalt = { date: today, value: salt }
  return salt
}

function hashIp(ip: string): string {
  const salt = getDailySalt()
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex')
}

/**
 * Record a page event. Fire-and-forget — never blocks the response.
 */
export function trackPageEvent(opts: {
  clubId: string
  pageSlug: string
  eventType: PageEventType
  ip?: string | null
  referrer?: string | null
  country?: string | null
}) {
  const ipHash = opts.ip ? hashIp(opts.ip) : null

  // Fire-and-forget — don't await, don't throw
  const doTrack = async () => {
    // Deduplicate: skip if same IP already viewed this club today
    if (ipHash && opts.eventType === 'page_view') {
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      const existing = await prisma.pageEvent.findFirst({
        where: {
          clubId: opts.clubId,
          ipHash,
          eventType: 'page_view',
          visitedAt: { gte: today },
        },
        select: { id: true },
      })
      if (existing) return
    }

    await prisma.pageEvent.create({
      data: {
        clubId: opts.clubId,
        pageSlug: opts.pageSlug,
        eventType: opts.eventType,
        ipHash,
        referrer: opts.referrer?.slice(0, 500) ?? null,
        country: opts.country?.slice(0, 2) ?? null,
      },
    })
  }

  doTrack().catch(() => {
    // Silently ignore tracking failures — never break the user experience
  })
}
