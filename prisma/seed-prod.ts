/**
 * Production seed — creates the initial OPERATOR account.
 *
 * Reads credentials from environment variables (set in .env.production):
 *   OPERATOR_EMAIL            — the operator's email address
 *   OPERATOR_NAME             — display name (e.g. "Bastien Faivre")
 *   OPERATOR_INITIAL_PASSWORD — initial login password
 *
 * Usage (inside the migrate container or locally):
 *   npx tsx prisma/seed-prod.ts
 */
import { PrismaClient } from '../src/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import argon2 from 'argon2'
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
const OPERATOR_INITIAL_PASSWORD = requiredEnv('OPERATOR_INITIAL_PASSWORD')

const [firstName, ...rest] = OPERATOR_NAME.split(' ')
const lastName = rest.join(' ') || firstName

const pool = new Pool({ connectionString: DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await argon2.hash(OPERATOR_INITIAL_PASSWORD)

  const operator = await prisma.user.upsert({
    where: { email: OPERATOR_EMAIL },
    update: { passwordHash },
    create: {
      email: OPERATOR_EMAIL,
      name: OPERATOR_NAME,
      firstName,
      lastName,
      preferredLanguage: 'en',
      role: 'OPERATOR',
      passwordHash,
      totpEnabled: false,
    },
  })

  console.log(`Operator account ready: ${operator.email} (${operator.id})`)
  console.log('Log in with your initial password, then change it and enable 2FA.')
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
