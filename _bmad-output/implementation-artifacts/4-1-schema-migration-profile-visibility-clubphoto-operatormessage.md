# Story 4.1: Schema Migration — Profile Fields, Visibility, ClubPhoto, OperatorMessage

Status: done

## Story

As a platform engineer,
I want the database schema updated to support club profile fields, two-flag visibility, photo storage, and unified operator messages,
so that all subsequent stories in this epic have the data foundation they need.

## Acceptance Criteria

1. `Club` model gains new nullable text columns: `description` (renamed from `welcomeText`), `schedule`, `howToJoin`, `contactPhone`, `contactAddress`, `externalWebsiteUrl`; and new boolean columns: `isPublished` (default `false`), `forceOffline` (default `false`)
2. `Application` model gains new nullable columns: `schedule` (text), `contactPhone`, `contactAddress` (text), `howToJoin` (text), `externalWebsiteUrl`
3. New `ClubPhoto` model: `id` (cuid), `clubId` (FK → Club, cascade delete), `url`, `alt` (default `""`), `position` (Int, default 0), `createdAt`; indexed on `clubId`; mapped to `club_photos`
4. `OperatorNudge` model replaced by `OperatorMessage`: `id` (cuid), `clubId` (FK → Club, cascade delete), `message` (text), `createdAt`, `readAt` (nullable DateTime); indexed on `clubId`; mapped to `operator_messages`
5. Migration renames `Club.welcomeText` to `description` (no data loss — requires manual SQL edit, see Dev Notes)
6. `Club` model has relations `ClubPhoto[]` and `OperatorMessage[]`; old `operatorNudges OperatorNudge[]` relation removed
7. Prisma client regenerated successfully; `pnpm typecheck` passes with zero new errors
8. All existing tests pass (`pnpm test`) — zero regressions introduced

## Tasks / Subtasks

