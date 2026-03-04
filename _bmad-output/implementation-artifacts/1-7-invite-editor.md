# Story 1.7: Invite Editor

Status: done

## Story

As a Club Owner,
I want to invite another person by email to co-manage my club as an Editor,
so that I can delegate content editing without sharing my credentials.

## Acceptance Criteria

1. **Given** a Club Owner is on the club settings page, **When** they submit an email address to invite as Editor, **Then** if the email matches an existing user, a `ClubMembership` record is created with `role: EDITOR, status: PENDING` and an invitation email is sent with a time-limited accept link; if the email belongs to a new user, a user record is created (no password, no TOTP) and the same flow applies — the accept link triggers credential setup followed by automatic membership activation.

2. **Given** the invited person clicks the accept link and is a new user, **When** they complete password setup and TOTP enrollment, **Then** their `ClubMembership` status is atomically updated to `ACTIVE` in the same transaction that completes credential setup; they are then redirected to `/my-clubs`.

3. **Given** the invited person clicks the accept link and is an already-authenticated existing user, **When** they land on the accept page, **Then** their `ClubMembership` status is updated to `ACTIVE` immediately and they are redirected to `/my-clubs` where the new club appears in their list.

4. **Given** an invite accept link is accessed more than 7 days after issuance, **Then** the link is expired; the user sees a clear error message instructing them to ask the Club Owner to resend the invitation.

5. **Given** a Club Owner views the club settings membership panel, **Then** all memberships for that club are listed with their role, status (`Pending` / `Active`), and the email address of each member.

## Tasks / Subtasks

