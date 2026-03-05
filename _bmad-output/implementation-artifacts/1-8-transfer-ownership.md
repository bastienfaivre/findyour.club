# Story 1.8: Transfer Ownership

Status: done

## Story

As a Club Owner,
I want to transfer ownership of my club to an active Editor,
so that management responsibility can change hands cleanly without credential sharing.

## Acceptance Criteria

1. **Given** a Club Owner opens the club settings membership panel, **When** they click the "Transfer ownership" button next to an active Editor, **Then** an inline confirmation prompt is shown: "Transfer ownership to [email]? You will become an Editor." — no action is taken until the Owner confirms.

2. **Given** the transfer is confirmed, **When** the `transferOwnership` Server Action executes, **Then** the target member's `ClubMembership.role` is set to `OWNER` and the current owner's `ClubMembership.role` is set to `EDITOR` in a single atomic transaction — both succeed or neither does.

3. **Given** the transfer completes successfully, **Then** the page reflects the updated role badges and an inline success message confirms the transfer.

4. **Given** a Club Owner attempts to transfer to a user with `PENDING` membership, **Then** the action is rejected with: "Cannot transfer ownership to a member who has not yet accepted their invitation." (The UI should only show the transfer button for ACTIVE Editors, but the server action must still validate this.)

5. **Note — Operator force-transfer:** Deferred to Epic 7 (admin dashboard). The `transferOwnership` action should accept an optional `force: boolean` param reserved for future admin-panel use.

## Tasks / Subtasks

- [x] Task 1: Add `transferOwnership` Server Action to `settings/actions.ts` (AC: #1, #2, #4)
  - [x] 1.1 Export `TransferOwnershipResult` type: `{ success: true } | { success: false; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'PENDING_MEMBER' | 'SERVER_ERROR' }`
  - [x] 1.2 Function signature: `transferOwnership(country: string, slug: string, targetMembershipId: string): Promise<TransferOwnershipResult>`
  - [x] 1.3 Auth guard: `getAuthSession()` — return UNAUTHORIZED if no session
  - [x] 1.4 Resolve club via `getClubBySlug(slug, country)` — return UNAUTHORIZED if not found
  - [x] 1.5 Verify caller has `ACTIVE OWNER` membership in that club via `getClubOwnership(session.user.id, club.id)` — return FORBIDDEN if not
  - [x] 1.6 Load target membership: `prisma.clubMembership.findUnique({ where: { id: targetMembershipId }, select: { id, userId, clubId, role, status } })` — return NOT_FOUND if absent
  - [x] 1.7 Verify target belongs to same club (`target.clubId === club.id`) — return FORBIDDEN if not
  - [x] 1.8 Reject if target status is `PENDING` — return `{ success: false, error: 'Cannot transfer ownership to a member who has not yet accepted their invitation.', code: 'PENDING_MEMBER' }`
  - [x] 1.9 Retrieve caller's own membership ID: `prisma.clubMembership.findFirst({ where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE', role: 'OWNER' } })`
  - [x] 1.10 Atomic swap via `prisma.$transaction([...])` (array form): update target → `OWNER`, update caller → `EDITOR`
  - [x] 1.11 Return `{ success: true }`

- [x] Task 2: Update `MembershipPanel.tsx` to support transfer ownership UI (AC: #1, #3)
  - [x] 2.1 Add `currentUserId: string` and `transferOwnershipAction: (targetId: string) => Promise<TransferOwnershipResult>` to `MembershipPanelProps`
  - [x] 2.2 Add local state: `confirmTransferId: string | null` (tracks which Editor row is in "pending confirm" state)
  - [x] 2.3 Add `[isPendingTransfer, startTransferTransition]` from `useTransition()`
  - [x] 2.4 In the table, for each ACTIVE EDITOR row (and current user is OWNER): show "Transfer" button (size `xs`, variant `outline`)
  - [x] 2.5 On "Transfer" click: set `confirmTransferId = m.id` (show confirmation row)
  - [x] 2.6 Confirmation row replaces the "Transfer" button with: text "Transfer ownership to [m.user.email]? You will become an Editor." + [Confirm] (variant `destructive`, size `xs`) + [Cancel] (variant `ghost`, size `xs`)
  - [x] 2.7 On [Confirm]: call `startTransferTransition(async () => { const res = await transferOwnershipAction(m.id); ... })`, set result, clear `confirmTransferId`, call `router.refresh()` on success
  - [x] 2.8 On [Cancel]: set `confirmTransferId = null`
  - [x] 2.9 Add `transferResult` state for showing success/error feedback (separate from invite result)
  - [x] 2.10 Import `TransferOwnershipResult` type from actions

- [x] Task 3: Update `settings/page.tsx` to wire transfer action (AC: #1, #2)
  - [x] 3.1 Import `transferOwnership` from `./actions`
  - [x] 3.2 Bind: `const boundTransferOwnership = transferOwnership.bind(null, country, slug)`
  - [x] 3.3 Pass `currentUserId={session.user.id}` and `transferOwnershipAction={boundTransferOwnership}` to `MembershipPanel`

- [x] Task 4: Tests (AC: all)
  - [x] 4.1 Create `src/__tests__/transfer-ownership.test.ts`
  - [x] 4.2 Test: unauthenticated → `{ success: false, code: 'UNAUTHORIZED' }`
  - [x] 4.3 Test: authenticated but not OWNER → `{ success: false, code: 'FORBIDDEN' }`
  - [x] 4.4 Test: target membership not found → `{ success: false, code: 'NOT_FOUND' }`
  - [x] 4.5 Test: target belongs to different club → `{ success: false, code: 'FORBIDDEN' }`
  - [x] 4.6 Test: target has PENDING status → `{ success: false, code: 'PENDING_MEMBER' }`
  - [x] 4.7 Test: happy path — `prisma.$transaction` called with two updates; target gets `OWNER`, caller gets `EDITOR`; returns `{ success: true }`
  - [x] 4.8 Run `pnpm test` — all 173 tests pass (166 + 7 new), no regressions

## Dev Notes

### 🔑 `transferOwnership` Server Action

**File to modify:** `src/app/(country)/[country]/[club]/settings/actions.ts`

Add to the existing file (which already has `inviteEditor`):

```typescript
export type TransferOwnershipResult =
  | { success: true }
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'PENDING_MEMBER' | 'SERVER_ERROR' }

