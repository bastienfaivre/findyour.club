# Story 3.7: Public Layout Shell — Top Navbar, Centered Container & Footer

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Public Visitor,
I want all public pages to share a consistent layout with a sticky top navbar, centered content, and a standard footer,
so that the platform feels cohesive and professionally designed across every public surface.

## Acceptance Criteria

1. **Given** any public page (platform homepage, country directory, club public site), **When** the page loads, **Then** it renders within a shared `PublicLayout` component that provides: a sticky top `PublicNavbar`, a centered content container (`max-w-[1200px] mx-auto px-6 lg:px-8`), and a `PublicFooter`.

2. **Given** the `PublicNavbar`, **Then** it renders with: a contextual title on the left (platform name on platform pages, country name on country pages, club name on club pages — passed as a prop), navigation links centered, and a primary CTA button on the right. The navbar is sticky (`sticky top-0 z-50`) and becomes opaque/blurred on scroll.

3. **Given** the `PublicNavbar` on a mobile viewport (< `lg` breakpoint), **Then** the navigation links collapse into a hamburger menu that opens a `Sheet` drawer from the right. The hamburger button has `aria-expanded` and `aria-controls` attributes.

4. **Given** the `PublicFooter`, **Then** it renders a multi-column layout with: platform links (About, Support/Donate), legal links (Privacy, Terms), the theme toggle from Story 3.6, and a copyright line. On club pages, a "Powered by [Platform]" attribution link is included.

5. **Given** the centered content container, **Then** content never touches the viewport edges on desktop — generous horizontal margins (`px-6` base, `lg:px-8` on large screens) ensure the Dub.co-inspired breathable layout. Vertical spacing between major sections uses `py-16 lg:py-24` for generous separation.

6. **Given** the `PublicLayout`, **Then** it is accessible: `<nav>` landmark on the navbar, `<main>` landmark on the content area, `<footer>` landmark on the footer. Skip link ("Skip to main content") is the first focusable element.

## Tasks / Subtasks

- [x] Task 1: Create `PublicNavbar` component (AC: 2, 3, 6)
  - [x] 1.1 Create `src/components/layout/public-navbar.tsx` as a server component that accepts props: `title: string`, `navItems: Array<{ label: string, href: string }>`, `ctaLabel?: string`, `ctaHref?: string`, `lang: string`. The `lang` prop is needed for the `LanguageSwitcher`.
  - [x] 1.2 Render a `<nav>` element with `aria-label` from translations (`nav.mainNavigation` or similar). Use `sticky top-0 z-50` positioning. Background: `bg-background/80 backdrop-blur-sm border-b` for the opaque/blurred scroll effect.
  - [x] 1.3 Inside the nav, render a flex container constrained to `max-w-[1200px] mx-auto px-6 lg:px-8`. Left: contextual title as a link (to `/{lang}` for platform, `/{lang}/{country}` for country, `/{lang}/{country}/{club}` for club). Center: nav links with `aria-current="page"` on active item. Right: CTA button (shadcn `Button` with `asChild` wrapping a `Link`).
  - [x] 1.4 Include the `LanguageSwitcher` in the desktop navbar (right side, before CTA).
  - [x] 1.5 Create a client sub-component `MobileNavMenu` (`src/components/layout/mobile-nav-menu.tsx`) using shadcn `Sheet` (side="right"). Render a hamburger `Button` (icon-only, `Menu` lucide icon) visible only below `lg` breakpoint (`lg:hidden`). The `Sheet` contains the nav links, language switcher, and CTA. Hamburger button has `aria-expanded` and `aria-controls` attributes.
  - [x] 1.6 Desktop nav links hidden below `lg` (`hidden lg:flex`). Mobile hamburger hidden at `lg` and above (`lg:hidden`).

