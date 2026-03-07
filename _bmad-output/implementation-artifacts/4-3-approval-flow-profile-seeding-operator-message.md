# Story 4.3: Approval Flow — Profile Seeding & Operator Message

Status: done

## Story

As a Platform Operator,
I want approving an application to automatically create the club with pre-populated profile fields and optionally include a message for the club admin,
So that clubs are ready to review and publish immediately after the admin completes account setup.

## Acceptance Criteria

1. **Profile field display in review queue:** When the operator views a pending application, ALL submitted profile fields are displayed as actual club profile content (name, description, schedule, contact info, how to join, external website URL) — not just metadata.

2. **Optional operator message on approval:** When the operator clicks Approve, the confirmation dialog includes an optional "Message to club admin" textarea; the operator can leave it empty or type feedback.

3. **Profile seeding on approval (no message):** When the operator confirms approval without a message, the club record is created with profile fields copied from the application (name, description, schedule, email, contactPhone, contactAddress, howToJoin, externalWebsiteUrl, activityTypeId, locationId, country); `isPublished = false`, `forceOffline = false`; ClubMembership (OWNER, ACTIVE) created; acceptance email sent with magic link.

4. **Profile seeding on approval (with message):** When the operator confirms approval with a message, an OperatorMessage record is created for the new club in the same transaction; the message text is included in the acceptance email as a dedicated "Message from the platform" section; the message will appear as a banner in the admin dashboard on first login.

5. **Backward compatibility:** Slug generation, magic link creation, and email dispatch remain unchanged; only the club record creation is extended with profile fields and optional operator message.

## Tasks / Subtasks

