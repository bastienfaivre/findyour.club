# Story 4.9: Operator Club Moderation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Platform Operator**,
I want to **send messages to club admins and force club pages offline when needed**,
So that **I can maintain content quality standards across the platform and communicate moderation decisions clearly**.

## Acceptance Criteria

1. **AC1 — Club detail view**: Given the operator navigates to a club's detail view in the platform admin dashboard, when the view loads, then the operator sees: the club's current profile content (name, logo, description, photos count), visibility status (`isPublished`, `forceOffline`), a "Send message" action, and a "Force offline" / "Lift offline" toggle.

2. **AC2 — Send message**: Given the operator clicks "Send message", when the message dialog appears, then a free-text textarea is shown; on submit, the `sendOperatorMessage` Server Action creates an `OperatorMessage` record and sends a standalone email to the club admin via Resend (FR54, FR56).

3. **AC3 — Force offline with mandatory reason**: Given the operator toggles "Force offline" on a club that is currently live, when the action is confirmed, then a mandatory message field appears — the operator must explain why; the `forceOffline` Server Action sets `forceOffline = true` on the club, creates an `OperatorMessage` with the reason, sends a moderation email, and invalidates the club page cache; the club page immediately becomes invisible to visitors (FR52).

4. **AC4 — Lift offline**: Given the operator toggles "Lift offline" on a force-offline club, when the action is confirmed, then `forceOffline` is set to `false`; the club admin regains control of `isPublished`; if the club was previously published (`isPublished = true`), the page becomes visible again immediately (FR53).

5. **AC5 — OperatorMessage persistence**: Given the operator sends a message or forces a club offline, then the `OperatorMessage` record persists in the database regardless of email delivery status — the DB is the source of truth, email is the notification channel (ADR-004).

6. **AC6 — Club list moderation indicators**: Given the operator views the club list in the admin dashboard, then clubs with `forceOffline = true` are visually flagged (e.g., a red badge or indicator) so the operator can track which clubs are currently under moderation.

## Tasks / Subtasks

### Task 1: Create operator club list page (AC: #1, #6)

- [x] 1.1 Create `src/app/[lang]/admin/(protected)/clubs/page.tsx` — Server Component. Query all clubs with `status: 'ACTIVE'`, select: `id`, `name`, `slug`, `country`, `logo`, `isPublished`, `forceOffline`, `_count: { photos: true, operatorMessages: true }`. Display as a table/list with columns: name (with logo), country, visibility status, photo count, actions link.
- [x] 1.2 Add visual indicator for `forceOffline === true` clubs — red badge "Offline (moderated)" or similar. Show green "Published" badge when `isPublished && !forceOffline`, gray "Draft" when `!isPublished && !forceOffline`.
- [x] 1.3 Add "Clubs" navigation item to the operator admin sidebar/nav. Currently only the dashboard and applications pages exist — add a link to `/admin/clubs`.

### Task 2: Create operator club detail/moderation page (AC: #1)

- [x] 2.1 Create `src/app/[lang]/admin/(protected)/clubs/[id]/page.tsx` — Server Component. Query the club by `id` with full profile data: name, slug, country, logo, description, schedule, howToJoin, contactPhone, contactAddress, email, externalWebsiteUrl, isPublished, forceOffline, status, photos (with count), operatorMessages (recent 10, ordered by createdAt desc). Display the club profile in a read-only view.
- [x] 2.2 Display visibility status section: show `isPublished` and `forceOffline` values with clear labels. Show "Force offline" / "Lift offline" toggle button. Show "Send message" button.
- [x] 2.3 Display recent operator messages history (last 10) — message text, date sent, read/unread status (`readAt` null or not).

### Task 3: Create Server Actions (AC: #2, #3, #4, #5)

- [x] 3.1 Create `src/app/[lang]/admin/(protected)/clubs/[id]/actions.ts` with three Server Actions:
  - `sendOperatorMessage(clubId: string, message: string)` — validates operator role, validates message (non-empty, max 1000 chars), creates `OperatorMessage` record, sends standalone email via `sendEmail()`, returns `{ success: true }`.
  - `toggleForceOffline(clubId: string, reason: string)` — validates operator role, validates reason (non-empty, max 1000 chars), sets `forceOffline = true` on Club, creates `OperatorMessage` with reason, sends moderation email, calls `revalidatePath` for club public page, returns `{ success: true }`.
  - `liftForceOffline(clubId: string)` — validates operator role, sets `forceOffline = false` on Club, calls `revalidatePath` for club public page, returns `{ success: true }`.