- [x] Task 1: Add `Invitation` model to Prisma schema + migration (AC: #1, #4)
  - [x] 1.1 Add `Invitation` model to `prisma/schema.prisma` with fields: `id`, `email`, `clubId`, `tokenHash` (unique), `expiresAt`, `createdAt`
  - [x] 1.2 Run `pnpm prisma migrate dev --name add_invitation` to generate migration
  - [x] 1.3 Regenerate Prisma client (`pnpm prisma generate` — should auto-run after migrate)

- [x] Task 2: Install email dependencies + create `src/lib/email.ts` (AC: #1)
  - [x] 2.1 Install: `pnpm add nodemailer resend && pnpm add -D @types/nodemailer`
  - [x] 2.2 Create `src/lib/email.ts`: unified mailer — uses Resend when `RESEND_API_KEY` is set, falls back to SMTP (`nodemailer`) for local dev
  - [x] 2.3 Export `sendEmail({ to, subject, html })` as the single send interface
  - [x] 2.4 Add `SMTP_HOST`, `SMTP_PORT`, `RESEND_API_KEY`, `EMAIL_FROM` to `.env.example` comments (already present — verify only)

- [x] Task 3: `inviteEditor` Server Action (AC: #1, #5)
  - [x] 3.1 Create `src/app/(country)/[country]/[club]/settings/actions.ts` with `inviteEditor(formData)` Server Action
  - [x] 3.2 Guard: `getAuthSession()` + verify caller has `OWNER` role in `ClubMembership` for this club (resolve clubId from URL params via `prisma.club.findUnique`)
  - [x] 3.3 Validate email input with Zod
  - [x] 3.4 Reject if the email already has an `ACTIVE` or `PENDING` membership in this club
  - [x] 3.5 If user does not exist: `prisma.user.create({ data: { email, role: 'CLUB_ADMIN' } })`
  - [x] 3.6 Create `ClubMembership({ userId, clubId, role: 'EDITOR', status: 'PENDING', invitedBy: currentUserId })`
  - [x] 3.7 Generate invite token: `randomBytes(32).toString('hex')`, hash with SHA-256, store as `Invitation` record (TTL: 7 days)
  - [x] 3.8 Call `sendEmail` with invite HTML email containing accept link (`/auth/invite/accept?token=<rawToken>`)
  - [x] 3.9 Return typed result: `{ success: true }` | `{ success: false, error, code }`

- [x] Task 4: Accept link route handler (AC: #2, #3, #4)
  - [x] 4.1 Create `src/app/auth/invite/accept/route.ts` (GET handler)
  - [x] 4.2 Read `token` query param; hash with SHA-256; look up `Invitation` where `tokenHash = hash`
  - [x] 4.3 If not found or `expiresAt < now`: redirect to `/auth/error?error=InviteExpired`
  - [x] 4.4 Find the `ClubMembership` record in `PENDING` status for `(userId matching invitation.email, clubId = invitation.clubId)`
  - [x] 4.5 **Authenticated existing user path**: if `getAuthSession()` returns a session → update `ClubMembership.status` to `ACTIVE`, set `joinedAt = now()`, delete `Invitation` record — all in `prisma.$transaction` → redirect to `/my-clubs`
  - [x] 4.6 **Unauthenticated path (existing user with password)**: redirect to `/auth/login?callbackUrl=/auth/invite/accept?token=<token>` — invitation stays intact; user logs in and clicks the link again to activate.
  - [x] 4.6b **Unauthenticated path (new user, no password)**: set `setup_session` cookie (same `encodeSetupCookie` from `src/lib/setup-cookie.ts`) → **leave `Invitation` record intact** (so the user can re-open the link before finishing setup; deletion happens atomically inside `setupPassword`) → redirect to `/auth/setup`
  - [x] 4.7 Error page at `src/app/auth/error/page.tsx` already handles generic errors; add `InviteExpired` error code → show message: "This invitation has expired. Please ask the club owner to resend the invitation."

- [x] Task 5: Activate PENDING membership on `setupPassword` completion (AC: #2)
  - [x] 5.1 In `src/app/auth/setup/actions.ts#setupPassword`, after creating the DB session, query for PENDING memberships: `prisma.clubMembership.findMany({ where: { userId, status: 'PENDING' } })`
  - [x] 5.2 If any PENDING memberships exist, wrap the existing `prisma.user.update()` + `prisma.session.create()` + `prisma.clubMembership.updateMany({ where: { userId, status: 'PENDING' }, data: { status: 'ACTIVE', joinedAt: new Date() } })` in a single `prisma.$transaction([...])` — atomic
  - [x] 5.3 If no PENDING memberships, existing flow unchanged (no regression)

- [x] Task 6: Club settings UI — membership panel (AC: #1, #5)
  - [x] 6.1 Create `src/app/(country)/[country]/[club]/settings/page.tsx` (Server Component) — only accessible to authenticated OWNER (guard in the page itself using session + `ClubMembership` lookup)
  - [x] 6.2 Query `prisma.clubMembership.findMany({ where: { clubId }, include: { user: { select: { email: true } } } })`; filter to `ACTIVE` and `PENDING` statuses
  - [x] 6.3 Create `src/components/app/settings/MembershipPanel.tsx` (Client Component) — lists members as table rows: email | role badge | status badge (Pending/Active) | invite form
  - [x] 6.4 Invite form: single email input + "Invite as Editor" button → calls `inviteEditor` Server Action; shows inline success/error feedback
  - [x] 6.5 Add a "Settings" link to the club page (e.g., `src/app/(country)/[country]/[club]/page.tsx`) visible only to `OWNER` role (read role from `ClubMembership` loaded in layout or page)
  - [x] 6.6 No navigation sidebar exists yet — a simple link/button in the club page header is sufficient for this story

- [x] Task 7: Tests (AC: all)
  - [x] 7.1 Create `src/__tests__/invite-editor.test.ts` — test `inviteEditor` action: unauthenticated → UNAUTHORIZED; non-OWNER → FORBIDDEN; email validation failure → VALIDATION_ERROR; already active member → ALREADY_MEMBER; new user path → user created + membership created + invitation created + email sent; existing user path → membership created + invitation created + email sent
  - [x] 7.2 Create `src/__tests__/invite-accept.test.ts` — test accept route: no token → error redirect; expired/invalid token → InviteExpired redirect; authenticated user → membership activated + invitation deleted + redirect to /my-clubs; unauthenticated existing user (has password) → redirect to `/auth/login` with `callbackUrl`, invitation NOT deleted; unauthenticated new user (no password) → setup cookie set, invitation NOT deleted, redirect to /auth/setup
  - [x] 7.3 Extend `src/__tests__/setup-password.test.ts` — add test: user with PENDING membership completing setup → membership activated atomically (no regression to existing cases)
  - [x] 7.4 Run `pnpm test` — all tests pass, no regressions from 146 baseline (now 166 passing)

## Dev Notes

### 🗄️ Prisma Schema Change — New `Invitation` Model

**Add to `prisma/schema.prisma`** (after `VerificationToken`):

```prisma
model Invitation {
  id          String   @id @default(cuid())
  email       String
  clubId      String   @map("club_id")
  tokenHash   String   @unique @map("token_hash")  // SHA-256 of raw token
  expiresAt   DateTime @map("expires_at")
  createdAt   DateTime @default(now()) @map("created_at")

  club Club @relation(fields: [clubId], references: [id], onDelete: Cascade)

  @@index([email])
  @@map("invitations")
}
```

**Also add the reverse relation to `Club`:**
```prisma
// In model Club, add:
invitations Invitation[]
```

**Run migration:**
```bash
pnpm prisma migrate dev --name add_invitation
```

**Prisma import path** (CRITICAL — always this, never `@prisma/client`):
```typescript
import { prisma } from '@/server/db'
import type { Invitation } from '@/generated/prisma/client'
```

`invitation` is **NOT** club-scoped (it doesn't need `clubId` enforcement via the middleware). It relates to a club but is deleted after acceptance. However `club` IS referenced via `clubId` — the middleware only guards models in `CLUB_SCOPED_READ_MODELS` (see `src/server/db.ts`), and `invitation` won't be in that set.

`clubMembership` is also NOT in `CLUB_SCOPED_READ_MODELS` — confirmed in Story 1.4.

[Source: prisma/schema.prisma]
[Source: src/server/db.ts#CLUB_SCOPED_READ_MODELS]

### 📧 Email Infrastructure — `src/lib/email.ts` (NEW FILE)

This is the first story to require email sending from the app. No email library is currently installed.

**Install dependencies:**
```bash
pnpm add nodemailer resend
pnpm add -D @types/nodemailer
```

**Create `src/lib/email.ts`:**
```typescript
/**
 * Unified email sender.
 * - Production (RESEND_API_KEY set): uses Resend SDK
 * - Dev/local (no RESEND_API_KEY): uses nodemailer SMTP → Mailpit on localhost:1025
 */

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'noreply@platform.local',
      to,
      subject,
      html,
    })
    if (error) throw new Error(`Resend error: ${error.message}`)
  } else {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'localhost',
      port: parseInt(process.env.SMTP_PORT ?? '1025', 10),
      secure: false,
    })
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? 'noreply@platform.local',
      to,
      subject,
      html,
    })
  }
}
```

**Local dev email UI:** Mailpit runs at `http://localhost:8025` — all sent emails appear there. No `RESEND_API_KEY` needed in `.env.local` for development.

[Source: .env.example — SMTP_HOST, SMTP_PORT, RESEND_API_KEY, EMAIL_FROM]
[Source: _bmad-output/planning-artifacts/architecture.md#line 919 — lib/email.ts planned location]
[Source: _bmad-output/planning-artifacts/architecture.md#line 1008 — Mailpit on 1025/8025]

### 🔐 `inviteEditor` Server Action — Critical Guards

**File:** `src/app/(country)/[country]/[club]/settings/actions.ts`

```typescript
'use server'
import { createHash, randomBytes } from 'crypto'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const inviteSchema = z.object({ email: z.string().email() })

export type InviteEditorResult =
  | { success: true }
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'ALREADY_MEMBER' | 'SERVER_ERROR' }

export async function inviteEditor(
  _prevState: InviteEditorResult | null,
  formData: FormData,
  country: string,
  slug: string,
): Promise<InviteEditorResult> {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' }
  }

  // Resolve club by URL params (NEVER from session/client input)
  const club = await prisma.club.findUnique({
    where: { slug_country: { slug, country } },
    select: { id: true, name: true },
  })
  if (!club) return { success: false, error: 'Club not found.', code: 'UNAUTHORIZED' }

  // Verify caller is OWNER of this club
  const callerMembership = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE', role: 'OWNER' },
  })
  if (!callerMembership) {
    return { success: false, error: 'Only club owners can invite editors.', code: 'FORBIDDEN' }
  }

  // Validate email
  const parsed = inviteSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { success: false, error: 'Invalid email address.', code: 'VALIDATION_ERROR' }
  }
  const { email } = parsed.data

  // Check existing membership
  const existingMember = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      memberships: {
        where: { clubId: club.id, status: { in: ['ACTIVE', 'PENDING'] } },
        select: { id: true },
      },
    },
  })
  if (existingMember?.memberships.length) {
    return { success: false, error: 'This person is already a member or has a pending invite.', code: 'ALREADY_MEMBER' }
  }

  // Find or create user
  const user = existingMember ?? await prisma.user.create({
    data: { email, role: 'CLUB_ADMIN' },
    select: { id: true },
  })

  // Create PENDING membership
  await prisma.clubMembership.create({
    data: {
      userId: user.id,
      clubId: club.id,
      role: 'EDITOR',
      status: 'PENDING',
      invitedBy: session.user.id,
    },
  })

  // Generate invite token (raw stored nowhere — only hash stored)
  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await prisma.invitation.create({
    data: { email, clubId: club.id, tokenHash, expiresAt },
  })

  // Compose accept URL
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const acceptUrl = `${baseUrl}/auth/invite/accept?token=${rawToken}`

  await sendEmail({
    to: email,
    subject: `You've been invited to co-manage ${club.name}`,
    html: `
      <p>You have been invited to co-manage <strong>${club.name}</strong> as an Editor.</p>
      <p><a href="${acceptUrl}">Accept invitation</a></p>
      <p>This link expires in 7 days. If you did not expect this, you can safely ignore this email.</p>
    `,
  })

  return { success: true }
}
```

**⚠️ IMPORTANT:** Do NOT use `redirect()` inside Server Actions that return typed results (it throws a special error that Next.js catches — see previous stories' learnings). Return `{ success: true }` and let the Client Component handle the success UX.

[Source: src/app/auth/login/actions.ts — typed result pattern]
[Source: src/app/auth/setup/actions.ts — no redirect() in actions with return values]

### 🔗 Accept Link Route Handler — `src/app/auth/invite/accept/route.ts`

```typescript
import { createHash } from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { encodeSetupCookie, SETUP_COOKIE_NAME } from '@/lib/setup-cookie'

export async function GET(request: NextRequest) {
  const rawToken = request.nextUrl.searchParams.get('token') ?? ''
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')

  const invitation = await prisma.invitation.findUnique({ where: { tokenHash } })

  if (!invitation || invitation.expiresAt < new Date()) {
    // Delete expired invitation to keep table clean
    if (invitation) await prisma.invitation.delete({ where: { tokenHash } })
    return NextResponse.redirect(new URL('/auth/error?error=InviteExpired', request.url))
  }

  // Find PENDING membership for this invitation
  const invitedUser = await prisma.user.findUnique({
    where: { email: invitation.email },
    select: { id: true, passwordHash: true },
  })

  if (!invitedUser) {
    // Should not happen (user created during inviteEditor), but guard anyway
    return NextResponse.redirect(new URL('/auth/error?error=InviteExpired', request.url))
  }

  const session = await getAuthSession()

  if (session?.user?.id === invitedUser.id) {
    // Authenticated as the invited user → activate immediately
    await prisma.$transaction([
      prisma.clubMembership.updateMany({
        where: { userId: invitedUser.id, clubId: invitation.clubId, status: 'PENDING' },
        data: { status: 'ACTIVE', joinedAt: new Date() },
      }),
      prisma.invitation.delete({ where: { tokenHash } }),
    ])
    return NextResponse.redirect(new URL('/my-clubs', request.url))
  }

  if (session) {
    // Logged in as a DIFFERENT user — don't activate, show mismatch error
    return NextResponse.redirect(new URL('/auth/error?error=InviteEmailMismatch', request.url))
  }

  // Unauthenticated path: delete invitation + set setup cookie + redirect to /auth/setup
  await prisma.invitation.delete({ where: { tokenHash } })

  const isProduction = process.env.NODE_ENV === 'production'
  const response = NextResponse.redirect(new URL('/auth/setup', request.url))
  response.cookies.set(SETUP_COOKIE_NAME, encodeSetupCookie(invitedUser.id), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60, // 30 minutes
  })

  return response
}
```

**⚠️ Session mismatch edge case:** If a user is logged in as a DIFFERENT account and clicks an invite link meant for another email, redirect to a new error code `InviteEmailMismatch`. Add this error code to the error page.

[Source: src/app/auth/magic-link/route.ts — Route Handler cookie pattern with NextResponse.cookies.set()]
[Source: src/lib/setup-cookie.ts — encodeSetupCookie / SETUP_COOKIE_NAME]

### ⚡ Atomic Membership Activation in `setupPassword`

**File to modify:** `src/app/auth/setup/actions.ts`

The existing `setupPassword` creates a session after password hashing. Wrap the critical writes in `prisma.$transaction` to atomically activate any PENDING memberships:

```typescript
// Inside setupPassword, after hashing the password:
// BEFORE (current pattern — manual separate DB calls):
await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash, magicToken: null, magicTokenExp: null } })
const sessionToken = randomUUID()
const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
await prisma.session.create({ data: { sessionToken, userId, expires } })

// AFTER (atomic transaction with membership activation):
const sessionToken = randomUUID()
const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

await prisma.$transaction([
  prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash, magicToken: null, magicTokenExp: null },
  }),
  prisma.session.create({
    data: { sessionToken, userId, expires },
  }),
  prisma.clubMembership.updateMany({
    where: { userId, status: 'PENDING' },
    data: { status: 'ACTIVE', joinedAt: new Date() },
  }),
])
```

**Why this is safe:** `updateMany` with `{ where: { userId, status: 'PENDING' }, data: { status: 'ACTIVE' } }` is a no-op if there are no PENDING memberships (returns `{ count: 0 }`). Zero regression risk.

[Source: src/app/auth/setup/actions.ts — existing setupPassword implementation]
[Source: _bmad-output/implementation-artifacts/1-6-passkey-webauthn-authentication.md#previous learnings]

### 🏗️ Club Settings Page — Route & Guard

**Route:** `src/app/(country)/[country]/[club]/settings/page.tsx`

This page sits inside the existing `(country)/[country]/[club]/` route group. The existing `layout.tsx` at that level already:
1. Guards unauthenticated users → redirects to `/auth/login`
2. Verifies `ACTIVE` membership → redirects to `/my-clubs` if not found

The settings page additionally needs to check for `OWNER` role (not just any active member):

```typescript
// src/app/(country)/[country]/[club]/settings/page.tsx
import { redirect, notFound } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { isValidCountry } from '@/lib/country'
import { MembershipPanel } from '@/components/app/settings/MembershipPanel'

