# Story 3.8: Refactor Existing Public Pages to New Layout

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Public Visitor,
I want the platform homepage, country directory, and club public site to use the new consistent layout,
so that the design is cohesive across all public surfaces with proper centering, navbar, and footer.

## Acceptance Criteria

1. **Given** the platform homepage renders, **When** it displays, **Then** content (headline, stats bar, country buttons) renders within `max-w-[1200px] mx-auto` centered containers with `py-16 lg:py-24` vertical spacing between major sections. No `px-*` padding on page content (PublicLayout's `<main>` already provides `px-6 lg:px-8`).

2. **Given** the platform about page renders, **When** it displays, **Then** its content uses `max-w-[1200px] mx-auto` container (inner content may use a narrower `max-w-3xl` for readability) with correct vertical spacing (`py-16 lg:py-24`). No redundant `px-*` padding.

3. **Given** the platform support page renders, **When** it displays, **Then** same container and spacing standardization as the about page.

4. **Given** the platform apply page renders, **When** it displays, **Then** same container standardization. Form content may use a narrower inner max-width (`max-w-2xl`) for readability but outer wrapper uses `max-w-[1200px] mx-auto`.

5. **Given** the country directory page renders, **When** it displays, **Then** it no longer renders its own `PublicLayout` — the layout comes from the country layout (`layout.tsx`). The page renders only its content within a `max-w-[1200px] mx-auto` container.

6. **Given** the country layout, **Then** it uses `PublicLayout` with the country name as navbar title, "Apply" as CTA, and `showPoweredBy: false`.

7. **Given** any club public page (home, inner page, contact), **When** it renders, **Then** the `ClubSidebarNav` component is no longer rendered. Content flows within the `PublicLayout` provided by the club layout. Content uses `max-w-[1200px] mx-auto` containers with proper spacing.

8. **Given** club pages with accent colors, **Then** the accent color CSS custom properties (`--primary`, `--primary-foreground`) are still applied via a wrapper element within each club page (not lost during refactoring).

9. **Given** the `ClubSidebarNav` component file, **Then** it is deleted along with all its imports and test references — it is fully replaced by the top navbar from the club layout.

10. **Given** all refactored pages, **Then** they render correctly in both light and dark mode, the mobile hamburger menu works, and all existing tests pass (354+ tests). TypeScript, lint, and build all pass.

## Tasks / Subtasks

- [x] Task 1: Refactor platform homepage (AC: 1)
  - [x]1.1 Remove all `px-10` padding from sections (PublicLayout `<main>` already provides `px-6 lg:px-8`)
  - [x]1.2 Wrap hero section in `<section className="mx-auto max-w-[1200px] py-16 lg:py-24 text-center">` — remove `max-w-[560px]` outer constraint (keep inner text narrow via `max-w-xl mx-auto` or similar on the text block)
  - [x]1.3 Wrap stats bar in `<section className="mx-auto max-w-[1200px]">` with border; remove `mx-10`
  - [x]1.4 Wrap countries section in `<section className="mx-auto max-w-[1200px] py-16 lg:py-24">` — remove `px-10 pb-10 pt-8`

- [x]Task 2: Refactor platform about page (AC: 2)
  - [x]2.1 Replace `<div className="mx-auto max-w-3xl px-4 py-12">` with `<div className="mx-auto max-w-[1200px] py-16 lg:py-24">` outer container. Keep `max-w-3xl` on an inner wrapper for text readability if desired.

- [x]Task 3: Refactor platform support page (AC: 3)
  - [x]3.1 Same container and spacing standardization as about page

- [x]Task 4: Refactor platform apply page (AC: 4)
  - [x]4.1 Replace `<div className="mx-auto max-w-2xl px-4 py-8">` with `<div className="mx-auto max-w-[1200px] py-16 lg:py-24">` outer wrapper, keep `max-w-2xl` inner for form width

- [x]Task 5: Refactor country layout and directory page (AC: 5, 6)
  - [x]5.1 Move `PublicLayout` from `src/app/[lang]/(country)/[country]/page.tsx` into `src/app/[lang]/(country)/[country]/layout.tsx`. The layout should resolve `lang`, `country`, get translations, and wrap children in `PublicLayout` with: `title` = country display name, `navItems: []`, `ctaLabel` = Apply, `ctaHref` = `/{lang}/apply`, `lang`, `showPoweredBy: false`.
  - [x]5.2 Strip `PublicLayout` wrapper from the country directory page.tsx — it now only renders its content. Replace container: remove `<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">` → `<div className="mx-auto max-w-[1200px] py-16 lg:py-24">`.

- [x]Task 6: Refactor club home page (AC: 7, 8)
  - [x]6.1 Remove `ClubSidebarNav` import and rendering from `src/app/[lang]/(country)/[country]/[club]/page.tsx`
  - [x]6.2 Remove the outer `<div className="flex min-h-screen">` sidebar layout wrapper
  - [x]6.3 Remove the `<main className="flex-1 flex items-start justify-center pt-16 md:pt-0">` and `<div className="max-w-4xl w-full">` wrappers — content is now inside PublicLayout's `<main>`
  - [x]6.4 Wrap page content in `<div className="mx-auto max-w-[1200px]" style={{ '--primary': accentColor.primary, '--primary-foreground': accentColor.primaryForeground } as React.CSSProperties}>` to preserve accent color CSS variables
  - [x]6.5 Keep `<script type="application/ld+json">` for JSON-LD structured data
  - [x]6.6 Keep `ClubHeroSection` — it already uses correct spacing (`py-16`)
  - [x]6.7 Update home elements wrapper: replace `<div className="flex flex-col gap-4 px-4 py-8">` with `<div className="flex flex-col gap-4 py-8">` (remove `px-4`, main provides padding)

- [x]Task 7: Refactor club inner page (AC: 7, 8)
  - [x]7.1 Remove `ClubSidebarNav` import and rendering from `src/app/[lang]/(country)/[country]/[club]/[page]/page.tsx`
  - [x]7.2 Remove sidebar layout wrapper (`flex min-h-screen` div) and inner `<main>` wrapper
  - [x]7.3 Wrap content in `<div className="mx-auto max-w-[1200px] py-16 lg:py-24" style={{ accent color CSS vars }}>`
  - [x]7.4 Remove redundant `px-4` from inner content div (main provides padding)

- [x]Task 8: Refactor club contact page (AC: 7, 8)
  - [x]8.1 Remove `ClubSidebarNav` import and rendering from `src/app/[lang]/(country)/[country]/[club]/contact/page.tsx`
  - [x]8.2 Same structural refactoring as inner page — remove sidebar wrappers, add centered container with accent color CSS vars
  - [x]8.3 Remove redundant `px-4` from inner content

- [x]Task 9: Delete ClubSidebarNav component (AC: 9)
  - [x]9.1 Delete `src/components/app/club-site/ClubSidebarNav.tsx`
  - [x]9.2 Verify no remaining imports anywhere in `src/` (grep to confirm)

- [x] Task 10: Update tests (AC: 10)
  - [x]10.1 Update `src/__tests__/club-public-page.test.ts` — remove ClubSidebarNav mocking/assertions, update expectations to match new container structure
  - [x]10.2 Update `src/__tests__/club-inner-page.test.ts` — same: remove ClubSidebarNav references, update structure expectations
  - [x]10.3 Update `src/__tests__/country-directory.test.ts` if needed — verify expectations match the layout-in-layout change
  - [x]10.4 Run `pnpm test` — all 354+ tests must pass (3 pre-existing failures in setup-password/magic-link are unrelated, ignore)
  - [x]10.5 Run `pnpm typecheck && pnpm lint && pnpm build` — all must pass

## Dev Notes

### Architecture & Constraints

- **Prisma import**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'`
- **Package manager**: pnpm — accessed via `bash -c 'NVM_DIR="/Users/bastienfaivre/.nvm" && source "$NVM_DIR/nvm.sh" && pnpm ...'`
- **Next.js 16**: `params` are Promises — always `await` them in server components (e.g., `const { lang } = await params`)
- **Tailwind v4**: No `tailwind.config.ts`. All theming via `@theme inline` blocks in `globals.css`. Dark mode variant: `@custom-variant dark (&:is(.dark *))`.
- **shadcn/ui style**: "new-york" variant with zinc base color, CSS variables enabled. Components in `src/components/ui/` are CLI-managed — do NOT manually edit them.
- **Server vs Client components**: All page.tsx files being refactored are server components. No `"use client"` needed.

### CRITICAL: PublicLayout Already Provides Padding

`PublicLayout`'s `<main>` element applies `px-6 lg:px-8` horizontal padding. Therefore:
- Pages MUST NOT add their own `px-*` horizontal padding (removes double-padding)
- Pages only need `max-w-[1200px] mx-auto` for centering and `py-*` for vertical spacing
- The `px-10`, `px-4` patterns in current pages are redundant and must be removed

### CRITICAL: Country Directory — Layout vs Page PublicLayout

Currently the country directory page (`page.tsx`) renders its own `PublicLayout` wrapping content. The country layout (`layout.tsx`) is a pass-through that only validates the country param. This is inconsistent with how platform and club layouts work (they provide PublicLayout at the layout level).

**Fix**: Move `PublicLayout` into the country layout.tsx (like platform and club layouts do). The page.tsx should only render its content. This requires:
1. Moving the PublicLayout + navbar/footer props from page.tsx to layout.tsx
2. Stripping the PublicLayout wrapper from page.tsx
3. The country layout needs access to `lang` and `country` params (already available)

### CRITICAL: Club Pages — Removing Sidebar Layout

All three club page files (home, [page], contact) currently render:
```tsx
<div className="flex min-h-screen">
  <ClubSidebarNav ... />
  <main className="flex-1 flex items-start justify-center pt-16 md:pt-0">
    <div className="max-w-4xl w-full">
      {/* content */}
    </div>
  </main>
</div>
```

This entire structure must be replaced. The club layout already provides `PublicLayout` with the top navbar. Each page should render only its content within a centered container:

```tsx
<div
  className="mx-auto max-w-[1200px]"
  style={{
    '--primary': accentColor.primary,
    '--primary-foreground': accentColor.primaryForeground,
  } as React.CSSProperties}
>
  {/* page content */}
</div>
```

The accent color CSS vars MUST be preserved — they're used by club-specific theming (accent color picker, Story 4.7). Move them to the page's root wrapper.

### CRITICAL: What NOT to Remove from Club Pages

- `generateMetadata()` — keep all SEO metadata generation
- `<script type="application/ld+json">` — keep JSON-LD structured data (club home)
- `ClubHeroSection` — keep (renders within content, already uses correct `py-16` spacing)
- `ElementRenderer` usage — keep (renders page elements)
- `isAdmin` check — keep (used for edit-mode logic)
- `getClubPublicData`/`getClubOwnership`/`getPageBySlug` calls — keep all data fetching
- `ACCENT_COLORS` import and usage — keep (needed for CSS vars)
- `isValidCountry()` checks in `generateMetadata` — keep for safety

### CRITICAL: Redundant Code in Club Pages

After removing ClubSidebarNav, some data that was only used for the sidebar becomes unused:
- `locationLabel` (city + canton) — was only passed to ClubSidebarNav. Check if still needed elsewhere before removing.
- `club.logoUrl`, `club.logoAlt` in the sidebar nav object — no longer needed for nav (club layout navbar uses club name only). Still needed in ClubHeroSection on home page.
- `pages.filter(p => !p.isAnchor)` — was for sidebar nav. Club layout now handles nav items.

Remove unused variables to keep code clean, but verify first.

### Key Existing Code State (Post-Story 3.7)

| File | Current state | Action |
|------|--------------|--------|
| `src/app/[lang]/(platform)/layout.tsx` | Uses PublicLayout | No change needed |
| `src/app/[lang]/(platform)/page.tsx` | Custom `px-10` padding, narrow containers | **Refactor** containers + spacing |
| `src/app/[lang]/(platform)/about/page.tsx` | `max-w-3xl px-4 py-12` | **Refactor** containers + spacing |
| `src/app/[lang]/(platform)/support/page.tsx` | `max-w-3xl px-4 py-12` | **Refactor** containers + spacing |
| `src/app/[lang]/(platform)/apply/page.tsx` | `max-w-2xl px-4 py-8` | **Refactor** containers + spacing |
| `src/app/[lang]/(country)/[country]/layout.tsx` | Pass-through (validates country only) | **Refactor** to use PublicLayout |
| `src/app/[lang]/(country)/[country]/page.tsx` | Renders own PublicLayout + `max-w-7xl` container | **Refactor** — remove PublicLayout, standardize container |
| `src/app/[lang]/(country)/[country]/[club]/layout.tsx` | Uses PublicLayout with top navbar | No change needed |
| `src/app/[lang]/(country)/[country]/[club]/page.tsx` | Sidebar layout + ClubSidebarNav | **Refactor** — remove sidebar, centered container |
| `src/app/[lang]/(country)/[country]/[club]/[page]/page.tsx` | Sidebar layout + ClubSidebarNav | **Refactor** — remove sidebar, centered container |
| `src/app/[lang]/(country)/[country]/[club]/contact/page.tsx` | Sidebar layout + ClubSidebarNav | **Refactor** — remove sidebar, centered container |
| `src/components/app/club-site/ClubSidebarNav.tsx` | Exists but not rendered in layout | **Delete** |
| `src/components/layout/public-layout.tsx` | Provides `px-6 lg:px-8` on main | No change needed |
| `src/__tests__/club-public-page.test.ts` | References ClubSidebarNav | **Update** |
| `src/__tests__/club-inner-page.test.ts` | References ClubSidebarNav | **Update** |

### Anti-Patterns to Avoid

- **Do NOT modify `globals.css`** — OKLCH tokens and dark mode are already complete
- **Do NOT modify `src/components/ui/*` files** — shadcn CLI-managed
- **Do NOT modify `PublicLayout`, `PublicNavbar`, `PublicFooter`** — these are correct from Story 3.7
- **Do NOT add `px-*` horizontal padding** on page content — PublicLayout's `<main>` already provides `px-6 lg:px-8`
- **Do NOT modify club layout.tsx or platform layout.tsx** — they already use PublicLayout correctly
- **Do NOT remove `generateMetadata()` functions** — SEO is critical
- **Do NOT remove JSON-LD structured data** — SEO is critical
- **Do NOT remove accent color CSS variables** — move them, don't delete them
- **Do NOT hardcode strings** — all user-visible text must use i18n translations
- **Do NOT import `from '@prisma/client'`** — always `from '@/generated/prisma/client'`
- **Do NOT create `tailwind.config.ts`** — Tailwind v4 uses inline `@theme` blocks

### Testing Requirements

- **Framework**: Vitest (`pnpm test`)
- **Test location**: Update existing test files (no new test file needed)
- **Files to update**:
  - `src/__tests__/club-public-page.test.ts` — remove ClubSidebarNav mock/assertions
  - `src/__tests__/club-inner-page.test.ts` — remove ClubSidebarNav mock/assertions
  - `src/__tests__/country-directory.test.ts` — verify expectations match layout change
- **All 354+ existing tests must remain green**
- **3 pre-existing test failures** (`setup-password.test.ts` x2, `magic-link-route.test.ts` x1) — unrelated, ignore

### Previous Story Intelligence (from Story 3.7)

- **354 tests** currently passing — must remain green
- `PublicLayout` accepts: `navbarProps`, `footerProps`, `skipToContentLabel`, `children`
- `PublicLayout`'s `<main>` applies `px-6 lg:px-8` — pages must NOT duplicate horizontal padding
- `PublicLayout`'s `<main>` does NOT apply `max-w-[1200px]` — pages control their own max-width (by design, for full-bleed sections)
- `PublicNavbar` accepts: `title`, `titleHref`, `navItems`, `ctaLabel`, `ctaHref`, `lang`, `translations`
- `PublicFooter` accepts: `lang`, `showPoweredBy`
- Club layout passes club pages as `navItems` to navbar — sidebar navigation is fully replaced
- Country layout was created as a pass-through (validates country only) — needs PublicLayout added
- `NavLink` client component handles `aria-current="page"` — already working
- `ThemeToggle` accepts translations as props from server parent
- `PoweredByBanner` is included in `PublicFooter` when `showPoweredBy: true`
- Commit pattern: `feat: story X.Y`
- Next.js 16 `params` are Promises — always `await` them

### Git Intelligence

Recent commits follow `feat: story X.Y` pattern:
```
2d89540 feat: story 3.7
fb07968 feat: story 3.6
cb33883 feat: story 3.5
db0cf9b feat: story 3.4
2d341b1 feat: story 3.3
```

Story 3.7 (most recent) created the PublicLayout infrastructure and refactored layouts (platform + club) but intentionally deferred page-level refactoring to Story 3.8. Key note from Story 3.7: "Do NOT delete ClubSidebarNav — Story 3.8 handles cleanup."

### Project Structure Notes

Files to modify:
- `src/app/[lang]/(platform)/page.tsx` — Standardize containers + spacing
- `src/app/[lang]/(platform)/about/page.tsx` — Standardize containers + spacing
- `src/app/[lang]/(platform)/support/page.tsx` — Standardize containers + spacing
- `src/app/[lang]/(platform)/apply/page.tsx` — Standardize containers + spacing
- `src/app/[lang]/(country)/[country]/layout.tsx` — Add PublicLayout
- `src/app/[lang]/(country)/[country]/page.tsx` — Remove PublicLayout, standardize container
- `src/app/[lang]/(country)/[country]/[club]/page.tsx` — Remove sidebar, centered container
- `src/app/[lang]/(country)/[country]/[club]/[page]/page.tsx` — Remove sidebar, centered container
- `src/app/[lang]/(country)/[country]/[club]/contact/page.tsx` — Remove sidebar, centered container
- `src/__tests__/club-public-page.test.ts` — Remove ClubSidebarNav references
- `src/__tests__/club-inner-page.test.ts` — Remove ClubSidebarNav references

Files to delete:
- `src/components/app/club-site/ClubSidebarNav.tsx`

Files NOT to modify:
- `src/app/layout.tsx` — Root layout stays the same
- `src/app/globals.css` — Tokens already complete
- `src/components/ui/*` — shadcn CLI-managed
- `src/components/layout/public-layout.tsx` — Correct from Story 3.7
- `src/components/layout/public-navbar.tsx` — Correct from Story 3.7
- `src/components/layout/public-footer.tsx` — Correct from Story 3.7
- `src/components/layout/mobile-nav-menu.tsx` — Correct from Story 3.7
- `src/components/layout/nav-link.tsx` — Correct from Story 3.7
- `src/app/[lang]/(platform)/layout.tsx` — Already uses PublicLayout
- `src/app/[lang]/(country)/[country]/[club]/layout.tsx` — Already uses PublicLayout

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.8]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Design Direction Decision (lines 416-425): Dub.co-inspired centered layout, max-w-[1200px], px-6 lg:px-8, py-16 lg:py-24 spacing]
- [Source: _bmad-output/planning-artifacts/architecture.md — Routing architecture, component patterns, i18n architecture]
- [Source: _bmad-output/implementation-artifacts/3-7-public-layout-shell-top-navbar-centered-container-footer.md — Previous story learnings, PublicLayout API, cleanup notes]
- [Source: src/components/layout/public-layout.tsx — PublicLayout provides px-6 lg:px-8 on main, pages control max-width]
- [Source: src/app/[lang]/(country)/[country]/page.tsx — Country page currently renders its own PublicLayout (to be moved to layout)]
- [Source: src/app/[lang]/(country)/[country]/[club]/page.tsx — Club home still uses ClubSidebarNav + sidebar layout]
- [Source: src/app/[lang]/(country)/[country]/[club]/[page]/page.tsx — Club inner page still uses ClubSidebarNav]
- [Source: src/app/[lang]/(country)/[country]/[club]/contact/page.tsx — Club contact still uses ClubSidebarNav]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No issues encountered.

