# Story 4.8: Club Profile Page — Public Rendering

Status: done

## Story

As a **Public Visitor**,
I want to **view a club's profile page with all their essential information and photos**,
So that **I can quickly decide whether to join and know how to get in touch**.

## Acceptance Criteria

1. **AC1 — Visibility control**: When `isPublished = true` AND `forceOffline = false`, a server-rendered single-page profile displays all club content. When `isPublished = false` OR `forceOffline = true`, a 404 is returned.

2. **AC2 — Profile content**: The page displays: club name, logo (circular avatar with monogram fallback), description, photo carousel, schedule/availability, contact info (email, phone, address), how to join, and external website link (if set).

3. **AC3 — SEO metadata**: The page includes `<title>`, `<meta description>`, Open Graph tags, and JSON-LD structured data (`Organization` schema). These already exist via `generateClubMetadata()` and `generateClubJsonLd()` in `src/components/app/seo/metadata.ts` — no changes needed unless new fields should appear in metadata.

4. **AC4 — Photo carousel**: All `ClubPhoto` records display in `position` order, auto-scrolling horizontally; carousel pauses on hover; swipe-enabled on mobile (FR48). This is a `"use client"` component island.

5. **AC5 — No photos fallback**: If no photos uploaded, the carousel section is not rendered; the page displays remaining profile fields without a visual gap.

6. **AC6 — External website link**: A prominent "Visit our website" button is displayed if `externalWebsiteUrl` is set, opening in a new tab with `rel="noopener noreferrer"` (FR47).

7. **AC7 — Footer attribution**: Platform attribution footer link is present (FR26) — already implemented via `PoweredByBanner` in `PublicLayout`. Footer includes link back to directory (FR25) — already in footer.

8. **AC8 — Directory filtering**: Country directory query (`src/app/[lang]/(country)/[country]/page.tsx`) and platform homepage query (`src/app/[lang]/(platform)/page.tsx`) must filter clubs with `WHERE isPublished = true AND forceOffline = false` — unpublished or force-offline clubs must not appear in the directory or counts.

## Tasks / Subtasks

### Task 1: Add visibility guard to club layout (AC: #1, #8)

- [x] 1.1 Update `getClubPublicData()` in `src/lib/server/club-queries.ts`: add `isPublished: true, forceOffline: false` to the `where` clause. Also add `schedule`, `howToJoin`, `contactPhone`, `contactAddress`, `externalWebsiteUrl`, `email` to the `select` clause. Add `photos` relation: `photos: { select: { id, url, alt, position }, orderBy: { position: 'asc' } }`.
- [x] 1.2 Update the country directory query in `src/app/[lang]/(country)/[country]/page.tsx`: add `isPublished: true, forceOffline: false` to the `where` clause of `prisma.club.findMany()` (line ~44). Also update the canton and activityType sidebar queries to only count published clubs.
- [x] 1.3 Update the platform homepage queries in `src/app/[lang]/(platform)/page.tsx`: add `isPublished: true, forceOffline: false` to both `prisma.club.groupBy()` calls (lines ~38-50).

### Task 2: Create ProfileSection reusable component (AC: #2)

- [x] 2.1 Create `src/components/app/club-profile/ProfileSection.tsx` — a server component that renders a labeled section with a heading and content. Props: `title: string`, `children: React.ReactNode`, `icon?: React.ReactNode`. Renders only if children are truthy. Used for schedule, contact info, how to join sections.

### Task 3: Create ContactInfo component (AC: #2)

- [x] 3.1 Create `src/components/app/club-profile/ContactInfo.tsx` — a server component displaying email, phone, address, and external website link. Props: `email: string`, `phone?: string | null`, `address?: string | null`, `websiteUrl?: string | null`, `websiteLabel: string`, `translations: { email: string; phone: string; address: string }`. Render each item only if it has a value. Use semantic `<a href="mailto:">` for email, `<a href="tel:">` for phone. External website link opens in new tab.

### Task 4: Create PhotoCarousel client component (AC: #4, #5)

