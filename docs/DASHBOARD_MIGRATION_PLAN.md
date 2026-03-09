# Dashboard Migration Plan — Unified Shell

## 1. Vision

Replace the current dual-layout system (PublicLayout navbar+footer vs AdminLayout sidebar) with a **single shadcn dashboard shell** that serves all users — visitors, club admins, and operators. The sidebar is always present and grows with the user's role. Club profiles are viewed inline within the search/browse page as a master-detail view, not on standalone pages.

---

## 2. Sidebar Structure by Role

### Visitor (unauthenticated)

```
Home              /{lang}
Search            /{lang}/search
About             /{lang}/about
Support           /{lang}/support
Register a Club   /{lang}/apply
─────────────────
Sign In           /{lang}/auth/login
```

### Authenticated (CLUB_ADMIN, no clubs yet)

```
Home              /{lang}
Search            /{lang}/search
About             /{lang}/about
Support           /{lang}/support
Register a Club   /{lang}/apply
─────────────────
Account           /{lang}/account
Sign Out
```

### Authenticated (CLUB_ADMIN with clubs)

```
Home              /{lang}
Search            /{lang}/search
About             /{lang}/about
Support           /{lang}/support
─────────────────
MY CLUBS
▸ Club A
    Profile       /{lang}/club/{clubId}
    Settings      /{lang}/club/{clubId}/settings
▸ Club B
    Profile       /{lang}/club/{clubId}
    Settings      /{lang}/club/{clubId}/settings
─────────────────
Account           /{lang}/account
Sign Out
```

### Operator

```
Home              /{lang}
Search            /{lang}/search
About             /{lang}/about
Support           /{lang}/support
─────────────────
PLATFORM
  Applications    /{lang}/admin/applications
  All Clubs       /{lang}/admin/clubs
─────────────────
MY CLUBS (if any)
  ...
─────────────────
Account           /{lang}/account
Sign Out
```

### Footer (all roles)

```
Privacy  ·  Terms     Theme Toggle  ·  Language Switcher
© {year} ...
```

---

## 3. Route Structure

### Current → New mapping

```
CURRENT                                    NEW
────────────────────────────────────────────────────────────────────────
/{lang}                        (platform)  /{lang}                       (dashboard)
/{lang}/about                  (platform)  /{lang}/about                 (dashboard)
/{lang}/support                (platform)  /{lang}/support               (dashboard)
/{lang}/apply                  (platform)  /{lang}/apply                 (dashboard)
/{lang}/{country}              (country)   /{lang}/search                (dashboard) ← country+filters as query params
/{lang}/{country}/{club}       (country)   /{lang}/{country}/{club}      (dashboard) ← renders search with club pre-selected
/{lang}/{country}/{club}/contact (country) /{lang}/{country}/{club}/contact (dashboard)
/{lang}/admin                  (admin)     REMOVED                       ← redirect to /{lang}
/{lang}/admin/applications     (admin)     /{lang}/admin/applications    (dashboard)
/{lang}/admin/clubs            (admin)     /{lang}/admin/clubs           (dashboard)
/{lang}/admin/account          (admin)     /{lang}/account               (dashboard) ← no /admin prefix
/{lang}/admin/account/totp-setup (admin)   /{lang}/account/totp-setup    (dashboard)
/{lang}/admin/club/{id}        (admin)     /{lang}/club/{id}             (dashboard) ← no /admin prefix
/{lang}/admin/club/{id}/settings (admin)   /{lang}/club/{id}/settings    (dashboard)
/{lang}/auth/*                 (auth)      /{lang}/auth/*                (standalone) ← no sidebar
/{lang}/my-clubs               (my-clubs)  REMOVED                       ← clubs visible in sidebar
```

### New file structure