- [x] Task 2: Create `PublicFooter` component (AC: 4, 6)
  - [x] 2.1 Create `src/components/layout/public-footer.tsx` as a server component that accepts props: `lang: string`, `showPoweredBy?: boolean` (for club pages).
  - [x] 2.2 Render a `<footer>` element. Inside, a container constrained to `max-w-[1200px] mx-auto px-6 lg:px-8`.
  - [x] 2.3 Multi-column link layout (responsive: stacked on mobile, grid on desktop). Column 1: Platform links (About `/{lang}/about`, Support `/{lang}/support`). Column 2: Legal links (Privacy `/{lang}/privacy`, Terms `/{lang}/terms`). Column 3 (or inline): Theme toggle from Story 3.6.
  - [x] 2.4 If `showPoweredBy` is true, render the existing `PoweredByBanner` component (from Story 3.5) within the footer.
  - [x] 2.5 Copyright line: `"© {year} Clashware"` (use `new Date().getFullYear()`).
  - [x] 2.6 Pass translations to `ThemeToggle` from the server component (same pattern as Story 3.6 — `getTranslations(lang).theme`).

- [x] Task 3: Create `PublicLayout` shell component (AC: 1, 5, 6)
  - [x] 3.1 Create `src/components/layout/public-layout.tsx` as a server component that accepts props: `children: React.ReactNode`, `navbarProps: PublicNavbarProps`, `footerProps: PublicFooterProps`.
  - [x] 3.2 Render the skip link as the first focusable element: `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring">Skip to main content</a>`.
  - [x] 3.3 Render `PublicNavbar` with provided props.
  - [x] 3.4 Render `<main id="main-content" className="flex-1">` wrapping `{children}`. The centered container (`max-w-[1200px] mx-auto px-6 lg:px-8`) can be applied either here on `<main>` or left to individual pages depending on whether some pages need full-bleed sections (hero backgrounds, etc.). **Decision: Apply padding on `<main>` but NOT `max-w-[1200px]` — let pages control their own max-width since some pages (like the homepage hero) may want full-bleed backgrounds. Pages use a `<div className="max-w-[1200px] mx-auto">` wrapper around their content sections.**
  - [x] 3.5 Render `PublicFooter` with provided props.
  - [x] 3.6 Outer wrapper: `<div className="flex min-h-screen flex-col">` to ensure footer sticks to bottom on short pages.

- [x] Task 4: Integrate into platform layout (AC: 1)
  - [x] 4.1 Refactor `src/app/[lang]/(platform)/layout.tsx` to use `PublicLayout` instead of inline navbar/footer markup. Pass: `title="Clashware"` (or from translations), `navItems` for About + Support, `ctaLabel` for "Apply", `ctaHref` to `/{lang}/apply`, `lang`.
  - [x] 4.2 Remove the existing inline `<header>`, `<main>`, `<footer>` markup — replaced by `PublicLayout`.
  - [x] 4.3 Ensure all existing platform pages (homepage, about, support, apply) still render correctly with the new layout.

- [x] Task 5: Create country directory layout (AC: 1)
  - [x] 5.1 Create `src/app/[lang]/(country)/[country]/layout.tsx` — this file does NOT currently exist. Use `PublicLayout` with: `title` = country display name (from translations or helper), `navItems` empty or minimal, `ctaLabel` = "Apply" linking to `/{lang}/apply`, `lang`.
  - [x] 5.2 Validate the country param using `isValidCountry()` and return `notFound()` if invalid.
  - [x] 5.3 Ensure the country directory page (`page.tsx`) renders correctly within the new layout.

- [x] Task 6: Update club site layout to use PublicLayout (AC: 1, 4)
  - [x] 6.1 Refactor `src/app/[lang]/(country)/[country]/[club]/layout.tsx` to wrap content in `PublicLayout` with: `title` = club name (from DB), `navItems` = club's active pages, `ctaLabel` = "Contact" linking to club contact page, `lang`, `showPoweredBy: true`.
  - [x] 6.2 The existing `ClubSidebarNav` component for club inner-page navigation should be evaluated: the new top navbar replaces the sidebar for public pages. The sidebar navigation was from Story 3.4 — it may need to be replaced by the top navbar nav links for consistency with the Dub.co-inspired centered layout. **Decision: Replace the sidebar with top navbar navigation for club public pages. The navbar `navItems` prop receives the club's active pages.**
  - [x] 6.3 Keep `TotpEnrollmentBanner` if it exists (auth-related, remains above the layout or within it).
  - [x] 6.4 Pass `showPoweredBy: true` to `PublicFooter` so the "Powered by" attribution is included in the footer on club pages.

