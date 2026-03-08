# Story 4.5: Explicit Save & Unsaved Changes Protection

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Club Admin,
I want all my edits to require an explicit Save action with a persistent unsaved-changes indicator,
So that I never accidentally publish unfinished content or lose work unexpectedly.

## Acceptance Criteria

1. **Given** any edit has been made in the admin dashboard, **When** the change occurs, **Then** the amber unsaved-changes dot appears on the Save button area and is mirrored on the active `AdminSidebar` item; the Save button becomes active (FR17).

2. **Given** the Club Admin attempts to navigate away (close tab, browser back, or click another sidebar item) with unsaved changes, **When** the navigation is attempted, **Then** a "You have unsaved changes" confirmation dialog appears — triggered by `isDirty` state in the dashboard context. For tab/browser close, the browser's native `beforeunload` dialog appears.

3. **Given** the Club Admin clicks Save, **When** the save Server Action completes successfully, **Then** the amber dot clears; a "Saved" toast appears with a timestamp; the form returns to pristine state; the SSR cache is invalidated via `revalidatePath`.

4. **Given** the Club Admin clicks Discard with unsaved changes, **When** they confirm the discard dialog, **Then** all pending changes are reverted to the last saved state; the amber dot clears; no save is made.

5. **Given** a Save action is in flight (Server Action pending), **Then** the Save button shows a spinner and all edit fields are disabled — preventing duplicate submissions.

## Tasks / Subtasks

