# Story 4.2: Application Form — Profile Fields

Status: done

## Story

As a Club Applicant,
I want the application form to collect my club's description, schedule, contact details, and how to join,
so that my club profile is pre-populated when my application is approved and I don't have to enter the same information twice.

## Acceptance Criteria

1. The `/apply` page form displays the existing fields (name, activity type, location, email, description, desired slug) plus new fields: schedule/availability (optional, textarea), contact phone (optional), contact address (optional, textarea), how to join (required, textarea), external website URL (optional, URL input)
2. The form submits successfully when all required fields (name, activity type, location, email, description, desired slug, how to join) and Turnstile challenge are completed; the application is stored with all profile fields; existing submission flow unchanged
3. Leaving the `howToJoin` field empty triggers an inline validation error on blur; the form cannot be submitted
4. An invalid URL in `externalWebsiteUrl` triggers an inline validation error on blur
5. All new fields have localized labels, placeholders, and validation messages in all 4 supported languages (en, fr, de, it)

## Tasks / Subtasks

- [x] Task 1: Update Zod schema (AC: #1, #2, #3, #4)
  - [x] 1.1 Add `schedule` (optional, string, max 500) to `applicationSchema` in `src/lib/schemas/application.ts`
  - [x] 1.2 Add `contactPhone` (optional, string, max 30) to schema
  - [x] 1.3 Add `contactAddress` (optional, string, max 500) to schema
  - [x] 1.4 Add `howToJoin` (required, string, min 1, max 1000) to schema
  - [x] 1.5 Add `externalWebsiteUrl` (optional, string, `.url()` refinement when non-empty) to schema
- [x] Task 2: Update Server Action (AC: #2)
  - [x] 2.1 In `src/app/[lang]/(platform)/apply/actions.ts`, pass the 5 new validated fields to `prisma.application.create()` data object
- [x] Task 3: Update ApplyForm component (AC: #1, #3, #4)
  - [x] 3.1 Add "Profile Details" section heading after the existing description field in `src/components/app/apply/ApplyForm.tsx`
  - [x] 3.2 Add `howToJoin` textarea (required, placeholder from translations)
  - [x] 3.3 Add `schedule` textarea (optional, placeholder from translations)
  - [x] 3.4 Add `contactPhone` input (optional, type="tel")
  - [x] 3.5 Add `contactAddress` textarea (optional)
  - [x] 3.6 Add `externalWebsiteUrl` input (optional, type="url", placeholder "https://...")
  - [x] 3.7 Follow existing field pattern: `<Label>` + `<Input|Textarea>` + error message `<p>` with `aria-live`
- [x] Task 4: Update translations (AC: #5)
  - [x] 4.1 Add field labels, placeholders, and validation messages to `apply` section in all 4 translation files (`en.ts`, `fr.ts`, `de.ts`, `it.ts`) in `src/lib/i18n/translations/`
  - [x] 4.2 Update `Translations` type in `types.ts` to include the new keys
- [x] Task 5: Update tests (AC: #1–#4)
  - [x] 5.1 Update `VALID_INPUT` fixture in `src/__tests__/apply.test.ts` to include new fields
  - [x] 5.2 Add test: valid submission with all new fields persists them to DB
  - [x] 5.3 Add test: missing `howToJoin` returns validation error
  - [x] 5.4 Add test: invalid `externalWebsiteUrl` returns validation error
  - [x] 5.5 Add test: optional fields can be omitted without error

## Dev Notes

### This Reworks Story 2.1

The application form was originally implemented in Story 2.1. Story 4.1 already added the DB columns (`schedule`, `contactPhone`, `contactAddress`, `howToJoin`, `externalWebsiteUrl`) to the `Application` model in `prisma/schema.prisma`. This story only needs to update the form UI, Zod schema, Server Action, translations, and tests — NO schema migration needed.

### Files to Modify (Exact Paths)

| File | Change |
|------|--------|
| `src/lib/schemas/application.ts` | Add 5 new fields to `applicationSchema` |
| `src/app/[lang]/(platform)/apply/actions.ts` | Pass new fields in `prisma.application.create()` |
| `src/components/app/apply/ApplyForm.tsx` | Add 5 new form fields with labels/errors |
| `src/lib/i18n/translations/types.ts` | Extend `Translations['apply']` type |
| `src/lib/i18n/translations/en.ts` | Add English labels/placeholders/errors |
| `src/lib/i18n/translations/fr.ts` | Add French labels/placeholders/errors |
| `src/lib/i18n/translations/de.ts` | Add German labels/placeholders/errors |
| `src/lib/i18n/translations/it.ts` | Add Italian labels/placeholders/errors |
| `src/__tests__/apply.test.ts` | Update VALID_INPUT, add new test cases |

### Existing Patterns to Follow

**Zod schema pattern** (from `src/lib/schemas/application.ts`):
```typescript
// Required field example:
description: z.string().trim().min(1, 'Description is required').max(1000, '...'),
// Optional field:
// Use .optional() or make it nullable with .transform()
// URL validation for optional field:
externalWebsiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
```

**Form field pattern** (from `ApplyForm.tsx`):
```tsx
<div>
  <Label htmlFor="fieldName">
    {t.apply.fields.fieldName} <span className="text-destructive">*</span>
  </Label>
  <Textarea
    id="fieldName"
    {...register('fieldName')}
    placeholder={t.apply.placeholders.fieldName}
    aria-invalid={!!errors.fieldName}
  />
  {errors.fieldName && (
    <p className="text-sm text-destructive" aria-live="polite">
      {errors.fieldName.message}
    </p>
  )}
</div>
```

**Server Action data pass-through** (from `actions.ts`):
```typescript
await prisma.application.create({
  data: {
    name, email, country, activityTypeId, locationId, description, desiredSlug,
    // ADD: schedule, contactPhone, contactAddress, howToJoin, externalWebsiteUrl,
  },
})
```

### Field Placement in Form

Insert the new fields AFTER the `description` textarea and BEFORE the `desiredSlug` field. Group them under a visual section separator:

1. `howToJoin` (required) — textarea, placeholder: "e.g., Send us an email or come to any session"
2. `schedule` (optional) — textarea, placeholder: "e.g., Tuesdays 19h-21h, Salle des sports"
3. `contactPhone` (optional) — input type="tel"
4. `contactAddress` (optional) — textarea
5. `externalWebsiteUrl` (optional) — input type="url", placeholder: "https://..."

### URL Validation Edge Case

For `externalWebsiteUrl`, handle the empty-string case: the field is optional, so an empty value should pass validation. Use a pattern like:
```typescript
externalWebsiteUrl: z.union([z.string().url(), z.literal('')]).optional(),
```
Or use `.transform()` to convert empty strings to undefined before `.url()` validation.

### Existing DB Columns (Story 4.1)

The Application model already has these columns from Story 4.1's migration:
```prisma
schedule         String?
contactPhone     String?   @map("contact_phone")
contactAddress   String?   @map("contact_address")
howToJoin        String?   @map("how_to_join")
externalWebsiteUrl String? @map("external_website_url")
```
Note: `howToJoin` is nullable in the DB schema but REQUIRED in the form validation (Zod). This is correct — the DB allows null for legacy records, but new applications must provide it.

### Turnstile and Rate Limiting

No changes needed. The existing Turnstile widget and rate limiting (3 attempts per 10 minutes per IP) remain exactly as implemented. The `turnstileToken` field stays in the Zod schema.

### Testing Patterns

Existing test mocks in `src/__tests__/apply.test.ts`:
```typescript
vi.mock('next/headers', ...)        // headers() for IP
vi.mock('@/server/db', ...)          // prisma
vi.mock('@/lib/turnstile', ...)      // verifyTurnstileToken
vi.mock('@/lib/rate-limit', ...)     // checkRateLimit
vi.mock('@/lib/server/location', ...)// upsertSwissLocation
```

Update the `VALID_INPUT` constant to include all 5 new fields. Add tests for:
- `howToJoin` missing → `VALIDATION_ERROR`
- `externalWebsiteUrl` with invalid URL → `VALIDATION_ERROR`
- All new fields persisted to DB on success (check `prisma.application.create` mock call)

### Previous Story Learnings (4.1)

- Import Prisma types from `@/generated/prisma/client` (NOT `@prisma/client`)
- All field `@map()` annotations use snake_case for DB columns
- 3 pre-existing test failures are known and acceptable (redirect mismatch in setup-password and magic-link tests)
- Quality gate: `pnpm typecheck && pnpm lint && pnpm build && pnpm test`

### Project Structure Notes

- Form component lives in `src/components/app/apply/ApplyForm.tsx` (client component with `'use client'`)
- Server Action co-located at `src/app/[lang]/(platform)/apply/actions.ts`
- Zod schemas centralized in `src/lib/schemas/application.ts`
- Translations in `src/lib/i18n/translations/{en,fr,de,it}.ts` with types in `types.ts`
- No new files needed — all changes are to existing files

### References

- [Source: src/lib/schemas/application.ts — applicationSchema]
- [Source: src/app/[lang]/(platform)/apply/actions.ts — submitApplication]
- [Source: src/components/app/apply/ApplyForm.tsx — ApplyForm component]
- [Source: src/lib/i18n/translations/types.ts — Translations type]
- [Source: src/__tests__/apply.test.ts — apply form tests]
- [Source: prisma/schema.prisma — Application model (lines 231-255)]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — Form handling, ADR-002]
- [Source: _bmad-output/implementation-artifacts/4-1-schema-migration-profile-visibility-clubphoto-operatormessage.md — Previous story learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Added 5 new fields (schedule, contactPhone, contactAddress, howToJoin, externalWebsiteUrl) to Zod applicationSchema with proper validation (howToJoin required, externalWebsiteUrl uses z.union for empty-string handling)
- Server Action destructures and passes all 5 new fields to prisma.application.create(); empty externalWebsiteUrl is stored as null
- ApplyForm component has new "Profile Details" section with all 5 fields following existing Label+Input/Textarea+error pattern
- Translation types extended with new field labels, placeholders, and validation messages (profileDetails, howToJoin, schedule, contactPhone, contactAddress, externalWebsiteUrl, howToJoinRequired, externalWebsiteUrlInvalid)
- All 4 language files (en, fr, de, it) updated with localized strings
- 6 new tests added: howToJoin missing validation, howToJoin whitespace-only validation, invalid URL validation, optional fields omission, profile fields DB persistence, empty URL stored as null
- All 347 tests pass, TypeScript clean, lint clean, no audit vulnerabilities, build succeeds

### Change Log

- 2026-03-08: Implemented application form profile fields — added schedule, contactPhone, contactAddress, howToJoin, externalWebsiteUrl to form UI, schema, server action, translations (4 languages), and tests
- 2026-03-08: Code review fixes — removed inconsistent aria-live attributes, localized max-length error messages for schedule/contactPhone/contactAddress, fixed German howToJoin label, added whitespace-only howToJoin test

### File List

- src/lib/schemas/application.ts (modified)
- src/app/[lang]/(platform)/apply/actions.ts (modified)
- src/components/app/apply/ApplyForm.tsx (modified)
- src/lib/i18n/translations/types.ts (modified)
- src/lib/i18n/translations/en.ts (modified)
- src/lib/i18n/translations/fr.ts (modified)
- src/lib/i18n/translations/de.ts (modified)
- src/lib/i18n/translations/it.ts (modified)
- src/__tests__/apply.test.ts (modified)
