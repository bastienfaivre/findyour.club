# Story 1.5: Platform Operator Authentication & Admin Route Protection

Status: done

## Story

As a Platform Operator,
I want to authenticate via the shared `/auth/login` page with my email and password (and optional TOTP), with all `/admin/*` routes protected by the admin layout,
so that I can securely access the platform admin dashboard using the same login flow as Club Admins, with role-based routing directing me to the right destination.

## Acceptance Criteria

1. **Given** the shared login page at `/auth/login`, **When** the Platform Operator submits their email and correct password (and TOTP code if `totpEnabled = true`), **Then** an operator session is established and they are redirected to `/admin` (not `/my-clubs`).

2. **Given** a valid operator session, **When** any `/admin/*` route is accessed, **Then** the admin layout allows the request through and the operator dashboard renders.

3. **Given** no session or a non-OPERATOR session, **When** any `/admin/*` route is accessed, **Then** the admin layout (`src/app/admin/(protected)/layout.tsx`) redirects to `/auth/login` — no dashboard content is ever served.

4. **Given** a Club Admin with an active membership for Club A only, **When** they attempt to access Club B's edit route, **Then** the club layout membership guard (Story 1.4) blocks access — **already implemented, verify only**.

5. **Given** the seeded operator account (`admin@platform-name.com` / `123456`, `totpEnabled: false`), **When** logging in via `/auth/login`, **Then** login succeeds and the operator dashboard at `/admin` is accessible.

## Tasks / Subtasks

