# Story 3.4: Club Public Site — Inner Page Navigation (SPA)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Public Visitor,
I want to navigate between a club's inner pages with fast, smooth transitions,
so that I can browse the club's content without full-page reloads.

## Acceptance Criteria

1. **Given** a visitor clicks a navigation link in the `ClubSidebarNav`, **When** navigation occurs, **Then** a loading skeleton matching the expected content shape is displayed within 100ms; content loads and renders within 2 seconds.

2. **Given** a visitor directly navigates to a club inner page URL (e.g., `platform-name.com/fr/ch/ski-club-valais/calendar`), **When** the page loads, **Then** it renders correctly server-side and is crawlable via direct URL access.

3. **Given** the `ClubSidebarNav`, **Then** the active page is highlighted with `aria-current="page"` and a left border in the club's accent color; on mobile the nav collapses to a hamburger that opens a full-height `Sheet` drawer.

4. **Given** a club has sub-pages configured (pages with `parentId` set), **Then** the sidebar nav renders them nested under their parent page, one level deep.

## Tasks / Subtasks

- [x] Task 1: Create inner page route `[page]/page.tsx` (AC: 1, 2)
  - [x] 1.1 Create `src/app/[lang]/(country)/[country]/[club]/[page]/page.tsx` as a server component. Fetch the page by `slug` + `clubId` from Prisma. Call `notFound()` if the page doesn't exist, is not active (`isActive: false`), or is an anchor page (`isAnchor: true`).
  - [x] 1.2 Fetch `PageElement[]` for the page (ordered by `position` asc). Render each element using a basic `ElementRenderer` component that dispatches on `element.type` (for now, render a placeholder card per element since element-specific renderers are Epic 5).
  - [x] 1.3 Export `generateMetadata()` — reuse `generateClubMetadata()` but override `title` with the page label and `description` with page-specific content if available.
  - [x] 1.4 Wrap the page content in the same flex layout as the home page (sidebar + main content area).

- [x] Task 2: Create `loading.tsx` for skeleton UI (AC: 1)
  - [x] 2.1 Create `src/app/[lang]/(country)/[country]/[club]/[page]/loading.tsx` — renders a content skeleton (3-4 animated pulse bars of varying widths) matching the expected page content shape.
  - [x] 2.2 The skeleton must render within 100ms of navigation (Next.js App Router guarantees instant display of `loading.tsx` during navigation).

- [x] Task 3: Create basic `ElementRenderer` component (AC: 2)
  - [x] 3.1 Create `src/components/app/club-site/ElementRenderer.tsx` — accepts a `PageElement` and renders a styled placeholder card showing the element type (e.g., "Rich Text", "Gallery", "Calendar", "Documents"). This is a temporary renderer until Epic 5 implements real element components.
  - [x] 3.2 Handle unknown element types gracefully (render nothing or a generic placeholder).

- [x] Task 4: Update `ClubSidebarNav` to support sub-pages (AC: 3, 4)
  - [x] 4.1 Update `PageLink` type in `ClubSidebarNav` to include `parentId: string | null`.
  - [x] 4.2 Update `getClubPublicData()` query to include `parentId` in the pages select.
  - [x] 4.3 In the sidebar, group pages: render top-level pages (`parentId === null`), and nest child pages under their parent with `pl-4` indent (one level deep only).
  - [x] 4.4 Ensure active page highlighting works correctly for both parent and child pages.

- [x] Task 5: Update navigation links to use Next.js `<Link>` (AC: 1, 3)
  - [x] 5.1 Ensure all navigation links in `ClubSidebarNav` use Next.js `<Link>` component (not `<a>`) to enable client-side navigation (SPA-style transitions without full-page reloads).
  - [x] 5.2 Inner page links should point to `/{lang}/{country}/{club-slug}/{page-slug}`.
  - [x] 5.3 Verify the "Home" link still points to `/{lang}/{country}/{club-slug}` and "Contact" to `/{lang}/{country}/{club-slug}/contact`.

