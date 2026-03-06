# Story 2.3: Application Approval — Provisioning & Acceptance Email

Status: done

## Story

As a Platform Operator,
I want approving an application to automatically provision the club's URL path and send an acceptance email with a magic link,
so that approved clubs can start setting up their site immediately with no manual steps.

## Acceptance Criteria

1. **Given** the operator confirms approval of a pending application, **When** the `approveApplication` Server Action executes, **Then** a unique URL-safe club slug is generated (reserved slugs excluded via `lib/slug.ts`), the club record is created in the database with status `active`, and the application status is updated to `approved`.

2. **Given** the club record is created, **When** provisioning completes, **Then** a `ClubMembership` record is created for the applicant with `role: OWNER, status: ACTIVE, invitedBy: null` in the same transaction as the club record; an acceptance email is dispatched via Resend to the applicant's email address containing the club's URL path and a one-time magic link (1-hour TTL, SHA-256 hashed token) for first login.

3. **Given** approval completes successfully, **Then** the `ApplicationQueueItem` row fades out of the queue; a success toast confirms: "Approved — login link sent to [email]."

4. **Given** slug generation encounters a collision with an existing slug, **Then** a numeric suffix is appended automatically until a unique slug is found — the operator never sees this collision.

5. **Given** the email dispatch fails (Resend API error), **Then** the Server Action returns `{ success: false, error: 'Email delivery failed', code: 'EMAIL_FAILED' }`; the club record and approval are rolled back in a single transaction; the operator sees an inline error with guidance to retry.

## Tasks / Subtasks

- [x] Task 1: Extend `approveApplication` Server Action with provisioning logic (AC: 1, 2, 4, 5)
  - [x] 1.1 Inside the existing serializable `$transaction`, after slug conflict check succeeds and application is updated to APPROVED: create Club record (`name`, `slug`, `country`, `email`, `activityTypeId`, `locationId`, `defaultLanguage` inferred from country, `status: ACTIVE`)
  - [x] 1.2 Find or create User by `application.email` — if user exists, reuse; if not, create with `role: CLUB_ADMIN`, `passwordHash: null`
  - [x] 1.3 Generate magic-link token: `crypto.randomBytes(32).toString('hex')`, SHA-256 hash it, store hash as `user.magicToken`, set `user.magicTokenExp` to `now + 1 hour`
  - [x] 1.4 Create `ClubMembership` record: `userId`, `clubId`, `role: OWNER`, `status: ACTIVE`, `invitedBy: null`
  - [x] 1.5 After transaction succeeds, send acceptance email via `sendEmail` from `src/lib/email.ts`; if email fails, delete the provisioned Club + ClubMembership + clear User magic token (compensating action) and return `{ success: false, error: 'Email delivery failed', code: 'EMAIL_FAILED' }`
  - [x] 1.6 Add `EMAIL_FAILED` to the `ApplicationActionResult` error code union type
  - [x] 1.7 Return `{ success: true }` on full success
- [x] Task 2: Create acceptance email HTML template (AC: 2)
  - [x] 2.1 Build email HTML in a helper function (e.g. `buildAcceptanceEmailHtml`) — inline styles only (email clients)
  - [x] 2.2 Content: warm greeting with club name, club URL path (`/{lang}/{country}/{slug}`), magic-link URL (`{host}/{lang}/auth/magic-link?token={rawToken}`), 1-hour expiry notice, instruction to set password and enable 2FA
  - [x] 2.3 Subject line: "Your club site is ready — set up your account"
- [x] Task 3: Update UI feedback for provisioning result (AC: 3, 5)
  - [x] 3.1 Update toast message in `ApplicationQueueItem` to show "Approved — login link sent to [email]" on success
  - [x] 3.2 Handle new `EMAIL_FAILED` error code — show specific inline error: "Approval succeeded but email delivery failed. The provisioning has been rolled back. Please retry."
- [x] Task 4: Handle automatic slug collision resolution (AC: 4)
  - [x] 4.1 Add a `generateUniqueSlug(baseName: string, country: string)` function to `src/lib/slug.ts` that calls `generateSlug(baseName)`, checks DB for `@@unique([slug, country])` collision, and appends `-2`, `-3`, etc. until unique
  - [x] 4.2 Use this function in `approveApplication` for the auto-generated slug from `application.name`; the operator-provided slug from the popover takes precedence if provided
