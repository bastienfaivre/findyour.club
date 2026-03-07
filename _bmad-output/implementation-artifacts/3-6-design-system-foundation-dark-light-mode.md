# Story 3.6: Design System Foundation — Dark/Light Mode & Theme Provider

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Public Visitor or Club Admin,
I want the platform to respect my system's light/dark mode preference and dynamically follow changes,
so that the interface is comfortable to use in any lighting condition without manual configuration.

## Acceptance Criteria

1. **Given** a visitor navigates to any page on the platform (public or admin), **When** the page loads, **Then** the color scheme matches the visitor's OS `prefers-color-scheme` setting — light mode for light OS, dark mode for dark OS. This is powered by `next-themes` with `defaultTheme="system"` and `enableSystem`.

2. **Given** the visitor's OS switches from light to dark mode (or vice versa) while the page is open, **When** the system preference changes, **Then** the page theme updates dynamically in real time — no page reload required.

3. **Given** any page footer, **Then** a subtle theme toggle icon button is present allowing manual override (light / dark / system). The override is persisted in `localStorage`. Choosing "system" clears the override and returns to OS-following behavior.

4. **Given** the theme provider, **Then** it wraps the root layout and applies the theme via a `class` attribute on `<html>` (`next-themes` `attribute="class"` strategy). All existing CSS custom property tokens (OKLCH zinc base, accent presets) already define both `:root` (light) and `.dark` (dark) variants — no token changes needed.

5. **Given** the theme toggle, **Then** it meets WCAG 2.1 AA: `aria-label="Toggle theme"`, keyboard-accessible, sufficient contrast in both modes. The toggle uses a sun/moon icon pair.

## Tasks / Subtasks

- [x] Task 1: Create `ThemeProvider` wrapper component (AC: 1, 2, 4)
  - [x] 1.1 Create `src/components/providers/theme-provider.tsx` as a `"use client"` component. It wraps `next-themes`'s `ThemeProvider` with the project's required configuration: `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`.
  - [x] 1.2 The component accepts `children: React.ReactNode` and passes them through. No additional logic beyond the `next-themes` wrapper.
  - [x] 1.3 Export the component as a named export `ThemeProvider`.

- [x] Task 2: Integrate `ThemeProvider` into root layout (AC: 1, 2, 4)
  - [x] 2.1 Modify `src/app/layout.tsx` to import `ThemeProvider` from `@/components/providers/theme-provider`.
  - [x] 2.2 Wrap `{children}` (and the existing `Toaster` and `DevAuthPanel`) inside `<ThemeProvider>`. The provider must be inside `<body>` but wrap all rendered content.
  - [x] 2.3 Move `suppressHydrationWarning` from `<body>` to `<html>` element (standard `next-themes` requirement — the `<html>` tag is where the `class` attribute is toggled, and mismatches happen there). Keep it on `<body>` too if already present.
  - [x] 2.4 Verify that the `Toaster` (sonner) component already uses `useTheme()` from `next-themes` — it does (`src/components/ui/sonner.tsx`), so it will automatically pick up the theme context. No changes needed to sonner.

- [x] Task 3: Create theme toggle component (AC: 3, 5)
  - [x] 3.1 Create `src/components/ui/theme-toggle.tsx` as a `"use client"` component.
  - [x] 3.2 Import `useTheme` from `next-themes` and shadcn's `Button` (ghost variant, `size="icon"`) + `DropdownMenu` + `DropdownMenuContent` + `DropdownMenuItem` + `DropdownMenuTrigger`.
  - [x] 3.3 Render a `Button` with a sun icon (visible in light mode) and moon icon (visible in dark mode) using Lucide React icons (`Sun`, `Moon`). Use `sr-only` span with text "Toggle theme" for screen readers.
  - [x] 3.4 The `DropdownMenu` offers three options: "Light", "Dark", "System". Each calls `setTheme("light" | "dark" | "system")`.
  - [x] 3.5 Add `aria-label="Toggle theme"` on the trigger button. Ensure keyboard accessibility (Tab to focus, Enter/Space to open, arrow keys to navigate menu).
  - [x] 3.6 Style the toggle to be subtle: `text-muted-foreground hover:text-foreground` — it should blend into a footer context without being prominent.