- [x] Task 6: Update club home page to render page content area (AC: 1)
  - [x] 6.1 The current home page only renders `ClubHeroSection`. Below the hero, if the club has a "home" page with elements, render those elements using `ElementRenderer`. This makes the home page consistent with inner pages.
  - [x] 6.2 If no home-page elements exist, keep the current hero-only layout.

- [x] Task 7: Create contact page route (AC: 2)
  - [x] 7.1 Create `src/app/[lang]/(country)/[country]/[club]/contact/page.tsx` as a server component. This is the anchor page for "Contact" in the sidebar. For now, render a placeholder with the club's contact information structure (the full contact form is Story 6.1).
  - [x] 7.2 Export `generateMetadata()` with appropriate title ("Contact — {clubName}").

- [x] Task 8: Write tests (AC: 1-4)
  - [x] 8.1 Test inner page route renders page elements for a valid page slug
  - [x] 8.2 Test inner page route calls `notFound()` for non-existent page slug
  - [x] 8.3 Test inner page route calls `notFound()` for inactive page (`isActive: false`)
  - [x] 8.4 Test inner page route calls `notFound()` for anchor page (`isAnchor: true`)
  - [x] 8.5 Test `ElementRenderer` renders placeholder cards for each element type
  - [x] 8.6 Test `ClubSidebarNav` renders sub-pages nested under parent with correct indentation
  - [x] 8.7 Test `ClubSidebarNav` highlights active inner page with `aria-current="page"`
  - [x] 8.8 Test `generateMetadata()` for inner pages returns correct title and description
  - [x] 8.9 Test contact page renders correctly
  - [x] 8.10 Test loading skeleton renders (loading.tsx exports a valid component)

- [x] Task 9: Run full test suite, typecheck, lint, build

## Dev Notes

### Architecture & Constraints

- **Prisma import**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'`
- **Rendering**: Inner pages MUST be server-rendered (SSR) for SEO and direct URL access. `ClubSidebarNav` is already a client component (for mobile Sheet toggle).
- **SPA transitions**: Next.js App Router provides SPA-style client-side navigation automatically when using `<Link>` component. The `loading.tsx` file in the route segment is displayed instantly during navigation — this satisfies the 100ms skeleton requirement without any custom code.
- **URL pattern**: `/{lang}/{country}/{club-slug}/{page-slug}` (e.g., `/fr/ch/ski-club-valais/calendar`)
- **Route location**: `src/app/[lang]/(country)/[country]/[club]/[page]/page.tsx` — NEW dynamic route segment
- **Contact page**: `src/app/[lang]/(country)/[country]/[club]/contact/page.tsx` — NEW static route (takes priority over `[page]` dynamic segment per Next.js routing rules)

### CRITICAL: Next.js Routing Priority

Next.js App Router resolves routes in this order: static segments > dynamic segments. So `contact/page.tsx` takes priority over `[page]/page.tsx` when the URL path is `/club-slug/contact`. This means:
- `/{lang}/{country}/{club-slug}/contact` → `contact/page.tsx` (static match)
- `/{lang}/{country}/{club-slug}/calendar` → `[page]/page.tsx` (dynamic match)
- No need for special handling — Next.js does this automatically.

### Key Database Queries

**Page with elements for inner page route:**
```typescript
// Uses clubId directly (not relation filter) to satisfy the multi-tenant Prisma middleware.
// See src/lib/server/page-queries.ts for the cached implementation.
const page = await prisma.page.findFirst({
  where: {
    slug: pageSlug,
    clubId,
    isActive: true,
    isAnchor: false,
  },
  select: {
    id: true,
    slug: true,
    label: true,
    elements: {
      orderBy: { position: 'asc' },
      select: { id: true, type: true, position: true, data: true },
    },
  },
})
```

**Note:** Uses `clubId` directly in the WHERE clause (not `club: { slug, country }` relation filter) because the multi-tenant Prisma middleware in `src/server/db.ts` requires a direct `clubId` field to pass the `hasClubIdFilter()` check.