### Completion Notes List

- Standardized all platform pages (homepage, about, support, apply) to use `max-w-[1200px] mx-auto` centered containers with `py-16 lg:py-24` vertical spacing; removed redundant `px-*` padding
- About and support pages use inner `max-w-3xl` wrapper for text readability; apply page uses `max-w-2xl` inner wrapper for form width
- Moved `PublicLayout` from country directory page.tsx into country layout.tsx, matching the pattern used by platform and club layouts
- Removed `ClubSidebarNav` from all 3 club pages (home, inner, contact) and replaced sidebar layout with centered `max-w-[1200px]` container
- Preserved accent color CSS custom properties (`--primary`, `--primary-foreground`) on each club page's root wrapper
- Preserved JSON-LD structured data and `ClubHeroSection` on club home page
- Cleaned up unused imports and variables: removed `getAuthSession`, `getClubOwnership`, `locationLabel`, `isAdmin` from club pages where only used for sidebar
- Deleted `ClubSidebarNav.tsx` component file
- Removed 5 ClubSidebarNav-related tests from test files; removed unused `findProps` helper from inner page tests
- All 348 tests pass, TypeScript/lint/audit/build all clean

#### Post-initial-implementation polish (same session)

- **Footer redesign**: Removed "Powered by Clashware" entirely from club websites. Compacted footer to a single inline row: Privacy | Terms | Copyright on left, ThemeToggle on right. Removed `showPoweredBy` prop from `PublicFooter`.
- **Double layout fix**: Fixed nested PublicLayout on club pages (country layout + club layout both wrapped). Reverted country layout to pass-through; country directory page now wraps itself in PublicLayout.
- **Navbar/content width alignment**: Added `mx-auto w-full max-w-[1000px]` to PublicLayout's `<main>` element. Removed redundant `max-w-[1200px] mx-auto` from all individual pages since `<main>` now handles it.
- **Max-width change**: Changed from `max-w-[1200px]` to `max-w-[1000px]` across navbar, main, and footer for a tighter layout.
- **Navbar restyle (dub.co-inspired)**: Restyled to three-zone layout — logo left, centered plain-text nav links, right section with language switcher + solid dark CTA button. Nav links use `rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground`. CTA uses `bg-foreground text-background rounded-lg`.
- **Duplicate contact key fix**: Filtered `page.slug !== 'contact'` from club pages array to avoid React duplicate key error with the hardcoded contact nav item.
- **Language switcher hover**: Updated trigger button to match nav link style (`rounded-lg px-4 py-2 hover:bg-muted`).
- **Country buttons centered**: Added `text-center` to countries section and `justify-center` to country button flex containers on platform homepage.
- **Translations to informal tone**: Changed French (vous → tu) and German (Sie → du) across all translation strings. Italian already used tu; English has no distinction.
- **Country button sizing**: Added `min-w-[180px]` so available and coming-soon buttons share consistent width.
- **Country button flag alignment**: Flag emoji gets fixed `w-6 shrink-0` width with flex centering; gap increased from `gap-2` to `gap-3`; added `text-left` to override parent `text-center`.
- **Club card hover style**: Changed from `hover:border-primary/50` with `bg-card shadow-sm rounded-xl` to `hover:border-muted-foreground hover:bg-secondary rounded-[10px]` matching country button style.
- **Country flag in navbar**: Added country flag emoji next to country name in navbar title on country directory page. Extracted `countryCodeToFlag()` from `CountryButton` to shared `src/lib/country.ts` utility.
- **Home nav link fix**: Club nav items with `slug === 'home'` now map to `clubBase` URL instead of `${clubBase}/home` (which was a 404). Home button remains visible in navbar.

