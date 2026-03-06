# Story 3.3: Club Public Site — Server-Rendered Home Page

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Public Visitor,
I want to view a club's public home page with their name, logo, welcome text, and navigation,
so that I can quickly understand who the club is and find the information I need.

## Acceptance Criteria

1. **Given** a visitor navigates to a club's URL path (e.g., `platform-name.com/fr/ch/ski-club-valais`), **When** the page loads, **Then** it renders server-side with: the club's logo, name (`<h1>`), welcome text, a primary CTA button linking to the Contact page, and the `ClubSidebarNav` with all active pages listed.

2. **Given** the club home page, **Then** it achieves Time to First Contentful Paint < 2 seconds on a standard broadband connection and scores >= 90 on Core Web Vitals.

3. **Given** a club with no logo uploaded, **Then** a monogram avatar (club name initial) is displayed as the logo placeholder.

4. **Given** a club has configured an external website link, **Then** the club home page displays a visible "Visit our website" link pointing to the external URL — opening in a new tab (FR47). **Note:** The `externalWebsiteUrl` field does NOT exist in the current Prisma schema — this AC is deferred until the schema is extended (Story 4.2). For now, skip this AC.

5. **Given** the club home page, **Then** it includes full JSON-LD structured data (Organization schema), Open Graph tags, and a canonical meta tag — all generated automatically from club data via `generateClubMetadata()` with zero admin configuration required (FR43).

6. **Given** a visitor navigates to a club slug that does not exist (or club is not ACTIVE), **Then** the Next.js `notFound()` function is called, serving the global 404 page.

## Tasks / Subtasks

- [x] Task 1: Restructure club route for public access (AC: 1, 6)
  - [x] 1.1 The current club layout at `src/app/[lang]/(country)/[country]/[club]/layout.tsx` enforces authentication (redirects to login). For public access, refactor: the layout should fetch the club by slug+country and call `notFound()` if not found or not ACTIVE, but should NOT require authentication. Pass club data to children via a React context or prop pattern.
  - [x] 1.2 Move the authentication + membership guard logic to a sub-layout or to the settings pages that need it (`settings/` route group). The club public page must be accessible by unauthenticated visitors.
  - [x] 1.3 Ensure the `TotpEnrollmentBanner` only renders when a session exists (conditional, not required).

- [x] Task 2: Add i18n translation keys for club public page (AC: 1, 3)
  - [x] 2.1 Add new keys to `src/lib/i18n/translations/types.ts`:
    - `clubSite.contactCta` — "Contact us" CTA button label
    - `clubSite.visitWebsite` — "Visit our website" external link label (for future use)
    - `clubSite.home` — "Home" navigation label
    - `clubSite.contact` — "Contact" navigation label
    - `clubSite.editSite` — "Edit site" admin button label (for future use)
    - `clubSite.menu` — "Menu" mobile hamburger aria-label
    - `clubSite.navigation` — "Club navigation" nav aria-label
  - [x] 2.2 Add translations to all 4 language files (en.ts, fr.ts, de.ts, it.ts)

- [x] Task 3: Create `generateClubMetadata()` SEO function (AC: 5)
  - [x] 3.1 Add `generateClubMetadata()` to `src/components/app/seo/metadata.ts`. Accepts: `{ clubName, clubDescription, clubLogoUrl, clubSlug, country, lang, activityTypeLabel }`.
  - [x] 3.2 Returns Next.js `Metadata` object with:
    - `title`: `{clubName} — {activityTypeLabel}` (or just `{clubName}` if no activity type)
    - `description`: `club.welcomeText` (first 160 chars) or fallback
    - `openGraph`: title, description, image (logoUrl), url (canonical), type 'website', locale
    - `alternates.canonical`: `{BASE_URL}/{lang}/{country}/{slug}`
    - `robots`: 'index, follow'
  - [x] 3.3 Add JSON-LD structured data as `other.script` in metadata (Organization schema):
    - `@type`: "Organization" (or "SportsOrganization" if applicable)
    - `name`: club name
    - `logo`: logoUrl (if present)
    - `url`: canonical club URL
    - `description`: welcomeText
    - `areaServed`: country name

- [x] Task 4: Create `ClubSidebarNav` component (AC: 1)
  - [x] 4.1 Create `src/components/app/club-site/ClubSidebarNav.tsx` — server component accepting `{ club: { name, slug, logoUrl, logoAlt, accentColor, pages }, lang, country, currentPath }`.
  - [x] 4.2 Desktop (md+): Fixed left sidebar (`w-[240px]`). Renders:
    - Top: club logo (40px circular) or monogram, club name — clickable link to club home
    - Navigation links: "Home" (always first, anchor) + active custom pages from `club.pages` sorted by `position`, + "Contact" (always last, anchor)
    - Active page: `font-medium` + left border in accent color (`border-l-2`)
    - `aria-current="page"` on active link
  - [x] 4.3 Mobile (<md): Hamburger button (top-left) that opens a full-height Sheet drawer (shadcn/ui Sheet, slides from left). Same content as desktop sidebar. Closes on navigation or backdrop tap.
  - [x] 4.4 Wrap navigation in `<nav aria-label="Club navigation">` semantic landmark.
  - [x] 4.5 The `ClubSidebarNav` is a client component (for mobile Sheet toggle state). Accept club data as props (serializable).

- [x] Task 5: Create `ClubHeroSection` component (AC: 1, 3)
  - [x] 5.1 Create `src/components/app/club-site/ClubHeroSection.tsx` — server component accepting `{ club: { name, logoUrl, logoAlt, welcomeText, accentColor }, lang, country, slug, ctaLabel, ctaHref }`.
  - [x] 5.2 Render centered layout:
    - Club logo (circular, `w-24 h-24`) via `next/image` or monogram fallback (club initial in accent color circle)
    - Club name as `<h1>` (`text-2xl sm:text-4xl font-bold`)
    - Welcome text below name (`text-base text-muted-foreground`, max-width ~600px centered)
    - Primary CTA button (link to Contact page) with accent color styling
  - [x] 5.3 Monogram: `<div>` with `flex items-center justify-center rounded-full bg-primary text-primary-foreground w-24 h-24 text-4xl font-bold` showing `club.name.charAt(0).toUpperCase()`

- [x] Task 6: Implement club public home page (AC: 1, 2, 5, 6)
  - [x] 6.1 Replace placeholder in `src/app/[lang]/(country)/[country]/[club]/page.tsx` with full implementation:
    - Fetch club data with all needed fields: `name`, `slug`, `country`, `logoUrl`, `logoAlt`, `welcomeText`, `accentColor`, `activityType`, `pages` (active, sorted by position)
    - Validate country via `isValidCountry()`, call `notFound()` if invalid
    - Call `notFound()` if club not found or status !== 'ACTIVE'
  - [x] 6.2 Render: `ClubHeroSection` + `ClubSidebarNav`
  - [x] 6.3 Export `generateMetadata()` using `generateClubMetadata()` — fetch club data, resolve activity type translation via `t.activityTypes[slug]`, return metadata with JSON-LD
  - [x] 6.4 Layout: sidebar on the left (md+), main content area on the right with `ClubHeroSection` centered. Use `max-w-4xl` for main content area.

- [x] Task 7: Apply accent color as CSS custom property (AC: 1)
  - [x] 7.1 In the club layout or page, set the club's `accentColor` as a CSS custom property on a wrapping `<div>` so that `bg-primary`, `text-primary`, `border-primary` classes use the club's chosen color.
  - [x] 7.2 Map the 8 preset accent colors (zinc, blue, green, red, violet, orange, rose, yellow) to HSL values for `--primary` and `--primary-foreground` CSS variables.

