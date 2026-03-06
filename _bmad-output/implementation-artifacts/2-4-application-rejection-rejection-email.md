# Story 2.4: Application Rejection — Rejection Email

Status: done

## Story

As a Platform Operator,
I want rejecting an application to send a courteous rejection email with a brief explanation,
so that applicants understand the platform's curation criteria and feel respected.

## Acceptance Criteria

1. **Given** the operator confirms rejection with an optional reason, **When** the `rejectApplication` Server Action executes, **Then** the application status is updated to `rejected`; a rejection email is sent via Resend to the applicant's email address including the optional explanation text and a statement of the platform's non-profit association focus.

2. **Given** rejection completes successfully, **Then** the `ApplicationQueueItem` row is removed from the queue; a toast confirms: "Rejected — notification sent to [email]."

3. **Given** no rejection reason is provided, **Then** the rejection email uses a default templated explanation referencing the platform's niche (non-profit, real-world community activity focus).

4. **Given** the email dispatch fails, **Then** the Server Action returns an error response; the application status is NOT updated to `rejected`; the operator sees an inline error and can retry.

## Tasks / Subtasks

- [x] Task 1: Update `rejectApplication` Server Action to send rejection email (AC: 1, 3, 4)
  - [x] 1.1 Move the DB update AFTER email sending succeeds — email first, then update status. If email fails, return `{ success: false, error: '...', code: 'EMAIL_FAILED' }` without updating the application.
  - [x] 1.2 Read `application.email` and `application.name` from the fetched application record (already queried in existing code)
  - [x] 1.3 Build rejection email HTML using `buildRejectionEmailHtml()` from `src/lib/email-templates.ts`
  - [x] 1.4 Call `sendEmail({ to: application.email, subject, html })` — wrap in try/catch; on failure return `EMAIL_FAILED`
  - [x] 1.5 On email success, proceed with existing `application.updateMany` to set status `REJECTED`
  - [x] 1.6 Add `EMAIL_FAILED` to the `ApplicationActionResult` error code union type (if not already present for rejection context)
- [x] Task 2: Create rejection email HTML template (AC: 1, 3)
  - [x] 2.1 Add `buildRejectionEmailHtml({ clubName, rejectionReason?: string })` to `src/lib/email-templates.ts`
  - [x] 2.2 Follow exact same styling as `buildAcceptanceEmailHtml` — outer table 100%, inner 560px, inline CSS, `escapeHtml()` for all user-provided strings
  - [x] 2.3 Content: courteous greeting addressing club name, rejection explanation (operator-provided reason if present, default template text if not), statement about platform's non-profit community focus, encouragement to reapply if circumstances change
  - [x] 2.4 Default explanation when no reason provided: reference the platform's focus on non-profit, real-world community activity associations
  - [x] 2.5 Subject line: "Regarding your application for [club name]"
- [x] Task 3: Update UI feedback (AC: 2, 4)
  - [x] 3.1 Update toast message in `ApplicationQueueItem` to show "Rejected — notification sent to [email]" on success (new translation key `rejectedWithEmail` with `{email}` placeholder)
  - [x] 3.2 Handle `EMAIL_FAILED` error code in the error map — show specific inline error: "Rejection email could not be sent. The application status was not changed. Please retry."
- [x] Task 4: Add i18n translation keys (AC: 2, 3)
  - [x] 4.1 Add `rejectedWithEmail` key to `types.ts` and all 4 language files (en, fr, de, it) — pattern: "Rejected — notification sent to {email}"
  - [x] 4.2 Add `emailFailed` error key for rejection context (if not already shared with approval)
- [x] Task 5: Write tests (AC: 1-4)
  - [x] 5.1 Happy path with reason: PENDING application -> email sent with reason -> status updated to REJECTED -> returns `{ success: true }`
  - [x] 5.2 Happy path without reason: PENDING application -> email sent with default text -> status updated to REJECTED
  - [x] 5.3 Email failure: `sendEmail` throws -> application status NOT changed -> returns `EMAIL_FAILED`
  - [x] 5.4 Verify `sendEmail` called with correct `to`, `subject`, `html` args
  - [x] 5.5 Verify `buildRejectionEmailHtml` escapes HTML in club name and rejection reason (XSS prevention)
  - [x] 5.6 All existing test cases from Story 2.3 still pass (regression)
- [x] Task 6: Run full test suite, typecheck, lint, build

## Dev Notes

### Architecture & Constraints