- [x] Task 5: Infer `defaultLanguage` for new club (AC: 1)
  - [x] 5.1 Create a helper `inferDefaultLanguage(country: string): string` — e.g. "ch" -> "fr", "fr" -> "fr", "de" -> "de", "it" -> "it", fallback "en"
- [x] Task 6: Write tests (AC: 1-5)
  - [x] 6.1 Happy path: PENDING application -> Club created, User created/found, ClubMembership created, email sent, returns `{ success: true }`
  - [x] 6.2 Existing user: application email matches existing User -> reuses user, creates ClubMembership
  - [x] 6.3 Slug collision auto-resolution: `generateUniqueSlug` returns suffixed slug when base is taken
  - [x] 6.4 Email failure: `sendEmail` throws -> provisioning rolled back, returns `EMAIL_FAILED`
  - [x] 6.5 Existing slug conflict (operator-provided): returns `SLUG_CONFLICT` (existing behavior preserved)
  - [x] 6.6 All existing test cases from Story 2.2 still pass (regression)
- [x] Task 7: Run full test suite, typecheck, lint, build

## Dev Notes

### Architecture & Constraints

- **Prisma import**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'`
- **Server Action pattern**: Return `{ success: true }` OR `{ success: false; error: string; code: 'SCREAMING_SNAKE_CASE' }`
- **Transaction strategy**: Story 2.2 established serializable `$transaction` for slug conflict + approval atomicity. Extend this same transaction to include Club, User, and ClubMembership creation. Email sending happens OUTSIDE the transaction (Resend is external); use compensating deletion on email failure.
- **Multi-tenant isolation**: The Application model is platform-level (NOT club-scoped). The new Club record will be club-scoped going forward.
- **Magic-link token storage**: Goes on `User.magicToken` (SHA-256 hash) and `User.magicTokenExp` (1-hour TTL). This is the existing pattern from Story 1.3 — do NOT create a new token field on Application.
- **Existing magic-link verification**: `src/app/[lang]/auth/magic-link/actions.ts` already handles token lookup via `prisma.user.findUnique({ where: { magicToken: tokenHash } })` and TTL check. The setup flow (`/auth/setup`) handles password + TOTP enrollment. **No changes needed to the magic-link verification or setup flow.**
- **Club.status**: Use `ACTIVE` (ClubStatus enum), not a string literal.
- **Club.@@unique([slug, country])**: Slug uniqueness is per-country. Two clubs in different countries CAN share a slug.

### Key Existing Code to Reuse

| File | What to reuse |
|------|--------------|
| `src/app/[lang]/admin/(protected)/applications/actions.ts` | Extend existing `approveApplication` — do NOT create a new action |
| `src/lib/slug.ts` | `generateSlug()`, `isReservedSlug()`, `RESERVED_SLUGS` — add `generateUniqueSlug()` here |
| `src/lib/email.ts` | `sendEmail({ to, subject, html })` — already supports Resend (prod) + Mailpit (dev) |
| `src/app/[lang]/auth/magic-link/actions.ts` | `verifyMagicLinkToken()` — no changes needed, it already reads `User.magicToken` |
| `src/app/[lang]/auth/magic-link/route.ts` | Magic-link GET handler — no changes needed |
| `src/app/[lang]/auth/setup/` | Password + TOTP setup flow — no changes needed |
| `src/lib/schemas/application.ts` | `slugRegex` — already used in the existing action |
| `src/components/app/admin/ApplicationQueueItem.tsx` | Update toast message and add EMAIL_FAILED handling |

### Anti-Patterns to Avoid

- **Do NOT create a separate provisioning Server Action** — extend the existing `approveApplication` in the same file
- **Do NOT store magic-link token on the Application model** — use `User.magicToken` / `User.magicTokenExp` (established pattern)
- **Do NOT send email inside the DB transaction** — Resend is an external service; if the transaction commits but email fails, use a compensating delete
- **Do NOT create a new email utility** — use the existing `sendEmail` from `src/lib/email.ts`
- **Do NOT modify the magic-link verification flow** — it already works correctly for this use case
- **Do NOT use `prisma.club.create` outside the transaction** — all DB writes must be in the same `$transaction`

