// CRITICAL: This is the ONLY place PrismaClient is instantiated.
// All other files import { prisma } from '@/server/db'. Never create a new PrismaClient() elsewhere.
//
// Prisma v7 requires a driver adapter for direct database connections.
// The datasource URL is configured in prisma.config.ts; the adapter reads DATABASE_URL at runtime.
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

// Models that require clubId on every read/update/delete query (club-scoped)
const CLUB_SCOPED_READ_MODELS = new Set([
  'page',
  'pageElement',
  'contentVersion',
  'event',
  'galleryItem',
  'document',
  'pageEvent',
  'contactSubmission',
  'clubPhoto',
  'operatorMessage',
  'supportTicket',
  'healthCheck',
])

/**
 * Check if a Prisma `where` argument contains a clubId filter.
 * Handles both direct `{ clubId }` and composite unique key forms
 * such as `{ clubId_slug: { clubId, slug } }`.
 */
function hasClubIdFilter(where: Record<string, unknown>): boolean {
  if (where.clubId) return true
  // Check one level deep for composite unique key objects (e.g., clubId_slug, clubId_pageId)
  for (const value of Object.values(where)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      if ('clubId' in (value as Record<string, unknown>) && (value as Record<string, unknown>).clubId) {
        return true
      }
    }
  }
  return false
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL environment variable is not set')
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // Enforce clubId on all read/update/delete operations on club-scoped models
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const readOps = ['findFirst', 'findFirstOrThrow', 'findUnique', 'findUniqueOrThrow', 'findMany', 'count', 'aggregate', 'groupBy']
          const mutationOps = ['update', 'updateMany', 'delete', 'deleteMany', 'upsert']

          if (
            model &&
            CLUB_SCOPED_READ_MODELS.has(
              model.charAt(0).toLowerCase() + model.slice(1)
            ) &&
            (readOps.includes(operation) || mutationOps.includes(operation))
          ) {
            const where = (args as { where?: Record<string, unknown> }).where
            if (!where || !hasClubIdFilter(where)) {
              throw new Error(
                `Multi-tenant violation: ${model}.${operation} missing required clubId filter. ` +
                `Always include clubId from URL params (verified by the club layout membership check) in your Prisma where clause.`
              )
            }
          }

          return query(args)
        },
      },
    },
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