- [x] Task 1: Create `useUnsavedChanges` custom hook (AC: #1, #2)
  - [x] 1.1 Hook accepts `isDirty: boolean` from react-hook-form's `formState`
  - [x] 1.2 Register `beforeunload` event listener when `isDirty` is `true` (browser tab close / reload)
  - [x] 1.3 Intercept client-side navigation: add click event listener on `<a>` tags within the admin layout to show confirmation dialog before navigating away
  - [x] 1.4 Intercept browser back/forward via `popstate` event when dirty
  - [x] 1.5 Properly clean up all event listeners on unmount and when `isDirty` becomes `false`

- [x] Task 2: Create `UnsavedChangesDialog` component (AC: #2, #4)
  - [x] 2.1 Use shadcn `AlertDialog` — title: "Unsaved changes", description: "You have unsaved changes that will be lost."
  - [x] 2.2 Two actions: "Stay" (cancel) and "Leave" (destructive, proceeds with navigation)
  - [x] 2.3 For Discard action: "Discard" / "Keep editing" buttons — on confirm, call `react-hook-form`'s `reset()` to revert to last saved state
  - [x] 2.4 Add i18n translation keys for all dialog strings (en, fr, de, it)

- [x] Task 3: Create `SaveBar` component (AC: #1, #3, #5)
  - [x] 3.1 Sticky bottom bar (or toolbar area) with Save and Discard buttons
  - [x] 3.2 Amber dot indicator (`bg-amber-500`, 8px circle) on Save button when `isDirty` is `true`
  - [x] 3.3 Save button: disabled when `!isDirty`, shows spinner (`Loader2` icon) when `isPending` via `useTransition`
  - [x] 3.4 Discard button: disabled when `!isDirty`, opens confirmation dialog before resetting
  - [x] 3.5 All form fields disabled when save is in flight (`isPending`)

- [x] Task 4: Mirror amber dot on AdminSidebar active item (AC: #1)
  - [x] 4.1 Extend `AdminSidebar` to accept `isDirty` prop (or use a lightweight context)
  - [x] 4.2 Render amber dot next to the active nav item label when `isDirty` is `true`
  - [x] 4.3 Intercept sidebar nav link clicks when `isDirty` — show confirmation dialog instead of navigating

- [x] Task 5: Create save Server Action scaffold (AC: #3)
  - [x] 5.1 Create `saveClubProfile` Server Action in `src/app/[lang]/(country)/[country]/[club]/admin/actions.ts`
  - [x] 5.2 Follow three-step auth guard pattern (session → role check → clubId from URL)
  - [x] 5.3 Stub the actual DB update (Story 4.6 will implement the full form) — for now, validate input shape with Zod and return `{ success: true, data: { savedAt: new Date().toISOString() } }`
  - [x] 5.4 Call `revalidatePath` to invalidate SSR cache on success
  - [x] 5.5 Return `{ success: false, error, code }` on failure

- [x] Task 6: Wire save flow in admin page (AC: #3)
  - [x] 6.1 On successful save: clear `isDirty` via `reset(savedValues)`, show `toast('Saved', { description: timestamp })` via sonner
  - [x] 6.2 On failed save: show `toast.error(result.error)`, keep form dirty
  - [x] 6.3 Use `useTransition` for `isPending` — NOT manual `isLoading` state

- [x] Task 7: Add i18n translation keys (all ACs)
  - [x] 7.1 Add keys under `club.admin.save.*` namespace in translation type file
  - [x] 7.2 Update all 4 language files (en, fr, de, it) with translations for: save, discard, unsavedChanges, savedSuccessfully, discardConfirmTitle, discardConfirmDescription, leaveConfirmTitle, leaveConfirmDescription, stay, leave, keepEditing

- [x] Task 8: Write tests (all ACs)
  - [x] 8.1 Test `useUnsavedChanges` hook: registers/removes `beforeunload` listener based on `isDirty`
  - [x] 8.2 Test `SaveBar`: renders amber dot when dirty, shows spinner when pending, buttons disabled appropriately
  - [x] 8.3 Test `UnsavedChangesDialog`: renders dialog content, calls callbacks on confirm/cancel
  - [x] 8.4 Test AdminSidebar: shows amber dot when `isDirty` prop is true
  - [x] 8.5 Test save action: auth guard, success/failure return shapes

## Dev Notes

### Critical Architecture Constraints

- **Form state**: Use `react-hook-form` v7 (`useForm` + `zodResolver`) — `formState.isDirty` is the single source of truth for dirty state. Never create separate `isDirty` state.
- **Loading state for Server Actions**: Use `useTransition` → `isPending` — never create manual `isLoading` state for Server Actions (architecture rule).
- **Server Action return shape**: Always `{ success: true, data: T }` or `{ success: false, error: string, code?: string }` — no deviation.
- **Auth guard**: Every Server Action begins with session check → role check → clubId from URL params (verified by layout). Never accept clubId from client input.
- **Multi-tenant queries**: Always filter by both `id` and `clubId` in a single `where` clause.
- **Toast**: Use `sonner` (already configured in root layout at `position="bottom-right"`, `duration={3000}`). Import `toast` from `sonner`.
- **No auto-save / localStorage draft at MVP** — architecture explicitly states this.
- **Prisma import**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'`.
- **Prisma instance**: Only from `src/server/db.ts` — never instantiate `new PrismaClient()` elsewhere.
- **Date serialization**: Always `.toISOString()` before passing to Client Components.

### Next.js App Router Navigation Interception

Next.js App Router (v16) does **not** have built-in navigation guards (no `router.events`, no `useBlocker`). The unsaved changes protection must be implemented via:

1. **`beforeunload` event** — handles browser tab close, page reload, and address bar navigation. Set `event.returnValue = ''` to trigger the native browser confirmation dialog.
2. **Click event interception** — add a delegated click listener on the admin layout that intercepts clicks on `<a>` tags. If `isDirty`, call `event.preventDefault()` and show the custom `AlertDialog`.
3. **`popstate` event** — handles browser back/forward buttons. If `isDirty`, push the current URL back and show the confirmation dialog. Use `window.history.pushState` to restore the URL.

**Important**: Do NOT use `next-navigation-guard` or other third-party navigation guard libraries — follow the project's minimal dependency philosophy. A custom `useUnsavedChanges` hook is the correct approach.

### Component Architecture

```
admin/layout.tsx (Server Component — existing)
  └── AdminShell (new Client Component wrapper)
        ├── AdminSidebarContext (provides isDirty state to sidebar)
        ├── AdminSidebar (existing, extended with isDirty prop)
        └── {children}  ← admin/page.tsx renders SaveBar + form
```

The `isDirty` state needs to flow from the form (in page.tsx) to the sidebar (in layout.tsx). Options:
- **Option A (recommended)**: Lightweight React Context (`AdminDirtyContext`) in a client layout wrapper, providing `{ isDirty, setIsDirty }`. The form page updates it; the sidebar reads it.
- **Option B**: Lift state via URL search params — not ideal for transient UI state.

### Existing Patterns to Follow

- **Form pattern**: Reference `src/components/app/apply/ApplyForm.tsx` — uses `useForm` with `zodResolver`, `Controller` for controlled inputs, `trigger()` for manual validation.
- **Server action pattern**: Reference `src/app/[lang]/(country)/[country]/[club]/settings/actions.ts` — three-step auth guard, transaction wrapping, typed return shape.
- **Sidebar component**: `src/components/app/club-admin/AdminSidebar.tsx` — client component with `usePathname()` for active item detection. Extend with `isDirty` prop for amber dot and navigation interception.
- **i18n pattern**: Follow `club.admin.*` namespace established in Story 4.4. Update `src/lib/i18n/translations/types.ts` and all 4 language files (en, fr, de, it) in sync.
- **Test pattern**: Files in `src/__tests__/`, mock `next/navigation`, `next/headers`, `@/server/db`, `next-auth`. 372 tests passing as of Story 4.4.

### Design System Tokens (from Story 4.4)

- Amber dot: `bg-amber-500 rounded-full w-2 h-2` (8px circle)
- Save button: shadcn `Button` default variant
- Discard button: shadcn `Button` variant `outline` or `ghost`
- Spinner: `Loader2` from `lucide-react` with `animate-spin`
- Dialog: shadcn `AlertDialog` with destructive action styling
- Focus rings: `focus-visible:ring-2 focus-visible:ring-ring`
- Touch targets: minimum 44x44px on mobile

### Zod Schema Location

- Save schema: `src/lib/schemas/club.ts` — add `clubProfileSaveSchema` (stub for now, Story 4.6 will define full fields)
- Follow existing pattern: `camelCase + Schema` naming

### File Placement

- `src/hooks/use-unsaved-changes.ts` — custom hook
- `src/components/app/club-admin/SaveBar.tsx` — save/discard toolbar
- `src/components/app/club-admin/UnsavedChangesDialog.tsx` — confirmation dialog
- `src/components/app/club-admin/AdminDirtyContext.tsx` — lightweight context for isDirty state
- `src/app/[lang]/(country)/[country]/[club]/admin/actions.ts` — server action (new file)
- Modify: `src/components/app/club-admin/AdminSidebar.tsx` — add amber dot + navigation interception
- Modify: `src/app/[lang]/(country)/[country]/[club]/admin/layout.tsx` — wrap with AdminDirtyContext provider
- Modify: `src/app/[lang]/(country)/[country]/[club]/admin/page.tsx` — integrate SaveBar and form scaffold

### What This Story Does NOT Include

- Full profile edit form fields (Story 4.6)
- Photo upload (Story 4.6)
- Publish/unpublish toggle (Story 4.7)
- Operator message banner (Story 4.7)
- Auto-save or localStorage draft (explicitly excluded at MVP)
- Rich text editing (post-MVP)

### Dependencies

- **Depends on**: Story 4.4 (admin dashboard shell) — DONE
- **Depended on by**: Story 4.6 (club profile edit form) — uses the save framework established here

### Project Structure Notes

- Alignment: follows `admin/` route segment established in Story 4.4 (NOT `/edit/` as originally planned in architecture — ADR updated in Story 4.4)
- Component placement under `src/components/app/club-admin/` follows the established pattern from Story 4.4
- Hook placement in `src/hooks/` — new directory, follows kebab-case convention

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4, Story 4.5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture — Unsaved Changes Protection]
- [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns — State Management Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns — Error Response Contract]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — Loading State Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — Naming Patterns]
- [Source: _bmad-output/implementation-artifacts/4-4-club-admin-dashboard-shell.md#Dev Notes]
- [Source: Next.js navigation guard discussion — github.com/vercel/next.js/discussions/47020]

### Previous Story Intelligence (from Story 4.4)

- **Admin route is `/admin`** (not `/edit/`): Folder is `src/app/[lang]/(country)/[country]/[club]/admin/`
- **Membership guard**: Already implemented in `admin/layout.tsx` — checks ACTIVE OWNER or EDITOR status, returns 404 for unauthorized
- **AdminSidebar**: Client component with `usePathname()` for active item, responsive (desktop persistent 240px, mobile hamburger with Sheet)
- **i18n**: `club.admin.*` namespace with `sidebar`, `clubProfile`, `settings` sub-keys in all 4 languages
- **Code review learnings**: Trailing slash normalization, `shrink-0` on desktop sidebar, FooterLink component extraction, skip-to-content with fixed positioning
- **Test count**: 372 tests passing (17 added in Story 4.4)
- **All safety checks pass**: tsc, lint, audit, build

### Git Intelligence

Recent commits show sequential epic 4 story implementation:
- `66c2815 feat: story 4.4` — admin dashboard shell (most recent)
- `2323847 feat: story 4.3` — approval flow profile seeding
- `605c99c feat: story 4.2` — application form profile fields
- `1fcea1d feat: story 4.1` — schema migration

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed existing AdminSidebar tests to include new `save` translation keys
- Fixed lint warning in test file (unused parameter)

### Completion Notes List

- Implemented `useUnsavedChanges` hook with beforeunload, click interception, and popstate handling
- Created `UnsavedChangesDialog` component using shadcn AlertDialog with leave/discard variants
- Created `SaveBar` component with sticky bottom bar, amber dot indicator, spinner, and discard confirmation
- Created `AdminDirtyContext` for sharing isDirty state between form and sidebar
- Extended `AdminSidebar` with amber dot on active item and navigation interception when dirty
- Created `saveClubProfile` Server Action with three-step auth guard and Zod validation (stub DB update)
- Created `ClubProfileForm` client component wiring react-hook-form, useTransition, and sonner toast
- Added `club.admin.save.*` i18n keys in all 4 languages (en, fr, de, it)
- Added shadcn AlertDialog UI component
- Updated `clubProfileSaveSchema` in `src/lib/schemas/club.ts`
- 19 new tests added (391 total, all passing)
- All safety checks pass: tsc, lint, audit, build

### Change Log

- 2026-03-08: Implemented explicit save & unsaved changes protection (all 8 tasks complete)

### File List

New files:
- src/hooks/use-unsaved-changes.ts
- src/components/app/club-admin/AdminDirtyContext.tsx
- src/components/app/club-admin/UnsavedChangesDialog.tsx
- src/components/app/club-admin/SaveBar.tsx
- src/components/app/club-admin/ClubProfileForm.tsx
- src/components/ui/alert-dialog.tsx
- src/app/[lang]/(country)/[country]/[club]/admin/actions.ts
- src/__tests__/use-unsaved-changes.test.ts
- src/__tests__/save-bar.test.ts
- src/__tests__/unsaved-changes-dialog.test.ts
- src/__tests__/save-club-profile.test.ts

Modified files:
- src/components/app/club-admin/AdminSidebar.tsx
- src/app/[lang]/(country)/[country]/[club]/admin/layout.tsx
- src/app/[lang]/(country)/[country]/[club]/admin/page.tsx
- src/lib/schemas/club.ts
- src/lib/i18n/translations/types.ts
- src/lib/i18n/translations/en.ts
- src/lib/i18n/translations/fr.ts
- src/lib/i18n/translations/de.ts
- src/lib/i18n/translations/it.ts
- src/__tests__/club-admin-sidebar.test.ts