### Project Structure Notes

Files to create:
- None — all changes go in existing files

Files to modify:
- `src/app/[lang]/admin/(protected)/applications/actions.ts` — extend `approveApplication` with provisioning + email
- `src/lib/slug.ts` — add `generateUniqueSlug()` function
- `src/components/app/admin/ApplicationQueueItem.tsx` — update toast message, handle EMAIL_FAILED
- `src/lib/i18n/translations/types.ts` — add email-related translation keys
- `src/lib/i18n/translations/{en,fr,de,it}.ts` — add translations for toast messages
- `src/__tests__/admin-applications.test.ts` — add provisioning + email tests

### Database Schema Reference

**Club model** (create in transaction):
```
id: cuid(), name: application.name, slug: resolvedSlug, country: application.country,
status: ACTIVE, email: application.email, activityTypeId: application.activityTypeId,
locationId: application.locationId, defaultLanguage: inferDefaultLanguage(application.country)
```

**User model** (find or create):
```
findUnique: { where: { email: application.email } }
create: { email: application.email, role: CLUB_ADMIN }
update: { magicToken: sha256(rawToken), magicTokenExp: now + 1h }
```

**ClubMembership model** (create in transaction):
```
userId: user.id, clubId: club.id, role: OWNER, status: ACTIVE, invitedBy: null
```

### Email Content Specification

**Subject**: "Your club site is ready — set up your account"
**From**: `process.env.EMAIL_FROM`
**To**: `application.email`
**Body** (HTML, inline styles):
- Greeting: "Congratulations! Your application for [club name] has been approved."
- Club URL: `https://{host}/{lang}/{country}/{slug}` (or localhost in dev)
- Magic link CTA: `https://{host}/{lang}/auth/magic-link?token={rawToken}`
- Expiry notice: "This link expires in 1 hour."
- Instructions: "Click the link to set your password and enable two-factor authentication."
- Note: The `lang` segment should default to club's `defaultLanguage` for the email link.

### Previous Story Intelligence (from Story 2.2)

- Server Action return type `ApplicationActionResult` already exists — extend its `code` union with `'EMAIL_FAILED'`
- The `approveApplication` function already validates auth, slug, and application status. Add provisioning AFTER the successful `application.updateMany` call, still inside the transaction.
- The `ApplicationQueueItem` component uses `useTransition` + `toast.success()` from Sonner — update the success message
- Test file `src/__tests__/admin-applications.test.ts` has 20 tests (all passing). Add new tests for provisioning; ensure existing tests remain green.
- `slugRegex` imported from `@/lib/schemas/application` — reuse for slug validation
- Transaction mocking pattern: `prisma.$transaction = async (fn) => fn(prisma)` — same pattern for new tests
- Mock `sendEmail` from `@/lib/email` for email tests

### Git Intelligence

Recent commits follow `feat: story X.Y` pattern. Last 5 commits:
```
3640323 feat: story 2.2
c75791e feat: story 2.1
f67fd52 feat: story 2.0
2b124e9 feat: epic 1 retrospective + epic 2 planning
ac99294 fix: updated packages
```

### Testing Requirements

- Framework: Vitest (`pnpm test`)
- Test location: `src/__tests__/admin-applications.test.ts` (extend existing file)
- Mock pattern: `vi.mock('@/server/db')`, `vi.mock('@/server/auth')`, `vi.mock('@/lib/email')`
- Add `vi.mock('@/lib/email')` to mock `sendEmail` — verify it's called with correct args on success, verify rollback on failure
- 3 pre-existing test failures in `setup-password.test.ts` (x2) and `magic-link-route.test.ts` (x1) — unrelated, ignore

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.3]
- [Source: _bmad-output/planning-artifacts/architecture.md — Email Service, Magic Link, Club Model, ClubMembership, ADR-001]
- [Source: _bmad-output/planning-artifacts/prd.md — FR9, FR32, Journey 3, Journey 4]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Journey 3, Journey 4, ApplicationQueueItem spec]
- [Source: src/app/[lang]/admin/(protected)/applications/actions.ts — existing approveApplication]
- [Source: src/lib/slug.ts — generateSlug, isReservedSlug, RESERVED_SLUGS]
- [Source: src/lib/email.ts — sendEmail helper]
- [Source: src/app/[lang]/auth/magic-link/actions.ts — verifyMagicLinkToken, User.magicToken pattern]
- [Source: prisma/schema.prisma — Club, User, ClubMembership, Application models]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation with no blocking issues.

