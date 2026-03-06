# Story 2.1: Club Application Form

Status: done

## Story

As a Club Applicant,
I want to submit an application to join the platform by providing my association's name, activity type, and a short description,
so that the platform team can review whether my association is a good fit.

## Acceptance Criteria

1. Given a visitor navigates to the `/{lang}/apply` page on the platform site, when the page loads, then a form is displayed with fields: association name (required), email (required), activity type (required, translated select from `ActivityType` table), country (required, select — only "ch" for MVP), location (required, typeahead backed by `/api/locations`), desired URL slug (optional, with live preview), and description (required, free text); a Cloudflare Turnstile widget is present.
2. Given the applicant fills all required fields and completes the Turnstile challenge, when they submit the form, then the application is stored in the database with status `PENDING`; a success confirmation is shown on screen; no email is sent to the applicant at this stage.
3. Given any required field is missing on submission, then inline field-level validation errors appear below the relevant field on blur; the form is not submitted.
4. Given the Turnstile token verification fails server-side, then the Server Action returns `{ success: false, error: 'Bot protection failed', code: 'TURNSTILE_FAILED' }` and an inline error is shown.
5. Given the same IP submits multiple applications in a short window, then the in-memory rate limiter blocks subsequent submissions with a clear error message.

## Tasks / Subtasks