- [x] 3.2 All three actions follow the operator auth pattern: `getAuthSession()` → check `session.user.role === 'OPERATOR'` → return `{ success: false, error, code: 'UNAUTHORIZED' }` if not.
- [x] 3.3 All actions return `{ success: boolean, error?: string, code?: string }` — standard error response contract.

### Task 4: Create email templates for moderation (AC: #2, #3)

- [x] 4.1 Add `buildOperatorMessageEmailHtml({ clubName, message })` to `src/lib/email-templates.ts` — standalone moderation email. Follow the existing template pattern (table-based layout, 560px, inline styles, `escapeHtml()` for user content). Subject: "Message from the platform about {clubName}".
- [x] 4.2 Add `buildForceOfflineEmailHtml({ clubName, reason })` to `src/lib/email-templates.ts` — moderation email explaining why the club was taken offline. Include the reason in a highlighted block (same blue-bordered style as the approval message block). Subject: "Your club page has been taken offline — {clubName}".

### Task 5: Create client components for moderation actions (AC: #2, #3, #4)

- [x] 5.1 Create `src/components/app/admin/SendMessageDialog.tsx` — `"use client"` component. Uses shadcn `Dialog`, `Textarea`, `Button`. Props: `clubId: string`, `clubName: string`. On submit, calls `sendOperatorMessage` Server Action. Shows loading state during submission, success toast on completion, error display on failure. Max 1000 character limit with counter.
- [x] 5.2 Create `src/components/app/admin/ForceOfflineDialog.tsx` — `"use client"` component. Uses shadcn `AlertDialog`, `Textarea`, `Button`. Props: `clubId: string`, `clubName: string`. Mandatory reason textarea (cannot submit with empty reason). On confirm, calls `toggleForceOffline` Server Action. Shows loading state, success toast, error display. Destructive action styling (red confirm button).
- [x] 5.3 Create `src/components/app/admin/LiftOfflineButton.tsx` — `"use client"` component. Simple button with confirmation. Props: `clubId: string`, `clubName: string`. On click, shows confirm dialog ("Are you sure you want to lift the offline status?"). On confirm, calls `liftForceOffline` Server Action. Shows loading state, success toast.

### Task 6: Add i18n translations (AC: all)

- [x] 6.1 Add translation keys to `src/lib/i18n/translations/types.ts` under `admin` namespace: `clubs: string`, `clubModeration: string`, `sendMessage: string`, `forceOffline: string`, `liftOffline: string`, `messageRequired: string`, `reasonRequired: string`, `messageSent: string`, `clubForcedOffline: string`, `offlineLifted: string`, `published: string`, `draft: string`, `moderatedOffline: string`, `viewClub: string`, `recentMessages: string`, `noMessages: string`, `read: string`, `unread: string`, `messagePlaceholder: string`, `reasonPlaceholder: string`.
- [x] 6.2 Add translations to all 4 language files (`en.ts`, `fr.ts`, `de.ts`, `it.ts`).

### Task 7: Write tests (AC: all)

- [x] 7.1 Create `src/__tests__/operator-club-moderation.test.ts` — test all three Server Actions:
  - `sendOperatorMessage`: auth guard (non-operator rejected), creates OperatorMessage record, calls sendEmail, returns success. Test empty message validation, max length validation.
  - `toggleForceOffline`: auth guard, sets forceOffline=true, creates OperatorMessage, calls sendEmail, calls revalidatePath. Test empty reason validation. Test club not found.
  - `liftForceOffline`: auth guard, sets forceOffline=false, calls revalidatePath. Test club not found.
- [x] 7.2 Test email template rendering: verify `buildOperatorMessageEmailHtml` and `buildForceOfflineEmailHtml` produce valid HTML with escaped content.
- [x] 7.3 Test club list page query: verify all clubs returned with correct status indicators.

## Dev Notes

### Architecture Patterns & Constraints

- **Operator auth pattern**: Every Server Action begins with `getAuthSession()` → check `session.user.role === 'OPERATOR'` → return `{ success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }`. This is NOT the club-level `authGuard()` — operators don't need `ClubMembership`. They have full platform scope.
- **Error response contract**: Always `{ success: boolean, error?: string, code?: string }` — never throw from Server Actions.
- **Prisma import**: `import { prisma } from '@/server/db'`, models from `'@/generated/prisma/client'`.
- **Two-flag visibility (ADR-003)**: `isPublished` (club admin) + `forceOffline` (operator). Page visible only when `isPublished === true && forceOffline === false`. Story 4.7 already implemented the club admin side; this story implements the operator side.
- **OperatorMessage (ADR-004)**: Append-only records. Never delete. `readAt` is the only mutable field. DB is source of truth, email is notification channel. Create message BEFORE sending email — if email fails, the message still exists in DB.
- **`revalidatePath` after mutations**: When toggling `forceOffline`, invalidate the club's public page URL: `revalidatePath(\`/${lang}/${country}/${slug}\`)`. Also invalidate directory pages if clubs appear/disappear.
- **Server Actions co-located with route**: Place actions in `src/app/[lang]/admin/(protected)/clubs/[id]/actions.ts` — one actions file per route segment, never import across segments.