export async function transferOwnership(
  country: string,
  slug: string,
  targetMembershipId: string,
): Promise<TransferOwnershipResult> {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' }
  }

  const club = await getClubBySlug(slug, country)
  if (!club) return { success: false, error: 'Club not found.', code: 'UNAUTHORIZED' }

  // Verify caller is an ACTIVE OWNER
  const callerMembership = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE', role: 'OWNER' },
    select: { id: true },
  })
  if (!callerMembership) {
    return { success: false, error: 'Only club owners can transfer ownership.', code: 'FORBIDDEN' }
  }

  // Load target membership
  const targetMembership = await prisma.clubMembership.findUnique({
    where: { id: targetMembershipId },
    select: { id: true, userId: true, clubId: true, role: true, status: true },
  })
  if (!targetMembership) {
    return { success: false, error: 'Target membership not found.', code: 'NOT_FOUND' }
  }

  // Verify target belongs to same club
  if (targetMembership.clubId !== club.id) {
    return { success: false, error: 'Target membership does not belong to this club.', code: 'FORBIDDEN' }
  }

  // Reject PENDING targets
  if (targetMembership.status === 'PENDING') {
    return {
      success: false,
      error: 'Cannot transfer ownership to a member who has not yet accepted their invitation.',
      code: 'PENDING_MEMBER',
    }
  }

  // Atomic role swap — BOTH must succeed or NEITHER does
  await prisma.$transaction([
    prisma.clubMembership.update({
      where: { id: targetMembership.id },
      data: { role: 'OWNER' },
    }),
    prisma.clubMembership.update({
      where: { id: callerMembership.id },
      data: { role: 'EDITOR' },
    }),
  ])

  return { success: true }
}
```

**⚠️ `getClubOwnership` helper caches by `(userId, clubId)`.** Do NOT use it for the caller check inside this action — we need the membership `id` for the transaction. Use `prisma.clubMembership.findFirst` directly as shown above.

**⚠️ Do NOT use `redirect()` in this action** — it returns a typed result; let the client handle navigation (`router.refresh()` on success).

[Source: src/app/(country)/[country]/[club]/settings/actions.ts — existing inviteEditor pattern]
[Source: src/lib/server/club-queries.ts — getClubBySlug + getClubOwnership (note: don't reuse getClubOwnership here)]

### 🎨 `MembershipPanel.tsx` Updates

**File:** `src/components/app/settings/MembershipPanel.tsx`

Key changes:
1. Add `currentUserId` prop — used to determine if the viewer is the OWNER (to show Transfer buttons)
2. Add `transferOwnershipAction` prop (pre-bound `country` and `slug` by the Server Component)
3. Use a `confirmTransferId` state to render inline confirmation instead of a modal (avoids needing a Dialog component)
4. Use a separate `useTransition` for the transfer action to avoid conflicting with the invite form's pending state

**Inline confirmation pattern (avoids new Dialog component):**

```tsx
// In the memberships table row, for ACTIVE EDITOR rows:
{isOwnerViewing && m.status === 'ACTIVE' && m.role === 'EDITOR' && (
  confirmTransferId === m.id ? (
    <span className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">Transfer to {m.user.email}?</span>
      <Button
        size="xs"
        variant="destructive"
        disabled={isPendingTransfer}
        onClick={() => handleTransferConfirm(m.id)}
      >
        Confirm
      </Button>
      <Button
        size="xs"
        variant="ghost"
        disabled={isPendingTransfer}
        onClick={() => setConfirmTransferId(null)}
      >
        Cancel
      </Button>
    </span>
  ) : (
    <Button
      size="xs"
      variant="outline"
      onClick={() => setConfirmTransferId(m.id)}
    >
      Transfer
    </Button>
  )
)}
```

**⚠️ `isOwnerViewing`:** derive from `memberships.some(m => m.userId === currentUserId && m.role === 'OWNER' && m.status === 'ACTIVE')` OR pass it from the Server Component as a boolean prop. Since `currentUserId` is available, derive it in the component.

**`handleTransferConfirm` function:**
```typescript
function handleTransferConfirm(targetMembershipId: string) {
  setTransferResult(null)
  startTransferTransition(async () => {
    const res = await transferOwnershipAction(targetMembershipId)
    setTransferResult(res)
    setConfirmTransferId(null)
    if (res.success) {
      router.refresh()
    }
  })
}
```

**Import additions needed:**
```typescript
import type { TransferOwnershipResult } from '@/app/(country)/[country]/[club]/settings/actions'
```

[Source: src/components/app/settings/MembershipPanel.tsx — existing component]
[Source: src/components/ui/button.tsx — size 'xs' is available]

### 🏗️ `settings/page.tsx` Update

**File:** `src/app/(country)/[country]/[club]/settings/page.tsx`

Minimal changes:
```typescript
import { inviteEditor, transferOwnership } from './actions'