- [x] Task 4: Add i18n translation keys for theme toggle (AC: 3, 5)
  - [x] 4.1 Add translation keys to `src/lib/i18n/translations/types.ts` under a new `theme` section: `{ toggleTheme: string, light: string, dark: string, system: string }`.
  - [x] 4.2 Add translations to all 4 language files (`en.ts`, `fr.ts`, `de.ts`, `it.ts`):
    - **en**: `"Toggle theme"`, `"Light"`, `"Dark"`, `"System"`
    - **fr**: `"Changer le thème"`, `"Clair"`, `"Sombre"`, `"Système"`
    - **de**: `"Design wechseln"`, `"Hell"`, `"Dunkel"`, `"System"`
    - **it**: `"Cambia tema"`, `"Chiaro"`, `"Scuro"`, `"Sistema"`
  - [x] 4.3 Update the theme toggle component to use translated strings via the `getTranslations()` helper. Since the toggle is a client component and translations require `lang` param, accept `lang` as a prop and pass translations as props from the parent, OR use a simpler approach: since the toggle labels are extremely short and universal ("Light", "Dark", "System"), evaluate if hardcoded English is acceptable for MVP. Decision: use i18n — pass translations as a prop object from the server parent that renders the toggle.

- [x] Task 5: Write tests (AC: 1-5)
  - [x] 5.1 Test `ThemeProvider` renders children correctly.
  - [x] 5.2 Test `ThemeProvider` passes correct props to `next-themes` provider (`attribute="class"`, `defaultTheme="system"`, `enableSystem`).
  - [x] 5.3 Test `ThemeToggle` renders a button with `aria-label="Toggle theme"`.
  - [x] 5.4 Test `ThemeToggle` dropdown menu contains Light, Dark, System options.
  - [x] 5.5 Test `ThemeToggle` calls `setTheme` with correct value when an option is selected.
  - [x] 5.6 Test root layout renders `ThemeProvider` wrapping content.

- [ ] Task 6: Visual verification & full test suite
  - [ ] 6.1 Verify the theme toggle appears and functions (manual dev server check).
  - [ ] 6.2 Verify OS preference is followed on fresh page load.
  - [ ] 6.3 Verify dynamic OS switching updates the theme without reload.
  - [x] 6.4 Run `pnpm test` — all existing tests must pass (333+ tests).
  - [x] 6.5 Run `pnpm typecheck && pnpm lint && pnpm build` — all must pass.

## Dev Notes

### Architecture & Constraints

- **Prisma import**: Always `from '@/generated/prisma/client'` — NOT `from '@prisma/client'` (not directly relevant to this story but a project-wide constraint)
- **Package manager**: pnpm — accessed via `bash -c 'NVM_DIR="/Users/bastienfaivre/.nvm" && source "$NVM_DIR/nvm.sh" && pnpm ...'`
- **`next-themes` is ALREADY installed**: v0.4.6 is in `package.json` dependencies. Do NOT run `pnpm add next-themes` — it's already there.
- **CSS tokens ALREADY define light/dark**: `globals.css` has complete `:root` (light) and `.dark` (dark) OKLCH token blocks. No CSS changes needed for this story.
- **`sonner.tsx` already uses `useTheme()`**: The toaster component at `src/components/ui/sonner.tsx` imports `useTheme` from `next-themes`. Once the `ThemeProvider` wraps the root layout, sonner will automatically pick up theme changes. No modifications needed to sonner.
- **`suppressHydrationWarning`**: Already on `<body>`. Must also be on `<html>` for `next-themes` (the `class` attribute is toggled on `<html>`, which causes the hydration mismatch warning).
- **Tailwind v4**: No `tailwind.config.ts` exists. All theming is done via `@theme inline` blocks in `globals.css`. The dark mode variant is defined as `@custom-variant dark (&:is(.dark *))` — this already works with class-based switching.
- **shadcn/ui style**: "new-york" variant with zinc base color, CSS variables enabled (`components.json`).

### CRITICAL: ThemeProvider Must Be a Client Component

`next-themes` requires a client component wrapper because it uses React context and `localStorage`. The `ThemeProvider` component MUST have `"use client"` directive. However, the root `layout.tsx` stays as a server component — it simply renders the client `ThemeProvider` as a child.

### CRITICAL: Do NOT Touch globals.css

The OKLCH token architecture in `globals.css` is already complete with both `:root` and `.dark` variants. The `@custom-variant dark (&:is(.dark *))` Tailwind directive is already configured. This story only needs to activate the class-based switching via `next-themes` — no CSS changes whatsoever.

### CRITICAL: Theme Toggle Placement for This Story

The theme toggle component is created in this story but its **final placement in the footer** happens in Story 3.7 (PublicFooter component). For this story, the toggle only needs to exist as a standalone component. However, for testing/verification purposes, you may temporarily render it somewhere visible (e.g., in the root layout) and remove it before committing, OR simply trust the unit tests. The epic acceptance criteria says the toggle goes in the footer — that's Story 3.7's job.

