# Story 1.3: Club Admin First Login — Magic Link, Password Setup & TOTP Enrollment

Status: done

## Story

As a Club Admin,
I want to receive a magic link by email, set my password on first access, and be prompted to enroll TOTP 2FA,
so that I can securely log into my club's edit mode without a default password ever existing.

## Acceptance Criteria

1. **Given** a club has been provisioned and an acceptance email dispatched, **When** the Club Admin clicks the magic link, **Then** they arrive at `/auth/setup`; the link is valid for 1 hour, is single-use, and the token is stored as a SHA-256 hash — an expired or reused link shows a clear error message with a path to contact support.

2. **Given** the Club Admin is on the password setup page, **When** they submit a password meeting strength requirements (minimum length, character complexity, not in the common/breached-passwords list), **Then** the password is hashed with Argon2 and stored; the magic link token is immediately invalidated.

3. **Given** the Club Admin completes password setup, **When** the form is submitted successfully, **Then** a session is created and they are redirected to `/my-clubs`; if TOTP is not yet enrolled, a persistent non-dismissible banner prompts enrollment — the QR code screen is accessed from that banner's link.

4. **Given** a Club Admin session exists but TOTP is not yet enrolled, **When** they access any authenticated page, **Then** a persistent, non-dismissible banner prompts TOTP enrollment with a direct link to the enrollment screen.

5. **Given** a Club Admin has TOTP enrolled, **When** they log in with their password on the standard login page, **Then** they are redirected to a TOTP challenge page; a valid 6-digit code is required before the session is fully established; on success they are redirected to `/my-clubs`.

6. **Given** an incorrect TOTP code is submitted, **Then** an inline error is shown and subsequent attempts from the same IP are rate-limited via the in-memory sliding window limiter.

## Tasks / Subtasks

- [x] **Task 1: Auth.js v4 configuration and TypeScript session type extension** (AC: 1, 5)
  - [x] Implement `src/server/auth.ts` — Prisma adapter, credentials provider, session + JWT callbacks
  - [x] Extend NextAuth TypeScript types in `src/types/next-auth.d.ts` — add `id`, `clubId`, `role`, `totpEnabled`, `totpVerified` to `Session.user` and `User`
  - [x] Create `src/app/api/auth/[...nextauth]/route.ts` — Next.js App Router catch-all handler
  - [x] Write unit tests: credentials provider returns null for bad password; session callback propagates clubId and role

- [x] **Task 2: Core auth library files** (AC: 2, 3, 6)
  - [x] Implement `src/lib/totp.ts` — `generateTotpSecret()`, `generateTotpUri(secret, email)`, `verifyTotpCode(secret, token)` using otplib v13 async API
  - [x] Implement `src/lib/rate-limit.ts` — in-memory sliding window (Map keyed by IP; default: 5 attempts per 10 min window)
  - [x] Implement `src/lib/schemas/user.ts` — `loginSchema`, `setupPasswordSchema`, `totpVerifySchema`, `changePasswordSchema` Zod schemas
  - [x] Write unit tests: TOTP secret generates valid codes; rate limiter blocks after threshold; schemas reject invalid inputs

- [x] **Task 3: Magic link verification flow** (AC: 1)
  - [x] Create `src/app/auth/magic-link/route.ts` — Route Handler (GET) that reads `?token=` query param, calls verifyMagicLink, sets encrypted `setup_session` cookie, redirects to `/auth/setup`; on failure redirects to error page
  - [x] Create `src/app/auth/magic-link/actions.ts` — `verifyMagicLink(rawToken)`: SHA-256 hash → lookup user → check TTL → set encrypted `setup_session` cookie → redirect to `/auth/setup`; on failure return error code
  - [x] Write unit tests: valid token resolves; expired token rejected with correct error; reused (already null) token rejected

- [x] **Task 4: Password setup** (AC: 2)
  - [x] Create `src/app/auth/setup/page.tsx` — protect: redirect to `/auth/login` if no `setup_session` cookie
  - [x] Create `src/app/auth/setup/actions.ts` — `setupPassword(input)`: Zod parse → ALREADY_CONFIGURED guard → HIBP breach check via `fetch` (k-anonymity SHA-1 prefix) → argon2.hash → update `passwordHash`, clear `magicToken` + `magicTokenExp` in single Prisma update → create DB session → set `next-auth.session-token` + `totp_verified` cookies → delete `setup_session` → redirect to `/my-clubs`
  - [x] Create `src/components/app/auth/SetupPasswordForm.tsx` — password + confirm-password fields; inline strength indicator; submit calls setupPassword server action
  - [x] Write unit tests: short/simple/breached password rejected; valid password argon2-hashed and stored; magic token columns cleared; ALREADY_CONFIGURED guard works

