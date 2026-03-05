---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
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
FR2: Club Admin can toggle between public view and edit mode directly on their club website
FR3: Club Admin can activate and deactivate optional pages in their site's navigation
FR4: Club Admin can create custom pages with user-defined navigation labels
FR5: Club Admin can configure one level of sub-pages within their site's navigation
FR6: System prevents Club Admin from removing anchor pages (Home and Contact)
FR7: System enforces a configurable maximum page count per club site
FR8: Club Admin can set up and manage a custom domain for their site
FR9: System provisions a URL path for each approved club immediately upon acceptance
FR46: Club Admin can select an accent color for their site from a curated palette of 8 presets

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
FR21: Public Visitor can filter the directory by activity type and geographic region
FR22: Public Visitor can view any club's public website without authentication
FR23: Public Visitor can submit a contact message through a club's contact form
FR24: System delivers contact form submissions to the club's registered email address with reply-to set to the sender's address
FR25: Public Visitor can navigate from any club site to the platform directory via the footer attribution link
FR26: System displays a mandatory, non-removable platform attribution link in the footer of every club site

**Application & Access**

FR27: Club Applicant can submit an application to join the platform providing association name, activity type, and description
FR28: Club Admin can authenticate and access their site's edit mode via the platform site login
FR29: Platform Operator can authenticate via a dedicated platform-level admin interface separate from club sites
FR30: Club Admin can submit a support request to the platform team from the platform site

**Platform Operations**

FR31: Platform Operator can view and manage a queue of pending club applications
FR32: Platform Operator can approve an application, triggering automatic URL path provisioning and an acceptance email to the applicant
FR33: Platform Operator can reject an application with an explanatory email to the applicant
FR34: Platform Operator can view platform-wide metrics (clubs live, custom domains, uptime, performance scores, storage)
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
- Nginx for single-domain routing and custom domain passthrough
- Certbot/Let's Encrypt for automated TLS (single domain via HTTP-01, per-club custom domains via HTTP-01)
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
- URL architecture: language, country, and club as path segments — `platform-name.com/{lang}/{country}/{club-slug}` (language and country are independent; no DNS provisioning per club)

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
- React Context for EditModeContext and AuthContext; URL param `?edit=true` as source of truth for edit mode
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

- Dark sidebar = edit mode; no sidebar = public view — visual mode signal via sidebar presence/styling
- Edit affordances via card-based EditFieldCard component; LivePreviewPanel below for live feedback
- Mobile: hamburger drawer for sidebar; EditFieldCard full-width stacked above LivePreviewPanel
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
| FR8 | Epic 8 | Custom domain management |
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
| FR25 | Epic 3 | "Powered by" footer → platform directory |
| FR26 | Epic 3 | Mandatory footer attribution |
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

## Epic List

### Epic 1: Project Foundation & Core Infrastructure
The development environment, database schema, authentication system, multi-club membership model, and deployment pipeline are operational. Developers can run the full stack locally; Club Admins can authenticate via magic link, TOTP, and passkeys, manage multiple clubs from a personal homepage, and Owners can invite Editors, transfer ownership, and revoke access; Platform Operators can authenticate through a dedicated admin interface.
**FRs covered:** FR28, FR29
**NFRs addressed:** NFR6, NFR8–13, NFR14–15, NFR18–20, NFR25–27

### Epic 2: Club Application & Onboarding
Club Applicants can submit an application to join the platform; the Platform Operator can review the queue and approve or reject applications; approved clubs receive a provisioned URL path and a login link by email — fully automated.
**FRs covered:** FR9, FR27, FR31, FR32, FR33

### Epic 3: Public Platform Site & Discovery
Public Visitors can browse the platform homepage, filter the country directory by activity type and region, and navigate to individual club public sites. Every club site carries a mandatory "Powered by" footer with automatic SEO metadata — no configuration required.
**FRs covered:** FR20, FR21, FR22, FR25, FR26, FR43
**NFRs addressed:** NFR1, NFR2, NFR3, NFR21–24

### Epic 4: Club Site Identity & Navigation
Club Admins can configure their site's core identity (name, logo, welcome text, accent color), manage pages (activate, deactivate, create, enforce limit), toggle between edit and public view directly on their own URL, explicitly save changes, and restore any previous version from version history.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR17, FR18, FR46
**NFRs addressed:** NFR4, NFR17

### Epic 5: Club Content Elements
Club Admins can add and manage rich content on custom pages using the element library: rich text, inline images, calendar events, image/video galleries, and document libraries. File constraints are displayed inline before upload — never after failure.
**FRs covered:** FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR19
**NFRs addressed:** NFR7 (file storage encryption)

