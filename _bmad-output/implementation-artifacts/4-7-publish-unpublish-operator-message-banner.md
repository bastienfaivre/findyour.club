# Story 4.7: Publish/Unpublish & Operator Message Banner

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **club admin**,
I want to **publish or unpublish my club's public page and see operator messages in a persistent banner**,
so that **I control my club's online visibility and stay informed about platform communications**.

## Acceptance Criteria

### Publish/Unpublish Toggle

1. Club admin sees a publish toggle in the admin dashboard showing the current `isPublished` state (FR49)
2. When `isPublished = false` AND `forceOffline = false`: admin can toggle publish ON → `isPublished = true`, public page becomes visible, success toast "Your club page is now live"
3. When `isPublished = true` AND `forceOffline = false`: admin can toggle publish OFF → `isPublished = false`, public page goes offline, confirmation toast "Your club page is now offline"
4. When `forceOffline = true` (operator override active): publish toggle is **disabled** with explanatory message: "Your page has been taken offline by the platform. Check your messages for details." Admin cannot change `isPublished` until operator lifts the override (FR51, FR52)
5. Publish/unpublish action triggers `revalidatePath` to immediately update the public page cache
6. Toggle state change is **immediate** (Server Action, no form dirty state / SaveBar integration)

### Operator Message Banner

7. When club has **unread** `OperatorMessage` records (`readAt IS NULL`): a persistent banner appears at the top of the admin content area showing the most recent unread message (FR55)
8. If multiple unread messages exist: banner includes a "View all messages" link/button that displays all messages (newest first)
9. When admin clicks "Mark as read" or dismisses the banner: `readAt` timestamp is set on the message, banner disappears (or shows next unread if any)
10. When club has **no unread** operator messages: no banner displayed
11. Operator message banner is visible on **all** admin pages (rendered in the admin layout, not a specific page)

### Visibility Logic

12. Public club pages MUST check `isPublished === true AND forceOffline === false` before rendering (guard for Story 4.8, but toggle logic must be correct now)

## Tasks / Subtasks

- [x] Task 1: Create `togglePublish` Server Action (AC: 1, 2, 3, 4, 5, 6)
  - [x] 1.1 Add `togglePublish(lang, country, slug)` to `src/app/[lang]/(country)/[country]/[club]/admin/actions.ts`
  - [x] 1.2 Use existing `authGuard()` pattern; return `ActionResult<{ isPublished: boolean }>`
  - [x] 1.3 If `forceOffline = true`, return error with code `FORCE_OFFLINE`
  - [x] 1.4 Toggle `isPublished` via `prisma.club.update()`, call `revalidatePath`
- [x] Task 2: Create `markOperatorMessageAsRead` Server Action (AC: 9)
  - [x] 2.1 Add `markOperatorMessageAsRead(messageId, lang, country, slug)` to admin actions
  - [x] 2.2 Verify club membership via `authGuard()`, verify message belongs to the club
  - [x] 2.3 Set `readAt = new Date()` via `prisma.operatorMessage.update()`
- [x] Task 3: Create `PublishToggle` client component (AC: 1, 2, 3, 4, 6)
  - [x] 3.1 Create `src/components/app/club-admin/PublishToggle.tsx`
  - [x] 3.2 Props: `isPublished`, `forceOffline`, `lang`, `country`, `slug`, `translations`
  - [x] 3.3 Use shadcn `Switch` component with status text
  - [x] 3.4 When `forceOffline = true`: disable switch, show warning message
  - [x] 3.5 Call `togglePublish` Server Action via `useTransition`, show toast on result
- [x] Task 4: Create `OperatorMessageBanner` client component (AC: 7, 8, 9, 10)
  - [x] 4.1 Create `src/components/app/club-admin/OperatorMessageBanner.tsx`
  - [x] 4.2 Props: `messages` (array of unread `OperatorMessage`), `lang`, `country`, `slug`, `translations`
  - [x] 4.3 Show most recent unread message with "Mark as read" button
  - [x] 4.4 If multiple unread messages, show count + expandable list or modal
  - [x] 4.5 Call `markOperatorMessageAsRead` via `useTransition`, update UI optimistically