### Existing Code to Reuse (DO NOT Reinvent)

- **`sendEmail()`** (`src/lib/email.ts`) — dual-mode email sender (Resend prod / Nodemailer dev). Use this for ALL email sending.
- **`escapeHtml()`** (`src/lib/email-templates.ts`) — HTML escaping for user content in emails. ALWAYS use this.
- **`buildAcceptanceEmailHtml()`** (`src/lib/email-templates.ts`) — reference for email template structure (table layout, 560px, inline styles, conditional operator message block).
- **`getAuthSession()`** (`src/server/auth.ts`) — session wrapper that reads `totp_verified` cookie. Use this, NOT raw `getServerSession()`.
- **`ApplicationQueue` / `ApplicationQueueItem`** (`src/components/app/admin/`) — reference for operator UI component patterns.
- **Operator admin layout** (`src/app/[lang]/admin/(protected)/layout.tsx`) — already enforces `OPERATOR` role + TOTP check. New pages under this layout are automatically protected.
- **Existing shadcn components**: `Dialog`, `AlertDialog`, `Button`, `Textarea`, `Badge`, `Table` — all available, no need to install new ones.
- **`PublishToggle`** (`src/components/app/club-admin/PublishToggle.tsx`) — reference for how the club admin side handles `forceOffline`. The `forceOffline` disabled state and message are already implemented here.
- **`OperatorMessageBanner`** (`src/components/app/club-admin/OperatorMessageBanner.tsx`) — the club admin already reads messages. Story 4.9 creates the operator side that SENDS messages.

### What NOT to Touch

- Do NOT modify the club admin dashboard (`src/app/[lang]/(country)/[country]/[club]/admin/`) — that's the club admin's territory.
- Do NOT modify `togglePublish` in club admin actions — that's the club admin's publish toggle (story 4.7).
- Do NOT modify `OperatorMessageBanner` — the reading side is already working.
- Do NOT change the `OperatorMessage` schema — it's already correct from story 4.1.
- Do NOT modify `getClubPublicData()` or the public page rendering — that's story 4.8's code and it already handles the two-flag visibility.

### Component File Placement (Strict Convention)

- New operator pages: `src/app/[lang]/admin/(protected)/clubs/` directory
  - `page.tsx` — club list
  - `[id]/page.tsx` — club detail / moderation
  - `[id]/actions.ts` — server actions
- New operator components: `src/components/app/admin/` directory (alongside existing `ApplicationQueue`)
  - `SendMessageDialog.tsx`
  - `ForceOfflineDialog.tsx`
  - `LiftOfflineButton.tsx`
- Email templates: extend `src/lib/email-templates.ts` (add new builder functions)
- Tests: `src/__tests__/operator-club-moderation.test.ts`

### Testing Standards

