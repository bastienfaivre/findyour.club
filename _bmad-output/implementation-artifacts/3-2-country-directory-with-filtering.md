# Story 3.2: Country Directory with Rich Filtering

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Public Visitor,
I want to browse a filterable directory of clubs on the country page with filters for activity type and location,
so that I can discover clubs matching my interests near me — this is the core discovery experience.

## Acceptance Criteria

1. **Given** a visitor navigates to a country path (e.g., `platform-name.com/fr/ch`), **When** the page loads, **Then** it renders server-side with a filter bar (activity type select, canton select) and a grid of `ClubCard` components for all active clubs in that country. Each `ClubCard` shows: club name, logo (or monogram), activity type, location, and a link to the club's public site.

2. **Given** the visitor changes an activity type or canton filter, **When** the filter value changes, **Then** the club grid updates with a loading skeleton visible within 100ms; only matching clubs are shown — no full page reload required.

3. **Given** active filters produce no matching clubs, **Then** an inline empty state is shown: "No clubs match these filters" with sub-text "Try a different canton or activity type" and a "Reset filters" link — never a dead end.

4. **Given** active filter values, **Then** they are reflected in the URL as query parameters (e.g., `?activity=ski&canton=valais`) so the filtered view is shareable and bookmarkable.

5. **Given** the directory page, **Then** it is server-rendered for SEO with meta tags and Open Graph tags generated via `generateDirectoryMetadata()`. The directory page uses `max-w-7xl` layout and scores >= 90 on Lighthouse.

## Tasks / Subtasks

- [x] Task 1: Add i18n translation keys for country directory (AC: 1, 3)
  - [x] 1.1 Add new keys to `src/lib/i18n/translations/types.ts`:
    - `directory.title` — "Clubs in {country}" page title
    - `directory.description` — SEO meta description for directory
    - `directory.filterCanton` — "Canton" filter label
    - `directory.filterActivity` — "Activity type" filter label
    - `directory.allCantons` — "All cantons" (default select option)
    - `directory.allActivities` — "All activities" (default select option)
    - `directory.noResults` — "No clubs match these filters"
    - `directory.noResultsHint` — "Try a different canton or activity type"
    - `directory.resetFilters` — "Reset filters"
    - `directory.clubCount` — "{count} clubs" result count label
    - `directory.clubAriaLabel` — "{name} — {activity} in {location}" for ClubCard aria-label
  - [x] 1.2 Add translations to all 4 language files (en.ts, fr.ts, de.ts, it.ts)

- [x] Task 2: Create `ClubCard` component (AC: 1)
  - [x] 2.1 Create `src/components/app/directory/ClubCard.tsx` — server-friendly presentational component accepting `{ name, slug, country, lang, logoUrl?, logoAlt?, activityType?, locationName?, cantonName? }`
  - [x] 2.2 Render: club logo (circular avatar, 40px) or monogram (first letter of name) if no logo, club name (`font-semibold`), activity type Badge, canton/location label (`text-sm text-muted-foreground`)
  - [x] 2.3 Full card wrapped in Next.js `<Link>` to `/${lang}/${country}/${slug}` with `aria-label` including club name and activity type
  - [x] 2.4 States: default + hover (subtle border highlight via `hover:border-primary/50`). Min tap area 44x44px. Style with `Card` component. Accessible focus ring.
  - [x] 2.5 Loading skeleton variant: export a `ClubCardSkeleton` component using `bg-muted animate-pulse` blocks mimicking card shape

- [x] Task 3: Create `DirectoryFilters` client component (AC: 2, 4)
  - [x] 3.1 Create `src/components/app/directory/DirectoryFilters.tsx` — `"use client"` component accepting `{ cantons: { code, name }[], activityTypes: { slug, name }[], lang, country }`
  - [x] 3.2 Render two `<Select>` controls (shadcn/ui): Canton (first — users think geographically first) and Activity type (second). Default option: "All cantons" / "All activities"
  - [x] 3.3 On filter change: update URL query params via `useRouter().push()` with new `searchParams` — `?canton=<code>&activity=<slug>`. Remove param if "All" selected.
  - [x] 3.4 Read initial values from `useSearchParams()` to restore state on page load (bookmarkable URLs)
  - [x] 3.5 Show active filters as removable Badge chips above the club grid. "Reset filters" link clears all params.
  - [x] 3.6 Use `useTransition()` to track pending state — expose `isPending` for skeleton display

