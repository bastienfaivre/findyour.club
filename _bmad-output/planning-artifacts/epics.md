---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
lastEdited: '2026-03-09'
editHistory:
  - date: '2026-03-09'
    changes: 'Added Epic 9 (Launch Readiness): Stories 9.1-9.4 covering dev infra image upload
      fix, GDPR account deletion, data export, and operator club deletion. Marked Story 7.8
      as superseded (replaced by threaded messaging). Marked Stories 8.2 and 8.4 as deferred
      (depend on analytics infrastructure).'
  - date: '2026-03-09'
    changes: 'Dashboard migration sync: All route groups consolidated under (dashboard). Stories 3.7
      and 3.8 marked as superseded (PublicLayout replaced by unified dashboard shell with AppSidebar).
      Story 1.4 updated: /my-clubs removed, clubs visible in sidebar. Story 4.4 updated: AdminSidebar
      replaced by AppSidebar. Story 4.9 updated: OperatorMessage evolved to threaded SupportMessage
      system. Architectural assumptions updated throughout to reflect unified shell routing.'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# website-template - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for website-template, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Club Site Configuration & Navigation**

FR1: Club Admin can configure their site's core identity elements (name, logo, welcome text)
FR2: Club Admin can access a dedicated admin dashboard to manage their club site content, with a link to preview the public view
FR3: Club Admin can activate and deactivate optional pages in their site's navigation
FR4: Club Admin can create custom pages with user-defined navigation labels
FR5: Club Admin can configure one level of sub-pages within their site's navigation
FR6: System prevents Club Admin from removing anchor pages (Home and Contact)
FR7: System enforces a configurable maximum page count per club site
FR8: ~~Deferred to post-MVP~~ Club Admin can set up and manage a custom domain for their site
FR9: System provisions a URL path for each approved club immediately upon acceptance
FR46: Club Admin can select an accent color for their site from a curated palette of 8 presets
FR47: Club Admin can configure an external website link on their club site that directs visitors to the club's own website

**Content Editing & Element Library**

FR10: Club Admin can add, configure, and remove elements on custom pages using a visual element picker
FR11: Club Admin can configure Contact page sub-blocks (contact form, map, phone number, email address, predefined message subjects) independently
FR12: Club Admin can create, edit, and delete calendar events on a Calendar page
FR13: Club Admin can upload and manage images and videos in a Gallery page
FR14: Club Admin can upload and manage documents and PDFs in a Documents library page
FR15: Club Admin can add and edit rich text content on custom pages
FR16: Club Admin can add and edit inline images on custom pages
FR17: Club Admin can explicitly save changes to their site
FR18: Club Admin can view their site's version history and restore a previous version
FR19: System displays file constraints (size limits, accepted formats) inline at the point of upload

**Public Discovery & Contact**

FR20: Public Visitor can browse a directory of all member associations on the platform site
FR21: Public Visitor can filter the directory by country, activity type, and location
FR22: Public Visitor can view any club's public website without authentication
FR23: Public Visitor can submit a contact message through a club's contact form
FR24: System delivers contact form submissions to the club's registered email address with reply-to set to the sender's address
FR25: Public Visitor can navigate from any club site to the platform directory via a footer link
FR26: System displays a platform attribution link in the footer of every hosted club site

**Application & Access**

FR27: Club Applicant can submit an application to join the platform providing association name, activity type, description, and optionally their existing website URL
FR28: Club Admin can authenticate and access their site's edit mode via the platform site login
FR29: Platform Operator can authenticate via a dedicated platform-level admin interface separate from club sites
FR30: Club Admin can submit a support request to the platform team from the platform site

**Platform Operations**

FR31: Platform Operator can view and manage a queue of pending club applications
FR32: Platform Operator can approve an application, triggering automatic URL path provisioning and an acceptance email to the applicant
FR33: Platform Operator can reject an application with an explanatory email to the applicant
FR34: Platform Operator can view platform-wide metrics (clubs live, uptime, performance scores, storage)
FR35: Platform Operator can monitor site health status across all hosted club sites
FR36: Platform Operator can send a notification to a club admin regarding a detected site issue
FR37: Platform Operator can view and respond to club admin support requests
FR38: Platform Operator can configure platform-wide operational variables including the per-club page limit
FR39: System applies template version updates to all club sites automatically without downtime or any action required from club admins

**Compliance & Data Rights**

FR40: Club Admin can export all their club's content data in a portable standard format
FR41: Club Admin can request deletion of their club's data from the platform
FR42: System presents a cookie consent mechanism to users on the platform site and on club sites where applicable
FR43: System automatically generates and maintains SEO metadata for all club site pages without requiring any admin configuration
FR44: Club Admin can view stored contact form submissions received for their site
FR45: Platform Operator can view detailed per-club analytics (traffic, page views, edit events, login events, contact form submission counts)

**Platform Funding**

FR50: Public Visitor can access a donation/support page on the platform site to contribute to the platform's funding through voluntary donations

### NonFunctional Requirements

**Performance**

NFR1: Club site home pages achieve Time to First Contentful Paint < 2 seconds on a standard broadband connection
NFR2: SPA-style inner page transitions load content within 2 seconds of navigation (loading skeleton displayed within 100ms)
NFR3: All public-facing pages score ≥ 90 on Core Web Vitals (Lighthouse performance, SEO, accessibility)
NFR4: No performance regression on any club site following a silent template migration
NFR5: Platform admin dashboard collects analytics per club site retained for a minimum of 12 months

**Security**

NFR6: All data encrypted at rest and in transit (TLS 1.2+ enforced on all connections)
NFR7: Contact form submissions stored and accessible to Club Admin — stored submissions encrypted at rest
NFR8: Admin authentication supports TOTP-based 2FA (authenticator app); 2FA strongly recommended with mandatory prompt until enabled
NFR9: Passkey (WebAuthn / FIDO2) support available as an authentication method
NFR10: Password strength enforced at account creation (minimum length, complexity, rejection of common/breached passwords)
NFR11: Admin credentials hashed using bcrypt or Argon2
NFR12: No sensitive club or admin data exposed in client-side code or public API responses
NFR13: Multi-tenant isolation: one club's data and operations cannot be accessed or affected by another club

**Reliability**

NFR14: Platform uptime ≥ 99.9% measured monthly across all hosted club sites and the platform site
NFR15: Template migrations complete with zero downtime — no club site goes offline during an upgrade
NFR16: Email relay delivery is monitored; failures trigger an operator alert within 15 minutes of failure detection
NFR17: Version history restore completes within 30 seconds of a Club Admin initiating a rollback

**Scalability**

NFR18: Architecture supports growth from ~10 clubs to thousands without re-architecture
NFR19: Hosting infrastructure is horizontally scalable — capacity added without service interruption
NFR20: Multi-tenant data model isolates clubs at the storage layer — one club's growth does not degrade another's performance

**Accessibility**

NFR21: WCAG 2.1 AA compliance is the binding requirement for all public-facing surfaces and the admin/edit interface
NFR22: Best-effort WCAG AAA applied where practically achievable
NFR23: All interactive elements operable via keyboard alone
NFR24: All dynamic content compatible with screen readers (ARIA roles and labels on all interactive components)

**Maintainability**

NFR25: Template versioning system supports silent migration of all club sites without any manual operator or admin intervention
NFR26: Platform color scheme updatable via a single token variable change — no component-level edits required
NFR27: All platform-wide configurable variables adjustable via the admin dashboard without a code deployment

### Additional Requirements

**Architecture — Starter Template (impacts Epic 1 Story 1):**