```
src/app/
  layout.tsx                          # Root: html, ThemeProvider, Sonner
  [lang]/
    layout.tsx                        # Dashboard shell (sidebar + header + content)
    page.tsx                          # Home (hero, country grid, stats)
    about/page.tsx                    # About
    support/page.tsx                  # Support
    apply/page.tsx                    # Club application form
    search/page.tsx                   # Search/browse (master-detail, country+filters via searchParams)
    [country]/
      [club]/
        page.tsx                      # Direct club URL → renders search shell with club pre-selected
        contact/page.tsx              # Contact form
    club/
      [clubId]/
        layout.tsx                    # Auth guard (membership check) + OperatorMessageBanner
        page.tsx                      # Club profile editor
        settings/page.tsx             # Club settings
    admin/
      layout.tsx                      # Auth guard (operator check)
      applications/page.tsx           # Application queue
      clubs/page.tsx                  # Club management
    account/
      layout.tsx                      # Auth guard (any authenticated user)
      page.tsx                        # Account settings
      totp-setup/page.tsx             # TOTP enrollment
    auth/                             # Standalone layout (NO sidebar)
      layout.tsx                      # Minimal centered layout
      login/page.tsx
      setup/page.tsx
      totp/page.tsx
      error/page.tsx
      logout/route.ts
```

---

## 4. Key Design Decisions

### 4.1 Search Page as Master-Detail

The search page (`/{lang}/search`) follows the same master-detail pattern as the existing `ClubQueue` and `ApplicationQueue` components:

- **Master panel**: Country selector, filters (activity type, canton), club card grid
- **Detail panel**: Club profile (reusing `ProfilePage` component) — shown when a club is selected
- **Mobile**: Tab toggle between list and detail (like existing queue components)
- **Desktop**: Side-by-side or full-width detail with back button

Filter state is stored in `searchParams` (`?country=ch&activity=badminton&canton=ZH`), making URLs shareable and bookmarkable.

### 4.2 Direct Club URLs → Search Context

When a visitor lands on `/{lang}/{country}/{club}`:

1. The page fetches the club data server-side (for SEO: metadata, JSON-LD)
2. It renders the **search page shell** with the club's country pre-selected as context
3. The club profile is shown in the detail panel (pre-selected)
4. The search list shows other clubs from the same country as a browsable sidebar
5. The sidebar highlights "Search" as the active page

This keeps URLs SEO-friendly while maintaining the unified dashboard experience. The `[country]/[club]/page.tsx` is essentially a thin wrapper that fetches data and renders the `SearchPage` component with `preSelectedClub` and `defaultCountry` props.

### 4.3 ProfilePage Convergence

Currently there are 3 profile renderers:
- `ProfilePage` — public club profile (server component)
- `ProfilePreview` — admin live preview (client component, nearly identical)
- Operator's `ClubDetail` preview block — also uses `ProfilePreview`

**Migration**: Merge into a single `ClubProfile` component that works for all contexts:
- Read-only view (search detail panel, direct URL)
- Live preview (club admin form, operator edit form)

The difference is only the data source (server-fetched props vs watched form values).

### 4.4 Dashboard Layout — Auth Handling

The `[lang]/layout.tsx` dashboard shell renders for ALL users. Auth state determines sidebar content:

```tsx
// [lang]/layout.tsx (simplified)
const session = await getAuthSession()  // null for visitors
const isOperator = session?.user?.role === 'OPERATOR'
const clubs = session ? await fetchUserClubs(session.user.id) : []

return (
  <SidebarProvider>
    <AppSidebar
      session={session}          // null = visitor
      isOperator={isOperator}
      clubs={clubs}
      lang={lang}
    />
    <SidebarInset>
      <header>...</header>
      <main>{children}</main>
    </SidebarInset>
  </SidebarProvider>
)
```

Protected routes (`/club/[clubId]`, `/admin/*`, `/account/*`) still have their own `layout.tsx` files that enforce auth and redirect to `/auth/login` if needed.

### 4.5 Auth Pages Stay Standalone

`/{lang}/auth/*` pages (login, setup, TOTP challenge) render in a minimal centered layout **without the sidebar**. This is achieved by the `auth/` folder having its own `layout.tsx` that does NOT nest inside the dashboard layout.

**Implementation**: Use a Next.js route group to separate auth from dashboard:

```
src/app/[lang]/
  (dashboard)/                  # Dashboard shell layout
    layout.tsx                  # Sidebar + header + content
    page.tsx                    # Home
    search/page.tsx
    ...
  (auth)/                       # Standalone auth layout
    auth/
      layout.tsx                # Minimal centered layout (no sidebar)
      login/page.tsx
      ...
```

---

## 5. Component Changes

### 5.1 New: `AppSidebar`