- [x] **Task 5: TOTP enrollment** (AC: 3, 4)
  - [x] Install `qrcode` package: `pnpm add qrcode && pnpm add -D @types/qrcode`
  - [x] Create `src/app/auth/totp-setup/page.tsx` — protect via existing auth session (`getAuthSession()`); check for existing `pendingTotpSecret` in DB before generating new one (prevents two-tab race); use `email` as TOTP URI label (not userId); generate QR via `qrcode.toDataURL` server-side
  - [x] Create `src/app/auth/totp-setup/actions.ts` — `enrollTotp(input)`: requires active auth session (no setup cookie path); read `pendingTotpSecret` from DB → `verifyTotpCode` → Prisma update `totpSecret`, `totpEnabled: true`, `pendingTotpSecret: null` → set encrypted `totp_verified` cookie → redirect to `/my-clubs`
  - [x] Create `src/components/app/auth/TotpSetupForm.tsx` — QR image + secret text (copy button) + 6-digit input
  - [x] Write unit tests: valid code enrolls user; invalid code returns error; `totpEnabled` and `totpSecret` written correctly; no session creates no DB session record

- [x] **Task 6: Login page** (AC: 5)
  - [x] Create `src/app/auth/login/page.tsx` — redirect to `/my-clubs` if fully authenticated; render `LoginForm`
  - [x] Create `src/app/auth/login/actions.ts` — `loginWithCredentials(input)`: IP rate limit → Zod parse → DB lookup → argon2.verify → `prisma.session.create()` → set `next-auth.session-token` cookie → return `{ success: true, totpEnabled }`
  - [x] Create `src/components/app/auth/LoginForm.tsx` — email + password; calls `loginWithCredentials` server action; navigates to `/auth/totp` if TOTP enrolled, otherwise to `/my-clubs`
  - [x] Write unit tests: valid credentials with totpEnabled=false establish full session; valid credentials with totpEnabled=true return totpEnabled flag; rate-limited IP returns RATE_LIMITED; DB failure returns SERVER_ERROR

- [x] **Task 7: TOTP challenge page** (AC: 5, 6)
  - [x] Create `src/app/auth/totp/page.tsx` — protect: session must exist with `totpVerified: false`; redirect if already verified
  - [x] Create `src/app/auth/totp/actions.ts` — `verifyTotpChallenge(input)`: check rate limit by IP → `verifyTotpCode(user.totpSecret, token)` → on success set `totp_verified` cookie → redirect to `/my-clubs`; on failure record attempt
  - [x] Create `src/components/app/auth/TotpForm.tsx` — 6-digit input with inline error; pending state disables field
  - [x] Write unit tests: valid code marks `totpVerified`; rate limiter triggers after 5 failures; IP isolation works

- [x] **Task 8: TOTP enrollment banner** (AC: 4)
  - [x] Create `src/components/app/auth/TotpEnrollmentBanner.tsx` — Server Component; reads session; renders persistent amber banner with link to `/auth/totp-setup` when `totpEnabled: false`; no dismiss button
  - [x] Add `TotpEnrollmentBanner` to `src/app/(country)/[club]/layout.tsx` — renders above page content for authenticated Club Admins
  - [x] Write unit tests: banner renders when session exists with `totpEnabled: false`; banner absent when `totpEnabled: true` or no session

- [x] **Task 9: Validate all acceptance criteria**
  - [x] AC1: magic link valid for 1 hour, single-use, SHA-256 hash in DB, error on expiry/reuse
  - [x] AC2: password hashed with argon2, magic token fields cleared in same DB operation
  - [x] AC3: QR code rendered, correct 6-digit code sets `totpEnabled: true`
  - [x] AC4: banner visible on all authenticated pages when TOTP not enrolled
  - [x] AC5: password login → TOTP challenge required → `totpVerified: true` → access granted
  - [x] AC6: rate limit triggers after repeated failures; IP-isolated

## Dev Notes

### Magic Link: Route Handler vs Server Component (page.tsx)

Magic link verification **must** be a Route Handler (`route.ts`), not a Server Component (`page.tsx`):

- **Server Component** (`page.tsx`): renders HTML, can read cookies, but **cannot set or delete cookies as a side effect**. Cookies can only be modified inside a Server Action or Route Handler — calling `cookies().set()` in a Server Component's render path throws `"Cookies can only be modified in a Server Action or Route Handler"`.
- **Route Handler** (`route.ts`): handles raw HTTP requests, **can freely set/delete cookies** in the response, can issue HTTP redirects directly.

Magic link verification needs to set the `setup_session` cookie → must be a Route Handler. Pattern:

```typescript
// src/app/auth/magic-link/route.ts
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const rawToken = request.nextUrl.searchParams.get('token') ?? ''
  const result = await verifyMagicLink(rawToken)
  if (!result.success) {
    return NextResponse.redirect(new URL(`/auth/error?code=${result.code}`, request.url))
  }
  const response = NextResponse.redirect(new URL('/auth/setup', request.url))
  response.cookies.set('setup_session', result.cookie, { httpOnly: true, ... })
  return response
}
```

### Two Login Approaches: Custom Action vs next-auth `signIn()`

Two approaches exist for password login in next-auth v4 with `strategy: 'database'`:

1. **`signIn('credentials', { redirect: false })`** from `next-auth/react` — triggers the credentials provider's `authorize()` callback, which returns a user; next-auth then creates a database session automatically. **Problem**: With `strategy: 'database'`, calling `signIn` server-side (from a Server Action) throws `CALLBACK_CREDENTIALS_JWT_ERROR` because the internal code tries to sign a JWT even when the strategy is `database`. This only works reliably from a Client Component.