### Completion Notes List

- Extended `approveApplication` Server Action to provision Club, User (find-or-create), ClubMembership, and magic-link token inside a single serializable transaction
- Email sent outside transaction with compensating rollback on failure (deletes Club, ClubMembership, clears magic token, reverts Application to PENDING)
- Created `buildAcceptanceEmailHtml` helper with inline-styled HTML email template
- Added `generateUniqueSlug` utility that appends `-2`, `-3`, etc. on collision (checks both Club table and approved Application slugs)
- Added `inferDefaultLanguage(country)` to `src/lib/country.ts` — maps country codes to default language
- Updated `ApplicationQueueItem` toast to show "Approved — login link sent to {email}" on success
- Added `EMAIL_FAILED` error code with translated messages in all 4 languages (en, fr, de, it)
- Added `approvedWithEmail` translation key with `{email}` placeholder in all 4 languages
- All 32 tests pass in admin-applications (up from 20), including provisioning/email tests, utility tests, email template tests, and reserved slug tests
- Full regression suite: 256/256 tests pass across 28 test files
- TypeScript: zero errors. Lint: clean. Audit: no vulnerabilities. Build: success.

**Code review fixes (2026-03-06):**
- Added reserved slug validation (`isReservedSlug`) before provisioning — prevents operators from assigning platform route slugs like "admin", "auth"
- Removed dead `resolvedSlug` variable (was a no-op assignment)
- Added explicit error handling for compensating rollback failure — surfaces double-failure scenario instead of silently returning SERVER_ERROR
- Added single quote escaping (`&#39;`) in `escapeHtml` for defense-in-depth
- Extracted `SlugCheckClient` interface for `generateUniqueSlug` tx parameter readability
- Added MAX_SLUG_SUFFIX (100) safety limit to prevent infinite loop in `generateUniqueSlug`
- Added direct unit tests for `buildAcceptanceEmailHtml` including XSS escaping verification
- Added reserved slug rejection tests
- Reordered `approvedWithEmail` key adjacent to `approved` in types file

### File List

- `src/app/[lang]/admin/(protected)/applications/actions.ts` — extended approveApplication with provisioning + email
- `src/lib/slug.ts` — added generateUniqueSlug function
- `src/lib/country.ts` — added inferDefaultLanguage function + COUNTRY_DEFAULT_LANGUAGE map
- `src/lib/email-templates.ts` — **new file** — buildAcceptanceEmailHtml helper
- `src/components/app/admin/ApplicationQueueItem.tsx` — updated toast message, added EMAIL_FAILED to error map
- `src/lib/i18n/translations/types.ts` — added approvedWithEmail key, emailFailed error key
- `src/lib/i18n/translations/en.ts` — added approvedWithEmail + emailFailed translations
- `src/lib/i18n/translations/fr.ts` — added approvedWithEmail + emailFailed translations
- `src/lib/i18n/translations/de.ts` — added approvedWithEmail + emailFailed translations
- `src/lib/i18n/translations/it.ts` — added approvedWithEmail + emailFailed translations
- `src/__tests__/admin-applications.test.ts` — extended with provisioning/email tests + utility tests

## Change Log

- 2026-03-06: Implemented application approval provisioning — Club creation, User find-or-create, ClubMembership OWNER, magic-link token generation, acceptance email dispatch with compensating rollback, slug collision auto-resolution utility, defaultLanguage inference, UI feedback updates with i18n support
- 2026-03-06: Code review fixes — reserved slug validation, dead code removal, rollback failure handling, XSS escaping hardening, slug loop safety limit, additional tests (32 total)