export default async function ClubSettingsPage({
  params,
}: {
  params: Promise<{ country: string; club: string }>
}) {
  const session = await getAuthSession()
  if (!session?.user) redirect('/auth/login')

  const { country, club: slug } = await params   // ⚠️ ALWAYS await params in Next.js 15

  if (!isValidCountry(country)) notFound()

  const club = await prisma.club.findUnique({
    where: { slug_country: { slug, country } },
    select: { id: true, name: true },
  })
  if (!club) notFound()

  // Only OWNERS can access settings
  const ownership = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE', role: 'OWNER' },
  })
  if (!ownership) redirect(`/${country}/${slug}`)

  // Load all memberships for the panel
  const memberships = await prisma.clubMembership.findMany({
    where: { clubId: club.id, status: { in: ['ACTIVE', 'PENDING'] } },
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">{club.name} — Settings</h1>
        <MembershipPanel
          memberships={memberships}
          country={country}
          slug={slug}
        />
      </div>
    </main>
  )
}
```

**⚠️ CRITICAL: `await params`** — `params` is a Promise in Next.js 15/16 App Router. Always `const { country, club } = await params`. Same pattern as `src/app/(country)/[country]/[club]/layout.tsx`.

[Source: src/app/(country)/[country]/[club]/layout.tsx — layout already guards auth; OWNER check is additional]
[Source: src/lib/country.ts — isValidCountry()]

### 🎨 `MembershipPanel` Component

**File:** `src/components/app/settings/MembershipPanel.tsx`

Client Component (`'use client'`) using `useActionState` (React 19) or `useFormState` (React 18):

Key UX:
- Membership list as simple table: email | role badge | status badge
- Role badge: `Owner` (green) / `Editor` (blue)
- Status badge: `Active` (solid) / `Pending` (outline/muted)
- Invite form: single email input + submit button
- On success: show "Invitation sent to [email]!" toast or inline message
- On error: show error message below form

```typescript
'use client'
import { useActionState } from 'react'
import { inviteEditor } from './actions'   // NB: Server Action bound with country/slug