- [x] 4.1 Create `src/components/app/club-profile/PhotoCarousel.tsx` — a `"use client"` component. Props: `photos: Array<{ id: string; url: string; alt: string }>`. If `photos.length === 0`, return `null` (AC5). Use `next/image` with responsive `sizes` for each photo. Implement auto-scroll via `setInterval` (e.g., 4-second interval). Pause on hover (`onMouseEnter`/`onMouseLeave`). Swipe on mobile via touch events (`onTouchStart`/`onTouchMove`/`onTouchEnd`). Show dot indicators for current position. Respect `prefers-reduced-motion` — disable auto-scroll if reduced motion is preferred.
- [x] 4.2 Style the carousel: horizontal scroll with `overflow-x: hidden`, translate transform for sliding, smooth transition. Images should be `aspect-[16/9]` or similar landscape ratio. On mobile, full width; on desktop, constrained to content max-width.

### Task 5: Create ProfilePage server component (AC: #2, #6)

- [x] 5.1 Create `src/components/app/club-profile/ProfilePage.tsx` — the main layout component. Props: typed club data + translations. Renders in order: `ClubHeroSection` (existing, keep as-is), `PhotoCarousel`, description section, schedule section, how-to-join section, `ContactInfo` section. Each section uses `ProfileSection` wrapper. Only render sections that have content.
- [x] 5.2 Add "Visit our website" button: if `externalWebsiteUrl` is set, render a prominent `Button` with `variant="outline"` and external link icon, `target="_blank"`, `rel="noopener noreferrer"` (AC6). Place it near contact info or as a standalone CTA.

### Task 6: Update club page.tsx to render ProfilePage (AC: #1, #2, #3)

- [x] 6.1 Update `src/app/[lang]/(country)/[country]/[club]/page.tsx`: replace the existing `ClubHeroSection` + `ElementRenderer` block with the new `ProfilePage` component. Pass all club data from `getClubPublicData()` (which now includes photos, schedule, contact fields, etc.). Keep the JSON-LD script, accent color CSS variables, and `generateMetadata` function.
- [x] 6.2 Remove the `getHomePageElements()` call and `ElementRenderer` import — these are post-MVP elements not needed for the profile page.

### Task 7: Add i18n translation keys (AC: #2)

- [x] 7.1 Add translation keys to `src/lib/i18n/translations/types.ts` under `clubSite` namespace: `schedule: string`, `howToJoin: string`, `contactInfo: string`, `email: string`, `phone: string`, `address: string`, `visitWebsite: string`, `photos: string`.
- [x] 7.2 Add translations to all 4 language files (`en.ts`, `fr.ts`, `de.ts`, `it.ts`).

### Task 8: Write tests (AC: all)

- [x] 8.1 Create `src/__tests__/club-profile-page.test.ts` — test the club page rendering: mock `getClubPublicData()` to return a published club, verify ProfilePage renders all sections. Test with missing optional fields (no photos, no phone, no address, no website). Test 404 behavior when `isPublished = false` or `forceOffline = true`.
- [x] 8.2 Create `src/__tests__/photo-carousel.test.ts` — test PhotoCarousel component: renders nothing when no photos, renders images in order, verifies auto-scroll timer setup, verifies pause-on-hover behavior.
- [x] 8.3 Update existing directory test (if any) to verify visibility filtering: clubs with `isPublished = false` or `forceOffline = true` must not appear.

## Dev Notes

### Architecture Patterns & Constraints

- **Server-rendered by default**: The club profile page is a Server Component. Only `PhotoCarousel` needs `"use client"` for auto-scroll + hover + touch interaction.
- **Prisma import**: Always `from '@/server/db'` for the prisma singleton, models `from '@/generated/prisma/client'`.
- **Two-flag visibility (ADR-003)**: `isPublished` (admin) + `forceOffline` (operator). Page visible only when BOTH conditions met: `isPublished === true && forceOffline === false`. This applies to the public page AND directory listings.
- **Accent color system**: Already implemented. CSS custom properties `--primary` and `--primary-foreground` set on root div from `ACCENT_COLORS[club.accentColor]`. No changes needed.
- **SEO metadata**: `generateClubMetadata()` and `generateClubJsonLd()` already exist and work. No changes needed unless you want to add schedule/contact to structured data (optional enhancement).
- **`next/image`**: Use for all photos with responsive `sizes` attribute. No server-side resizing at MVP.
- **Whitespace sanitization**: Club text fields (description, schedule, howToJoin, contactAddress) come from user input — render with `whitespace-pre-line` to preserve line breaks.

