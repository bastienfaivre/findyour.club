# Story 1.6: Passkey (WebAuthn) Authentication

Status: done

## Story

As a Club Admin or Platform Operator,
I want to register and use a passkey (biometrics or hardware security key) as an authentication method,
so that I have a phishing-resistant, passwordless login option that also satisfies the 2FA requirement.

## Acceptance Criteria

1. **Given** an authenticated user in their account settings (`/auth/account`), **When** they initiate passkey registration, **Then** the browser presents a WebAuthn credential creation prompt; on success the credential is stored in the `webauthn_credentials` table linked to the user account via `@simplewebauthn/server`.

2. **Given** a registered passkey credential, **When** the user selects "Sign in with passkey" on the login page (`/auth/login`), **Then** the browser prompts for the registered authenticator; a valid challenge response establishes a full session (SESSION_COOKIE_NAME + totp_verified cookie set) without a separate TOTP step — passkey satisfies the MFA requirement.

3. **Given** passkey authentication is unavailable (unsupported browser, no registered credential, or user dismisses the prompt), **When** the user visits the login page, **Then** the existing password + TOTP flow remains available as the primary fallback — no regression.

4. **Given** a user account with a registered passkey, **When** the credential is removed from account settings, **Then** the `WebauthnCredential` record is deleted from the database and can no longer be used to authenticate.

## Tasks / Subtasks