// The component receives pre-loaded memberships from the Server Component
// No client-side fetching needed
```

**⚠️ Server Action binding:** Since `inviteEditor` takes `country` and `slug` as extra params beyond formData, use `bind()` or pass via hidden form fields:

```typescript
// In page.tsx (Server Component) — bind country/slug before passing to Client Component
const boundInviteEditor = inviteEditor.bind(null, null, country, slug)
// Pass boundInviteEditor to MembershipPanel as a prop
```

Or use hidden inputs in the form and read from FormData inside the action. Choose the simpler approach.

[Source: src/components/app/auth/ManagePasskeysSection.tsx — similar Client Component pattern]
[Source: src/components/app/my-clubs/MyClubsList.tsx — list rendering pattern]

### 🔑 Error Page — New Error Codes

**File:** `src/app/auth/error/page.tsx` — add handling for new codes:

- `InviteExpired` → "This invitation has expired. Please ask the club owner to send a new invitation."
- `InviteEmailMismatch` → "This invitation was sent to a different email address. Please log out and try again, or ask the club owner to re-send."

[Source: src/app/auth/error/page.tsx — existing error code pattern]

### 🧪 Testing Notes

**Test framework:** Vitest. Run with `pnpm test`.

**Baseline:** 146 tests passing across 20 test files. Do not regress.

**Mocking pattern for `inviteEditor`:**
```typescript
vi.mock('@/server/auth', () => ({ getAuthSession: vi.fn() }))
vi.mock('@/server/db', () => ({
  prisma: {
    club: { findUnique: vi.fn() },
    clubMembership: { findFirst: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
    invitation: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn((ops) => Promise.all(ops)),
  },
}))
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn().mockResolvedValue(undefined) }))
```

**Key test cases for `invite-editor.test.ts`:**
- Unauthenticated → `{ success: false, code: 'UNAUTHORIZED' }`
- Authenticated but EDITOR role (not OWNER) → `{ success: false, code: 'FORBIDDEN' }`
- Invalid email → `{ success: false, code: 'VALIDATION_ERROR' }`
- Email already has ACTIVE or PENDING membership → `{ success: false, code: 'ALREADY_MEMBER' }`
- New user invite → user created, membership created (EDITOR/PENDING), invitation created, email sent → `{ success: true }`
- Existing user invite → membership created (EDITOR/PENDING), invitation created, email sent → `{ success: true }`

**Key test cases for `invite-accept.test.ts`:**
- No token → InviteExpired redirect
- Token not found in DB → InviteExpired redirect
- Token expired (`expiresAt` in past) → InviteExpired redirect
- Authenticated as correct user → membership activated, invitation deleted, redirect to /my-clubs
- Authenticated as different user → InviteEmailMismatch redirect
- Unauthenticated → invitation deleted, setup cookie set, redirect to /auth/setup

**Route Handler mock pattern (same as passkey tests):**
```typescript
vi.mock('next/headers', () => ({ cookies: vi.fn() }))
```

Use `NextRequest` from `next/server` to construct test requests:
```typescript
const req = new NextRequest('http://localhost:3000/auth/invite/accept?token=abc123')
```

**`setup-password.test.ts` addition:**
- Existing user with PENDING membership completing setup → `prisma.$transaction` called with `updateMany` for memberships → membership now ACTIVE

[Source: src/__tests__/passkey-register.test.ts — Route Handler testing pattern]
[Source: src/__tests__/setup-password.test.ts — existing setup test cases to not regress]

### 🔄 Previous Story Learnings (Stories 1.1–1.6)

1. **`getAuthSession()` not `getServerSession()`** — always use `getAuthSession()` in Server Components and Route Handlers [Source: src/server/auth.ts#getAuthSession]
2. **Prisma import path** — always `from '@/generated/prisma/client'` NOT `from '@prisma/client'` [Source: all previous stories]
3. **`await params` in App Router** — `params` is a Promise in Next.js 15/16; always `await params` when reading route params [Source: src/app/(country)/[country]/[club]/layout.tsx]
4. **`redirect()` throws** — do not wrap in try/catch; do not use inside Server Actions with typed return values [Source: src/app/auth/setup/actions.ts]
5. **Route Handler cookie pattern** — set cookies via `NextResponse.cookies.set()`, NOT via `cookies()` from next/headers, when setting on the response object [Source: src/app/auth/magic-link/route.ts]
6. **Cookie domain** — always include `domain: process.env.COOKIE_DOMAIN` when setting session cookies [Source: src/app/auth/login/actions.ts]
7. **`clubMembership` is NOT club-scoped** — no clubId enforcement needed via db middleware [Source: src/server/db.ts#CLUB_SCOPED_READ_MODELS, confirmed 1.4]
8. **`ClubMembership.@@unique([userId, clubId])`** — will throw unique constraint if trying to create duplicate; use upsert or pre-check [Source: prisma/schema.prisma]
9. **146 tests passing** — baseline; add new tests without breaking existing ones
10. **`prisma.$transaction([...])` takes an array** — array form (not callback form) for simple sequential writes [Source: src/app/api/auth/passkey/authenticate/complete/route.ts — M2+M3 fix]

### ⚙️ Git Intelligence (Recent Commits)

```
bdb0532 feat: story 1.6  — WebAuthn/passkey auth, simplewebauthn v13, 146 tests
6da7be2 feat: story 1.5  — operator auth, role-based redirect, 122 tests
b029766 feat: story 1.4  — /my-clubs, club membership guard, auth redirects
8765cfe feat: story 1.3  — magic link, password setup, TOTP, ADR-001
54292ff feat: story 1.2  — database schema + ClubMembership model
```

Pattern established: `createHash('sha256')` for token hashing (used in magic-link and now invitation), `prisma.$transaction([...])` for atomic writes, PENDING→ACTIVE membership state machine via Prisma.

### 📁 Project Structure — Files to Create/Modify

**New files:**
```
src/
  lib/
    email.ts                                        # Unified email sender (Resend/SMTP)
  app/
    (country)/[country]/[club]/
      settings/
        page.tsx                                    # Club settings page (OWNER only)
        actions.ts                                  # inviteEditor Server Action
    auth/
      invite/
        accept/
          route.ts                                  # GET — accept invite link handler
  components/
    app/
      settings/
        MembershipPanel.tsx                         # Membership list + invite form
  __tests__/
    invite-editor.test.ts                           # inviteEditor action tests
    invite-accept.test.ts                           # accept route tests