- Framework: Vitest (`pnpm test`)
- Mock pattern: `vi.mock('@/server/db')`, `vi.mock('@/server/auth')`, `vi.mock('@/lib/email')`, `vi.mock('next/cache')`
- Test auth guard: verify `UNAUTHORIZED` returned when session missing or role is not `OPERATOR`
- Test input validation: empty message, too-long message, missing clubId
- Test DB operations: verify `prisma.operatorMessage.create` called with correct data, verify `prisma.club.update` called with correct `forceOffline` value
- Test email: verify `sendEmail` called with correct `to`, `subject`, `html` (don't test email content deeply — separate template test)
- Test `revalidatePath`: verify called with correct path pattern after forceOffline/liftOffline
- Current test count: ~439 passing (from story 4.8)

### Previous Story Intelligence (4.8)

**Key patterns established:**
- Server components for page rendering; `"use client"` only for interactive islands
- `getClubPublicData()` already filters by `isPublished: true, forceOffline: false`
- Profile component structure: `src/components/app/club-profile/`
- Photo carousel, ProfileSection, ContactInfo patterns established

**Files created in 4.8:**
- `src/components/app/club-profile/ProfilePage.tsx`
- `src/components/app/club-profile/PhotoCarousel.tsx`
- `src/components/app/club-profile/ProfileSection.tsx`
- `src/components/app/club-profile/ContactInfo.tsx`

**Code review fixes from 4.8:** 44px touch targets on carousel dots, aria-label on carousel region, shadcn Button for website link, aria-hidden on decorative icons

### Git Intelligence

- Recent commit pattern: `feat: story X.Y`
- Stories 4.4→4.7 modified admin code: `admin/actions.ts`, `admin/page.tsx`, translation files
- Story 4.8 modified PUBLIC code: club page, directory queries, new profile components
- Story 4.9 modifies OPERATOR code: new routes under `admin/(protected)/clubs/`, new operator components under `components/app/admin/`
- No overlap with club admin or public page code

### Email Implementation Details

**Existing email infrastructure:**
- `sendEmail()` in `src/lib/email.ts` — auto-switches between Resend (prod, when `RESEND_API_KEY` set) and Nodemailer/Mailpit (dev, localhost:1025)
- Email templates in `src/lib/email-templates.ts` — use `escapeHtml()` for all user content, table-based layout, 560px max-width, inline styles
- Approval email already has conditional operator message block (blue-bordered highlight) — reuse this visual pattern
- Message max length: 1000 characters (established in `approveApplication` validation)
- Club admin email: the club's `email` field on the `Club` model — query it when sending

**New emails to create:**
1. **Standalone operator message**: "Message from the platform about {clubName}" — similar to approval message block but as standalone email
2. **Force offline notification**: "Your club page has been taken offline — {clubName}" — include reason in highlighted block, explain what happened and what admin can do

### Club Query for Detail Page

Query the club by ID for the operator detail view:
```typescript
const club = await prisma.club.findUnique({
  where: { id: params.id },
  select: {
    id: true, name: true, slug: true, country: true, logo: true,
    email: true, description: true, schedule: true, howToJoin: true,
    contactPhone: true, contactAddress: true, externalWebsiteUrl: true,
    isPublished: true, forceOffline: true, status: true,
    _count: { select: { photos: true } },
    operatorMessages: {
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, message: true, createdAt: true, readAt: true },
    },
  },
})
```

**Important**: Operator queries do NOT filter by `clubId` scope (unlike club admin queries). Operators have full platform access. But they still query by specific `id` — no cross-club data leakage risk since the operator sees one club at a time.

### `revalidatePath` Details

After `toggleForceOffline` or `liftForceOffline`, invalidate:
- Club public page: needs `lang`, `country`, `slug` — query these from the club record
- Directory pages: `revalidatePath(\`/${lang}/${country}\`)` for the country directory
- Platform homepage: `revalidatePath(\`/${lang}\`)` for club counts

Since the operator action doesn't have `lang` in scope from the URL (operator pages use `[lang]/admin/...`), get `lang` from the URL param and the club's `country` + `slug` from the DB query. Use `revalidatePath` with the `'page'` type to only invalidate the specific pages.

### Project Structure Notes

- New `src/app/[lang]/admin/(protected)/clubs/` directory aligns with architecture doc's operator dashboard structure
- `src/app/[lang]/admin/(protected)/clubs/[id]/` matches the architecture doc's `admin/clubs/[clubId]/` pattern
- Actions file placement: `src/app/[lang]/admin/(protected)/clubs/[id]/actions.ts` matches the `sendOperatorMessage`, `toggleForceOffline` actions described in architecture
- Components in `src/components/app/admin/` alongside existing `ApplicationQueue` components

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.9]
- [Source: _bmad-output/planning-artifacts/architecture.md — ADR-003 Two-flag visibility, ADR-004 Unified OperatorMessage]
- [Source: _bmad-output/planning-artifacts/architecture.md — Operator dashboard structure, admin/clubs/[clubId]/actions.ts]
- [Source: _bmad-output/planning-artifacts/architecture.md — Auth Check Pattern, Error Response Contract, Multi-Tenant Query Pattern]
- [Source: _bmad-output/implementation-artifacts/4-8-club-profile-page-public-rendering.md — Previous story learnings]
- [Source: _bmad-output/implementation-artifacts/4-7-publish-unpublish-operator-message-banner.md — OperatorMessage banner, PublishToggle patterns]
- [Source: src/lib/email.ts — sendEmail() dual-mode sender]
- [Source: src/lib/email-templates.ts — buildAcceptanceEmailHtml, escapeHtml, email template structure]
- [Source: src/app/[lang]/admin/(protected)/applications/actions.ts — approveApplication operator auth pattern, OperatorMessage creation]
- [Source: src/app/[lang]/admin/(protected)/layout.tsx — Operator role guard + TOTP check]
- [Source: src/components/app/club-admin/PublishToggle.tsx — forceOffline disabled state reference]
- [Source: src/components/app/club-admin/OperatorMessageBanner.tsx — Message reading UI reference]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed TS error: Club model uses `logoUrl` not `logo` — corrected in both page files