Replaces `AdminSidebar`. Renders for all users with role-based sections.

**Key differences from current `AdminSidebar`:**
- Public navigation section (Home, Search, About, Support) — always visible
- "Register a Club" link for visitors/users without clubs
- "Sign In" link for unauthenticated visitors
- Conditional operator section, clubs section, account section
- No `adminBasePath` — paths are `/{lang}/...` directly

### 5.2 New: `SearchPage`

Client component implementing master-detail for club discovery.

**Props:**
```typescript
interface SearchPageProps {
  // Server-fetched initial data
  countries: CountryOption[]
  clubs: ClubCardData[]           // Initial club list for the default/selected country
  cantons: CantonOption[]
  activityTypes: ActivityOption[]
  translations: SearchTranslations
  lang: string
  // Optional: pre-selected state (for direct club URLs)
  defaultCountry?: string
  preSelectedClub?: ClubProfileData   // Full club data for immediate detail render
}
```

**Behavior:**
- Country selector at top (dropdown or tabs)
- Selecting a country fetches clubs via server action or API route
- Filters (activity type, canton) are client-side on the fetched list
- Clicking a club card opens the detail panel with `ProfilePage`
- URL updates via `router.push` with searchParams

### 5.3 Evolve: `ProfilePage` → `ClubProfile`

A single component for both read-only view and live preview:

```typescript
interface ClubProfileProps {
  club: ClubProfileData           // Either server-fetched or form-watched values
  ctaLabel?: string               // Optional: contact CTA (hidden in preview mode)
  ctaHref?: string
  translations: ClubProfileTranslations
  mode?: 'view' | 'preview'      // 'preview' adds the "Preview" label header
}
```

### 5.4 Remove: `PublicLayout`, `PublicNavbar`, `PublicFooter`

These are fully replaced by the dashboard shell. The sidebar footer handles privacy/terms/copyright.

### 5.5 Remove: `my-clubs/page.tsx`

Club list is now always visible in the sidebar. No dedicated page needed.

---

## 6. SEO Considerations

### Direct club URLs remain indexable

`/{lang}/{country}/{club}` is still a real server-rendered route with:
- Proper `<title>` and `<meta description>` via `generateMetadata()`
- JSON-LD structured data via `generateClubJsonLd()`
- Full HTML content rendered server-side (the profile content is in the initial HTML)
- The sidebar is server-rendered too (no layout shift)

### Search page

`/{lang}/search` with query params (`?country=ch`) is also indexable. Each country variant produces a distinct page with relevant content.

### Sitemap

Existing sitemap generation should continue to emit `/{lang}/{country}/{club}` URLs. These remain the canonical URLs for club profiles.

---

## 7. Migration Phases

### Phase 1: Dashboard Shell Foundation

**Goal**: Replace both layout systems with the unified dashboard shell.

1. Create `(dashboard)/layout.tsx` with `AppSidebar` (role-aware)
2. Create `(auth)/auth/layout.tsx` for standalone auth pages
3. Move Home, About, Support, Apply pages under `(dashboard)/`
4. Ensure sidebar renders correctly for unauthenticated, club admin, and operator
5. Remove `PublicLayout`, `PublicNavbar`, `PublicFooter`, `MobileNavMenu`
6. Remove `(platform)/layout.tsx` and `(country)/[country]/layout.tsx`
7. Move Account pages from `/admin/account` to `/account`

**Tests**: All existing pages render within new shell. Auth pages render without sidebar. Navigation works.

### Phase 2: Search Master-Detail

**Goal**: Replace the country directory and club profile pages with the search master-detail.

1. Create `SearchPage` client component (master-detail pattern)
2. Create `search/page.tsx` — fetches all countries/clubs, renders `SearchPage`
3. Modify `[country]/[club]/page.tsx` — keep metadata/JSON-LD, render `SearchPage` with `preSelectedClub`
4. Add server action or API route for fetching clubs by country (for client-side country switching)
5. Merge `ProfilePage` and `ProfilePreview` into unified `ClubProfile` component
6. Remove standalone country directory page (`[country]/page.tsx`) — absorbed into search
7. Update `ClubCard` for use within `SearchPage` master panel

**Tests**: Search page filters work. Club detail opens inline. Direct club URLs render correctly with SEO metadata. Mobile master-detail tabs work.