### Epic 6: Contact & Communication
Public Visitors can contact clubs through a contact form with automatic email relay (reply-to set to the sender's address). Club Admins can view stored contact submissions. Club Admins can submit support requests to the platform team from the platform site.
**FRs covered:** FR23, FR24, FR30, FR44
**NFRs addressed:** NFR7 (contact submission encryption), NFR16 (email relay monitoring)

### Epic 7: Platform Operations & Health Monitoring
The Platform Operator can view platform-wide metrics, monitor club site health, send nudges to club admins about detected issues, manage the support inbox, configure platform-wide operational variables without a deployment, view per-club analytics, and trust that template updates are silently applied to all clubs with zero downtime.
**FRs covered:** FR34, FR35, FR36, FR37, FR38, FR39, FR45
**NFRs addressed:** NFR4, NFR5, NFR15, NFR16, NFR25, NFR27

### Epic 8: Custom Domains & Data Compliance
Club Admins can set up a custom domain for their site with automated TLS. All GDPR/nDSG data rights are available: clubs can export their data and request deletion. A cookie consent mechanism is presented where legally required.
**FRs covered:** FR8, FR40, FR41, FR42
**NFRs addressed:** NFR6 (custom domain TLS)

---

## Epic 1: Project Foundation & Core Infrastructure

The development environment, database schema, authentication system, multi-club membership model, and deployment pipeline are operational. Club Admins can authenticate via magic link, TOTP, and passkeys; navigate a personal homepage listing all their clubs; and manage membership (invite Editors, transfer ownership, revoke access). Platform Operators authenticate via a dedicated admin interface.

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
**Then** a session is created and they are redirected to `/my-clubs` (personal homepage); if TOTP is not yet enrolled, a persistent non-dismissible banner on every club page prompts enrollment — the QR code screen is accessed from that banner's link.

**Given** a Club Admin session exists but TOTP is not yet enrolled,
**When** they access any authenticated page,
**Then** a persistent, non-dismissible banner prompts TOTP enrollment with a direct link to the enrollment screen.

**Given** a Club Admin has TOTP enrolled,
**When** they log in with their password on the standard login page,
**Then** they are redirected to a TOTP challenge page; a valid 6-digit code is required before the session is fully established; on success they are redirected to `/my-clubs`.

**Given** an incorrect TOTP code is submitted,
**Then** an inline error is shown and subsequent attempts from the same IP are rate-limited via the in-memory sliding window limiter.

---

### Story 1.4: Personal Homepage & Club Membership Guard

As a Club Admin,
I want a personal homepage (`/my-clubs`) that lists every club I manage with a role indicator, and a server-side membership check on every club edit route,
So that I can navigate to any of my clubs in one place and be blocked from accessing clubs I am not a member of.

**Acceptance Criteria:**

**Given** an authenticated Club Admin navigates to `/my-clubs`,
**When** the page loads,
**Then** all clubs where they hold an `ACTIVE` `ClubMembership` are listed with a role badge (`Owner` or `Editor`); each entry links to that club's admin URL.

**Given** an authenticated Club Admin has exactly one active membership,
**When** they navigate to `/my-clubs`,
**Then** they are automatically redirected to that club's admin URL — the club picker is skipped entirely.

**Given** an authenticated Club Admin has no active memberships,
**When** they navigate to `/my-clubs`,
**Then** an empty-state message is displayed: "You are not a member of any club — contact the platform operator."

**Given** any authenticated user visits a club edit URL (`/[lang]/ch/[club]/...`),
**When** the club layout renders,
**Then** the server performs a `ClubMembership.findFirst({ where: { userId, clubSlug, status: ACTIVE } })` lookup; if no active membership exists the user is redirected to `/my-clubs`.

**Given** the session object,
**Then** it never includes `clubId`; the active club is always resolved from the URL path and verified via `ClubMembership` at layout render time — never from stored session data.

**Given** every successful authentication event (password setup, TOTP enrollment, TOTP challenge, regular login without TOTP),
**Then** the user is redirected to `/my-clubs` — never directly to a specific club edit URL.

**Given** `pnpm prisma db seed` is run,
**When** the seed completes,
**Then** `prisma/seed.ts` creates `ClubMembership` records (`role: OWNER, status: ACTIVE`) linking each seeded club admin user to their respective sample club — the `/my-clubs` page and membership guard are fully exercisable against seeded data without any manual DB intervention.

> **Dev note — seed carry-over from Story 1.2:** The `prisma/seed.ts` was not updated when the architect introduced the `ClubMembership` model (ADR-001). The schema is correct; only the seed data is missing. Updating the seed is the **first task** of this story.

---

### Story 1.5: Platform Operator Authentication & Admin Route Protection


As a Platform Operator,
I want to authenticate via a dedicated login page with password and TOTP, with all `/admin/*` routes protected by `proxy.ts`,
So that I can securely access the platform admin dashboard, fully isolated from club admin sessions.

**Acceptance Criteria:**

**Given** the operator login page at `/admin/login`,
**When** the Platform Operator submits their email and correct password,
**Then** they are presented with a TOTP challenge; submitting a valid code establishes an operator session.

**Given** a valid operator session,
**When** any `/admin/*` route is accessed,
**Then** `proxy.ts` allows access and the operator dashboard renders.

**Given** no session or a Club Admin session,
**When** any `/admin/*` route is accessed,
**Then** `proxy.ts` redirects to `/admin/login` — no dashboard content is served.

**Given** a Club Admin with an active membership for Club A only,
**When** they attempt to access Club B's edit route,
**Then** the club layout membership guard blocks access — no active `ClubMembership` exists for Club B — and redirects to `/my-clubs`.

**Given** a public visitor (no session),
**When** `?edit=true` is appended to any club URL,
**Then** `proxy.ts` redirects to the platform login page.

**Given** the seeded operator account,
**When** logging into `/admin/login` with the seeded credentials,
**Then** login succeeds and the operator dashboard is accessible.

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
**Then** their `ClubMembership` status is atomically updated to `ACTIVE` in the same transaction that completes credential setup; they are then redirected to `/my-clubs`.

**Given** the invited person clicks the accept link and is an already-authenticated existing user,
**When** they land on the accept page,
**Then** their `ClubMembership` status is updated to `ACTIVE` immediately and they are redirected to `/my-clubs` where the new club appears in their list.

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
**Then** the `ClubMembership.status` is updated to `REVOKED`; on the revoked member's next request to any route under `/[lang]/ch/[club]/`, the club layout membership guard detects no active membership and redirects them to `/my-clubs`.

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

Public Visitors can browse the platform homepage, filter the country directory, and navigate to club public sites. Every club site has automatic SEO and a mandatory "Powered by" footer.

### Story 3.1: Platform Homepage & Country Navigation

As a Public Visitor,
I want to land on a clear, fast-loading platform homepage that presents the philosophy and lets me navigate to my country's directory,
So that I immediately understand the platform's purpose and can find clubs in my region.

**Acceptance Criteria:**

**Given** a visitor navigates to the root platform domain,
**When** the page loads,
**Then** it renders server-side with: a short declarative headline, the platform philosophy, `CountryButton` components for each active country (showing country name, flag icon, and club count), and aggregate platform statistics.

**Given** the platform homepage,
**Then** it scores ≥ 90 on Core Web Vitals (Lighthouse performance, SEO, accessibility) and includes full meta tags and Open Graph tags generated automatically.

**Given** a visitor clicks a `CountryButton`,
**When** they are redirected to the country path (e.g., `platform-name.com/fr/ch`),
**Then** the country directory page loads — routing is handled at the application layer via `lib/country.ts` and the `[lang]` segment, not DNS.

**Given** the platform site,
**Then** it includes static pages: `/about` (platform philosophy) and a `/support` placeholder page (full support form implemented in Epic 6).

---

### Story 3.2: Country Directory with Filtering

As a Public Visitor,
I want to browse a filterable directory of member associations on the country page,
So that I can discover clubs matching my activity interest and geographic region.

**Acceptance Criteria:**

**Given** a visitor navigates to a country path (e.g., `platform-name.com/fr/ch`),
**When** the page loads,
**Then** it renders server-side with a filter bar (activity type select, region/canton select) and a grid of `ClubCard` components for all active clubs in that country.

**Given** the visitor changes an activity type or region filter,
**When** the filter value changes,
**Then** the club grid updates with a loading skeleton visible within 100ms; only matching clubs are shown — no full page reload required.

**Given** active filters produce no matching clubs,
**Then** an inline empty state is shown: "No clubs match these filters" with a "Reset filters" link — never a dead end.

**Given** active filter values,
**Then** they are reflected in the URL as query parameters (e.g., `?activity=ski&region=valais`) so the filtered view is shareable and bookmarkable.

**Given** the directory page,
**Then** it is server-rendered for SEO with structured data for each club entry; the filter UI degrades gracefully without JavaScript.

---

### Story 3.3: Club Public Site — Server-Rendered Home Page

As a Public Visitor,
I want to view a club's public home page with their name, logo, welcome text, and navigation,
So that I can quickly understand who the club is and find the information I need.

**Acceptance Criteria:**

**Given** a visitor navigates to a club's URL path (e.g., `platform-name.com/fr/ch/ski-club-valais`),
**When** the page loads,
**Then** it renders server-side with: the club's logo, name (`<h1>`), welcome text, a primary CTA button linking to the Contact page, and the `ClubSidebarNav` with all active pages listed.

**Given** the club home page,
**Then** it achieves Time to First Contentful Paint < 2 seconds on a standard broadband connection and scores ≥ 90 on Core Web Vitals.

**Given** a club with no logo uploaded,
**Then** a monogram avatar (club name initial) is displayed as the logo placeholder.

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

**Given** a visitor clicks a navigation link in the `ClubSidebarNav`,
**When** navigation occurs,
**Then** a loading skeleton matching the expected content shape is displayed within 100ms; content loads from the Route Handler and renders within 2 seconds.

**Given** a visitor directly navigates to a club inner page URL (e.g., `platform-name.com/fr/ch/ski-club-valais/calendar`),
**When** the page loads,
**Then** it renders correctly and is crawlable via direct URL access.

**Given** the `ClubSidebarNav`,
**Then** the active page is highlighted with `aria-current="page"` and a left border in the club's accent color; on mobile the nav collapses to a hamburger that opens a full-height `Sheet` drawer.

**Given** a club has sub-pages configured,
**Then** the sidebar nav renders them nested under their parent page, one level deep.

---

### Story 3.5: Mandatory "Powered By" Footer & Platform Sitemap

As a Public Visitor,
I want every club site to have a "Powered by" footer link back to the platform,
So that I can discover the platform and other clubs from any club site I visit.

**Acceptance Criteria:**

**Given** any public club site page (home or inner),
**Then** the `PoweredByBanner` component renders in the footer with a link to the platform homepage; it is non-removable by club admins and present on every page (FR26).

**Given** a visitor clicks the "Powered by" footer link,
**When** they arrive on the platform homepage,
**Then** the platform homepage loads as per Story 3.1 (FR25).

**Given** all active club sites,
**Then** a platform-level sitemap served at `/sitemap.xml` includes all club home page URLs, generated automatically — no admin action required (FR43).

**Given** each club home page,
**Then** the server-rendered HTML includes a `<link rel="canonical">` tag and `<meta name="robots" content="index, follow">`.

**Given** the `PoweredByBanner`,
**Then** it meets WCAG 2.1 AA contrast requirements in both light and dark mode and is keyboard-accessible with a descriptive `aria-label`.

---

## Epic 4: Club Site Identity & Navigation

Club Admins can configure their site's core identity, manage pages, toggle edit mode on their own URL, explicitly save changes, and restore previous versions.

### Story 4.1: Edit Mode Toggle & Visual Mode Signal

As a Club Admin,
I want to toggle between public view and edit mode directly on my club's URL with a clear visual signal,
So that I always know which mode is active and visitors are never exposed to admin chrome.

**Acceptance Criteria:**

**Given** an authenticated Club Admin visiting their club's public URL,
**When** the page loads,
**Then** a subtle "Edit site" ghost button with a pencil icon is visible in the `ClubSidebarNav` footer — completely absent for public visitors (server-side auth check).

**Given** the Club Admin clicks "Edit site",
**When** edit mode activates,
**Then** the URL gains `?edit=true`; the sidebar background switches to dark (edit mode styling); no page reload occurs; the mode change is instant.

**Given** `?edit=true` is in the URL,
**When** a public visitor (no session) attempts to access the URL,
**Then** `proxy.ts` redirects them to the platform login page — the edit chrome is never served.

**Given** edit mode is active,
**When** the Club Admin clicks "View site" (public view toggle),
**Then** `?edit=true` is removed from the URL; the sidebar returns to its neutral public styling; all edit affordances disappear.

**Given** the edit mode state,
**Then** it is driven exclusively by the `?edit=true` URL param (bookmarkable, survives page refresh) via `EditModeContext`; it is never stored in `localStorage`.

---

### Story 4.2: Club Identity Configuration (Name, Logo, Welcome Text)

As a Club Admin,
I want to configure my club's name, logo, and welcome text in edit mode,
So that my club's public home page reflects our identity from the very first save.

**Acceptance Criteria:**

**Given** the Club Admin is in edit mode on the club home page,
**When** they hover over the identity section,
**Then** an `EditFieldCard` appears with fields for: club name (text input), logo (`ImageUploadField` with "Max 5 MB · JPG, PNG, WebP" constraint displayed permanently), and welcome text (textarea); the amber dot is absent until a field is changed.

**Given** the Club Admin changes any field value,
**When** a change is made,
**Then** the amber unsaved-changes dot appears on the `EditFieldCard` and is mirrored on the `ClubSidebarNav`; the `LivePreviewPanel` below the card reflects the change in real time.

**Given** the Club Admin uploads a logo image meeting the constraints,
**When** the upload completes,
**Then** a thumbnail preview replaces the drop zone; an alt text field (required, enforced) appears; the logo is uploaded to R2/MinIO via a presigned URL — no file bytes pass through the Next.js server.

**Given** an uploaded file exceeds the size limit or uses an unsupported format,
**Then** an inline error appears below the upload field describing the specific constraint violated — no upload is attempted.

**Given** the Club Admin clicks Save,
**When** the `saveClubIdentity` Server Action executes,
**Then** `clubId` is resolved from URL params (verified by the club layout membership check — never from client input or stored session data); the club record is updated; `revalidatePath` invalidates the club home page SSR cache; a "Saved" toast appears; the amber dot clears.

> **Dev note:** The amber dot, Save button, and dirty-state management shown here are partial implementations. The complete explicit-save protection pattern (beforeunload guard, discard confirmation, full dirty-state lifecycle) is formally defined in Story 4.5 and must be implemented holistically across the epic — not story by story. Implement Story 4.5 as the save framework before finalising 4.2 and 4.3.

---

### Story 4.3: Page Management — Activate, Deactivate & Create Pages

As a Club Admin,
I want to activate, deactivate, and create custom pages in my site's navigation,
So that I can control which sections are publicly visible and grow my site's content over time.

**Acceptance Criteria:**

**Given** the Club Admin is in edit mode,
**When** they view the Admin sidebar tab,
**Then** a "Pages" section shows all pages with their active/inactive status and an "Add page" button.

**Given** the Club Admin toggles a custom page to inactive,
**When** the toggle is confirmed,
**Then** the page disappears from the public-facing nav immediately; it remains in the admin nav with an "inactive" badge; its content is preserved (FR3).

**Given** the Club Admin clicks "Add page" and provides a navigation label,
**When** the page is created,
**Then** a new page record is added to the database with the given label and a URL-safe slug; it appears in the sidebar nav in edit mode (FR4).

**Given** the club has reached the platform's maximum page count (default: 5, configurable),
**When** the Club Admin attempts to add another page,
**Then** the "Add page" button is disabled with the inline label: "Maximum pages reached (5)" (FR7).

**Given** the Club Admin attempts to deactivate the Home or Contact page,
**Then** no deactivation toggle is shown for these anchor pages — they cannot be removed or deactivated (FR6).

> **Dev note:** The amber dot and save mechanics referenced here are partial. The complete explicit-save protection pattern is defined in Story 4.5 — implement Story 4.5 as the save framework foundation before finalising this story.

---

### Story 4.4: Page Navigation Labels & Sub-Pages

As a Club Admin,
I want to rename pages and configure one level of sub-pages within my site's navigation,
So that my site's structure is clearly labelled and organized for visitors.

**Acceptance Criteria:**

**Given** a custom page in the admin nav,
**When** the Club Admin clicks on its label to rename it,
**Then** an inline text input allows editing the navigation label; saving updates the label in the database and invalidates the affected routes via `revalidatePath`.

**Given** the Club Admin selects a parent page and clicks "Add sub-page",
**When** they provide a sub-page label,
**Then** a new page is created as a child of the selected parent; it appears nested in the `ClubSidebarNav` one level below the parent (FR5).

**Given** a page has sub-pages,
**When** a public visitor views the nav,
**Then** the parent page is expandable to reveal its sub-pages; the parent page itself remains navigable as its own content page.

**Given** the total page count including sub-pages,
**Then** it counts against the club's maximum page limit; adding a sub-page that would exceed the limit is blocked with the same inline message as Story 4.3 (FR7).

---

### Story 4.5: Explicit Save & Unsaved Changes Protection

As a Club Admin,
I want all my edits to require an explicit Save action with a persistent unsaved-changes indicator,
So that I never accidentally publish unfinished content or lose work unexpectedly.

**Acceptance Criteria:**

**Given** any edit has been made in edit mode,
**When** the change occurs,
**Then** the amber unsaved-changes dot appears on the `EditFieldCard` and is mirrored in the `ClubSidebarNav`; the Save button becomes active (FR17).

**Given** the Club Admin attempts to navigate away (close tab, browser back) with unsaved changes,
**When** the `beforeunload` event fires,
**Then** the browser's native "Leave site?" dialog appears — triggered by `isDirty: true` in `EditModeContext`.

**Given** the Club Admin clicks Save,
**When** the save Server Action completes successfully,
**Then** the amber dot clears; a "Saved" toast appears with a timestamp; the form returns to pristine state; the SSR cache is invalidated via `revalidatePath`.

**Given** the Club Admin clicks Discard with unsaved changes,
**When** they confirm the discard dialog,
**Then** all pending changes are reverted to the last saved state; the amber dot clears; no save is made.

**Given** a Save action is in flight (Server Action pending),
**Then** the Save button shows a spinner and all edit fields are disabled — preventing duplicate submissions.

---

### Story 4.6: Version History & Content Restore

As a Club Admin,
I want to view my site's version history and restore any previous version,
So that I can recover from unwanted changes with confidence, knowing my work is never permanently lost.

**Acceptance Criteria:**

**Given** the Club Admin opens the Admin sidebar tab and navigates to "Version History",
**When** the panel opens,
**Then** a list of saved versions for the current page is displayed, each showing: version number, save timestamp, and a "Restore" button; an empty state is shown if no saves exist yet (FR18).

**Given** the Club Admin clicks "Restore" on a version and confirms the dialog,
**When** the `restoreVersion` Server Action executes,
**Then** the page content is replaced with the JSONB snapshot from `content_versions`; edit mode remains active with the restored content; the amber unsaved dot appears (restore does not auto-save).

**Given** a restore action,
**When** it completes,
**Then** the total elapsed time from confirming restore to edit mode displaying the restored content is ≤ 30 seconds (NFR17).

**Given** the platform's version retention limit (N versions per page, configurable),
**When** a new save is made and the limit is exceeded,
**Then** the oldest version is pruned automatically — the admin never manages this manually.

**Given** the version history list,
**Then** each "Restore" button has an `aria-label` including the version timestamp; the list is keyboard-navigable.

---

### Story 4.7: Accent Color Picker

As a Club Admin,
I want to select an accent color for my club's site from a curated palette,
So that my site reflects my association's visual identity and feels distinctly ours.

**Acceptance Criteria:**

**Given** the Club Admin is in edit mode and opens the Admin sidebar tab,
**When** they view the Identity section,
**Then** an `AccentColorPicker` is displayed showing 8 color swatches with labels: Zinc, Blue, Green, Red, Violet, Orange, Rose, Yellow; the currently active accent is visually indicated with a checkmark ring (FR46).

**Given** the Club Admin selects a different accent color,
**When** the selection is made,
**Then** the site's OKLCH accent token updates in real time in the `LivePreviewPanel` — the accent is immediately visible on the active nav indicator border, CTA button, and link colors without a page reload; the amber unsaved-changes dot appears.

**Given** the Club Admin saves,
**When** the `saveClubIdentity` Server Action executes,
**Then** the selected accent color slug (e.g., `"blue"`) is persisted to `clubs.accentColor`; the public club site immediately reflects the new accent via CSS custom property override on the `<html>` element — served server-side to avoid flash of unstyled content.

**Given** a club with no accent color set (legacy or newly provisioned),
**Then** the accent defaults to `Zinc`; no migration is required — the Zinc preset is the base Tailwind palette already in use.

**Given** the `AccentColorPicker`,
**Then** it is fully keyboard-accessible: arrow keys move focus between swatches; Enter or Space selects the focused swatch; the active swatch has `aria-checked="true"` and the group uses `role="radiogroup"`.

---

## Epic 5: Club Content Elements

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
**Then** the `position` integer on each affected `page_element` record is updated; the amber dot appears; the `LivePreviewPanel` reflects the new order immediately.

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
**Then** changes appear in the `LivePreviewPanel` in real time; the amber dot appears.

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
**Then** an `EditFieldCard` is shown for each available sub-block: Contact Form, Map, Phone Number, Email Address, and Predefined Message Subjects — each independently togglable (FR11).

**Given** the Club Admin enables the Contact Form sub-block and saves,
**Then** the contact form appears on the public Contact page; the club's registered email is automatically used as the recipient — no additional configuration required.

**Given** the Club Admin enables and configures Predefined Message Subjects and saves,
**Then** the contact form shows a subject dropdown pre-populated with the configured subjects; visitors must select one before submitting.

**Given** the Club Admin enables the Map sub-block and enters an address and saves,
**Then** the address is displayed on the public Contact page as a static map image (no Google Maps iframe — avoids third-party cookies) and as accessible plain text.

**Given** the Club Admin disables a sub-block and saves,
**Then** that sub-block is hidden from the public Contact page after the next SSR cache invalidation; its configuration data is retained for re-enabling later.

---

## Epic 6: Contact & Communication

Club visitors can reliably reach associations via contact forms; club admins can read received messages; platform operators receive support requests; and the email relay is actively monitored for health.

### Story 6.1: Public Contact Form & Email Relay

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

### Story 6.2: Email Relay Health Monitoring

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

### Story 6.3: Club Admin — View Contact Form Submissions

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

Platform Operators have full operational visibility — they can manage the club registry, monitor system health, enforce usage limits, view privacy-safe analytics, and control platform-wide flags.

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
**Then** the operator sees full club metadata: name, logo, contact email, plan details, page count, custom domain (if any), and a list of admin actions.

**Given** the operator triggers a "Suspend" action on a club,
**When** confirmed,
**Then** the club's `status` is set to `suspended`; their public site returns HTTP 503; the club admin receives a notification email explaining the suspension.

**Given** the operator triggers a "Reinstate" action on a suspended club,
**Then** the club's `status` is reset to `active`; their public site is restored immediately.

**Given** the operator navigates to `/admin/dashboard`,
**When** the page loads,
**Then** an aggregate platform metrics panel is shown with: total clubs live, number with custom domains configured, platform-wide uptime % for the last 30 days, and percentage of club sites with all Lighthouse scores ≥ 90 — all displayed as summary statistics without requiring drill-down into individual clubs (FR34).

---

### Story 7.2: Operator Dashboard — Site Metrics & Usage Limits

As a Platform Operator,
I want to monitor per-club site metrics and enforce configurable usage limits,
So that the platform stays performant and fair across all member associations.

**Acceptance Criteria:**

**Given** the operator views the club detail page,
**When** the metrics section loads,
**Then** the following counters are displayed: page count, element count per page, total R2/MinIO storage used (MB), and a breakdown by asset type (images, videos, documents) (FR34).

**Given** a Club Admin attempts to exceed a platform-defined limit (e.g., max pages, max storage),
**When** the limit is reached,
**Then** the system returns a clear error: "You have reached the maximum number of pages allowed" — no partial state is created; the operation is rejected atomically (FR7, FR38).

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

### Story 7.7: Operator Nudge — Club Admin Notification

As a Platform Operator,
I want to send a notification to a club admin about a detected site issue,
So that I can prompt them to fix problems without needing to contact them outside the platform.

**Acceptance Criteria:**

**Given** the operator is on the health dashboard (Story 7.6) or any club detail page,
**When** they click "Send nudge",
**Then** a modal opens with: a pre-filled subject ("Action needed: [detected issue type]"), an editable message body, and a Send button (FR36).

**Given** the operator fills in or edits the message and clicks Send,
**When** the `sendNudge` Server Action executes,
**Then** Resend dispatches an email to the club admin's registered address; the `reply-to` header is set to the operator's platform email; a `operator_nudges` record is created with: `clubId`, `operatorId`, `subject`, `messageBody`, `sentAt`.

**Given** the nudge is sent successfully,
**Then** a confirmation toast appears: "Nudge sent to [club name] admin"; the club detail page shows a "Last nudged" timestamp.

**Given** the operator attempts to send a second nudge to the same club within 24 hours,
**Then** the Send button is disabled with the label: "Nudge already sent in the last 24 hours" — preventing spam to club admins.

**Given** the Resend API call fails,
**Then** the Server Action returns an error; the `operator_nudges` record is not created; the operator sees an inline error with a retry option.

---

### Story 7.8: Operator Support Inbox

As a Platform Operator,
I want to view, manage, and respond to club admin support requests from a dedicated inbox,
So that I can handle support tickets efficiently without relying solely on email threads.

**Acceptance Criteria:**

**Given** the operator navigates to `/admin/support`,
**When** the page loads,
**Then** a paginated list of all support tickets is shown with: club name, subject, status (open/closed), submitted date, last updated; tickets are sorted newest first; an open-ticket count badge is shown in the admin nav (FR37).

**Given** the ticket list,
**Then** open and closed tickets are visually distinguished; the operator can filter by status (All / Open / Closed).

**Given** the operator clicks a ticket,
**When** the detail view opens,
**Then** the full ticket is shown: club name, club admin email, subject, message body, submission date, any file attachment, and a reply thread of previous replies.

**Given** the operator composes a reply and submits,
**When** the `replyToTicket` Server Action executes,
**Then** Resend dispatches an email to the club admin's registered address with the reply text; `reply-to` is set to the operator platform email; the reply is saved to a `ticket_replies` table with: `ticketId`, `operatorId`, `body`, `sentAt`.

**Given** the operator changes ticket status (open → closed or closed → open),
**When** confirmed,
**Then** the `support_tickets` record is updated; the status badge updates immediately (optimistic UI); the status change is logged to `audit_log`.

---

### Story 7.9: Template Versioning & Silent Migration

As a Platform Operator,
I want club sites to automatically receive template updates silently after each deployment,
So that all clubs benefit from improvements and fixes without any action required from me or from club admins.

**Acceptance Criteria:**

**Given** a new Next.js build is deployed,
**When** the deployment completes,
**Then** all club sites immediately serve the updated template — no per-club migration step is required; club content stored in `page_elements`, `events`, `gallery_items`, and `documents` is schema-agnostic JSONB and is never corrupted by UI-layer changes (FR39, NFR15).

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

## Epic 8: Custom Domains & Data Compliance

Club Admins can connect a custom domain to their site, export their data (GDPR portability), and request account deletion (GDPR right-to-erasure). A cookie consent mechanism is presented where legally required. Data retention policies are applied automatically.

### Story 8.1: Custom Domain Setup & DNS Verification

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

---

### Story 8.2: GDPR Right-to-Erasure — Club Data Deletion

As a Club Admin,
I want to request deletion of my club's data from the platform,
So that my association can exercise its right to erasure under GDPR.

**Acceptance Criteria:**

**Given** the Club Admin navigates to the "Delete Club Account" section,
**When** they initiate the deletion request,
**Then** a confirmation dialog is shown listing exactly what will be deleted: club profile, all pages and elements, all uploaded files (R2/MinIO), all contact form submissions, and the club admin user account (FR41).

**Given** the Club Admin confirms the deletion,
**When** the deletion job runs,
**Then** all R2/MinIO objects for the club are deleted; all Prisma records scoped to the `clubId` are hard-deleted in dependency order (child records before parent); the club's URL path is de-provisioned; the deletion is logged to `audit_log` (FR41).

**Given** the deletion job completes,
**Then** the club admin's session is invalidated immediately; any subsequent request using their credentials returns HTTP 401; the platform path URL for the club returns HTTP 404.

**Given** the Club Admin has a custom domain configured at time of deletion,
**Then** the custom domain record is also cleared; if the deletion fails mid-way, the operation rolls back fully (Prisma transaction) — no partial deletion state is possible.

---

### Story 8.3: GDPR Visitor Data Requests & Automated Retention

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
**Then** all `page_events` records older than 12 months are deleted; all `contact_submissions` records older than 24 months are deleted; a summary of deleted record counts is appended to an application log.

**Given** the cleanup job runs,
**Then** the job itself is idempotent — running it twice in the same window produces no errors and no additional deletions; the job's last-run timestamp is stored and visible in `/admin/settings`.

---

### Story 8.4: Club Admin — Data Export (GDPR Portability)

As a Club Admin,
I want to export all my club's content data in a portable, machine-readable format,
So that I can exercise my right to data portability and migrate my content if needed.

**Acceptance Criteria:**

**Given** the Club Admin is in edit mode and opens the Admin sidebar tab,
**When** they view the Admin section,
**Then** an "Export data" option is available alongside Version History, Account, and Custom Domain (FR40).

**Given** the Club Admin clicks "Export data",
**When** the dialog opens,
**Then** a confirmation dialog explains what will be exported: club profile, all pages and elements, calendar events, gallery item metadata, documents metadata, and decrypted contact form submissions.

**Given** the Club Admin confirms the export,
**When** the `exportClubData` Server Action executes,
**Then** `clubId` is resolved from URL params (verified by the club layout membership check — never from client input or stored session data); a structured JSON export is generated containing all club-scoped data and delivered as a `.zip` download within 30 seconds for up to 5,000 records.

**Given** the club has more than 5,000 records,
**When** the export is confirmed,
**Then** an async export job is triggered; the club admin receives an email via Resend when the download link is ready; the link expires after 24 hours.

**Given** the generated export,
**Then** it contains no raw file binaries (images, videos, documents) — only metadata and R2/MinIO URLs; the JSON structure includes: `version`, `exportedAt`, `club`, `pages`, `elements`, `events`, `gallery_items`, `documents`, `contact_submissions`; the export operation is logged to `audit_log` with: `clubId`, `exportedAt`, `recordCount`.

---

### Story 8.5: Cookie Consent Mechanism

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

**Given** a club site with the Map sub-block enabled on the Contact page,
**When** a visitor who has not consented views the Contact page,
**Then** the static map image is blocked behind a click-to-load overlay: "Click to load map (requires cookies)" — clicking reveals the map and prompts for analytics consent.

**Given** consent state,
**Then** it is checked server-side before inserting `page_events` records — no analytics events are created for visitors who declined; consent persists across pages within a session and across sessions for 12 months.

**Given** the consent banner and preferences modal,
**Then** they meet WCAG 2.1 AA: fully keyboard-accessible, screen-reader compatible, minimum 44px touch targets on all interactive elements.
