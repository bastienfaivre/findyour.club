# Story 4.6: Club Profile Edit Form & Photo Upload

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Club Admin,
I want to edit my club's profile fields and upload photos through the admin dashboard,
So that I can complete my club's public presence with accurate information and appealing visuals.

## Acceptance Criteria

1. **Given** the Club Admin selects "Club Profile" in the admin dashboard sidebar, **When** the content area loads, **Then** an edit form appears with fields pre-populated from the club record: name (text input), logo (image upload, max 5 MB, JPG/PNG/WebP with alt text required), description (textarea), schedule/availability (textarea), contact email (text input — the club's registered email), contact phone (optional), contact address (optional, textarea), how to join (textarea), external website link (optional URL field) (FR1, FR47). The amber dot is absent until a field is changed.

2. **Given** the Club Admin changes any text field value, **When** a change is made, **Then** the amber unsaved-changes dot appears (Story 4.5 save framework).

3. **Given** the profile form, **Then** a "Photos" section displays existing club photos as a thumbnail grid, and an "Add photos" upload zone accepting up to 10 images total (JPEG, PNG, WebP; max 5 MB each); photos are uploaded via presigned URL to R2/MinIO — no file bytes pass through the Next.js server (FR48).

4. **Given** the club already has 10 photos, **When** the Club Admin attempts to add another, **Then** the upload zone is disabled with an inline message: "Maximum 10 photos reached. Remove a photo to add a new one."

5. **Given** an uploaded photo, **Then** it appears in the thumbnail grid with a delete button; deleting a photo removes it from R2 and the `ClubPhoto` record.

6. **Given** an upload that exceeds size or format constraints, **Then** an inline error appears below the upload zone describing the specific constraint violated; no upload is attempted (FR19).

7. **Given** the Club Admin clicks Save, **When** the `saveClubProfile` Server Action executes, **Then** `clubId` is resolved from URL params (verified by the club layout membership check); the club record is updated with all text field values; `revalidatePath` invalidates the club page SSR cache; a "Saved" toast appears.

## Tasks / Subtasks

- [x]Task 1: Create R2/MinIO presigned URL infrastructure (AC: #3, #6)
  - [x]1.1 Create `src/lib/r2.ts` — S3 client instance using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`, configured from env vars (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`)
  - [x]1.2 Export `generateUploadUrl(clubId: string, fileExtension: string)` — generates a PUT presigned URL with key `{clubId}/{cuid()}.{ext}`, 10-minute expiry, content-type constraint
  - [x]1.3 Export `deleteObject(key: string)` — deletes an object from R2/MinIO by key
  - [x]1.4 Export `getPublicUrl(key: string)` — returns `{R2_PUBLIC_URL}/{key}`
  - [x]1.5 Export constants: `ALLOWED_IMAGE_TYPES` (`image/jpeg`, `image/png`, `image/webp`), `MAX_IMAGE_SIZE_BYTES` (5 * 1024 * 1024)
  - [x]1.6 Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` via pnpm

- [x]Task 2: Create photo upload/delete Server Actions (AC: #3, #4, #5, #6)
  - [x]2.1 Create `getPresignedUploadUrl` Server Action in `src/app/[lang]/(country)/[country]/[club]/admin/actions.ts` — three-step auth guard, validates MIME type and extension, checks photo count < 10, returns `{ success: true, data: { uploadUrl, key, publicUrl } }`
  - [x]2.2 Create `createClubPhoto` Server Action — called after successful client-side upload to R2; creates `ClubPhoto` record with `url`, `alt`, `position` (next position = max existing + 1); calls `revalidatePath`
  - [x]2.3 Create `deleteClubPhoto` Server Action — auth guard, verifies photo belongs to club (`where: { id, clubId }`), deletes from R2 via `deleteObject(key)`, deletes `ClubPhoto` record, calls `revalidatePath`
  - [x]2.4 Create `uploadLogo` Server Action — similar to photo: get presigned URL, after upload create/update `logoUrl` and `logoAlt` on Club record; if replacing existing logo, delete old object from R2
  - [x]2.5 Create `deleteLogo` Server Action — removes `logoUrl`/`logoAlt` from Club, deletes from R2

- [x]Task 3: Expand Zod schema and `saveClubProfile` Server Action (AC: #1, #7)
  - [x]3.1 Update `clubProfileSaveSchema` in `src/lib/schemas/club.ts` with full fields: `name` (string, min 1, max 200), `description` (string, max 5000, nullable), `schedule` (string, max 2000, nullable), `howToJoin` (string, max 2000, nullable), `contactPhone` (string, max 20, nullable), `contactAddress` (string, max 500, nullable), `externalWebsiteUrl` (string, url, nullable or empty string)
  - [x]3.2 Update `saveClubProfile` in `admin/actions.ts` — replace stub with actual `prisma.club.update({ where: { id: clubId }, data: validatedFields })`; call `revalidatePath`
  - [x]3.3 Return `{ success: true, data: { savedAt: new Date().toISOString() } }` on success

- [x]Task 4: Build profile edit form UI (AC: #1, #2)
  - [x]4.1 Update `ClubProfileForm.tsx` — add all text fields using shadcn `Input`, `Textarea`, and react-hook-form `Controller`; pre-populate with club data passed as props from the server page
  - [x]4.2 Update `admin/page.tsx` — fetch club data (including photos) via Prisma query in the Server Component; pass to `ClubProfileForm`
  - [x]4.3 Add field-level validation feedback (inline errors from Zod via react-hook-form `formState.errors`)
  - [x]4.4 External website URL field: validate as URL format on blur via `trigger('externalWebsiteUrl')`

- [x]Task 5: Build logo upload component (AC: #1)
  - [x]5.1 Create `src/components/app/club-admin/LogoUpload.tsx` — client component with file input (hidden), preview of current logo, "Change logo" / "Remove logo" buttons
  - [x]5.2 Client-side validation: check file type (JPEG/PNG/WebP) and size (< 5 MB) before requesting presigned URL
  - [x]5.3 Upload flow: call `uploadLogo` action to get presigned URL → PUT file directly to R2 → call action to persist `logoUrl`/`logoAlt`
  - [x]5.4 Alt text: required text input shown after logo upload or for existing logo
  - [x]5.5 Show upload progress indicator during PUT to R2

- [x]Task 6: Build photo gallery component (AC: #3, #4, #5, #6)
  - [x]6.1 Create `src/components/app/club-admin/PhotoGallery.tsx` — client component displaying thumbnail grid of existing `ClubPhoto` records
  - [x]6.2 "Add photos" upload zone: file input accepting multiple files; client-side validation (type + size) before upload
  - [x]6.3 Upload flow per file: call `getPresignedUploadUrl` → PUT to R2 → call `createClubPhoto` → refresh gallery via `router.refresh()`
  - [x]6.4 Delete button on each thumbnail: calls `deleteClubPhoto` → refresh gallery
  - [x]6.5 Disable upload zone with message when photo count reaches 10
  - [x]6.6 Show per-file upload progress and error states
  - [x]6.7 Display constraint info: "JPEG, PNG, or WebP — max 5 MB each — up to 10 photos"

- [x]Task 7: Add i18n translation keys (all ACs)
  - [x]7.1 Add keys under `club.admin.profile.*` namespace in translation type file
  - [x]7.2 Update all 4 language files (en, fr, de, it) with translations for: field labels, placeholders, photo section title, upload constraints message, max photos message, logo section, validation errors

- [x]Task 8: Write tests (all ACs)
  - [x]8.1 Test `saveClubProfile` Server Action: auth guard, Zod validation (valid/invalid inputs), DB update call, revalidatePath call
  - [x]8.2 Test `getPresignedUploadUrl`: auth guard, MIME type validation, photo count enforcement (< 10), returns presigned URL
  - [x]8.3 Test `createClubPhoto`: auth guard, creates record with correct position, revalidatePath
  - [x]8.4 Test `deleteClubPhoto`: auth guard, multi-tenant check (photo.clubId), R2 deletion, DB deletion
  - [ ]8.5 Test `ClubProfileForm` rendering: all fields present, pre-populated, dirty state triggers amber dot
  - [ ]8.6 Test `PhotoGallery`: renders thumbnails, disables upload at 10 photos, shows constraint info
  - [x]8.7 Test logo upload/delete actions

## Dev Notes

### Critical Architecture Constraints

- **Photo operations are IMMEDIATE**: Upload/delete hit R2 and the DB on action — NOT deferred to the Save button. The Save button only applies to text field changes. This keeps UX simple: photos appear instantly in the grid, text fields require explicit save.
- **No file bytes through Next.js server**: Client uploads directly to R2/MinIO via presigned PUT URL. The Server Action only generates the presigned URL and creates the DB record after upload.
- **Form state**: Use `react-hook-form` v7 (`useForm` + `zodResolver`) — `formState.isDirty` is the single source of truth for dirty state. Never create separate `isDirty` state. The Story 4.5 save framework (`SaveBar`, `AdminDirtyContext`, `useUnsavedChanges`) is already wired up.
- **Loading state for Server Actions**: Use `useTransition` → `isPending` — never create manual `isLoading` state for Server Actions.
- **Server Action return shape**: Always `{ success: true, data: T }` or `{ success: false, error: string, code?: string }`.
- **Auth guard**: Every Server Action begins with session check → role check → clubId from URL params (verified by layout). Never accept clubId from client input.
- **Multi-tenant queries**: Always filter by both `id` and `clubId` in a single `where` clause.
- **Toast**: Use `sonner` (configured in root layout at `position="bottom-right"`, `duration={3000}`). Import `toast` from `sonner`.
- **Prisma import**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'`.
- **Prisma instance**: Only from `src/server/db.ts` — never instantiate `new PrismaClient()` elsewhere.
- **Date serialization**: Always `.toISOString()` before passing to Client Components.
- **No auto-save / localStorage draft at MVP** — architecture explicitly excludes this.
- **No server-side image resizing at MVP** — use `next/image` with responsive `sizes` for client-side optimization.

### R2/MinIO Storage Architecture

- **Provider**: Cloudflare R2 (production, S3-compatible) / MinIO (local dev at `localhost:9000`)
- **SDK**: `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (NOT the full AWS SDK v2)
- **Object key pattern**: `{clubId}/{cuid()}.{ext}` — no predictable URL enumeration
- **Presigned URL flow**:
  1. Client calls Server Action `getPresignedUploadUrl({ fileName, contentType })`
  2. Server validates MIME type, checks photo count, generates presigned PUT URL (10-min expiry)
  3. Client PUTs file directly to R2 via `fetch(presignedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': contentType } })`
  4. Client calls Server Action `createClubPhoto({ key, alt })` to persist the DB record
- **Deletion flow**: Server Action deletes from R2 (`DeleteObjectCommand`) then deletes DB record
- **Environment variables** (already in `.env.example`):
  ```
  R2_ENDPOINT="http://localhost:9000"
  R2_ACCESS_KEY_ID="minioadmin"
  R2_SECRET_ACCESS_KEY="minioadmin"
  R2_BUCKET_NAME="website-template"
  R2_PUBLIC_URL="http://localhost:9000/website-template"
  ```
- **R2 key extraction**: To delete from R2, extract the object key from the stored `url` by removing the `R2_PUBLIC_URL` prefix

### Database Schema (Already Migrated — Story 4.1)

**Club model fields used by this story:**
- `name`, `description`, `schedule`, `howToJoin`, `contactPhone`, `contactAddress`, `externalWebsiteUrl` (text fields for save)
- `email` (read-only contact email display)
- `logoUrl`, `logoAlt` (logo upload)
- `photos ClubPhoto[]` (relation)

**ClubPhoto model:**
```prisma
model ClubPhoto {
  id        String   @id @default(cuid())
  clubId    String   @map("club_id")
  url       String
  alt       String   @default("")
  position  Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  club      Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  @@index([clubId])
  @@map("club_photos")
}
```

### Existing Code to Extend (Story 4.5 Foundation)

The following files from Story 4.5 are the foundation — extend them, do NOT recreate:

- **`src/app/[lang]/(country)/[country]/[club]/admin/page.tsx`** — Server Component that renders `ClubProfileForm`. Currently fetches minimal club data. Extend the Prisma query to include all profile fields + `photos` relation (ordered by `position`).
- **`src/app/[lang]/(country)/[country]/[club]/admin/actions.ts`** — Contains `saveClubProfile` stub. Replace stub with real DB update. Add new photo/logo Server Actions here.
- **`src/components/app/club-admin/ClubProfileForm.tsx`** — Client component with `useForm`, `useTransition`, `AdminDirtyContext`, toast. Currently has no form fields. Add all profile fields, logo upload section, and photo gallery section.
- **`src/lib/schemas/club.ts`** — Contains `clubProfileSaveSchema` stub (only `name` field). Expand with all profile fields.
- **`src/components/app/club-admin/SaveBar.tsx`** — Sticky save/discard bar. Already complete — no changes needed.
- **`src/components/app/club-admin/AdminDirtyContext.tsx`** — Already provides `isDirty` state sharing. No changes needed.

### Existing Form Pattern Reference

Follow `src/components/app/apply/ApplyForm.tsx` for form field patterns:
- Uses `useForm` with `zodResolver`, `Controller` for controlled inputs
- `trigger()` for manual field validation on blur
- Inline error messages below fields from `formState.errors`
- Consistent field spacing and layout

### i18n Pattern

- Follow `club.admin.*` namespace established in Stories 4.4/4.5
- Add `club.admin.profile.*` sub-namespace for: field labels, placeholders, section titles, validation errors, photo constraints
- Update `src/lib/i18n/translations/types.ts` and all 4 language files (en, fr, de, it) in sync

### Design System Tokens

- Form fields: shadcn `Input` and `Textarea` components
- Upload zone: dashed border container (`border-2 border-dashed rounded-lg p-6`), drag-and-drop visual feedback
- Thumbnail grid: CSS grid (`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`)
- Delete button on thumbnails: absolute positioned, small destructive icon button
- Photo constraints text: `text-sm text-muted-foreground`
- Disabled upload zone: reduced opacity with inline message
- Logo preview: circular or rounded-square container with image
- Upload progress: use shadcn `Progress` component or simple percentage text
- Focus rings: `focus-visible:ring-2 focus-visible:ring-ring`
- Touch targets: minimum 44x44px on mobile

### Testing Standards

- Test framework: **Vitest** (`pnpm test`)
- Test files in `src/__tests__/`
- Mock `next/navigation`, `next/headers`, `@/server/db`, `next-auth` for Server Action tests
- Mock `@/lib/r2` for presigned URL and deletion tests — do NOT make real S3 calls in tests
- 391 tests passing as of Story 4.5 (19 added in 4.5)
- For component tests: use `@testing-library/react` with `render` + assertions on DOM elements

### Project Structure Notes

- Admin route is `src/app/[lang]/(country)/[country]/[club]/admin/` (NOT `/edit/` — ADR updated in Story 4.4)
- New components under `src/components/app/club-admin/` (established pattern)
- New utility module `src/lib/r2.ts` for R2/MinIO integration
- Zod schemas in `src/lib/schemas/club.ts` (extend existing file)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4, Story 4.6]
- [Source: _bmad-output/planning-artifacts/architecture.md#File Storage — R2/MinIO Presigned URLs]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture — Forms & Validation]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns — Server Action Return Shape]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — Loading State Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-002 — Club Profile Data Model]
- [Source: _bmad-output/planning-artifacts/prd.md#FR1, FR17, FR19, FR47, FR48]
- [Source: _bmad-output/implementation-artifacts/4-5-explicit-save-unsaved-changes-protection.md#Dev Notes]
- [Source: prisma/schema.prisma#Club, ClubPhoto models]

### Previous Story Intelligence (from Story 4.5)

- **Save framework is complete**: `SaveBar`, `AdminDirtyContext`, `useUnsavedChanges` hook, `UnsavedChangesDialog` — all working. Story 4.6 extends the form content, not the save infrastructure.
- **`saveClubProfile` is a stub**: In `admin/actions.ts`, the action validates input with Zod but returns `{ success: true }` without touching the DB. Story 4.6 must replace the stub body with `prisma.club.update()`.
- **`clubProfileSaveSchema` only has `name`**: In `src/lib/schemas/club.ts`, the schema is minimal. Expand it with all profile fields.
- **`ClubProfileForm` has no fields**: The component wires up react-hook-form, useTransition, AdminDirtyContext, and toast — but renders no actual form inputs. Story 4.6 adds all the field UI.
- **Admin route is `/admin`** (not `/edit/`): Confirmed in Story 4.4. Folder is `src/app/[lang]/(country)/[country]/[club]/admin/`.
- **Membership guard**: Already implemented in `admin/layout.tsx` — checks ACTIVE OWNER or EDITOR status.
- **i18n namespace**: `club.admin.save.*` keys exist in all 4 languages. Add `club.admin.profile.*` for new field labels/placeholders.
- **Test count**: 391 tests passing (19 added in Story 4.5).
- **All safety checks pass**: tsc, lint, audit, build.
- **Code review learnings from Story 4.5**: Trailing slash normalization, `shrink-0` on desktop sidebar, FooterLink component extraction, skip-to-content with fixed positioning.

### Git Intelligence

Recent commits show sequential Epic 4 story implementation:
- `6ac1274 feat: story 4.5` — explicit save & unsaved changes protection (most recent)
- `66c2815 feat: story 4.4` — admin dashboard shell
- `2323847 feat: story 4.3` — approval flow profile seeding
- `605c99c feat: story 4.2` — application form profile fields
- `1fcea1d feat: story 4.1` — schema migration

Files changed in Story 4.5 commit (directly relevant to 4.6):
- `src/app/[lang]/(country)/[country]/[club]/admin/page.tsx` — will extend
- `src/app/[lang]/(country)/[country]/[club]/admin/actions.ts` — will extend (replace stub)
- `src/components/app/club-admin/ClubProfileForm.tsx` — will extend (add fields)
- `src/lib/schemas/club.ts` — will extend (full schema)
- `src/lib/i18n/translations/*.ts` — will extend (profile keys)

### What This Story Does NOT Include

- Publish/unpublish toggle (Story 4.7)
- Operator message banner (Story 4.7)
- Public rendering of the profile page (Story 4.8)
- Photo carousel on public page (Story 4.8)
- Drag-and-drop photo reordering (post-MVP enhancement)
- Server-side image resizing/thumbnailing (post-MVP)
- Auto-save or localStorage draft (excluded at MVP)
- Rich text editing for description (post-MVP)

### Dependencies

- **Depends on**: Story 4.1 (schema migration — DONE), Story 4.5 (save framework — DONE)
- **Depended on by**: Story 4.7 (publish/unpublish), Story 4.8 (public profile rendering)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Created `src/lib/r2.ts` — S3 client for R2/MinIO with presigned URL generation, object deletion, and public URL construction
- Installed `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
- Expanded `clubProfileSaveSchema` in `src/lib/schemas/club.ts` with all profile fields (name, description, schedule, howToJoin, contactPhone, contactAddress, externalWebsiteUrl)
- Replaced `saveClubProfile` stub with real `prisma.club.update()` call
- Added Server Actions: `getPresignedUploadUrl`, `createClubPhoto`, `deleteClubPhoto`, `uploadLogo`, `persistLogo`, `deleteLogo`
- Refactored auth guard into shared `authGuard()` helper with discriminated union return type
- Updated `admin/page.tsx` to fetch full club data (all text fields + photos relation) from Prisma
- Built complete `ClubProfileForm` with all text fields, inline validation, and integration with Story 4.5 save framework
- Created `LogoUpload` component — file input, preview, change/remove buttons, alt text input
- Created `PhotoGallery` component — thumbnail grid, multi-file upload, delete, max-10 enforcement, constraint display
- Added i18n keys under `club.admin.clubProfile.*` (fields, placeholders, validation, logo, photos) in types and all 4 languages
- 12 new tests covering auth guards, MIME validation, photo count enforcement, R2 deletion, multi-tenant checks, logo actions
- Updated existing tests (`save-club-profile.test.ts`, `club-admin-sidebar.test.ts`) for expanded schema and translation types
- All 403 tests pass, tsc clean, lint clean, audit clean, build succeeds

### Change Log

- 2026-03-08: Implemented club profile edit form, photo upload, logo upload, and all Server Actions (Story 4.6)

### File List

- src/lib/r2.ts (new)
- src/lib/schemas/club.ts (modified)
- src/app/[lang]/(country)/[country]/[club]/admin/actions.ts (modified)
- src/app/[lang]/(country)/[country]/[club]/admin/page.tsx (modified)
- src/components/app/club-admin/ClubProfileForm.tsx (modified)
- src/components/app/club-admin/LogoUpload.tsx (new)
- src/components/app/club-admin/PhotoGallery.tsx (new)
- src/lib/i18n/translations/types.ts (modified)
- src/lib/i18n/translations/en.ts (modified)
- src/lib/i18n/translations/fr.ts (modified)
- src/lib/i18n/translations/de.ts (modified)
- src/lib/i18n/translations/it.ts (modified)
- src/__tests__/club-profile-actions.test.ts (new)
- src/__tests__/save-club-profile.test.ts (modified)
- src/__tests__/club-admin-sidebar.test.ts (modified)
- package.json (modified — added @aws-sdk/client-s3, @aws-sdk/s3-request-presigner)
- pnpm-lock.yaml (modified)