### Phase 3: Admin Integration

**Goal**: Move club admin and operator pages into the unified shell.

1. Move club admin pages from `/admin/club/[clubId]/*` to `/club/[clubId]/*`
2. Move operator pages to keep `/admin/applications` and `/admin/clubs`
3. Update `AdminSidebar` → use new `AppSidebar` (already done in Phase 1)
4. Remove old `admin/(protected)/layout.tsx` — auth guards move to sub-layouts
5. Update all internal links and redirects
6. Remove `/my-clubs` page

**Tests**: Club admin form still works. Operator queue pages work. Auth redirects correct. Unsaved changes detection works.

### Phase 4: Polish & Cleanup

1. Remove dead components (`PublicLayout`, `NavLink`, old sidebar)
2. Update translations (remove unused keys, add new sidebar keys)
3. Update proxy/middleware redirect targets
4. Update email templates with new URLs (if any hardcoded links)
5. Responsive QA pass — sidebar collapse, mobile detail views
6. SEO audit — verify metadata, JSON-LD, sitemap URLs
7. Update tests

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SEO regression on club pages | High | Keep `/{lang}/{country}/{club}` as real server-rendered routes with metadata. Verify with Google Search Console after deploy. |
| Auth complexity in shared layout | Medium | Dashboard layout handles null session gracefully. Protected sub-routes have their own auth guard layouts. |
| Search page performance (loading all clubs) | Medium | Initial load only shows country picker. Clubs fetched per-country on demand. Pagination if >100 clubs per country. |
| Mobile sidebar UX for visitors | Medium | Sidebar starts collapsed on mobile. Clean hamburger trigger. Consider a topbar shortcut for key items (Search, Sign In). |
| Breaking existing bookmarks/links | Low | The main public URL `/{lang}/{country}/{club}` is preserved. Old `/admin/*` URLs can 301-redirect. |
| Large migration surface area | High | Phase the work. Each phase is independently deployable and testable. |

---

## 9. URL Redirects (Backwards Compatibility)

```
/{lang}/admin                     → /{lang}              (home)
/{lang}/admin/account             → /{lang}/account
/{lang}/admin/account/totp-setup  → /{lang}/account/totp-setup
/{lang}/admin/club/{id}           → /{lang}/club/{id}
/{lang}/admin/club/{id}/settings  → /{lang}/club/{id}/settings
/{lang}/my-clubs                  → /{lang}              (clubs visible in sidebar)
/{lang}/{country}                 → /{lang}/search?country={country}
```

These can be implemented as Next.js `redirects` in `next.config.ts` or as catch-all middleware rules.

---

## 10. Translation Keys to Add

```typescript
sidebar: {
  home: string
  search: string
  about: string
  support: string
  registerClub: string
  signIn: string
  platform: string        // Section label for operator
  myClubs: string         // Section label
}
search: {
  title: string           // "Find a club"
  selectCountry: string
  backToResults: string
  // ... filter labels (reuse from directory.*)
}
```

---

## 11. Files to Delete After Migration

```
src/app/[lang]/(platform)/layout.tsx
src/app/[lang]/(platform)/page.tsx              → moved to (dashboard)/page.tsx
src/app/[lang]/(platform)/about/page.tsx        → moved
src/app/[lang]/(platform)/support/page.tsx      → moved
src/app/[lang]/(platform)/apply/page.tsx        → moved
src/app/[lang]/(country)/[country]/layout.tsx
src/app/[lang]/(country)/[country]/page.tsx     → absorbed into search
src/app/[lang]/(country)/[country]/[club]/layout.tsx → simplified
src/app/[lang]/admin/(protected)/layout.tsx     → replaced by (dashboard)/layout.tsx
src/app/[lang]/admin/(protected)/page.tsx       → removed (admin overview)
src/app/[lang]/my-clubs/                        → removed
src/components/layout/public-layout.tsx
src/components/layout/public-navbar.tsx
src/components/layout/public-footer.tsx
src/components/layout/mobile-nav-menu.tsx
src/components/layout/nav-link.tsx
src/components/app/admin/AdminSidebar.tsx       → replaced by AppSidebar
src/components/app/club-admin/ProfilePreview.tsx → merged into ClubProfile
```