**Recommended approach**: Create the component, test it, but do NOT permanently place it in any layout in this story. Story 3.7 will integrate it into the `PublicFooter`.

### Key Existing Code Relevant to This Story

| File | What it provides | Action needed |
|------|-----------------|---------------|
| `src/app/layout.tsx` | Root layout — wraps all pages | Add `ThemeProvider` wrapper, add `suppressHydrationWarning` to `<html>` |
| `src/app/globals.css` | Complete `:root` + `.dark` OKLCH tokens | **None** — already complete |
| `src/components/ui/sonner.tsx` | Already uses `useTheme()` from `next-themes` | **None** — auto-picks up theme context |
| `src/components/ui/button.tsx` | Already uses `dark:` variant classes | **None** — works with class-based switching |
| `components.json` | shadcn config — zinc base, CSS vars enabled | **None** — read-only reference |
| `postcss.config.mjs` | PostCSS with `@tailwindcss/postcss` | **None** — Tailwind v4 already configured |
| `package.json` | `next-themes: ^0.4.6` already in deps | **None** — already installed |

### Root Layout Current Structure

```tsx
// src/app/layout.tsx — current structure (simplified):
export default async function RootLayout({ children }) {
  const lang = await getLanguage()
  return (
    <html lang={lang}>
      <body suppressHydrationWarning className={...}>
        {children}
        <DevAuthPanel />
        <Toaster />
      </body>
    </html>
  )
}
```

After this story:

```tsx
// src/app/layout.tsx — after Story 3.6:
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

### ThemeProvider Component Pattern

```tsx
// src/components/providers/theme-provider.tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

### Theme Toggle Component Pattern

