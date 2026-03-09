# Story 4.4: Club Admin Dashboard Shell

Status: done

## Story

As a Club Admin,
I want a dedicated admin dashboard with simplified sidebar navigation,
So that I have a clean, focused interface to manage my club profile and settings.

## Acceptance Criteria

1. **Given** an authenticated Club Admin navigates to `/{lang}/{country}/{club}/admin`, **When** the page loads, **Then** a standard shadcn dashboard layout renders with an `AdminSidebar`: club name at top, navigation items (Club Profile, Settings), and a "View public page" link in the footer that opens the public club URL in a new tab.

2. **Given** the admin URL, **When** an unauthenticated visitor or a user who is not an ACTIVE member of the club attempts to access it, **Then** they are redirected to the platform login page — the admin dashboard is never served to unauthorized users.

3. **Given** the admin dashboard on a mobile viewport, **Then** the sidebar collapses to a hamburger menu that opens as a `Sheet` drawer from the left; all navigation items remain accessible.

4. **Given** a Club Admin who is authenticated and visits their club's public URL, **Then** the public site renders normally with no admin chrome — complete separation between public and admin views.

5. **Given** the admin dashboard, **Then** the default view (landing page) is the Club Profile section (placeholder content for now — full edit form comes in Story 4.6).

## Tasks / Subtasks