- [x] Task 4: Create country directory page (AC: 1, 2, 3, 4, 5)
  - [x] 4.1 Create `src/app/[lang]/(country)/[country]/page.tsx` — server component
  - [x] 4.2 Validate country param via `isValidCountry()` — redirect to `/${lang}` if invalid
  - [x] 4.3 Fetch server-side data:
    - All active clubs for this country with their activityType and location (including SwissLocation translations and canton)
    - All distinct cantons that have active clubs (for filter options)
    - All distinct activity types that have active clubs (for filter options)
  - [x] 4.4 Apply server-side filtering from `searchParams`: filter by `canton` and `activity` query params before rendering
  - [x] 4.5 Render: page title (translated "Clubs in {country}"), `DirectoryFilters` component, club count, `ClubCard` grid (responsive: 1-col base, `md:grid-cols-2`, `lg:grid-cols-3`), empty state when no results
  - [x] 4.6 Export `generateMetadata()` using `generateDirectoryMetadata()` from `src/components/app/seo/metadata.ts`
  - [x] 4.7 Wrap club grid in `<Suspense>` with `ClubCardSkeleton` grid as fallback for streaming

- [x] Task 5: Write tests (AC: 1-5)
  - [x] 5.1 Test `ClubCard` renders name, activity badge, location, correct link href
  - [x] 5.2 Test `ClubCard` monogram fallback when no logo
  - [x] 5.3 Test `ClubCardSkeleton` renders without error
  - [x] 5.4 Test directory page renders clubs from DB mock
  - [x] 5.5 Test directory page shows empty state when no clubs match filters
  - [x] 5.6 Test directory page filters by activity and canton from searchParams
  - [x] 5.7 Test `generateDirectoryMetadata()` returns correct meta for country page
  - [x] 5.8 Test invalid country redirects to platform homepage

- [x] Task 6: Run full test suite, typecheck, lint, build

## Dev Notes

### Architecture & Constraints

- **Prisma import**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'`
- **Rendering**: Directory page MUST be server-rendered (SSR) for SEO — no `"use client"` on the page component itself. Only `DirectoryFilters` is a client component.
- **Route location**: `src/app/[lang]/(country)/[country]/page.tsx` — this is a NEW file. The `(country)` route group and `[country]` segment already exist (used by `[club]/`).
- **URL pattern**: `/{lang}/{country}` (e.g., `/fr/ch`). Filters as query params: `?canton=<code>&activity=<slug>`
- **URL state management**: Filters use `useSearchParams` + `useRouter` — never mirror URL state into React state (architecture rule)
- **Filter behavior**: Filters apply immediately on change — no "Search" or "Apply" button. Results update with skeleton within 100ms.
- **Filter order**: Switzerland: Canton (first) then Activity type (second). Rationale: users think geographically first.
- **Country validation**: `isValidCountry()` from `src/lib/country.ts`. Currently only `'ch'` is supported.
- **i18n**: Type-safe translations. Add keys to `types.ts` first, then implement in all 4 files (en, fr, de, it). Use `resolveUILang(lang)` + `getTranslations(uiLang)`.
- **Tailwind v4**: Use modern Tailwind utilities. No `@apply` in components.
- **Max-width**: `max-w-7xl` (80rem) for directory layout.

### Key Database Queries