- [x] Task 7: Add i18n translation keys (AC: 2, 3, 4, 6)
  - [x] 7.1 Add to `types.ts` under a new `layout` section: `{ skipToContent: string, mainNavigation: string, openMenu: string, closeMenu: string, copyright: string, platformLinks: string, legalLinks: string, privacy: string, terms: string }`.
  - [x] 7.2 Add translations to all 4 language files (en, fr, de, it).
  - [x] 7.3 Re-use existing translation keys where possible: `nav.about`, `nav.support`, `nav.apply`, `theme.*`, `clubSite.poweredBy`.

- [x] Task 8: Write tests (AC: 1-6)
  - [x] 8.1 Test `PublicNavbar` renders `<nav>` with `aria-label`, title, nav links, CTA button.
  - [x] 8.2 Test `PublicNavbar` renders `LanguageSwitcher`.
  - [x] 8.3 Test `MobileNavMenu` renders hamburger button with `aria-expanded`.
  - [x] 8.4 Test `PublicFooter` renders `<footer>`, platform links, legal links, theme toggle, copyright.
  - [x] 8.5 Test `PublicFooter` renders `PoweredByBanner` when `showPoweredBy=true` and hides it when false.
  - [x] 8.6 Test `PublicLayout` renders skip link, navbar, `<main id="main-content">`, footer.
  - [x] 8.7 Test platform layout uses `PublicLayout`.
  - [x] 8.8 Test club layout uses `PublicLayout` with `showPoweredBy: true`.
  - [x] 8.9 Run `pnpm test` — all existing tests (341+) must pass.
  - [x] 8.10 Run `pnpm typecheck && pnpm lint && pnpm build` — all must pass.

## Dev Notes

### Architecture & Constraints

- **Prisma import**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'`
- **Package manager**: pnpm — accessed via `bash -c 'NVM_DIR="/Users/bastienfaivre/.nvm" && source "$NVM_DIR/nvm.sh" && pnpm ...'`
- **Next.js 16**: `params` are Promises — always `await` them in server components (e.g., `const { lang } = await params`)
- **Tailwind v4**: No `tailwind.config.ts`. All theming via `@theme inline` blocks in `globals.css`. Dark mode variant: `@custom-variant dark (&:is(.dark *))`.
- **shadcn/ui style**: "new-york" variant with zinc base color, CSS variables enabled. Components in `src/components/ui/` are CLI-managed — do NOT manually edit them.
- **Server vs Client components**: Layout shell components (`PublicLayout`, `PublicNavbar`, `PublicFooter`) should be server components. Only the `MobileNavMenu` (Sheet drawer with state) and `ThemeToggle` need `"use client"`.

### CRITICAL: Refactoring the Platform Layout

The current `src/app/[lang]/(platform)/layout.tsx` already has an inline navbar + footer implementation. This story **replaces** that inline markup with the shared `PublicLayout` component. Key things to preserve during refactoring:

- The `LanguageSwitcher` is already rendered in the current platform navbar — ensure it's included in the new `PublicNavbar`.
- The current navbar links: About, Support, Apply CTA — these become `navItems` and `ctaLabel`/`ctaHref` props.
- The current footer has copyright text and About/Support links — the new `PublicFooter` is a richer replacement.
- The current header uses `h-[52px]` height — the new navbar should be similar height for consistency.

### CRITICAL: Club Site Layout Migration

The current club site layout (`src/app/[lang]/(country)/[country]/[club]/layout.tsx`) uses a **sidebar navigation** pattern (`ClubSidebarNav`) from Story 3.4. Story 3.7 introduces a **top navbar** pattern (Dub.co-inspired). This is a visual architecture change:

- **Before**: Sidebar (desktop) + Sheet hamburger (mobile) for club page navigation
- **After**: Top navbar with inline nav links (desktop) + Sheet hamburger (mobile) for club page navigation

The `ClubSidebarNav` component may become unused after this story. However, **do NOT delete it** — Story 3.8 (Refactor Existing Public Pages to New Layout) will handle cleanup. For this story, just stop rendering it in the club layout and use `PublicLayout` instead.

The club layout currently also renders:
- `TotpEnrollmentBanner` — keep this (render before `PublicLayout` or inside it)
- `PoweredByBanner` — moves into `PublicFooter` via the `showPoweredBy` prop

### CRITICAL: Country Layout Creation

There is currently **no** `src/app/[lang]/(country)/[country]/layout.tsx`. The country directory page renders without a shared layout shell. This story creates that layout file using `PublicLayout`.

The country layout must:
- Validate `[country]` param using `isValidCountry()` from `src/lib/country.ts`
- Return `notFound()` for invalid countries
- Pass the country display name as the navbar `title`

### CRITICAL: Centered Container Strategy

The `max-w-[1200px]` centered container must NOT be applied as a hard constraint on `<main>` because some pages need full-bleed backgrounds (hero sections with colored backgrounds that span the full viewport). Instead:

- `PublicLayout` applies `px-6 lg:px-8` on `<main>` for consistent horizontal padding
- Individual pages/sections wrap their content in `<div className="max-w-[1200px] mx-auto">` where centering is needed
- Full-bleed sections (hero backgrounds) omit the max-width wrapper but still pad content inside

This matches the Dub.co pattern where hero sections have full-width colored backgrounds but the text content within is centered.

### CRITICAL: Mobile Navigation

The `Sheet` component from shadcn/ui is already installed (`src/components/ui/sheet.tsx`). The `MobileNavMenu` client component should:

- Use `Sheet` with `side="right"`
- Render same nav links + LanguageSwitcher + CTA as the desktop navbar
- Close on navigation (use `onOpenChange` or `SheetClose`)
- Hamburger icon: `Menu` from lucide-react (already in deps)
- Close icon: `X` from lucide-react
- `aria-expanded` on the trigger, `aria-controls` pointing to the sheet content ID

### CRITICAL: Scroll-Aware Navbar Background

The navbar should have a visual indicator when the user scrolls (becomes opaque/blurred). Use `bg-background/80 backdrop-blur-sm` for the glass-morphism effect. This works without JavaScript — the opacity + blur are CSS-only. If a more dynamic scroll effect is desired (e.g., add/remove border on scroll), a small client component wrapper or CSS approach can be used, but the simpler CSS-only approach is preferred for this story.

Alternative: Use `border-b border-border/50` that's always visible + `bg-background/95 backdrop-blur-sm` as the base style. This avoids needing scroll detection entirely while still looking polished.

### Key Existing Code Relevant to This Story

| File | What it provides | Action needed |
|------|-----------------|---------------|
| `src/app/[lang]/(platform)/layout.tsx` | Current inline navbar + footer | **Refactor** to use `PublicLayout` |
| `src/app/[lang]/(country)/[country]/[club]/layout.tsx` | Current sidebar-based club layout | **Refactor** to use `PublicLayout` |
| `src/app/[lang]/(country)/[country]/layout.tsx` | Does not exist | **Create** with `PublicLayout` |
| `src/components/app/LanguageSwitcher.tsx` | Language dropdown (client component) | **Reuse** in `PublicNavbar` |
| `src/components/ui/theme-toggle.tsx` | Theme toggle (client component) | **Reuse** in `PublicFooter` |
| `src/components/app/club-site/PoweredByBanner.tsx` | "Powered by" attribution | **Reuse** in `PublicFooter` (conditional) |
| `src/components/app/club-site/ClubSidebarNav.tsx` | Sidebar nav for club pages | **Stop rendering** (replaced by top navbar) |
| `src/components/app/club-site/ClubHeroSection.tsx` | Club hero with logo, name, CTA | **No change** — renders inside `PublicLayout`'s `<main>` |
| `src/components/ui/sheet.tsx` | Sheet drawer component | **Reuse** for `MobileNavMenu` |
| `src/components/ui/button.tsx` | Button component | **Reuse** for CTA and hamburger |
| `src/lib/i18n/translations/types.ts` | Translation type definitions | **Add** layout section keys |
| `src/lib/i18n/translations/*.ts` | Translation files (en, fr, de, it) | **Add** layout translations |
| `src/lib/country.ts` | `isValidCountry()` validator | **Use** in country layout |
| `src/lib/i18n/index.ts` | `resolveUILang()`, `getTranslations()` | **Use** in all layout components |