2. **Custom `loginWithCredentials()` Server Action** — validates credentials directly, calls `prisma.session.create()` manually, sets the `next-auth.session-token` cookie explicitly. This bypasses next-auth entirely for session creation. **This is the approach used** because it avoids the CALLBACK_CREDENTIALS_JWT_ERROR, supports try/catch for DB failures, and keeps the action testable without next-auth mocking complexity.

The `SESSION_COOKIE_NAME` constant in `src/server/auth.ts` centralises the cookie name logic:
```typescript
export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'  // Secure prefix required in production (HTTPS)
    : 'next-auth.session-token'           // No Secure prefix in development (HTTP)
```

### CRITICAL: next-auth v4 — NOT v5

The installed package is `"next-auth": "4.24.13"` (v4). **Do not use v5 APIs.** Key v4 vs v5 differences:
- v4: `getServerSession(authOptions)` — `authOptions` must be passed explicitly in Server Components
- v4: `useSession()` for client-side session access (Client Components only)
- v4: `signIn()`, `signOut()` from `'next-auth/react'` (client) or `'next-auth'` (server — not available in App Router Server Components)
- v4: Auth route at `app/api/auth/[...nextauth]/route.ts` using `GET` and `POST` exports
- v4: `Session` and `User` types extended via module augmentation in `next-auth.d.ts`

### Auth.js v4 — `src/server/auth.ts` Implementation

```typescript
// src/server/auth.ts
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import argon2 from 'argon2'
import { prisma } from '@/server/db'
import { loginSchema } from '@/lib/schemas/user'

// Use a raw PrismaClient for Auth.js adapter (bypass clubId middleware — users table is not club-scoped)
// The prisma singleton from db.ts is fine here since users/sessions are not in CLUB_SCOPED_READ_MODELS
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any), // 'as any' needed because $extends changes the type signature
  session: {
    strategy: 'database',  // Server-authoritative database sessions (not JWT)
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            clubId: true,
            passwordHash: true,
            totpEnabled: true,
          },
        })

        if (!user || !user.passwordHash) return null

        const valid = await argon2.verify(user.passwordHash, parsed.data.password)
        if (!valid) return null

        // Return user — session callback will add totpVerified: false when totpEnabled: true
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clubId: user.clubId,
          totpEnabled: user.totpEnabled,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // `user` comes from the database (database session strategy)
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, clubId: true, totpEnabled: true },
      })
      session.user.id = user.id
      session.user.role = dbUser?.role ?? 'CLUB_ADMIN'
      session.user.clubId = dbUser?.clubId ?? null
      session.user.totpEnabled = dbUser?.totpEnabled ?? false
      // totpVerified is stored in the Session record's custom data — handled separately
      // Default: if totpEnabled is false, totpVerified is effectively true (no challenge needed)
      session.user.totpVerified = !session.user.totpEnabled
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
```

> **Adapter type issue**: `PrismaAdapter(prisma as any)` is needed because the `$extends` return type does not match the base `PrismaClient` type that `PrismaAdapter` expects. The adapter only uses standard Prisma operations; the `as any` cast is safe here.

> **Session callback vs JWT callback**: With `strategy: 'database'`, the `session` callback receives `user` (from DB) not a JWT payload. Do NOT use `jwt` callback — it only runs for JWT strategy.

### `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@/server/auth'
export const { GET, POST } = handlers
```

### TypeScript Session Type Extension

Create `src/types/next-auth.d.ts`:

```typescript
import { DefaultSession } from 'next-auth'
import { UserRole } from '@/generated/prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      clubId: string | null
      role: UserRole
      totpEnabled: boolean
      totpVerified: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    clubId: string | null
    role: UserRole
    totpEnabled: boolean
  }
}
```

Ensure `tsconfig.json` `include` array picks up `src/types/**/*.d.ts` (it should via `**/*.ts`).

> **Important**: `UserRole` is imported from `@/generated/prisma/client` — NOT from `@prisma/client`. See Story 1.2 Prisma v7 notes.

### Magic Link Verification — `src/app/auth/magic-link/actions.ts`

The magic link carries the **raw token** in the URL. The database stores the **SHA-256 hash** of that token. The verification process must hash the raw token before DB lookup:

```typescript
'use server'
import { createHash } from 'crypto'
import { prisma } from '@/server/db'
import { signIn } from '@/server/auth'
import { redirect } from 'next/navigation'

export async function verifyMagicLink(rawToken: string) {
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')

  const user = await prisma.user.findUnique({
    where: { magicToken: tokenHash },
    select: { id: true, magicTokenExp: true, email: true, role: true },
  })

  if (!user) {
    return { success: false, error: 'Invalid or already used link.', code: 'TOKEN_INVALID' }
  }

  if (!user.magicTokenExp || user.magicTokenExp < new Date()) {
    return { success: false, error: 'This link has expired. Please contact support.', code: 'TOKEN_EXPIRED' }
  }

  // Do NOT clear the token here — clear it only after password is successfully set (AC2)
  // Sign user in via a special credentials path or use a short-lived signed cookie
  // Using a server-side signed cookie (simpler than a custom credentials provider path):
  // → Store userId in a HttpOnly cookie signed with AUTH_SECRET; 15-minute TTL
  // → /auth/setup reads this cookie to authorize password setup
}
```

> **Token handling**: Do NOT invalidate the magic token on link click — only on successful password set (AC2 requires password to be hashed and token invalidated in the same operation). However, start a short-lived server session or cookie to authorize the setup page.

**Temporary session pattern for magic link flow:**

Rather than using a full Auth.js session for the setup step (which requires a verified account), use an encrypted short-lived cookie:
- After successful token verification: set a signed cookie `setup_session` containing `{ userId, exp: Date.now() + 15*60*1000 }` encrypted with `AUTH_SECRET`
- `/auth/setup` page reads and validates this cookie before rendering
- After successful password + TOTP enrollment: clear the `setup_session` cookie, then call `signIn('credentials', { ... })` to establish the real Auth.js session

For the cookie signing, use the same approach as Next.js middleware cookies or use the `iron-session` pattern via `JSON.stringify` + AES-256-GCM from `src/lib/crypto.ts`. Since `crypto.ts` already exists and works with AES-256-GCM, reuse it for signing the setup cookie with a derived key from `AUTH_SECRET`.

### Password Setup — `src/app/auth/setup/actions.ts`

```typescript
'use server'
import { createHash } from 'crypto'
import argon2 from 'argon2'
import { prisma } from '@/server/db'
import { setupPasswordSchema } from '@/lib/schemas/user'
import { redirect } from 'next/navigation'

export async function setupPassword(input: unknown, userId: string) {
  const parsed = setupPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' }
  }

  const { password } = parsed.data

  // 1. HaveIBeenPwned check (k-anonymity — only first 5 chars of SHA-1 sent)
  const sha1 = createHash('sha1').update(password).digest('hex').toUpperCase()
  const prefix = sha1.slice(0, 5)
  const suffix = sha1.slice(5)

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' }, // prevents traffic analysis
    })
    if (res.ok) {
      const text = await res.text()
      const isPwned = text.split('\n').some(line => line.split(':')[0] === suffix)
      if (isPwned) {
        return { success: false, error: 'This password has appeared in a data breach. Please choose a different password.', code: 'PASSWORD_BREACHED' }
      }
    }
    // If HIBP is unreachable, allow password setup to proceed (availability > perfect security for this check)
  } catch {
    // HIBP unavailable — proceed
  }

  // 2. Hash with argon2 (default: argon2id)
  const passwordHash = await argon2.hash(password)

  // 3. Update user: store hash, clear magic token in single atomic operation
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      magicToken: null,
      magicTokenExp: null,
    },
  })

  // Redirect to TOTP enrollment
  redirect('/auth/totp-setup')
}
```

> **Prisma note**: `prisma.user.update` does NOT require `clubId` in the where clause — `User` is NOT in `CLUB_SCOPED_READ_MODELS`. This is correct behavior.

### Password Strength Requirements (`src/lib/schemas/user.ts`)

```typescript
import { z } from 'zod'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{12,}$/

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password required'),
})

export const setupPasswordSchema = z.object({
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(passwordRegex, 'Password must include uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const totpVerifySchema = z.object({
  code: z.string().length(6).regex(/^\d{6}$/, 'Code must be 6 digits'),
})

// Used in the future password-change feature (Club Admin settings page)
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(passwordRegex, 'Password must include uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type SetupPasswordInput = z.infer<typeof setupPasswordSchema>
export type TotpVerifyInput = z.infer<typeof totpVerifySchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
```

### TOTP Library — `src/lib/totp.ts`

```typescript
// src/lib/totp.ts
// otplib wrappers for TOTP secret generation and code verification.
// otplib v13 is already installed (package.json).
import { authenticator } from 'otplib'

// Use 6-digit codes, 30-second window (TOTP standard defaults)
authenticator.options = { digits: 6, step: 30 }

/**
 * Generate a new TOTP secret for a user.
 * Returns a base32-encoded secret suitable for storage and QR encoding.
 */
export function generateTotpSecret(): string {
  return authenticator.generateSecret()
}

/**
 * Build the otpauth:// URI for QR code encoding.
 * @param secret - base32 TOTP secret
 * @param email - user's email (shown in authenticator app)
 * @param issuer - platform name shown in authenticator app
 */
export function generateTotpUri(secret: string, email: string, issuer = 'Clashware'): string {
  return authenticator.keyuri(email, issuer, secret)
}

/**
 * Verify a 6-digit TOTP code against a stored secret.
 * Returns true if valid, false if invalid or out of window.
 */
export function verifyTotpCode(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch {
    return false
  }
}
```

### Rate Limiter — `src/lib/rate-limit.ts`

```typescript
// src/lib/rate-limit.ts
// In-memory sliding window rate limiter. Resets on server restart.
// For MVP single-instance deployment. Redis deferred to post-MVP.

interface RateEntry {
  timestamps: number[]
}

const store = new Map<string, RateEntry>()