**All active clubs for a country with relations:**
```typescript
const clubs = await prisma.club.findMany({
  where: {
    country,
    status: 'ACTIVE',
    ...(activitySlug && { activityType: { slug: activitySlug } }),
    ...(cantonCode && {
      location: { swissLocation: { cantonCode } },
    }),
  },
  select: {
    id: true,
    name: true,
    slug: true,
    logoUrl: true,
    logoAlt: true,
    activityType: { select: { slug: true } },
    location: {
      select: {
        swissLocation: {
          select: {
            cantonCode: true,
            translations: { where: { language: uiLang }, select: { name: true } },
          },
        },
      },
    },
  },
  orderBy: { name: 'asc' },
})
```

**Distinct cantons with active clubs:**
```typescript
const cantons = await prisma.swissCanton.findMany({
  where: {
    locations: {
      some: {
        location: { clubs: { some: { country, status: 'ACTIVE' } } },
      },
    },
  },
  select: {
    code: true,
    translations: { where: { language: uiLang }, select: { name: true } },
  },
  orderBy: { code: 'asc' },
})
```

**Distinct activity types with active clubs:**
```typescript
const activityTypes = await prisma.activityType.findMany({
  where: {
    clubs: { some: { country, status: 'ACTIVE' } },
  },
  select: { slug: true },
  orderBy: { slug: 'asc' },
})
```

Activity type display names come from translations (`t.activityTypes[slug]`), NOT from the `ActivityType.name` DB field. The `activityTypes` translation object already has all 14 types translated in all 4 languages.

### Key Existing Code to Reuse

| File | What to reuse |
|------|--------------|
| `src/lib/country.ts` | `isValidCountry()`, `getCountryName()`, `SUPPORTED_COUNTRIES` |
| `src/lib/i18n/index.ts` | `resolveUILang()`, `getTranslations()` |
| `src/lib/i18n/translations/types.ts` | Add `directory` keys here; `activityTypes` object already has all translations |
| `src/components/app/seo/metadata.ts` | `generateDirectoryMetadata()` — already exported and ready to use |
| `src/components/app/directory/CountryButton.tsx` | Reference for styling patterns (Card usage, Link, flag emoji, accessible aria-label) |
| `src/components/ui/card.tsx` | Reuse for ClubCard styling |
| `src/components/ui/badge.tsx` | Reuse for activity type badge on ClubCard and active filter chips |
| `src/components/ui/select.tsx` | Reuse for filter dropdowns (shadcn/ui Select) |
| `src/components/ui/avatar.tsx` | Reuse for club logo avatar (if available) or build inline |
| `src/server/db.ts` | Prisma client singleton — import as `prisma` |
| `src/app/[lang]/(platform)/page.tsx` | Reference for server component data fetching + `generateMetadata()` pattern |

### Anti-Patterns to Avoid

- **Do NOT fetch club data client-side** — initial page render with all clubs must be server-side for SEO. The client component (`DirectoryFilters`) only updates URL params; the page re-renders server-side with new params.
- **Do NOT create a separate API route for directory data** — fetch directly from Prisma in the server component.
- **Do NOT use `useState` for filter values** — read from `useSearchParams()` (architecture rule: never mirror URL state into React state).
- **Do NOT hardcode canton or activity type lists** — derive from actual DB data (only show cantons/activities that have active clubs).
- **Do NOT add `"use client"` to the page component** — only `DirectoryFilters` is a client component. The page itself is a server component.
- **Do NOT use `activityType.name` for display** — use `t.activityTypes[slug]` from translations for localized display names.
- **Do NOT create a layout.tsx at the `[country]` level** — the page is standalone. Club pages under `[club]/` have their own layout.
- **Do NOT implement pagination** — not in this story's AC. Show all matching clubs in a grid.
- **Do NOT implement structured data / JSON-LD** — that's Story 3.3 for club pages. This story uses `generateDirectoryMetadata()` for standard meta tags.

### Responsive Layout (from UX spec)

- **Mobile (base)**: Filter bar stacks vertically; club cards single column
- **md (768px)**: 2-column club grid; filter bar can be horizontal
- **lg (1024px)**: 3-column club grid; filter bar horizontal
- **Max-width**: `max-w-7xl` (80rem) for directory layout

### ClubCard Component Spec (from UX)