### Existing Code to Reuse (DO NOT Reinvent)

- `ClubHeroSection` (`src/components/app/club-site/ClubHeroSection.tsx`) — keep as-is for the hero section. Already handles logo, monogram fallback, name, description, CTA.
- `ACCENT_COLORS` (`src/components/app/club-site/accent-colors.ts`) — already used in page.tsx for CSS variables.
- `PoweredByBanner` — already in the footer via `PublicLayout`.
- `PublicLayout` / `PublicNavbar` / `PublicFooter` — already rendered by the club `layout.tsx`.
- `generateClubMetadata()` / `generateClubJsonLd()` — already called in page.tsx `generateMetadata`.
- `getClubPublicData()` — extend, don't replace. Add new `select` fields and visibility `where` filters.
- `resolveUILang()`, `getTranslations()` — standard i18n pattern, already used.

### What to Remove

- `ElementRenderer` import and usage in `page.tsx` — post-MVP CMS elements, not needed for fixed profile layout.
- `getHomePageElements()` import and call — post-MVP page elements query, not needed.

### Component File Placement (Strict Convention)

- New public profile components: `src/components/app/club-profile/` directory (create it)
  - `ProfilePage.tsx` — main server component
  - `PhotoCarousel.tsx` — `"use client"` carousel
  - `ProfileSection.tsx` — reusable section wrapper
  - `ContactInfo.tsx` — contact details display
- Tests: `src/__tests__/` with descriptive filenames

### Testing Standards

- Framework: Vitest (`pnpm test`)
- Mock pattern: `vi.mock('next/navigation')`, `vi.mock('@/server/db')`, `vi.mock('@/lib/server/club-queries')`
- Test auth/visibility: verify `notFound()` called when club is unpublished
- Test rendering: verify each profile section renders when data exists, is absent when data is null
- Current test count: ~416 passing (from story 4.7)

### Previous Story Intelligence (4.7)

**Key patterns established:**
- `useTransition()` + `useOptimistic()` for client component Server Action calls
- shadcn components used: `Switch`, `Alert`, `Button`
- Translation keys follow nested namespace: `club.admin.{feature}.{key}`
- Test pattern: mock `authGuard`, test success/error paths, verify `revalidatePath`
- Code review fixes from 4.7: race conditions wrapped in `$transaction`, design tokens instead of hardcoded colors, timestamps on messages

**Files created in 4.7:**
- `src/components/app/club-admin/PublishToggle.tsx`
- `src/components/app/club-admin/OperatorMessageBanner.tsx`
- `src/components/ui/switch.tsx`

### Git Intelligence

- Recent commit pattern: `feat: story X.Y`
- Stories 4.5→4.6→4.7 all modify: `admin/actions.ts`, `admin/page.tsx`, `admin/layout.tsx`, translation files
- Story 4.8 is different: it modifies the PUBLIC page (not admin), directory queries, and creates new public-facing components
- No admin code should be touched in this story

### Directory Query Update Details

**Country directory** (`src/app/[lang]/(country)/[country]/page.tsx`):
- Main club query at line ~43: add `isPublished: true, forceOffline: false` to where clause
- Canton sidebar query at line ~72: update nested club filter to include visibility flags
- Activity type query at line ~86: update nested club filter to include visibility flags

**Platform homepage** (`src/app/[lang]/(platform)/page.tsx`):
- `clubsByCountry` groupBy at line ~38: add `isPublished: true, forceOffline: false`
- `activityTypesCount` groupBy at line ~43: add `isPublished: true, forceOffline: false`

### Photo Carousel Technical Notes

- Auto-scroll interval: ~4 seconds between transitions
- Transition: CSS `transform: translateX()` with `transition-duration: 500ms ease-in-out`
- Pause: clear interval on `mouseenter`, restart on `mouseleave`
- Touch/swipe: track `touchstart` X, compute delta on `touchend`, slide if delta > threshold (e.g., 50px)
- Dots: small circles below carousel indicating current slide, clickable to jump
- Reduced motion: check `window.matchMedia('(prefers-reduced-motion: reduce)')` — if true, disable auto-scroll, use instant transitions
- Responsive: single photo visible at a time, full content width, `aspect-[16/9]` or `aspect-[3/2]`
- Use `next/image` with `fill` layout inside a relative container for each slide