```

**Modified files:**
```
prisma/schema.prisma                               # Add Invitation model + Club.invitations relation
prisma/migrations/<timestamp>_add_invitation/      # New migration (auto-generated)
src/app/auth/setup/actions.ts                      # Wrap session creation in $transaction with membership activation
src/app/auth/error/page.tsx                        # Add InviteExpired + InviteEmailMismatch codes
src/app/(country)/[country]/[club]/page.tsx        # Add Settings link (OWNER only)
src/__tests__/setup-password.test.ts               # Add PENDING membership activation test
.env.example                                       # Verify SMTP/Resend vars present (already there)
_bmad-output/implementation-artifacts/sprint-status.yaml  # Update story status
```

**No changes needed:**
```
src/server/db.ts                                   # invitation not club-scoped; no CLUB_SCOPED_READ_MODELS change
src/server/auth.ts                                 # No auth changes needed
src/lib/setup-cookie.ts                            # Reused as-is
src/lib/crypto.ts                                  # Reused as-is
prisma/schema.prisma models User, ClubMembership   # Already have needed fields (invitedBy, joinedAt, PENDING status)
```

### 🔗 References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.7] — User story, acceptance criteria (7-day token TTL)
- [Source: _bmad-output/planning-artifacts/architecture.md#line 1311-1320] — Invitation flow, Invitation model design, 48h TTL (overridden by AC: 7 days)
- [Source: _bmad-output/planning-artifacts/architecture.md#line 919] — lib/email.ts planned location
- [Source: _bmad-output/planning-artifacts/architecture.md#line 1008] — Resend + Mailpit infrastructure
- [Source: prisma/schema.prisma#ClubMembership] — ClubMembership model (invitedBy, joinedAt, PENDING status already defined)
- [Source: prisma/schema.prisma#User] — User model (no clubId; memberships via ClubMembership)
- [Source: src/server/db.ts#CLUB_SCOPED_READ_MODELS] — clubMembership and invitation are NOT club-scoped
- [Source: src/app/auth/magic-link/route.ts] — Route Handler redirect + cookie pattern (NextResponse.cookies.set)
- [Source: src/lib/setup-cookie.ts] — encodeSetupCookie / SETUP_COOKIE_NAME (reused in accept route)
- [Source: src/app/auth/setup/actions.ts] — setupPassword to modify for PENDING membership activation
- [Source: src/app/auth/error/page.tsx] — Error page to extend with new codes
- [Source: src/app/(country)/[country]/[club]/layout.tsx] — Club layout guard pattern
- [Source: src/app/dev/magic-link/route.ts] — SHA-256 token hashing pattern for reference
- [Source: _bmad-output/implementation-artifacts/1-6-passkey-webauthn-authentication.md#previous learnings] — All prior learnings (await params, Prisma import, cookie domain, etc.)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_No blockers or debug issues encountered._

### Completion Notes List

- Implemented full invite-editor flow: Prisma `Invitation` model + migration, unified email sender (Resend/SMTP fallback), `inviteEditor` Server Action, GET accept-link route handler, atomic `setupPassword` transaction, club settings page with `MembershipPanel` component.
- `setupPassword` now wraps `user.update + session.create + clubMembership.updateMany` in a single `$transaction`. `updateMany` is a no-op when no PENDING memberships exist — zero regression risk.
- Accept route handles three paths: authenticated-as-invited-user (activate + redirect /my-clubs), authenticated-as-different-user (InviteEmailMismatch error), unauthenticated (setup cookie + redirect /auth/setup).
- Tests: 162 passing (16 new — 8 invite-editor, 7 invite-accept, 1 setup-password extension). Baseline was 146.
- nodemailer 8.0.1 installed (peer warning from @auth/core expecting ^7.x — pre-existing unrelated warning, does not affect functionality).

### File List

**New files:**
- `prisma/schema.prisma` (modified — added `Invitation` model + `Club.invitations` relation)
- `prisma/migrations/20260303150930_add_invitation/migration.sql`
- `src/lib/email.ts`
- `src/app/(country)/[country]/[club]/settings/actions.ts`
- `src/app/(country)/[country]/[club]/settings/page.tsx`
- `src/app/auth/invite/accept/route.ts`
- `src/components/app/settings/MembershipPanel.tsx`
- `src/__tests__/invite-editor.test.ts`
- `src/__tests__/invite-accept.test.ts`

**Modified files:**
- `src/app/auth/setup/actions.ts` (wrapped DB writes in `$transaction` with membership activation + invitation cleanup)
- `src/app/auth/error/page.tsx` (added `InviteExpired` + `InviteEmailMismatch` error codes)
- `src/app/(country)/[country]/[club]/page.tsx` (added Settings link for OWNER role)
- `src/app/auth/login/page.tsx` (added `callbackUrl` searchParam forwarding to `LoginForm`)
- `src/components/app/auth/LoginForm.tsx` (added `callbackUrl` prop support for post-login redirect)
- `src/__tests__/setup-password.test.ts` (updated mocks + added PENDING membership activation test)
- `package.json` / `pnpm-lock.yaml` (added `nodemailer`, `resend`, `@types/nodemailer`)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (status: in-progress)

**Additional files changed during adversarial code review fixes:**
- `src/lib/server/club-queries.ts` (new — `getClubBySlug` + `getClubOwnership` cached helpers)
- `src/lib/server/webauthn-queries.ts` (new — `getWebAuthnCredentialsByUser` helper)
- `src/app/(country)/[country]/[club]/layout.tsx` (uses `getClubBySlug`)
- `src/app/api/auth/passkey/authenticate/begin/route.ts` (uses `getWebAuthnCredentialsByUser`)
- `src/app/api/auth/passkey/register/begin/route.ts` (uses `getWebAuthnCredentialsByUser`)
- `src/__tests__/club-layout-guard.test.ts` (updated assertions for `getClubBySlug` select shape)
- `_bmad-output/planning-artifacts/architecture.md` (invitation TTL 48h → 7 days)
