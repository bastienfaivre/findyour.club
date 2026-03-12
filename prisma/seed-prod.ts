/**
 * Production seed — creates the initial OPERATOR account.
 *
 * Reads credentials from environment variables (set in .env.production):
 *   OPERATOR_EMAIL    — the operator's email address
 *   OPERATOR_NAME     — display name (e.g. "Bastien Faivre")
 *
 * The account is created WITHOUT a password so the operator must use the
 * magic-link flow to log in and set up their password + 2FA on first access.
 *
 * Usage (inside the migrate container or locally):
 *   npx tsx prisma/seed-prod.ts
 */
import { PrismaClient } from '../src/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const requiredEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing required environment variable: ${name}`)
    process.exit(1)
  }
  return value
}

const DATABASE_URL = requiredEnv('DATABASE_URL')
const OPERATOR_EMAIL = requiredEnv('OPERATOR_EMAIL')
const OPERATOR_NAME = requiredEnv('OPERATOR_NAME')

const [firstName, ...rest] = OPERATOR_NAME.split(' ')
const lastName = rest.join(' ') || firstName

const pool = new Pool({ connectionString: DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const operator = await prisma.user.upsert({
    where: { email: OPERATOR_EMAIL },
    update: {},
    create: {
      email: OPERATOR_EMAIL,
      name: OPERATOR_NAME,
      firstName,
      lastName,
      preferredLanguage: 'en',
      role: 'OPERATOR',
      passwordHash: null,
      totpEnabled: false,
    },
  })

  console.log(`Operator account ready: ${operator.email} (${operator.id})`)
  console.log('Log in via magic link to set up your password.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