- [x] Task 1: Create `src/lib/webauthn.ts` helper library (AC: #1, #2)
  - [x] 1.1 Implement `getWebAuthnConfig()` helper reading `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME`, `WEBAUTHN_ORIGIN` env vars with localhost defaults
  - [x] 1.2 Implement `encodeChallengeCookie(challenge)` and `decodeChallengeCookie(value)` using `lib/crypto.ts` AES-256-GCM (same pattern as `encodeTotpVerifiedCookie`)
  - [x] 1.3 Export shared types: `StoredWebAuthnCredential` matching `WebauthnCredential` schema fields

- [x] Task 2: Registration Route Handlers (AC: #1)
  - [x] 2.1 Create `src/app/api/auth/passkey/register/begin/route.ts` (POST) — requires authenticated session; calls `generateRegistrationOptions`, stores challenge in `passkey_challenge` HttpOnly cookie, returns options JSON
  - [x] 2.2 Create `src/app/api/auth/passkey/register/complete/route.ts` (POST) — reads and clears challenge cookie; calls `verifyRegistrationResponse`; creates `WebauthnCredential` record via `prisma.webauthnCredential.create()`; returns `{ success: true }`

- [x] Task 3: Authentication Route Handlers (AC: #2)
  - [x] 3.1 Create `src/app/api/auth/passkey/authenticate/begin/route.ts` (POST) — public endpoint; accepts optional `email` body param; calls `generateAuthenticationOptions`; stores challenge in `passkey_challenge` cookie; returns options JSON
  - [x] 3.2 Create `src/app/api/auth/passkey/authenticate/complete/route.ts` (POST) — reads and clears challenge cookie; looks up credential by `credentialId`; calls `verifyAuthenticationResponse`; on success: updates credential counter, creates session via `prisma.session.create()`, sets `SESSION_COOKIE_NAME` + `totp_verified` cookies; returns `{ success: true, role }`

- [x] Task 4: Passkey removal Server Action (AC: #4)
  - [x] 4.1 Add `deletePasskey(credentialId)` Server Action to `src/app/auth/passkey/actions.ts` — requires authenticated session; calls `prisma.webauthnCredential.deleteMany({ where: { credentialId, userId: session.user.id } })`

- [x] Task 5: UI — ManagePasskeysSection (AC: #1, #4)
  - [x] 5.1 Create `src/components/app/auth/ManagePasskeysSection.tsx` (Client Component) — lists existing passkeys (name/created date), "Add passkey" button calling `/api/auth/passkey/register/begin` + `startRegistration` then `/api/auth/passkey/register/complete`, "Remove" button per passkey calling `deletePasskey`
  - [x] 5.2 Update `src/app/auth/account/page.tsx` to query `prisma.webauthnCredential.findMany({ where: { userId: session.user.id } })` and pass results to `<ManagePasskeysSection>`

- [x] Task 6: UI — PasskeyButton on login page (AC: #2, #3)
  - [x] 6.1 Create `src/components/app/auth/PasskeyButton.tsx` (Client Component) — "Sign in with passkey" button; calls `/api/auth/passkey/authenticate/begin`, then `startAuthentication`, then `/api/auth/passkey/authenticate/complete`; on success redirects based on returned `role` (OPERATOR → `/admin`, CLUB_ADMIN → `/my-clubs`)
  - [x] 6.2 Update `src/app/auth/login/page.tsx` to render `<PasskeyButton />` below `<LoginForm />` with a visual separator

- [x] Task 7: Environment variables (AC: #1, #2)
  - [x] 7.1 Add `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME`, `WEBAUTHN_ORIGIN` to `.env.example` with localhost defaults

- [x] Task 8: Tests (AC: all)
  - [x] 8.1 Create `src/__tests__/passkey-register.test.ts` — test begin (unauthenticated → 401, authenticated → options returned + cookie set) and complete (no cookie → error, invalid response → error, success → credential stored)
  - [x] 8.2 Create `src/__tests__/passkey-authenticate.test.ts` — test begin (returns options + cookie), complete (no cookie → error, credential not found → error, invalid response → error, success → session created + cookies set + role returned)
  - [x] 8.3 Create `src/__tests__/passkey-actions.test.ts` — test `deletePasskey` (unauthenticated → error, wrong userId → no-op, success → credential deleted)
  - [x] 8.4 Run `pnpm test` — all tests pass (no regressions)

## Dev Notes

### 📦 Library Versions — Already Installed

Both packages are already in `package.json` and installed:

```
@simplewebauthn/server: 13.2.3
@simplewebauthn/browser: 13.2.2
```

**No `pnpm add` needed.** Do NOT upgrade these packages — use the exact versions installed.

[Source: package.json]

### 🗄️ Database Schema — Already Migrated

The `WebauthnCredential` model and `webauthn_credentials` table are **already defined in the schema and migration** — no new Prisma migration is needed.

```prisma
// prisma/schema.prisma (lines 347–361) — already exists
model WebauthnCredential {
  id           String   @id @default(cuid())
  userId       String   @map("user_id")
  credentialId String   @unique @map("credential_id")
  publicKey    String   @map("public_key")        // base64-encoded Uint8Array
  counter      BigInt   @default(0)
  deviceType   String?  @map("device_type")       // "singleDevice" | "multiDevice"
  backedUp     Boolean  @default(false) @map("backed_up")
  transports   String[]                            // ["internal", "usb", etc.]
  createdAt    DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("webauthn_credentials")
}
```

The `User` model already has `passkeys WebauthnCredential[]` relation.

**Prisma import path** (CRITICAL — never use `@prisma/client`):
```typescript
import { prisma } from '@/server/db'
// Types from:
import { type WebauthnCredential } from '@/generated/prisma/client'
```

`webauthnCredential` is **NOT** in `CLUB_SCOPED_READ_MODELS` — no `clubId` needed on its queries.

[Source: prisma/schema.prisma#lines 347-361]
[Source: src/server/db.ts#CLUB_SCOPED_READ_MODELS]

### 🔧 WebAuthn Config Helper (`src/lib/webauthn.ts`)

Create this file with the following exports:

```typescript
// src/lib/webauthn.ts
import { encrypt, decrypt } from '@/lib/crypto'

export function getWebAuthnConfig() {
  return {
    rpID: process.env.WEBAUTHN_RP_ID ?? 'localhost',
    rpName: process.env.WEBAUTHN_RP_NAME ?? 'Clashware',
    origin: process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:3000',
  }
}

/** Encrypt a challenge string for storage in an HttpOnly cookie */
export function encodeChallengeCookie(challenge: string): string {
  const { ciphertext, iv } = encrypt(challenge)
  return Buffer.from(JSON.stringify({ ciphertext, iv })).toString('base64')
}

/** Decode and recover the challenge from the cookie value. Returns null if tampered. */
export function decodeChallengeCookie(value: string): string | null {
  try {
    const { ciphertext, iv } = JSON.parse(Buffer.from(value, 'base64').toString('utf8'))
    return decrypt(ciphertext, iv)
  } catch {
    return null
  }
}

export const PASSKEY_CHALLENGE_COOKIE = 'passkey_challenge'
```

[Source: src/lib/setup-cookie.ts — same encrypt/decrypt pattern]
[Source: src/lib/crypto.ts — AES-256-GCM helpers]

### 🌐 Route Handler Pattern (App Router)

All 4 WebAuthn endpoints are Next.js Route Handlers (`route.ts`), not Server Actions. Route Handlers are used because:
1. The browser's `startRegistration` / `startAuthentication` from `@simplewebauthn/browser` calls `fetch()` directly (not form submission)
2. They need to read/set cookies in the response headers

**Important:** Route Handlers in Next.js 15 read cookies from `request.cookies` (for reading) and set cookies via `NextResponse` or the `cookies()` API. Use `cookies()` from `next/headers` for setting cookies server-side in Route Handlers.

```typescript
// Route Handler cookie pattern:
import { cookies } from 'next/headers'
const cookieStore = await cookies()
cookieStore.set(PASSKEY_CHALLENGE_COOKIE, encodeChallengeCookie(options.challenge), {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 5, // 5 minutes — challenge TTL
  domain: process.env.COOKIE_DOMAIN,
})
```

### 📝 Registration Flow Detail

**Begin (`POST /api/auth/passkey/register/begin`):**

```typescript
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { getWebAuthnConfig, encodeChallengeCookie, PASSKEY_CHALLENGE_COOKIE } from '@/lib/webauthn'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await getAuthSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.totpEnabled && !session.user.totpVerified) {
    return NextResponse.json({ error: 'TOTP verification required' }, { status: 403 })
  }

  const { rpID, rpName, origin } = getWebAuthnConfig()

  // Get existing credentials to exclude (prevent duplicate registration)
  const existingCredentials = await prisma.webauthnCredential.findMany({
    where: { userId: session.user.id },
    select: { credentialId: true, transports: true },
  })

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: session.user.email ?? session.user.id,
    attestationType: 'none',
    excludeCredentials: existingCredentials.map(c => ({
      id: c.credentialId,
      transports: c.transports as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(PASSKEY_CHALLENGE_COOKIE, encodeChallengeCookie(options.challenge), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 300, // 5 minutes
    domain: process.env.COOKIE_DOMAIN,
  })

  return NextResponse.json(options)
}
```

**Complete (`POST /api/auth/passkey/register/complete`):**

```typescript
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import type { RegistrationResponseJSON } from '@simplewebauthn/types'

export async function POST(request: NextRequest) {
  const session = await getAuthSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cookieStore = await cookies()
  const challengeCookie = cookieStore.get(PASSKEY_CHALLENGE_COOKIE)
  if (!challengeCookie) return NextResponse.json({ error: 'No challenge found' }, { status: 400 })

  const expectedChallenge = decodeChallengeCookie(challengeCookie.value)
  if (!expectedChallenge) return NextResponse.json({ error: 'Invalid challenge' }, { status: 400 })

  // Clear the challenge cookie immediately (single-use)
  cookieStore.set(PASSKEY_CHALLENGE_COOKIE, '', { maxAge: 0, path: '/' })

  const { rpID, origin } = getWebAuthnConfig()
  const body: RegistrationResponseJSON = await request.json()

  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  })

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo

  await prisma.webauthnCredential.create({
    data: {
      userId: session.user.id,
      credentialId: credential.id,                                        // Base64URLString
      publicKey: Buffer.from(credential.publicKey).toString('base64'),    // Uint8Array → base64
      counter: BigInt(credential.counter),
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: body.response.transports ?? [],
    },
  })

  return NextResponse.json({ success: true })
}
```

[Source: @simplewebauthn/server v13 API — credential.publicKey is Uint8Array, credential.id is Base64URLString]

### 🔐 Authentication Flow Detail

**Begin (`POST /api/auth/passkey/authenticate/begin`):**

```typescript
import { generateAuthenticationOptions } from '@simplewebauthn/server'

export async function POST(request: NextRequest) {
  const { rpID, origin } = getWebAuthnConfig()
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email : undefined

  // If email provided, load user's credentials to narrow the authenticator list
  let allowCredentials: { id: string; transports: AuthenticatorTransportFuture[] }[] = []
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (user) {
      const credentials = await prisma.webauthnCredential.findMany({
        where: { userId: user.id },
        select: { credentialId: true, transports: true },
      })
      allowCredentials = credentials.map(c => ({
        id: c.credentialId,
        transports: c.transports as AuthenticatorTransportFuture[],
      }))
    }
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,         // Empty = discoverable credential (passkey auto-select)
    userVerification: 'preferred',
  })

  const cookieStore = await cookies()
  cookieStore.set(PASSKEY_CHALLENGE_COOKIE, encodeChallengeCookie(options.challenge), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
    maxAge: 300, domain: process.env.COOKIE_DOMAIN,
  })

  return NextResponse.json(options)
}
```

**Complete (`POST /api/auth/passkey/authenticate/complete`) — MOST CRITICAL:**

```typescript
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import type { AuthenticationResponseJSON } from '@simplewebauthn/types'
import { randomUUID } from 'crypto'
import { SESSION_COOKIE_NAME } from '@/server/auth'
import { encodeTotpVerifiedCookie } from '@/lib/setup-cookie'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const challengeCookie = cookieStore.get(PASSKEY_CHALLENGE_COOKIE)
  if (!challengeCookie) return NextResponse.json({ error: 'No challenge' }, { status: 400 })

  const expectedChallenge = decodeChallengeCookie(challengeCookie.value)
  if (!expectedChallenge) return NextResponse.json({ error: 'Invalid challenge' }, { status: 400 })

  // Clear challenge cookie (single-use)
  cookieStore.set(PASSKEY_CHALLENGE_COOKIE, '', { maxAge: 0, path: '/' })

  const body: AuthenticationResponseJSON = await request.json()
  const { rpID, origin } = getWebAuthnConfig()

  // Look up the credential by ID
  const storedCredential = await prisma.webauthnCredential.findUnique({
    where: { credentialId: body.id },
    include: { user: { select: { id: true, role: true, totpEnabled: true } } },
  })

  if (!storedCredential) {
    return NextResponse.json({ error: 'Credential not found' }, { status: 400 })
  }

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: storedCredential.credentialId,
      publicKey: new Uint8Array(Buffer.from(storedCredential.publicKey, 'base64')),
      counter: Number(storedCredential.counter),
      transports: storedCredential.transports as AuthenticatorTransportFuture[],
    },
  })

  if (!verification.verified) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  // Update counter (replay attack prevention)
  await prisma.webauthnCredential.update({
    where: { credentialId: body.id },
    data: { counter: BigInt(verification.authenticationInfo.newCounter) },
  })

  // Create session (same pattern as loginWithCredentials)
  const sessionToken = randomUUID()
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await prisma.session.create({
    data: { sessionToken, userId: storedCredential.user.id, expires },
  })

  const isProduction = process.env.NODE_ENV === 'production'
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true, secure: isProduction, sameSite: 'lax',
    path: '/', expires, domain: process.env.COOKIE_DOMAIN,
  })

  // Passkey = MFA-complete: set totp_verified unconditionally (satisfies TOTP requirement)
  cookieStore.set('totp_verified', encodeTotpVerifiedCookie(storedCredential.user.id), {
    httpOnly: true, secure: isProduction, sameSite: 'lax',
    path: '/', maxAge: 60 * 60 * 24 * 30, domain: process.env.COOKIE_DOMAIN,
  })

  return NextResponse.json({ success: true, role: storedCredential.user.role })
}
```

**⚠️ Counter check:** v13's `verifyAuthenticationResponse` validates counter internally if the stored counter > 0. Access `verification.authenticationInfo.newCounter` after verification to update the DB.

[Source: @simplewebauthn/server v13 — verifyAuthenticationResponse credential parameter]
[Source: src/app/auth/login/actions.ts — session creation + cookie pattern]
[Source: src/server/auth.ts#SESSION_COOKIE_NAME]
[Source: src/lib/setup-cookie.ts#encodeTotpVerifiedCookie]

### 🖥️ Browser-Side (`@simplewebauthn/browser`)

Use `startRegistration` and `startAuthentication` from `@simplewebauthn/browser` in Client Components. These functions handle all the browser WebAuthn API calls.

```typescript
// In ManagePasskeysSection.tsx (register)
import { startRegistration } from '@simplewebauthn/browser'

async function handleAddPasskey() {
  const beginRes = await fetch('/api/auth/passkey/register/begin', { method: 'POST' })
  const options = await beginRes.json()
  const registrationResponse = await startRegistration({ optionsJSON: options })
  const completeRes = await fetch('/api/auth/passkey/register/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationResponse),
  })
  const result = await completeRes.json()
  if (!result.success) throw new Error(result.error)
  // Refresh passkey list
}

// In PasskeyButton.tsx (authenticate)
import { startAuthentication } from '@simplewebauthn/browser'

async function handlePasskeyLogin() {
  const beginRes = await fetch('/api/auth/passkey/authenticate/begin', { method: 'POST' })
  const options = await beginRes.json()
  const authResponse = await startAuthentication({ optionsJSON: options })
  const completeRes = await fetch('/api/auth/passkey/authenticate/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authResponse),
  })
  const result = await completeRes.json()
  if (!result.success) throw new Error(result.error)
  router.push(result.role === 'OPERATOR' ? '/admin' : '/my-clubs')
}
```

**⚠️ Important:** `startRegistration` and `startAuthentication` throw `WebAuthnError` if the user cancels or the browser doesn't support WebAuthn. Always wrap in try/catch and show a friendly error. Do NOT show a confusing stack trace — catch and display `err.message` or a generic fallback.

[Source: @simplewebauthn/browser v13 — startRegistration accepts `{ optionsJSON }`, startAuthentication accepts `{ optionsJSON }`]

### 🔑 Server Action — Delete Passkey

```typescript
// src/app/auth/passkey/actions.ts
'use server'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'

export type DeletePasskeyResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'SERVER_ERROR' }
  | { success: true }

export async function deletePasskey(credentialId: string): Promise<DeletePasskeyResult> {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' }
  }

  // Compound where clause: only delete if the credential belongs to the authenticated user
  const deleted = await prisma.webauthnCredential.deleteMany({
    where: { credentialId, userId: session.user.id },
  })

  if (deleted.count === 0) {
    return { success: false, error: 'Credential not found.', code: 'NOT_FOUND' }
  }

  return { success: true }
}
```

**⚠️ Security:** Always include `userId: session.user.id` in the `where` clause to prevent users from deleting other users' credentials.

[Source: src/app/auth/account/actions.ts — same auth guard pattern]

### 🧪 Testing Notes

**Test framework:** Vitest. Run with `pnpm test`.

**Route Handler testing pattern** — mock `next/headers` and the `@simplewebauthn/server` functions:

```typescript
// src/__tests__/passkey-register.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/server/auth', () => ({ getAuthSession: vi.fn() }))
vi.mock('@/server/db', () => ({ prisma: { webauthnCredential: { findMany: vi.fn(), create: vi.fn() } } }))
vi.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: vi.fn(),
  verifyRegistrationResponse: vi.fn(),
}))
vi.mock('next/headers', () => ({ cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn() })) }))
vi.mock('@/lib/webauthn', () => ({
  getWebAuthnConfig: vi.fn(() => ({ rpID: 'localhost', rpName: 'Test', origin: 'http://localhost:3000' })),
  encodeChallengeCookie: vi.fn((c: string) => `encoded:${c}`),
  decodeChallengeCookie: vi.fn((v: string) => v.replace('encoded:', '')),
  PASSKEY_CHALLENGE_COOKIE: 'passkey_challenge',
}))
```

**Key test cases for `passkey-register.test.ts`:**
- `POST /begin` → unauthenticated → 401
- `POST /begin` → authenticated → calls `generateRegistrationOptions`, sets cookie, returns options
- `POST /complete` → no challenge cookie → 400
- `POST /complete` → invalid challenge (tampered cookie) → 400
- `POST /complete` → `verifyRegistrationResponse` returns `{ verified: false }` → 400
- `POST /complete` → success → `prisma.webauthnCredential.create` called with correct fields, returns `{ success: true }`

**Key test cases for `passkey-authenticate.test.ts`:**
- `POST /begin` → generates options, sets cookie, returns options JSON
- `POST /complete` → no challenge cookie → 400
- `POST /complete` → credential not found in DB → 400
- `POST /complete` → `verifyAuthenticationResponse` returns `{ verified: false }` → 400
- `POST /complete` → success → counter updated, session created, SESSION_COOKIE_NAME set, totp_verified set, returns `{ success: true, role: 'CLUB_ADMIN' }`
- `POST /complete` → success with OPERATOR role → returns `{ success: true, role: 'OPERATOR' }`

**Key test cases for `passkey-actions.test.ts`:**
- `deletePasskey` → unauthenticated → UNAUTHORIZED
- `deletePasskey` → wrong user's credential → NOT_FOUND (deleteMany returns count 0)
- `deletePasskey` → success → `{ success: true }`

**Important:** Test `prisma.webauthnCredential` operations with `findMany`, `create`, `findUnique`, `update`, `deleteMany` — these are not club-scoped and require no `clubId`.

**Current test count:** 122 tests passing (as of Story 1.5). Expect ~145+ after this story.

[Source: src/__tests__/login.test.ts — Route Handler/action test patterns]
[Source: src/__tests__/account.test.ts — deleteMany pattern reference]

### 🌐 Environment Variables

Add to `.env.example`:

```dotenv
# WebAuthn / Passkeys (SimpleWebAuthn)
WEBAUTHN_RP_ID="localhost"                    # Hostname only (no protocol/port) — must match the domain
WEBAUTHN_RP_NAME="Clashware"                 # Human-readable site name shown in passkey prompts
WEBAUTHN_ORIGIN="http://localhost:3000"       # Full origin (protocol + host + port if non-standard)
```

**Production values:**
- `WEBAUTHN_RP_ID` = your domain, e.g., `clashware.com` (no subdomain unless passkeys registered on subdomain)
- `WEBAUTHN_ORIGIN` = `https://clashware.com`
- `WEBAUTHN_RP_NAME` = `Clashware`

**⚠️ Critical:** `WEBAUTHN_RP_ID` must match the registering origin's effective domain. Mismatch causes registration/authentication to fail with `InvalidStateError`. In dev, `localhost` works because the origin is `http://localhost:3000`.

[Source: .env.example — existing env var patterns]
[Source: AUTH_URL in .env.example — same origin concept]

### 🏗️ Architecture Notes

**Passkey satisfies MFA:** Per NFR9 and the acceptance criteria, a successful passkey authentication establishes a fully-verified session. The `totp_verified` cookie must be set **unconditionally** after passkey authentication (regardless of whether the user has `totpEnabled`). This ensures `getAuthSession()` returns `totpVerified: true` and no TOTP banner is shown.

**No proxy.ts changes:** `proxy.ts` is a no-op stub. Passkey endpoints (`/api/auth/passkey/*`) are not protected by the admin layout and do not need middleware changes.

**No next-auth signIn:** Following the established pattern (loginWithCredentials, setupPassword, enrollTotp), passkey authentication creates sessions manually via `prisma.session.create()` — do NOT use `signIn()` from next-auth.

**Challenge storage:** The passkey challenge is stored in an encrypted HttpOnly cookie (`passkey_challenge`) with a 5-minute TTL. This avoids the need for a database table or in-memory store. The challenge is cleared immediately after verification (single-use).

**Account settings page guard:** The account page (`/auth/account`) already guards unauthenticated users. When adding `ManagePasskeysSection`, pass `passkeys` prop loaded server-side to avoid an additional client-side fetch on mount. The `prisma.webauthnCredential.findMany({ where: { userId: session.user.id } })` call happens in the Server Component (`account/page.tsx`).

[Source: _bmad-output/planning-artifacts/architecture.md#Auth Session & Middleware]
[Source: src/server/auth.ts#getAuthSession — totpVerified behavior]

### 🔁 Previous Story Learnings (Stories 1.3–1.5)

1. **`getAuthSession()` not `getServerSession()`** — always use `getAuthSession()` in Server Components and Route Handlers [Source: src/server/auth.ts#getAuthSession]
2. **Prisma import path** — always `from '@/generated/prisma/client'` NOT `from '@prisma/client'` [Source: all previous stories]
3. **`await params` in App Router** — `params` is a Promise in Next.js 15; always `await params` when reading route params [Source: src/app/(country)/[country]/[club]/layout.tsx]
4. **Session creation pattern** — `prisma.session.create()` + manual cookie set; do NOT use `next-auth signIn()` [Source: src/app/auth/login/actions.ts#loginWithCredentials]
5. **`totp_verified` cookie** — must be set alongside `SESSION_COOKIE_NAME` for non-TOTP users; for passkey auth, set it unconditionally as passkey = MFA-complete [Source: src/server/auth.ts#getAuthSession]
6. **`redirect()` from next/navigation** — throws a special error; do not wrap in try/catch [Source: src/app/auth/setup/actions.ts]
7. **Cookie domain** — always include `domain: process.env.COOKIE_DOMAIN` when setting cookies [Source: src/app/auth/login/actions.ts#cookies pattern]
8. **Admin route already works** — `proxy.ts` is a no-op; `src/app/admin/(protected)/layout.tsx` handles OPERATOR role guard [Source: 1-5 story file#File List]
9. **122 tests passing** — current baseline; add new tests without breaking existing ones

### ⚙️ Git Intelligence (Recent Commits)

```
6da7be2 feat: story 1.5  — operator auth via shared /auth/login, role-based redirect, no-op proxy.ts, 122 tests
b029766 feat: story 1.4  — /my-clubs page, club membership guard, auth redirects to /my-clubs
8765cfe feat: story 1.3  — magic link, password setup, TOTP enrollment, ADR-001 ClubMembership
54292ff feat: story 1.2  — database schema + ClubMembership model
f79eb6b feat: story 1.1  — project scaffold + dev environment
```

Patterns established: manual session creation, encrypted HttpOnly cookies, Prisma `from '@/generated/prisma/client'`, no next-auth `signIn()`.

### 📁 Project Structure — Files to Create/Modify

**New files:**
```
src/
  lib/
    webauthn.ts                                          # Helper library
  app/
    api/
      auth/
        passkey/
          register/
            begin/
              route.ts                                   # POST — generate registration options
            complete/
              route.ts                                   # POST — verify + store credential
          authenticate/
            begin/
              route.ts                                   # POST — generate authentication options
            complete/
              route.ts                                   # POST — verify + create session
    auth/
      passkey/
        actions.ts                                       # deletePasskey Server Action
  components/
    app/
      auth/
        PasskeyButton.tsx                                # Login page passkey CTA
        ManagePasskeysSection.tsx                        # Account settings passkey management
  __tests__/
    passkey-register.test.ts
    passkey-authenticate.test.ts
    passkey-actions.test.ts
```

**Modified files:**
```
src/app/auth/login/page.tsx                             # Add <PasskeyButton /> below <LoginForm />
src/app/auth/account/page.tsx                           # Add ManagePasskeysSection with passkeys prop
.env.example                                            # Add WEBAUTHN_RP_ID, WEBAUTHN_RP_NAME, WEBAUTHN_ORIGIN
_bmad-output/implementation-artifacts/sprint-status.yaml
```

**No changes needed:**
```
prisma/schema.prisma           # WebauthnCredential model already defined
prisma/migrations/             # webauthn_credentials table already in migration
src/proxy.ts                   # No-op stub — no changes needed
src/server/auth.ts             # No changes needed
src/types/next-auth.d.ts       # No changes needed
```

### 🔗 References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6] — User story, acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#Technical Preferences] — `@simplewebauthn/*` library selection
- [Source: _bmad-output/planning-artifacts/architecture.md#File Structure] — `src/lib/webauthn.ts`, `PasskeyButton.tsx` planned locations
- [Source: prisma/schema.prisma#lines 347-361] — WebauthnCredential model (already exists)
- [Source: prisma/migrations/20260302112723_init/migration.sql#line 240] — webauthn_credentials table (already migrated)
- [Source: src/server/db.ts#CLUB_SCOPED_READ_MODELS] — webauthnCredential NOT club-scoped
- [Source: src/app/auth/login/actions.ts] — Session creation + cookie pattern (reference implementation)
- [Source: src/server/auth.ts#SESSION_COOKIE_NAME] — Cookie name constant
- [Source: src/lib/setup-cookie.ts] — `encodeTotpVerifiedCookie` (reuse for passkey auth)
- [Source: src/lib/crypto.ts] — `encrypt`/`decrypt` for challenge cookie
- [Source: src/app/auth/account/page.tsx] — Account page to extend with ManagePasskeysSection
- [Source: src/app/auth/login/page.tsx] — Login page to extend with PasskeyButton
- [Source: src/components/app/auth/LoginForm.tsx] — Existing login form pattern
- [Source: _bmad-output/implementation-artifacts/1-5-platform-operator-authentication-admin-route-protection.md] — Story 1.5 patterns
- [Source: @simplewebauthn/server v13 changelog] — `credential.publicKey` is Uint8Array, `credential.id` is Base64URLString, `credential` replaces `authenticator` param in verifyAuthenticationResponse

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Implemented `src/lib/webauthn.ts` with `getWebAuthnConfig()`, `encodeChallengeCookie()`, `decodeChallengeCookie()`, and `PASSKEY_CHALLENGE_COOKIE` constant using the same AES-256-GCM pattern as `encodeTotpVerifiedCookie`.
- Registration flow: `/api/auth/passkey/register/begin` (authenticated, generates options, sets encrypted challenge cookie) and `/api/auth/passkey/register/complete` (verifies response, stores credential with base64-encoded publicKey and BigInt counter).
- Authentication flow: `/api/auth/passkey/authenticate/begin` (public, optional email narrowing) and `/api/auth/passkey/authenticate/complete` (verifies response, updates counter, creates DB session, sets SESSION_COOKIE_NAME + totp_verified — passkey = MFA complete, unconditional).
- `deletePasskey` uses `prisma.webauthnCredential.deleteMany` with compound where clause `{ credentialId, userId }` for safe user-scoped deletion.
- `ManagePasskeysSection` (Client Component) lists passkeys and handles add/remove with optimistic UI refresh via `router.refresh()`.
- `PasskeyButton` (Client Component) handles full authenticate flow with role-based redirect.
- Login page has a visual separator ("Or") divider between `<LoginForm />` and `<PasskeyButton />`.
- All 17 tests pass (7 register, 7 authenticate, 3 actions). Full suite: 139 tests passing, 0 regressions from 122 baseline.
- Note: Subtask 1.3 initially exported a `StoredWebAuthnCredential` type from `webauthn.ts`, but it had no consumers — route handlers use Prisma-generated types directly. Removed in code review #2.
- Code review #1 fixes applied (2026-03-03): M1 — try/catch on credential create in register/complete; M2+M3 — prisma.$transaction wrapping counter update + session create in authenticate/complete with try/catch; M4 — isAdding state for registration loading indicator in ManagePasskeysSection; M5+L3 — added TOTP-403 and excludeCredentials tests to passkey-register.test.ts; L1 — exported StoredWebAuthnCredential type from webauthn.ts; L2 — added tampered cookie test to passkey-authenticate.test.ts; L4 — credential-not-found returns 401 in authenticate/complete. Full suite: 142 tests passing.
- Code review #2 fixes applied (2026-03-03): M1 — verifyAuthenticationResponse wrapped via .catch(() => null) to handle counter rollback throws; M2 — verifyRegistrationResponse wrapped via .catch(() => null) to handle malformed attestation throws; L1 — try/catch on prisma.deleteMany in deletePasskey (SERVER_ERROR code path now reachable); L2 — removed unused StoredWebAuthnCredential export from webauthn.ts; L3 — TOTP re-check added to register/complete (consistent invariant with begin); docs/AUTHENTICATION.md Mermaid parse errors fixed. 4 new tests. Full suite: 146 tests passing.

### File List

- src/lib/webauthn.ts (new)
- src/app/api/auth/passkey/register/begin/route.ts (new)
- src/app/api/auth/passkey/register/complete/route.ts (new)
- src/app/api/auth/passkey/authenticate/begin/route.ts (new)
- src/app/api/auth/passkey/authenticate/complete/route.ts (new)
- src/app/auth/passkey/actions.ts (new)
- src/components/app/auth/ManagePasskeysSection.tsx (new)
- src/components/app/auth/PasskeyButton.tsx (new)
- src/app/auth/account/page.tsx (modified)
- src/app/auth/login/page.tsx (modified)
- .env.example (modified)
- src/__tests__/passkey-register.test.ts (new)
- src/__tests__/passkey-authenticate.test.ts (new)
- src/__tests__/passkey-actions.test.ts (new)
- docs/AUTHENTICATION.md (modified)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)

## Change Log

- 2026-03-03: Implemented passkey (WebAuthn) authentication — helper library, 4 route handlers (register/authenticate begin+complete), deletePasskey server action, ManagePasskeysSection and PasskeyButton UI components, account/login page updates, env.example additions, and 17 new tests (139 total, 0 regressions).
- 2026-03-03: Code review #1 fixes — error handling on DB writes, atomic counter+session transaction, ManagePasskeysSection loading state, StoredWebAuthnCredential export, 3 additional tests (TOTP 403 guard, excludeCredentials population, tampered challenge cookie), credential-not-found returns 401. 142 tests passing.
- 2026-03-03: Code review #2 fixes — verifyAuthenticationResponse and verifyRegistrationResponse throw-safe via .catch(); deletePasskey SERVER_ERROR code path; removed unused StoredWebAuthnCredential export; TOTP re-check on register/complete; Mermaid parse errors in AUTHENTICATION.md fixed; docs/AUTHENTICATION.md added to File List. 146 tests passing.