- [x] Task 1: Delete operator-specific login files (no longer needed) (AC: #1)
  - [x] 1.1 Delete `src/app/admin/login/page.tsx`
  - [x] 1.2 Delete `src/app/admin/login/actions.ts`
  - [x] 1.3 Delete `src/components/app/admin/OperatorLoginForm.tsx`
  - [x] 1.4 Delete `src/__tests__/admin-login.test.ts`

- [x] Task 2: Revert `proxy.ts` to a no-op stub (AC: #3 — layout handles auth now)
  - [x] 2.1 Remove all route-guard logic from `proxy.ts` (admin cookie check + `?edit=true` redirect)
  - [x] 2.2 Keep the function returning `NextResponse.next()` and the `config` matcher export (needed by Next.js)
  - [x] 2.3 Delete `src/__tests__/proxy.test.ts` (no logic to test)

- [x] Task 3: `verifyTotpChallenge` role-based redirect — **already done** (AC: #1)
  - [x] 3.1 `src/app/auth/totp/actions.ts`: `postAuthRedirect = session.user.role === 'OPERATOR' ? '/admin' : '/my-clubs'`

- [x] Task 4: Update admin layout redirects to point to `/auth/login` (AC: #3)
  - [x] 4.1 `src/app/admin/(protected)/layout.tsx` exists with OPERATOR role guard
  - [x] 4.2 Change both `redirect('/admin/login')` calls → `redirect('/auth/login')`

- [x] Task 5: Update `loginWithCredentials` for role-based redirect (AC: #1)
  - [x] 5.1 Read `src/app/auth/login/actions.ts` — confirm it doesn't explicitly reject OPERATOR users
  - [x] 5.2 Ensure the return value carries enough information for the client to redirect based on role (either return `role` or derive from session after login)
  - [x] 5.3 Update the login client form (`src/components/app/auth/LoginForm.tsx` or equivalent) to redirect OPERATOR → `/admin`, CLUB_ADMIN → `/my-clubs`

- [x] Task 6: Admin dashboard placeholder — **already done** (AC: #2, #5)
  - [x] 6.1 `src/app/admin/(protected)/page.tsx` exists

- [x] Task 7: Update tests (AC: all)
  - [x] 7.1 Update `src/__tests__/admin-layout.test.ts` — change expected redirect target from `/admin/login` → `/auth/login`
  - [x] 7.2 `src/__tests__/totp-challenge.test.ts` — OPERATOR → `/admin` test already added
  - [x] 7.3 Run `pnpm test` — all tests pass

## Dev Notes

### 🏗️ Architecture: Two-Layer Admin Protection

The admin route protection uses two complementary layers:

**Layer 1 — `proxy.ts` (Edge Middleware):** Checks for session cookie _existence_ on `/admin/*` routes. If no cookie → redirect to `/admin/login`. This is a best-effort first gate — the Edge runtime cannot access the Prisma database to verify the role from a database-strategy session token.

**Layer 2 — `src/app/admin/layout.tsx` (Server Component):** Full role verification via `getAuthSession()` + Prisma DB lookup. Redirects any non-OPERATOR session (including valid CLUB_ADMIN sessions) to `/admin/login`. This is the authoritative security layer.

This is the same pattern used in Story 1.4 for club route protection (proxy first-gate + layout full-verification).

[Source: _bmad-output/planning-artifacts/architecture.md#Middleware & Route Protection]

### 🔒 proxy.ts Implementation Pattern

`src/proxy.ts` is the Next.js middleware entry (not `src/middleware.ts` — the file is named `proxy.ts`). The `config` export with `matcher` is already present. Only add logic inside the `proxy()` function.

**Session cookie names** (from `src/server/auth.ts`):
```typescript
const SESSION_COOKIE_DEV = 'next-auth.session-token'
const SESSION_COOKIE_PROD = '__Secure-next-auth.session-token'
// Pick based on NODE_ENV:
process.env.NODE_ENV === 'production' ? SESSION_COOKIE_PROD : SESSION_COOKIE_DEV
```

**Implementation:**
```typescript
// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE_DEV = 'next-auth.session-token'
const SESSION_COOKIE_PROD = '__Secure-next-auth.session-token'

function hasSessionCookie(request: NextRequest): boolean {
  const cookieName = process.env.NODE_ENV === 'production' ? SESSION_COOKIE_PROD : SESSION_COOKIE_DEV
  return !!request.cookies.get(cookieName)?.value
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Protect /admin/* routes (except /admin/login itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!hasSessionCookie(request)) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    // Role verification (OPERATOR check) happens in admin layout — cannot query DB in Edge
  }

  // Protect ?edit=true — unauthenticated visitors cannot enter edit mode
  if (searchParams.get('edit') === 'true' && !hasSessionCookie(request)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**⚠️ Edge runtime limitation:** `process.env.NODE_ENV` is available in Edge, but Prisma/DB is not. The cookie name check is sufficient for the first gate.

[Source: src/proxy.ts; Source: src/server/auth.ts#SESSION_COOKIE_NAME]

### 🔑 Operator Login Action Pattern

Mirrors `loginWithCredentials` from `src/app/auth/login/actions.ts` almost exactly. Key differences:
- Role check: `if (!user || user.role !== 'OPERATOR')` — reject with `'Invalid credentials'` (same message as wrong password — no role enumeration)
- No magic link flow — operators only use password auth
- Return type: same `{ success: true, totpEnabled: boolean }` pattern; client form handles redirect

```typescript
// src/app/admin/login/actions.ts
'use server'
import { randomUUID } from 'crypto'
import { cookies, headers } from 'next/headers'
import argon2 from 'argon2'
import { prisma } from '@/server/db'
import { loginSchema } from '@/lib/schemas/user'
import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit'
import { SESSION_COOKIE_NAME } from '@/server/auth'
import { encodeTotpVerifiedCookie } from '@/lib/setup-cookie'

export type OperatorLoginResult =
  | { success: false; error: string; code: 'VALIDATION_ERROR' | 'INVALID_CREDENTIALS' | 'RATE_LIMITED' | 'SERVER_ERROR' }
  | { success: true; totpEnabled: boolean }

export async function loginAsOperator(input: unknown): Promise<OperatorLoginResult> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const rateLimitKey = `operator-login:${ip}`

  if (checkRateLimit(rateLimitKey)) {
    return { success: false, error: 'Too many attempts. Please wait before trying again.', code: 'RATE_LIMITED' }
  }

  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid email or password.', code: 'VALIDATION_ERROR' }
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, role: true, passwordHash: true, totpEnabled: true },
  })

  // Generic error — never reveal whether email exists or role mismatch
  if (!user || user.role !== 'OPERATOR' || !user.passwordHash) {
    return { success: false, error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' }
  }

  const valid = await argon2.verify(user.passwordHash, parsed.data.password)
  if (!valid) {
    return { success: false, error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' }
  }

  clearRateLimit(rateLimitKey)

  const sessionToken = randomUUID()
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  try {
    await prisma.session.create({ data: { sessionToken, userId: user.id, expires } })
  } catch {
    return { success: false, error: 'Login failed. Please try again.', code: 'SERVER_ERROR' }
  }

  const isProduction = process.env.NODE_ENV === 'production'
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires,
    domain: process.env.COOKIE_DOMAIN,
  })

  if (!user.totpEnabled) {
    cookieStore.set('totp_verified', encodeTotpVerifiedCookie(user.id), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      domain: process.env.COOKIE_DOMAIN,
    })
  }

  return { success: true, totpEnabled: user.totpEnabled }
}
```

[Source: src/app/auth/login/actions.ts — reference implementation]
[Source: src/lib/schemas/user — loginSchema reuse]
[Source: src/lib/rate-limit — checkRateLimit, clearRateLimit]

### 🔄 TOTP Action Update (verifyTotpChallenge)

The existing `verifyTotpChallenge` action in `src/app/auth/totp/actions.ts` always redirects to `/my-clubs`. For OPERATOR users, it must redirect to `/admin` instead.

The session object (from `getServerSession(authOptions)`) already has `session.user.role` populated by the session callback. No additional DB query needed.

**Current code (line 12):**
```typescript
const POST_AUTH_REDIRECT = '/my-clubs'
```

**Updated code:**
```typescript
// After session is validated (after line 36), determine redirect based on role:
const postAuthRedirect = session.user.role === 'OPERATOR' ? '/admin' : '/my-clubs'
// Then at the end:
redirect(postAuthRedirect)
```

[Source: src/app/auth/totp/actions.ts#verifyTotpChallenge]
[Source: src/types/next-auth.d.ts — session.user.role is UserRole]

### 🏗️ Admin Layout Pattern

```typescript
// src/app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getAuthSession()

  if (!session?.user) {
    redirect('/admin/login')
  }

  if (session.user.role !== 'OPERATOR') {
    redirect('/admin/login')
  }

  return <>{children}</>
}
```

**Note:** The layout applies to all routes under `src/app/admin/` EXCEPT `src/app/admin/login/` — Next.js App Router layouts do NOT apply to their own page.tsx, but DO apply to nested routes. Since `login/page.tsx` is nested inside `admin/layout.tsx`, this would create an infinite redirect loop for unauthenticated users. **Solution:** Check the pathname (via `headers()`) or use a route group.

**Best solution:** Use Next.js route groups to exclude `/admin/login` from the layout:
```
src/app/admin/
  (protected)/        # Layout applies here
    layout.tsx        # Operator guard
    page.tsx          # Dashboard
    applications/...
  login/
    page.tsx          # No layout — public
```

OR simpler: keep `layout.tsx` at `src/app/admin/` level but skip the guard for the login path:
```typescript
import { headers } from 'next/headers'
// ...
const headersList = await headers()
const pathname = headersList.get('x-invoke-path') ?? ''
if (pathname === '/admin/login') return <>{children}</>
```

**⚠️ Actually the safest approach**: Keep layout at `src/app/admin/` but note that `layout.tsx` wraps children — the `/admin/login` page.tsx is a CHILD of the admin layout. This WILL cause an infinite redirect loop if the layout guards unauthenticated users.

**Correct solution (recommended):** Use a `(protected)` route group:
```
src/app/admin/
  (protected)/
    layout.tsx        # Operator guard only applies to routes inside (protected)/
    page.tsx          # /admin (dashboard)
  login/
    page.tsx          # /admin/login — NOT protected by layout
```

This is the cleanest pattern. The `(protected)` route group adds no URL segments.

[Source: _bmad-output/planning-artifacts/architecture.md#Route Structure for Operator Dashboard]

### 📄 Operator Login Page Pattern

```typescript
// src/app/admin/login/page.tsx
import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { OperatorLoginForm } from '@/components/app/admin/OperatorLoginForm'

export default async function AdminLoginPage() {
  // Already authenticated operators go directly to dashboard
  const session = await getAuthSession()
  if (session?.user?.role === 'OPERATOR') redirect('/admin')

  return (
    <main>
      <h1>Platform Operator Login</h1>
      <OperatorLoginForm />
    </main>
  )
}
```

```typescript
// src/components/app/admin/OperatorLoginForm.tsx
'use client'
import { useRouter } from 'next/navigation'
import { loginAsOperator } from '@/app/admin/login/actions'

export function OperatorLoginForm() {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const result = await loginAsOperator({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!result.success) {
      // show error
      return
    }

    if (result.totpEnabled) {
      router.push('/auth/totp') // Reuse existing TOTP challenge page
    } else {
      router.push('/admin')
    }
  }

  return (
    <form action={handleSubmit}>
      {/* email + password inputs */}
    </form>
  )
}
```

**Note on TOTP reuse:** The existing `/auth/totp` page and `verifyTotpChallenge` action are reused. After the updated TOTP action, OPERATOR users will be redirected to `/admin` on success. This is clean — no separate `/admin/totp` page needed.

### 🧪 Testing Notes

**Test file: `src/__tests__/admin-login.test.ts`**

Mock: `next/headers` (headers, cookies), `@/server/db` (prisma), `argon2`, `crypto` (randomUUID)

Key test cases:
```typescript
// Rate limited → error RATE_LIMITED
// Invalid schema → VALIDATION_ERROR
// User not found → INVALID_CREDENTIALS (generic)
// User is CLUB_ADMIN → INVALID_CREDENTIALS (role mismatch hidden)
// Wrong password → INVALID_CREDENTIALS
// DB session create throws → SERVER_ERROR
// Success (totpEnabled: false) → session created, SESSION_COOKIE_NAME set, totp_verified set, { success: true, totpEnabled: false }
// Success (totpEnabled: true) → session created, SESSION_COOKIE_NAME set, no totp_verified, { success: true, totpEnabled: true }
```

**Test file: `src/__tests__/admin-layout.test.ts`**

Mock: `@/server/auth` (getAuthSession), `next/navigation` (redirect)

Key test cases:
```typescript
// No session → redirect('/admin/login')
// session.user.role === 'CLUB_ADMIN' → redirect('/admin/login')
// session.user.role === 'OPERATOR' → render children (no redirect)
```

**Test file: `src/__tests__/proxy.test.ts`**

Mock: `next/server` (NextResponse)

Key test cases:
```typescript
// GET /admin (no session cookie) → redirect to /admin/login
// GET /admin/applications (no session cookie) → redirect to /admin/login
// GET /admin/login (no session cookie) → NextResponse.next() (pass through)
// GET /admin (with session cookie) → NextResponse.next() (role check in layout)
// GET /fr/ch/ski-club-valais?edit=true (no session cookie) → redirect to /auth/login
// GET /fr/ch/ski-club-valais?edit=true (with session cookie) → NextResponse.next()
// GET /fr/ch/ski-club-valais (no session cookie) → NextResponse.next() (public access OK)
/// Note: /{lang} prefix added by Story 2.0 route restructure (Task 9)
```

**Update `src/__tests__/totp-challenge.test.ts`:**
```typescript
// Existing: CLUB_ADMIN user → redirect to /my-clubs ✓
// New: OPERATOR user (session.user.role === 'OPERATOR') → redirect to /admin
```

**Test command:** `bash -c 'NVM_DIR="/Users/bastienfaivre/.nvm" && source "$NVM_DIR/nvm.sh" && pnpm test'`

**Current test count:** 116 tests passing (as of Story 1.4). Expect ~130+ after this story.

[Source: _bmad-output/implementation-artifacts/1-4-personal-homepage-club-membership-guard.md#Testing Notes]

### 🌱 Seed — Operator Account Already Configured

The operator account is **already seeded** with correct fields:

```typescript
// prisma/seed.ts (lines 17-29) — already correct, no changes needed
const operator = await prisma.user.upsert({
  where: { email: 'admin@platform-name.com' },
  update: { passwordHash: operatorPasswordHash },
  create: {
    email: 'admin@platform-name.com',
    name: 'Platform Operator',
    role: 'OPERATOR',                    // ← OPERATOR role set
    passwordHash: operatorPasswordHash,  // ← argon2.hash('123456')
    totpEnabled: false,                  // ← no TOTP for dev seed (AC6 works directly)
  },
})
```

**No seed changes required.** AC6 (login with `123456` succeeds) works as-is because `totpEnabled: false` means no TOTP challenge is presented.

[Source: prisma/seed.ts#lines 17-29]

### 🔁 Previous Story Learnings (Stories 1.3 + 1.4)

1. **`getAuthSession()` not `getServerSession()`** in Server Components/Layouts — enriches `totpVerified` from encrypted cookie [Source: src/server/auth.ts#getAuthSession]
2. **Prisma import path**: always `from '@/generated/prisma/client'` NOT `from '@prisma/client'` [Source: all previous stories]
3. **`params` is a Promise** in Next.js 15 App Router — always `await params` [Source: src/app/(country)/[country]/[club]/layout.tsx]
4. **Route groups (parentheses)** add no URL segments — `(protected)` in path is invisible in URL [Source: src/app/(country)/...]
5. **Session callback** populates `session.user.role` from DB — available in all server components and actions that call `getServerSession(authOptions)` [Source: src/server/auth.ts#session-callback]
6. **`totp_verified` cookie must be set** alongside `SESSION_COOKIE_NAME` when TOTP is disabled, or the `getAuthSession()` wrapper will calculate `totpVerified = false` for non-TOTP users [Source: src/server/auth.ts#getAuthSession]
7. **`redirect()` from `next/navigation`** — throws a special internal error; do not catch it; safe to call after setting cookies [Source: src/app/auth/setup/actions.ts pattern]
8. **Admin directory**: `src/app/admin/` exists with only `.gitkeep` — directory is ready, just add route files [Source: codebase exploration]
9. **`proxy.ts` is the middleware file** (NOT `src/middleware.ts`) — the `proxy()` function is called by Next.js middleware; config matcher already present [Source: src/proxy.ts]

### ⚙️ Git Intelligence (Recent Commits)

```
b029766 feat: story 1.4  — /my-clubs page, club membership guard, auth redirects to /my-clubs, 116 tests
8765cfe feat: story 1.3  — magic link, password setup, TOTP enrollment, ADR-001 ClubMembership
54292ff feat: story 1.2  — database schema + ClubMembership model
f79eb6b feat: story 1.1  — project scaffold + dev environment
```

Pattern to follow: all imports from `@/generated/prisma/client`, all server components use `getAuthSession()`, session creation via `prisma.session.create()` + cookie set.

### 📁 Project Structure — Files to Create/Modify

**New files:**
```
src/
  app/
    admin/
      (protected)/
        layout.tsx                        # OPERATOR role guard
        page.tsx                          # Dashboard placeholder
      login/
        page.tsx                          # Operator login page
        actions.ts                        # loginAsOperator server action
  components/
    app/
      admin/
        OperatorLoginForm.tsx             # Client Component login form
  __tests__/
    admin-login.test.ts
    admin-layout.test.ts
    proxy.test.ts
```

**Modified files:**
```
src/proxy.ts                              # Admin route + ?edit=true protection
src/app/auth/totp/actions.ts             # verifyTotpChallenge: role-based redirect
src/__tests__/totp-challenge.test.ts     # Add OPERATOR→/admin redirect test
_bmad-output/implementation-artifacts/sprint-status.yaml  # Status updated
```

**No changes needed:**
```
prisma/seed.ts                           # Operator already seeded correctly
src/server/auth.ts                       # Session callback already sets role
src/types/next-auth.d.ts                # session.user.role already typed
prisma/schema.prisma                     # UserRole.OPERATOR already defined
```

### 🔗 References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5] — Acceptance criteria, user story
- [Source: _bmad-output/planning-artifacts/architecture.md#Middleware & Route Protection] — proxy.ts role: route protection spec
- [Source: _bmad-output/planning-artifacts/architecture.md#Route Structure for Operator Dashboard] — `app/admin/` directory layout
- [Source: _bmad-output/planning-artifacts/architecture.md#Auth Session & Middleware Architecture] — UserRole, session contract
- [Source: _bmad-output/planning-artifacts/architecture.md#Seeded Operator Account] — operator email/password/totpEnabled
- [Source: src/proxy.ts] — Current stub; config matcher already set
- [Source: src/server/auth.ts] — SESSION_COOKIE_NAME, getAuthSession, session callback
- [Source: src/app/auth/login/actions.ts] — loginWithCredentials reference implementation (session creation, cookie pattern)
- [Source: src/app/auth/totp/actions.ts] — verifyTotpChallenge — update POST_AUTH_REDIRECT to role-based
- [Source: prisma/seed.ts#lines 17-29] — Operator already seeded with role: OPERATOR, totpEnabled: false
- [Source: src/server/db.ts] — prisma client, CLUB_SCOPED_READ_MODELS (prisma.session is NOT club-scoped)
- [Source: _bmad-output/implementation-artifacts/1-4-personal-homepage-club-membership-guard.md] — Story 1.4 patterns (auth guard, getAuthSession, route group usage)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — implementation went cleanly following story Dev Notes.

### Completion Notes List

- Rework: removed dedicated `/admin/login` — operators now use the shared `/auth/login` with role-based post-login redirect
- `proxy.ts` reverted to no-op stub — all auth enforced at layout level only
- `loginWithCredentials` now returns `role` alongside `totpEnabled`; `LoginForm.tsx` redirects OPERATOR → `/admin`, CLUB_ADMIN → `/my-clubs`
- Admin layout redirects unauthenticated/non-OPERATOR to `/auth/login` (not `/admin/login`)
- `(protected)` route group cleanly excludes `/admin/login` (now deleted) — no infinite redirect risk
- 121 tests passing; lint clean; build succeeds

### File List

**New files:**
- `src/app/admin/(protected)/layout.tsx`
- `src/app/admin/(protected)/page.tsx`
- `src/__tests__/admin-layout.test.ts`

**Modified files:**
- `src/proxy.ts` (no-op stub)
- `src/app/auth/login/actions.ts` (add `role` to query + return)
- `src/app/auth/totp/actions.ts` (role-based redirect)
- `src/components/app/auth/LoginForm.tsx` (role-based redirect)
- `src/components/app/auth/DevAuthPanel.tsx` (operator login link → `/auth/login`)
- `src/__tests__/admin-layout.test.ts` (redirect target → `/auth/login`)
- `src/__tests__/totp-challenge.test.ts` (OPERATOR → `/admin` test)
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/1-5-platform-operator-authentication-admin-route-protection.md`

**Deleted files:**
- `src/app/admin/login/actions.ts`
- `src/app/admin/login/page.tsx`
- `src/components/app/admin/OperatorLoginForm.tsx`
- `src/__tests__/admin-login.test.ts`
- `src/__tests__/proxy.test.ts`

**Pre-existing bug fixes (part of this branch):**
- `src/app/(platform)/page.tsx` — removed non-existent `getCountryFromHost` import (build error)
- `src/app/auth/totp-setup/actions.ts` — added `!` non-null assertions on `session` (TS error)

## Change Log

- 2026-03-03: Implemented platform operator authentication and admin route protection. Added two-layer guard (proxy cookie check + layout role check), operator login server action, login page/form, TOTP redirect fix for OPERATOR role, admin dashboard placeholder. 20 new tests; total suite 136 passing.
- 2026-03-03: Code review fixes — H1: added TOTP verification gate to admin layout; H2: fixed startsWith('/admin') → exact segment check; M1: removed unused _resetStore import; M2+M3: added production cookie and TOTP-unverified test coverage; L1: documented Edge cookie name duplication; L3: removed dev credentials from dashboard page. Also fixed two pre-existing build errors: (platform)/page.tsx bad import, totp-setup/actions.ts TS null error. Total suite 140 passing; lint clean; build succeeds.
- 2026-03-03: **Architecture rework (PM decision)** — Removed dedicated `/admin/login` page in favour of shared `/auth/login` for all users with role-based post-login redirect. Removed proxy-level route guards (`/admin/*` cookie check and `?edit=true` redirect) — auth is now handled exclusively at the layout level, and `?edit=true` is silently ignored if the user has no edit permission. Story reopened for implementation.
- 2026-03-03: Rework implemented — deleted admin/login files and proxy.test; proxy.ts reverted to no-op; admin layout redirects updated to `/auth/login`; `loginWithCredentials` returns `role`; `LoginForm.tsx` does role-based redirect; 121 tests passing, lint clean, build succeeds.
- 2026-03-03: Code review fixes (rework round) — H1+M1: added `role` to all `findUnique` mocks + new OPERATOR role test in login.test.ts; L1: confirmed eslint-disable comment required (ESLint config doesn't suppress `_`-prefixed params); L2: `LoginResult.role` typed as `UserRole` enum; L3: pre-existing fix files documented in File List. 122 tests passing; lint clean.