### Root Layout Current Structure (from Story 3.6)

```tsx
// src/app/layout.tsx — current (after Story 3.6):
import { ThemeProvider } from '@/components/providers/theme-provider'

export default async function RootLayout({ children }) {
  const lang = await getLanguage()
  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={...}>
        <ThemeProvider>
          {children}
          <DevAuthPanel />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

No changes needed to root layout for this story.

### Current Platform Layout Structure (will be refactored)

```tsx
// src/app/[lang]/(platform)/layout.tsx — BEFORE Story 3.7:
// - Inline sticky header (h-[52px]) with Clashware brand, About, Support, LanguageSwitcher, Apply CTA
// - <main className="flex-1"> wrapping children
// - Inline footer with copyright + About/Support links
// - px-10 padding on header/footer
```

After Story 3.7:
```tsx
// src/app/[lang]/(platform)/layout.tsx — AFTER Story 3.7:
import { PublicLayout } from '@/components/layout/public-layout'

export default async function PlatformLayout({ children, params }) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  return (
    <PublicLayout
      navbarProps={{
        title: 'Clashware',
        titleHref: `/${lang}`,
        navItems: [
          { label: t.nav.about, href: `/${lang}/about` },
          { label: t.nav.support, href: `/${lang}/support` },
        ],
        ctaLabel: t.nav.apply,
        ctaHref: `/${lang}/apply`,
        lang,
      }}
      footerProps={{
        lang,
        showPoweredBy: false,
      }}
    >
      {children}
    </PublicLayout>
  )
}
```

### Anti-Patterns to Avoid

- **Do NOT modify `globals.css`** — OKLCH tokens and dark mode are already complete from Story 3.6.
- **Do NOT modify `src/components/ui/` files** — these are shadcn CLI-managed. If you need a new component (e.g., `Sheet` is already there), install via `pnpm dlx shadcn@latest add <component>`.
- **Do NOT create `tailwind.config.ts`** — Tailwind v4 uses inline `@theme` blocks.
- **Do NOT delete `ClubSidebarNav`** — it may still be referenced elsewhere. Just stop rendering it in the club layout. Story 3.8 handles cleanup.
- **Do NOT apply `max-w-[1200px]` directly on `<main>`** — some pages need full-bleed sections. Let pages control their own max-width.
- **Do NOT use client-side scroll listeners for navbar effects** — use CSS-only `bg-background/80 backdrop-blur-sm` approach.
- **Do NOT hardcode strings** — all user-visible text must use i18n translations.
- **Do NOT use `<div role="navigation">`** — use semantic `<nav>` element.
- **Do NOT forget `aria-current="page"` on active nav links** — required by WCAG.
- **Do NOT import `from '@prisma/client'`** — always `from '@/generated/prisma/client'`.

### Testing Requirements

- **Framework**: Vitest (`pnpm test`)
- **Test location**: `src/__tests__/public-layout.test.ts` (new file)
- **Mock patterns**: `vi.mock()` for module mocking, `render()` from `@testing-library/react`
- **Mock `next/navigation`**: for `usePathname`, `useRouter`
- **Mock `next/headers`**: for `cookies()`
- **Mock `@/server/db`**: for Prisma queries in club layout
- **All 341 existing tests must remain green**
- **3 pre-existing test failures** (`setup-password.test.ts` x2, `magic-link-route.test.ts` x1) — unrelated, ignore

### Previous Story Intelligence (from Story 3.6)

- **341 tests** currently passing — must remain green
- 3 pre-existing test failures (setup-password x2, magic-link-route x1) — unrelated, ignore
- `ThemeToggle` accepts translations as props from server parent — pattern: `<ThemeToggle translations={t.theme} />`
- `ThemeToggle` uses `Translations['theme']` type from i18n types
- `ThemeToggle` has active theme checkmark indicator in dropdown
- `ThemeProvider` wraps root layout with `attribute="class"`, `defaultTheme="system"`, `enableSystem`
- All shadcn/ui components including `DropdownMenu` and `Sheet` are already installed
- Commit pattern: `feat: story X.Y`
- `getLanguage()` helper used in root layout to set `<html lang>`
- Next.js 16 `params` are Promises — always `await` them
- `PoweredByBanner` is a server component accepting `lang` prop

### Git Intelligence

Recent commits follow `feat: story X.Y` pattern:
```
fb07968 feat: story 3.6
cb33883 feat: story 3.5
db0cf9b feat: story 3.4
2d341b1 feat: story 3.3
618a4cf feat: story 3.2
d6fffeb feat: story 3.1
```

Story 3.6 was the last commit — it created:
- `ThemeProvider` wrapper component with next-themes
- `ThemeToggle` component with sun/moon icon, dropdown (Light/Dark/System), i18n support
- `DropdownMenu` shadcn component installed
- Theme i18n keys added to all 4 languages
- 341 tests pass, tsc/lint/build clean

Story 3.5 created:
- `PoweredByBanner` server component with i18n
- Dynamic platform sitemap at `src/app/sitemap.ts`

Story 3.4 created:
- `ClubSidebarNav` component (sidebar + mobile sheet navigation for club pages)
- Club inner page routing with `[page]` segment

### Project Structure Notes

Files to create:
- `src/components/layout/public-navbar.tsx` — Sticky top navbar with contextual title, nav links, CTA
- `src/components/layout/mobile-nav-menu.tsx` — Client component for mobile hamburger Sheet
- `src/components/layout/public-footer.tsx` — Multi-column footer with links, theme toggle, copyright
- `src/components/layout/public-layout.tsx` — Shell combining navbar + main + footer with skip link
- `src/app/[lang]/(country)/[country]/layout.tsx` — New country-level layout
- `src/__tests__/public-layout.test.ts` — Tests for all layout components

Files to modify:
- `src/app/[lang]/(platform)/layout.tsx` — Replace inline markup with `PublicLayout`
- `src/app/[lang]/(country)/[country]/[club]/layout.tsx` — Replace sidebar with `PublicLayout`
- `src/lib/i18n/translations/types.ts` — Add `layout` section keys
- `src/lib/i18n/translations/en.ts` — Add English layout translations
- `src/lib/i18n/translations/fr.ts` — Add French layout translations
- `src/lib/i18n/translations/de.ts` — Add German layout translations
- `src/lib/i18n/translations/it.ts` — Add Italian layout translations

Files NOT to modify:
- `src/app/layout.tsx` — Root layout stays the same
- `src/app/globals.css` — Tokens already complete
- `src/components/ui/*` — shadcn CLI-managed, do not edit
- `src/components/app/club-site/ClubSidebarNav.tsx` — Stop rendering but don't delete (Story 3.8 cleanup)
- `src/components/app/club-site/PoweredByBanner.tsx` — Reuse as-is in PublicFooter
- `src/components/ui/theme-toggle.tsx` — Reuse as-is in PublicFooter
- `src/components/app/LanguageSwitcher.tsx` — Reuse as-is in PublicNavbar

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.7 (lines 888-917)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Layout specifications (lines 416-425)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — PublicNavbar spec (lines 679-696)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — PublicFooter spec (lines 699-712)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Navigation patterns (lines 983-993)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Responsive design (lines 1117-1157)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Typography & spacing (lines 361-390)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Accessibility requirements (lines 1175-1206)]
- [Source: _bmad-output/planning-artifacts/architecture.md — Routing architecture & route structure]
- [Source: _bmad-output/planning-artifacts/architecture.md — i18n architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md — Component patterns & naming conventions]
- [Source: _bmad-output/planning-artifacts/architecture.md — Testing standards]
- [Source: _bmad-output/implementation-artifacts/3-6-design-system-foundation-dark-light-mode.md — Previous story learnings]
- [Source: src/app/[lang]/(platform)/layout.tsx — Current platform layout (to be refactored)]
- [Source: src/app/[lang]/(country)/[country]/[club]/layout.tsx — Current club layout (to be refactored)]
- [Source: src/components/app/LanguageSwitcher.tsx — Existing language switcher]
- [Source: src/components/ui/theme-toggle.tsx — Existing theme toggle]
- [Source: src/components/app/club-site/PoweredByBanner.tsx — Existing powered-by banner]
- [Source: src/components/app/club-site/ClubSidebarNav.tsx — Existing sidebar nav (to be replaced)]

## Change Log

- 2026-03-07: Implemented public layout shell with PublicNavbar, PublicFooter, PublicLayout components; refactored platform, country, and club layouts; added i18n layout keys; wrote 10 tests; updated 2 existing test files for compatibility.
- 2026-03-07: Code review fixes — added aria-current="page" via NavLink client component (H1/H2), fixed nested footer landmark in PoweredByBanner (M1), removed redundant isValidCountry from club layout (H3), removed unused closeMenu i18n key (L1), updated country directory test for tree traversal robustness.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No blocking issues encountered.

### Completion Notes List

- Created `PublicNavbar` server component with contextual title, desktop nav links, LanguageSwitcher, CTA button, and `MobileNavMenu` integration
- Created `MobileNavMenu` client component using shadcn Sheet (side="right") with hamburger button, aria-expanded/aria-controls, nav links, language switcher, and CTA
- Created `PublicFooter` server component with multi-column layout (platform links, legal links, theme toggle), conditional PoweredByBanner, copyright line
- Created `PublicLayout` shell combining skip link, navbar, `<main id="main-content">` with padding, and footer
- Refactored platform layout to use PublicLayout (replaced inline header/main/footer)
- Created country directory layout with PublicLayout and isValidCountry validation
- Refactored club layout to use PublicLayout with top navbar navigation (replacing sidebar), showPoweredBy: true, kept TotpEnrollmentBanner
- Added `layout` i18n section with 9 keys to types.ts and all 4 language files (en, fr, de, it)
- Wrote 10 new tests covering all layout components and layout integrations
- Updated 2 existing test files (club-layout-guard, powered-by-footer-sitemap) for getClubPublicData compatibility
- All 354 tests pass, tsc/lint/audit/build clean

### File List

**New files:**
- src/components/layout/public-navbar.tsx
- src/components/layout/mobile-nav-menu.tsx
- src/components/layout/public-footer.tsx
- src/components/layout/public-layout.tsx
- src/components/layout/nav-link.tsx
- src/app/[lang]/(country)/[country]/layout.tsx
- src/__tests__/public-layout.test.ts

**Modified files:**
- src/app/[lang]/(platform)/layout.tsx
- src/app/[lang]/(country)/[country]/page.tsx
- src/app/[lang]/(country)/[country]/[club]/layout.tsx
- src/components/app/club-site/PoweredByBanner.tsx
- src/lib/i18n/translations/types.ts
- src/lib/i18n/translations/en.ts
- src/lib/i18n/translations/fr.ts
- src/lib/i18n/translations/de.ts
- src/lib/i18n/translations/it.ts
- src/__tests__/club-layout-guard.test.ts
- src/__tests__/powered-by-footer-sitemap.test.ts
- src/__tests__/country-directory.test.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml
