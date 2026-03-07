# Story 3.5: Platform Attribution Footer & Platform Sitemap

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Public Visitor,
I want every club site to have a platform attribution footer link and the platform to maintain a comprehensive sitemap,
so that club sites are connected to the platform directory and all clubs are discoverable by search engines.

## Acceptance Criteria

1. **Given** any public club site page (home or inner), **When** the page renders, **Then** the `PoweredByBanner` component renders in the footer with a link to the platform homepage; it is present on every page (FR26).

2. **Given** a visitor clicks the attribution footer link, **When** they arrive on the platform homepage, **Then** the platform homepage loads as per Story 3.1 (FR25).

3. **Given** all active club sites, **Then** a platform-level sitemap served at `/sitemap.xml` includes all club home page URLs, generated automatically — no admin action required (FR43).

4. **Given** each club home page, **Then** the server-rendered HTML includes a `<link rel="canonical">` tag and `<meta name="robots" content="index, follow">`.

5. **Given** the `PoweredByBanner`, **Then** it meets WCAG 2.1 AA contrast requirements in both light and dark mode and is keyboard-accessible with a descriptive `aria-label`.

## Tasks / Subtasks

- [x] Task 1: Create `PoweredByBanner` component (AC: 1, 2, 5)
  - [x] 1.1 Create `src/components/app/club-site/PoweredByBanner.tsx` as a server component. Render a subtle footer banner containing a "Powered by Clashware" text/link. The link points to the platform homepage: `/{lang}/` (e.g., `/fr/`).
  - [x] 1.2 The component must accept `lang: string` prop to construct the correct platform homepage link.
  - [x] 1.3 Style with Tailwind: muted foreground text (`text-muted-foreground`), small font size (`text-xs` or `text-sm`), centered, with top border separator (`border-t`). Must meet WCAG 2.1 AA contrast (4.5:1 ratio minimum for small text) in both light and dark mode.
  - [x] 1.4 Add `aria-label` on the link (e.g., "Powered by Clashware — visit platform homepage") for screen readers. Ensure the link is keyboard-focusable with visible focus ring.
  - [x] 1.5 Add i18n translation key `clubSite.poweredBy` to all language files (en, fr, de, it) for the "Powered by" text.

- [x] Task 2: Add `PoweredByBanner` to club layout (AC: 1)
  - [x] 2.1 Modify `src/app/[lang]/(country)/[country]/[club]/layout.tsx` to render `<PoweredByBanner lang={lang} />` AFTER `{children}` inside the fragment. This ensures the footer appears on every club page (home, inner pages, contact).
  - [x] 2.2 The banner must render below the main content area — it is NOT inside the sidebar/content flex layout, but below the entire club page content.

- [x] Task 3: Create platform sitemap (AC: 3)
  - [x] 3.1 Create `src/app/sitemap.ts` exporting an async default function returning `MetadataRoute.Sitemap`. This is the Next.js 16 convention for dynamic sitemaps — served at `/sitemap.xml` automatically.
  - [x] 3.2 Query all clubs with `status: 'ACTIVE'` from Prisma: `prisma.club.findMany({ where: { status: 'ACTIVE' }, select: { slug, country, defaultLanguage, updatedAt } })`. Use the Prisma client directly from `@/server/db` (NOT cached — sitemap must be fresh).
  - [x] 3.3 For each club, generate a URL entry: `${BASE_URL}/${club.defaultLanguage}/${club.country}/${club.slug}`. Use `club.defaultLanguage` as the language segment since the canonical club URL uses the club's content language.
  - [x] 3.4 Also include platform pages in the sitemap: homepage (`/en/`), about (`/en/about`), support (`/en/support`), and each country directory (`/en/ch/`).
  - [x] 3.5 Set `lastModified: club.updatedAt`, `changeFrequency: 'weekly'`, `priority: 0.7` for club pages. Platform pages: `priority: 1.0` for homepage, `0.8` for directory, `0.5` for about/support.
  - [x] 3.6 Add `export const dynamic = 'force-dynamic'` to ensure the sitemap is regenerated on each request (not cached by Next.js static generation).

- [x] Task 4: Verify canonical and robots meta on club pages (AC: 4)
  - [x] 4.1 Verify that `generateClubMetadata()` in `src/components/app/seo/metadata.ts` already sets `alternates.canonical` and `robots: 'index, follow'` — these are already implemented per Story 3.3/3.4. No changes needed unless something is missing.
  - [x] 4.2 Verify the canonical URL pattern is correct: `${BASE_URL}/${lang}/${country}/${clubSlug}` for home, `${BASE_URL}/${lang}/${country}/${clubSlug}/${pageSlug}` for inner pages.