### Key Existing Code to Reuse

| File | What to reuse |
|------|--------------|
| `src/app/[lang]/(country)/[country]/[club]/page.tsx` | Pattern for club page with sidebar layout, metadata, accent colors |
| `src/components/app/club-site/ClubSidebarNav.tsx` | Existing nav component — extend with sub-page support and `parentId` |
| `src/components/app/club-site/ClubHeroSection.tsx` | Hero section (used on home page, not on inner pages) |
| `src/components/app/club-site/accent-colors.ts` | Accent color CSS variable mapping |
| `src/components/app/seo/metadata.ts` | `generateClubMetadata()` — reuse for inner page metadata |
| `src/lib/server/club-queries.ts` | `getClubPublicData()` — extend to include `parentId` in pages select |
| `src/lib/country.ts` | `isValidCountry()` |
| `src/lib/i18n/index.ts` | `resolveUILang()`, `getTranslations()` |
| `src/server/db.ts` | Prisma client singleton |

### Anti-Patterns to Avoid

- **Do NOT implement full element renderers** — that's Epic 5. The `ElementRenderer` here is a temporary placeholder that shows element type labels in styled cards. Real renderers (TipTap rich text, gallery grid, calendar, etc.) come later.
- **Do NOT implement the contact form** — that's Story 6.1. The contact page here is a placeholder with the page structure.
- **Do NOT implement edit mode** — that's Story 4.1. Pages render in read-only public mode only.
- **Do NOT implement the "Powered by" footer** — that's Story 3.5.
- **Do NOT use Route Handlers for public page content** — use standard Next.js server components with direct Prisma queries. Route Handlers are for edit mode SPA fetch (Epic 4+).
- **Do NOT fetch page data client-side** — initial render must be SSR for SEO. SPA transitions are handled by Next.js App Router `<Link>` + `loading.tsx`.
- **Do NOT create a `[page]/layout.tsx`** — the shared club layout already handles sidebar + accent colors. Inner pages just need the page content.
- **Do NOT modify `getClubBySlug()`** — it's cached and used elsewhere. Only modify `getClubPublicData()` to add `parentId` to pages select.
- **Do NOT implement deep nesting (>1 level)** — AC4 specifies "one level deep" only. `parentId` creates a single parent-child relationship.
- **Do NOT add `"use client"` to the inner page component** — it must be a server component for SSR/SEO.

### Sub-Page Nesting Logic

The `ClubSidebarNav` currently renders a flat list of pages. For AC4, implement one-level nesting:

```typescript
// Group pages by parent
const topLevelPages = pages.filter(p => p.parentId === null)
const childPages = pages.filter(p => p.parentId !== null)

// For each top-level page, find its children
topLevelPages.map(parent => ({
  ...parent,
  children: childPages.filter(c => c.parentId === parent.id),
}))
```

Render children indented (`pl-4`) under their parent in the sidebar. Active state should work for both parent and child pages.

### Shared Layout Considerations

The current club layout (`[club]/layout.tsx`) already:
- Validates country and fetches club by slug
- Renders `TotpEnrollmentBanner` conditionally
- Passes children through

The inner page route (`[page]/page.tsx`) needs to:
- Fetch its OWN page data (by page slug within the club)
- Render page elements
- Re-fetch club data for sidebar (or receive it via context — check if the layout passes club data)

**Important:** The current `page.tsx` (home) fetches club data independently via `getClubPublicData()`. The inner page route should do the same since `getClubPublicData()` is React-cached — no duplicate DB queries.

### Accent Color Application

The current home page applies accent colors via inline `style` on a wrapping `<div>`. The inner page route should follow the same pattern — or better, move the accent color `<div>` to the shared club layout so it applies to all club pages (home + inner pages) without duplication.

