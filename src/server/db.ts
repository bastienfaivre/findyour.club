// CRITICAL: This is the ONLY place PrismaClient is instantiated.
// All other files import { prisma } from '@/server/db'. Never create a new PrismaClient() elsewhere.
//
// Prisma v7 requires a driver adapter for direct database connections.
// The datasource URL is configured in prisma.config.ts; the adapter reads DATABASE_URL at runtime.
// Note: Prisma middleware for clubId enforcement will be added in Story 1.2 when models are defined.
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL environment variable is not set')
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