- [x] Task 1: Update Prisma schema (AC: #1, #2, #3, #4, #6)
  - [x] 1.1 Rename `welcomeText` field to `description` on `Club` model (keep `@map("description")`)
  - [x] 1.2 Add new nullable columns to `Club`: `schedule`, `howToJoin`, `contactPhone`, `contactAddress`, `externalWebsiteUrl`, `isPublished` (Boolean, default false), `forceOffline` (Boolean, default false)
  - [x] 1.3 Add new nullable columns to `Application`: `schedule`, `contactPhone`, `contactAddress`, `howToJoin`, `externalWebsiteUrl`
  - [x] 1.4 Create `ClubPhoto` model with all specified fields and `@@map("club_photos")`
  - [x] 1.5 Create `OperatorMessage` model with all specified fields and `@@map("operator_messages")`
  - [x] 1.6 Remove `OperatorNudge` model and its relation on `Club`
  - [x] 1.7 Add `photos ClubPhoto[]` and `operatorMessages OperatorMessage[]` relations to `Club`
- [x] Task 2: Generate and customize migration (AC: #5, #7)
  - [x] 2.1 Run `prisma migrate dev --name epic4-profile-visibility-photo-message --create-only`
  - [x] 2.2 Edit generated SQL: replace DROP/ADD for `welcome_text` → `description` with `ALTER TABLE clubs RENAME COLUMN welcome_text TO description;`
  - [x] 2.3 Verify migration handles `OperatorNudge` → `OperatorMessage` correctly (data migration if any nudges exist, or clean DROP + CREATE if table is empty in dev)
  - [x] 2.4 Apply migration: `prisma migrate dev`
- [x] Task 3: Verify generated client and fix downstream references (AC: #7, #8)
  - [x] 3.1 Run `prisma generate` and confirm types in `@/generated/prisma/client`
  - [x] 3.2 Search codebase for `welcomeText` references and update to `description`
  - [x] 3.3 Search codebase for `OperatorNudge` / `operatorNudges` references and update to `OperatorMessage` / `operatorMessages`
  - [x] 3.4 Run `pnpm typecheck` — fix any type errors
  - [x] 3.5 Run `pnpm test` — verify zero regressions (3 pre-existing failures are acceptable, no new ones)
  - [x] 3.6 Run `pnpm build` — verify build succeeds

## Dev Notes

### Critical: Column Rename Requires Manual SQL Edit

Prisma `migrate dev` interprets a renamed field as DROP old + ADD new, which **destroys data**. You MUST:
1. Use `--create-only` flag to generate the migration without applying
2. Open the generated `migration.sql` file
3. Find the DROP/ADD statements for `welcome_text` and replace with:
   ```sql
   ALTER TABLE "clubs" RENAME COLUMN "welcome_text" TO "description";
   ```
4. Then run `prisma migrate dev` to apply the edited migration

[Source: Prisma docs — Customizing migrations](https://www.prisma.io/docs/orm/prisma-migrate/workflows/customizing-migrations)

### OperatorNudge → OperatorMessage Migration

The existing `OperatorNudge` model (table `operator_nudges`) has fields: `id`, `clubId`, `operatorId`, `subject`, `messageBody`, `sentAt`. The new `OperatorMessage` model has different fields: `id`, `clubId`, `message`, `createdAt`, `readAt`. In development, if the `operator_nudges` table is empty, a clean DROP + CREATE is fine. If it contains data, add a data migration step in the SQL to copy relevant records.

### Schema Field Mapping Reference

All new fields must use `@map()` for snake_case DB columns. Reference patterns from existing schema:

```prisma
// Club model additions
description       String?   @map("description")    // renamed from welcomeText
schedule          String?   @map("schedule")
howToJoin         String?   @map("how_to_join")
contactPhone      String?   @map("contact_phone")
contactAddress    String?   @map("contact_address")
externalWebsiteUrl String?  @map("external_website_url")
isPublished       Boolean   @default(false) @map("is_published")
forceOffline      Boolean   @default(false) @map("force_offline")

// Application model additions
schedule          String?   @map("schedule")
contactPhone      String?   @map("contact_phone")
contactAddress    String?   @map("contact_address")
howToJoin         String?   @map("how_to_join")
externalWebsiteUrl String?  @map("external_website_url")
```

### ADR References

- **ADR-002**: Club profile fields live directly on `Club` model (not JSONB, not separate entity)
- **ADR-003**: Two-flag visibility — `isPublished` (admin) + `forceOffline` (operator). Club visible only when `isPublished = true AND forceOffline = false`
- **ADR-004**: Unified `OperatorMessage` replaces `OperatorNudge`. Single model for all operator-to-admin communication

### Existing Code References to Update

After schema change, grep for and update these references:
- `welcomeText` → `description` (likely in seed files, test fixtures, any server actions referencing club fields)
- `operatorNudges` / `OperatorNudge` → `operatorMessages` / `OperatorMessage`
- Import path: always `from '@/generated/prisma/client'` (NOT `from '@prisma/client'`)

### Project Structure Notes

- Prisma schema: `prisma/schema.prisma`
- Generated client: `src/generated/prisma/client` (configured via `output` in schema)
- Migrations: `prisma/migrations/` (auto-generated directory)
- No application code changes needed beyond fixing type references — UI/API changes come in subsequent stories (4.2–4.9)

### Testing

- Framework: Vitest (`pnpm test`), tests in `src/__tests__/`
- This story primarily validates that the schema compiles and existing tests don't break
- 3 pre-existing test failures are known and acceptable: `setup-password.test.ts` (x2), `magic-link-route.test.ts` (x1) — redirect mismatch unrelated to this work
- No new test files needed for a pure schema migration

### Quality Gate

Before marking done, all must pass:
```bash
pnpm typecheck     # tsc --noEmit
pnpm lint          # eslint
pnpm build         # next build
pnpm test          # vitest (3 pre-existing failures OK, 0 new)
```

### References

- [Source: prisma/schema.prisma — Club model](prisma/schema.prisma#L182-L221)
- [Source: prisma/schema.prisma — Application model](prisma/schema.prisma#L223-L242)
- [Source: prisma/schema.prisma — OperatorNudge model](prisma/schema.prisma#L480-L491)
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — ADR-002, ADR-003, ADR-004]
- [Source: Prisma docs — Customizing migrations](https://www.prisma.io/docs/orm/prisma-migrate/workflows/customizing-migrations)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- `prisma migrate dev --create-only` requires interactive terminal; used `prisma migrate diff --from-config-datasource --to-schema` to generate SQL, then manually created migration directory and wrote customized SQL with `RENAME COLUMN` instead of DROP/ADD.
- Applied migration via `prisma migrate deploy` (non-interactive).

### Completion Notes List

- Renamed `Club.welcomeText` to `Club.description` with data-preserving `RENAME COLUMN` SQL
- Added 6 new nullable text fields + 2 boolean visibility flags to `Club` model
- Added 5 new nullable fields to `Application` model for profile data capture at application time
- Created `ClubPhoto` model (mapped to `club_photos`) with `clubId` index and cascade delete
- Replaced `OperatorNudge` with `OperatorMessage` model (mapped to `operator_messages`) with `clubId` index, cascade delete, and `readAt` tracking
- Updated all downstream references: club queries, seed data, public pages, hero section component, multi-tenant middleware, verify script, and 4 test files
- All quality gates pass: typecheck (0 errors), lint (clean), audit (no vulnerabilities), build (success), tests (341/341 pass, 0 regressions)

### Change Log

- 2026-03-07: Schema migration — Club profile fields, visibility flags, ClubPhoto, OperatorMessage replaces OperatorNudge, welcomeText renamed to description
- 2026-03-07: Code review fixes — Added `clubPhoto` to multi-tenant middleware (security fix), removed redundant `@map` on single-word fields, added sprint-status.yaml to File List

### File List

- prisma/schema.prisma (modified)
- prisma/migrations/20260307224424_epic4_profile_visibility_photo_message/migration.sql (new)
- prisma/seed.ts (modified)
- prisma/verify.ts (modified)
- src/server/db.ts (modified)
- src/lib/server/club-queries.ts (modified)
- src/components/app/club-site/ClubHeroSection.tsx (modified)
- src/app/[lang]/(country)/[country]/[club]/page.tsx (modified)
- src/app/[lang]/(country)/[country]/[club]/contact/page.tsx (modified)
- src/app/[lang]/(country)/[country]/[club]/[page]/page.tsx (modified)
- src/__tests__/club-public-page.test.ts (modified)
- src/__tests__/club-layout-guard.test.ts (modified)
- src/__tests__/public-layout.test.ts (modified)
- src/__tests__/club-inner-page.test.ts (modified)
- src/generated/prisma/ (regenerated)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)