```tsx
// src/components/ui/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme"
          className="text-muted-foreground hover:text-foreground">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Anti-Patterns to Avoid

- **Do NOT modify `globals.css`** — the OKLCH tokens and `.dark` class are already complete. No CSS changes needed.
- **Do NOT install `next-themes`** — it's already in `package.json` at v0.4.6.
- **Do NOT create a `tailwind.config.ts`** — Tailwind v4 uses inline `@theme` blocks in CSS. The config file pattern is v3.
- **Do NOT use `@media (prefers-color-scheme)` directly** — `next-themes` handles OS detection and class toggling. The CSS uses `.dark` class, not media queries.
- **Do NOT modify `sonner.tsx`** — it already uses `useTheme()` and will work automatically once the provider is in place.
- **Do NOT place the theme toggle in a specific layout** — that's Story 3.7's job (PublicFooter). Just create the component and test it.
- **Do NOT use `storageKey` prop on ThemeProvider** — the default `"theme"` localStorage key is fine.
- **Do NOT use `themes` prop** — the default `["light", "dark", "system"]` is exactly what we need.
- **Do NOT use `forcedTheme`** — we want user/system choice everywhere.
- **Do NOT make the ThemeProvider a server component** — `next-themes` requires client-side context. The `"use client"` directive is mandatory.
- **Do NOT remove `suppressHydrationWarning` from `<body>`** — keep it there AND add it to `<html>`.

### Required shadcn/ui Components

The theme toggle uses `DropdownMenu`. Check if it's already installed:
- `src/components/ui/dropdown-menu.tsx` — if missing, install via `pnpm dlx shadcn@latest add dropdown-menu`
- `src/components/ui/button.tsx` — already exists

Lucide React icons (`Sun`, `Moon`) — `lucide-react` is already in dependencies.

### Testing Requirements

- **Framework**: Vitest (`pnpm test`)
- **Test location**: `src/__tests__/theme-provider-toggle.test.ts` (new file)
- **Mock `next-themes`**: Mock the `ThemeProvider` and `useTheme` hook for unit tests
- **Test patterns from Stories 3.3-3.5**: `vi.mock()` for module mocking, `render()` from `@testing-library/react`
- **All 333 existing tests must remain green**
- **3 pre-existing test failures** (`setup-password.test.ts` x2, `magic-link-route.test.ts` x1) — unrelated, ignore

### Previous Story Intelligence (from Story 3.5)

- 333 tests currently passing — must remain green
- 3 pre-existing test failures (setup-password x2, magic-link-route x1) — unrelated, ignore
- Pre-existing `express-rate-limit` audit vulnerability was fixed via pnpm override
- Commit pattern: `feat: story X.Y`
- `getLanguage()` helper used in root layout to set `<html lang>`
- Next.js 16 `params` are Promises — always `await` them (not directly relevant here but project convention)
- `findText()` and `makeParams()` helpers available in test utilities

### Git Intelligence

Recent commits follow `feat: story X.Y` pattern:
```
cb33883 feat: story 3.5
db0cf9b feat: story 3.4
2d341b1 feat: story 3.3
618a4cf feat: story 3.2
d6fffeb feat: story 3.1
```

Story 3.5 was the last commit — it created:
- `PoweredByBanner` server component with i18n
- Dynamic platform sitemap at `src/app/sitemap.ts`
- Integration tests for footer and sitemap

### Project Structure Notes

Files to create:
- `src/components/providers/theme-provider.tsx` — `next-themes` wrapper
- `src/components/ui/theme-toggle.tsx` — sun/moon toggle with dropdown
- `src/__tests__/theme-provider-toggle.test.ts` — tests

Files to modify:
- `src/app/layout.tsx` — add `ThemeProvider` wrapper + `suppressHydrationWarning` on `<html>`
- `src/lib/i18n/translations/types.ts` — add `theme` section
- `src/lib/i18n/translations/en.ts` — add English theme translations
- `src/lib/i18n/translations/fr.ts` — add French theme translations
- `src/lib/i18n/translations/de.ts` — add German theme translations
- `src/lib/i18n/translations/it.ts` — add Italian theme translations

Files NOT to modify:
- `src/app/globals.css` — tokens already complete
- `src/components/ui/sonner.tsx` — already uses `useTheme()`
- `package.json` — `next-themes` already installed
- `postcss.config.mjs` — Tailwind v4 already configured
- `components.json` — read-only shadcn config

Possibly install (if missing):
- `src/components/ui/dropdown-menu.tsx` — needed for theme toggle dropdown

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.6 (lines 853-883)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Theme switching section (lines 352-357)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Color system & OKLCH tokens (lines 291-349)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — PublicFooter component spec (lines 699-713)]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend patterns: next-themes, attribute="class" (line 354)]
- [Source: src/app/globals.css — Complete OKLCH token architecture (:root + .dark)]
- [Source: src/app/layout.tsx — Root layout structure]
- [Source: src/components/ui/sonner.tsx — Existing useTheme() integration]
- [Source: package.json — next-themes ^0.4.6 already installed]
- [Source: _bmad-output/implementation-artifacts/3-5-mandatory-powered-by-footer-platform-sitemap.md — Previous story learnings and patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Created ThemeProvider wrapper component using next-themes with attribute="class", defaultTheme="system", enableSystem, disableTransitionOnChange
- Integrated ThemeProvider into root layout wrapping all content inside body; added suppressHydrationWarning to html element
- Created ThemeToggle component with sun/moon icon pair, dropdown menu (Light/Dark/System), aria-label, keyboard accessible, styled subtle for footer context
- ThemeToggle accepts translations as props from server parent for i18n support
- Added theme translation keys (toggleTheme, light, dark, system) to types.ts and all 4 language files (en, fr, de, it)
- Installed shadcn dropdown-menu component (was missing)
- 7 new tests covering ThemeProvider props, ThemeToggle rendering, aria-label, menu options, setTheme calls, and i18n
- All 340 tests pass, tsc clean, lint clean, audit clean, build succeeds
- [Code Review] Added missing root layout ThemeProvider integration test (Task 5.6)
- [Code Review] Unchecked Tasks 6.1-6.3 (manual browser verification — requires human)
- [Code Review] ThemeToggle now uses Translations['theme'] type from i18n types instead of inline duplicate
- [Code Review] Added active theme checkmark indicator in dropdown menu
- All 341 tests pass after review fixes

### Change Log

- 2026-03-07: Implemented design system foundation with dark/light mode support via next-themes ThemeProvider and ThemeToggle component with i18n
- 2026-03-07: Addressed code review findings — 4 items resolved (1 High, 2 Medium, 1 Low)

### File List

New files:
- src/components/providers/theme-provider.tsx
- src/components/ui/theme-toggle.tsx
- src/components/ui/dropdown-menu.tsx (installed via shadcn)
- src/__tests__/theme-provider-toggle.test.ts

Modified files:
- src/app/layout.tsx (added ThemeProvider wrapper, suppressHydrationWarning on html)
- src/lib/i18n/translations/types.ts (added theme section)
- src/lib/i18n/translations/en.ts (added theme translations)
- src/lib/i18n/translations/fr.ts (added theme translations)
- src/lib/i18n/translations/de.ts (added theme translations)
- src/lib/i18n/translations/it.ts (added theme translations)