- **Prisma import**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'`
- **Server Action return type**: `{ success: true }` OR `{ success: false; error: string; code: 'SCREAMING_SNAKE_CASE' }` — never throw
- **Email-before-update strategy**: Unlike approval (which provisions resources requiring compensating rollback), rejection is simpler — send email FIRST, update DB status ONLY on email success. If email fails, return error and leave application in PENDING state so operator can retry.
- **No transaction needed for rejection**: The only DB write is `application.updateMany` to set status to REJECTED. No multi-table provisioning. Send email first, then update.
- **Application model**: `email` field always present (required field). `rejectionReason` field already exists in schema (nullable String). `reviewedAt` timestamp already set by existing code.
- **`escapeHtml()` is critical**: The `rejectionReason` is operator-entered free text — MUST be HTML-escaped before embedding in email template.

### Key Existing Code to Reuse

| File | What to reuse |
|------|--------------|
| `src/app/[lang]/admin/(protected)/applications/actions.ts` | Extend existing `rejectApplication` — do NOT create a new action |
| `src/lib/email-templates.ts` | `escapeHtml()` helper + `buildAcceptanceEmailHtml` as styling reference — add `buildRejectionEmailHtml()` here |
| `src/lib/email.ts` | `sendEmail({ to, subject, html })` — already supports Resend (prod) + Mailpit (dev) |
| `src/components/app/admin/ApplicationQueueItem.tsx` | Update toast message and add EMAIL_FAILED handling for rejection |
| `src/lib/i18n/translations/types.ts` | Add `rejectedWithEmail` key adjacent to existing `rejected` key |
| `src/__tests__/admin-applications.test.ts` | Extend with email tests — `sendEmail` mock already exists from Story 2.3 |

### Anti-Patterns to Avoid

- **Do NOT update application status before confirming email delivery** — if email fails, status must remain PENDING so operator can retry
- **Do NOT create a separate Server Action** — extend the existing `rejectApplication` in the same file
- **Do NOT create a new email utility** — use the existing `sendEmail` from `src/lib/email.ts`
- **Do NOT skip HTML escaping** — `rejectionReason` is user input, use `escapeHtml()` from `src/lib/email-templates.ts`
- **Do NOT use a transaction** — rejection has a single DB write, no atomicity concern across tables
- **Do NOT modify the rejection dialog UI** — it already has a reason textarea, confirm button, and all the right UX; only update the toast message and error handling

### Current `rejectApplication` Implementation (lines ~200-230 of actions.ts)

The existing function:
1. Validates auth (OPERATOR role check)
2. Queries the application by ID (must be PENDING)
3. Updates `status: REJECTED`, `rejectionReason`, `reviewedAt`
4. Returns `{ success: true }`

**What changes**: Insert email sending BETWEEN the query (step 2) and the update (step 3). If email fails, return error without updating.

### Current UI Implementation

The rejection dialog in `ApplicationQueueItem.tsx` already has:
- `Dialog` with `Textarea` for optional rejection reason (max 1000 chars)
- Translated title/description/placeholder
- `rejectReason` state passed to the action
- Toast on success: currently `t.admin.applications.rejected` — update to `rejectedWithEmail` with `{email}` placeholder
- Error handling via `resolveErrorMessage()` — add `EMAIL_FAILED` case

### Email Content Specification

**Subject**: "Regarding your application for [club name]"
**From**: `process.env.EMAIL_FROM`
**To**: `application.email`
**Body** (HTML, inline styles, same layout as acceptance email):
- Greeting: "Thank you for your interest in joining [platform name] with [club name]."
- Explanation: If `rejectionReason` provided, display it. If not, use default: "After careful review, we were unable to approve your application at this time. Our platform focuses on non-profit associations engaged in real-world community activities."
- Encouragement: "If your circumstances change or you believe this decision was made in error, you are welcome to submit a new application."
- Closing: Professional sign-off

### Project Structure Notes

Files to create:
- None — all changes go in existing files

Files to modify:
- `src/app/[lang]/admin/(protected)/applications/actions.ts` — add email sending to `rejectApplication`
- `src/lib/email-templates.ts` — add `buildRejectionEmailHtml()` function
- `src/components/app/admin/ApplicationQueueItem.tsx` — update toast message for rejection
- `src/lib/i18n/translations/types.ts` — add `rejectedWithEmail` key
- `src/lib/i18n/translations/en.ts` — add translation
- `src/lib/i18n/translations/fr.ts` — add translation
- `src/lib/i18n/translations/de.ts` — add translation
- `src/lib/i18n/translations/it.ts` — add translation
- `src/__tests__/admin-applications.test.ts` — add rejection email tests

### Database Schema Reference

**Application model** (no schema changes needed):
```
id: cuid(), name: String, email: String, country: String,
status: ApplicationStatus (PENDING | APPROVED | REJECTED),
rejectionReason: String? (already exists),
reviewedAt: DateTime? (already set by existing code)
```

### Previous Story Intelligence (from Story 2.3)

- `sendEmail` mock pattern: `vi.mock('@/lib/email')` — already in test file
- `EMAIL_FAILED` error code already exists in `ApplicationActionResult` union — reuse for rejection
- `buildAcceptanceEmailHtml` in `email-templates.ts` has the exact HTML/CSS pattern to follow
- `escapeHtml()` already exported from `email-templates.ts` — handles `&`, `<`, `>`, `"`, `'`
- Toast message pattern: `rejectedWithEmail` should mirror `approvedWithEmail` — use `{email}` placeholder with `.replace('{email}', application.email)`
- All 32 existing tests in `admin-applications.test.ts` must remain green
- 3 pre-existing test failures in `setup-password.test.ts` (x2) and `magic-link-route.test.ts` (x1) — unrelated, ignore

### Git Intelligence

Recent commits follow `feat: story X.Y` pattern:
```
08652d2 feat: story 2.3
3640323 feat: story 2.2
c75791e feat: story 2.1
f67fd52 feat: story 2.0
```

### Testing Requirements

- Framework: Vitest (`pnpm test`)
- Test location: `src/__tests__/admin-applications.test.ts` (extend existing file)
- Mock pattern: `vi.mock('@/server/db')`, `vi.mock('@/server/auth')`, `vi.mock('@/lib/email')`
- `sendEmail` mock is already set up — verify it's called with correct args on success, verify it's NOT called or that failure is handled gracefully
- Existing rejection tests (6 tests) cover auth, validation, not-found, already-reviewed — add email-specific tests alongside

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.4]
- [Source: _bmad-output/planning-artifacts/architecture.md — Email Service, Server Action patterns, Error Handling]
- [Source: _bmad-output/planning-artifacts/prd.md — FR33]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ApplicationQueueItem rejection dialog]
- [Source: src/app/[lang]/admin/(protected)/applications/actions.ts — existing rejectApplication]
- [Source: src/lib/email-templates.ts — buildAcceptanceEmailHtml, escapeHtml]
- [Source: src/lib/email.ts — sendEmail helper]
- [Source: src/components/app/admin/ApplicationQueueItem.tsx — rejection dialog + toast]
- [Source: prisma/schema.prisma — Application model with rejectionReason field]
- [Source: _bmad-output/implementation-artifacts/2-3-application-approval-provisioning-acceptance-email.md — previous story patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Restructured `rejectApplication` to fetch the application first, send email, then update status (email-before-update pattern)
- Created `buildRejectionEmailHtml` following exact same HTML/CSS layout as acceptance email
- Exported `escapeHtml` from email-templates.ts (was private, needed for tests and future reuse)
- Updated toast message to show "Rejected — notification sent to {email}" using new `rejectedWithEmail` translation key
- Updated `emailFailed` error message across all 4 languages to be generic (works for both approval and rejection flows)
- Added 8 rejection-specific tests (happy path with/without reason, email failure, arg verification, not found, already reviewed, unauthorized, server error)
- Added 5 `buildRejectionEmailHtml` tests (content, default text, XSS escaping for club name and reason, reapply encouragement)
- All 263 tests pass, zero TypeScript errors, lint clean, no audit vulnerabilities, build succeeds
- [Code Review] Fixed race condition: `updateMany` result count now checked — returns `ALREADY_REVIEWED` if concurrent rejection occurred
- [Code Review] Added race condition test and null-session test for rejectApplication
- [Code Review] All 265 tests pass after review fixes

### File List

- `src/app/[lang]/admin/(protected)/applications/actions.ts` — modified (restructured `rejectApplication` to send email before DB update)
- `src/lib/email-templates.ts` — modified (added `buildRejectionEmailHtml`, exported `escapeHtml`)
- `src/components/app/admin/ApplicationQueueItem.tsx` — modified (updated rejection toast to `rejectedWithEmail`)
- `src/lib/i18n/translations/types.ts` — modified (added `rejectedWithEmail` key)
- `src/lib/i18n/translations/en.ts` — modified (added `rejectedWithEmail`, updated `emailFailed`)
- `src/lib/i18n/translations/fr.ts` — modified (added `rejectedWithEmail`, updated `emailFailed`)
- `src/lib/i18n/translations/de.ts` — modified (added `rejectedWithEmail`, updated `emailFailed`)
- `src/lib/i18n/translations/it.ts` — modified (added `rejectedWithEmail`, updated `emailFailed`)
- `src/__tests__/admin-applications.test.ts` — modified (added 13 new tests for rejection email + template)

## Change Log

- 2026-03-06: Implemented rejection email sending with email-before-update pattern, rejection email template, updated UI toast, i18n keys, and comprehensive tests
- 2026-03-06: Code review fixes — race condition guard on updateMany, added 2 new tests (race condition + null session)