- [x] Task 1: Update `ApplicationQueueItem` to display all profile fields (AC: #1)
  - [x] 1.1 Add a profile fields section showing description, schedule, contactPhone, contactAddress, howToJoin, externalWebsiteUrl in the expanded application view
  - [x] 1.2 Display fields as "club profile preview" — not raw metadata labels. Use proper formatting (e.g., "How to join" heading, not "howToJoin")
  - [x] 1.3 Add translations for field labels in all 4 languages (en, fr, de, it)

- [x] Task 2: Add operator message textarea to approval dialog (AC: #2)
  - [x] 2.1 In `ApplicationQueueItem.tsx`, add an optional textarea "Message to club admin" inside the Approve popover/dialog, below the slug input
  - [x] 2.2 Pass the message string to `approveApplication(applicationId, slug, operatorMessage?)` — empty string or undefined if omitted
  - [x] 2.3 Add placeholder text: "Optional feedback for the club admin (e.g., 'Please add more detail to your schedule before publishing')"
  - [x] 2.4 Add translations for the textarea label and placeholder

- [x] Task 3: Update `approveApplication` Server Action to seed profile fields (AC: #3, #5)
  - [x] 3.1 Add `operatorMessage` as optional third parameter to the action
  - [x] 3.2 In the Prisma transaction, extend `prisma.club.create()` data to include: `description`, `schedule`, `contactPhone`, `contactAddress`, `howToJoin`, `externalWebsiteUrl` — copied from the fetched application record
  - [x] 3.3 Verify `isPublished: false` and `forceOffline: false` are set (should already be DB defaults but set explicitly)
  - [x] 3.4 Update the Zod validation schema if input validation is used for the action parameters

- [x] Task 4: Create OperatorMessage on approval when message provided (AC: #4)
  - [x] 4.1 After club creation inside the same transaction, if `operatorMessage` is non-empty, create `prisma.operatorMessage.create({ data: { clubId: club.id, message: operatorMessage } })`
  - [x] 4.2 Ensure the OperatorMessage is part of the serializable transaction (rolled back if email fails)

- [x] Task 5: Update acceptance email template with operator message section (AC: #4)
  - [x] 5.1 Modify `buildAcceptanceEmailHtml()` to accept an optional `operatorMessage` parameter
  - [x] 5.2 Add a conditional "Message from the platform" section in the email body — rendered only when `operatorMessage` is provided
  - [x] 5.3 HTML-escape the operator message text (XSS prevention)
  - [x] 5.4 Style the section distinctly (e.g., bordered box, different background) so it stands out in the email

- [x] Task 6: Update tests (AC: #1-#5)
  - [x] 6.1 Update happy-path approval test: verify all 6 profile fields are copied from Application to Club
  - [x] 6.2 Add test: approval with operator message creates OperatorMessage record in same transaction
  - [x] 6.3 Add test: approval without operator message does NOT create OperatorMessage record
  - [x] 6.4 Add test: email failure rollback also deletes OperatorMessage (transaction rollback)
  - [x] 6.5 Add test: `isPublished` defaults to false, `forceOffline` defaults to false on created club
  - [x] 6.6 Add test: acceptance email includes operator message section when provided
  - [x] 6.7 Add test: acceptance email omits operator message section when not provided
  - [x] 6.8 Verify existing tests still pass (slug conflicts, user reuse, auth checks, rejection flow)

## Dev Notes

### This Reworks Story 2.3

The approval flow was implemented in Story 2.3. Story 4.1 added the DB columns to both `Application` and `Club` models. Story 4.2 added the profile fields to the application form. This story connects the two: copying profile fields from `Application` to `Club` on approval, and adding the optional operator message.

### Files to Modify (Exact Paths)

| File | Change |
|------|--------|
| `src/app/[lang]/admin/(protected)/applications/actions.ts` | Extend `approveApplication` to seed profile fields + create OperatorMessage |
| `src/components/app/admin/ApplicationQueueItem.tsx` | Display profile fields in review + add operator message textarea to approval dialog |
| `src/lib/email-templates.ts` | Add optional operator message section to `buildAcceptanceEmailHtml()` |
| `src/lib/i18n/translations/types.ts` | Extend `Translations['admin']` type with new keys |
| `src/lib/i18n/translations/en.ts` | Add English labels for profile display + operator message |
| `src/lib/i18n/translations/fr.ts` | Add French labels |
| `src/lib/i18n/translations/de.ts` | Add German labels |
| `src/lib/i18n/translations/it.ts` | Add Italian labels |
| `src/__tests__/admin-applications.test.ts` | Add profile seeding + operator message tests |

### Existing Code to Modify

**`approveApplication` Server Action** (`src/app/[lang]/admin/(protected)/applications/actions.ts`):
The current `prisma.club.create()` call (inside the serializable transaction) creates the club with only: `name`, `slug`, `country`, `status: 'ACTIVE'`, `email`, `activityTypeId`, `locationId`, `defaultLanguage`. You need to ADD these fields from the fetched `application` record:
```typescript
// ADD to prisma.club.create() data:
description: application.description,
schedule: application.schedule,
contactPhone: application.contactPhone,
contactAddress: application.contactAddress,
howToJoin: application.howToJoin,
externalWebsiteUrl: application.externalWebsiteUrl,
// isPublished and forceOffline default to false in schema, but set explicitly:
isPublished: false,
forceOffline: false,
```

Then conditionally create OperatorMessage inside the same transaction:
```typescript
if (operatorMessage?.trim()) {
  await tx.operatorMessage.create({
    data: { clubId: club.id, message: operatorMessage.trim() }
  })
}
```

**`ApplicationQueueItem` component** (`src/components/app/admin/ApplicationQueueItem.tsx`):
Currently shows: name, description (truncated), activity type badge, email, country, location, desired slug, submitted date. The Approve popover has a slug override input. You need to:
1. Show ALL profile fields in the expanded view (not truncated)
2. Add a textarea below the slug input in the Approve popover

**`buildAcceptanceEmailHtml`** (`src/lib/email-templates.ts`):
Currently takes `{ clubName, clubUrl, magicLinkUrl }`. Add optional `operatorMessage` parameter. Add a conditional block after the congratulations paragraph:
```html
<!-- Only render if operatorMessage is provided -->
<div style="background: #f8f9fa; border-left: 4px solid #0070f3; padding: 16px; margin: 24px 0;">
  <p style="margin: 0 0 8px; font-weight: 600;">Message from the platform:</p>
  <p style="margin: 0;">${escapeHtml(operatorMessage)}</p>
</div>
```

### Existing Patterns to Follow

**Server Action three-step guard** (already implemented in `approveApplication`):
1. Get session
2. Check OPERATOR role
3. Validate input with Zod

**Return contract:** `{ success: true, data: T }` or `{ success: false, error: string, code?: string }`

**Error codes already in use:** `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `ALREADY_REVIEWED`, `SLUG_CONFLICT`, `SLUG_REQUIRED`, `SLUG_INVALID`, `EMAIL_FAILED`

**Compensating transaction pattern** (already in `approveApplication`): On email failure, the action runs a compensating delete of the Club and ClubMembership records. The OperatorMessage will cascade-delete with the Club (due to `onDelete: Cascade`), so NO additional cleanup needed.

**Translation key pattern** (from Story 4.2):
```typescript
// In translations/types.ts:
admin: {
  applications: {
    // existing keys...
    profileFields: {
      description: string
      schedule: string
      // etc.
    }
    operatorMessage: {
      label: string
      placeholder: string
    }
  }
}
```

### Critical Implementation Details

1. **Transaction scope:** The OperatorMessage MUST be created inside the existing serializable transaction, alongside Club and ClubMembership creation. If the email send fails, the compensating transaction deletes the Club — the OperatorMessage cascades automatically due to `onDelete: Cascade` on the Club relation.

2. **Profile fields are nullable in DB:** The Application model stores `schedule`, `contactPhone`, `contactAddress`, `externalWebsiteUrl` as nullable. Copy them as-is (null stays null). `description` and `howToJoin` are required in the form (Story 4.2) so they will always have values for new applications, but handle null defensively for legacy applications submitted before Story 4.2.

3. **No new API routes needed:** Everything goes through the existing `approveApplication` Server Action — just add the `operatorMessage` parameter.

4. **Email template is inline HTML:** No templating engine. Build HTML strings with inline CSS for email client compatibility. Always use `escapeHtml()` on operator message text.

5. **Approval action signature change:** Adding `operatorMessage` as a third parameter requires updating the call site in `ApplicationQueueItem.tsx`. The parameter should be optional (undefined for backward compatibility with existing approve calls).

### Previous Story Learnings (from Story 4.2)

- Import Prisma types from `@/generated/prisma/client` (NOT `@prisma/client`)
- All field `@map()` annotations use snake_case for DB columns
- 3 pre-existing test failures are known and acceptable (redirect mismatch in setup-password and magic-link tests)
- Quality gate: `pnpm typecheck && pnpm lint && pnpm build && pnpm test`
- URL validation edge case: empty string vs null — `externalWebsiteUrl` empty strings are stored as null in the Server Action
- Translation pattern: add keys to `types.ts` first, then all 4 language files
- All 347 tests currently pass (as of Story 4.2 completion)
- Code review from 4.2: removed inconsistent `aria-live` attributes, localized max-length error messages, fixed German translation

### Project Structure Notes

- Server Actions co-located at `src/app/[lang]/admin/(protected)/applications/actions.ts`
- Components in `src/components/app/admin/`
- Email templates centralized in `src/lib/email-templates.ts`
- Zod schemas in `src/lib/schemas/` — but the approval action uses inline validation, not a separate schema file
- Tests in `src/__tests__/admin-applications.test.ts`
- No new files needed — all changes are to existing files

### References

- [Source: src/app/[lang]/admin/(protected)/applications/actions.ts — approveApplication Server Action]
- [Source: src/components/app/admin/ApplicationQueueItem.tsx — Approve popover with slug input]
- [Source: src/lib/email-templates.ts — buildAcceptanceEmailHtml]
- [Source: prisma/schema.prisma — Application, Club, OperatorMessage, ClubMembership models]
- [Source: src/__tests__/admin-applications.test.ts — approval/rejection tests]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.3]
- [Source: _bmad-output/planning-artifacts/architecture.md — Approval flow, OperatorMessage ADR-004, Server Action patterns]
- [Source: _bmad-output/planning-artifacts/prd.md — FR27, FR32, FR54-FR57]
- [Source: _bmad-output/implementation-artifacts/4-2-application-form-profile-fields.md — Previous story learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation with no blockers.

### Completion Notes List

- Extended `ApplicationQueueItem` to show all profile fields (howToJoin, schedule, contactPhone, contactAddress, externalWebsiteUrl) in an expandable section below the description. Made the expand/collapse toggle always visible (not just for truncated descriptions).
- Added operator message textarea to the Approve popover, below the slug input, with localized label and placeholder in all 4 languages.
- Extended `approveApplication` server action with optional third `operatorMessage` parameter. Added 6 profile fields + `isPublished: false` + `forceOffline: false` to `prisma.club.create()`. Added conditional `operatorMessage.create()` inside the same serializable transaction.
- Extended `buildAcceptanceEmailHtml()` to accept optional `operatorMessage` and render a styled "Message from the platform" block. Operator message text is HTML-escaped.
- Added 8 new tests: operator message creation (with/without/empty string/whitespace only), isPublished/forceOffline defaults, email includes/omits operator message section, XSS escaping in operator message. Updated happy-path test to verify all 6 profile fields. All 355 tests pass.
- Task 3.4 (Zod validation schema): Not applicable — the approval action uses inline validation, not a separate Zod schema file. The `operatorMessage` parameter is optional and trimmed server-side.
- Task 6.4 (email failure rollback deletes OperatorMessage): Covered by existing rollback test — OperatorMessage cascades on Club deletion, no additional cleanup code or test needed.
- Translation keys added: `admin.applications.profileFields.*` (6 keys) and `admin.applications.operatorMessage.*` (2 keys) in types.ts and all 4 language files.

### Change Log

- 2026-03-08: Implemented story 4.3 — approval flow profile seeding and operator message
- 2026-03-08: Code review fixes — added server-side max-length validation (1000 chars) for operatorMessage, consolidated duplicate trims into single trim at function entry, removed dead `profileFields.description` translation key from types and all 4 language files, added empty-string test case for operatorMessage, renamed `descriptionTruncated` → `hasLongDescription` for clarity

### File List

- src/components/app/admin/ApplicationQueueItem.tsx (modified)
- src/app/[lang]/admin/(protected)/applications/actions.ts (modified)
- src/lib/email-templates.ts (modified)
- src/lib/i18n/translations/types.ts (modified)
- src/lib/i18n/translations/en.ts (modified)
- src/lib/i18n/translations/fr.ts (modified)
- src/lib/i18n/translations/de.ts (modified)
- src/lib/i18n/translations/it.ts (modified)
- src/__tests__/admin-applications.test.ts (modified)