- [x] Task 8: Write tests (AC: 1-6)
  - [x] 8.1 Test `ClubHeroSection` renders club name as h1, welcome text, CTA link to contact page
  - [x] 8.2 Test `ClubHeroSection` monogram fallback when no logoUrl
  - [x] 8.3 Test `ClubHeroSection` renders logo via next/image when logoUrl present
  - [x] 8.4 Test `ClubSidebarNav` renders navigation links (Home + active pages + Contact)
  - [x] 8.5 Test `ClubSidebarNav` marks active page with aria-current="page"
  - [x] 8.6 Test club page calls `notFound()` for non-existent club slug
  - [x] 8.7 Test club page calls `notFound()` for invalid country
  - [x] 8.8 Test `generateClubMetadata()` returns correct title, description, openGraph, canonical, JSON-LD
  - [x] 8.9 Test club page renders ClubHeroSection and ClubSidebarNav with correct props
  - [x] 8.10 Test club layout is publicly accessible (no auth redirect for unauthenticated visitors)

- [x] Task 9: Run full test suite, typecheck, lint, build

## Dev Notes

### Architecture & Constraints

- **Prisma import**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'`
- **Rendering**: Club public page MUST be server-rendered (SSR) for SEO — no `"use client"` on the page component itself. `ClubSidebarNav` needs client-side state for mobile Sheet toggle.
- **Route location**: `src/app/[lang]/(country)/[country]/[club]/page.tsx` — this is an EXISTING placeholder file that must be replaced.
- **URL pattern**: `/{lang}/{country}/{club-slug}` (e.g., `/fr/ch/ski-club-valais`)

### CRITICAL: Authentication Restructure

The current club layout at `src/app/[lang]/(country)/[country]/[club]/layout.tsx` **requires authentication** and active membership — it redirects unauthenticated visitors to the login page. This MUST be restructured for Story 3.3:

**Current layout.tsx enforces:**
1. `getAuthSession()` → redirect to `/auth/login` if no session
2. TOTP verification check
3. Country validation → `notFound()`
4. Club existence check → `notFound()`
5. Active membership check → redirect to `/my-clubs`

**Required restructure:**
- The club layout should ONLY handle: country validation, club existence/ACTIVE check, and passing club data to children
- Authentication + membership guards should be moved to a `(admin)/` or `settings/` route group within `[club]/`
- The `TotpEnrollmentBanner` should only render conditionally when a session exists
- The public page and ClubSidebarNav "Edit site" button visibility should check session optionally (not require it)

**Approach options:**
1. **Route group split**: Create `[club]/(public)/page.tsx` for public access and `[club]/(admin)/settings/` for admin — the shared layout only validates club existence
2. **Simplify layout**: Remove auth requirements from the shared layout, add them to `settings/layout.tsx` or inline in settings pages

Option 1 is recommended. The shared `[club]/layout.tsx` should:
- Validate country, fetch club, call `notFound()` if not found/inactive
- Provide club data context to children
- NOT require authentication

### Key Database Queries

**Club with all needed fields for public page:**
```typescript
const club = await prisma.club.findUnique({
  where: { slug_country: { slug, country }, status: 'ACTIVE' },
  select: {
    id: true,
    name: true,
    slug: true,
    country: true,
    logoUrl: true,
    logoAlt: true,
    welcomeText: true,
    accentColor: true,
    defaultLanguage: true,
    activityType: { select: { slug: true } },
    pages: {
      where: { isActive: true },
      select: { id: true, slug: true, label: true, isAnchor: true, position: true, parentId: true },
      orderBy: { position: 'asc' },
    },
  },
})
```

**Note:** `getClubBySlug()` in `src/lib/server/club-queries.ts` currently only selects `{ id, name }`. For the public page, either extend it or create a new query. Be careful: `getClubBySlug` is cached with React `cache()` and used by both the layout and settings — changing its select shape may affect existing code. Prefer creating a new function `getClubPublicData()`.

### Key Existing Code to Reuse

