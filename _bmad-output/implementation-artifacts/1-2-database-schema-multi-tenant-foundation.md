# Story 1.2: Database Schema & Multi-Tenant Foundation

Status: done

## Story

As a developer,
I want the complete Prisma schema with all core models, multi-tenant middleware, and a development seed,
so that all subsequent features can be built on a secure, isolated data foundation.

## Acceptance Criteria

1. **Given** `pnpm prisma migrate dev` is run on a fresh database, **When** migrations complete, **Then** all tables exist with correct snake_case column names via `@map`/`@@map` directives: `clubs`, `pages`, `page_elements`, `content_versions`, `users`, `sessions`, `page_events`, plus Auth.js adapter tables (`accounts`, `sessions`, `verification_tokens`).

2. **Given** the Prisma client singleton in `src/server/db.ts`, **When** any club-scoped Prisma query executes without a `clubId` filter, **Then** the Prisma middleware throws an error — the query does not reach the database.

3. **Given** any club-scoped Prisma query in the codebase, **Then** it always filters by both `id` and `clubId` in a single atomic `where` clause — never a sequential fetch-then-check.

4. **Given** `pnpm prisma db seed` is run, **When** the seed completes, **Then** the database contains: 1 operator account (Argon2-hashed), 2 sample clubs with all element types populated, 3 content versions per page, 3 applications (pending/approved/rejected), 5 encrypted contact submissions, and 90 days of analytics events.

5. **Given** the `clubs` table schema, **Then** it includes `storage_limit_bytes` and `storage_used_bytes` columns for per-club storage accounting.

## Tasks / Subtasks

- [x] **Task 1: Define complete Prisma schema** (AC: 1, 5)
  - [x] Add all enums: `UserRole`, `ApplicationStatus`, `ClubStatus`, `ElementType`, `PageEventType`
  - [x] Add Auth.js v4 adapter models: `Account`, `Session`, `User` (with platform custom fields), `VerificationToken`
  - [x] Add core platform models: `Club` (with `storage_limit_bytes`, `storage_used_bytes`), `Application`, `Page`, `PageElement`, `ContentVersion`
  - [x] Add relational content models: `Event` (calendar), `GalleryItem`, `Document`
  - [x] Add analytics & contact models: `PageEvent`, `ContactSubmission` (encrypted fields)
  - [x] Add platform operations models: `AuditLog`, `OperatorNudge`, `SupportTicket`, `TicketReply`, `HealthCheck`, `MigrationLog`, `FeatureFlag`
  - [x] Add auth extension model: `WebauthnCredential`
  - [x] Verify ALL Prisma model fields use `@map("snake_case")` and all models use `@@map("snake_case_plural")`

- [x] **Task 2: Add Prisma clubId enforcement middleware to `src/server/db.ts`** (AC: 2)
  - [x] Define `CLUB_SCOPED_MODELS` Set with all models that require `clubId`
  - [x] Add Prisma query middleware (or `$extends` query extension in v7) that throws on missing `clubId`
  - [x] Verify middleware allows `create` operations (which provide `clubId` in `data`, not `where`)
  - [x] Verify middleware allows `createMany` (seed uses this)
  - [x] Test middleware: query without `clubId` throws; query with `clubId` passes

- [x] **Task 3: Create `src/lib/crypto.ts` — AES-256-GCM helpers** (AC: 4)
  - [x] Implement `encrypt(plaintext: string): { ciphertext: string; iv: string }`
  - [x] Implement `decrypt(ciphertext: string, iv: string): string`
  - [x] Use `CONTACT_ENCRYPTION_KEY` env var (must be exactly 32 bytes); throw if missing or wrong length
  - [x] Use Node.js native `crypto` module — no external dependency needed

- [x] **Task 4: Configure seed script** (AC: 4)
  - [x] Add `tsx` to dev dependencies: `pnpm add -D tsx`
  - [x] Add seed configuration to `prisma.config.ts` (Prisma v7 seed config) OR `package.json` prisma field
  - [x] Create `prisma/seed.ts` with all required seed data (see Dev Notes for full spec)
  - [x] Verify `pnpm prisma db seed` runs successfully on a clean database

- [x] **Task 5: Run initial migration** (AC: 1)
  - [x] Run `pnpm prisma migrate dev --name init`
  - [x] Verify all expected tables exist in PostgreSQL
  - [x] Run `pnpm prisma generate` to regenerate typed client
  - [x] Verify `pnpm build` still passes after schema changes

- [x] **Task 6: Verify all acceptance criteria**
  - [x] AC1: Run migration on fresh DB, verify all tables with correct column names
  - [x] AC2: Write a quick test query without `clubId` and confirm middleware throws
  - [x] AC3: Review all seed queries — all club-scoped queries use `where: { id, clubId }` pattern
  - [x] AC4: Run `pnpm prisma db seed` and verify all data created correctly
  - [x] AC5: Verify `clubs` table has `storage_limit_bytes` and `storage_used_bytes` columns

## Dev Notes

### CRITICAL: Prisma v7 Breaking Changes (from Story 1.1)

**These are non-obvious differences from Prisma v5/v6 that WILL cause failures if missed:**