- [x] Task 1: Create Zod validation schema (AC: #1, #3)
  - [x] 1.1 Create `src/lib/schemas/application.ts` with `applicationSchema`
  - [x] 1.2 Fields: `name` (string, required, trimmed, max 200), `email` (string, email format, max 254), `country` (literal "ch" for MVP), `activityTypeId` (string, cuid), `location` (object: `{ swisstopoId: string max 20, plz: string max 10, cantonCode: string, name: string max 200 }`), `description` (string, required, trimmed, max 1000 chars), `desiredSlug` (optional, trimmed, min 1, max 60, regex `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`), `turnstileToken` (string, required)
  - [x] 1.3 Note: `locationId` is NOT sent by the client — the server calls `upsertSwissLocation()` with the location object to get/create a `locationId`
- [x] Task 2: Add Turnstile integration (AC: #1, #4)
  - [x] 2.1 Install dependencies: `pnpm add @marsidev/react-turnstile react-hook-form @hookform/resolvers`
  - [x] 2.2 Create `src/lib/turnstile.ts` — server-side `verifyTurnstileToken(token: string): Promise<boolean>` that POSTs to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `TURNSTILE_SECRET_KEY`
  - [x] 2.3 Token is single-use, expires after 300s — verify before any DB write
- [x] Task 3: Add apply form translations (AC: #1, #3)
  - [x] 3.1 Add `apply` namespace to `Translations` type in `src/lib/i18n/translations/types.ts`
  - [x] 3.2 Add translations in all 4 language files (`en.ts`, `fr.ts`, `de.ts`, `it.ts`) for: page title, field labels, placeholders, validation errors, success message, rate limit error, bot protection error
- [x] Task 4: Create Server Action (AC: #2, #4, #5)
  - [x] 4.1 Create `src/app/[lang]/(platform)/apply/actions.ts`
  - [x] 4.2 `submitApplication` Server Action: extract IP via `(await headers()).get('x-forwarded-for')` → `checkRateLimit('apply:' + ip, { windowMs: 600000, maxAttempts: 3 })` → Zod safeParse → `verifyTurnstileToken` → verify `activityTypeId` exists via `prisma.activityType.findUnique` → call `upsertSwissLocation({ swisstopoId, plz, cantonCode, displayName: location.name })` to get `locationId` → `prisma.application.create({ data: { name, email, country, activityTypeId, locationId, description, desiredSlug } })` → return `{ success: true }`
  - [x] 4.3 Return typed error objects with codes: `RATE_LIMITED`, `VALIDATION_ERROR`, `TURNSTILE_FAILED`, `SERVER_ERROR`
- [x] Task 5: Create Apply page and form component (AC: #1, #2, #3)
  - [x] 5.1 Create `src/app/[lang]/(platform)/apply/page.tsx` — Server Component that loads translations + activity types from DB
  - [x] 5.2 Create `src/components/app/apply/ApplyForm.tsx` — Client Component with react-hook-form + @hookform/resolvers/zod
  - [x] 5.3 Location typeahead: fetch `/api/locations?country=ch&q=${query}&lang=${lang}` on input (debounce 300ms via `setTimeout`/`clearTimeout`). API returns `{ swisstopoId, plz, name, cantonCode }[]`. Store the full selected location object in form state — the server needs all 4 fields for `upsertSwissLocation`.
  - [x] 5.4 Turnstile widget rendered via `@marsidev/react-turnstile`, token stored in hidden form field
  - [x] 5.5 On success: show confirmation message, hide form
  - [x] 5.6 Labels above inputs, errors below fields on blur, submit button bottom-right
- [x] Task 6: Write tests (AC: all)
  - [x] 6.1 Create `src/__tests__/apply.test.ts` — test Server Action: happy path, missing fields, Turnstile failure, rate limiting
  - [x] 6.2 Mock: `@/server/db`, `src/lib/turnstile`, `src/lib/rate-limit`, `next/headers`
  - [x] 6.3 Follow patterns from `src/__tests__/invite-editor.test.ts`

## Dev Notes

### Architecture Compliance

- **No authentication required** — apply page is public, under `(platform)` route group
- **Multi-tenant middleware**: `Application` model has NO `clubId` — it is a platform-level model. Verify it is excluded from the multi-tenant middleware in `src/server/db.ts` (same as SwissCanton, SwissLocation, etc.)
- **Server Action pattern**: co-locate `actions.ts` with route segment at `src/app/[lang]/(platform)/apply/actions.ts`; never throw from Server Actions — return `{ success: false, error, code }`
- **API response contract**: `{ success: true, data?: T }` or `{ success: false, error: string, code: string }`
- **Error codes**: SCREAMING_SNAKE_CASE (e.g., `TURNSTILE_FAILED`, `RATE_LIMITED`, `VALIDATION_ERROR`)
- **Zod validation**: `safeParse` in Server Actions (never throw)
- **Form library**: react-hook-form + @hookform/resolvers/zod — must be installed (Task 2.1)
- **Scope note**: The original epics AC specifies 3 fields (name, activity type, description). This story adds email, country, and location fields to match the existing `Application` Prisma model. This is intentional — the model was designed with these fields for the approval flow (stories 2.3, 2.4).
- **Env vars for Turnstile**: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (client widget) and `TURNSTILE_SECRET_KEY` (server verification) — both already in `.env.example` with test keys

### Existing Code to Reuse (DO NOT REINVENT)

| What | Where | How to Use |
|------|-------|------------|
| Rate limiter | `src/lib/rate-limit.ts` | `checkRateLimit('apply:' + ip, { windowMs: 600000, maxAttempts: 3 })` |
| Email sender | `src/lib/email.ts` | Not needed for this story (no email on submit) |
| Location API | `src/app/api/locations/route.ts` | Client-side fetch for typeahead: `GET /api/locations?country=ch&q=${query}&lang=${lang}` (rate-limited: 30 req/min per IP) |
| Location upsert | `src/lib/server/location.ts` | `upsertSwissLocation({ swisstopoId, plz, cantonCode, displayName })` returns `{ locationId }` |
| Slug utility | `src/lib/slug.ts` | "apply" is already a reserved slug — no conflict |
| Prisma Application model | `prisma/schema.prisma` line ~223 | Already exists with correct fields and `ApplicationStatus` enum |
| Activity types | `prisma/seed.ts` | Already seeded: skiing, football, mountaineering, tennis |
| PageEventType | `prisma/schema.prisma` | `apply_form_sent` event type pre-defined — optionally track in `PageEvent` |
| shadcn/ui components | `src/components/ui/` | Input, Textarea, Select, Label, Button — never edit these files |
| Translation pattern | `src/lib/i18n/translations/` | Add `apply` namespace following existing pattern in `types.ts` |
| Server Action pattern | `src/app/[lang]/(country)/[country]/[club]/settings/actions.ts` | Reference for `'use server'`, Zod safeParse, typed return, error codes |

### Turnstile Integration Details

- **Client**: Install `@marsidev/react-turnstile` — renders invisible/managed widget, calls `onSuccess(token)` callback
- **Server verification**: POST `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `{ secret: TURNSTILE_SECRET_KEY, response: token }`. Returns `{ success: boolean }`.
- **Token lifecycle**: single-use, expires after 300s, verify before DB write
- **Dev environment**: `.env.example` already has test keys (`1x00000000000000000000AA` / `1x0000000000000000000AA`) — always passes in dev
- **No fallback**: Turnstile widget conditionally rendered when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is truthy; `turnstileToken` defaults to empty string — form cannot submit without Turnstile configured
- **WCAG 2.1 AA compliant** as of 2025

### Database Schema (Application Model — Already Exists)

```prisma
model Application {
  id               String            @id @default(cuid())
  name             String            // Association name
  country          String            // "ch" for MVP
  activityTypeId   String?           // FK to ActivityType
  otherDescription String?           // When no matching ActivityType
  locationId       String?           // FK to Location (resolved from typeahead)
  description      String            // Free-text description
  email            String            // Applicant's email
  desiredSlug      String?           // Applicant's preferred URL slug (final decided by operator)
  status           ApplicationStatus @default(PENDING)
  rejectionReason  String?
  submittedAt      DateTime          @default(now())
  reviewedAt       DateTime?
  activityType     ActivityType?     @relation(...)
  location         Location?         @relation(...)
}
```

### Form Field → DB Column Mapping

| Form Field | DB Column | Notes |
|------------|-----------|-------|
| Association Name | `name` | Required, trimmed |
| Email | `email` | Required, email format |
| Country | `country` | "ch" for MVP (hardcoded select) |
| Activity Type | `activityTypeId` | FK to ActivityType.id; load options from DB |
| Location | `locationId` | FK to Location.id; client sends `{ swisstopoId, plz, cantonCode, name }` from typeahead selection; server calls `upsertSwissLocation()` to resolve `locationId` |
| Description | `description` | Required, free text, max ~1000 chars |
| Desired URL Slug | `desiredSlug` | Applicant's preference; final slug decided by platform operator |
| Turnstile Token | — | Not stored; verified server-side then discarded |

### UX Requirements

- **Validation timing**: On `blur` (when field loses focus), NOT on keystroke
- **Error display**: Inline below the field; clear when value becomes valid
- **Labels**: Above inputs (not floating)
- **Layout**: Single column on mobile; primary submit button bottom-right
- **Success state**: Show confirmation message, hide form — user must reload to resubmit
- **Accessibility**: `aria-required` on required fields, `aria-describedby` linking errors to inputs, keyboard navigable, touch targets 44x44px minimum; location typeahead has full keyboard navigation (ArrowDown/Up/Enter/Escape) with ARIA listbox/option/combobox roles, `aria-expanded`, `aria-activedescendant`
- **Required fields**: Asterisk indicator (`RequiredMark` component) on required fields + `* Required` legend at top of form
- **Location typeahead**: Selection-only — typing without selecting from dropdown clears the input on blur
- **Desired slug preview**: Live URL preview shown only when input matches slug regex
- **No email sent** to applicant on submit — email only on approval/rejection (stories 2.3, 2.4)

### i18n Considerations

- Page is at `/{lang}/apply` — language comes from URL segment
- Server Component loads translations via `getTranslations(lang)` and passes `t` prop to client form
- Activity type names are translated via slug-based lookup in translation files (`activityTypes` namespace); falls back to DB `name` for unknown slugs. Sorted with locale-aware collation after translation.
- Location typeahead passes `lang` param to `/api/locations` for localized Swiss municipality names; includes villages/settlements via `gazetteer` origin with `TLM_SIEDLUNGSNAME` objectclass

### Previous Story Intelligence (2-0)

Key patterns established in Story 2.0 that MUST be followed:
- **Next.js 16 params**: `params` is a Promise — always `const { lang } = await params`
- **Translation flow**: Server Component calls `getTranslations(lang)`, passes `t` to Client Components
- **Route structure**: Public platform pages go under `src/app/[lang]/(platform)/`
- **Prisma import**: Always `from '@/generated/prisma/client'`
- **Test mocking**: mock `prisma.$transaction` as `async (fn) => fn(prisma)`, mock `next/headers` for cookies
- **Language fallback**: Use `resolveUILang(lang)` to normalize to supported languages (en, fr, de, it)

### Git Intelligence

Recent commits show sequential epic 1 completion and epic 2 start:
- `f67fd52` — feat: story 2.0 (i18n/location infrastructure)
- `2b124e9` — feat: epic 1 retrospective + epic 2 planning
- Previous stories established all auth, membership, and platform admin patterns

### Project Structure Notes

Files to create:
```
src/app/[lang]/(platform)/apply/
  page.tsx                    # Server Component — load translations + activity types
  actions.ts                  # Server Action — submitApplication
src/components/app/apply/
  ApplyForm.tsx               # Client Component — form with react-hook-form
src/lib/schemas/
  application.ts              # Zod schema for application form
src/lib/
  turnstile.ts                # Server-side Turnstile token verification
src/__tests__/
  apply.test.ts               # Vitest tests for Server Action
src/lib/i18n/translations/
  types.ts                    # Add 'apply' namespace
  en.ts, fr.ts, de.ts, it.ts # Add apply translations
```

Files to modify:
```
src/lib/i18n/translations/types.ts  # Add apply namespace to Translations type
src/lib/i18n/translations/en.ts     # Add English apply translations
src/lib/i18n/translations/fr.ts     # Add French apply translations
src/lib/i18n/translations/de.ts     # Add German apply translations
src/lib/i18n/translations/it.ts     # Add Italian apply translations
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — Bot Protection, Rate Limiting, API Response Contract, Form Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md — FR27 (apply form), User Journey 3]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Form Patterns, Accessibility, Journey 3]
- [Source: _bmad-output/implementation-artifacts/2-0-i18n-location-infrastructure.md — Previous story patterns]
- [Source: prisma/schema.prisma — Application model, ApplicationStatus enum, ActivityType model]
- [Source: src/lib/rate-limit.ts — Existing rate limiter]
- [Source: src/lib/email.ts — Email sender (not needed this story)]
- [Source: src/app/api/locations/route.ts — Location typeahead API]
- [Source: Cloudflare Turnstile docs — Server-side validation API]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Created Zod validation schema with nested location object, cuid validation for activityTypeId, and turnstileToken field
- Implemented server-side Turnstile token verification via Cloudflare's siteverify endpoint
- Added `apply` translation namespace across all 4 languages (en, fr, de, it) with field labels, placeholders, validation messages, success/error messages
- Server Action follows established patterns: rate limiting (3 attempts/10min per IP), Zod safeParse, typed error codes (RATE_LIMITED, VALIDATION_ERROR, TURNSTILE_FAILED, SERVER_ERROR)
- Apply page is a Server Component loading translations + activity types from DB, passing to client form
- Client form uses react-hook-form with zodResolver, onBlur validation, debounced location typeahead (300ms), Turnstile widget
- Added shadcn Textarea and Select components (were missing from UI library)
- 10 unit tests covering: happy path, rate limiting, validation errors, Turnstile failure, DB errors, IP extraction, invalid activityTypeId, upsertSwissLocation failure
- All 223 tests pass (0 regressions), TypeScript compiles cleanly, lint passes (0 warnings), audit clean, build succeeds

### Code Review Fixes (Post-Review)

- **H1**: Added `activityType.findUnique` existence check in Server Action — returns VALIDATION_ERROR if activityTypeId not found
- **H2**: Added full keyboard navigation (ArrowDown/Up/Enter/Escape) to location typeahead with ARIA listbox/option/combobox roles, aria-expanded, aria-activedescendant
- **H3**: Renamed `nameFr` → `displayName` in `UpsertSwissLocationInput` type and all usages (location.ts, location.test.ts, actions.ts)
- **M1**: Replaced `watch('location')` with `getValues('location')` to avoid React Compiler lint warning
- **M2**: Removed non-null assertion on `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; Turnstile widget conditionally rendered when siteKey is truthy
- **M3**: Added translated placeholder to ActivityType Select via `SelectValue placeholder={t.apply.placeholders.activityType}`
- **M4**: Added test case for `upsertSwissLocation` failure → SERVER_ERROR
- **M5**: Added required field asterisks (`RequiredMark` component) and `* Required` legend at top of form
- **L1**: Translated country label via `countryLabel` prop (passed from Server Component using `t.apply.countrySwitzerland`)
- **L2**: Tightened location schema: `plz` regex `/^\d{4}$/`, `cantonCode` regex `/^[A-Z]{2}$/`

### Post-Implementation Enhancements (2026-03-06)

#### Security Hardening (Adversarial Review)
- **H1/H2**: Added `max()` constraints to all previously unbounded Zod fields — `name` (200), `email` (254), `location.swisstopoId` (20), `location.name` (200), `location.plz` (10)
- **M1**: Added rate limiting to `/api/locations` endpoint (30 req/min per IP) — was previously unprotected
- **M2**: Removed `'no-turnstile-configured'` fallback in ApplyForm — `turnstileToken` defaults to empty string; form cannot submit without Turnstile

#### Location Typeahead Fixes
- Relaxed PLZ schema from `/^\d{4}$/` to `z.string().max(10)` — swisstopo municipalities don't always include PLZ
- Added `gazetteer` origin with `TLM_SIEDLUNGSNAME` objectclass to include villages/settlements (e.g. Verbier), not just municipalities
- Enforced selection-only: typing without selecting from dropdown clears the input on blur
- Added `trigger('location')` after `setValue` to work around react-hook-form `mode: 'onBlur'` ignoring `shouldValidate`

#### New Feature: Desired URL Slug
- Added `desiredSlug` column to Application model (nullable `String?`, Prisma migration `add_desired_slug_to_application`)
- Added `desiredSlug` to Zod schema: trimmed, min 1, max 60, regex `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` (lowercase alphanumeric + hyphens)
- Server Action persists `desiredSlug` to DB
- Form field with live URL preview using `window.location.origin` (shows e.g. `http://localhost:3000/fr/ch/ski-club-valais`)
- Hint text: final slug decided by platform operator, changeable anytime
- Full i18n: field label, placeholder, validation messages, hint — all 4 languages

#### Form UX Improvements
- Reordered form fields: activity type now appears before country dropdown
- Activity types are now translated via slug-based lookup in translation files (fallback to DB `name` for unknown slugs)
- Added `activityTypes` translation namespace with skiing/football/mountaineering/tennis in all 4 languages

#### Test Updates
- Updated `VALID_INPUT` and happy-path assertion with `desiredSlug` field
- Fixed location test mock to include `headers` and mock `checkRateLimit` for new rate-limiting middleware

### Change Log

- 2026-03-05: Implemented club application form (Story 2.1) — public apply page with Turnstile bot protection, rate limiting, location typeahead, i18n support in 4 languages
- 2026-03-05: Fixed all 10 code review findings (3H, 5M, 2L) — activityType validation, keyboard a11y, schema tightening, test coverage
- 2026-03-06: Security hardening (schema max lengths, location API rate limiting, Turnstile fallback removal), location typeahead fixes (villages, PLZ relaxation, selection enforcement), added desiredSlug field, form UX improvements (field reorder, translated activity types)
- 2026-03-06: Code review #2 — fixed 6 issues: slug preview only shows when regex-valid (H2), activity types sorted after translation with locale-aware collation (H3), added invalid slug test (M1), removed redundant optional chaining (M2), added debounce cleanup on unmount (M3), added .env.example to File List (L1). H1 (reserved slug check) deferred to operator approval step.
- 2026-03-06: Dynamic country support — replaced hardcoded "ch" with dynamic country selection driven by `SUPPORTED_COUNTRIES` from `src/lib/country.ts`. Country names centralized in `COUNTRY_NAMES` map (per language). Schema uses `z.enum(SUPPORTED_COUNTRIES)`. Form accepts `countries` prop, renders dynamic `<Select>` (disabled when single country), slug preview and location search use selected country. Removed `countrySwitzerland` from all translation files. Adding a new country = one-file change in `country.ts`.
- 2026-03-06: Code review #3 — fixed 4 issues: COUNTRY_NAMES typed as Record<SupportedLanguage,...> (M1), getCountryName English fallback uses dot access for safety (M2), added init migration to File List (M3), expanded country.ts comment to mention location API (L1).

### File List

New files:
- src/lib/schemas/application.ts
- src/lib/turnstile.ts
- src/app/[lang]/(platform)/apply/actions.ts
- src/app/[lang]/(platform)/apply/page.tsx
- src/components/app/apply/ApplyForm.tsx
- src/components/ui/textarea.tsx
- src/components/ui/select.tsx
- src/__tests__/apply.test.ts

Modified files:
- src/lib/country.ts (reduced to ['ch'], exported SUPPORTED_COUNTRIES, added COUNTRY_NAMES map and getCountryName helper)
- src/lib/i18n/translations/types.ts (added apply namespace, activityTypes Record, removed countrySwitzerland)
- src/lib/i18n/translations/en.ts (apply translations, activityTypes)
- src/lib/i18n/translations/fr.ts (apply translations, activityTypes)
- src/lib/i18n/translations/de.ts (apply translations, activityTypes)
- src/lib/i18n/translations/it.ts (apply translations, activityTypes)
- src/lib/server/location.ts (renamed nameFr → displayName in type and implementation)
- src/app/api/locations/route.ts (added rate limiting)
- src/__tests__/location.test.ts (updated to use displayName, added headers mock and rate-limit mock)
- prisma/schema.prisma (added desiredSlug to Application model)
- prisma/migrations/init/migration.sql (regenerated with desiredSlug column)
- prisma/migrations/20260306090347_add_desired_slug_to_application/
- .env.example (added Turnstile test keys)
- package.json (added @marsidev/react-turnstile, react-hook-form, @hookform/resolvers, radix-ui)
- pnpm-lock.yaml