### Project Structure Notes

- New directory `src/components/app/club-profile/` aligns with architecture doc's component structure
- Existing `src/components/app/club-site/` contains ClubHeroSection, accent-colors, PoweredByBanner, ElementRenderer — keep these, `ProfilePage` imports `ClubHeroSection` from there
- No conflicts with existing admin components in `src/components/app/club-admin/`

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.8]
- [Source: _bmad-output/planning-artifacts/architecture.md — ADR-003 Two-flag visibility, Section 8 Public Page Rendering & SSR]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ClubHeroSection, PhotoCarousel, PublicLayout, Responsive Strategy]
- [Source: _bmad-output/implementation-artifacts/4-7-publish-unpublish-operator-message-banner.md — Previous story learnings]
- [Source: src/lib/server/club-queries.ts — getClubPublicData() function to extend]
- [Source: src/app/[lang]/(country)/[country]/[club]/page.tsx — Existing page to rework]
- [Source: src/app/[lang]/(country)/[country]/page.tsx — Directory query to update]
- [Source: src/app/[lang]/(platform)/page.tsx — Platform homepage query to update]
- [Source: src/components/app/seo/metadata.ts — Existing SEO metadata functions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Lint fix: PhotoCarousel had hooks called after early `return null` — moved early return after all hooks
- Lint fix: `setPrefersReducedMotion` called synchronously inside `useEffect` — refactored to `useSyncExternalStore`
- TS fix: mockClub fields needed `as string | null` type annotations for nullable overrides in tests

### Completion Notes List

- Added two-flag visibility filtering (`isPublished: true, forceOffline: false`) to `getClubPublicData()`, country directory query, canton/activity sidebar queries, and platform homepage groupBy queries
- Extended `getClubPublicData()` select with `schedule`, `howToJoin`, `contactPhone`, `contactAddress`, `externalWebsiteUrl`, `email`, and `photos` relation
- Created 4 new components in `src/components/app/club-profile/`: ProfilePage, PhotoCarousel, ProfileSection, ContactInfo
- PhotoCarousel implements auto-scroll (4s interval), pause on hover, swipe on mobile, dot indicators, `prefers-reduced-motion` support via `useSyncExternalStore`
- Replaced `ClubHeroSection` + `ElementRenderer` with `ProfilePage` in club page.tsx; removed `getHomePageElements()` import
- Added 7 new i18n keys to `clubSite` namespace across all 4 languages (en, fr, de, it)
- 439 tests passing (23 new tests added), zero regressions
- All safety checks passed: tsc, lint, audit, build

### File List

**New files:**
- src/components/app/club-profile/ProfilePage.tsx
- src/components/app/club-profile/PhotoCarousel.tsx
- src/components/app/club-profile/ProfileSection.tsx
- src/components/app/club-profile/ContactInfo.tsx
- src/__tests__/club-profile-page.test.ts
- src/__tests__/photo-carousel.test.ts

**Modified files:**
- src/lib/server/club-queries.ts
- src/app/[lang]/(country)/[country]/[club]/page.tsx
- src/app/[lang]/(country)/[country]/page.tsx
- src/app/[lang]/(platform)/page.tsx
- src/lib/i18n/translations/types.ts
- src/lib/i18n/translations/en.ts
- src/lib/i18n/translations/fr.ts
- src/lib/i18n/translations/de.ts
- src/lib/i18n/translations/it.ts
- src/__tests__/club-public-page.test.ts
- src/__tests__/country-directory.test.ts

## Change Log

- 2026-03-08: Implemented club profile page public rendering — visibility guard, profile sections, photo carousel, contact info, i18n, tests (Story 4.8)
- 2026-03-08: Code review fixes — H1: 44px touch targets on carousel dots, H2: aria-label on carousel region, H3: shadcn Button for website link, H4: aria-hidden on decorative icons, M2: removed empty className
