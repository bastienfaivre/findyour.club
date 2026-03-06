# Story 3.1: Platform Homepage, Country Navigation & Donation Page

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Public Visitor,
I want to land on a clear, fast-loading platform homepage that presents the directory as the primary product and lets me navigate to my country's directory,
so that I immediately understand this is where I find clubs and social activities.

## Acceptance Criteria

1. **Given** a visitor navigates to the root platform domain, **When** the page loads, **Then** it renders server-side with: a short declarative headline positioning the platform as the directory for clubs and social activities, a brief philosophy statement, `CountryButton` components for each active country (showing country name, flag icon, and club count), and aggregate platform statistics (total clubs, total countries).

2. **Given** the platform homepage, **Then** it scores >= 90 on Core Web Vitals (Lighthouse performance, SEO, accessibility) and includes full meta tags and Open Graph tags generated automatically.

3. **Given** a visitor clicks a `CountryButton`, **When** they are redirected to the country path (e.g., `platform-name.com/fr/ch`), **Then** the country directory page loads — routing is handled at the application layer via `lib/country.ts` and the `[lang]` segment, not DNS.

4. **Given** the platform site, **Then** it includes static pages: `/about` (platform philosophy — why the directory exists, the vision for social connection), and `/support` (donation page where visitors can contribute to the platform's funding through voluntary donations, plus a support form placeholder — full support form implemented in Epic 6) (FR50).

## Tasks / Subtasks

- [x] Task 1: Create SEO metadata utility (AC: 2)
  - [x] 1.1 Create `src/components/app/seo/metadata.ts` with `generatePlatformMetadata({ title, description, path, lang })` helper that returns a Next.js `Metadata` object with title, description, Open Graph tags, canonical URL, and `robots: "index, follow"`
  - [x] 1.2 Export `generateDirectoryMetadata()` for future use by Story 3.2 — takes country and optional filters
  - [x] 1.3 Use the `NEXT_PUBLIC_BASE_URL` env var (or `process.env.NEXT_PUBLIC_BASE_URL`) for canonical URL base; fall back to `http://localhost:3000` in dev

- [x] Task 2: Add i18n translation keys for homepage, about, and support pages (AC: 1, 4)
  - [x] 2.1 Add new keys to `src/lib/i18n/translations/types.ts`:
    - `platform.headline` — declarative headline (e.g., "Find your club")
    - `platform.philosophy` — short philosophy statement
    - `platform.stats.clubs` — "{count} clubs" label
    - `platform.stats.countries` — "{count} countries" label
    - `platform.exploreCountry` — "Explore clubs in {country}"
    - `platform.about.title` — "About" page title
    - `platform.about.content` — About page content (platform philosophy)
    - `platform.support.title` — "Support" page title
    - `platform.support.donationHeadline` — Donation section headline
    - `platform.support.donationText` — Donation explanation text
    - `platform.support.supportFormPlaceholder` — Placeholder text for upcoming support form (Epic 6)
    - `nav.about` — "About" nav label
    - `nav.support` — "Support" nav label
  - [x] 2.2 Add translations to all 4 language files (en.ts, fr.ts, de.ts, it.ts)

- [x] Task 3: Create `CountryButton` component (AC: 1, 3)
  - [x] 3.1 Create `src/components/app/directory/CountryButton.tsx` — server component (or simple presentational component used by a server page) accepting `{ country: string, countryName: string, clubCount: number, lang: string }`
  - [x] 3.2 Render: country flag icon (`aria-hidden`), country name, club count (`text-sm text-muted-foreground`), full clickable link
  - [x] 3.3 Wrap in a semantic `<a>` via Next.js `<Link>` to `/${lang}/${country}` — descriptive `aria-label` (e.g., "Explore clubs in Switzerland (12 clubs)")
  - [x] 3.4 States: default + hover (border highlight, subtle scale). Generous tap area (min 44x44px). Style with existing `Card` or equivalent — accessible focus ring, keyboard navigable

- [x] Task 4: Implement platform homepage (AC: 1, 2)
  - [x] 4.1 Replace TODO content in `src/app/[lang]/(platform)/page.tsx` with actual homepage
  - [x] 4.2 Fetch aggregate stats server-side: total active clubs (`prisma.club.count({ where: { status: 'ACTIVE' } })`), active clubs per country (group by), total active countries (distinct)
  - [x] 4.3 Render: headline (translated), philosophy statement (translated), `CountryButton` for each active country with club count, aggregate stats section (total clubs, total countries)
  - [x] 4.4 Export `generateMetadata()` using the SEO utility from Task 1
  - [x] 4.5 Ensure page is fully server-rendered (no `"use client"` — all data fetching in the RSC)

- [x] Task 5: Update platform layout navigation (AC: 1, 3, 4)
  - [x] 5.1 Update `src/app/[lang]/(platform)/layout.tsx` header nav to include links to `/about` and `/support` pages (using translated nav labels)
  - [x] 5.2 Keep existing LanguageSwitcher and login/apply links

- [x] Task 6: Create About page (AC: 4)
  - [x] 6.1 Create `src/app/[lang]/(platform)/about/page.tsx` — static server-rendered page
  - [x] 6.2 Content: platform philosophy statement, vision for social connection, why the directory exists — all from translations
  - [x] 6.3 Export `generateMetadata()` with appropriate title/description

- [x] Task 7: Create Support/Donation page (AC: 4, FR50)
  - [x] 7.1 Create `src/app/[lang]/(platform)/support/page.tsx` — static server-rendered page
  - [x] 7.2 Content: donation section explaining how to support the platform through voluntary donations (no payment processing in MVP — provide instructions for bank transfer or similar simple mechanism)
  - [x] 7.3 Support form placeholder section with "Coming soon" message (full implementation in Epic 6)
  - [x] 7.4 Export `generateMetadata()` with appropriate title/description

- [x] Task 8: Write tests (AC: 1-4)
  - [x] 8.1 Test homepage renders with headline, philosophy, country buttons, and stats
  - [x] 8.2 Test `CountryButton` links to correct country path
  - [x] 8.3 Test `generatePlatformMetadata()` returns correct meta tags
  - [x] 8.4 Test about and support pages render their content

- [x] Task 9: Run full test suite, typecheck, lint, build

## Dev Notes

### Architecture & Constraints

- **Prisma import**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'`
- **Rendering**: ALL platform site pages MUST be server-rendered (SSR) for SEO — no `"use client"` on page components. Client components only for interactive elements (LanguageSwitcher, etc.)
- **Route group**: Platform pages live in `src/app/[lang]/(platform)/` — the `(platform)` route group shares the platform layout with header, nav, and footer
- **URL pattern**: `/{lang}/` for platform pages, `/{lang}/{country}/` for country directory (Story 3.2), `/{lang}/{country}/{club}` for club sites
- **Country routing**: Country navigation uses `<Link href={/${lang}/${country}}>` — the `[country]` segment is validated by `isValidCountry()` from `src/lib/country.ts`. Currently only `'ch'` (Switzerland) is supported.
- **i18n**: Translations are type-safe. Add keys to `types.ts` first, then implement in all 4 files (en, fr, de, it). Use `resolveUILang(lang)` to normalize the language param. Load translations via `getTranslations(uiLang)`.
- **Server Action return type**: `{ success: true }` OR `{ success: false; error: string; code: 'SCREAMING_SNAKE_CASE' }` — never throw
- **Tailwind v4**: Use modern Tailwind utilities. No `@apply` in components — use utility classes directly.

### Key Database Queries

**Active clubs per country:**
```typescript
const clubsByCountry = await prisma.club.groupBy({
  by: ['country'],
  where: { status: 'ACTIVE' },
  _count: { id: true },
})
```

**Total active clubs:**
```typescript
const totalClubs = await prisma.club.count({
  where: { status: 'ACTIVE' },
})
```

**Distinct active countries:**
Derive from the `clubsByCountry` result — count the unique country codes.

### Key Existing Code to Reuse

| File | What to reuse |
|------|--------------|
| `src/app/[lang]/(platform)/page.tsx` | Replace existing TODO — this IS the homepage |
| `src/app/[lang]/(platform)/layout.tsx` | Extend nav with About + Support links |
| `src/lib/country.ts` | `SUPPORTED_COUNTRIES`, `COUNTRY_NAMES`, `isValidCountry()` — use for country button rendering |
| `src/lib/i18n/index.ts` | `resolveUILang()`, `getTranslations()` — standard i18n pattern |
| `src/lib/i18n/translations/types.ts` | Add new translation keys here first |
| `src/components/ui/card.tsx` | Reuse for CountryButton card styling |
| `src/components/ui/button.tsx` | Reuse for CTA buttons |
| `src/components/ui/badge.tsx` | Reuse for club count badges on CountryButton |
| `src/server/db.ts` | Prisma client singleton — import as `prisma` |
| `src/components/app/apply/ApplyForm.tsx` | Reference for how country data is used (country code -> name mapping) |

### Anti-Patterns to Avoid

- **Do NOT fetch data client-side** — all data for the homepage must be fetched server-side in the RSC (React Server Component). No `useEffect` + `fetch`.
- **Do NOT create a separate API route for homepage data** — fetch directly from Prisma in the server component.
- **Do NOT add `"use client"` to page components** — these are SSR pages for SEO. Only interactive leaf components (like LanguageSwitcher) should be client components.
- **Do NOT hardcode country data** — derive from `SUPPORTED_COUNTRIES` in `src/lib/country.ts` and actual DB club counts.
- **Do NOT create a payment processing system** — the donation page in MVP is informational only (explain how to donate, provide bank details or similar). No Stripe, no payment gateway.
- **Do NOT implement the support form** — just a placeholder. Full support form comes in Epic 6.
- **Do NOT add countries to `SUPPORTED_COUNTRIES`** — only `'ch'` is supported at launch. The architecture is extensible but only Switzerland is live.
- **Do NOT create a separate `[lang]/layout.tsx`** — the platform layout at `(platform)/layout.tsx` already handles the header. Don't introduce a competing layout.

### Responsive Layout (from UX spec)

- **Mobile (base)**: Country buttons wrap to 2-column grid; stats stacked
- **sm (640px)**: Country buttons 2-column
- **md (768px)**: 2-column grids; wider form layouts
- **lg (1024px)**: 3-column grids
- **xl (1280px)**: 4-5 column button grid; stats in a row
- **Max-width**: `max-w-7xl` (80rem) for homepage/directory layouts (not `max-w-5xl` which is for edit forms)
- **Philosophy-first**: Homepage shows philosophy before the Apply CTA — misaligned applicants self-select out

### Country Flag Emoji Implementation

Convert ISO 3166-1 alpha-2 country code to flag emoji using Unicode regional indicators:
```typescript
function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join('')
}
// 'ch' -> '🇨🇭'
```

This is a pure utility — no external library needed.

### SEO Metadata Pattern (Next.js 16)

Use Next.js `generateMetadata()` export in page files:
```typescript
import type { Metadata } from 'next'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return generatePlatformMetadata({
    title: 'Platform Name',
    description: '...',
    path: `/${lang}`,
    lang,
  })
}
```

### Platform Layout Navigation Structure

Current nav items: Home, Apply, My Clubs, Login/Logout, LanguageSwitcher

Add: About, Support

Order: Home | About | Support | Apply | ... (auth items) | LanguageSwitcher

### Project Structure Notes

Files to create:
- `src/components/app/seo/metadata.ts` — SEO metadata utility
- `src/components/app/directory/CountryButton.tsx` — country navigation component
- `src/app/[lang]/(platform)/about/page.tsx` — About page
- `src/app/[lang]/(platform)/support/page.tsx` — Support/Donation page
- `src/__tests__/platform-homepage.test.ts` — tests (or similar)

Files to modify:
- `src/app/[lang]/(platform)/page.tsx` — replace TODO with actual homepage
- `src/app/[lang]/(platform)/layout.tsx` — add About + Support nav links
- `src/lib/i18n/translations/types.ts` — add new translation keys
- `src/lib/i18n/translations/en.ts` — add English translations
- `src/lib/i18n/translations/fr.ts` — add French translations
- `src/lib/i18n/translations/de.ts` — add German translations
- `src/lib/i18n/translations/it.ts` — add Italian translations

### Previous Story Intelligence (from Story 2.4 / Epic 2)

- Server Action return pattern: `{ success: true }` or `{ success: false; error, code }` — consistent across all actions
- i18n keys go in `types.ts` first, then all 4 language files — type-safe approach enforces completeness
- Test framework: Vitest with `vi.mock()` for server modules
- 265 tests currently passing — must remain green
- 3 pre-existing failures in `setup-password.test.ts` (x2) and `magic-link-route.test.ts` (x1) — unrelated, ignore
- Email template pattern: inline CSS, 560px inner table — reference for any future email needs
- Toast messages use `{placeholder}` pattern with `.replace()`

### Git Intelligence

Recent commits follow `feat: story X.Y` pattern:
```
2e0335b feat: story 2.4
08652d2 feat: story 2.3
3640323 feat: story 2.2
c75791e feat: story 2.1
f67fd52 feat: story 2.0
```

### Testing Requirements

- Framework: Vitest (`pnpm test`)
- Test location: `src/__tests__/platform-homepage.test.ts` (new file)
- For server components: test data fetching logic and metadata generation
- Mock `@/server/db` for Prisma queries
- Test `CountryButton` renders correct link href and displays country info
- Test `generatePlatformMetadata` returns correct meta tags structure
- All 265 existing tests must remain green

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.1]
- [Source: _bmad-output/planning-artifacts/prd.md — FR20, FR21, FR25, FR26, FR43, FR50]
- [Source: _bmad-output/planning-artifacts/architecture.md — Rendering strategy (SSR for platform pages), SEO automation, i18n architecture, directory structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Platform homepage layout, CountryButton, About/Support pages]
- [Source: src/app/[lang]/(platform)/page.tsx — current TODO placeholder to replace]
- [Source: src/app/[lang]/(platform)/layout.tsx — platform layout with header nav]
- [Source: src/lib/country.ts — SUPPORTED_COUNTRIES, COUNTRY_NAMES, isValidCountry()]
- [Source: src/lib/i18n/ — translation system, types.ts, 4 language files]
- [Source: src/server/db.ts — Prisma client singleton]
- [Source: prisma/schema.prisma — Club model (status, country, slug), ClubStatus enum]
- [Source: src/components/ui/ — Card, Button, Badge reusable components]
- [Source: _bmad-output/implementation-artifacts/2-4-application-rejection-rejection-email.md — previous story patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Created `src/components/app/seo/metadata.ts` with `generatePlatformMetadata()` and `generateDirectoryMetadata()` helpers returning Next.js Metadata objects with title, description, OG tags, canonical URL, and robots directives. Uses `NEXT_PUBLIC_BASE_URL` env var with localhost fallback.
- Added `platform` section to i18n types and all 4 language files (en, fr, de, it) with: headline, philosophy, stats labels, exploreCountry, about (title + content), support (title, donationHeadline, donationText, supportFormPlaceholder). Added `nav.about` and `nav.support` keys.
- Created `CountryButton` component using Next.js `<Link>`, country flag emoji via Unicode regional indicators, accessible aria-label, hover/focus states, min 44x44px tap area.
- Replaced homepage TODO with full server-rendered page: fetches club stats via `prisma.club.groupBy()`, renders headline, philosophy, CountryButton grid (responsive 2-col to 4-col), and aggregate stats. Exports `generateMetadata()`.
- Updated platform layout nav: added About + Support links, restructured to proper `<nav>` element, kept LanguageSwitcher and auth links, widened to `max-w-7xl`.
- Created About page at `src/app/[lang]/(platform)/about/page.tsx` — server-rendered with translated content and metadata.
- Created Support page at `src/app/[lang]/(platform)/support/page.tsx` — donation section with informational text (no payment processing), support form placeholder for Epic 6.
- Added 12 new tests in `src/__tests__/platform-homepage.test.ts` covering: metadata generation (platform + directory), CountryButton link/aria-label, homepage rendering with DB queries, zero-clubs edge case, language fallback, about page, and support page.
- All 277 tests pass (265 existing + 12 new), TypeScript compiles cleanly, lint passes with 0 errors, no audit vulnerabilities, production build succeeds.
- Code review fixes (2026-03-06): Fixed broken login link (`/login` → `/auth/login`), replaced hardcoded English in CountryButton with translated `clubCountLabel` and `ariaLabel` props using `platform.exploreCountry` key, fixed stats double-count display, improved test assertions with content verification, removed redundant grid breakpoints.

### File List

New files:
- src/components/app/seo/metadata.ts
- src/components/app/directory/CountryButton.tsx
- src/app/[lang]/(platform)/about/page.tsx
- src/app/[lang]/(platform)/support/page.tsx
- src/__tests__/platform-homepage.test.ts

Modified files:
- src/app/[lang]/(platform)/page.tsx
- src/app/[lang]/(platform)/layout.tsx
- src/components/app/LanguageSwitcher.tsx
- src/lib/country.ts
- src/lib/i18n/translations/types.ts
- src/lib/i18n/translations/en.ts
- src/lib/i18n/translations/fr.ts
- src/lib/i18n/translations/de.ts
- src/lib/i18n/translations/it.ts

## Change Log

- 2026-03-06: Implemented platform homepage with server-rendered content, SEO metadata, country navigation, About page, Support/Donation page, and i18n for all 4 languages. Added 12 tests. All quality gates pass.
- 2026-03-06: Code review — fixed 7 issues (1 High, 4 Medium, 2 Low): broken login link, CountryButton i18n hardcoding, stats double-count, weak test assertions, dead translation key usage, redundant CSS. All quality gates re-verified.
- 2026-03-06: UX restyle — restyled homepage/layout to match UX design directions (hero, stats bar, country grid with sections). Added "Coming soon" countries (FR, DE, AT, IT) with dimmed styling. Converted LanguageSwitcher to dropdown with keyboard navigation. Added footer.
- 2026-03-06: Code review — fixed 7 issues (1 High, 3 Medium, 3 Low): updated story File List with missing files, replaced fragile stats.countries.replace hack with dedicated countriesLabel key, added keyboard navigation (arrow keys, Escape) to LanguageSwitcher dropdown, moved hardcoded "CHF 0" to translation, removed invalid aria-label from non-interactive span, parallelized two Prisma groupBy queries with Promise.all, strengthened zero-clubs test assertion.