1. **Generator**: `provider = "prisma-client"` (NOT `"prisma-client-js"`) — already set in `prisma/schema.prisma`
2. **Output**: `output = "../src/generated/prisma"` — already set
3. **Import path**: `from '@/generated/prisma/client'` (NOT `from '@prisma/client'`) — already used in `db.ts`
4. **No URL in schema.prisma datasource**: The connection URL is in `prisma.config.ts`, not in `schema.prisma`
5. **Driver adapter**: Uses `PrismaPg` from `@prisma/adapter-pg` with `Pool` from `pg` — already configured in `db.ts`
6. **Query middleware vs `$extends`**: Prisma v7 deprecated `$use()` for query middleware. Use `$extends({ query: { ... } })` instead. See Middleware section below.

**Current `prisma/schema.prisma` state** (only has generator + datasource, no models yet):
```prisma
generator client {
  provider        = "prisma-client"
  output          = "../src/generated/prisma"
  previewFeatures = []
}

datasource db {
  provider = "postgresql"
}
```

### CRITICAL: Prisma v7 Query Extension (replaces $use middleware)

In Prisma v7, use `$extends` for query interception instead of the deprecated `$use`:

```typescript
// src/server/db.ts — UPDATED version with middleware
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

// Models that require clubId on every read query (club-scoped)
const CLUB_SCOPED_READ_MODELS = new Set([
  'page', 'pageElement', 'contentVersion', 'event',
  'galleryItem', 'document', 'pageEvent', 'contactSubmission',
  'operatorNudge', 'supportTicket',
])

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
            if (!where?.clubId) {
              throw new Error(
                `Multi-tenant violation: ${model}.${operation} missing required clubId filter. ` +
                `Always include clubId from the session in your Prisma where clause.`
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
```

> **IMPORTANT**: The `$extends` return type changes the type of `prisma`. The `export const prisma` type becomes the extended client type. All imports of `prisma` from `@/server/db` will automatically use the extended type. No other files need to change.

> **If `$extends` API differs in Prisma v7**: Check the Prisma v7 migration guide. The `$extends` pattern for query interception was stabilized in Prisma v4.16. If the extension API changed in v7, consult [Prisma v7 migration notes](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) before implementing.

### Complete Prisma Schema

Add the following to `prisma/schema.prisma` (after the existing generator and datasource blocks):