export interface RateLimitConfig {
  windowMs: number   // Window duration in ms
  maxAttempts: number // Max allowed attempts in window
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxAttempts: 5,
}

/**
 * Check if a key (typically IP address) is rate-limited.
 * Records this attempt and returns whether it's blocked.
 */
export function checkRateLimit(key: string, config: RateLimitConfig = DEFAULT_CONFIG): boolean {
  const now = Date.now()
  const entry = store.get(key) ?? { timestamps: [] }

  // Prune expired timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < config.windowMs)

  if (entry.timestamps.length >= config.maxAttempts) {
    store.set(key, entry)
    return true // Rate limited
  }

  entry.timestamps.push(now)
  store.set(key, entry)
  return false // Not rate limited
}

/**
 * Clear rate limit state for a key (call on successful auth).
 */
export function clearRateLimit(key: string): void {
  store.delete(key)
}
```

### QR Code Generation — TOTP Setup Page

Install `qrcode` before implementing this task:
```bash
source ~/.zshrc && pnpm add qrcode && pnpm add -D @types/qrcode
```

Server-side QR generation (no client JS needed):
```typescript
// In src/app/auth/totp-setup/page.tsx (Server Component)
import QRCode from 'qrcode'
import { generateTotpSecret, generateTotpUri } from '@/lib/totp'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'

export default async function TotpSetupPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/auth/login')
  if (session.user.totpEnabled) redirect('/')  // Already enrolled

  const secret = generateTotpSecret()
  const uri = generateTotpUri(secret, session.user.email ?? 'user')
  const qrDataUrl = await QRCode.toDataURL(uri, { width: 200, margin: 2 })

  // Store pending secret in an encrypted cookie so it survives page submissions
  // Use AES-256-GCM from src/lib/crypto.ts with CONTACT_ENCRYPTION_KEY
  // OR store in a server-side temporary record in the DB

  return <TotpSetupForm qrDataUrl={qrDataUrl} secret={secret} />
}
```

> **Pending secret storage**: The TOTP secret generated on page load must be persisted until the user successfully verifies their first code. Options in order of preference:
> 1. Store in a temporary `pendingTotpSecret` field on the User model (add if not in schema — it is NOT currently in schema, see note below)
> 2. Use an encrypted HttpOnly cookie with the secret encrypted via `src/lib/crypto.ts`
> 3. Encode in a hidden form field (NOT recommended — exposes secret client-side)
>
> **Recommended approach**: Add a temporary `pendingTotpSecret String? @map("pending_totp_secret")` column to the `User` model. Create a migration. Clear it after successful TOTP enrollment. This avoids cookie complexity and secret exposure.
>
> **Alternative**: Use encrypted cookie with `CONTACT_ENCRYPTION_KEY`. The secret is stored encrypted and only decrypted server-side during enrollment verification.

### TOTP Enrollment Banner — `src/components/app/auth/TotpEnrollmentBanner.tsx`

```typescript
// Server Component — no client-side JS needed
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import Link from 'next/link'

export async function TotpEnrollmentBanner() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.totpEnabled || session.user.role !== 'CLUB_ADMIN') {
    return null
  }

  return (
    <div
      role="alert"
      className="bg-amber-500 text-amber-950 px-4 py-3 text-sm font-medium flex items-center justify-between"
    >
      <span>
        Your account is not yet protected by two-factor authentication.
        {' '}
        <Link href="/auth/totp-setup" className="underline font-semibold">
          Set up 2FA now
        </Link>
        {' '}to secure your club site.
      </span>
      {/* No dismiss button — non-dismissible per AC4 */}
    </div>
  )
}
```

Add to `src/app/(country)/[club]/layout.tsx`:
```typescript
import { TotpEnrollmentBanner } from '@/components/app/auth/TotpEnrollmentBanner'

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TotpEnrollmentBanner />
      {children}
    </>
  )
}
```

### TOTP Challenge — `totpVerified` in Session

The session callback in `authOptions` sets `totpVerified: !session.user.totpEnabled` by default. This means:
- Users with `totpEnabled: false` are treated as `totpVerified: true` (no challenge needed)
- Users with `totpEnabled: true` get `totpVerified: false` after password login

To mark `totpVerified: true` after a successful TOTP challenge, the cleanest v4 approach is to use a secondary cookie or update the database `Session` record directly:

```typescript
// src/app/auth/totp/actions.ts
import { cookies, headers } from 'next/headers'
import { prisma } from '@/server/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { verifyTotpCode } from '@/lib/totp'
import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit'