// After existing boundInviteEditor:
const boundTransferOwnership = transferOwnership.bind(null, country, slug)

// Update MembershipPanel props:
<MembershipPanel
  memberships={memberships}
  inviteAction={boundInviteEditor}
  currentUserId={session.user.id}
  transferOwnershipAction={boundTransferOwnership}
/>
```

**⚠️ `session.user.id` is always available here** — we already checked `if (!session?.user) redirect('/auth/login')` and `if (!(await getClubOwnership(...))) redirect(...)` so `session.user.id` is guaranteed non-null.

**⚠️ EXPECTED BEHAVIOR after transfer:** After `router.refresh()` the settings page will re-render server-side. Since the previous owner is now an EDITOR, `getClubOwnership()` returns null → the page redirects them to `/${country}/${slug}`. This is correct and expected — the page's guard correctly ejects the newly-demoted user. The dev agent must NOT treat this as a bug.

**⚠️ `isOwner` prop simplification:** Since the settings page only renders if the user is an OWNER, you can pass `isOwner={true}` as a boolean to `MembershipPanel` instead of `currentUserId`, simplifying the component. Either approach is fine.

[Source: src/app/(country)/[country]/[club]/settings/page.tsx — existing page]

### 🧪 Testing Notes

**Test file:** `src/__tests__/transfer-ownership.test.ts`

**Mock setup (follows existing pattern from `invite-editor.test.ts`):**
```typescript
vi.mock('@/server/auth', () => ({ getAuthSession: vi.fn() }))
vi.mock('@/lib/server/club-queries', () => ({
  getClubBySlug: vi.fn(),
  getClubOwnership: vi.fn(), // not used in transferOwnership, but imported in module
}))
vi.mock('@/server/db', () => ({
  prisma: {
    clubMembership: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((ops) => Promise.all(ops)),
  },
}))
```

**Key test cases:**
```typescript
describe('transferOwnership', () => {
  it('returns UNAUTHORIZED when not authenticated')
  it('returns UNAUTHORIZED when club not found')
  it('returns FORBIDDEN when caller is not OWNER')
  it('returns NOT_FOUND when target membership does not exist')
  it('returns FORBIDDEN when target belongs to a different club')
  it('returns PENDING_MEMBER when target has PENDING status')
  it('returns success and calls $transaction with two updates on happy path', async () => {
    // Verify $transaction called with:
    // [update(targetId, { role: 'OWNER' }), update(callerMembershipId, { role: 'EDITOR' })]
    // Returns { success: true }
  })
})
```

**Baseline:** 166 tests across 22 files. Add ~7 new tests without regressions.

[Source: src/__tests__/invite-editor.test.ts — mock pattern to follow]

### 🔄 Previous Story Learnings (Stories 1.1–1.7)

1. **`getAuthSession()` not `getServerSession()`** — always use `getAuthSession()` [Source: src/server/auth.ts]
2. **Prisma import** — always `from '@/generated/prisma/client'` NOT `from '@prisma/client'` (for types) [Source: all stories]
3. **`await params`** — `params` is a Promise in Next.js 16 App Router; always `const { country, club } = await params` [Source: src/app/(country)/[country]/[club]/layout.tsx]
4. **No `redirect()` in typed Server Actions** — return typed results, let client handle navigation [Source: story 1.3+]
5. **`prisma.$transaction([...])` — array form** for sequential atomic writes (NOT callback form) [Source: story 1.6]
6. **`@@unique([userId, clubId])` on ClubMembership** — use `update` (by `id`) not `upsert` to avoid constraint errors [Source: prisma/schema.prisma]
7. **`getClubOwnership` returns membership row with `id: true` only** — do NOT rely on it for the caller's membership ID in transfer; do a fresh `findFirst` with the fields needed
8. **`inviteEditor` action signature** — `(country, slug, _prevState, formData)` — pre-bound args come BEFORE `useActionState` params
9. **Button `size="xs"` exists** in `buttonVariants` [Source: src/components/ui/button.tsx]
10. **`router.refresh()`** from `useRouter()` — correct way to re-fetch Server Component data after mutation in App Router

### ⚙️ Git Intelligence (Recent Commits)

```
08a219d feat: story 1.7  — invite-editor, accept route, MembershipPanel, 162→166 tests
bdb0532 feat: story 1.6  — passkey/WebAuthn auth, simplewebauthn v13, 146 tests
6da7be2 feat: story 1.5  — operator auth, role-based redirect
b029766 feat: story 1.4  — /my-clubs, club layout membership guard
8765cfe feat: story 1.3  — magic link, password setup, TOTP
```

Story 1.7 introduced the `settings/actions.ts` pattern, `MembershipPanel.tsx`, and `club-queries.ts` helpers — all directly extended by this story.

### 📁 Project Structure — Files to Create/Modify

**No new files required** — all changes go into existing files.

**Modified files:**
```
src/app/(country)/[country]/[club]/settings/actions.ts    # Add transferOwnership action + type
src/components/app/settings/MembershipPanel.tsx           # Add transfer UI + confirm state
src/app/(country)/[country]/[club]/settings/page.tsx      # Bind + pass transferOwnershipAction
```

**New test file:**
```
src/__tests__/transfer-ownership.test.ts                  # ~7 new test cases
```

**Sprint status update (after story):**
```
_bmad-output/implementation-artifacts/sprint-status.yaml  # 1-8-transfer-ownership: ready-for-dev
```

### 🔗 References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.8] — User story, acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#line 1264-1306] — ClubMemberRole OWNER/EDITOR, transfer ownership design
- [Source: _bmad-output/planning-artifacts/architecture.md#line 1296-1301] — Capability matrix (OWNER can transfer, EDITOR cannot)
- [Source: prisma/schema.prisma#ClubMembership] — model with `role ClubMemberRole`, `@@unique([userId, clubId])`
- [Source: src/app/(country)/[country]/[club]/settings/actions.ts] — existing inviteEditor pattern to extend
- [Source: src/components/app/settings/MembershipPanel.tsx] — existing component to extend
- [Source: src/app/(country)/[country]/[club]/settings/page.tsx] — Server Component to update
- [Source: src/lib/server/club-queries.ts] — getClubBySlug (reuse), getClubOwnership (do NOT reuse for caller membership id)
- [Source: src/__tests__/invite-editor.test.ts] — mock pattern to follow for new test file

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Added `TransferOwnershipResult` type and `transferOwnership` server action to `settings/actions.ts`, following the existing `inviteEditor` pattern. Used `prisma.clubMembership.findFirst` directly for the caller's membership (to get the `id` needed for the atomic swap), rather than `getClubOwnership` which only returns the record without exposing it to callers. Atomic role swap via `prisma.$transaction` array form.
- Updated `MembershipPanel.tsx`: added `userId` to `Membership` interface, `currentUserId` + `transferOwnershipAction` props, separate `useTransition` for transfer, `confirmTransferId` inline confirmation state, and `transferResult` for error display. "Transfer" button only renders for ACTIVE EDITOR rows when the current user is OWNER.
- Updated `settings/page.tsx`: imported `transferOwnership`, bound it with `country`/`slug`, passed `currentUserId` and `transferOwnershipAction` to `MembershipPanel`.
- Created `src/__tests__/transfer-ownership.test.ts` with 7 test cases covering all guard conditions and the happy path. All 173 tests pass.
- **Code review fixes applied (2026-03-05):** Added inline success message for AC #3; fixed confirmation text to "Transfer ownership to [email]? You will become an Editor." (AC #1); added try/catch around `$transaction` with `SERVER_ERROR` path; added optional `_force` param for Epic 7; added server-side guards for self-transfer and non-EDITOR targets. Expanded test suite to 10 cases (added SERVER_ERROR, self-transfer, non-EDITOR target). All 176 tests pass.

### Senior Developer Review (AI)

**Review Date:** 2026-03-05
**Review Outcome:** Changes Requested → All Fixed

#### Action Items

- [x] [High] Missing success message after transfer — MembershipPanel.tsx was only showing error feedback (AC #3 violation)
- [x] [High] No try/catch around `prisma.$transaction` — unhandled exception on DB failure instead of `SERVER_ERROR` result
- [x] [Medium] Confirmation text "Transfer to [email]?" missing "ownership" and "You will become an Editor." (AC #1 partial)
- [x] [Medium] Missing optional `force?: boolean` param specified in story AC note #5
- [x] [Medium] No server-side guard: target role never validated as EDITOR; self-transfer not blocked

### File List

- `src/app/(country)/[country]/[club]/settings/actions.ts`
- `src/components/app/settings/MembershipPanel.tsx`
- `src/app/(country)/[country]/[club]/settings/page.tsx`
- `src/__tests__/transfer-ownership.test.ts`