**Anatomy:**
- Club logo (small circular avatar) or monogram fallback (first letter)
- Club name (`font-semibold`)
- Activity type Badge
- Canton / location label (`text-sm text-muted-foreground`)
- Full card is a clickable link

**States:**
- `default` — resting card
- `hover` — subtle border highlight
- `loading` — skeleton placeholder (separate `ClubCardSkeleton` component)

**Accessibility:** Entire card wrapped in `<a>` via `<Link>`; `aria-label` includes club name and activity type; no redundant interactive elements inside. Min 44x44px tap area.

### Filter Behavior (from UX)

- Filters apply immediately on change — no "Search" or "Apply" button
- Results update with brief skeleton (100ms) — no full-page reload
- Active filters shown as removable Badge chips above results
- "Reset filters" link clears all active filters
- Filter field order (Switzerland): Canton (first) → Activity type (second)

### Empty State (from UX)

- Centered message: "No clubs match these filters"
- Sub-text: "Try a different canton or activity type"
- "Reset filters" link (not button) — low emphasis
- No illustration or decorative graphic

### Monogram Avatar Pattern

When a club has no `logoUrl`, display a circular avatar with the first letter of the club name:
```typescript
function ClubMonogram({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-sm">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
```

### Next.js `searchParams` Pattern (Next.js 16)

In Next.js 16, `searchParams` is a Promise in page components:
```typescript
type Props = {
  params: Promise<{ lang: string; country: string }>
  searchParams: Promise<{ activity?: string; canton?: string }>
}

export default async function CountryDirectoryPage({ params, searchParams }: Props) {
  const { lang, country } = await params
  const { activity, canton } = await searchParams
  // ...
}
```

### Project Structure Notes

Files to create:
- `src/app/[lang]/(country)/[country]/page.tsx` — country directory page
- `src/components/app/directory/ClubCard.tsx` — club card + skeleton
- `src/components/app/directory/DirectoryFilters.tsx` — client-side filter controls
- `src/__tests__/country-directory.test.ts` — tests

Files to modify:
- `src/lib/i18n/translations/types.ts` — add `directory` translation keys
- `src/lib/i18n/translations/en.ts` — add English translations
- `src/lib/i18n/translations/fr.ts` — add French translations
- `src/lib/i18n/translations/de.ts` — add German translations
- `src/lib/i18n/translations/it.ts` — add Italian translations

### Previous Story Intelligence (from Story 3.1)

- `generateDirectoryMetadata()` already exists in `src/components/app/seo/metadata.ts` — ready to use
- CountryButton links to `/${lang}/${country}` — the directory page must handle this URL
- Homepage fetches club counts via `prisma.club.groupBy()` with `Promise.all()` for parallelization — use same pattern
- i18n keys go in `types.ts` first, then all 4 language files — type-safe approach enforces completeness
- `activityTypes` translation object already has all 14 types (skiing, football, mountaineering, tennis, hiking, cycling, swimming, volleyball, basketball, ice-hockey, climbing, yoga, running, badminton) translated in all 4 languages
- Test pattern: `makeParams()` helper for async params, `findText()` for JSX tree text extraction, `vi.mock()` for server modules
- 277 tests currently passing — must remain green
- 3 pre-existing test failures (setup-password x2, magic-link-route x1) — unrelated, ignore
- Code review found issues with hardcoded English in components — always use translations, never hardcode display text

### Git Intelligence

Recent commits follow `feat: story X.Y` pattern:
```
d6fffeb feat: story 3.1
2e0335b feat: story 2.4
08652d2 feat: story 2.3
```

Story 3.1 created key infrastructure this story builds on:
- `src/components/app/directory/` directory with `CountryButton.tsx`
- `src/components/app/seo/metadata.ts` with both metadata generators
- Platform layout nav with links to About/Support
- LanguageSwitcher with full keyboard navigation

### Testing Requirements