| File | What to reuse |
|------|--------------|
| `src/lib/country.ts` | `isValidCountry()`, `getCountryName()` |
| `src/lib/i18n/index.ts` | `resolveUILang()`, `getTranslations()` |
| `src/lib/i18n/translations/types.ts` | Add `clubSite` keys here; `activityTypes` object has all translations |
| `src/components/app/seo/metadata.ts` | Add `generateClubMetadata()` here alongside existing functions |
| `src/components/app/directory/ClubCard.tsx` | Reference for monogram avatar pattern (40px size variant) |
| `src/components/ui/sheet.tsx` | Radix Sheet for mobile sidebar drawer |
| `src/components/ui/button.tsx` | CTA button styling |
| `src/server/db.ts` | Prisma client singleton — import as `prisma` |
| `src/server/auth.ts` | `getAuthSession()` — use optionally for "Edit site" button visibility |
| `src/lib/server/club-queries.ts` | `getClubBySlug()` reference; may need `getClubPublicData()` |
| `src/app/[lang]/(country)/[country]/page.tsx` | Reference for server component + `generateMetadata()` pattern |

### Anti-Patterns to Avoid

- **Do NOT require authentication in the club layout** — the club public page must be accessible by unauthenticated visitors. The current layout's auth guard must be restructured.
- **Do NOT fetch club data client-side** — initial render must be SSR for SEO.
- **Do NOT create a separate API route** — fetch directly from Prisma in the server component.
- **Do NOT modify `getClubBySlug()` select fields** — it's cached and used elsewhere. Create a new `getClubPublicData()` function instead.
- **Do NOT implement edit mode** — that's Story 4.1. The "Edit site" button in the sidebar should be present for authenticated admins but not functional yet (links to `?edit=true` which will be handled in 4.1).
- **Do NOT implement page content rendering** — that's Story 3.4. The home page shows the hero section only. Inner page navigation exists in the sidebar but actual page content is deferred.
- **Do NOT implement the "Powered by" footer** — that's Story 3.5.
- **Do NOT implement `externalWebsiteUrl`** — the field doesn't exist in the Prisma schema yet. That's part of Story 4.2 (Club Identity Configuration).
- **Do NOT use `activityType.name`** (doesn't exist) — use `t.activityTypes[slug]` from translations for localized display names.
- **Do NOT add `"use client"` to the page component** — only `ClubSidebarNav` needs client-side state (for the mobile Sheet drawer).
- **Do NOT hardcode accent colors** — map preset names to CSS variable values.

### Accent Color Mapping

The `accentColor` field stores a preset name string. Map to CSS HSL values:

```typescript
const ACCENT_COLORS: Record<string, { primary: string; primaryForeground: string }> = {
  zinc: { primary: '240 5.9% 10%', primaryForeground: '0 0% 98%' },
  blue: { primary: '221.2 83.2% 53.3%', primaryForeground: '210 40% 98%' },
  green: { primary: '142.1 76.2% 36.3%', primaryForeground: '355.7 100% 97.3%' },
  red: { primary: '0 84.2% 60.2%', primaryForeground: '0 0% 98%' },
  violet: { primary: '263.4 70% 50.4%', primaryForeground: '0 0% 98%' },
  orange: { primary: '24.6 95% 53.1%', primaryForeground: '0 0% 98%' },
  rose: { primary: '346.8 77.2% 49.8%', primaryForeground: '355.7 100% 97.3%' },
  yellow: { primary: '47.9 95.8% 53.1%', primaryForeground: '26 83.3% 14.1%' },
}
```

Apply via inline `style` on a wrapping `<div>`:
```tsx
<div style={{ '--primary': accentColors[club.accentColor].primary } as React.CSSProperties}>
```

### Responsive Layout

- **Desktop (md+):** Fixed sidebar (240px) on left; main content area on right
- **Mobile (<md):** Hamburger icon (top-left); full-width content; sidebar in Sheet drawer
- **Hero section**: Centered, full width of main content area, `px-4` padding on mobile
- **Logo size**: `w-24 h-24` (96px) on hero; `w-10 h-10` (40px) in sidebar
- **Min tap area**: 44x44px for all interactive elements

### ClubSidebarNav Component Spec

**Anatomy — Public Mode:**
- Top: club logo (40px) or monogram + club name (clickable link to home)
- Navigation: "Home" → custom active pages (sorted by position) → "Contact"
- Active page: `font-medium` + `border-l-2 border-primary` + `aria-current="page"`
- Hover: `bg-accent` (subtle background)
- Non-active: `text-muted-foreground`
- Bottom: "Edit site" ghost button (only if `isAdmin` prop is true — server-side auth check)

**Mobile:** Hamburger button → Sheet drawer (Radix, full height, slides from left)

**Accessibility:**
- `<nav aria-label="Club navigation">` semantic landmark
- `aria-current="page"` on active link
- Hamburger: `aria-expanded`, `aria-controls`, `aria-label="Menu"`
- Sheet: focus trapping via Radix

### JSON-LD Structured Data Format

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Ski Club Valais",
  "url": "https://platform-name.com/fr/ch/ski-club-valais",
  "logo": "https://r2.example.com/club-logo.png",
  "description": "Welcome text here...",
  "areaServed": {
    "@type": "Country",
    "name": "Switzerland"
  }
}
```

Embed in metadata via `other` field or as a `<script type="application/ld+json">` in the page.

### Project Structure Notes

Files to create:
- `src/components/app/club-site/ClubHeroSection.tsx` — hero section (logo, name, welcome, CTA)
- `src/components/app/club-site/ClubSidebarNav.tsx` — sidebar navigation (public mode only for now)
- `src/__tests__/club-public-page.test.ts` — tests

Files to modify:
- `src/app/[lang]/(country)/[country]/[club]/layout.tsx` — remove auth requirement, add public access
- `src/app/[lang]/(country)/[country]/[club]/page.tsx` — replace placeholder with full implementation
- `src/components/app/seo/metadata.ts` — add `generateClubMetadata()` with JSON-LD
- `src/lib/i18n/translations/types.ts` — add `clubSite` translation keys
- `src/lib/i18n/translations/en.ts` — add English translations
- `src/lib/i18n/translations/fr.ts` — add French translations
- `src/lib/i18n/translations/de.ts` — add German translations
- `src/lib/i18n/translations/it.ts` — add Italian translations

Files to potentially create/modify for auth restructure:
- `src/app/[lang]/(country)/[country]/[club]/settings/layout.tsx` — new file, moves auth guard here
- `src/lib/server/club-queries.ts` — add `getClubPublicData()` function

### Previous Story Intelligence (from Story 3.2)

- ClubCard already has monogram avatar pattern — reuse for sidebar (40px) and hero (96px) sizes
- `Promise.all()` used for parallel data fetching — use same pattern if multiple queries needed
- i18n keys go in `types.ts` first, then all 4 language files — type-safe approach enforces completeness
- `activityTypes` translation object already has all 14 types translated in all 4 languages
- Test pattern: `makeParams()` helper for async params, `findText()` for JSX tree text extraction, `vi.mock()` for server modules
- 290 tests currently passing (per Story 3.2 completion notes) — must remain green
- 3 pre-existing test failures (setup-password x2, magic-link-route x1) — unrelated, ignore
- Code review from Story 3.2 found issues with hardcoded English — always use translations
- `generateDirectoryMetadata()` pattern in metadata.ts is the template for `generateClubMetadata()`
- Next.js 16 `searchParams` and `params` are Promises — always `await` them

### Git Intelligence

Recent commits follow `feat: story X.Y` pattern:
```
618a4cf feat: story 3.2
d6fffeb feat: story 3.1
2e0335b feat: story 2.4
```

Story 3.2 created components this story builds on:
- `src/components/app/directory/ClubCard.tsx` — monogram avatar pattern to reuse
- `src/components/app/directory/DirectoryFilters.tsx` — reference for client component with Sheet/Select pattern
- `src/app/[lang]/(country)/[country]/page.tsx` — country directory with SSR + metadata pattern

### Testing Requirements

- Framework: Vitest (`pnpm test`)
- Test location: `src/__tests__/club-public-page.test.ts` (new file)
- Mock `@/server/db` for Prisma queries (`prisma.club.findUnique`)
- Mock `@/server/auth` for `getAuthSession()` (returns null for public access tests)
- Mock `next/navigation` for `notFound` and `redirect`
- Test ClubHeroSection renders name as h1, welcome text, CTA
- Test monogram fallback when no logo
- Test ClubSidebarNav renders correct nav links
- Test page calls `notFound()` for non-existent club
- Test metadata generation with JSON-LD
- Test page is publicly accessible without authentication
- All 290 existing tests must remain green

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.3 (line 774)]
- [Source: _bmad-output/planning-artifacts/architecture.md — Club route structure, SSR rendering strategy, SEO metadata, ClubSidebarNav spec, ClubHeroSection spec, multi-tenant scoping]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Club home page wireframe, sidebar nav anatomy, monogram avatar spec, CTA button spec, mobile responsive behavior]
- [Source: prisma/schema.prisma — Club model (line 182), Page model (line 305)]
- [Source: src/app/[lang]/(country)/[country]/[club]/layout.tsx — Current auth guard that must be restructured]
- [Source: src/app/[lang]/(country)/[country]/[club]/page.tsx — Current placeholder to replace]
- [Source: src/components/app/seo/metadata.ts — Existing metadata helpers, add generateClubMetadata()]
- [Source: src/lib/server/club-queries.ts — getClubBySlug() cached query, create getClubPublicData()]
- [Source: src/components/app/directory/ClubCard.tsx — Monogram avatar pattern to reuse]
- [Source: _bmad-output/implementation-artifacts/3-2-country-directory-with-filtering.md — Previous story patterns and learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Restructured club layout to remove auth requirement, enabling public access to club pages. Auth guard moved to `settings/layout.tsx`.
- Added `clubSite` i18n keys to all 4 language files (en, fr, de, it) with type-safe enforcement.
- Created `generateClubMetadata()` and `generateClubJsonLd()` for SEO — Open Graph, canonical URL, and JSON-LD Organization schema.
- Created `ClubSidebarNav` client component with desktop fixed sidebar (240px) and mobile Sheet drawer (hamburger menu).
- Created `ClubHeroSection` server component with logo/monogram, h1 club name, welcome text, and CTA button.
- Created `getClubPublicData()` cached query (separate from `getClubBySlug()` to avoid breaking cached select shape).
- Implemented accent color mapping (8 presets: zinc, blue, green, red, violet, orange, rose, yellow) via CSS custom properties.
- Full SSR page with `generateMetadata()` export — no client-side data fetching.
- AC4 (externalWebsiteUrl) intentionally deferred per story spec — field doesn't exist in schema yet.
- 1 pre-existing audit vulnerability (express-rate-limit in shadcn dev dependency) — not introduced by this story.
- 302 tests passing (12 new), tsc clean, lint clean, build succeeds.

### Change Log

- 2026-03-06: Implemented club public site server-rendered home page with sidebar navigation, hero section, SEO metadata, JSON-LD, accent colors, and public access restructure.
- 2026-03-06: Code review fixes — XSS sanitization on JSON-LD output, TypeScript errors in tests, getClubBySlug now filters by ACTIVE status, split ClubMetadataOptions/ClubJsonLdOptions types, removed unused parentId from query, exported prop types, refactored ClubSidebarNav to accept clubBase prop.
- 2026-03-06: Post-review enhancements — Added location data (city + canton) to `getClubPublicData` query (swissLocation with cantonCode and translations). Added `location` prop to `ClubSidebarNav` displayed under club name/logo in sidebar. Seed data updated with 3 clubs in distinct cantons (VS, VD, ZH) with proper SwissLocation → Location chain. Club name in sidebar uses `leading-tight` instead of `truncate` for natural line wrapping.
- 2026-03-06: Second code review fixes — Fixed `t` variable shadowing, added location prop test coverage (303 tests), removed unused `accentColor` from sidebar props, added `prisma/seed.ts` to File List.

### Senior Developer Review (AI)

**Reviewed by:** Claude Opus 4.6 (adversarial code review)
**Date:** 2026-03-06
**Outcome:** Approved (all issues fixed)

Issues found and fixed:
- **H1 (Security):** XSS via `dangerouslySetInnerHTML` in JSON-LD — `</script>` breakout. Fixed with `.replace(/</g, '\\u003c')`.
- **H2 (TypeScript):** 5 tsc errors in test file from overly narrow function type. Fixed with `Function` type + eslint-disable.
- **M1 (Logic):** `getClubBySlug` didn't filter by `status: 'ACTIVE'` — layout could render for inactive clubs. Changed from `findUnique` to `findFirst` with ACTIVE filter.
- **M2 (API design):** `countryName` accepted but unused in `generateClubMetadata`. Split into `ClubMetadataOptions` (no countryName) and `ClubJsonLdOptions` (with countryName).
- **M3 (Type safety):** `parentId` selected in query but not in component's `PageLink` type. Removed from query select.
- **L1:** Prop types not exported. Added `export` to `ClubHeroSectionProps` and `ClubSidebarNavProps`.
- **L2:** `NavLinks` reconstructed `clubBase` from `lang`/`country`/`slug`. Refactored to accept `clubBase` as prop, removed `lang`/`country` from `ClubSidebarNavProps`.

Safety checks post-fix: tsc clean, lint clean, build clean, 302/302 tests pass.

**Second review (post location-in-sidebar enhancement):**

**Reviewed by:** Claude Opus 4.6 (adversarial code review)
**Date:** 2026-03-06
**Outcome:** Approved (all issues fixed)

Issues found and fixed:
- **M1 (Code quality):** Variable shadowing — `t` callback parameter in `translations.find(t => ...)` shadowed outer `t` (translations object). Renamed to `tr`.
- **M2 (Test coverage):** No tests for `location` prop on `ClubSidebarNav`. Added assertion for `'Sion, VS'` value and new test for `null` location case.
- **M3 (Documentation):** `prisma/seed.ts` missing from story File List. Added.
- **L1 (Dead code):** `club.accentColor` passed to `ClubSidebarNav` but never used. Removed from prop type and page.

Safety checks post-fix: tsc clean, lint clean, build clean, 303/303 tests pass.

### File List

New files:
- src/components/app/club-site/ClubHeroSection.tsx
- src/components/app/club-site/ClubSidebarNav.tsx
- src/components/app/club-site/accent-colors.ts
- src/components/ui/sheet.tsx (shadcn/ui component)
- src/app/[lang]/(country)/[country]/[club]/settings/layout.tsx
- src/__tests__/club-public-page.test.ts

Modified files:
- src/app/[lang]/(country)/[country]/[club]/layout.tsx (removed auth requirement)
- src/app/[lang]/(country)/[country]/[club]/page.tsx (replaced placeholder with full implementation)
- src/components/app/seo/metadata.ts (added generateClubMetadata, generateClubJsonLd)
- src/lib/server/club-queries.ts (added getClubPublicData, updated getClubBySlug to filter by ACTIVE)
- src/lib/i18n/translations/types.ts (added clubSite keys)
- src/lib/i18n/translations/en.ts (added clubSite translations)
- src/lib/i18n/translations/fr.ts (added clubSite translations)
- src/lib/i18n/translations/de.ts (added clubSite translations)
- src/lib/i18n/translations/it.ts (added clubSite translations)
- src/__tests__/club-layout-guard.test.ts (updated for new public layout + findFirst)
- src/__tests__/invite-editor.test.ts (updated mock: club.findUnique → findFirst)
- src/__tests__/revoke-access.test.ts (updated mock: club.findUnique → findFirst)
- src/__tests__/transfer-ownership.test.ts (updated mock: club.findUnique → findFirst)
- prisma/seed.ts (added 3 SwissLocations, 3 Locations, 3rd club, linked clubs to locations)