```prisma
// ─── ENUMS ──────────────────────────────────────────────────────────────────

enum UserRole {
  CLUB_ADMIN
  OPERATOR
}

enum ApplicationStatus {
  pending
  approved
  rejected
}

enum ClubStatus {
  active
  suspended
}

enum ElementType {
  rich_text
  image
  gallery
  calendar
  documents
  contact
}

enum PageEventType {
  page_view
  contact_form_sent
  apply_form_sent
  login_event
  edit_event
}

// ─── AUTH.JS V4 ADAPTER MODELS ───────────────────────────────────────────────
// Required by @next-auth/prisma-adapter (installed in Story 1.3)
// Reference: https://authjs.dev/reference/adapter/prisma

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime? @map("email_verified")
  image         String?

  // Platform custom fields
  role          UserRole  @default(CLUB_ADMIN)
  clubId        String?   @map("club_id")    // null for OPERATOR role
  passwordHash  String?   @map("password_hash")
  totpSecret    String?   @map("totp_secret")
  totpEnabled   Boolean   @default(false) @map("totp_enabled")
  magicToken    String?   @unique @map("magic_token")    // SHA-256 hash of the token
  magicTokenExp DateTime? @map("magic_token_exp")

  accounts  Account[]
  sessions  Session[]
  club      Club?                 @relation(fields: [clubId], references: [id])
  passkeys  WebauthnCredential[]

  @@map("users")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ─── PLATFORM MODELS ────────────────────────────────────────────────────────

model Club {
  id                String     @id @default(cuid())
  name              String
  slug              String     @unique
  country           String     // "ch" | "fr" | "de"
  status            ClubStatus @default(active)
  email             String
  logoUrl           String?    @map("logo_url")
  logoAlt           String?    @map("logo_alt")
  welcomeText       String?    @map("welcome_text")
  accentColor       String     @default("zinc") @map("accent_color")
  customDomain      String?    @unique @map("custom_domain")
  storageUsedBytes  BigInt     @default(0) @map("storage_used_bytes")
  storageLimitBytes BigInt     @default(5368709120) @map("storage_limit_bytes") // 5 GB default
  templateVersion   String     @default("1.0.0") @map("template_version")
  createdAt         DateTime   @default(now()) @map("created_at")
  updatedAt         DateTime   @updatedAt @map("updated_at")

  admins             User[]
  pages              Page[]
  pageEvents         PageEvent[]
  contactSubmissions ContactSubmission[]
  operatorNudges     OperatorNudge[]

  @@map("clubs")
}

model Application {
  id              String            @id @default(cuid())
  name            String
  activityType    String            @map("activity_type")
  description     String
  email           String
  status          ApplicationStatus @default(pending)
  rejectionReason String?           @map("rejection_reason")
  submittedAt     DateTime          @default(now()) @map("submitted_at")
  reviewedAt      DateTime?         @map("reviewed_at")

  @@map("applications")
}

model Page {
  id        String   @id @default(cuid())
  clubId    String   @map("club_id")
  slug      String
  label     String
  isActive  Boolean  @default(true) @map("is_active")
  isAnchor  Boolean  @default(false) @map("is_anchor")
  parentId  String?  @map("parent_id")
  position  Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  club     Club    @relation(fields: [clubId], references: [id], onDelete: Cascade)
  parent   Page?   @relation("SubPages", fields: [parentId], references: [id])
  subPages Page[]  @relation("SubPages")
  elements PageElement[]
  versions ContentVersion[]

  @@unique([clubId, slug])
  @@map("pages")
}

model PageElement {
  id        String      @id @default(cuid())
  pageId    String      @map("page_id")
  clubId    String      @map("club_id")
  position  Int
  type      ElementType
  data      Json

  page         Page          @relation(fields: [pageId], references: [id], onDelete: Cascade)
  events       Event[]
  galleryItems GalleryItem[]
  documents    Document[]

  @@map("page_elements")
}

model ContentVersion {
  id        String   @id @default(cuid())
  pageId    String   @map("page_id")
  clubId    String   @map("club_id")
  snapshot  Json     // Full page_elements state at save time
  createdAt DateTime @default(now()) @map("created_at")
  createdBy String   @map("created_by")  // userId

  page Page @relation(fields: [pageId], references: [id], onDelete: Cascade)

  @@map("content_versions")
}

// ─── RELATIONAL CONTENT MODELS ───────────────────────────────────────────────

model Event {
  id          String    @id @default(cuid())
  clubId      String    @map("club_id")
  elementId   String    @map("element_id")
  title       String
  date        DateTime
  description String?
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  element PageElement @relation(fields: [elementId], references: [id], onDelete: Cascade)

  @@map("events")
}

model GalleryItem {
  id        String   @id @default(cuid())
  clubId    String   @map("club_id")
  elementId String   @map("element_id")
  url       String
  alt       String
  type      String   // "image" | "video"
  position  Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")

  element PageElement @relation(fields: [elementId], references: [id], onDelete: Cascade)

  @@map("gallery_items")
}

model Document {
  id          String   @id @default(cuid())
  clubId      String   @map("club_id")
  elementId   String   @map("element_id")
  displayName String   @map("display_name")
  fileName    String   @map("file_name")
  fileType    String   @map("file_type")
  fileSize    Int      @map("file_size")
  url         String
  position    Int      @default(0)
  createdAt   DateTime @default(now()) @map("created_at")

  element PageElement @relation(fields: [elementId], references: [id], onDelete: Cascade)

  @@map("documents")
}

// ─── ANALYTICS & COMMUNICATION ──────────────────────────────────────────────

model PageEvent {
  id        String        @id @default(cuid())
  clubId    String        @map("club_id")
  pageSlug  String        @map("page_slug")
  eventType PageEventType @map("event_type")
  country   String?
  referrer  String?
  ipHash    String?       @map("ip_hash")  // SHA-256(IP + daily salt) — never raw IP
  visitedAt DateTime      @default(now()) @map("visited_at")

  @@index([clubId, visitedAt])
  @@index([ipHash])
  @@map("page_events")
}

model ContactSubmission {
  id            String   @id @default(cuid())
  clubId        String   @map("club_id")
  senderName    String   @map("sender_name")
  senderEmail   String   @map("sender_email")
  subject       String
  encryptedBody String   @map("encrypted_body") @db.Text  // AES-256-GCM ciphertext
  iv            String                                     // GCM IV (hex string)
  isRead        Boolean  @default(false) @map("is_read")
  createdAt     DateTime @default(now()) @map("created_at")

  @@map("contact_submissions")
}

// ─── AUTH EXTENSIONS ─────────────────────────────────────────────────────────

model WebauthnCredential {
  id           String   @id @default(cuid())
  userId       String   @map("user_id")
  credentialId String   @unique @map("credential_id")
  publicKey    String   @map("public_key")
  counter      BigInt   @default(0)
  deviceType   String?  @map("device_type")
  backedUp     Boolean  @default(false) @map("backed_up")
  transports   String[]
  createdAt    DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("webauthn_credentials")
}

// ─── PLATFORM OPERATIONS ─────────────────────────────────────────────────────

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String   @map("actor_id")
  action    String   // e.g. "APPROVE_APPLICATION", "SUSPEND_CLUB", "UPDATE_SETTING"
  targetId  String?  @map("target_id")
  oldValue  Json?    @map("old_value")
  newValue  Json?    @map("new_value")
  createdAt DateTime @default(now()) @map("created_at")

  // NOTE: No UPDATE or DELETE operations on audit_log — append-only table
  @@map("audit_logs")
}

model OperatorNudge {
  id          String   @id @default(cuid())
  clubId      String   @map("club_id")
  operatorId  String   @map("operator_id")
  subject     String
  messageBody String   @map("message_body")
  sentAt      DateTime @default(now()) @map("sent_at")

  club Club @relation(fields: [clubId], references: [id], onDelete: Cascade)

  @@map("operator_nudges")
}

model SupportTicket {
  id        String   @id @default(cuid())
  clubId    String   @map("club_id")
  subject   String
  message   String   @db.Text
  status    String   @default("open") // "open" | "closed"
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  replies TicketReply[]

  @@map("support_tickets")
}

model TicketReply {
  id         String   @id @default(cuid())
  ticketId   String   @map("ticket_id")
  operatorId String   @map("operator_id")
  body       String   @db.Text
  sentAt     DateTime @default(now()) @map("sent_at")

  ticket SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@map("ticket_replies")
}

model HealthCheck {
  id             String   @id @default(cuid())
  clubId         String   @map("club_id")
  lighthousePerf Float?   @map("lighthouse_perf")
  lighthouseA11y Float?   @map("lighthouse_a11y")
  lighthouseSEO  Float?   @map("lighthouse_seo")
  uptimePct      Float?   @map("uptime_pct")
  checkedAt      DateTime @default(now()) @map("checked_at")

  @@map("health_checks")
}

model MigrationLog {
  id              String   @id @default(cuid())
  templateVersion String   @map("template_version")
  migratedAt      DateTime @default(now()) @map("migrated_at")
  clubsAffected   Int      @map("clubs_affected")
  migrationType   String   @map("migration_type") // "content-safe" | "structural"

  @@map("migration_logs")
}

model FeatureFlag {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("feature_flags")
}
```