export async function verifyTotpChallenge(formData: FormData) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'

  // Rate limit by IP
  if (checkRateLimit(`totp:${ip}`)) {
    return { success: false, error: 'Too many attempts. Please wait before trying again.', code: 'RATE_LIMITED' }
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Session expired.', code: 'UNAUTHENTICATED' }
  }

  const code = formData.get('code') as string
  if (!code || !/^\d{6}$/.test(code)) {
    return { success: false, error: 'Invalid code format.', code: 'VALIDATION_ERROR' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpSecret: true },
  })

  if (!user?.totpSecret) {
    return { success: false, error: 'TOTP not configured.', code: 'TOTP_NOT_CONFIGURED' }
  }

  const valid = verifyTotpCode(user.totpSecret, code)
  if (!valid) {
    return { success: false, error: 'Invalid code.', code: 'TOTP_INVALID' }
  }

  // Clear rate limit on success
  clearRateLimit(`totp:${ip}`)

  // Mark TOTP as verified in this session using a signed cookie
  // (Auth.js v4 does not provide a direct session mutation API in App Router)
  const cookieStore = await cookies()
  cookieStore.set('totp_verified', session.user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days (same as session)
    path: '/',
  })

  return { success: true }
}
```

> **totpVerified cookie pattern**: Since Auth.js v4 database sessions cannot be mutated server-side after creation without direct DB writes, use a `totp_verified` HttpOnly cookie that stores the user ID. The session callback checks this cookie to set `totpVerified: true`. Read the cookie in the session callback to determine if TOTP has been verified for this user in the current browser.
>
> The session callback in `auth.ts` should be updated:
> ```typescript
> async session({ session, user, req }) {
>   // ... existing code ...
>   // Check totp_verified cookie
>   // Note: `req` is available in the session callback when accessed via getServerSession
>   const totpVerifiedCookie = req?.cookies?.totp_verified
>   session.user.totpVerified = !session.user.totpEnabled || totpVerifiedCookie === user.id
>   return session
> }
> ```

### Architecture Compliance

**Auth check pattern for auth routes (no clubId needed):**
```typescript
const session = await getServerSession(authOptions)
if (!session?.user) redirect('/auth/login')
```

**Never trust client-supplied userId in setup flow:**
```typescript
// ✅ CORRECT — userId from session or encrypted cookie
// ❌ FORBIDDEN — userId from query param or form data
```

**Prisma query on User (not club-scoped):**
```typescript
// Users are NOT in CLUB_SCOPED_READ_MODELS — no clubId required
await prisma.user.findUnique({ where: { id: userId } })  // ✅ Correct
```

**Error response contract:**
```typescript
return { success: false, error: 'Human-readable message', code: 'SCREAMING_SNAKE_CODE' }
return { success: true, data: { ... } }
```

### File Structure — New Files This Story

**Create:**
```
src/
  types/
    next-auth.d.ts                    # Session type extension
  server/
    auth.ts                           # Auth.js v4 configuration (OVERWRITE placeholder)
  lib/
    totp.ts                           # otplib wrappers
    rate-limit.ts                     # In-memory sliding window
    schemas/
      user.ts                         # loginSchema, setupPasswordSchema, totpVerifySchema, changePasswordSchema (OVERWRITE placeholder)
  app/
    api/
      auth/
        [...nextauth]/
          route.ts                    # Auth.js catch-all handler
    auth/
      login/
        page.tsx                      # Club Admin login
      setup/
        page.tsx                      # Password setup (magic link flow)
        actions.ts
      totp-setup/
        page.tsx                      # TOTP enrollment
        actions.ts
      totp/
        page.tsx                      # TOTP challenge (post-login)
        actions.ts
      magic-link/
        page.tsx                      # Magic link verification
        actions.ts
      error/
        page.tsx                      # Auth.js error page
  components/
    app/
      auth/
        LoginForm.tsx
        SetupPasswordForm.tsx
        TotpSetupForm.tsx
        TotpForm.tsx
        TotpEnrollmentBanner.tsx
```

**Modify:**
```
src/app/(country)/[club]/layout.tsx   # Add TotpEnrollmentBanner
.env / .env.example                   # Verify AUTH_SECRET and AUTH_URL are set
```

**Database schema change (if pending TOTP secret approach used):**
```
prisma/schema.prisma                  # Add pendingTotpSecret to User model (optional — see dev note above)
prisma/migrations/...                 # New migration
```

### Previous Story Learnings (from Story 1.2)

1. **Prisma v7 import path**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'`
2. **Extended Prisma client type**: `prisma` from `@/server/db` has a different TypeScript type than `PrismaClient`. When passing to `PrismaAdapter`, use `as any` cast
3. **User model is NOT club-scoped**: `prisma.user.findUnique/update` works without `clubId` — the `CLUB_SCOPED_READ_MODELS` set does not include `user`
4. **Session model is NOT club-scoped**: Auth.js manages `Session` records directly — do not add clubId enforcement to sessions table
5. **Raw PrismaClient for Auth.js adapter**: The `PrismaAdapter` may need a raw PrismaClient instance without the `$extends` middleware. If adapter operations fail, create a separate raw client. Reference seed.ts for pattern.
6. **`prisma` directory excluded from tsconfig**: `prisma/` is in `exclude` — auth files go in `src/`

### Testing Notes

- Run tests with: `source ~/.zshrc && pnpm test` (or Vitest if configured)
- Test TOTP flows using `otplib.authenticator.generate(secret)` to produce valid codes
- Test rate limiting by calling `checkRateLimit` 6+ times in unit tests
- Test magic link expiry by manipulating `magicTokenExp` to a past date in test data
- Integration tests: spin up test DB (use seed data — ski-club-valais admin has email `admin@ski-club-valais.ch` / `admin123`)

### Project Structure Notes