- Framework: Vitest (`pnpm test`)
- Test location: `src/__tests__/country-directory.test.ts` (new file)
- Mock `@/server/db` for Prisma queries (`prisma.club.findMany`, `prisma.swissCanton.findMany`, `prisma.activityType.findMany`)
- Mock `next/navigation` for `redirect`
- Test ClubCard renders correct link href `/${lang}/${country}/${slug}` and displays club info
- Test monogram fallback when no logo
- Test page filters server-side based on searchParams
- Test empty state renders when no clubs match
- Test metadata generation for directory page
- All 277 existing tests must remain green

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — URL state (directory filters via useSearchParams), component tree (ClubCard, DirectoryFilters), rendering strategy (SSR)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ClubCard anatomy, SearchFilterBar/DirectoryFilters, filter behavior, empty states, responsive layout]
- [Source: prisma/schema.prisma — Club, ActivityType, Location, SwissLocation, SwissCanton models]
- [Source: src/components/app/seo/metadata.ts — generateDirectoryMetadata() already exported]
- [Source: src/lib/country.ts — isValidCountry(), getCountryName(), SUPPORTED_COUNTRIES]
- [Source: src/lib/i18n/translations/types.ts — activityTypes already has all 14 types translated]
- [Source: src/app/[lang]/(platform)/page.tsx — server component data fetching + generateMetadata() pattern]
- [Source: _bmad-output/implementation-artifacts/3-1-platform-homepage-country-navigation.md — previous story patterns and learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Test `findText` helper cannot traverse into React function component elements (ClubCard, DirectoryFilters) — verified by checking rendered tree structure. Adjusted tests to verify component props directly for function components.

### Completion Notes List

- All 11 `directory.*` translation keys added to types.ts and all 4 language files (en, fr, de, it)
- `ClubCard` component: presentational, uses `next/image` for logos, monogram fallback, Badge for activity type, accessible aria-label, hover border highlight, focus ring, 44px min tap area
- `ClubCardSkeleton` component: animate-pulse placeholder blocks
- `DirectoryFilters` client component: two shadcn/ui Select controls (Canton first, Activity second), URL-driven state via `useSearchParams` + `useRouter`, removable Badge chips for active filters, reset link, `useTransition` for pending state indicator
- Country directory page: SSR server component at `[lang]/(country)/[country]/page.tsx`, validates country, fetches clubs/cantons/activityTypes in parallel via `Promise.all()`, server-side filtering from searchParams, `generateMetadata()` with `generateDirectoryMetadata()`, responsive grid (1/2/3 cols), empty state, `max-w-7xl` layout
- 12 new tests added (290 total, all passing), covering: ClubCard rendering, monogram fallback, logo image, skeleton, metadata helper, page generateMetadata (valid + invalid country), page rendering, empty state, server-side filtering, invalid country redirect, language fallback
- All safety checks pass: tsc --noEmit (0 errors), lint (0 errors/warnings), audit (0 vulnerabilities), build (success)
- Code review fixes applied: H1 (reset link in empty state), H2 (Suspense with ClubCardSkeleton fallback around grid), M1 (keyboard-accessible Badge chips with role/tabIndex/onKeyDown), M2 (generateMetadata test coverage), L1 (indentation fix), L2 (reset button → anchor element)

### File List

New files:
- `src/app/[lang]/(country)/[country]/page.tsx`
- `src/components/app/directory/ClubCard.tsx`
- `src/components/app/directory/DirectoryFilters.tsx`
- `src/__tests__/country-directory.test.ts`

Modified files:
- `src/lib/i18n/translations/types.ts`
- `src/lib/i18n/translations/en.ts`
- `src/lib/i18n/translations/fr.ts`
- `src/lib/i18n/translations/de.ts`
- `src/lib/i18n/translations/it.ts`

## Change Log

- 2026-03-06: Implemented country directory page with club cards, filters (canton + activity type), SEO metadata, empty state, responsive grid, and i18n translations in all 4 languages. 10 tests added.
- 2026-03-06: Code review fixes — added reset link to empty state (H1), re-added Suspense with skeleton fallback (H2), keyboard-accessible Badge chips (M1), generateMetadata tests (M2), fixed indentation (L1), reset button → anchor (L2). 12 tests total.