### Completion Notes List

- Task 1: Created operator club list page with status badges (Published/Draft/Offline moderated), logo, country, photo count, and link to detail view
- Task 2: Created operator club detail/moderation page with full club profile overview, visibility status section, send message/force offline/lift offline actions, and recent messages history
- Task 3: Created 3 Server Actions (sendOperatorMessage, toggleForceOffline, liftForceOffline) with operator auth guard, input validation, OperatorMessage creation, email sending, and revalidatePath
- Task 4: Created buildOperatorMessageEmailHtml and buildForceOfflineEmailHtml email templates following existing table-based layout pattern with escapeHtml
- Task 5: Created SendMessageDialog (Dialog + Textarea), ForceOfflineDialog (AlertDialog + mandatory reason), LiftOfflineButton (AlertDialog confirmation) client components with loading states and toast notifications
- Task 6: Added 20 translation keys to types.ts and all 4 language files (en, fr, de, it)
- Task 7: Created 17 tests covering all 3 Server Actions (auth guard, validation, DB ops, email, revalidatePath) and email template rendering (HTML escaping, XSS prevention)
- Added "Clubs" navigation link to operator dashboard

## Senior Developer Review (AI)

**Date:** 2026-03-08
**Reviewer:** Claude Opus 4.6
**Outcome:** Approve (after fixes)

### Safety Checks
- pnpm tsc --noEmit: PASSED
- pnpm lint: PASSED (0 errors, 2 warnings)
- pnpm audit: PASSED
- pnpm build: PASSED
- Tests: 456/456 passing

### Action Items

- [x] [HIGH] Non-atomic `toggleForceOffline` — wrapped in `prisma.$transaction`
- [x] [HIGH] Hardcoded English strings — replaced with i18n translation keys (added 10 new keys)
- [x] [HIGH] `sendOperatorMessage` missing `revalidatePath` — added admin page revalidation to all 3 actions
- [x] [MED] `SendMessageDialog` missing `DialogDescription` — added with descriptive text
- [x] [MED] Entire `Translations` object serialized to client — narrowed to `clubs` + `common` sub-objects
- [x] [MED] Email subjects hardcoded English — noted as project-wide pattern (consistent with existing `approveApplication`, `rejectApplication`); no change
- [x] [LOW] `LiftOfflineButton` redundant description — improved with meaningful explanation

### Change Log

- 2026-03-08: Implemented operator club moderation — club list, detail/moderation page, server actions, email templates, client components, i18n, tests (17 new tests, 456 total passing)
- 2026-03-08: Code review fixes — 6 issues resolved (3 HIGH, 2 MED, 1 LOW): transaction safety, i18n completeness, cache revalidation, accessibility, client bundle optimization, dialog descriptions
- 2026-03-08: Shadcn dashboard pattern — platform admin layout updated with SidebarProvider + SidebarInset + PlatformAdminSidebar component (Dashboard, Applications, Clubs nav items). Admin pages stripped of redundant `<main>` wrappers. Platform admin layout now provides the dashboard shell instead of bare auth guards.

### File List

- src/app/[lang]/admin/(protected)/clubs/page.tsx (new)
- src/app/[lang]/admin/(protected)/clubs/[id]/page.tsx (new)
- src/app/[lang]/admin/(protected)/clubs/[id]/actions.ts (new)
- src/app/[lang]/admin/(protected)/page.tsx (modified — added Clubs nav link)
- src/components/app/admin/SendMessageDialog.tsx (new)
- src/components/app/admin/ForceOfflineDialog.tsx (new)
- src/components/app/admin/LiftOfflineButton.tsx (new)
- src/lib/email-templates.ts (modified — added buildOperatorMessageEmailHtml, buildForceOfflineEmailHtml)
- src/lib/i18n/translations/types.ts (modified — added admin.clubs namespace)
- src/lib/i18n/translations/en.ts (modified — added clubs translations)
- src/lib/i18n/translations/fr.ts (modified — added clubs translations)
- src/lib/i18n/translations/de.ts (modified — added clubs translations)
- src/lib/i18n/translations/it.ts (modified — added clubs translations)
- src/__tests__/operator-club-moderation.test.ts (new)