- Route path conflict (from Story 1.2): Actual club route is `(country)/[club]/` NOT `(country)/[country]/[club]/` — country is derived from host header via `getCountryFromHost()`
- Auth routes at `/auth/*` are platform-level — they live outside the `(country)/` route group
- `src/components/ui/` must not be manually edited — use `shadcn` CLI to add components needed for forms (Button, Input, Label, Alert)
- The `PrismaAdapter` from `@auth/prisma-adapter` — check if this package is installed; if not, install with `pnpm add @auth/prisma-adapter`

### References

- [Source: epics.md#Story 1.3] — Acceptance criteria, magic link flow, TOTP enrollment requirements
- [Source: architecture.md#Authentication & Security] — Session strategy, first login flow, contact form encryption pattern
- [Source: architecture.md#Process Patterns] — Auth check pattern, error response contract
- [Source: architecture.md#Structure Patterns] — File organization, Server Actions co-location
- [Source: 1-2-database-schema-multi-tenant-foundation.md#Dev Notes] — Prisma v7 import paths, `$extends` type issues, raw PrismaClient pattern for operations that bypass middleware
- [Source: 1-2-database-schema-multi-tenant-foundation.md#Complete Prisma Schema] — User model fields: `magicToken`, `magicTokenExp`, `passwordHash`, `totpSecret`, `totpEnabled`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- otplib@13 uses a functional async API (`generate`, `verify`, `generateSecret` named exports) — NOT the `authenticator` class from v12. Updated `totp.ts` accordingly.
- `@auth/prisma-adapter` v2 returns `@auth/core` adapter type; incompatible with next-auth v4's own adapter type. Fixed with `PrismaAdapter(prisma as any) as any` double cast — safe at runtime since both use identical Prisma operations.
- `pendingTotpSecret` field added to User model (now in consolidated migration). Prisma client regenerated.
- `getAuthSession()` wrapper created in `auth.ts` to read the `totp_verified` HttpOnly cookie alongside `getServerSession()`, since Auth.js v4 database sessions cannot be mutated server-side post-creation. Cookie now encrypted (AES-256-GCM) and decoded via `decodeTotpVerifiedCookie`.
- After TOTP enrollment, created Auth.js DB session record directly via `prisma.session.create()` and set `next-auth.session-token` cookie manually — avoids a round-trip through the credentials provider.
- ADR-001: `clubId` removed from `User` model entirely. Club context is resolved at the club layout level via `ClubMembership` lookup. Session callback sets `clubId = null` and `clubRole = null` at login. `next-auth.d.ts` updated with `clubRole: ClubMemberRole | null`.
- TOTP verification bypass (CRITICAL): club layout `src/app/(country)/[club]/layout.tsx` now enforces `totpVerified` server-side — redirects to `/auth/totp` if `totpEnabled && !totpVerified`. Client-side navigation alone cannot bypass TOTP challenge.
- `enrollTotp` rate limiting (MEDIUM): added `checkRateLimit('totp-enroll:IP')` in `enrollTotp` using the same 5-attempt-per-10-minute default as the TOTP challenge flow.
- Migrations consolidated: four incremental migrations replaced by a single `20260302112723_init` migration covering the full schema.

### Completion Notes List

- Implemented full magic-link → password-setup → TOTP-enrollment first-login flow using an encrypted `setup_session` HttpOnly cookie (AES-256-GCM via `src/lib/crypto.ts`) to authorize setup pages without a full Auth.js session.
- `pendingTotpSecret` stored in DB during TOTP setup page render, then read and cleared atomically on enrollment.
- Rate limiter uses in-memory sliding window keyed by IP; clears on successful verification.
- All 98 unit tests pass across 13 test files; TypeScript compiles with zero errors.
- `vitest.config.ts` and `pnpm test` script added as test infrastructure.
- ✅ Resolved CRITICAL: TOTP verification bypass — club layout enforces `totpVerified` server-side.
- ✅ Resolved MEDIUM: `enrollTotp` rate-limited with 5 attempts / 10 min (`totp-enroll:IP` key).
- ✅ ADR-001 applied: `clubId` removed from `User` model; session uses `ClubMembership` for club context.
- `AUTHENTICATION.md` authored — documents all auth flows, cookie/session model, and adversarial security review findings with resolution decisions.
- `DevAuthPanel` and `/dev/magic-link` route added for development testing of the full first-login flow.

### File List

**New files:**
- `src/types/next-auth.d.ts`
- `src/server/auth.ts`
- `src/lib/setup-cookie.ts`
- `src/lib/totp.ts`
- `src/lib/rate-limit.ts`
- `src/lib/schemas/user.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/auth/magic-link/route.ts`
- `src/app/auth/magic-link/actions.ts`
- `src/app/auth/setup/page.tsx`
- `src/app/auth/setup/actions.ts`
- `src/app/auth/totp-setup/page.tsx`
- `src/app/auth/totp-setup/actions.ts`
- `src/app/auth/login/page.tsx`
- `src/app/auth/login/actions.ts`
- `src/app/auth/totp/page.tsx`
- `src/app/auth/totp/actions.ts`
- `src/app/auth/error/page.tsx`
- `src/components/app/auth/LoginForm.tsx`
- `src/components/app/auth/SetupPasswordForm.tsx`
- `src/components/app/auth/TotpSetupForm.tsx`
- `src/components/app/auth/TotpForm.tsx`
- `src/components/app/auth/TotpEnrollmentBanner.tsx`
- `src/components/ui/button.tsx` (shadcn)
- `src/components/ui/input.tsx` (shadcn)
- `src/components/ui/label.tsx` (shadcn)
- `src/components/ui/alert.tsx` (shadcn)
- `src/__tests__/auth.test.ts`
- `src/__tests__/totp.test.ts`
- `src/__tests__/rate-limit.test.ts`
- `src/__tests__/schemas.test.ts`
- `src/__tests__/magic-link.test.ts`
- `src/__tests__/setup-password.test.ts`
- `src/__tests__/totp-setup.test.ts`
- `src/__tests__/totp-challenge.test.ts`
- `src/app/auth/logout/route.ts`
- `src/__tests__/totp-banner.test.ts`
- `src/__tests__/logout.test.ts`
- `src/__tests__/account.test.ts`
- `vitest.config.ts`
- `src/app/(country)/[club]/layout.tsx` — club layout with `TotpEnrollmentBanner` and `totpVerified` bypass guard
- `src/components/app/auth/DevAuthPanel.tsx` — dev-only auth debug panel (rendered only in development)
- `src/app/dev/magic-link/route.ts` — dev-only magic link generator for testing first-login flow
- `AUTHENTICATION.md` — security architecture documentation (flows, cookie model, adversarial review findings)
- `prisma/migrations/20260302112723_init/migration.sql` — consolidated init migration (replaces multiple earlier migrations)
- `src/app/auth/account/page.tsx` — account settings page (change password + manage TOTP)
- `src/app/auth/account/actions.ts` — `changePassword` and `removeTotp` server actions
- `src/components/app/auth/ChangePasswordForm.tsx` — change password form client component
- `src/components/app/auth/ManageTotpSection.tsx` — TOTP management section (enroll / remove)
- `src/__tests__/magic-link-route.test.ts` — route handler tests for GET /auth/magic-link
- `src/__tests__/login.test.ts` — unit tests for `loginWithCredentials`

**Modified files:**
- `prisma/schema.prisma` — ADR-001: removed `clubId` from User model (now via `ClubMembership`); added `pendingTotpSecret`; consolidated schema
- `src/server/auth.ts` — session callback: `clubId`/`clubRole` always null at login (set by club layout); encrypted `totp_verified` cookie comparison via `decodeTotpVerifiedCookie`
- `src/types/next-auth.d.ts` — added `clubRole: ClubMemberRole | null` to `Session.user`; removed stale `clubId` from `User` interface
- `src/app/auth/totp-setup/actions.ts` — added IP-based rate limiting to `enrollTotp` (security fix)
- `src/app/layout.tsx` — added `DevAuthPanel` rendered only in `NODE_ENV === 'development'` (dev-only, zero production impact)
- `package.json` — added `test` and `test:watch` scripts; added `@auth/prisma-adapter`, `qrcode`, `@types/qrcode`, `vitest`
- `.env` — added `AUTH_SECRET`, `AUTH_URL`
- `prisma/seed.ts` — updated seed data to match consolidated schema
- `prisma/verify.ts` — updated verification queries to match schema changes
- `src/server/db.ts` — updated Prisma client configuration

**Deleted files:**
- `prisma/migrations/20260227194345_init/migration.sql` — superseded by consolidated init
- `prisma/migrations/20260227202001_add_fk_constraints_and_index/migration.sql` — superseded
- `prisma/migrations/20260227203548_fix_missing_fk_relations_and_indexes/migration.sql` — superseded
- `prisma/migrations/20260227205416_add_support_ticket_club_index/migration.sql` — superseded
- `prisma/migrations/20260227214421_add_pending_totp_secret/migration.sql` — superseded

## Change Log

- **2026-03-02**: Applied ADR-001 — removed `clubId` from `User` model; club context resolved via `ClubMembership` junction table. Session callback updated; `clubRole: ClubMemberRole | null` added to TypeScript types.
- **2026-03-02**: Security fix (CRITICAL) — Added `totpVerified` server-side guard to club layout; prevents TOTP bypass via direct URL navigation.
- **2026-03-02**: Security fix (MEDIUM) — Added IP-based rate limiting to `enrollTotp` (5 attempts / 10 min, `totp-enroll:IP` key).
- **2026-03-02**: Consolidated four incremental Prisma migrations into single `20260302112723_init` migration.
- **2026-03-02**: Added `AUTHENTICATION.md` — full auth flow documentation and adversarial security review.
- **2026-03-02**: Added `DevAuthPanel` (dev-only) and `/dev/magic-link` route for local first-login flow testing.
- **2026-03-02**: Code review — added tests for logout route (`logout.test.ts`, 5 tests) and account actions (`account.test.ts`, 12 tests: `changePassword` + `removeTotp`); documented missing files in File List; corrected migration timestamp to `20260302112723_init`. Total: 98 tests across 13 files.