- **STARTER TEMPLATE SPECIFIED**: `create-next-app` (base) with Next.js 16 App Router, TypeScript, Tailwind, ESLint, Turbopack, `--import-alias "@/*"`. This is the first implementation story.
- Initialization command: `pnpm create next-app@latest website-template --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"`
- Post-init dependencies: Prisma v7, Auth.js v5 (NextAuth beta), Zod, Argon2, otplib, @simplewebauthn/*, shadcn/ui
- Package manager: pnpm exclusively

**Architecture — Infrastructure & Deployment:**

- Docker Compose setup: Next.js + PostgreSQL + Nginx + Certbot (self-hosted on Infomaniak VPS, Swiss/EU)
- Nginx for single-domain routing (custom domain passthrough deferred to post-MVP)
- Certbot/Let's Encrypt for automated TLS (single domain via HTTP-01)
- GitHub Actions CI/CD pipeline: lint → typecheck → pnpm audit → build → SSH deploy
- `next.config.ts` output: 'standalone' for minimal Docker image

**Architecture — Data Architecture:**

- PostgreSQL with Prisma ORM v7; application-level multi-tenant isolation (clubId on every query)
- Prisma middleware enforces clubId filter on all club-scoped models (CRITICAL security pattern)
- Content storage: `page_elements` table with JSONB `data` field per element type
- Structured tables for events, gallery_items, documents (relational for query efficiency)
- Version history: full JSONB page snapshots in `content_versions` table; N-version retention configurable
- File storage: Cloudflare R2 (S3-compatible), presigned URLs, no bytes through Next.js server
- Analytics: custom `page_events` table with irreversible ip_hash (SHA-256 + daily salt); 12-month retention
- URL architecture: all routes under unified `(dashboard)` route group — public club pages at `/{lang}/{country}/{club-slug}`, club admin at `/{lang}/club/{clubId}/`, operator admin at `/{lang}/admin/`, search at `/{lang}/search` (language and country are independent; no DNS provisioning per club)

**Architecture — Authentication & Security:**

- Auth.js v5 with Prisma adapter (database sessions)
- First login: one-time magic link (1-hour TTL, hashed, single-use); then password + TOTP enrollment
- TOTP via otplib; Passkeys via @simplewebauthn/*; Argon2 for password hashing
- AES-256-GCM contact form submission encryption (lib/crypto.ts)
- Cloudflare Turnstile for bot protection on all public forms (zero-dependency React component)
- HTTP security headers via Nginx; strict CSP via Next.js headers()
- Reserved slug list (21 entries) enforced at application submission time (lib/slug.ts)

**Architecture — Email & Communication:**

- Resend as email provider (EU GDPR-compliant, DPA available)
- Email relay monitoring via `/api/health` Route Handler + UptimeRobot 5-min polling (15-min alert SLA)
- In-memory rate limiting for MVP (Map-based sliding window per IP)

**Architecture — Frontend Patterns:**

- TipTap (MIT) for rich text editing — imported via `dynamic(..., { ssr: false })` (CRITICAL: never at module level)
- React Context for AuthContext; unified dashboard shell with `AppSidebar` — club admin pages at `/{lang}/club/{clubId}/`, operator pages at `/{lang}/admin/`
- Zod schemas as single source of truth for Server Actions, Route Handlers, and react-hook-form validation
- API response contract: `{ success: true; data: T }` or `{ success: false; error: string; code?: string }`
- All Server Actions begin with 3-step auth guard: session → role check → clubId from URL params (verified by ClubMembership in layout)

**UX — Design System:**

- Tailwind CSS + Radix UI primitives (shadcn/ui pattern) — owned component copies in `src/components/ui/`
- OKLCH color token architecture as CSS custom properties (zinc base + configurable accent)
- System font stack only (ui-sans-serif) — no external font loading
- 8 curated accent color presets (Zinc, Blue, Green, Red, Violet, Orange, Rose, Yellow)
- Amber-500 as the exclusive unsaved-changes indicator (used nowhere else)

**UX — Edit Mode:**

- All pages render within a unified dashboard shell (`AppSidebar` + `SidebarInset`) with role-based sidebar sections
- Mobile: collapsible sidebar drawer for all pages
- Validate on blur, not on keystroke; inline error messages linked via aria-describedby
- Skeleton loading within 100ms on all SPA-style transitions

**UX — Responsive & Accessibility:**

- Mobile-first (Tailwind base styles for mobile, `md:` and `lg:` for larger screens)
- Full feature parity on mobile including edit/admin mode
- Minimum 44×44px touch targets on all interactive elements
- Skip link as first element in `<body>` on every page
- `prefers-reduced-motion` media query applied globally
- axe-core in development + Pa11y CLI + Lighthouse accessibility ≥ 90 gated in CI

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 4 | Club identity configuration |
| FR2 | Epic 4 | Edit/public view toggle |
| FR3 | Epic 4 | Activate/deactivate optional pages |
| FR4 | Epic 4 | Create custom pages |
| FR5 | Epic 4 | Sub-page configuration |
| FR6 | Epic 4 | Anchor page protection |
| FR7 | Epic 4 | Configurable page limit enforcement |
| FR8 | Post-MVP | Custom domain management (deferred) |
| FR9 | Epic 2 | Subdomain provisioning on acceptance |
| FR46 | Epic 4 | Accent color picker (MVP) |
| FR10 | Epic 5 | Element picker for custom pages |
| FR11 | Epic 5 | Contact page sub-blocks |
| FR12 | Epic 5 | Calendar event management |
| FR13 | Epic 5 | Gallery management |
| FR14 | Epic 5 | Documents library management |
| FR15 | Epic 5 | Rich text content editing |
| FR16 | Epic 5 | Inline image editing |
| FR17 | Epic 4 | Explicit save |
| FR18 | Epic 4 | Version history & restore |
| FR19 | Epic 5 | Inline file constraint display |
| FR20 | Epic 3 | Directory browsing |
| FR21 | Epic 3 | Directory filtering |
| FR22 | Epic 3 | Public club site access (no auth) |
| FR23 | Epic 6 | Contact form submission |
| FR24 | Epic 6 | Contact form email relay |
| FR25 | Epic 3 | Footer link → platform directory |
| FR26 | Epic 3 | Platform attribution footer |
| FR27 | Epic 2 | Club application form |
| FR28 | Epic 1 | Club Admin authentication |
| FR29 | Epic 1 | Platform Operator authentication |
| FR30 | Epic 6 | Support request from platform site |
| FR31 | Epic 2 | Application queue management |
| FR32 | Epic 2 | Application approval + provisioning |
| FR33 | Epic 2 | Application rejection + email |
| FR34 | Epic 7 | Platform-wide metrics |
| FR35 | Epic 7 | Site health monitoring |
| FR36 | Epic 7 | Operator nudge to club admin |
| FR37 | Epic 7 | Support inbox management |
| FR38 | Epic 7 | Platform variable configuration |
| FR39 | Epic 7 | Silent template migration |
| FR40 | Epic 8 | Club data export |
| FR41 | Epic 8 | Club data deletion |
| FR42 | Epic 8 | Cookie consent mechanism |
| FR43 | Epic 3 | Automated SEO metadata |
| FR44 | Epic 6 | Contact submission storage & view |
| FR45 | Epic 7 | Per-club analytics view |
| FR47 | Epic 4 | External website link configuration |
| FR50 | Epic 3 | Donation/support page |

## Epic List

### Epic 1: Project Foundation & Core Infrastructure
The development environment, database schema, authentication system, multi-club membership model, and deployment pipeline are operational. Developers can run the full stack locally; Club Admins can authenticate via magic link, TOTP, and passkeys, manage multiple clubs from the sidebar MY CLUBS section, and Owners can invite Editors, transfer ownership, and revoke access; Platform Operators can authenticate through the unified login page and access operator sidebar sections.
**FRs covered:** FR28, FR29
**NFRs addressed:** NFR6, NFR8–13, NFR14–15, NFR18–20, NFR25–27

### Epic 2: Club Application & Onboarding
Club Applicants can submit an application to join the platform; the Platform Operator can review the queue and approve or reject applications; approved clubs receive a provisioned URL path and a login link by email — fully automated.
**FRs covered:** FR9, FR27, FR31, FR32, FR33

### Epic 3: Public Platform Site & Discovery
The platform directory is the core product surface. Public Visitors can browse the homepage, filter the country directory by activity type and location, and navigate to individual club sites. Every club site has automatic SEO and a platform attribution footer. The donation page is part of the platform site. Additionally, this epic establishes the design system foundation: dark/light mode theming (system-following via next-themes), the public layout shell (Dub.co-inspired centered layout with sticky top navbar and standard footer), and refactoring all existing public pages to the new consistent layout.
**FRs covered:** FR20, FR21, FR22, FR25, FR26, FR43, FR50
**NFRs addressed:** NFR1, NFR2, NFR3, NFR21–24, NFR26

### Epic 4: Club Profile Setup & Moderation
Rework the application form to collect club profile fields (description, schedule, contact info, how to join), seed the club profile on approval with optional operator message, build club admin pages within the unified dashboard shell (`AppSidebar`) with profile edit form and photo upload, implement publish/unpublish with operator force-offline override, render the single-page public club profile with photo carousel, and add operator club moderation tools (threaded bidirectional messaging via `SupportMessage`, force offline).
**FRs covered:** FR1, FR2, FR9, FR17, FR19, FR27, FR32, FR36, FR47, FR48, FR49, FR51, FR52, FR53, FR54, FR55, FR56, FR57
**NFRs addressed:** NFR4, NFR21-24

### Epic 5: Club Content Elements _(Deferred to post-MVP)_
~~Club Admins can add and manage rich content on custom pages using the element library: rich text, inline images, calendar events, image/video galleries, and document libraries.~~ Entire epic deferred to post-MVP. Depends on multi-page site builder expansion. Schema models (`Page`, `PageElement`, `ContentVersion`, `Event`, `GalleryItem`, `Document`) are retained in the database for future use.
**FRs covered:** ~~FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR19~~ (all deferred)

### Epic 6: Contact & Communication _(Partially deferred)_
~~Public Visitors can contact clubs through a contact form with automatic email relay.~~ Contact form, email relay, and contact submission viewing are deferred to post-MVP. Club Admin support request form remains in MVP scope.
**FRs covered:** ~~FR23, FR24, FR44~~ (deferred), FR30 (MVP)
**NFRs addressed:** ~~NFR7, NFR16~~ (deferred)

### Epic 7: Platform Operations & Health Monitoring
The Platform Operator can view platform-wide metrics, monitor club site health, manage the support inbox, configure platform-wide operational variables without a deployment, view per-club analytics, and trust that template updates are silently applied to all clubs with zero downtime. Operator-club messaging is handled by the threaded SupportMessage system (Epic 4) — Story 7.7 (Operator Nudge) removed.
**FRs covered:** FR34, FR35, FR37, FR38, FR39, FR45
**NFRs addressed:** NFR4, NFR5, NFR15, NFR16, NFR25, NFR27

### Epic 8: Data Compliance
All GDPR/nDSG data rights are available: clubs can export their profile data and photos and request deletion. A cookie consent mechanism is presented where legally required. Data retention policies are enforced automatically. Custom domain support (FR8) is deferred to post-MVP.
**FRs covered:** FR40, FR41, FR42
**NFRs addressed:** NFR6 (TLS encryption)

---

## Epic 1: Project Foundation & Core Infrastructure

The development environment, database schema, authentication system, multi-club membership model, and deployment pipeline are operational. Club Admins can authenticate via magic link, TOTP, and passkeys; see all their clubs in the sidebar MY CLUBS section; and manage membership (invite Editors, transfer ownership, revoke access). Platform Operators authenticate via the unified login page and access operator sidebar sections.

### Story 1.1: Project Scaffold & Development Environment

As a developer,
I want the project initialized with Next.js 16 App Router, TypeScript, Tailwind, pnpm, Docker Compose (local dev + production), and a GitHub Actions CI/CD pipeline,
So that the team has a consistent, fully deployable development environment from day one.

**Acceptance Criteria:**

**Given** the repository is cloned,
**When** `docker compose -f docker-compose.dev.yml up` is run,
**Then** the Next.js dev server, PostgreSQL, MinIO (R2 equivalent), and Mailpit (email equivalent) containers all start successfully with no errors.

**Given** the dev environment is running,
**When** the browser navigates to `http://localhost:3000`,
**Then** the Next.js app loads; and `http://localhost:3000/fr/ch/ski-club-valais` resolves to the CH country route for the French language via `lib/country.ts` and `resolveUILang()`.

**Given** code is pushed to the `main` branch,
**When** GitHub Actions runs the CI pipeline,
**Then** all stages pass in sequence: lint → typecheck → `pnpm audit` → build — any stage failure blocks the next.

**Given** the production Docker Compose (`docker-compose.prod.yml`),
**When** the image is built via the multi-stage Dockerfile,
**Then** `output: 'standalone'` produces a minimal runner image; `build-essential` and `python3` are present in the builder stage only (required for Argon2 native bindings).

**Given** the project root,
**Then** `.env.example` documents every required environment variable with local dev default values and no real secrets committed.

**Given** the Nginx config in `nginx/nginx.conf`,
**Then** all requests are routed to the Next.js server, and `maintenance.html` is served on 502/503 responses.

---

### Story 1.2: Database Schema & Multi-Tenant Foundation

As a developer,
I want the complete Prisma schema with all core models, multi-tenant middleware, and a development seed,
So that all subsequent features can be built on a secure, isolated data foundation.

**Acceptance Criteria:**

**Given** `pnpm prisma migrate dev` is run on a fresh database,
**When** migrations complete,
**Then** all tables exist with correct snake_case column names via `@map`/`@@map` directives: `clubs`, `club_memberships`, `pages`, `page_elements`, `content_versions`, `users`, `sessions`, `page_events`, plus Auth.js adapter tables; `club_memberships` has a unique constraint on `(user_id, club_id)` and is indexed by `club_id`.

**Given** the Prisma client singleton in `src/server/db.ts`,
**When** any club-scoped Prisma query executes without a `clubId` filter,
**Then** the Prisma middleware throws an error — the query does not reach the database.

**Given** any club-scoped Prisma query in the codebase,
**Then** it always filters by both `id` and `clubId` in a single atomic `where` clause — never a sequential fetch-then-check.

**Given** `pnpm prisma db seed` is run,
**When** the seed completes,
**Then** the database contains: 1 operator account (Argon2-hashed), 2 sample clubs with all element types populated, 3 content versions per page, 3 applications (pending/approved/rejected), 5 encrypted contact submissions, and 90 days of analytics events; each sample club has at least one `ClubMembership` record with `role: OWNER, status: ACTIVE` linked to a seeded club admin user with TOTP enrolled.

**Given** the `clubs` table schema,
**Then** it includes `storage_limit_bytes` and `storage_used_bytes` columns for per-club storage accounting.

---

### Story 1.3: Club Admin First Login — Magic Link, Password Setup & TOTP Enrollment

As a Club Admin,
I want to receive a magic link by email, set my password on first access, and be prompted to enroll TOTP 2FA,
So that I can securely log into my club's edit mode without a default password ever existing.

**Acceptance Criteria:**

**Given** a club has been provisioned and an acceptance email dispatched,
**When** the Club Admin clicks the magic link,
**Then** they arrive at `/auth/setup`; the link is valid for 1 hour, is single-use, and the token is stored as a SHA-256 hash — an expired or reused link shows a clear error message with a path to contact support.

**Given** the Club Admin is on the password setup page,
**When** they submit a password meeting strength requirements (minimum length, character complexity, not in the common/breached-passwords list),
**Then** the password is hashed with Argon2 and stored; the magic link token is immediately invalidated.

**Given** the Club Admin completes password setup,
**When** the form is submitted successfully,
**Then** a session is created and they are redirected to `/{lang}/` (the dashboard homepage); their clubs appear in the sidebar under the MY CLUBS section; if TOTP is not yet enrolled, a persistent non-dismissible banner on every club page prompts enrollment — the QR code screen is accessed from that banner's link.

**Given** a Club Admin session exists but TOTP is not yet enrolled,
**When** they access any authenticated page,
**Then** a persistent, non-dismissible banner prompts TOTP enrollment with a direct link to the enrollment screen.

**Given** a Club Admin has TOTP enrolled,
**When** they log in with their password on the standard login page,
**Then** they are redirected to a TOTP challenge page; a valid 6-digit code is required before the session is fully established; on success they are redirected to `/{lang}/` (the dashboard homepage).

**Given** an incorrect TOTP code is submitted,
**Then** an inline error is shown and subsequent attempts from the same IP are rate-limited via the in-memory sliding window limiter.

---

### Story 1.4: Dashboard Homepage & Club Membership Guard

As a Club Admin,
I want my clubs to appear in the sidebar under a MY CLUBS section with role indicators, and a server-side membership check on every club edit route,
So that I can navigate to any of my clubs from the sidebar and be blocked from accessing clubs I am not a member of.

**Acceptance Criteria:**

**Given** an authenticated Club Admin is on any dashboard page,
**When** the sidebar renders,
**Then** all clubs where they hold an `ACTIVE` `ClubMembership` are listed under the MY CLUBS sidebar section with a role badge (`Owner` or `Editor`); each entry links to that club's admin URL at `/{lang}/club/{clubId}/`.

**Given** an authenticated Club Admin has no active memberships,
**When** the sidebar renders,
**Then** the MY CLUBS section shows an empty-state message: "You are not a member of any club — contact the platform operator."

**Given** any authenticated user visits a club edit URL (`/{lang}/club/{clubId}/...`),
**When** the club layout (`club/[clubId]/layout.tsx`) renders,
**Then** the server performs a `ClubMembership.findFirst({ where: { userId, clubId, status: ACTIVE } })` lookup; if no active membership exists the user is redirected to `/{lang}/` (the dashboard homepage).

**Given** the session object,
**Then** it never includes `clubId`; the active club is always resolved from the URL path and verified via `ClubMembership` at layout render time — never from stored session data.

**Given** every successful authentication event (password setup, TOTP enrollment, TOTP challenge, regular login without TOTP),
**Then** the user is redirected to `/{lang}/` (the dashboard homepage) — never directly to a specific club edit URL.

**Given** `pnpm prisma db seed` is run,
**When** the seed completes,
**Then** `prisma/seed.ts` creates `ClubMembership` records (`role: OWNER, status: ACTIVE`) linking each seeded club admin user to their respective sample club — the sidebar MY CLUBS section and membership guard are fully exercisable against seeded data without any manual DB intervention.

> **Dev note — seed carry-over from Story 1.2:** The `prisma/seed.ts` was not updated when the architect introduced the `ClubMembership` model (ADR-001). The schema is correct; only the seed data is missing. Updating the seed is the **first task** of this story.

---

### Story 1.5: Platform Operator Authentication & Admin Route Protection


As a Platform Operator,
I want to authenticate via the unified login page with password and TOTP, with all `/admin/*` routes protected by a layout guard,
So that I can securely access the operator sections of the dashboard, fully isolated from club admin sessions.

**Acceptance Criteria:**

**Given** the login page at `/{lang}/auth/login`,
**When** the Platform Operator submits their email and correct password,
**Then** they are presented with a TOTP challenge; submitting a valid code establishes an operator session; operator-specific sidebar sections (Applications, Clubs, Messages) become visible in the `AppSidebar`.

**Given** a valid operator session,
**When** any `/{lang}/admin/*` route is accessed,
**Then** the admin layout guard allows access and the operator dashboard sections render within the unified dashboard shell.

**Given** no session or a Club Admin session,
**When** any `/{lang}/admin/*` route is accessed,
**Then** the layout guard redirects to `/{lang}/auth/login` — no dashboard content is served.

**Given** a Club Admin with an active membership for Club A only,
**When** they attempt to access Club B's edit route,
**Then** the club layout membership guard blocks access — no active `ClubMembership` exists for Club B — and redirects to `/{lang}/` (the dashboard homepage).

**Given** a public visitor (no session),
**When** they attempt to access a club's admin URL (`/{lang}/club/{clubId}/`),
**Then** the layout guard redirects to `/{lang}/auth/login`.

**Given** the seeded operator account,
**When** logging into `/{lang}/auth/login` with the seeded credentials,
**Then** login succeeds and the operator sidebar sections are accessible.

---

### Story 1.6: Passkey (WebAuthn) Authentication

As a Club Admin or Platform Operator,
I want to register and use a passkey (biometrics or hardware security key) as an authentication method,
So that I have a phishing-resistant, passwordless login option that also satisfies the 2FA requirement.

**Acceptance Criteria:**

**Given** an authenticated user in their account settings,
**When** they initiate passkey registration,
**Then** the browser presents a WebAuthn credential creation prompt; on success the credential is stored in the database linked to the user account via `@simplewebauthn/server`.

**Given** a registered passkey credential,
**When** the user selects "Sign in with passkey" on the login page,
**Then** the browser prompts for the registered authenticator; a valid challenge response establishes a full session without a separate TOTP step (passkey satisfies the MFA requirement).

**Given** passkey authentication is unavailable (unsupported browser or no registered credential),
**When** the user visits the login page,
**Then** the password + TOTP flow is available as the primary fallback.

**Given** a user account with a registered passkey,
**When** the credential is removed from account settings,
**Then** the WebAuthn credential is deleted from the database and can no longer be used to authenticate.

---

### Story 1.7: Invite Editor

As a Club Owner,
I want to invite another person by email to co-manage my club as an Editor,
So that I can delegate content editing without sharing my credentials.

**Acceptance Criteria:**

**Given** a Club Owner is on the club settings page,
**When** they submit an email address to invite as Editor,
**Then** if the email matches an existing user, a `ClubMembership` record is created with `role: EDITOR, status: PENDING` and an invitation email is sent with a time-limited accept link; if the email belongs to a new user, a user record is created (no password, no TOTP) and the same flow applies — the accept link triggers credential setup followed by automatic membership activation.

**Given** the invited person clicks the accept link and is a new user,
**When** they complete password setup and TOTP enrollment,
**Then** their `ClubMembership` status is atomically updated to `ACTIVE` in the same transaction that completes credential setup; they are then redirected to `/{lang}/` (the dashboard homepage) where the new club appears in the sidebar.

**Given** the invited person clicks the accept link and is an already-authenticated existing user,
**When** they land on the accept page,
**Then** their `ClubMembership` status is updated to `ACTIVE` immediately and they are redirected to `/{lang}/` (the dashboard homepage) where the new club appears in the sidebar under MY CLUBS.

**Given** an invite accept link is accessed more than 7 days after issuance,
**Then** the link is expired; the user sees a clear error message instructing them to ask the Club Owner to resend the invitation.

**Given** a Club Owner views the club settings membership panel,
**Then** all memberships for that club are listed with their role, status (`Pending` / `Active`), and the email address of each member.

---

### Story 1.8: Transfer Ownership

As a Club Owner,
I want to transfer ownership of my club to an active Editor,
So that management responsibility can change hands cleanly without credential sharing.

**Acceptance Criteria:**

**Given** a Club Owner opens the club settings membership panel,
**When** they select an active Editor and initiate an ownership transfer,
**Then** a confirmation dialog is shown: "Transfer ownership to [name]? You will become an Editor." — no action is taken until the Owner confirms.

**Given** the transfer is confirmed,
**When** the `transferOwnership` Server Action executes,
**Then** the target member's `ClubMembership.role` is set to `OWNER` and the current owner's `ClubMembership.role` is set to `EDITOR` in a single atomic transaction — both succeed or neither does.

**Given** the transfer completes successfully,
**Then** the page reflects the updated role badges and a success toast confirms the transfer.

**Given** a Platform Operator initiates a force-transfer via the admin dashboard (e.g., original owner is unreachable),
**Then** ownership is transferred without requiring current-owner confirmation.

**Given** a Club Owner attempts to transfer to a user with `PENDING` membership,
**Then** the action is rejected: "Cannot transfer ownership to a member who has not yet accepted their invitation."

---

### Story 1.9: Revoke Access

As a Club Owner,
I want to revoke a member's access to my club,
So that former collaborators can no longer edit my club's content.

**Acceptance Criteria:**

**Given** a Club Owner views the membership list,
**When** they click Revoke next to an active Editor,
**Then** a confirmation popover is shown: "Revoke [name]'s access to [club]?" — no action is taken until confirmed.

**Given** revocation is confirmed,
**When** the `revokeMembership` Server Action executes,
**Then** the `ClubMembership.status` is updated to `REVOKED`; on the revoked member's next request to any route under `/{lang}/club/{clubId}/`, the club layout membership guard detects no active membership and redirects them to `/{lang}/` (the dashboard homepage); the club is removed from their sidebar.

**Given** a Club Owner attempts to revoke the last active `OWNER` membership for a club,
**Then** the action is rejected: "A club must always have at least one active Owner."

**Given** a revoked member's active session,
**Then** their existing session token is not invalidated server-side immediately (sessions are short-lived); access is blocked on the next request via the membership guard — no special session invalidation mechanism is required.

---

## Epic 2: Club Application & Onboarding

Club Applicants can submit an application; the Platform Operator can review the queue and approve or reject; approved clubs are automatically provisioned with a URL path and receive a login link by email.

### Story 2.0: i18n Location Infrastructure

As a platform engineer,
I want a multilingual location data model backed by the swisstopo geocoding API,
So that Swiss cities and cantons are stored as unique normalized entities with names in all four supported languages (fr/de/it/en), enabling the apply form typeahead, directory filtering, and correct SEO `lang` attributes.

**Acceptance Criteria:**

**Given** the Prisma schema is migrated,
**Then** `SwissCanton`, `SwissCantonTranslation`, updated `SwissLocation`, and `SwissLocationTranslation` models exist; `Club` has `defaultLanguage String @default("fr")`.

**Given** the database is seeded,
**Then** all 26 Swiss cantons exist with translations in all 4 languages.

**Given** `GET /api/locations?country=ch&q=gen&lang=de`,
**Then** the route returns `{ swisstopoId, plz, name, cantonCode }` objects where `name` reflects the requested language (e.g., `"Genf"` for `lang=de`).

**Given** `upsertSwissLocation` is called for a new city,
**Then** `SwissLocation` + 4 `SwissLocationTranslation` rows + a `Location` bridge record are created; the function returns `{ locationId }`.

**Given** `upsertSwissLocation` is called for an existing city,
**Then** no rows are created; the existing `locationId` is returned (idempotent).

**Note:** Prerequisite for 2-1 (apply form typeahead), 2-3 (approval provisioning), and 3-2 (directory filtering).

---

### Story 2.1: Club Application Form

As a Club Applicant,
I want to submit an application to join the platform by providing my association's name, activity type, and a short description,
So that the platform team can review whether my association is a good fit.

**Acceptance Criteria:**

**Given** a visitor navigates to the `/apply` page on the platform site,
**When** the page loads,
**Then** a form is displayed with three fields: association name (required), activity type (required, select from predefined list), and description (required, free text); a Cloudflare Turnstile widget is present.

**Given** the applicant fills all required fields and completes the Turnstile challenge,
**When** they submit the form,
**Then** the application is stored in the database with status `pending`; a success confirmation is shown on screen; no email is sent to the applicant at this stage.

**Given** any required field is missing on submission,
**Then** inline field-level validation errors appear below the relevant field on blur; the form is not submitted.

**Given** the Turnstile token verification fails server-side,
**Then** the Server Action returns `{ success: false, error: 'Bot protection failed', code: 'TURNSTILE_FAILED' }` and an inline error is shown.

**Given** the same IP submits multiple applications in a short window,
**Then** the in-memory rate limiter blocks subsequent submissions with a clear error message.

---

### Story 2.2: Operator Application Review Queue

As a Platform Operator,
I want to view all pending club applications in a queue with approve and reject actions,
So that I can curate which associations join the platform.

**Acceptance Criteria:**

**Given** the operator is authenticated and navigates to `/admin/applications`,
**When** the page loads,
**Then** all applications with status `pending` are displayed as `ApplicationQueueItem` rows showing: association name, activity type, description (truncated, expandable), and submitted date.

**Given** there are no pending applications,
**Then** an empty state message is shown: "No pending applications."

**Given** a pending application row,
**When** the operator clicks the Approve button,
**Then** a confirmation popover appears: "Approve [Club Name]? Their URL path will be provisioned and a login link sent."; no action is taken until confirmed.

**Given** a pending application row,
**When** the operator clicks the Reject button,
**Then** a confirmation dialog appears with an optional free-text reason field; no action is taken until confirmed.

**Given** multiple pending applications,
**Then** they are sorted by submission date ascending (oldest first).

---

### Story 2.3: Application Approval — Provisioning & Acceptance Email

As a Platform Operator,
I want approving an application to automatically provision the club's URL path and send an acceptance email with a magic link,
So that approved clubs can start setting up their site immediately with no manual steps.

**Acceptance Criteria:**

**Given** the operator confirms approval of a pending application,
**When** the `approveApplication` Server Action executes,
**Then** a unique URL-safe club slug is generated (reserved slugs excluded via `lib/slug.ts`), the club record is created in the database with status `active`, and the application status is updated to `approved`.

**Given** the club record is created,
**When** provisioning completes,
**Then** a `ClubMembership` record is created for the applicant with `role: OWNER, status: ACTIVE, invitedBy: null` in the same transaction as the club record; an acceptance email is dispatched via Resend to the applicant's email address containing the club's URL path and a one-time magic link (1-hour TTL, SHA-256 hashed token) for first login.

**Given** approval completes successfully,
**Then** the `ApplicationQueueItem` row fades out of the queue; a success toast confirms: "Approved — login link sent to [email]."

**Given** slug generation encounters a collision with an existing slug,
**Then** a numeric suffix is appended automatically until a unique slug is found — the operator never sees this collision.

**Given** the email dispatch fails (Resend API error),
**Then** the Server Action returns `{ success: false, error: 'Email delivery failed', code: 'EMAIL_FAILED' }`; the club record and approval are rolled back in a single transaction; the operator sees an inline error with guidance to retry.

---

### Story 2.4: Application Rejection — Rejection Email

As a Platform Operator,
I want rejecting an application to send a courteous rejection email with a brief explanation,
So that applicants understand the platform's curation criteria and feel respected.

**Acceptance Criteria:**

**Given** the operator confirms rejection with an optional reason,
**When** the `rejectApplication` Server Action executes,
**Then** the application status is updated to `rejected`; a rejection email is sent via Resend to the applicant's email address including the optional explanation text and a statement of the platform's non-profit association focus.

**Given** rejection completes successfully,
**Then** the `ApplicationQueueItem` row is removed from the queue; a toast confirms: "Rejected — notification sent to [email]."

**Given** no rejection reason is provided,
**Then** the rejection email uses a default templated explanation referencing the platform's niche (non-profit, real-world community activity focus).

**Given** the email dispatch fails,
**Then** the Server Action returns an error response; the application status is not updated to `rejected`; the operator sees an inline error and can retry.

---

## Epic 3: Public Platform Site & Discovery

The platform directory is the core product surface — the starting point for anyone looking to find and join a club or social activity group. Public Visitors can browse the directory, filter by country, activity type, and location, navigate to club sites, and support the platform via donations. Every club site has automatic SEO and a platform attribution footer.

### Story 3.1: Platform Homepage, Country Navigation & Donation Page

As a Public Visitor,
I want to land on a clear, fast-loading platform homepage that presents the directory as the primary product and lets me navigate to my country's directory,
So that I immediately understand this is where I find clubs and social activities.

**Acceptance Criteria:**

**Given** a visitor navigates to the root platform domain,
**When** the page loads,
**Then** it renders server-side with: a short declarative headline positioning the platform as the directory for clubs and social activities, a brief philosophy statement, `CountryButton` components for each active country (showing country name, flag icon, and club count), and aggregate platform statistics (total clubs, total countries).

**Given** the platform homepage,
**Then** it scores ≥ 90 on Core Web Vitals (Lighthouse performance, SEO, accessibility) and includes full meta tags and Open Graph tags generated automatically.

**Given** a visitor clicks a `CountryButton`,
**When** they are redirected to the country path (e.g., `platform-name.com/fr/ch`),
**Then** the country directory page loads — routing is handled at the application layer via `lib/country.ts` and the `[lang]` segment, not DNS.

**Given** the platform site,
**Then** it includes static pages: `/about` (platform philosophy — why the directory exists, the vision for social connection), and `/support` (donation page where visitors can contribute to the platform's funding through voluntary donations, plus a support form placeholder — full support form implemented in Epic 6) (FR50).

---

### Story 3.2: Country Directory with Rich Filtering

As a Public Visitor,
I want to browse a filterable directory of clubs on the country page with filters for activity type and location,
So that I can discover clubs matching my interests near me — this is the core discovery experience.

**Acceptance Criteria:**

**Given** a visitor navigates to a country path (e.g., `platform-name.com/fr/ch`),
**When** the page loads,
**Then** it renders server-side with a filter bar (activity type select, location/region select) and a grid of `ClubCard` components for all active clubs in that country. Each `ClubCard` shows: club name, logo (or monogram), activity type, location, and — if configured — an external website link icon (FR21).

**Given** the visitor changes an activity type or location filter,
**When** the filter value changes,
**Then** the club grid updates with a loading skeleton visible within 100ms; only matching clubs are shown — no full page reload required.

**Given** active filters produce no matching clubs,
**Then** an inline empty state is shown: "No clubs match these filters" with a "Reset filters" link — never a dead end.

**Given** active filter values,
**Then** they are reflected in the URL as query parameters (e.g., `?activity=ski&location=valais`) so the filtered view is shareable and bookmarkable.

**Given** the directory page,
**Then** it is server-rendered for SEO with structured data for each club entry; the filter UI degrades gracefully without JavaScript. The directory is the primary SEO surface for the platform — optimized for search queries like "badminton club Lausanne."

---

### Story 3.3: Club Public Site — Server-Rendered Home Page

As a Public Visitor,
I want to view a club's public home page with their name, logo, welcome text, and navigation,
So that I can quickly understand who the club is and find the information I need.

**Acceptance Criteria:**

**Given** a visitor navigates to a club's URL path (e.g., `platform-name.com/fr/ch/ski-club-valais`),
**When** the page loads,
**Then** it renders server-side with: the club's logo, name (`<h1>`), welcome text, a primary CTA button linking to the Contact page, and the `PublicNavbar` with the club name as title and all active pages as navigation links.

**Given** the club home page,
**Then** it achieves Time to First Contentful Paint < 2 seconds on a standard broadband connection and scores ≥ 90 on Core Web Vitals.

**Given** a club with no logo uploaded,
**Then** a monogram avatar (club name initial) is displayed as the logo placeholder.

**Given** a club has configured an external website link,
**Then** the club home page displays a visible "Visit our website" link pointing to the external URL — opening in a new tab (FR47).

**Given** the club home page,
**Then** it includes full JSON-LD structured data, Open Graph tags, and a canonical meta tag — all generated automatically from club data via `lib/seo.ts` with zero admin configuration required (FR43).

**Given** a visitor navigates to a club slug that does not exist,
**Then** the global 404 page is served.

---

### Story 3.4: Club Public Site — Inner Page Navigation (SPA)

As a Public Visitor,
I want to navigate between a club's inner pages with fast, smooth transitions,
So that I can browse the club's content without full-page reloads.

**Acceptance Criteria:**

**Given** a visitor clicks a navigation link in the `PublicNavbar`,
**When** navigation occurs,
**Then** a loading skeleton matching the expected content shape is displayed within 100ms; content loads from the Route Handler and renders within 2 seconds.

**Given** a visitor directly navigates to a club inner page URL (e.g., `platform-name.com/fr/ch/ski-club-valais/calendar`),
**When** the page loads,
**Then** it renders correctly and is crawlable via direct URL access.

**Given** the `PublicNavbar`,
**Then** the active page is highlighted with `aria-current="page"` and an accent underline; on mobile the nav collapses to a hamburger that opens a `Sheet` drawer.

**Given** a club has sub-pages configured,
**Then** the sidebar nav renders them nested under their parent page, one level deep.

---

### Story 3.5: Platform Attribution Footer & Platform Sitemap

As a Public Visitor,
I want every club site to have a platform attribution footer link and the platform to maintain a comprehensive sitemap,
So that club sites are connected to the platform directory and all clubs are discoverable by search engines.

**Acceptance Criteria:**

**Given** any public club site page (home or inner),
**Then** the `PoweredByBanner` component renders in the footer with a link to the platform homepage; it is present on every page (FR26).

**Given** a visitor clicks the attribution footer link,
**When** they arrive on the platform homepage,
**Then** the platform homepage loads as per Story 3.1 (FR25).

**Given** all active club sites,
**Then** a platform-level sitemap served at `/sitemap.xml` includes all club home page URLs, generated automatically — no admin action required (FR43).

**Given** each club home page,
**Then** the server-rendered HTML includes a `<link rel="canonical">` tag and `<meta name="robots" content="index, follow">`.

**Given** the `PoweredByBanner`,
**Then** it meets WCAG 2.1 AA contrast requirements in both light and dark mode and is keyboard-accessible with a descriptive `aria-label`.

---

### Story 3.6: Design System Foundation — Dark/Light Mode & Theme Provider

As a Public Visitor or Club Admin,
I want the platform to respect my system's light/dark mode preference and dynamically follow changes,
So that the interface is comfortable to use in any lighting condition without manual configuration.

**Acceptance Criteria:**

**Given** a visitor navigates to any page on the platform (public or admin),
**When** the page loads,
**Then** the color scheme matches the visitor's OS `prefers-color-scheme` setting — light mode for light OS, dark mode for dark OS. This is powered by `next-themes` with `defaultTheme="system"` and `enableSystem`.

**Given** the visitor's OS switches from light to dark mode (or vice versa) while the page is open,
**When** the system preference changes,
**Then** the page theme updates dynamically in real time — no page reload required.

**Given** any page footer,
**Then** a subtle theme toggle icon button is present allowing manual override (light / dark / system). The override is persisted in `localStorage`. Choosing "system" clears the override and returns to OS-following behavior.

**Given** the theme provider,
**Then** it wraps the root layout and applies the theme via a `class` attribute on `<html>` (`next-themes` `attribute="class"` strategy). All existing CSS custom property tokens (OKLCH zinc base, accent presets) already define both `:root` (light) and `.dark` (dark) variants — no token changes needed.

**Given** the theme toggle,
**Then** it meets WCAG 2.1 AA: `aria-label="Toggle theme"`, keyboard-accessible, sufficient contrast in both modes. The toggle uses a sun/moon icon pair.

**Technical notes:**
- Install `next-themes` via pnpm
- `ThemeProvider` wraps `{children}` in root `layout.tsx` with `attribute="class"` `defaultTheme="system"` `enableSystem`
- Theme toggle component: `src/components/ui/theme-toggle.tsx` using shadcn `Button` (ghost variant) + `DropdownMenu` with Light / Dark / System options
- Suppress hydration mismatch: `suppressHydrationWarning` on `<html>` element (standard `next-themes` pattern)

---

### Story 3.7: Public Layout Shell — Top Navbar, Centered Container & Footer

> **SUPERSEDED** — This story was implemented but subsequently replaced by the Dashboard Migration (see docs/DASHBOARD_MIGRATION_PLAN.md). The PublicLayout, PublicNavbar, PublicFooter, and MobileNavMenu components have been removed. All pages now render within the unified dashboard shell (`AppSidebar` + `SidebarInset`). No action needed — this story's intent (consistent layout) is fulfilled by the dashboard shell.

As a Public Visitor,
I want all public pages to share a consistent layout with a sticky top navbar, centered content, and a standard footer,
So that the platform feels cohesive and professionally designed across every public surface.

**Acceptance Criteria:**

**Given** any public page (platform homepage, country directory, club public site),
**When** the page loads,
**Then** it renders within a shared `PublicLayout` component that provides: a sticky top `PublicNavbar`, a centered content container (`max-w-[1200px] mx-auto px-6 lg:px-8`), and a `PublicFooter`.

**Given** the `PublicNavbar`,
**Then** it renders with: a contextual title on the left (platform name on platform pages, country name on country pages, club name on club pages — passed as a prop), navigation links centered, and a primary CTA button on the right. The navbar is sticky (`sticky top-0 z-50`) and becomes opaque/blurred on scroll.

**Given** the `PublicNavbar` on a mobile viewport (< `lg` breakpoint),
**Then** the navigation links collapse into a hamburger menu that opens a `Sheet` drawer from the right. The hamburger button has `aria-expanded` and `aria-controls` attributes.

**Given** the `PublicFooter`,
**Then** it renders a multi-column layout with: platform links (About, Support/Donate), legal links (Privacy, Terms), the theme toggle from Story 3.6, and a copyright line. On club pages, a "Powered by [Platform]" attribution link is included.

**Given** the centered content container,
**Then** content never touches the viewport edges on desktop — generous horizontal margins (`px-6` base, `lg:px-8` on large screens) ensure the Dub.co-inspired breathable layout. Vertical spacing between major sections uses `py-16 lg:py-24` for generous separation.

**Given** the `PublicLayout`,
**Then** it is accessible: `<nav>` landmark on the navbar, `<main>` landmark on the content area, `<footer>` landmark on the footer. Skip link ("Skip to main content") is the first focusable element.

**Technical notes:**
- `PublicLayout` component: `src/components/layout/public-layout.tsx`
- `PublicNavbar` component: `src/components/layout/public-navbar.tsx` — accepts `title`, `navItems`, `ctaLabel`, `ctaHref` props
- `PublicFooter` component: `src/components/layout/public-footer.tsx`
- ~~Used by all public route groups: `src/app/[lang]/(platform)/layout.tsx` and `src/app/[lang]/(country)/[country]/layout.tsx`~~ Superseded: all pages now use `src/app/[lang]/(dashboard)/layout.tsx` with `AppSidebar`

---

### Story 3.8: Refactor Existing Public Pages to New Layout

> **SUPERSEDED** — This story was implemented but subsequently replaced by the Dashboard Migration. Pages were moved from `(platform)/` to `(dashboard)/` route group. The `PublicLayout` wrapper referenced here no longer exists. All pages now render within the unified dashboard shell.

As a Public Visitor,
I want the platform homepage, country directory, and club public site to use the new consistent layout,
So that the design is cohesive across all public surfaces with proper centering, navbar, and footer.

**Acceptance Criteria:**

**Given** the platform homepage (Story 3.1),
**When** it renders,
**Then** it uses the `PublicLayout` with: `PublicNavbar` showing platform name as the title, "About" and "Support" as nav links, and "Apply" as the CTA. Content (headline, country buttons, stats) renders within the centered container. The existing `PoweredByBanner` footer from Story 3.5 is replaced by the `PublicFooter`.

**Given** the country directory page (Story 3.2),
**When** it renders,
**Then** it uses the `PublicLayout` with: `PublicNavbar` showing the country name as the title, a "Back to all countries" nav link, and "Apply" as the CTA. The filter bar and club grid render within the centered container.

**Given** the club public home page (Story 3.3),
**When** it renders,
**Then** it uses the `PublicLayout` with: `PublicNavbar` showing the club name (and logo if available) as the title, the club's active page names as nav links, and "Contact" as the CTA. The `ClubHeroSection` and page content render within the centered container.

**Given** the club inner pages (Story 3.4),
**When** navigating between pages,
**Then** the `PublicNavbar` persists with the active page highlighted (`aria-current="page"`); content transitions use SPA-style loading skeletons within the centered container — no full page reload.

**Given** the club public site footer,
**Then** the `PublicFooter` includes the "Powered by [Platform]" attribution link (FR26) in addition to the standard footer content. The standalone `PoweredByBanner` component from Story 3.5 is no longer needed as a separate component.

**Given** all refactored pages,
**Then** they score >= 90 on Core Web Vitals (Lighthouse performance, SEO, accessibility); the new layout does not regress performance. All pages render correctly in both light and dark mode.

**Given** all refactored pages on mobile,
**Then** the `PublicNavbar` collapses to hamburger; content is single-column within the centered container; the `PublicFooter` stacks to a single column. Full feature parity with desktop.

**Technical notes:**
- Remove the `ClubSidebarNav` from club public routes — navigation moves to `PublicNavbar`
- ~~The club layout at `src/app/[lang]/(country)/[country]/[club]/layout.tsx` passes club name and active pages to `PublicLayout`~~ Superseded: club pages at `src/app/[lang]/(dashboard)/[country]/[club]/`
- ~~Platform layout at `src/app/[lang]/(platform)/layout.tsx` passes platform name and platform nav items to `PublicLayout`~~ Superseded: all pages under `src/app/[lang]/(dashboard)/layout.tsx`
- Existing `PoweredByBanner` component can be simplified or removed — its content moves into `PublicFooter`

---

## Epic 4: Club Profile Setup & Moderation

Rework the application and approval flows to collect and seed club profile data, build club admin pages within the unified dashboard shell (`AppSidebar`) with profile editing and photo upload, implement two-flag visibility control (publish/unpublish + operator force-offline), render the single-page public club profile with photo carousel, and add operator moderation tools with threaded bidirectional messaging. This epic touches existing Epic 2 and Epic 3 code to align with the MVP scope pivot.

### Story 4.1: Schema Migration — Profile Fields, Visibility, ClubPhoto, OperatorMessage

As a platform engineer,
I want the database schema updated to support club profile fields, two-flag visibility, photo storage, and unified operator messages,
So that all subsequent stories in this epic have the data foundation they need.

**Acceptance Criteria:**

**Given** the Prisma schema is migrated,
**Then** the `Club` model has new nullable columns: `description` (text, renamed from `welcomeText`), `schedule` (text), `howToJoin` (text), `contactPhone`, `contactAddress` (text), `externalWebsiteUrl`; and new boolean columns: `isPublished` (default `false`), `forceOffline` (default `false`) (ADR-002, ADR-003).

**Given** the Prisma schema is migrated,
**Then** the `Application` model has new columns matching the club profile fields: `schedule` (text), `contactPhone`, `contactAddress` (text), `howToJoin` (text), `externalWebsiteUrl` — all nullable.

**Given** the Prisma schema is migrated,
**Then** a `ClubPhoto` model exists with: `id` (cuid), `clubId` (FK to Club), `url`, `alt` (default ""), `position` (int, default 0), `createdAt`; indexed on `clubId`; mapped to `club_photos`.

**Given** the Prisma schema is migrated,
**Then** the `OperatorNudge` model is replaced by `OperatorMessage` with: `id` (cuid), `clubId` (FK to Club, cascade delete), `message` (text), `createdAt`, `readAt` (nullable DateTime); indexed on `clubId`; mapped to `operator_messages` (ADR-004).

**Given** the existing `Club` model has a `welcomeText` column,
**Then** the migration renames it to `description` (no data loss).

**Given** the `Club` model,
**Then** it has relations to `ClubPhoto[]` and `OperatorMessage[]`; the old `OperatorNudge` relation is removed.

> **Dev note:** This story is purely a schema migration + Prisma client regeneration. No application code changes — those come in subsequent stories. Run `prisma migrate dev` and verify the generated client types.

---

### Story 4.2: Application Form — Profile Fields

As a Club Applicant,
I want the application form to collect my club's description, schedule, contact details, and how to join,
So that my club profile is pre-populated when my application is approved and I don't have to enter the same information twice.

**Acceptance Criteria:**

**Given** a visitor navigates to the `/apply` page,
**When** the page loads,
**Then** the form displays the existing fields (name, activity type, location, email) plus new fields: description (required, textarea), schedule/availability (optional, textarea with placeholder "e.g., Tuesdays 19h-21h, Salle des sports"), contact phone (optional), contact address (optional, textarea), how to join (required, textarea with placeholder "e.g., Send us an email or come to any session"), external website URL (optional, URL input) (FR27).

**Given** the applicant fills all required fields (name, activity type, location, email, description, how to join) and completes the Turnstile challenge,
**When** they submit the form,
**Then** the application is stored with all profile fields; the existing submission flow (status `pending`, success confirmation) is unchanged.

**Given** the applicant leaves the description or how to join fields empty,
**Then** inline validation errors appear below those fields on blur; the form is not submitted.

**Given** the applicant enters a value in the external website URL field,
**Then** it is validated as a well-formed URL; an inline error appears if the format is invalid.

> **Dev note:** This reworks Story 2.1's existing implementation. The Zod schema in the Server Action needs the new fields. The form component needs new form sections. The Turnstile and rate-limiting behavior remain unchanged.

---

### Story 4.3: Approval Flow — Profile Seeding & Operator Message

As a Platform Operator,
I want approving an application to automatically create the club with pre-populated profile fields and optionally include a message for the club admin,
So that clubs are ready to review and publish immediately after the admin completes account setup.

**Acceptance Criteria:**

**Given** the operator views a pending application in the review queue,
**When** the application detail is displayed,
**Then** the operator sees all submitted profile fields: name, description, schedule, contact info, how to join, external website URL — displayed as the actual club profile content, not just metadata (FR32).

**Given** the operator clicks Approve,
**When** the confirmation dialog appears,
**Then** it includes an optional "Message to club admin" textarea (free text); the operator can leave it empty or type feedback (e.g., "Please add more detail to your schedule before publishing").

**Given** the operator confirms approval with no message,
**When** the `approveApplication` Server Action executes,
**Then** the club record is created with profile fields copied from the application (name, description, schedule, email, contactPhone, contactAddress, howToJoin, externalWebsiteUrl, activityTypeId, locationId, country); `isPublished = false`, `forceOffline = false`; `ClubMembership` (OWNER, ACTIVE) created; acceptance email sent with magic link.

**Given** the operator confirms approval with a message,
**When** the `approveApplication` Server Action executes,
**Then** a `SupportMessage` record is created for the new club in the same transaction; the message text is included in the acceptance email as a dedicated section (FR57); the message will appear in the club's message thread on first login (FR55).

**Given** the existing approval flow (Story 2.3),
**Then** slug generation, magic link creation, and email dispatch remain unchanged; only the club record creation is extended with profile fields and optional operator message.

> **Dev note:** This reworks Story 2.3's `approveApplication` Server Action. The acceptance email template (Resend) needs a conditional "Message from the platform" section. The `ApplicationQueueItem` component in the operator dashboard needs to display the full profile fields for content review.

---

### Story 4.4: Club Admin Dashboard Shell

As a Club Admin,
I want my club's admin pages integrated into the unified dashboard shell with sidebar navigation,
So that I have a clean, focused interface to manage my club profile and settings without leaving the main application.

**Acceptance Criteria:**

**Given** an authenticated Club Admin navigates to `/{lang}/club/{clubId}/`,
**When** the page loads,
**Then** the unified dashboard shell renders with the `AppSidebar` showing the club under the MY CLUBS section with collapsible sub-items (Profile, Settings, Messages), and a "View public page" link that opens the public club URL in a new tab (FR2).

**Given** the club admin URL,
**When** an unauthenticated visitor or a user who is not a member of the club attempts to access it,
**Then** the layout guard redirects them to `/{lang}/auth/login` — the club admin pages are never served to unauthorized users.

**Given** the dashboard on a mobile viewport,
**Then** the `AppSidebar` collapses and is accessible via a trigger button; all navigation items remain accessible.

**Given** a Club Admin who is authenticated and visits their club's public URL,
**Then** the public site renders normally with no admin chrome — complete separation between public and admin views.

**Given** the club admin section,
**Then** the default view (landing page) is the Club Profile section.

---

### Story 4.5: Explicit Save & Unsaved Changes Protection

As a Club Admin,
I want all my edits to require an explicit Save action with a persistent unsaved-changes indicator,
So that I never accidentally publish unfinished content or lose work unexpectedly.

**Acceptance Criteria:**

**Given** any edit has been made in the admin dashboard,
**When** the change occurs,
**Then** the amber unsaved-changes dot appears on the Save button area and is mirrored on the active `AppSidebar` item; the Save button becomes active (FR17).

**Given** the Club Admin attempts to navigate away (close tab, browser back, or click another sidebar item) with unsaved changes,
**When** the navigation is attempted,
**Then** a "You have unsaved changes" confirmation dialog appears — triggered by `isDirty` state in the dashboard context. For tab/browser close, the browser's native `beforeunload` dialog appears.

**Given** the Club Admin clicks Save,
**When** the save Server Action completes successfully,
**Then** the amber dot clears; a "Saved" toast appears with a timestamp; the form returns to pristine state; the SSR cache is invalidated via `revalidatePath`.

**Given** the Club Admin clicks Discard with unsaved changes,
**When** they confirm the discard dialog,
**Then** all pending changes are reverted to the last saved state; the amber dot clears; no save is made.

**Given** a Save action is in flight (Server Action pending),
**Then** the Save button shows a spinner and all edit fields are disabled — preventing duplicate submissions.

> **Dev note:** This story establishes the save framework (`isDirty` context, `beforeunload` handler, discard dialog) used by Story 4.6. Implement this before the profile edit form.

---

### Story 4.6: Club Profile Edit Form & Photo Upload

As a Club Admin,
I want to edit my club's profile fields and upload photos through the admin dashboard,
So that I can complete my club's public presence with accurate information and appealing visuals.

**Acceptance Criteria:**

**Given** the Club Admin selects "Club Profile" in the admin dashboard sidebar,
**When** the content area loads,
**Then** an edit form appears with fields pre-populated from the club record: name (text input), logo (image upload, max 5 MB, JPG/PNG/WebP with alt text required), description (textarea), schedule/availability (textarea), contact email (text input — the club's registered email), contact phone (optional), contact address (optional, textarea), how to join (textarea), external website link (optional URL field) (FR1, FR47). The amber dot is absent until a field is changed.

**Given** the Club Admin changes any text field value,
**When** a change is made,
**Then** the amber unsaved-changes dot appears (Story 4.5 save framework).

**Given** the profile form,
**Then** a "Photos" section displays existing club photos as a thumbnail grid, and an "Add photos" upload zone accepting up to 10 images total (JPEG, PNG, WebP; max 5 MB each); photos are uploaded via presigned URL to R2/MinIO — no file bytes pass through the Next.js server (FR48).

**Given** the club already has 10 photos,
**When** the Club Admin attempts to add another,
**Then** the upload zone is disabled with an inline message: "Maximum 10 photos reached. Remove a photo to add a new one."

**Given** an uploaded photo,
**Then** it appears in the thumbnail grid with a delete button; deleting a photo removes it from R2 and the `ClubPhoto` record.

**Given** an upload that exceeds size or format constraints,
**Then** an inline error appears below the upload zone describing the specific constraint violated; no upload is attempted (FR19).

**Given** the Club Admin clicks Save,
**When** the `saveClubProfile` Server Action executes,
**Then** `clubId` is resolved from URL params (verified by the club layout membership check); the club record is updated with all text field values; `revalidatePath` invalidates the club page SSR cache; a "Saved" toast appears.

> **Dev note:** Photo upload/delete operations are immediate (not deferred to save) — they hit R2 and the DB on action. The save button only applies to text field changes. This keeps the UX simple: photos appear instantly in the grid, text fields require explicit save.

---

### Story 4.7: Publish/Unpublish & Operator Message Banner

As a Club Admin,
I want to control when my club page goes live and see any messages from the platform operator,
So that I publish only when I'm ready and can respond to operator feedback promptly.

**Acceptance Criteria:**

**Given** an authenticated Club Admin views their admin dashboard,
**When** the dashboard loads,
**Then** a publish/unpublish toggle is visible (e.g., in the header area or Settings section); it reflects the current `isPublished` state of the club (FR49).

**Given** `isPublished = false` and `forceOffline = false`,
**When** the Club Admin toggles publish on,
**Then** the `togglePublish` Server Action sets `isPublished = true`; the club page becomes publicly visible; `revalidatePath` invalidates the club page cache; a success toast confirms "Your club page is now live."

**Given** `isPublished = true` and `forceOffline = false`,
**When** the Club Admin toggles publish off,
**Then** `isPublished` is set to `false`; the club page is no longer visible; a toast confirms "Your club page is now offline."

**Given** `forceOffline = true` (operator override active),
**Then** the publish toggle is disabled with a message: "Your page has been taken offline by the platform. Check your messages for details." The Club Admin cannot change `isPublished` until the operator lifts the override (FR51, FR52).

**Given** the club has unread `SupportMessage` records,
**When** the club admin views the sidebar,
**Then** an unread indicator appears on the Messages sub-item under the club in the MY CLUBS section; navigating to `/{lang}/club/{clubId}/messages` opens the `ChatThread` showing the full bidirectional conversation with the operator (FR55).

**Given** the Club Admin reads messages in the `ChatThread`,
**Then** the `ConversationReadCursor` is updated to mark messages as read; the unread indicator clears.

**Given** the club has no unread messages,
**Then** no unread indicator is displayed on the Messages sub-item.

---

### Story 4.8: Club Profile Page — Public Rendering

As a Public Visitor,
I want to view a club's profile page with all their essential information and photos,
So that I can quickly decide whether to join and know how to get in touch.

**Acceptance Criteria:**

**Given** a visitor navigates to a club's public URL (`/{lang}/{country}/{club}`),
**When** `isPublished = true` AND `forceOffline = false`,
**Then** a server-rendered single-page profile displays: club name, logo, description, photo carousel, schedule/availability, contact info (email, phone, address), how to join, and external website link (if set); the page includes meta tags, Open Graph, and JSON-LD structured data (FR22, FR43).

**Given** a visitor navigates to a club's public URL,
**When** `isPublished = false` OR `forceOffline = true`,
**Then** a 404 page is returned — the club page is not visible (FR51).

**Given** the club has uploaded photos,
**Then** a photo carousel displays all photos in `position` order, auto-scrolling horizontally; the carousel pauses on hover; on mobile, the carousel is swipe-enabled (FR48).

**Given** the club has no uploaded photos,
**Then** the carousel section is not rendered; the page displays remaining profile fields without a visual gap.

**Given** the club has an external website link set,
**Then** a prominent "Visit our website" link/button is displayed on the profile page, opening in a new tab (FR47).

**Given** the club profile page,
**Then** the platform attribution footer link is present (FR26); the footer includes a link back to the platform directory (FR25).

**Given** the directory listing query,
**Then** it filters clubs with `WHERE is_published = true AND force_offline = false` — unpublished or force-offline clubs do not appear in the directory.

> **Dev note:** This reworks Story 3.3's club home page rendering. The existing server-rendered page is replaced with the single-page profile layout. The photo carousel is a `"use client"` component island within the server-rendered page (auto-scroll + pause-on-hover requires client-side JS). The inner page navigation from Story 3.4 remains in code but has nothing to iterate over — no rework needed.

---

### Story 4.9: Operator Club Moderation

As a Platform Operator,
I want to exchange threaded messages with club admins and force club pages offline when needed,
So that I can maintain content quality standards across the platform and communicate moderation decisions clearly.

**Acceptance Criteria:**

**Given** the operator navigates to `/{lang}/admin/clubs` in the dashboard,
**When** the view loads,
**Then** the `ClubQueue` component lists all clubs; selecting a club shows the `ClubDetail` panel with: the club's current profile content, visibility status (`isPublished`, `forceOffline`), and a "Force offline" / "Lift offline" toggle.

**Given** the operator navigates to `/{lang}/admin/messages`,
**When** the view loads,
**Then** the `ConversationQueue` component lists all message threads with clubs; selecting a thread opens a `ChatThread` component showing the full bidirectional conversation; both the operator and club admin can send messages (via `SupportMessage` + `ConversationReadCursor` models).

**Given** the operator sends a message in a `ChatThread`,
**When** submitted,
**Then** a `SupportMessage` record is created and a notification email is sent to the club admin via Resend; the club admin can reply from `/{lang}/club/{clubId}/messages`.

**Given** the operator toggles "Force offline" on a club that is currently live,
**When** the action is confirmed,
**Then** a mandatory message field appears — the operator must explain why; the `forceOffline` Server Action sets `forceOffline = true` on the club, creates a `SupportMessage` with the reason, sends a moderation email, and invalidates the club page cache; the club page immediately becomes invisible to visitors (FR52).

**Given** the operator toggles "Lift offline" on a force-offline club,
**When** the action is confirmed,
**Then** `forceOffline` is set to `false`; the club admin regains control of `isPublished`; if the club was previously published (`isPublished = true`), the page becomes visible again immediately (FR53).

**Given** the operator sends a message or forces a club offline,
**Then** the `SupportMessage` record persists in the database regardless of email delivery status — the DB is the source of truth, email is the notification channel (ADR-004).

**Given** the operator views the club list in the admin dashboard,
**Then** clubs with `forceOffline = true` are visually flagged (e.g., a red badge or indicator) so the operator can track which clubs are currently under moderation.

---

## Epic 5: Club Content Elements _(Entire epic deferred to post-MVP)_

> **Post-MVP deferral:** This entire epic is deferred. It depends on the multi-page site builder expansion (currently deferred). All schema models (`Page`, `PageElement`, `ContentVersion`, `Event`, `GalleryItem`, `Document`) are retained in the database for future use. Stories below are preserved for reference and will be revised when multi-page support is implemented.

Club Admins can add and manage rich content on custom pages using the full element library. File constraints are displayed inline before upload — never after failure.

### Story 5.1: Element Picker & Page Element Framework

As a Club Admin,
I want to add content elements to a custom page using a visual element picker,
So that I can build structured page content without writing code or making layout decisions.

**Acceptance Criteria:**

**Given** the Club Admin is in edit mode on a custom page,
**When** they click the "Add element" trigger,
**Then** a `Sheet` panel slides in from the right displaying the available element types: Rich Text, Image, Calendar, Gallery, Documents — each with a label and brief description (FR10).

**Given** the Club Admin selects an element type,
**When** the element is added,
**Then** a new record is inserted into `page_elements` with the correct `type` enum and default empty `data` JSONB payload; it appears at the bottom of the page's element list in edit mode; the amber dot appears.

**Given** the Club Admin hovers over an existing element in edit mode,
**When** the hover state activates,
**Then** a card affordance reveals: an edit pencil icon, a drag handle for reordering, and a delete (trash) icon with a required confirmation dialog before removal.

**Given** the Club Admin reorders elements via drag-and-drop,
**When** the order is changed,
**Then** the `position` integer on each affected `page_element` record is updated; the amber dot appears; the element list in the dashboard reflects the new order immediately.

**Given** a page element is deleted and the Club Admin confirms the dialog,
**Then** the element record is removed from `page_elements`; the amber dot appears; the public page reflects the deletion only after the next explicit Save.

---

### Story 5.2: Rich Text Element & Inline Image

As a Club Admin,
I want to add and edit rich text content and inline images on custom pages,
So that I can write formatted articles and illustrated content for my club's visitors.

**Acceptance Criteria:**

**Given** a Rich Text element is added to a page,
**When** the Club Admin clicks the edit affordance,
**Then** the TipTap editor activates (loaded via `dynamic(() => import(...), { ssr: false })` — never at module level); a toolbar shows: bold, italic, headings, lists, blockquote, code, link, and inline image (FR15, FR16).

**Given** the Club Admin types content in the editor,
**When** content is entered,
**Then** changes are reflected in the form state; the amber dot appears.

**Given** the Club Admin inserts an inline image via the toolbar,
**When** they upload an image (max 5 MB, JPG/PNG/WebP — constraint shown permanently before upload),
**Then** the image is uploaded to R2/MinIO via a presigned URL; on success it is embedded in the rich text at the cursor position; an alt text field is required before saving (FR19).

**Given** the Club Admin saves the page,
**When** the `savePageContent` Server Action executes,
**Then** the TipTap HTML output is sanitized via `sanitize-html` before storage; sanitized HTML is stored in `page_elements.data.html`; unsanitized HTML is never persisted.

**Given** the saved rich text is rendered publicly,
**Then** it is output via React `dangerouslySetInnerHTML` only after sanitization — no XSS vectors are present in the rendered output.

---

### Story 5.3: Calendar Element — Event Management

As a Club Admin,
I want to add a Calendar element to a page and manage events with dates and descriptions,
So that visitors can see our upcoming activities and plan to attend.

**Acceptance Criteria:**

**Given** a Calendar element is added to a page,
**When** the Club Admin clicks the edit affordance,
**Then** an event management interface opens showing: existing events (title, date, description) and an "Add event" button (FR12).

**Given** the Club Admin clicks "Add event" and fills in event title (required), date (required), and description (optional),
**When** they confirm,
**Then** a new record is inserted into the `events` relational table linked to the club and page element; it appears in the event list; the amber dot appears.

**Given** the Club Admin edits or deletes an existing event (with confirmation dialog for deletion),
**When** saved or confirmed,
**Then** the `events` record is updated or deleted accordingly; the amber dot appears.

**Given** the Calendar element in the public view,
**Then** events are displayed in ascending date order; past events are visually distinguished from upcoming events; the display is fully responsive and mobile-friendly.

---

### Story 5.4: Gallery Element — Image & Video Management

As a Club Admin,
I want to add a Gallery element and upload images and videos to showcase my club's activities,
So that visitors get a visual sense of our community before joining.

**Acceptance Criteria:**

**Given** a Gallery element is added to a page,
**When** the Club Admin clicks the edit affordance,
**Then** an upload grid is shown; each upload slot permanently displays: "Max 10 MB · JPG, PNG, WebP, MP4" before any interaction (FR19, FR13).

**Given** the Club Admin uploads a file meeting the constraints,
**When** the upload completes,
**Then** the file is uploaded to R2/MinIO via a presigned URL; a `gallery_items` record is created; a thumbnail preview appears; an alt text field (required, enforced) is shown.

**Given** an uploaded file exceeds the size limit or uses an unsupported format,
**Then** an inline error appears describing the specific constraint violated — no upload is attempted; the grid state is unchanged.

**Given** an upload would exceed the club's `storage_limit_bytes`,
**Then** the Server Action returns `{ success: false, error: 'Storage limit exceeded', code: 'STORAGE_LIMIT_EXCEEDED' }`; no file is uploaded; an inline error is shown.

**Given** the Gallery element in the public view,
**Then** images are displayed in a responsive grid adapting from 1 column (mobile) to 3 columns (desktop) without horizontal scrolling.

---

### Story 5.5: Documents Library Element

As a Club Admin,
I want to add a Documents element and upload files for visitors to download,
So that I can share club rules, forms, and other resources directly from the site.

**Acceptance Criteria:**

**Given** a Documents element is added to a page,
**When** the Club Admin clicks the edit affordance,
**Then** a file upload interface is shown; constraint text is displayed permanently: "Max 20 MB · PDF, DOCX, XLSX, PNG, JPG" (FR19, FR14).

**Given** the Club Admin uploads a document meeting the constraints,
**When** the upload completes,
**Then** the file is uploaded to R2/MinIO via a presigned URL; a `documents` record is created with the display name and file metadata; the document appears in the list with a download link.

**Given** the Club Admin edits a document's display name or deletes a document (with confirmation),
**When** saved or confirmed,
**Then** the `documents` record is updated or deleted; on deletion the R2/MinIO object is also deleted (no orphaned files); the amber dot appears.

**Given** the Documents element in the public view,
**Then** each document is shown as a row with: display name, file type badge, and a download link via R2/MinIO presigned URL — predictable URL enumeration is not possible (UUIDs as object keys).

---

### Story 5.6: Contact Page Sub-Blocks Configuration

As a Club Admin,
I want to configure the Contact page's sub-blocks (contact form, map, phone, email, predefined subjects) independently,
So that visitors have multiple ways to reach my club, all configured to my association's needs.

**Acceptance Criteria:**

**Given** the Club Admin is in edit mode on the Contact page,
**When** they view the page,
**Then** an edit form is shown for each available sub-block: Contact Form, Map, Phone Number, Email Address, and Predefined Message Subjects — each independently togglable (FR11).

**Given** the Club Admin enables the Contact Form sub-block and saves,
**Then** the contact form appears on the public Contact page; the club's registered email is automatically used as the recipient — no additional configuration required.

**Given** the Club Admin enables and configures Predefined Message Subjects and saves,
**Then** the contact form shows a subject dropdown pre-populated with the configured subjects; visitors must select one before submitting.

**Given** the Club Admin enables the Map sub-block and enters an address and saves,
**Then** the address is displayed on the public Contact page as a static map image (no Google Maps iframe — avoids third-party cookies) and as accessible plain text.

**Given** the Club Admin disables a sub-block and saves,
**Then** that sub-block is hidden from the public Contact page after the next SSR cache invalidation; its configuration data is retained for re-enabling later.

---

## Epic 6: Contact & Communication _(Partially deferred)_

> **Partial deferral:** Stories 6.1 (contact form), 6.2 (email relay monitoring), and 6.3 (contact submissions) are deferred to post-MVP. At MVP, club contact info (email, phone, address) is displayed directly on the club profile page — visitors contact clubs directly. Story 6.4 (platform support request form) remains in MVP scope.

Club visitors can reliably reach associations via contact forms; club admins can read received messages; platform operators receive support requests; and the email relay is actively monitored for health.

### Story 6.1: Public Contact Form & Email Relay _(Deferred to post-MVP)_

As a Public Visitor,
I want to submit a contact message through a club's contact form,
So that I can reach the association without needing to know their private email address.

**Acceptance Criteria:**

**Given** a visitor navigates to a club's Contact page with the Contact Form sub-block enabled,
**When** they view the form,
**Then** the form renders fields for: Name, Email, Subject (dropdown if predefined subjects are configured, free-text otherwise), and Message — plus a Cloudflare Turnstile challenge widget (FR23).

**Given** the visitor fills in all required fields and passes the Turnstile challenge,
**When** they submit the form,
**Then** the submission is validated server-side; the message body is encrypted with AES-256-GCM using the club's stored public key; the encrypted payload is persisted to the `contact_submissions` table with `clubId` scope (FR23).

**Given** the submission is persisted,
**When** the relay runs,
**Then** Resend sends an email to the club's registered address; the email's `reply-to` header is set to the visitor's submitted email address so the club admin can reply directly from their email client (FR24).

**Given** the visitor submits the form,
**When** the relay email is dispatched successfully,
**Then** the form shows a success message: "Your message has been sent!" — no submission data is echoed back to the browser.

**Given** the Turnstile challenge fails or the visitor submits invalid data,
**Then** the form shows a clear field-level or form-level error and does NOT store or relay the submission.

---

### Story 6.2: Email Relay Health Monitoring _(Deferred to post-MVP)_

As a Platform Operator,
I want the email relay to be actively monitored,
So that I am alerted within 15 minutes if the relay stops functioning and can restore service quickly.

**Acceptance Criteria:**

**Given** a `GET /api/health` Route Handler exists,
**When** UptimeRobot polls it every 5 minutes,
**Then** the handler returns `{ status: "ok", checks: { db: "ok", resend: "ok" } }` with HTTP 200 when all subsystems are reachable (NFR16).

**Given** the database or Resend connectivity check fails,
**When** the health endpoint is polled,
**Then** the handler returns HTTP 503 with `{ status: "degraded", checks: { ... } }` indicating which subsystem failed.

**Given** the health endpoint returns 503 for one polling cycle,
**When** UptimeRobot detects the failure,
**Then** an alert is sent to the operator's configured notification channel (email/Slack) within 15 minutes of the first failure — meeting the NFR16 SLA.

**Given** the health endpoint recovers (returns 200),
**Then** UptimeRobot sends a recovery notification and the monitor returns to "up" status.

---

### Story 6.3: Club Admin — View Contact Form Submissions _(Deferred to post-MVP)_

As a Club Admin,
I want to view messages submitted through my club's contact form,
So that I can respond to visitors who have reached out to my association.

**Acceptance Criteria:**

**Given** the Club Admin is authenticated and navigates to the admin inbox,
**When** the page loads,
**Then** only submissions scoped to their `clubId` are returned — the query uses atomic `where: { clubId }` Prisma enforcement; no cross-club data is ever exposed (FR44).

**Given** there are submissions for the club,
**When** the admin views the inbox list,
**Then** each row shows: sender name, subject, submission date/time, and a read/unread indicator.

**Given** the admin clicks a submission,
**When** the detail view loads,
**Then** the server-side action decrypts the AES-256-GCM payload using the club's private key; the decrypted message body is displayed in the UI — decryption never happens client-side.

**Given** the admin views a submission,
**Then** the submission is marked as read; a "Reply" affordance opens the visitor's email in the admin's default email client via `mailto:` using the stored sender email and original subject.

**Given** the admin deletes a submission,
**When** confirmed,
**Then** the `contact_submissions` record is permanently deleted; there is no recovery mechanism (data minimisation, GDPR compliance).

---

### Story 6.4: Platform Support Request Form

As a Club Admin,
I want to submit a support request to the platform operator,
So that I can get help with issues or questions about my club's website.

**Acceptance Criteria:**

**Given** the Club Admin is authenticated and navigates to the support section,
**When** they view the support request form,
**Then** the form shows fields for: Subject, Message, and an optional file attachment; their club name and email are pre-populated from session data and are read-only (FR30).

**Given** the Club Admin fills in the required fields and submits,
**When** the form is submitted,
**Then** the request is stored in a `support_tickets` table with the `clubId`, subject, message, and timestamp; the operator receives a notification email via Resend containing the club name, submitted email, subject, and a link to the admin panel.

**Given** the operator receives the notification,
**Then** the operator can reply directly to the club admin's registered email (reply-to is set to the club admin's email).

**Given** the Club Admin submits a duplicate request within 5 minutes,
**Then** the system silently deduplicates or shows a warning: "You submitted a similar request recently" — prevents accidental double-submissions.

---

## Epic 7: Platform Operations & Health Monitoring

Platform Operators have full operational visibility — they can manage the club registry, monitor system health, enforce usage limits, view privacy-safe analytics, and control platform-wide flags. Note: operator-club messaging and club page moderation (force offline) are handled by the threaded SupportMessage system in Epic 4 (Stories 4.7, 4.9) — Story 7.7 (Operator Nudge) has been removed from this epic.

### Story 7.1: Operator Dashboard — Club Registry Management

As a Platform Operator,
I want to view and manage all registered clubs in an admin dashboard,
So that I can oversee the platform's club population and take administrative actions.

**Acceptance Criteria:**

**Given** the operator is authenticated and navigates to `/admin/clubs`,
**When** the page loads,
**Then** a paginated list of all clubs is shown with columns: club name, slug, country, status (active/suspended), URL path, registration date, and a link to their public site (FR34).

**Given** the operator clicks on a club,
**When** the detail view opens,
**Then** the operator sees full club metadata: name, logo, description, schedule, contact info, how to join, external website link (if configured), visibility status (`isPublished`, `forceOffline`), photo count, and a list of admin actions (including moderation tools from Story 4.9).

**Given** the operator triggers a "Suspend" action on a club,
**When** confirmed,
**Then** the club's `status` is set to `suspended`; their public site returns HTTP 503; the club admin receives a notification email explaining the suspension.

**Given** the operator triggers a "Reinstate" action on a suspended club,
**Then** the club's `status` is reset to `active`; their public site is restored immediately.

**Given** the operator navigates to `/admin/dashboard`,
**When** the page loads,
**Then** an aggregate platform metrics panel is shown with: total clubs live, number with external website links configured, platform-wide uptime % for the last 30 days, and percentage of club sites with all Lighthouse scores ≥ 90 — all displayed as summary statistics without requiring drill-down into individual clubs (FR34).

---

### Story 7.2: Operator Dashboard — Site Metrics & Usage Limits

As a Platform Operator,
I want to monitor per-club site metrics and enforce configurable usage limits,
So that the platform stays performant and fair across all member associations.

**Acceptance Criteria:**

**Given** the operator views the club detail page,
**When** the metrics section loads,
**Then** the following counters are displayed: photo count, total R2/MinIO storage used (MB), and a breakdown by asset type (logo, photos) (FR34). Post-MVP: page count and element count per page will be added when multi-page support is implemented.

**Given** a Club Admin attempts to exceed a platform-defined limit (e.g., max photos, max storage),
**When** the limit is reached,
**Then** the system returns a clear error (e.g., "Maximum 10 photos reached") — no partial state is created; the operation is rejected atomically (FR38).

**Given** the operator updates a limit value in the admin panel,
**When** saved,
**Then** the new limit is applied immediately for subsequent operations; existing clubs that were already over the new limit are grandfathered (not automatically cut off) but are flagged in the admin UI.

---

### Story 7.3: Privacy-Safe Analytics — Page View Tracking

As a Platform Operator,
I want privacy-safe page view analytics across all club sites,
So that I can understand platform usage without compromising visitor privacy.

**Acceptance Criteria:**

**Given** a visitor loads any public club page,
**When** the page is rendered server-side,
**Then** a `page_events` record is created containing: `clubId`, `pageSlug`, `country` (derived from `Accept-Language` or CF header), `referer` domain (no path), `ip_hash` (SHA-256 of IP + daily rotating salt — never stored in raw form), and `visited_at` (FR38).

**Given** a `page_events` record is created,
**Then** the raw IP address is never written to the database; the daily salt is regenerated at midnight UTC; individual visitors cannot be re-identified across days.

**Given** the operator views the analytics dashboard,
**When** they select a club and date range,
**Then** aggregated metrics are shown: unique visitors (by `ip_hash`), page views by slug, top referrers, and geographic distribution — no raw `ip_hash` values are exposed in the UI (FR38).

**Given** a `page_events` record is older than 12 months,
**When** the nightly cleanup job runs,
**Then** the record is permanently deleted (12-month retention policy, data minimisation).

---

### Story 7.4: Feature Flags & Platform-Wide Configuration

As a Platform Operator,
I want to manage feature flags and platform-wide configuration from an admin panel,
So that I can control rollouts and adjust platform behaviour without code deployments.

**Acceptance Criteria:**

**Given** the operator navigates to `/admin/settings`,
**When** the page loads,
**Then** a list of configurable platform settings is shown: new club registrations enabled/disabled, maintenance mode, max storage per club, max pages per club, supported country codes, and contact email for platform support (FR38).

**Given** the operator toggles "New Club Registrations" to disabled,
**When** a visitor submits the club application form,
**Then** the form submission is rejected with a user-friendly message: "Club registrations are currently paused. Please check back later."

**Given** the operator enables maintenance mode,
**When** any public or admin route is accessed,
**Then** all routes return a styled maintenance page (HTTP 503) with an estimated return time (configurable) — except the operator's own admin login route.

**Given** the operator updates a numerical limit (storage, pages),
**When** saved,
**Then** the new value is reflected immediately in the enforcement middleware; the change is logged to an `audit_log` table with operator user ID, timestamp, old value, and new value (FR45).

---

### Story 7.5: Audit Log Viewer

As a Platform Operator,
I want to view a log of all significant administrative actions,
So that I have a clear audit trail for governance and incident response.

**Acceptance Criteria:**

**Given** any operator-level action is taken (approve/reject application, suspend club, change settings, update limits),
**When** the action completes,
**Then** an `audit_log` record is created with: `actorId` (operator user ID), `action` (enum), `targetId` (club ID or null), `oldValue`, `newValue`, and `createdAt` (FR45).

**Given** the operator navigates to `/admin/audit-log`,
**When** the page loads,
**Then** a paginated, reverse-chronological list of audit entries is shown with: date/time, actor name, action type, target club (if applicable), and changed values.

**Given** the operator filters the audit log by date range or action type,
**When** the filter is applied,
**Then** only matching entries are shown; the filter state persists in the URL query string.

**Given** an audit log entry exists,
**Then** it can never be edited or deleted — the `audit_log` table has no `UPDATE` or `DELETE` operations defined in the Prisma schema for it.

---

### Story 7.6: Operator Dashboard — Site Health Status

As a Platform Operator,
I want to view health status indicators for all club sites,
So that I can proactively identify and address site issues before club admins or visitors notice them.

**Acceptance Criteria:**

**Given** the operator navigates to `/admin/health`,
**When** the page loads,
**Then** a table of all active clubs is shown with columns: club name, Lighthouse performance score, accessibility score, SEO score, uptime % (last 30 days), last checked timestamp, and an overall status badge (FR35).

**Given** any Lighthouse score or uptime % is below threshold (Lighthouse < 90, uptime < 99.9%),
**Then** the affected column and the row's status badge are styled red; clubs with all metrics meeting thresholds show a green "Healthy" badge.

**Given** a background job runs on a configurable schedule (default: daily),
**When** the job executes,
**Then** it runs Lighthouse CI against each active club's home page URL and records results in a `health_checks` table: `clubId`, `lighthousePerf`, `lighthouseA11y`, `lighthouseSEO`, `uptimePct`, `checkedAt`.

**Given** the operator clicks "Re-check" on a specific club row,
**When** the re-check completes,
**Then** the health row updates with fresh Lighthouse scores within 60 seconds; a spinner is shown during the check.

**Given** the health dashboard,
**Then** it is accessible to operator sessions only — no health data is exposed to club admins or the public.

---

### ~~Story 7.7: Operator Nudge — Club Admin Notification~~ _(Removed — replaced by threaded SupportMessage system in Epic 4, Stories 4.7 and 4.9)_

---

### ~~Story 7.8: Operator Support Inbox~~ _(SUPERSEDED — replaced by threaded SupportMessage system in Epic 4, Stories 4.7 and 4.9. The ConversationQueue component already provides the operator inbox.)_

---

### Story 7.9: Template Versioning & Silent Migration

As a Platform Operator,
I want club sites to automatically receive template updates silently after each deployment,
So that all clubs benefit from improvements and fixes without any action required from me or from club admins.

**Acceptance Criteria:**

**Given** a new Next.js build is deployed,
**When** the deployment completes,
**Then** all club sites immediately serve the updated template — no per-club migration step is required; club content stored in typed `Club` model columns and `ClubPhoto` records (MVP), plus `page_elements`, `events`, `gallery_items`, and `documents` (post-MVP), is never corrupted by UI-layer changes (FR39, NFR15).

**Given** the `clubs` table,
**Then** it includes a `templateVersion` field recording the version string at the time of each club's last content save; a `migration_log` table records: `templateVersion`, `migratedAt`, `clubsAffected`, `migrationType` (content-safe / structural).

**Given** the CI/CD pipeline (GitHub Actions),
**When** a new build is staged,
**Then** a migration smoke test runs automatically: it spins up a test club site against the new build and asserts all Lighthouse scores ≥ 90, all page elements render without error, and no 5xx responses occur; a failing smoke test blocks the deployment (NFR4).

**Given** the deployment uses Docker rolling update,
**When** the new container starts and passes the Nginx upstream health check,
**Then** traffic is switched to the new container without dropping requests; the old container is terminated only after the health check passes — zero-downtime guaranteed (NFR15).

**Given** the operator navigates to `/admin/settings`,
**Then** a "Template" section shows: current template version, last migration date, and number of clubs on the current version.

---

## Epic 8: Data Compliance

Club Admins can export their data (GDPR portability) and request account deletion (GDPR right-to-erasure). A cookie consent mechanism is presented where legally required. Data retention policies are applied automatically.

### Story 8.1: GDPR Right-to-Erasure — Club Data Deletion

As a Club Admin,
I want to request deletion of my club's data from the platform,
So that my association can exercise its right to erasure under GDPR.

**Acceptance Criteria:**

**Given** the Club Admin navigates to the "Delete Club Account" section,
**When** they initiate the deletion request,
**Then** a confirmation dialog is shown listing exactly what will be deleted: club profile data, all uploaded photos (R2/MinIO), logo, operator messages, and the club admin user account (FR41). Post-MVP: will also include pages, elements, contact form submissions, gallery items, documents.

**Given** the Club Admin confirms the deletion,
**When** the deletion job runs,
**Then** all R2/MinIO objects for the club are deleted (logo, photos); all Prisma records scoped to the `clubId` are hard-deleted in dependency order (child records before parent); the club's URL path is de-provisioned; the deletion is logged to `audit_log` (FR41).

**Given** the deletion job completes,
**Then** the club admin's session is invalidated immediately; any subsequent request using their credentials returns HTTP 401; the platform path URL for the club returns HTTP 404.

**Given** the deletion fails mid-way,
**Then** the operation rolls back fully (Prisma transaction) — no partial deletion state is possible.

---

### Story 8.2: GDPR Visitor Data Requests & Automated Retention _(Deferred — depends on analytics/page_events infrastructure from Story 7.3)_

As a Platform Operator,
I want automated data retention enforcement and a process for handling visitor data requests,
So that the platform is compliant with GDPR data minimisation and right-to-access obligations.

**Acceptance Criteria:**

**Given** a Data Subject Access Request (DSAR) is received by the operator (via support ticket or email),
**When** the operator looks up the requester's `ip_hash` in the analytics dashboard,
**Then** the operator can export all `page_events` records matching that hash for the relevant date range — the export is a downloadable CSV.

**Given** the requester exercises their right to erasure for analytics data,
**When** the operator runs the erasure action for a specific `ip_hash`,
**Then** all matching `page_events` records are permanently deleted; the action is recorded in `audit_log`.

**Given** the automated retention policy is active,
**When** the nightly cleanup job runs (scheduled via `node-cron` or equivalent),
**Then** all `page_events` records older than 12 months are deleted; post-MVP: all `contact_submissions` records older than 24 months will also be deleted; a summary of deleted record counts is appended to an application log.

**Given** the cleanup job runs,
**Then** the job itself is idempotent — running it twice in the same window produces no errors and no additional deletions; the job's last-run timestamp is stored and visible in `/admin/settings`.

---

### Story 8.3: Club Admin — Data Export (GDPR Portability)

As a Club Admin,
I want to export all my club's content data in a portable, machine-readable format,
So that I can exercise my right to data portability and migrate my content if needed.

**Acceptance Criteria:**

**Given** the Club Admin is in the admin dashboard and opens the Settings section,
**When** they view the Settings page,
**Then** an "Export data" option is available (FR40).

**Given** the Club Admin clicks "Export data",
**When** the dialog opens,
**Then** a confirmation dialog explains what will be exported: club profile data (name, description, schedule, contact info, how to join), photo metadata and URLs, and operator messages. Post-MVP: will also include pages, elements, calendar events, gallery item metadata, documents metadata, and contact form submissions.

**Given** the Club Admin confirms the export,
**When** the `exportClubData` Server Action executes,
**Then** `clubId` is resolved from URL params (verified by the club layout membership check — never from client input or stored session data); a structured JSON export is generated containing all club-scoped data and delivered as a `.zip` download within 30 seconds for up to 5,000 records.

**Given** the club has more than 5,000 records,
**When** the export is confirmed,
**Then** an async export job is triggered; the club admin receives an email via Resend when the download link is ready; the link expires after 24 hours.

**Given** the generated export,
**Then** it contains no raw file binaries (photos, logo) — only metadata and R2/MinIO URLs; the JSON structure includes: `version`, `exportedAt`, `club` (all profile fields), `photos` (metadata + URLs), `operator_messages`; post-MVP additions: `pages`, `elements`, `events`, `gallery_items`, `documents`, `contact_submissions`; the export operation is logged to `audit_log` with: `clubId`, `exportedAt`, `recordCount`.

---

### Story 8.4: Cookie Consent Mechanism _(Deferred — not needed at MVP since no analytics cookies are set; revisit when Story 7.3 is implemented)_

As a visitor on the platform site or any club site,
I want to be informed about cookie usage and give or decline consent before any non-essential cookies are set,
So that my privacy choices are respected and the platform meets its GDPR/nDSG obligations.

**Acceptance Criteria:**

**Given** a first-time visitor to the platform site or any club site,
**When** the page loads,
**Then** a cookie consent banner appears at the bottom of the viewport before any non-essential cookies or tracking scripts are activated; the banner shows: a brief explanation of cookie usage, an "Accept" button, a "Decline" button, and a "Manage preferences" link (FR42).

**Given** the visitor clicks "Accept",
**When** consent is recorded,
**Then** consent is stored in a `consent` cookie (SameSite=Strict, 12-month expiry); the banner is dismissed; analytics tracking (`page_events` recording) activates for this session.

**Given** the visitor clicks "Decline",
**When** the choice is recorded,
**Then** only strictly necessary cookies are set; analytics tracking is suppressed for this session; the banner is dismissed; no `page_events` record is created for this visitor.

**Given** the visitor clicks "Manage preferences",
**When** the modal opens,
**Then** toggles are shown for each category: Strictly Necessary (always on, non-togglable), Analytics (default off); saving preferences records the choice identically to Accept or Decline.

**Given** a club page with third-party embeds (post-MVP: Map sub-block on Contact page),
**When** a visitor who has not consented views the page,
**Then** the embed is blocked behind a click-to-load overlay: "Click to load (requires cookies)" — clicking reveals the embed and prompts for consent. (At MVP, no third-party embeds exist on club profile pages — this AC applies post-MVP.)

**Given** consent state,
**Then** it is checked server-side before inserting `page_events` records — no analytics events are created for visitors who declined; consent persists across pages within a session and across sessions for 12 months.

**Given** the consent banner and preferences modal,
**Then** they meet WCAG 2.1 AA: fully keyboard-accessible, screen-reader compatible, minimum 44px touch targets on all interactive elements.

---

## Epic 9: Launch Readiness — Dev Infra & GDPR Compliance

This epic covers the remaining blockers before going live with the first ~10 clubs: fixing the local development image upload pipeline, implementing GDPR right-to-erasure (account + club deletion), and GDPR data portability (club data export). These are prerequisites for accepting real user data.

### Story 9.1: Local Dev Image Upload Pipeline

As a Developer,
I want `docker compose up` to fully provision MinIO (bucket creation, public read policy, CORS) automatically,
So that image upload works out of the box without manual setup steps.

**Acceptance Criteria:**

**Given** the developer runs `docker compose -f docker-compose.dev.yml up`,
**When** the MinIO container is healthy,
**Then** a `minio-init` sidecar service automatically creates the `website-template` bucket (if it doesn't exist), sets the `download` anonymous policy for public reads, and exits successfully.

**Given** a browser-based upload from `http://localhost:3000`,
**When** the client PUTs to the presigned MinIO URL on `http://localhost:9000`,
**Then** the CORS preflight succeeds (MinIO is configured with `MINIO_API_CORS_ALLOW_ORIGIN=http://localhost:3000`); the upload completes with HTTP 200.

**Given** the `.env.example` file,
**Then** it documents all required R2/MinIO variables (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`) with working default values for local dev.

**Given** the `next.config.ts` `images.remotePatterns`,
**Then** it includes `localhost` for local dev; a code comment documents that the production R2 hostname must be added before deployment.

**Implementation notes:** This story is already implemented — `docker-compose.dev.yml` has the `minio-init` service and `MINIO_API_CORS_ALLOW_ORIGIN` env var. Marking as done.

---

### Story 9.2: GDPR Right-to-Erasure — Account & Club Deletion

As a Club Admin,
I want to delete my account and all associated data from the platform,
So that I can exercise my right to erasure under GDPR.

**Acceptance Criteria:**

**Given** the Club Admin navigates to `/{lang}/account`,
**When** they view the account settings page,
**Then** a "Delete my account" section is visible at the bottom of the page.

**Given** the Club Admin clicks "Delete my account",
**When** the confirmation dialog opens,
**Then** it lists exactly what will be deleted: user account, all club memberships, and for each club where they are OWNER with no other OWNER — the club itself including: profile data, all R2 objects (logo + photos), all club photos, all support messages, and the club's URL path.

**Given** the Club Admin is the sole OWNER of one or more clubs,
**When** they attempt to delete their account,
**Then** the dialog warns that those clubs will be permanently deleted; the admin must type the club name(s) to confirm (double-confirmation for destructive action).

**Given** the Club Admin is an EDITOR (not OWNER) of a club,
**When** they delete their account,
**Then** only their membership record is removed; the club itself is unaffected.

**Given** the Club Admin confirms deletion,
**When** the `deleteAccount` Server Action executes,
**Then** within a single Prisma transaction: all R2 objects for owned clubs are deleted (best-effort, failures logged); all `ClubPhoto` records for owned clubs are deleted; all `SupportMessage` records for owned clubs are deleted; all `ConversationReadCursor` records for owned clubs are deleted; all `ClubMembership` records (across all clubs) are deleted; all owned `Club` records are deleted; all `Session` records for the user are deleted; all `Account` records (OAuth) are deleted; the `User` record is deleted.

**Given** deletion completes,
**Then** the user's session cookie is cleared; they are redirected to `/{lang}/auth/login`; any subsequent request with their old session returns HTTP 401.

**Given** the deletion fails mid-way,
**Then** the Prisma transaction rolls back — no partial deletion. R2 deletions that already succeeded are orphaned (acceptable — no user data leak since the objects are just images with random keys).

---

### Story 9.3: GDPR Data Portability — Club Data Export

As a Club Admin,
I want to export all my club's data in a machine-readable format,
So that I can exercise my right to data portability under GDPR.

**Acceptance Criteria:**

**Given** the Club Admin navigates to `/{lang}/club/{clubId}/settings`,
**When** they view the settings page,
**Then** an "Export data" button is visible.

**Given** the Club Admin clicks "Export data",
**When** the confirmation dialog opens,
**Then** it explains what will be exported: club profile (name, description, schedule, contact info, how to join, activity type, canton, location), logo metadata and URL, photo metadata and URLs, and support message history.

**Given** the Club Admin confirms the export,
**When** the `exportClubData` Server Action executes,
**Then** `clubId` is resolved from URL params (verified by the club layout membership check); a JSON file is generated containing all club-scoped data; the file is delivered as a browser download (`Content-Disposition: attachment`).

**Given** the generated export,
**Then** it contains: `version` (export schema version), `exportedAt` (ISO timestamp), `club` (all profile fields), `logo` (URL + alt text), `photos` (array of URL + alt + position), `messages` (array of support messages with sender role, body, timestamp); no raw file binaries — only metadata and R2 URLs.

**Given** the Club Admin has EDITOR role (not OWNER),
**When** they attempt to export,
**Then** the action is denied — only OWNER can export club data.

---

### Story 9.4: Operator — Delete Club

As a Platform Operator,
I want to delete a club and all its associated data from the operator dashboard,
So that I can remove clubs that violate platform policies or at the club admin's request.

**Acceptance Criteria:**

**Given** the operator views a club detail page at `/{lang}/admin/clubs/{id}`,
**When** they click "Delete club",
**Then** a confirmation dialog shows the club name and lists what will be deleted: club profile, all R2 objects, all photos, all memberships, all support messages.

**Given** the operator confirms deletion,
**When** the `deleteClub` Server Action executes,
**Then** within a single Prisma transaction: all R2 objects are deleted (best-effort); all `ClubPhoto`, `SupportMessage`, `ConversationReadCursor`, `ClubMembership` records are deleted; the `Club` record is deleted. User accounts of club members are NOT deleted (they may belong to other clubs).

**Given** the deletion completes,
**Then** the operator is redirected to the clubs list; a success toast confirms the deletion; the club's public URL returns HTTP 404.

---

## Post-MVP: Deferred Features

The following stories are deferred to post-MVP and will be prioritized after the core platform is validated with real clubs.

### Post-MVP Story: Custom Domain Setup & DNS Verification (FR8)

As a Club Admin,
I want to configure a custom domain for my club's website,
So that visitors can reach my club at my own branded URL instead of the platform path.

**Acceptance Criteria:**

**Given** the Club Admin navigates to domain settings in their admin panel,
**When** they enter a custom domain (e.g., `www.my-ski-club.ch`) and submit,
**Then** the system stores the requested domain and generates a DNS verification token; the UI displays the required DNS record: `CNAME www → platform-hostname` and a `TXT` record for ownership verification (FR8).

**Given** the Club Admin has added the required DNS records at their registrar,
**When** they click "Verify Domain",
**Then** the system performs a DNS lookup to confirm both the `CNAME` and `TXT` records are present; on success the domain `status` is set to `verified`; on failure a specific error is shown explaining which record is missing or incorrect.

**Given** the domain is verified,
**When** a visitor accesses the club at the custom domain,
**Then** Nginx routes the request to the Next.js app using the custom domain; the club is resolved from the `clubs` table by `customDomain` field; the correct club site is rendered — the platform path URL continues to work in parallel.

**Given** the Club Admin removes their custom domain,
**When** confirmed,
**Then** the `customDomain` field is cleared; Nginx routing falls back to the platform path URL within one deployment cycle; the removed domain record is deleted.