- [x] Task 1: Create admin route group and layout with membership guard (AC: #1, #2)
  - [x] 1.1 Create `src/app/[lang]/(country)/[country]/[club]/admin/layout.tsx`
  - [x] 1.2 Implement membership check: query `ClubMembership` for `{ userId, clubId, status: ACTIVE }` — allow both OWNER and EDITOR roles
  - [x] 1.3 Redirect unauthorized users (unauthenticated → login, non-member → 404)
  - [x] 1.4 Pass club data (name, slug, country) to children via props or context

- [x] Task 2: Create AdminSidebar component (AC: #1, #3)
  - [x] 2.1 Create `src/components/app/club-admin/AdminSidebar.tsx`
  - [x] 2.2 Desktop: persistent left sidebar (~240px) with club name at top, nav items, footer link
  - [x] 2.3 Navigation items: "Club Profile" (`/admin`), "Settings" (`/admin/settings`)
  - [x] 2.4 Active item: `font-medium` + left border accent color + `aria-current="page"`
  - [x] 2.5 Footer: "View public page" link → `/{lang}/{country}/{slug}` in new tab (`target="_blank"`)

- [x] Task 3: Mobile responsive sidebar (AC: #3)
  - [x] 3.1 Mobile: hamburger icon (top-left) that opens `Sheet` drawer from the left
  - [x] 3.2 Sheet closes on navigation selection or backdrop tap
  - [x] 3.3 All nav items accessible in mobile drawer
  - [x] 3.4 `aria-expanded` + `aria-controls` on hamburger button

- [x] Task 4: Create admin pages (AC: #1, #5)
  - [x] 4.1 Create `src/app/[lang]/(country)/[country]/[club]/admin/page.tsx` — Club Profile placeholder
  - [x] 4.2 Create `src/app/[lang]/(country)/[country]/[club]/admin/settings/page.tsx` — Settings placeholder
  - [x] 4.3 Placeholder content: heading + description text explaining what will be available

- [x] Task 5: Add i18n translation keys (AC: #1)
  - [x] 5.1 Add `club.admin.*` keys to translation types and all 4 language files (en, fr, de, it)
  - [x] 5.2 Keys needed: sidebar labels, page headings, "View public page", placeholder text

- [x] Task 6: Tests (AC: #1, #2, #3)
  - [x] 6.1 Test membership guard: unauthenticated → redirect, non-member → 404, ACTIVE OWNER → render, ACTIVE EDITOR → render, PENDING → 404, REVOKED → 404
  - [x] 6.2 Test AdminSidebar renders nav items with correct active state
  - [x] 6.3 Test mobile hamburger opens Sheet with nav items

## Dev Notes

### Route & File Structure

Create this structure under the club route:

```
src/app/[lang]/(country)/[country]/[club]/
├── admin/
│   ├── layout.tsx          # Admin layout: membership guard + AdminSidebar shell
│   ├── page.tsx            # Club Profile placeholder (default landing)
│   └── settings/
│       └── page.tsx        # Settings placeholder
├── settings/               # EXISTING — membership management (invite/transfer/revoke)
│   ├── layout.tsx          #   Keep as-is — separate from admin dashboard
│   ├── page.tsx
│   └── actions.ts
├── layout.tsx              # EXISTING — public club layout (PublicLayout)
└── page.tsx                # EXISTING — public club page
```

**Critical: The existing `settings/` folder (Stories 1.7–1.9) handles membership management and is SEPARATE from the admin dashboard. Do NOT move, merge, or modify it in this story.** The admin dashboard `admin/settings/` is a different section for club configuration (to be built in later stories).

### Architecture Note: Route Name

The epic specifies `/admin` as the route segment. The architecture document references `/edit/` — use `/admin` as the epic is authoritative. The folder name is `admin/`.

### Membership Guard Pattern

Follow the existing pattern from `settings/layout.tsx` but extend to allow both OWNER and EDITOR:

```typescript
// admin/layout.tsx
import { getAuthSession } from '@/server/auth'
import { getClubBySlug } from '@/lib/server/club-queries'
import { prisma } from '@/server/db'
import { redirect, notFound } from 'next/navigation'

// 1. Check authentication
const session = await getAuthSession()
if (!session?.user) redirect(`/${lang}/login`)

// 2. Resolve club from URL
const club = await getClubBySlug(slug, country)
if (!club) notFound()

// 3. Check ACTIVE membership (OWNER or EDITOR)
const membership = await prisma.clubMembership.findUnique({
  where: { userId_clubId: { userId: session.user.id, clubId: club.id } },
  select: { role: true, status: true }
})
if (!membership || membership.status !== 'ACTIVE') notFound()
```

**Important:** Return `notFound()` (404) for unauthorized users, NOT a redirect to the public page. This prevents information leakage about admin routes existing.

### AdminSidebar Component

Reference the existing `MobileNavMenu` pattern from `src/components/layout/mobile-nav-menu.tsx` for the Sheet-based hamburger implementation. Reference `PublicNavbar` from `src/components/layout/public-navbar.tsx` for responsive nav patterns.

Use shadcn/ui components:
- `Sheet` (from `src/components/ui/sheet.tsx`) — for mobile drawer
- `Button` (ghost variant) — for nav items
- Standard `<nav>` element with `aria-current="page"` on active item

**Desktop sidebar structure:**
```
┌─────────────────┐
│  Club Name       │
├─────────────────┤
│ ▸ Club Profile   │  ← active = accent left border
│   Settings       │
├─────────────────┤
│ ↗ View public    │  ← target="_blank"
│   page           │
└─────────────────┘
```

**Active item detection:** Use `usePathname()` from `next/navigation`. `/admin` exact match → Club Profile active. `/admin/settings` → Settings active.

### Accessibility Requirements (WCAG 2.1 AA)

- `<nav>` landmark wrapping sidebar navigation
- `aria-current="page"` on the active navigation item
- Hamburger button: `aria-expanded`, `aria-controls` pointing to the Sheet
- Skip link: "Skip to main content" at top (follows existing pattern from PublicLayout)
- All interactive elements: `focus-visible:ring-2 focus-visible:ring-ring`
- Minimum 44x44px touch targets on mobile
- `<main id="main-content">` wrapping the content area

### Responsive Breakpoints

- Base (mobile): Sidebar hidden, hamburger icon visible (top-left)
- `lg` (1024px+): Sidebar becomes persistent, hamburger hidden
- Follow mobile-first Tailwind classes — base styles for mobile, `lg:` prefix for desktop

### Design System Tokens

- Sidebar background: `bg-card` (zinc base)
- Sidebar border: `border-r border-border`
- Active item left border: `border-l-2 border-primary`
- Active item text: `font-medium text-foreground`
- Inactive item text: `text-muted-foreground`
- Footer link: `text-sm text-muted-foreground hover:text-foreground`
- Spacing: `p-4` standard sidebar padding

### Translation Keys Needed

```typescript
club: {
  admin: {
    sidebar: {
      clubProfile: "Club Profile" | "Profil du club" | "Vereinsprofil" | "Profilo del club"
      settings: "Settings" | "Paramètres" | "Einstellungen" | "Impostazioni"
      viewPublicPage: "View public page" | "Voir la page publique" | "Öffentliche Seite" | "Vedi pagina pubblica"
    }
    clubProfile: {
      title: "Club Profile" | "Profil du club" | "Vereinsprofil" | "Profilo del club"
      placeholder: "Profile editing coming soon." | ...
    }
    settings: {
      title: "Settings" | "Paramètres" | "Einstellungen" | "Impostazioni"
      placeholder: "Settings coming soon." | ...
    }
  }
}
```

### Previous Story Intelligence (4.3)

- **Transaction pattern:** Story 4.3 used serializable transactions for multi-model operations — not needed for this shell story but note for later
- **Translation key pattern:** `admin.applications.profileFields.*` format — follow similar `club.admin.*` namespace
- **All 4 languages:** Always update en, fr, de, it translation files in sync
- **Test count:** 355 tests passing as of story 4.3 — ensure no regressions

### Git Intelligence

Recent commits follow `feat: story X.Y` pattern. Last commit: `2323847 feat: story 4.3`. The public layout shell (story 3.7, commit `2d89540`) is the direct reference pattern for building the admin layout shell.

### What This Story Does NOT Include

- No save/edit functionality (Story 4.5 — explicit save framework)
- No profile edit form (Story 4.6 — profile edit + photo upload)
- No publish/unpublish toggle (Story 4.7)
- No operator message banner (Story 4.7)
- No photo upload (Story 4.6)
- No accent color picker (future story)
- No version history (future story)

This is purely the **shell**: layout, sidebar navigation, membership guard, placeholder pages.

### Project Structure Notes

- Aligns with existing route group pattern: `(country)/[country]/[club]/`
- New `admin/` segment nests under the existing club route
- Component location: `src/components/app/club-admin/` — new directory (matches architecture doc)
- No conflicts with existing `settings/` folder — completely separate route segments

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.4]
- [Source: _bmad-output/planning-artifacts/architecture.md — Club Admin Dashboard Architecture, Route Structure, Auth Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — AdminSidebar component, Responsive Design, Accessibility]
- [Source: src/app/[lang]/(country)/[country]/[club]/settings/layout.tsx — Existing membership guard pattern]
- [Source: src/components/layout/public-layout.tsx — Public layout shell reference]
- [Source: src/components/layout/mobile-nav-menu.tsx — Sheet-based hamburger menu reference]
- [Source: src/components/layout/public-navbar.tsx — Responsive nav pattern reference]
- [Source: _bmad-output/implementation-artifacts/4-3-approval-flow-profile-seeding-operator-message.md — Previous story learnings]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
None — clean implementation with no blockers.

### Completion Notes List
- Admin layout created with membership guard: authenticates user, resolves club by slug+country, checks ACTIVE membership (OWNER or EDITOR), returns 404 for unauthorized users
- Added `getClubActiveMembership` cached query to `club-queries.ts` for role-agnostic ACTIVE membership check
- AdminSidebar client component with responsive design: desktop persistent sidebar (240px), mobile hamburger with Sheet drawer from left
- Skip-to-content link, `<nav>` landmark, `aria-current="page"`, `aria-expanded`/`aria-controls` on hamburger, 44px touch targets
- Placeholder pages for Club Profile (`/admin`) and Settings (`/admin/settings`) with i18n headings
- Translation keys added to types and all 4 language files (en, fr, de, it): `club.admin.sidebar.*`, `club.admin.clubProfile.*`, `club.admin.settings.*`, `club.admin.navigation`, `club.admin.openMenu`, `club.admin.skipToContent`
- 17 new tests: 9 for membership guard (layout, including PENDING/REVOKED cases), 8 for AdminSidebar rendering
- Total tests: 372 (was 355), zero regressions
- All safety checks pass: tsc, lint, audit, build
- Code review fixes applied: trailing slash normalization in active item detection, `shrink-0` on desktop sidebar, `bg-card` on mobile Sheet, skip-link moved to `fixed` positioning inside flex container, redundant onClick removed from SheetClose links, shared JSX variable replaced with FooterLink component

### File List
- src/app/[lang]/(country)/[country]/[club]/admin/layout.tsx (new)
- src/app/[lang]/(country)/[country]/[club]/admin/page.tsx (new)
- src/app/[lang]/(country)/[country]/[club]/admin/settings/page.tsx (new)
- src/components/app/club-admin/AdminSidebar.tsx (new)
- src/lib/server/club-queries.ts (modified — added getClubActiveMembership)
- src/lib/i18n/translations/types.ts (modified — added club.admin types)
- src/lib/i18n/translations/en.ts (modified — added club.admin translations)
- src/lib/i18n/translations/fr.ts (modified — added club.admin translations)
- src/lib/i18n/translations/de.ts (modified — added club.admin translations)
- src/lib/i18n/translations/it.ts (modified — added club.admin translations)
- src/__tests__/club-admin-layout.test.ts (new)
- src/__tests__/club-admin-sidebar.test.ts (new)

## Change Log
- 2026-03-08: Implemented club admin dashboard shell — layout with membership guard, responsive AdminSidebar, placeholder pages, i18n support in 4 languages, 15 tests added
- 2026-03-08: Code review fixes — 7 issues resolved: trailing slash handling, shrink-0 sidebar, bg-card consistency, skip-link positioning, redundant onClick removal, FooterLink component extraction, PENDING/REVOKED test cases added (total: 17 tests)
- 2026-03-08: Shadcn dashboard pattern — AdminSidebar rewritten using shadcn Sidebar primitives (SidebarProvider, SidebarInset, SidebarMenu, SidebarMenuButton). Club admin layout updated with SidebarProvider + SidebarInset + header with SidebarTrigger. Custom Sheet/aside approach replaced by shadcn's built-in responsive sidebar (mobile drawer + desktop panel). Icons added (LayoutDashboard, Settings). Tests updated to mock shadcn sidebar components.
- 2026-03-08: Unified admin routing — club admin pages moved from /{lang}/{country}/{club}/admin/ to /{lang}/admin/club/{clubId}/. All admin pages (platform + club) consolidated under single /{lang}/admin/ path with unified sidebar showing per-club entries for users with multiple club memberships.