### `src/lib/crypto.ts` — AES-256-GCM Implementation

```typescript
// src/lib/crypto.ts
// AES-256-GCM encryption for contact form submission bodies.
// Uses Node.js native 'crypto' module — no external dependency.
// CONTACT_ENCRYPTION_KEY must be exactly 32 ASCII characters.

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32

function getKey(): Buffer {
  const key = process.env.CONTACT_ENCRYPTION_KEY
  if (!key) {
    throw new Error('CONTACT_ENCRYPTION_KEY environment variable is not set')
  }
  if (Buffer.byteLength(key, 'utf8') !== KEY_LENGTH) {
    throw new Error(
      `CONTACT_ENCRYPTION_KEY must be exactly ${KEY_LENGTH} bytes (got ${Buffer.byteLength(key, 'utf8')})`
    )
  }
  return Buffer.from(key, 'utf8')
}

export function encrypt(plaintext: string): { ciphertext: string; iv: string } {
  const iv = randomBytes(12) // GCM standard: 96-bit IV
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Store authTag appended to ciphertext (last 16 bytes are authTag)
  const combined = Buffer.concat([encrypted, authTag])
  return {
    ciphertext: combined.toString('base64'),
    iv: iv.toString('hex'),
  }
}

export function decrypt(ciphertext: string, iv: string): string {
  const combined = Buffer.from(ciphertext, 'base64')
  const authTag = combined.subarray(combined.length - 16)
  const encrypted = combined.subarray(0, combined.length - 16)
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(iv, 'hex'))
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted) + decipher.final('utf8')
}
```

### Seed File — `prisma/seed.ts`

The seed must use `pnpm prisma db seed`. To run TypeScript seed files with Prisma v7, add `tsx` and configure in `package.json`:

```json
// package.json — add to "prisma" key:
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

Then install: `pnpm add -D tsx`

**Complete seed implementation:**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import argon2 from 'argon2'
import 'dotenv/config'
import { encrypt } from '../src/lib/crypto'

// Seed needs a raw PrismaClient without the clubId middleware
// (seed creates records with explicit clubId in data fields)
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seed...')

  // ─── Operator Account ────────────────────────────────────────────────
  const operatorPasswordHash = await argon2.hash('123456')
  const operator = await prisma.user.upsert({
    where: { email: 'clashware.geology074@aleeas.com' },
    update: {},
    create: {
      email: 'clashware.geology074@aleeas.com',
      name: 'Platform Operator',
      role: 'OPERATOR',
      passwordHash: operatorPasswordHash,
      totpEnabled: false,
    },
  })
  console.log('✓ Operator created:', operator.email)

  // ─── Club Admin Accounts ─────────────────────────────────────────────
  const adminPasswordHash = await argon2.hash('admin123')

  const adminValais = await prisma.user.upsert({
    where: { email: 'admin@ski-club-valais.ch' },
    update: {},
    create: {
      email: 'admin@ski-club-valais.ch',
      name: 'Ski Club Valais Admin',
      role: 'CLUB_ADMIN',
      passwordHash: adminPasswordHash,
      totpEnabled: false,
    },
  })

  const adminLausanne = await prisma.user.upsert({
    where: { email: 'admin@football-club-lausanne.ch' },
    update: {},
    create: {
      email: 'admin@football-club-lausanne.ch',
      name: 'Football Club Lausanne Admin',
      role: 'CLUB_ADMIN',
      passwordHash: adminPasswordHash,
      totpEnabled: false,
    },
  })

  // ─── Clubs ────────────────────────────────────────────────────────────
  const clubValais = await prisma.club.upsert({
    where: { slug: 'ski-club-valais' },
    update: {},
    create: {
      name: 'Ski Club Valais',
      slug: 'ski-club-valais',
      country: 'ch',
      status: 'active',
      email: 'contact@ski-club-valais.ch',
      welcomeText: 'Welcome to Ski Club Valais — your home for alpine skiing in the heart of the Valais region.',
      accentColor: 'blue',
      storageUsedBytes: BigInt(0),
      storageLimitBytes: BigInt(5368709120), // 5 GB
      admins: { connect: { id: adminValais.id } },
    },
  })

  const clubLausanne = await prisma.club.upsert({
    where: { slug: 'football-club-lausanne' },
    update: {},
    create: {
      name: 'Football Club Lausanne',
      slug: 'football-club-lausanne',
      country: 'ch',
      status: 'active',
      email: 'contact@football-club-lausanne.ch',
      welcomeText: 'Welcome to Football Club Lausanne — passion, teamwork, and community on the pitch.',
      accentColor: 'green',
      storageUsedBytes: BigInt(0),
      storageLimitBytes: BigInt(5368709120),
      admins: { connect: { id: adminLausanne.id } },
    },
  })

  // Update users with their clubId
  await prisma.user.update({ where: { id: adminValais.id }, data: { clubId: clubValais.id } })
  await prisma.user.update({ where: { id: adminLausanne.id }, data: { clubId: clubLausanne.id } })

  console.log('✓ Clubs created:', clubValais.slug, clubLausanne.slug)

  // ─── Pages for Ski Club Valais ────────────────────────────────────────
  const homePage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubValais.id, slug: 'home' } },
    update: {},
    create: {
      clubId: clubValais.id,
      slug: 'home',
      label: 'Home',
      isActive: true,
      isAnchor: true,
      position: 0,
    },
  })

  const calendarPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubValais.id, slug: 'events' } },
    update: {},
    create: {
      clubId: clubValais.id,
      slug: 'events',
      label: 'Events',
      isActive: true,
      position: 1,
    },
  })

  const galleryPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubValais.id, slug: 'gallery' } },
    update: {},
    create: {
      clubId: clubValais.id,
      slug: 'gallery',
      label: 'Gallery',
      isActive: true,
      position: 2,
    },
  })

  const docsPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubValais.id, slug: 'documents' } },
    update: {},
    create: {
      clubId: clubValais.id,
      slug: 'documents',
      label: 'Documents',
      isActive: true,
      position: 3,
    },
  })

  const contactPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubValais.id, slug: 'contact' } },
    update: {},
    create: {
      clubId: clubValais.id,
      slug: 'contact',
      label: 'Contact',
      isActive: true,
      isAnchor: true,
      position: 4,
    },
  })

  // ─── Page Elements for Ski Club Valais ────────────────────────────────

  // Rich text on home page
  const richTextElement = await prisma.pageElement.create({
    data: {
      pageId: homePage.id,
      clubId: clubValais.id,
      position: 0,
      type: 'rich_text',
      data: {
        html: '<h2>About Us</h2><p>Founded in 1952, Ski Club Valais has been promoting alpine skiing for over 70 years. Join us for weekly group ski sessions, competitions, and social events throughout the season.</p>',
      },
    },
  })

  // Calendar element on events page
  const calendarElement = await prisma.pageElement.create({
    data: {
      pageId: calendarPage.id,
      clubId: clubValais.id,
      position: 0,
      type: 'calendar',
      data: {},
    },
  })

  // Calendar events
  const now = new Date()
  await prisma.event.createMany({
    data: [
      {
        clubId: clubValais.id,
        elementId: calendarElement.id,
        title: 'Opening Day Ski Tour',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        description: 'Season opener at Zermatt. All skill levels welcome.',
      },
      {
        clubId: clubValais.id,
        elementId: calendarElement.id,
        title: 'Club Championship',
        date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        description: 'Annual slalom championship. Registration required.',
      },
      {
        clubId: clubValais.id,
        elementId: calendarElement.id,
        title: 'Junior Training Camp',
        date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        description: 'Three-day training camp for skiers under 18.',
      },
    ],
  })

  // Gallery element on gallery page
  const galleryElement = await prisma.pageElement.create({
    data: {
      pageId: galleryPage.id,
      clubId: clubValais.id,
      position: 0,
      type: 'gallery',
      data: {},
    },
  })

  await prisma.galleryItem.createMany({
    data: [
      {
        clubId: clubValais.id,
        elementId: galleryElement.id,
        url: 'https://example.com/placeholder-ski-1.jpg',
        alt: 'Skiers on a sunny alpine slope in Zermatt',
        type: 'image',
        position: 0,
      },
      {
        clubId: clubValais.id,
        elementId: galleryElement.id,
        url: 'https://example.com/placeholder-ski-2.jpg',
        alt: 'Club members at the annual championship podium',
        type: 'image',
        position: 1,
      },
    ],
  })

  // Documents element on documents page
  const documentsElement = await prisma.pageElement.create({
    data: {
      pageId: docsPage.id,
      clubId: clubValais.id,
      position: 0,
      type: 'documents',
      data: {},
    },
  })

  await prisma.document.createMany({
    data: [
      {
        clubId: clubValais.id,
        elementId: documentsElement.id,
        displayName: 'Club Statutes 2024',
        fileName: 'club-statutes-2024.pdf',
        fileType: 'application/pdf',
        fileSize: 245760,
        url: 'https://example.com/placeholder-statutes.pdf',
        position: 0,
      },
      {
        clubId: clubValais.id,
        elementId: documentsElement.id,
        displayName: 'Membership Form',
        fileName: 'membership-form.pdf',
        fileType: 'application/pdf',
        fileSize: 102400,
        url: 'https://example.com/placeholder-membership.pdf',
        position: 1,
      },
    ],
  })

  console.log('✓ Page elements created for Ski Club Valais')

  // ─── Content Versions (3 per page) ───────────────────────────────────
  const pages = [homePage, calendarPage, galleryPage, docsPage, contactPage]
  for (const page of pages) {
    for (let v = 1; v <= 3; v++) {
      await prisma.contentVersion.create({
        data: {
          pageId: page.id,
          clubId: clubValais.id,
          createdBy: adminValais.id,
          snapshot: {
            version: v,
            page: { id: page.id, slug: page.slug, label: page.label },
            elements: [],
            savedAt: new Date(Date.now() - (4 - v) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      })
    }
  }
  console.log('✓ Content versions created (3 per page)')

  // ─── Applications (pending, approved, rejected) ───────────────────────
  await prisma.application.createMany({
    data: [
      {
        name: 'Mountaineering Club Geneva',
        activityType: 'mountaineering',
        description: 'A club dedicated to alpine mountaineering and rock climbing in the Geneva area.',
        email: 'contact@mountaineering-geneva.ch',
        status: 'pending',
      },
      {
        name: 'Tennis Club Lausanne West',
        activityType: 'tennis',
        description: 'Community tennis club for all skill levels in western Lausanne.',
        email: 'info@tennis-lausanne-west.ch',
        status: 'approved',
        reviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Extreme Sports Zurich',
        activityType: 'extreme_sports',
        description: 'Paragliding, base jumping, and wingsuit association.',
        email: 'admin@extreme-zurich.ch',
        status: 'rejected',
        rejectionReason: 'Platform currently focuses on non-extreme sports associations.',
        reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  })
  console.log('✓ Applications created (pending, approved, rejected)')

  // ─── Contact Submissions (5 encrypted) ───────────────────────────────
  const contactMessages = [
    { name: 'Sophie Martin', email: 'sophie.martin@example.com', subject: 'Membership inquiry', body: 'Hello, I would like to know more about joining your ski club. What are the membership fees and requirements?' },
    { name: 'Pierre Dupont', email: 'pierre.dupont@example.com', subject: 'Group booking', body: 'We are a group of 8 friends looking to participate in one of your guided ski tours. Do you offer group rates?' },
    { name: 'Anna Schmidt', email: 'anna.schmidt@example.com', subject: 'Junior training', body: 'My 12-year-old daughter is interested in joining your junior skiing program. What is the age minimum and skill level required?' },
    { name: 'Marc Weber', email: 'marc.weber@example.com', subject: 'Equipment rental', body: 'Do you have equipment rental available for members? We are traveling from Zurich and cannot bring our own skis.' },
    { name: 'Celine Blanc', email: 'celine.blanc@example.com', subject: 'Competition registration', body: 'I saw that you have an annual championship coming up. How can I register to participate?' },
  ]

  for (const msg of contactMessages) {
    const { ciphertext, iv } = encrypt(msg.body)
    await prisma.contactSubmission.create({
      data: {
        clubId: clubValais.id,
        senderName: msg.name,
        senderEmail: msg.email,
        subject: msg.subject,
        encryptedBody: ciphertext,
        iv,
        isRead: Math.random() > 0.5,
      },
    })
  }
  console.log('✓ Contact submissions created (5 encrypted)')

  // ─── Analytics Events (90 days) ────────────────────────────────────────
  const crypto = await import('crypto')
  const pageEvents: Array<{
    clubId: string
    pageSlug: string
    eventType: 'page_view' | 'contact_form_sent'
    country: string
    referrer: string | null
    ipHash: string
    visitedAt: Date
  }> = []

  for (let day = 89; day >= 0; day--) {
    const dayDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000)
    const dailySalt = dayDate.toISOString().split('T')[0] // YYYY-MM-DD as daily salt
    const eventsPerDay = Math.floor(Math.random() * 15) + 3 // 3–17 events per day

    for (let e = 0; e < eventsPerDay; e++) {
      const fakeIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      const ipHash = crypto
        .createHash('sha256')
        .update(`${fakeIp}:${dailySalt}`)
        .digest('hex')

      const pageSlugs = ['home', 'events', 'gallery', 'documents', 'contact']
      const pageSlug = pageSlugs[Math.floor(Math.random() * pageSlugs.length)]

      pageEvents.push({
        clubId: clubValais.id,
        pageSlug,
        eventType: Math.random() > 0.9 ? 'contact_form_sent' : 'page_view',
        country: 'ch',
        referrer: Math.random() > 0.7 ? null : 'google.com',
        ipHash,
        visitedAt: new Date(dayDate.getTime() + Math.random() * 86400000),
      })
    }
  }

  // Insert in batches to avoid timeout
  const batchSize = 100
  for (let i = 0; i < pageEvents.length; i += batchSize) {
    await prisma.pageEvent.createMany({ data: pageEvents.slice(i, i + batchSize) })
  }
  console.log(`✓ Analytics events created: ${pageEvents.length} events over 90 days`)

  // ─── Feature Flags ────────────────────────────────────────────────────
  await prisma.featureFlag.upsert({
    where: { key: 'registrations_enabled' },
    update: {},
    create: { key: 'registrations_enabled', value: true },
  })
  await prisma.featureFlag.upsert({
    where: { key: 'maintenance_mode' },
    update: {},
    create: { key: 'maintenance_mode', value: false },
  })
  await prisma.featureFlag.upsert({
    where: { key: 'max_pages_per_club' },
    update: {},
    create: { key: 'max_pages_per_club', value: 5 },
  })
  console.log('✓ Feature flags seeded')

  console.log('\n🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
```

> **Seed note**: The seed file imports directly from `@/generated/prisma/client` (path alias). If `tsx` doesn't resolve `@/` aliases, add a `tsconfig.json` path config or use relative import: `import { PrismaClient } from '../src/generated/prisma/client'`. Use the relative import in `prisma/seed.ts` to be safe.

### Architecture Compliance

**Multi-tenant query guard (CRITICAL):**
```typescript
// ✅ CORRECT — atomic, secure
const page = await prisma.page.findFirst({
  where: { id: pageId, clubId },
})

// ❌ FORBIDDEN — vulnerable to TOCTOU, extra round-trip
const page = await prisma.page.findFirst({ where: { id: pageId } })
if (page?.clubId !== clubId) throw new Error('Not found')
```

**Auth check in Server Actions (for all future stories):**
```typescript
const session = await auth()
if (!session?.user) return { success: false, error: 'Unauthenticated', code: 'UNAUTHENTICATED' }
const { clubId, role } = session.user  // Never from client input
```

**NEVER pass raw Date to client components:**
```typescript
// ✅ CORRECT
return { success: true, data: { createdAt: record.createdAt.toISOString() } }

// ❌ FORBIDDEN — not serializable across server/client boundary
return { success: true, data: { createdAt: record.createdAt } }
```

### Library & Framework Requirements

| Package | Version | Notes |
|---|---|---|
| `prisma` | `7.4.1` (exact) | Already installed |
| `@prisma/client` | `7.4.1` (exact) | Already installed |
| `@prisma/adapter-pg` | `7.4.1` (exact) | Already installed |
| `pg` | `8.19.0` (exact) | Already installed |
| `argon2` | `0.44.0` (exact) | Already installed — for seed password hashing |
| `tsx` | latest dev | **MUST INSTALL** — `pnpm add -D tsx` — for running seed |
| `dotenv` | already in devDeps | Used in `prisma.config.ts` and seed |

### File Structure

Files to **CREATE** in this story:
```
prisma/seed.ts                    # Complete seed implementation
src/lib/crypto.ts                 # AES-256-GCM encrypt/decrypt
```

Files to **MODIFY** in this story:
```
prisma/schema.prisma              # Add all models and enums
src/server/db.ts                  # Add $extends middleware for clubId enforcement
package.json                      # Add "prisma": { "seed": "tsx prisma/seed.ts" }
prisma.config.ts                  # Optionally: add seed config (verify Prisma v7 approach)
```

> **Note on `prisma.config.ts` seed config**: Prisma v7 may support seed configuration in `prisma.config.ts`. If so, prefer that over `package.json`. Verify which approach Prisma v7 supports before implementing.

### Potential Issues to Watch For

1. **`$extends` type inference**: The extended client from `$extends` changes the TypeScript type. If you get type errors importing `prisma` from `@/server/db` in other files, ensure TypeScript can resolve the extended type. Use `typeof prisma` for type references if needed.

2. **Middleware on `create` operations**: The clubId middleware should NOT block `create` operations, as `create` uses a `data` field (not `where`) to specify `clubId`. Ensure your middleware only targets read/update/delete operations that use `where` clauses.

3. **Enum values in seed**: Prisma enums must match exactly. When using enum values in seed:
   ```typescript
   // For ApplicationStatus:
   status: 'pending'   // string literal matching the enum value name
   // NOT: status: ApplicationStatus.pending
   ```

4. **BigInt in seed**: `storageUsedBytes` and `storageLimitBytes` are BigInt. Use `BigInt(0)` not `0n` for better compatibility.

5. **Seed using raw PrismaClient**: The seed bypasses the clubId middleware intentionally (creating records with clubId in `data` field). Use a fresh `PrismaClient` without `$extends` in the seed to avoid false-positive middleware errors.

6. **`tsx` path alias**: The seed file uses `@/` path alias. `tsx` may not resolve this without configuration. Use relative imports in `prisma/seed.ts` to be safe: `from '../src/generated/prisma/client'` and `from '../src/lib/crypto'`.

7. **`pnpm prisma migrate dev`**: Ensure the PostgreSQL container is running via `docker compose -f docker-compose.dev.yml up -d` before running migrations.

### Project Structure Notes

- [Source: architecture.md#Naming Patterns] — Every Prisma model must declare `@@map`. Every field must declare `@map` where the PostgreSQL name differs from the camelCase Prisma name.
- [Source: architecture.md#Enforcement Guidelines] — Prisma client singleton is `src/server/db.ts` ONLY. The seed uses a separate raw instance to bypass middleware.
- [Source: architecture.md#Data Architecture] — `page_elements` uses JSONB `data` field per element type; `events`, `gallery_items`, `documents` use relational tables referenced from `page_elements`.
- Detected conflict: The `(country)/[country]/` route group in the architecture directory tree does NOT match the actual implemented `(country)/[club]/` route (from Story 1.1 - country removed from path segment, derived from host instead). Story 1.2 has no routing changes; this is documented for awareness.

### References

- [Source: epics.md#Story 1.2] — Acceptance criteria and seed data specification
- [Source: architecture.md#Data Architecture] — Multi-tenant isolation strategy, content storage schema, version history model
- [Source: architecture.md#Naming Patterns] — Prisma naming conventions, `@map`/`@@map` requirements
- [Source: architecture.md#Enforcement Guidelines] — Forbidden anti-patterns, required patterns
- [Source: architecture.md#Authentication & Security] — Contact form encryption (AES-256-GCM, `lib/crypto.ts`)
- [Source: architecture.md#Process Patterns] — Multi-tenant query pattern, auth check pattern
- [Source: 1-1-project-scaffold-development-environment.md#Debug Log] — Prisma v7 breaking changes, `@prisma/adapter-pg` requirement, `PrismaPg` adapter usage

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- **Schema back-relations required**: The story schema spec omitted back-relation fields on `PageEvent` and `ContactSubmission` despite `Club` having `pageEvents PageEvent[]` and `contactSubmissions ContactSubmission[]` relation arrays. Prisma v7 validation requires explicit back-relations on both sides. Added `club Club @relation(fields: [clubId], references: [id], onDelete: Cascade)` to both models.
- **Seed config in `prisma.config.ts`**: Prisma v7 reads seed command from `migrations.seed` in `prisma.config.ts`, NOT from `package.json`. The `package.json` "prisma" key is Prisma v5/v6 style and is redundant; removed in second code review pass.
- **tsconfig exclude prisma/**: `prisma/seed.ts` and `prisma/verify.ts` are tsx scripts not meant for the Next.js TypeScript build. Added `"prisma"` to `tsconfig.json` `exclude` array to prevent build errors.
- **`$extends` TypeScript types**: `$allModels.$allOperations` resolves to `never` types until `prisma generate` is run with actual models in the schema. Running `pnpm prisma generate` before running `pnpm tsc --noEmit` is required.
- **Code review fixes (2026-02-27)**: Fixed 10 issues found during first adversarial review — see Change Log entry below.
- **Second code review fixes (2026-02-27)**: Fixed 10 more issues — added FK relations for SupportTicket/PageElement/ContentVersion/TicketReply to Club/User; added PageElement @@index([clubId, pageId]); added Lausanne documents element (AC4); fixed verify.ts count (15→30) and added healthCheck + composite-key AC2 tests; fixed crypto.ts decrypt Buffer coercion; removed redundant seed config from package.json.
- **Third code review fixes (2026-02-27)**: Added SupportTicket @@index([clubId]); rewrote verify.ts as a story-agnostic verification script (removed AC/story references, fixed double-result bug in composite-key test, added element type coverage check); removed `skipDuplicates: true` from all createMany calls that lacked unique constraints (Event, GalleryItem, Document, Application).

### Completion Notes List

- All 23 database tables created via `init` migration, plus FK constraints and indexes via two additional migrations — all with correct snake_case names via `@map`/`@@map`; full referential integrity on all club-scoped models
- Prisma v7 `$extends` query middleware enforces `clubId` on 11 club-scoped models (added `healthCheck`) for all read/update/delete ops; composite unique key `where` clauses handled correctly; create/createMany bypass correctly
- AES-256-GCM crypto helpers implemented with lazy key-caching using Node.js native `crypto` module, no external deps
- Seed produces: 1 operator, 2 clubs with complete pages and all 6 element types each, 3 content versions per page per club, 3 applications, 5 encrypted contact submissions, ~870 analytics events over 90 days, 3 feature flags; passwords updated on re-run
- All acceptance criteria verified via `prisma/verify.ts`; `pnpm build` passes cleanly

### File List

**Created:**
- `prisma/schema.prisma` — complete schema with all enums and models (23 tables)
- `prisma/migrations/20260227194345_init/migration.sql` — initial migration SQL
- `prisma/migrations/20260227202001_add_fk_constraints_and_index/migration.sql` — FK constraints for Event/GalleryItem/Document/HealthCheck + ContentVersion index
- `prisma/migrations/20260227203548_fix_missing_fk_relations_and_indexes/migration.sql` — FK constraints for SupportTicket/PageElement/ContentVersion→Club, TicketReply→User, PageElement @@index([clubId, pageId])
- `prisma/migrations/20260227205416_add_support_ticket_club_index/migration.sql` — @@index([clubId]) on support_tickets
- `src/lib/crypto.ts` — AES-256-GCM encrypt/decrypt helpers with lazy key caching
- `prisma/seed.ts` — complete seed implementation (both clubs with all element types)
- `prisma/verify.ts` — acceptance criteria verification script

**Modified:**
- `src/server/db.ts` — `$extends` clubId middleware with composite-key support; added `healthCheck` to scoped models
- `package.json` — added `tsx` devDependency; removed redundant `prisma.seed` key (Prisma v7 reads from `prisma.config.ts`)
- `pnpm-lock.yaml` — updated by `pnpm add -D tsx`
- `prisma.config.ts` — added `migrations.seed` config for Prisma v7
- `tsconfig.json` — added `prisma` to exclude array
- `.env` — added `CONTACT_ENCRYPTION_KEY` (32-byte dev key)
- `.env.example` — fixed `CONTACT_ENCRYPTION_KEY` to exactly 32 bytes
- `README.md` — added `prisma migrate dev` and `prisma db seed` to setup steps, added dev credentials

### Change Log

- 2026-02-27: Story 1.2 implemented — complete Prisma schema (23 tables), multi-tenant clubId middleware, AES-256-GCM crypto helpers, database seed with all required data, initial migration applied. All ACs verified.
- 2026-02-27: First code review fixes — fixed `.env.example` key length (33→32 bytes); added FK constraints for Event/GalleryItem/Document/HealthCheck to Club; added ContentVersion composite index; fixed middleware composite `where` key handling; added `healthCheck` to CLUB_SCOPED_READ_MODELS; lazy key caching in crypto.ts; seeded both clubs with all 6 element types; fixed seed password refresh on re-run; updated README with migrate/seed steps.
- 2026-02-27: Second code review fixes — added FK relations for SupportTicket→Club, PageElement→Club, ContentVersion→Club, TicketReply→User; added PageElement @@index([clubId, pageId]); added Lausanne documents page+element (AC4 now fully met); fixed verify.ts content version count (15→30), added healthCheck AC2 test, added composite-key AC2 test, synced CLUB_SCOPED_READ_MODELS with production; fixed crypto.ts decrypt() explicit utf8 output; removed redundant `"prisma"` key from package.json.
- 2026-02-27: Third code review fixes — added SupportTicket @@index([clubId]); rewrote prisma/verify.ts as story-agnostic (descriptive function names, fixed composite-key test logic, added element type coverage per club); removed ineffective `skipDuplicates: true` from Event/GalleryItem/Document/Application createMany calls.