### Change Log

- 2026-03-07: Refactored all public pages to new layout system. Removed ClubSidebarNav component. Standardized containers and spacing across platform, country, and club pages.
- 2026-03-07: Code review fixes — removed dead isValidCountry redirect from country page (layout handles it), added max-w-3xl inner wrapper to support page, cleaned up vestigial auth mocks from test files, removed invalid country redirect test.
- 2026-03-07: Post-implementation polish — footer redesign (removed PoweredByBanner, compact inline footer), fixed double layout bug, max-width 1200→1000px, dub.co-inspired navbar restyle, duplicate contact key fix, language switcher hover style, centered countries, informal tone translations (fr/de), country button sizing/alignment, club card hover consistency, country flag in navbar, home nav link 404 fix.

### File List

Modified:
- src/app/[lang]/(platform)/page.tsx
- src/app/[lang]/(platform)/about/page.tsx
- src/app/[lang]/(platform)/support/page.tsx
- src/app/[lang]/(platform)/apply/page.tsx
- src/app/[lang]/(platform)/layout.tsx
- src/app/[lang]/(country)/[country]/page.tsx
- src/app/[lang]/(country)/[country]/[club]/page.tsx
- src/app/[lang]/(country)/[country]/[club]/[page]/page.tsx
- src/app/[lang]/(country)/[country]/[club]/contact/page.tsx
- src/app/[lang]/(country)/[country]/[club]/layout.tsx
- src/components/layout/public-layout.tsx
- src/components/layout/public-navbar.tsx
- src/components/layout/public-footer.tsx
- src/components/app/LanguageSwitcher.tsx
- src/components/app/directory/CountryButton.tsx
- src/components/app/directory/ClubCard.tsx
- src/components/app/club-site/ClubHeroSection.tsx
- src/lib/country.ts
- src/lib/i18n/translations/fr.ts
- src/lib/i18n/translations/de.ts
- src/__tests__/club-public-page.test.ts
- src/__tests__/club-inner-page.test.ts
- src/__tests__/country-directory.test.ts
- src/__tests__/public-layout.test.ts
- src/__tests__/powered-by-footer-sitemap.test.ts

Deleted:
- src/components/app/club-site/ClubSidebarNav.tsx