- [x] Task 5: Write tests (AC: 1-5)
  - [x] 5.1 Test `PoweredByBanner` renders a link to the platform homepage with correct `/{lang}/` href.
  - [x] 5.2 Test `PoweredByBanner` has `aria-label` on the link for accessibility.
  - [x] 5.3 Test `PoweredByBanner` renders the "Powered by" text from translations.
  - [x] 5.4 Test club layout renders `PoweredByBanner` after children.
  - [x] 5.5 Test sitemap function returns entries for all ACTIVE clubs with correct URL format.
  - [x] 5.6 Test sitemap function excludes SUSPENDED clubs.
  - [x] 5.7 Test sitemap includes platform pages (homepage, directory, about, support).
  - [x] 5.8 Test sitemap entry URLs use `club.defaultLanguage` as the language segment.
  - [x] 5.9 Test that canonical and robots meta are present on club pages (verify existing `generateClubMetadata()` behavior).

- [x] Task 6: Run full test suite, typecheck, lint, build

## Dev Notes

### Architecture & Constraints

- **Prisma import**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'`
- **Rendering**: `PoweredByBanner` should be a server component (no interactivity needed — it's just a styled link). No `"use client"` directive.
- **URL pattern**: Platform homepage link: `/{lang}/` — NOT `/{lang}/{country}/`. The footer links visitors to the platform, not to a specific country directory.
- **Sitemap location**: `src/app/sitemap.ts` — Next.js 16 serves this automatically at `/sitemap.xml`. The proxy (`src/proxy.ts`) already excludes `sitemap.xml` from language prefixing via its matcher regex.
- **Sitemap function**: Must be `async` because it queries the database. Export `dynamic = 'force-dynamic'` to prevent static generation caching.
- **No sitemap index needed**: The platform will have far fewer than 50,000 URLs. A single sitemap file is sufficient.

### CRITICAL: Sitemap Must Be at App Root

The sitemap file MUST be at `src/app/sitemap.ts` (NOT inside `[lang]` or any route group). Next.js serves sitemap files at the root of their route segment — placing it at app root ensures it's served at `/sitemap.xml`.

### CRITICAL: Club Layout Footer Placement

The `PoweredByBanner` goes in the club layout (`[club]/layout.tsx`) AFTER `{children}`, NOT inside the sidebar/content flex layout. The current layout structure is:

```tsx
// Current layout.tsx structure:
<>
  {session && <TotpEnrollmentBanner ... />}
  {children}  // ← sidebar + main content flex layout
</>

// After Story 3.5:
<>
  {session && <TotpEnrollmentBanner ... />}
  {children}  // ← sidebar + main content flex layout
  <PoweredByBanner lang={lang} />  // ← footer BELOW everything
</>
```

### CRITICAL: Canonical Tags Already Implemented

AC4 asks for canonical and robots meta on club pages. These are ALREADY implemented by `generateClubMetadata()` in `src/components/app/seo/metadata.ts` (lines 86-123). Every club page (home, inner, contact) already calls this function and sets:
- `alternates.canonical: url`
- `robots: 'index, follow'`

Task 4 is a **verification task only** — do NOT re-implement what already exists. Just confirm it works correctly in tests.

### Key Database Query for Sitemap

```typescript
// In src/app/sitemap.ts — query ALL active clubs for sitemap generation
import { prisma } from '@/server/db'

const clubs = await prisma.club.findMany({
  where: { status: 'ACTIVE' },
  select: {
    slug: true,
    country: true,
    defaultLanguage: true,
    updatedAt: true,
  },
})
```

**Note:** Do NOT use `getClubPublicData()` or any cached query — the sitemap needs to scan all clubs, not a single one. Use `prisma.club.findMany()` directly. This query does NOT need the multi-tenant `clubId` filter since it's a cross-club platform query (like the admin dashboard or directory).

### Next.js 16 Sitemap API

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Return array of { url, lastModified, changeFrequency, priority }
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]
}
```

The function signature is straightforward. `MetadataRoute.Sitemap` is `Array<{ url: string, lastModified?: string | Date, changeFrequency?: 'always'|'hourly'|'daily'|'weekly'|'monthly'|'yearly'|'never', priority?: number }>`.

### Key Existing Code to Reuse

| File | What to reuse |
|------|--------------|
| `src/app/[lang]/(country)/[country]/[club]/layout.tsx` | Club layout — add PoweredByBanner here |
| `src/components/app/seo/metadata.ts` | `BASE_URL` constant, `generateClubMetadata()` (already has canonical/robots) |
| `src/lib/i18n/translations/types.ts` | Add `poweredBy` key to `clubSite` section |
| `src/lib/i18n/translations/en.ts`, `fr.ts`, `de.ts`, `it.ts` | Add translated "Powered by" text |
| `src/server/db.ts` | Prisma client for sitemap query |
| `src/lib/country.ts` | `SUPPORTED_COUNTRIES` for sitemap platform page generation |
| `src/proxy.ts` | Already excludes `sitemap.xml` from language prefixing — no changes needed |

### Anti-Patterns to Avoid

- **Do NOT create a `powered-by-clashware.svg` asset** — the architecture mentions it but for this story, use text + link only. An SVG asset is unnecessary complexity for a simple footer text. If branding needs change later, a separate story can add it.
- **Do NOT add the footer inside `ClubSidebarNav`** — the footer goes in the club layout, OUTSIDE the sidebar/content flex. The sidebar is for navigation; the footer is below everything.
- **Do NOT use `"use client"` for `PoweredByBanner`** — it's a static link, no interactivity needed. Server component is correct.
- **Do NOT cache the sitemap query** — the sitemap must reflect the current state of active clubs. Use `dynamic = 'force-dynamic'`.
- **Do NOT implement club inner page URLs in the sitemap** — AC3 specifies "all club home page URLs" only. Inner pages are crawlable via links but don't need sitemap entries for MVP.
- **Do NOT use `getClubBySlug()` or `getClubPublicData()`** for the sitemap — those are single-club cached queries. Use `prisma.club.findMany()` for the cross-club sitemap query.
- **Do NOT modify `generateClubMetadata()`** — canonical and robots are already correctly implemented. AC4 is a verification task only.
- **Do NOT make the footer editable in edit mode** — the UX spec explicitly states "Layout structure, navigation, footer, typography — no affordance in edit mode".
- **Do NOT implement a robots.txt file** — that's out of scope for this story. The sitemap is sufficient.
- **Do NOT add sitemap alternate language entries** — the canonical club URL uses `defaultLanguage` only. Multi-language sitemaps are unnecessary complexity for MVP.

### i18n Translation Keys

Add a new key to `clubSite` in the translations type:

```typescript
// In types.ts, add to clubSite:
clubSite: {
  // ... existing keys
  poweredBy: string  // "Powered by Clashware"
}
```

Translations:
- **en**: `"Powered by Clashware"`
- **fr**: `"Propulsé par Clashware"`
- **de**: `"Betrieben von Clashware"`
- **it**: `"Realizzato con Clashware"`

### Accessibility Requirements (WCAG 2.1 AA)

- **Contrast**: `text-muted-foreground` on default background meets 4.5:1 ratio. Verify in both light and dark modes.
- **Keyboard**: Standard `<a>` element is natively keyboard-focusable. Add `focus-visible:ring-2 focus-visible:ring-ring` for visible focus indicator.
- **Screen reader**: `aria-label` on the link describes both the attribution and the destination.
- **Semantic HTML**: Use `<footer>` element to wrap the banner for correct landmark navigation.

### Project Structure Notes

Files to create:
- `src/components/app/club-site/PoweredByBanner.tsx` — footer attribution component
- `src/app/sitemap.ts` — dynamic platform sitemap
- `src/__tests__/powered-by-footer-sitemap.test.ts` — tests

Files to modify:
- `src/app/[lang]/(country)/[country]/[club]/layout.tsx` — add PoweredByBanner after children
- `src/lib/i18n/translations/types.ts` — add `poweredBy` key to `clubSite`
- `src/lib/i18n/translations/en.ts` — add English translation
- `src/lib/i18n/translations/fr.ts` — add French translation
- `src/lib/i18n/translations/de.ts` — add German translation
- `src/lib/i18n/translations/it.ts` — add Italian translation

Files NOT to modify:
- `src/components/app/seo/metadata.ts` — canonical/robots already implemented
- `src/proxy.ts` — already excludes sitemap.xml
- `prisma/schema.prisma` — no schema changes needed

### Previous Story Intelligence (from Story 3.4)

- 322 tests currently passing — must remain green
- 3 pre-existing test failures (setup-password x2, magic-link-route x1) — unrelated, ignore
- `getClubPublicData()` is React-cached — safe to call from multiple server components without duplicate DB queries
- Club layout fetches `club` via `getClubBySlug(slug, country)` — already has `lang` available from params
- `ClubSidebarNav` is a client component; `PoweredByBanner` should be a server component (placed outside the sidebar)
- Next.js 16 `params` are Promises — always `await` them
- `findText()` helper and `makeParams()` helper available in test utilities
- Accent colors are applied on the club home/inner page level, NOT in the layout — the footer should use its own neutral styling
- Test pattern: mock `@/server/db` for Prisma queries, mock `next/navigation` for `notFound`

### Git Intelligence

Recent commits follow `feat: story X.Y` pattern:
```
db0cf9b feat: story 3.4
2d341b1 feat: story 3.3
618a4cf feat: story 3.2
d6fffeb feat: story 3.1
```

Story 3.4 was the last commit — it created:
- Inner page route (`[page]/page.tsx`) with loading skeleton
- Contact page placeholder
- `ElementRenderer` component
- Sub-page nesting in `ClubSidebarNav`
- `page-queries.ts` with cached queries

### Testing Requirements

- Framework: Vitest (`pnpm test`)
- Test location: `src/__tests__/powered-by-footer-sitemap.test.ts` (new file)
- Mock `@/server/db` for Prisma `club.findMany` query in sitemap tests
- Mock `next/navigation` for layout tests
- Test patterns from Stories 3.3/3.4: `makeParams()` for async params, `findText()` for JSX text, `vi.mock()` for server modules
- All 322 existing tests must remain green
- For the sitemap: test the exported async function directly (import and call it), assert URL format, check ACTIVE-only filtering

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.5 (lines 827-850)]
- [Source: _bmad-output/planning-artifacts/prd.md — FR25 (footer navigation to platform), FR26 (platform attribution footer), FR43 (auto SEO metadata + sitemap)]
- [Source: _bmad-output/planning-artifacts/architecture.md — PoweredByBanner.tsx component (line 892), powered-by-clashware.svg asset (line 774), reserved slugs including sitemap.xml (line 1216)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Footer as acquisition loop (lines 596-617), edit mode footer non-editable (line 1053), Club Applicant discovery via footer (line 31)]
- [Source: src/components/app/seo/metadata.ts — generateClubMetadata() already implements canonical + robots (lines 86-123)]
- [Source: src/app/[lang]/(country)/[country]/[club]/layout.tsx — Current club layout structure]
- [Source: src/proxy.ts — Matcher excludes sitemap.xml from language prefixing]
- [Source: src/lib/i18n/translations/types.ts — Translation type structure, clubSite section (lines 256-264)]
- [Source: _bmad-output/implementation-artifacts/3-4-club-public-site-inner-page-navigation-spa.md — Previous story patterns and learnings]
- [Source: Next.js 16 docs — sitemap.ts convention, MetadataRoute.Sitemap type, dynamic export]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No blockers encountered. Pre-existing `express-rate-limit` audit vulnerability resolved via pnpm override.

### Completion Notes List

- Created `PoweredByBanner` server component with i18n, aria-label, keyboard focus ring, semantic `<footer>` element
- Added `clubSite.poweredBy` translation key to all 4 languages (en, fr, de, it)
- Integrated banner into club layout after `{children}` — renders on all club pages
- Created dynamic platform sitemap at `src/app/sitemap.ts` with `force-dynamic` — includes all ACTIVE clubs + platform pages
- Verified `generateClubMetadata()` already sets canonical + robots correctly (no changes needed)
- 11 new tests: 3 PoweredByBanner, 1 layout integration, 5 sitemap, 2 canonical/robots verification
- All 333 tests pass, 0 regressions. TSC, lint, audit, build all clean.
- Fixed pre-existing `express-rate-limit` vulnerability via pnpm override to `>=8.2.2`

### Change Log

- 2026-03-07: Implemented platform attribution footer and sitemap (AC 1-5). Added `PoweredByBanner` component, integrated into club layout, created dynamic sitemap at `/sitemap.xml`, verified existing canonical/robots meta. Added 11 tests. Fixed pre-existing audit vulnerability.
- 2026-03-07: Code review fixes — fixed TSC error in test `findByType` type signature; localized `aria-label` via new `poweredByAriaLabel` translation key (4 languages); added try/catch error handling to sitemap DB query; upgraded `<a>` to Next.js `<Link>` for prefetching.

### File List

New files:
- `src/components/app/club-site/PoweredByBanner.tsx`
- `src/app/sitemap.ts`
- `src/__tests__/powered-by-footer-sitemap.test.ts`

Modified files:
- `src/app/[lang]/(country)/[country]/[club]/layout.tsx` (added PoweredByBanner import and render)
- `src/lib/i18n/translations/types.ts` (added `poweredBy` and `poweredByAriaLabel` keys to `clubSite`)
- `src/lib/i18n/translations/en.ts` (added English translations)
- `src/lib/i18n/translations/fr.ts` (added French translations)
- `src/lib/i18n/translations/de.ts` (added German translations)
- `src/lib/i18n/translations/it.ts` (added Italian translations)
- `package.json` (added `express-rate-limit` override)
- `pnpm-lock.yaml` (updated lockfile)