- [x] Task 5: Integrate into admin layout and page (AC: 7, 11)
  - [x] 5.1 Update `admin/layout.tsx` to query unread `OperatorMessage` records and render `OperatorMessageBanner` above `<main>` content
  - [x] 5.2 Update `admin/page.tsx` to query `isPublished` and `forceOffline` and pass to `PublishToggle`
  - [x] 5.3 Place `PublishToggle` at the top of the Club Profile page (above the form)
- [x] Task 6: Add i18n translations (AC: all)
  - [x] 6.1 Add translation type definitions in `types.ts` under `club.admin`
  - [x] 6.2 Add English translations in `en.ts`
  - [x] 6.3 Add French translations in `fr.ts`
  - [x] 6.4 Add German translations in `de.ts`
  - [x] 6.5 Add Italian translations in `it.ts`
- [x] Task 7: Write tests (AC: all)
  - [x] 7.1 Test `togglePublish`: auth guard, normal toggle, force-offline rejection, revalidation
  - [x] 7.2 Test `markOperatorMessageAsRead`: auth guard, message ownership, timestamp set
  - [x] 7.3 Test edge cases: no unread messages, multiple unread, toggle when already published

## Dev Notes

### Architecture Patterns & Constraints

- **Two-flag visibility model** (ADR-003): `isPublished` (admin) + `forceOffline` (operator) are independent booleans. Page is visible only when `isPublished === true AND forceOffline === false`
- **Unified OperatorMessage** (ADR-004): Replaces old `OperatorNudge`. Append-only audit trail. Records are never deleted, only marked as read via `readAt` timestamp
- **Publish toggle is NOT part of the form dirty state**: It's an immediate action via Server Action, completely independent of the `SaveBar` / `AdminDirtyContext` system
- **OperatorMessage banner is layout-level**: Rendered in the admin layout so it appears on every admin page, not just the profile page

### Server Action Pattern

Follow the existing pattern in `src/app/[lang]/(country)/[country]/[club]/admin/actions.ts`:
- Use `authGuard(country, slug)` for authentication + membership check
- Return `ActionResult<T>` type
- Call `revalidatePath()` after mutations
- All actions are `'use server'` async functions

### Database — Schema Already Exists

All required models are already migrated (Story 4.1):
- `Club.isPublished` (boolean, default false) — `@map("is_published")`
- `Club.forceOffline` (boolean, default false) — `@map("force_offline")`
- `OperatorMessage` model with `id`, `clubId`, `message`, `createdAt`, `readAt`

No schema changes or migrations needed for this story.

### Existing OperatorMessage Usage

Story 4.3 already creates `OperatorMessage` records during application approval:
```
src/app/[lang]/admin/(protected)/applications/actions.ts (lines 115-120)
```
This story only needs to READ and MARK AS READ — never create them.

### Cache Invalidation

After `togglePublish`, call:
```typescript
revalidatePath(`/${lang}/${country}/${slug}`)       // public club page
revalidatePath(`/${lang}/${country}/${slug}/admin`)  // admin dashboard
```

### UI Components

- Use shadcn `Switch` for publish toggle (already available in project)
- Use shadcn `Alert` or a custom banner for operator messages
- Toast notifications via existing toast system (used in `ClubProfileForm`)
- Use `useTransition()` for pending state during Server Action calls

### Project Structure Notes

- All club-admin components go in `src/components/app/club-admin/`
- Server Actions stay in `src/app/[lang]/(country)/[country]/[club]/admin/actions.ts`
- Translation keys extend the existing `club.admin` namespace
- Tests go in `src/__tests__/` following existing naming patterns

### Previous Story Learnings (from 4.6)

- `ClubProfileForm` is the main form component — publish toggle should be ABOVE it, not inside it
- Photo operations are immediate (not deferred to save) — publish toggle follows same "immediate action" pattern
- `authGuard()` helper already handles all authentication boilerplate
- Admin page queries club data with `prisma.club.findUnique()` — add `isPublished`, `forceOffline` to `select`
- `useTransition()` pattern with `startTransition()` is the established pattern for Server Action calls
- i18n keys follow nested object structure: `club.admin.publish.title`, `club.admin.operatorMessages.banner`, etc.
- Total test count as of 4.6: 403 passing tests

### Git Intelligence