**Recommendation:** Refactor the accent color wrapper from `page.tsx` into `layout.tsx` so all club routes inherit the theme. This requires fetching `accentColor` in the layout, which means `getClubPublicData()` should also be called in the layout (it's cached, so no extra DB hit).

### i18n Translation Keys

No new translation keys needed for this story. Existing keys cover:
- `clubSite.home` — "Home" nav label
- `clubSite.contact` — "Contact" nav label
- `clubSite.navigation` — nav aria-label
- `clubSite.menu` — hamburger aria-label

Inner page labels come from the `page.label` database field (set by club admin in Story 4.3).

### Responsive Layout

Same responsive behavior as Story 3.3:
- **Desktop (md+):** Fixed sidebar (240px) on left; main content area on right
- **Mobile (<md):** Hamburger icon (top-left); full-width content; sidebar in Sheet drawer
- **Content area**: `max-w-4xl mx-auto px-4` for inner page content
- **Loading skeleton**: Full width of content area, 3-4 pulse bars

### Project Structure Notes

Files to create:
- `src/app/[lang]/(country)/[country]/[club]/[page]/page.tsx` — inner page route
- `src/app/[lang]/(country)/[country]/[club]/[page]/loading.tsx` — loading skeleton
- `src/app/[lang]/(country)/[country]/[club]/contact/page.tsx` — contact page placeholder
- `src/components/app/club-site/ElementRenderer.tsx` — element placeholder renderer
- `src/__tests__/club-inner-page.test.ts` — tests

Files to modify:
- `src/components/app/club-site/ClubSidebarNav.tsx` — add `parentId` support, sub-page nesting
- `src/lib/server/club-queries.ts` — add `parentId` to `getClubPublicData()` pages select
- `src/app/[lang]/(country)/[country]/[club]/page.tsx` — potentially refactor accent color to layout
- `src/app/[lang]/(country)/[country]/[club]/layout.tsx` — potentially add accent color wrapper

### Previous Story Intelligence (from Story 3.3)

- `getClubPublicData()` is React-cached — safe to call from multiple server components without duplicate DB queries
- Club layout was restructured in 3.3: auth guard moved to `settings/layout.tsx`, public access works
- `ClubSidebarNav` is a client component with `PageLink` type: `{ id, slug, label, isAnchor, position }`
- Current sidebar filters out anchor pages: `pages.filter(p => !p.isAnchor)`
- Accent colors applied via inline `style={{ '--primary': ... }}` on wrapping div
- JSON-LD and Open Graph metadata generated via `generateClubMetadata()` and `generateClubJsonLd()`
- 303 tests currently passing — must remain green
- 3 pre-existing test failures (setup-password x2, magic-link-route x1) — unrelated, ignore
- `findText()` helper and `makeParams()` helper available in test utilities
- Next.js 16 `params` are Promises — always `await` them

### Git Intelligence

Recent commits follow `feat: story X.Y` pattern:
```
2d341b1 feat: story 3.3
618a4cf feat: story 3.2
d6fffeb feat: story 3.1
```

Story 3.3 created the foundation this story builds on:
- `src/components/app/club-site/ClubSidebarNav.tsx` — extend with sub-page support
- `src/components/app/club-site/ClubHeroSection.tsx` — used on home page only
- `src/app/[lang]/(country)/[country]/[club]/page.tsx` — pattern to follow for inner pages
- `src/lib/server/club-queries.ts` — `getClubPublicData()` to extend

### Testing Requirements

- Framework: Vitest (`pnpm test`)
- Test location: `src/__tests__/club-inner-page.test.ts` (new file)
- Mock `@/server/db` for Prisma queries (`prisma.page.findFirst`, `prisma.club.findFirst`)
- Mock `next/navigation` for `notFound`
- Test patterns from Story 3.3: `makeParams()` for async params, `findText()` for JSX text, `vi.mock()` for server modules
- All 303 existing tests must remain green

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.4 (lines 803-825)]
- [Source: _bmad-output/planning-artifacts/architecture.md — Club route structure, SPA navigation, Page/PageElement models, Route Handlers, loading skeleton requirements]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ClubSidebarNav anatomy, SPA transitions, loading skeleton spec, sub-page nesting, mobile responsive behavior]
- [Source: prisma/schema.prisma — Page model with slug, label, isActive, isAnchor, position, parentId; PageElement model]
- [Source: src/app/[lang]/(country)/[country]/[club]/page.tsx — Current home page implementation pattern]
- [Source: src/components/app/club-site/ClubSidebarNav.tsx — Current nav implementation to extend]
- [Source: src/lib/server/club-queries.ts — getClubPublicData() to extend with parentId]
- [Source: _bmad-output/implementation-artifacts/3-3-club-public-site-server-rendered-home-page.md — Previous story patterns and learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No blocking issues encountered.

### Completion Notes List

- Created inner page route (`[page]/page.tsx`) as server component with SSR, `notFound()` guards for missing/inactive/anchor pages, and `generateMetadata()` with page-specific titles
- Created `loading.tsx` with animated pulse skeleton bars (3 varying-width bars) for instant SPA transition feedback
- Created `ElementRenderer` placeholder component dispatching on `ElementType` enum with graceful unknown-type handling (returns null)
- Updated `ClubSidebarNav` with one-level sub-page nesting: pages grouped by `parentId`, children rendered with `pl-4` indent, active highlighting via `aria-current="page"` works for both parent and child pages
- All nav links already use Next.js `<Link>` — verified Home, inner pages, and Contact links use correct URL patterns
- Updated home page to render "home" page elements below hero section via `getHomePageElements()` query
- Created contact page placeholder route with proper metadata (`Contact — {clubName}`)
- Added `pageTitle` optional field to `generateClubMetadata()` for inner page title override pattern (`{pageTitle} — {clubName}`)
- Created `page-queries.ts` with cached `getPageBySlug()` and `getHomePageElements()` queries
- Added `parentId` to `getClubPublicData()` pages select
- 19 new tests covering all ACs; 322 total tests pass, 0 regressions
- TypeScript, lint, and build all pass clean
- 1 pre-existing audit vulnerability (shadcn transitive dep) — not introduced by this story

### File List

**New files:**
- `src/app/[lang]/(country)/[country]/[club]/[page]/page.tsx` — Inner page server component
- `src/app/[lang]/(country)/[country]/[club]/[page]/loading.tsx` — Loading skeleton
- `src/app/[lang]/(country)/[country]/[club]/contact/page.tsx` — Contact page placeholder
- `src/components/app/club-site/ElementRenderer.tsx` — Element placeholder renderer
- `src/lib/server/page-queries.ts` — Cached page queries (getPageBySlug, getHomePageElements)
- `src/__tests__/club-inner-page.test.ts` — 19 tests for inner page, contact, elements, nav, metadata, loading

**Modified files:**
- `src/components/app/club-site/ClubSidebarNav.tsx` — Added parentId to PageLink type, sub-page nesting with pl-4 indent
- `src/lib/server/club-queries.ts` — Added parentId to getClubPublicData() pages select
- `src/components/app/seo/metadata.ts` — Added optional pageTitle and pageSlug fields to ClubMetadataOptions; fixed canonical URL to include page slug
- `src/app/[lang]/(country)/[country]/[club]/page.tsx` — Added home page elements rendering below hero
- `src/__tests__/club-public-page.test.ts` — Updated mock to include parentId and page.findFirst mock

## Change Log

- 2026-03-07: Implemented inner page navigation (SPA), contact page, element renderer, sub-page nesting, loading skeleton, and 19 tests
- 2026-03-07: Code review fixes — canonical URL includes page slug (H1), contact title no longer duplicates club name (H2), inner page meta description uses welcomeText (M1), getPageBySlug filters by club.status ACTIVE (M2), improved test assertions for isActive/isAnchor filtering (M3)
- 2026-03-07: Code review #2 fixes — contact page generateMetadata now includes activityTypeLabel for consistent SEO (M2), updated stale Prisma code example in Dev Notes from relation filter to direct clubId (M3)