Recent commits show consistent `feat: story X.Y` naming. Last 5 commits:
- `de16420 feat: story 4.6` (profile form + photo upload)
- `6ac1274 feat: story 4.5` (unsaved changes protection)
- `66c2815 feat: story 4.4` (admin dashboard shell)
- `2323847 feat: story 4.3` (approval flow + operator message creation)
- `605c99c feat: story 4.2` (application form profile fields)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.7]
- [Source: _bmad-output/planning-artifacts/architecture.md — ADR-003 Two-flag visibility, ADR-004 OperatorMessage]
- [Source: _bmad-output/planning-artifacts/architecture.md — lines 1613-1656 visibility rules]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — PublishToggle.tsx, OperatorMessageBanner.tsx component refs]
- [Source: src/app/[lang]/(country)/[country]/[club]/admin/actions.ts — authGuard pattern, ActionResult type]
- [Source: src/app/[lang]/(country)/[country]/[club]/admin/page.tsx — club data query pattern]
- [Source: src/app/[lang]/(country)/[country]/[club]/admin/layout.tsx — layout structure for banner placement]
- [Source: prisma/schema.prisma — Club model lines 199-200, OperatorMessage model lines 507-518]
- [Source: _bmad-output/implementation-artifacts/4-6-club-profile-edit-form-photo-upload.md — previous story learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed existing `club-admin-layout.test.ts` — needed `@/server/db` mock after adding prisma import to layout
- Fixed existing `club-admin-sidebar.test.ts` — needed `publish` and `operatorMessages` translation keys in mock data

### Completion Notes List

- Implemented `togglePublish` Server Action with authGuard, forceOffline rejection (FORCE_OFFLINE code), and dual revalidatePath (public + admin)
- Implemented `markOperatorMessageAsRead` Server Action with authGuard, multi-tenant message ownership check, and readAt timestamp update
- Created `PublishToggle` client component using shadcn Switch, useTransition + useOptimistic for immediate UI feedback, sonner toast notifications
- Created `OperatorMessageBanner` client component using shadcn Alert, expandable list for multiple messages, local state management for optimistic dismiss
- Integrated OperatorMessageBanner in admin layout (visible on all admin pages), PublishToggle above ClubProfileForm on admin page
- Added i18n translations for all 4 languages (en, fr, de, it) with publish and operatorMessages namespaces
- Installed shadcn Switch component (was not previously available)
- 11 new tests covering both Server Actions: auth guard, normal flows, edge cases, revalidation
- Total test count: 416 passing (was 403)
- All safety checks pass: tsc, lint, audit, build
- Code review fixes (2026-03-08): wrapped togglePublish in $transaction (TOCTOU fix), added readAt: null guard to markOperatorMessageAsRead (audit trail integrity), fixed page.tsx indentation, added message timestamps to banner, replaced hardcoded blue with design tokens, added idempotent mark-as-read test

### Change Log

- 2026-03-08: Implemented publish/unpublish toggle and operator message banner (Story 4.7)
- 2026-03-08: Code review — fixed 3 medium + 3 low issues (TOCTOU race, audit trail guard, formatting, timestamps, design tokens, test coverage)

### File List

- src/app/[lang]/(country)/[country]/[club]/admin/actions.ts (modified — added togglePublish + markOperatorMessageAsRead)
- src/app/[lang]/(country)/[country]/[club]/admin/layout.tsx (modified — added OperatorMessageBanner integration)
- src/app/[lang]/(country)/[country]/[club]/admin/page.tsx (modified — added PublishToggle integration)
- src/components/app/club-admin/PublishToggle.tsx (new)
- src/components/app/club-admin/OperatorMessageBanner.tsx (new)
- src/components/ui/switch.tsx (new — shadcn Switch)
- src/lib/i18n/translations/types.ts (modified — added publish + operatorMessages types)
- src/lib/i18n/translations/en.ts (modified — added publish + operatorMessages translations)
- src/lib/i18n/translations/fr.ts (modified — added publish + operatorMessages translations)
- src/lib/i18n/translations/de.ts (modified — added publish + operatorMessages translations)
- src/lib/i18n/translations/it.ts (modified — added publish + operatorMessages translations)
- src/__tests__/publish-operator-message-actions.test.ts (new — 12 tests)
- src/__tests__/club-admin-layout.test.ts (modified — added prisma mock for operatorMessage)
- src/__tests__/club-admin-sidebar.test.ts (modified — added publish + operatorMessages to mock translations)
