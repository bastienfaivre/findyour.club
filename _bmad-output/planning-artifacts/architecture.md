---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-27'
project_name: 'website-template'
user_name: 'Clashware'
date: '2026-02-26'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

45 FRs across 6 capability areas:
- **Club Site Configuration & Navigation** (FR1–FR9): URL path provisioning per club (slug-based), page management (max 5, configurable), custom domain, anchor pages (Home, Contact non-removable), edit/public toggle
- **Content Editing & Element Library** (FR10–FR19): element picker, Calendar, Gallery, Documents library, Rich Text, inline image, explicit save, N-version history, inline constraint display
- **Public Discovery & Contact** (FR20–FR26): directory with activity type + region filter, public club site browsing, contact form with reply-to relay, mandatory "Powered by" footer
- **Application & Access** (FR27–FR30): Apply form, club admin auth via platform site, operator auth via dedicated admin interface, support form
- **Platform Operations** (FR31–FR39): application queue (approve/reject), automated URL provisioning + acceptance email, platform-wide metrics, site health monitoring, operator nudge, support inbox, configurable platform variables, silent template migration
- **Compliance & Data Rights** (FR40–FR45): club data export, club data deletion, cookie consent, automated SEO metadata, contact form submission storage, per-club analytics

The platform requires **three distinct authenticated roles**: Club Admin (per-club, content-only), Platform Operator (platform-wide, full access), and Public Visitor (unauthenticated).

**Non-Functional Requirements:**

Architecture-driving NFRs:
- **Performance:** FCP < 2s on club home pages; Core Web Vitals ≥ 90 on all public surfaces; loading skeleton visible within 100ms on SPA transitions; no regression post-migration; 12-month analytics retention
- **Security:** TLS 1.2+; TOTP 2FA (mandatory prompt until enabled); WebAuthn/FIDO2 passkeys; bcrypt or Argon2 for credential hashing; multi-tenant data isolation at storage layer; contact form submissions encrypted at rest; no sensitive data in client-side code or public API responses
- **Reliability:** 99.9% uptime; zero-downtime template migrations; email relay failure alert within 15 minutes; version history restore completes within 30 seconds
- **Scalability:** Architecture must support ~10 clubs (MVP) to thousands (EU scale) without re-architecture; horizontal scaling; per-club storage isolation
- **Accessibility:** WCAG 2.1 AA binding on all surfaces; best-effort AAA; full keyboard navigation; ARIA roles throughout
- **Maintainability:** Silent template migration (no club admin action); single token color update propagates platform-wide; all platform variables configurable via admin dashboard without deployment

**Scale & Complexity:**

- Primary domain: Full-stack web — frontend-heavy (SSR + SPA hybrid) with backend API and multi-tenant data layer
- Complexity level: Medium — simple domain (community associations), significant platform complexity (multi-tenancy, hybrid rendering, in-place editing, template versioning, passkey auth, GDPR, email relay)
- Estimated architectural components: ~10 major systems

### Technical Constraints & Dependencies

- **Framework:** Must natively support hybrid MPA/SPA rendering (SSR for SEO surfaces + SPA-style for interactive surfaces). PRD references Next.js, SvelteKit, Nuxt as examples.
- **Design system:** Tailwind CSS + Radix UI + shadcn/ui pattern — already decided in UX spec. OKLCH color tokens as CSS custom properties. System font stack (no external font dependency).
- **Hosting:** Swiss or EU infrastructure required (GDPR/nDSG compliance + association trust signal).
- **Auth standards:** TOTP (authenticator app), WebAuthn/FIDO2 (passkeys) — both required; bcrypt or Argon2 for password hashing.
- **Email:** External email relay service required (contact form relay + transactional emails for application acceptance/rejection). DPA required with provider.
- **URL architecture:** Single domain with country and club as path segments: `platform-name.com/{country}/{club-slug}`. No per-club DNS provisioning — routing is handled at the application layer. Club slugs are generated at provisioning time, URL-safe, **unique per country** (two clubs in different countries may share the same slug — e.g., `platform-name.com/ch/ski-club` and `platform-name.com/fr/ski-club` are both valid), and treated as immutable identifiers. The DB constraint is `@@unique([slug, country])` on the `Club` model.
- **Reserved path management:** The application routing layer must distinguish reserved root paths (directory root, /apply, /about, /support, /admin, /auth, /api, /my-clubs, etc.) from country path segments. Country codes (`ch`, `fr`, `de`, …) are reserved root paths that route to the country directory. Slug generation must exclude reserved path names; uniqueness is enforced per country.
- **Custom domains:** Club admins can configure a custom domain. The platform maps the custom domain to the club via lookup and serves identical content. TLS provisioning for custom domains must be automated.
- **Multi-tenancy:** Club data isolation at storage layer — one club's data cannot affect another's performance or be accessed across boundaries.
- **Billing:** Explicitly deferred to post-MVP. No payment infrastructure in scope.

### Cross-Cutting Concerns Identified

1. **Multi-tenant isolation** — affects every layer: data models, API access control, routing, storage, analytics. Every query and API response must be scoped to the correct club or operator context.
2. **Authentication & authorization** — three roles (Club Admin, Platform Operator, Public Visitor) with distinct entry points, session strategies, and capability boundaries. Auth state drives the in-place edit mode toggle.
3. **GDPR/nDSG compliance** — affects data models (retention, deletion, export), APIs (no PII in public responses), UX (cookie consent), and infrastructure (EU/CH hosting, DPAs).
4. **Template versioning pipeline** — separates platform-owned style from association-owned content. Affects content storage schema, rendering pipeline, migration tooling, and version history rollback.
5. **SEO automation** — affects all server-rendered surfaces (club home pages, platform directory, platform site pages). Meta tags, Open Graph, JSON-LD, and sitemap generation must be computed automatically from content data.
6. **WCAG 2.1 AA accessibility** — affects every UI component across all three surfaces. Shared component library must meet AA by default via Radix UI primitives.
7. **Email relay monitoring** — affects reliability architecture; delivery failures require operator alerting within 15 minutes.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web — frontend-heavy (SSR + SPA hybrid) with Next.js App Router, backend API, and multi-tenant PostgreSQL data layer.

### Technical Preferences Established

- **Language:** TypeScript (strict)
- **Database:** PostgreSQL with Prisma ORM v7
- **Deployment:** Self-hosted (Docker + Nginx reverse proxy + Certbot for TLS)
- **Auth library:** Auth.js (NextAuth v4) for core auth; `otplib` for TOTP; `@simplewebauthn/*` for passkeys
- **Dependency philosophy:** Minimal — prefer base libraries and Next.js native patterns over meta-frameworks
- **Type safety:** Zod schemas as the single source of truth at all client-server boundaries
- **Package manager:** pnpm

### Starter Options Considered

**`create-t3-app`:** Bundles Next.js + TypeScript + Tailwind + Prisma + Auth.js + tRPC. Rejected: tRPC introduces additional abstraction over Next.js-native patterns (Server Actions, RSC); violates minimal dependency philosophy.

**`create-next-app` (base):** Official Next.js 16 starter with TypeScript, Tailwind, App Router, and Turbopack. Selected: minimal, current, and leaves full control over architectural additions.

### Selected Starter: `create-next-app` (base)

**Rationale:** Minimal dependency philosophy. Next.js 16 App Router natively provides all required architectural primitives: Server Components for server-rendered data fetching, Server Actions for type-safe mutations, and Route Handlers for client-side data endpoints. Zod schemas shared between server and client replace tRPC as the type safety contract. No abstraction layer is needed over Next.js itself.

**Initialization Command:**

```bash
pnpm create next-app@latest website-template \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --turbopack \
  --import-alias "@/*"
```

**Dependencies added post-init:**

```bash
# ORM
pnpm add @prisma/client
pnpm add -D prisma

# Auth
pnpm add next-auth

# Validation & type safety
pnpm add zod

# Password hashing
pnpm add argon2

# TOTP (2FA)
pnpm add otplib

# Passkeys (WebAuthn)
pnpm add @simplewebauthn/server @simplewebauthn/browser

# shadcn/ui (owned components — not a runtime dependency)
pnpm dlx shadcn@latest init
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript strict mode; Node.js ≥ 20.9; ES modules throughout.

**Type Safety Strategy:**
Zod schemas defined once, used in three places: (1) Server Action input validation, (2) Route Handler request/response validation, (3) client-side form validation via `react-hook-form` + `@hookform/resolvers/zod`. No separate API client or type generation step required.

**Data Fetching Pattern:**
- **Server Components:** fetch directly from Prisma — zero HTTP overhead, fully typed, used for all SSR surfaces (club home page, directory, platform site pages)
- **Server Actions:** mutations from client components (save content, approve application, restore version) — TypeScript return types + Zod input validation at the boundary
- **Route Handlers** (`app/api/...`): JSON endpoints for SPA-style client data fetching (club inner pages, operator dashboard live data) — Zod validates request and response shapes

**Styling Solution:**
Tailwind CSS with PostCSS. shadcn/ui added via CLI (owned component copies in `src/components/ui/` — no runtime dependency). OKLCH color tokens as CSS custom properties in `globals.css`.

**Build Tooling:**
Next.js 16 with Turbopack (dev); `next build` for production. `output: 'standalone'` in `next.config.ts` produces a minimal Docker image for self-hosted deployment.

**Code Organization:**
```
src/
  app/                    # Next.js App Router
    (platform)/           # Route group: platform site (SSR)
    (country)/[country]/  # Route group: country path segment (ch, fr, de, …)
      [club]/             # Club site pages (SSR home + RSC inner pages)
    api/                  # Route Handlers (client-side data endpoints)
    admin/                # Platform operator dashboard
  components/
    ui/                   # shadcn/ui owned primitives
    app/                  # Product-specific custom components
  server/
    db.ts                 # Prisma client singleton
    auth.ts               # Auth.js configuration
  lib/
    schemas/              # Zod schemas (shared client/server)
    totp.ts               # TOTP helpers (otplib)
    webauthn.ts           # Passkey helpers (simplewebauthn)
  styles/
    globals.css           # Color tokens, base styles
prisma/
  schema.prisma
```

**Self-Hosting:**
`next.config.ts` sets `output: 'standalone'`. Nginx acts as the reverse proxy: single-domain routing and custom domain passthrough to the Next.js server. TLS is handled by Certbot (Let's Encrypt):
- Single certificate for `platform-name.com` via HTTP-01 challenge (no DNS provider API access required)
- Per-domain certificates for club custom domains, provisioned and renewed via Certbot HTTP-01 challenge

Docker Compose orchestrates Next.js + PostgreSQL + Nginx + Certbot.

**Note:** Project initialization using the above command is the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Multi-tenant isolation strategy (every query, every layer)
- Content storage schema (JSONB vs relational — shapes all editing features)
- Authentication flow (magic link + TOTP + passkeys layering)
- Database hosting path (Docker PG MVP → Infomaniak Managed DB)
- File storage provider (Cloudflare R2 — affects presigned URL architecture)

**Important Decisions (Shape Architecture):**
- Version history approach (snapshot model)
- Caching strategy (Next.js route cache + `revalidatePath`)
- Email provider and bot protection provider
- Frontend state management for edit mode
- Error response contract
- Analytics implementation

**Deferred Decisions (Post-MVP):**
- Redis for rate limiting (in-memory sufficient for MVP)
- Cloudflare proxy for maintenance failover (manual runbook sufficient for MVP)
- Uptime Kuma self-hosted monitoring (UptimeRobot free tier sufficient for MVP)
- Edit mode auto-save / localStorage draft recovery

---

### Data Architecture

**Multi-Tenant Isolation**
- Strategy: Application-level — `clubId` on every Prisma query; Prisma middleware enforces presence of `clubId` filter on all club-scoped models. `clubId` is derived from URL path params, verified by the `ClubMembership` check in the club layout.
- Version: Prisma ORM v7
- Rationale: PostgreSQL row-level security adds operational complexity without meaningful additional safety for a single-application multi-tenant platform; application-level isolation is standard for this scale
- Affects: all data models, all Server Actions, all Route Handlers

**Content Storage**
- Schema: `page_elements` table with columns: `id`, `page_id`, `club_id`, `position` (integer, determines render order), `type` (enum: `rich_text` | `image` | `gallery` | `calendar` | `documents`), `data` (JSONB, element-specific payload)
- Structured data exceptions: `events`, `gallery_items`, and `documents` get normalized relational tables to support efficient cross-club date queries and file management; referenced from `page_elements.data` by ID
- Rationale: JSONB per-element avoids a rigid schema for diverse element types; normalized tables for structured collections enable queries that JSONB cannot support efficiently

**Version History**
- Model: Full JSONB page snapshots stored in `content_versions` table: `id`, `page_id`, `club_id`, `snapshot` (JSONB — complete page_elements state at save time), `created_at`, `created_by`
- Retention: Last N versions per page (N configurable per platform variable via admin dashboard); oldest versions pruned on save
- Restore SLA: Must complete within 30 seconds (NFR)
- Rationale: Full snapshots enable one-query restore without reconstructing deltas; acceptable storage cost for community association content volumes

**Caching Strategy**
- Primary: Next.js route cache on SSR pages (club home page, directory); invalidated via `revalidatePath` on content save
- No Redis at MVP: Next.js native caching sufficient; Redis deferred until per-route cache granularity becomes a bottleneck
- Rationale: Zero additional infrastructure; `revalidatePath` provides on-demand ISR semantics natively

**File Storage**
- Provider: Cloudflare R2 (S3-compatible)
- Access pattern: Presigned URLs generated server-side via AWS SDK (`@aws-sdk/client-s3`); client uploads directly to R2; no file bytes transit the Next.js server
- Per-club limits: `storage_limit_bytes` and `storage_used_bytes` fields on the `clubs` table; enforced at Server Action level before accepting upload
- Rationale: Zero egress fees (critical for gallery-heavy club sites with moderate traffic); 10 GB free tier; S3 SDK compatibility means trivial future migration via env var change

**Database Hosting Path**
- MVP: PostgreSQL in Docker on the same Infomaniak VPS (Docker Compose service); simplest operational baseline
- Growth path: Migrate to Infomaniak Managed Database Service (PostgreSQL) via `pg_dump` / `pg_restore` + env var update; no application code changes required
- Off-site backups: `pg_dump` → AES-256 encrypt → upload to Cloudflare R2 (separate failure domain from Infomaniak VPS); automated via cron in Docker Compose
- Rationale: Start simple; Infomaniak Managed DB adds point-in-time recovery, automated backups, and replicas when the platform needs them; R2 for backup storage ensures provider diversity

---

### Authentication & Security

**Session Strategy**
- Type: Database sessions (Auth.js Prisma adapter stores sessions in PostgreSQL)
- Rationale: Server-authoritative; sessions revocable instantly (important for club admin offboarding); no JWT secret rotation complexity

**First Login Flow**
- Mechanism: One-time magic link emailed at provisioning time; TTL: 1 hour; link token is hashed before storage (SHA-256); single-use (token invalidated on first use)
- After link: Club admin sets password + is prompted to enroll TOTP (mandatory until enrolled per NFR)
- Rationale: No default password to leak; clean onboarding with no manual credential handoff

**Contact Form Encryption**
- Implementation: `lib/crypto.ts` — AES-256-GCM; encryption key stored in environment variable (never in DB or logs); IV generated per encryption operation and stored alongside ciphertext
- Scope: Contact form submission body encrypted at rest; metadata (timestamp, club_id, sender email) stored plaintext for operator inbox functionality
- Rationale: NFR requirement; satisfies nDSG/GDPR data minimisation at rest

**Security Surface Checklist**
- XSS: TipTap HTML output sanitized via `sanitize-html` before storage; rendered via React's `dangerouslySetInnerHTML` only after sanitization
- File upload: UUID-keyed R2 objects (no predictable URLs); MIME type validated server-side before presigned URL issuance; file extension allowlist enforced
- Open relay prevention: Contact form `reply-to` uses sender email; `from` is always the platform domain; Resend account-level domain verification
- Multi-tenant leakage: Prisma middleware enforces `clubId` scope; membership guard checks `ClubMembership` table before every club-scoped action; integration tests must cover cross-club data access attempts
- Magic link security: Token hashed in DB; TTL enforced; one-use; no token in server logs
- Open redirect prevention: All redirect targets validated against allowlist
- HTTP security headers: Configured in Nginx (`Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`)
- CSP: Next.js `headers()` config; strict CSP blocking inline scripts and unknown origins
- Admin route protection: Admin layout (Server Component) enforces `operator` role on all `/admin/*` routes — no middleware involved
- Dependency audit: `pnpm audit` run in GitHub Actions CI on every push

---

### API & Communication Patterns

**Email Service**
- Provider: Resend
- Rationale: EU-friendly (GDPR-compliant infrastructure); DPA available; developer-friendly API; reliable deliverability; free tier covers MVP volume
- Use cases: Magic link delivery, application approval/rejection notifications, contact form relay (reply-to pattern), support form delivery
- DPA: Required — must be signed before storing any email addresses

**Bot Protection**
- Provider: Cloudflare Turnstile
- Pricing: Free, unlimited challenges, no per-challenge cost
- Implementation: Custom zero-dependency React component + server-side token verification via `fetch` to Cloudflare's siteverify API (no SDK required)
- Surfaces: Contact form, Apply form, Support form, login forms
- Rationale: Free at any scale; privacy-preserving (no tracking cookies); GDPR-trivial; no external script fingerprinting beyond Cloudflare's challenge widget

**Rate Limiting**
- MVP: In-memory rate limiting (simple Map-based sliding window per IP, reset on server restart)
- Deferred: Redis-backed rate limiting (post-MVP, when horizontal scaling requires shared state)
- Rationale: MVP runs on a single Next.js instance; in-memory is sufficient; Redis adds operational complexity before it is needed

**Error Response Contract**
- Shape: `{ success: boolean, error?: string, code?: string }`
- Applies to: All Server Actions and Route Handler responses
- Rationale: Consistent contract enables typed error handling on the client; `code` field allows UI to handle specific error cases (e.g., `STORAGE_LIMIT_EXCEEDED`, `SLUG_TAKEN`) without string matching

---

### Frontend Architecture

**Edit Mode State**
- Mechanism: React Context (`EditModeContext`) wrapping the club site layout; URL param `?edit=true` as the source of truth (bookmarkable, shareable with Clashware support)
- Auth gate: No middleware guard on `?edit=true`; the club layout reads the param and ignores it (renders read-only) if the user has no active Club Admin session — simpler and avoids unnecessary redirect overhead
- Rationale: URL-driven state is transparent, debuggable, and survives page refreshes without localStorage complexity

**Unsaved Changes Protection**
- Mechanism: `beforeunload` browser event fires a warning when the React Context has `isDirty: true`
- No auto-save / localStorage draft: Aligns with explicit save philosophy (FR15 — explicit save action required); avoids conflict between draft state and published state
- Rationale: Simple, zero-dep, browser-native; matches user mental model of explicit save

**Rich Text Editor**
- Library: TipTap (core package, MIT license, free)
- Underlying engine: ProseMirror
- Extensions used: `StarterKit` (headings, bold, italic, lists, blockquote, code), `Link`, `Image` (inline image per FR17)
- Output: HTML string stored in `page_elements.data.html`; sanitized via `sanitize-html` before storage and before render
- Rationale: TipTap core is MIT/free; Pro tier (not used) adds advanced collaboration features; ProseMirror foundation ensures long-term stability

---

### Infrastructure & Deployment

**CI/CD Pipeline**
- Provider: GitHub Actions
- Pipeline stages: lint → type-check → `pnpm audit` → build → (future: test)
- Deployment: SSH + `docker compose pull && docker compose up -d` on Infomaniak VPS (triggered on push to `main`)
- Rationale: Zero additional cost; tight GitHub integration; straightforward for single-VPS deployment

**Analytics**
- Implementation: Custom `page_events` table — columns: `id`, `event_type` (enum: `page_view` | `contact_form_sent` | `apply_form_sent`), `club_id`, `page_slug`, `country`, `timestamp`, `referrer`, `ip_hash` (SHA-256 of IP + daily salt — not reversible, GDPR-safe)
- Retention: 12 months (NFR requirement); automated pruning via scheduled job
- No cookies required: Session-less, fingerprint-free; Turnstile is privacy-preserving; static map images used instead of Google Maps iframes (avoids iframe cookies)
- Cookie consent: **Not required** — only strictly necessary session cookie for authenticated users; no analytics cookies; no third-party tracking
- Rationale: GDPR-trivial; full operator control; no third-party data sharing; satisfies per-club analytics NFR

**Uptime Monitoring**
- MVP: UptimeRobot free tier (5-minute check interval, email alerts)
- Growth path: Self-hosted Uptime Kuma (when more granular alerting or status page needed)
- Rationale: Zero cost for MVP; sufficient for 99.9% uptime NFR monitoring

**Logging**
- Implementation: Native `console.log` / `console.error` with structured JSON payloads; Docker logging driver captures stdout/stderr and handles log rotation
- No external log aggregation at MVP: Logs accessible via `docker compose logs`
- Rationale: Zero dependencies; sufficient for single-VPS operations; structured JSON format enables future shipping to external aggregator without code changes

**Maintenance Strategy**
- Application restart (Next.js container restart): Nginx static maintenance page served during the restart window (~5–15 seconds). `maintenance.html` served from `/var/www/maintenance/`. Nginx `error_page 502 503` directive points to this file; toggled by Nginx config reload (`systemctl reload nginx` — graceful, zero Nginx downtime).
- VPS reboot (kernel updates, vertical scaling): Brief unavailability (~30–90 seconds) is unavoidable; all Docker Compose services configured with `restart: unless-stopped` to auto-start post-reboot. Runbook: schedule at low-traffic time (03:00 local), announce 24h in advance via platform status note.
- Future option: Route DNS through Cloudflare proxy (already a Cloudflare account for R2 and Turnstile) to serve a Cloudflare custom error page during VPS reboots — zero additional cost when needed.

---

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (`create-next-app` + post-init dependencies)
2. Docker Compose setup (Next.js + PostgreSQL + Nginx + Certbot)
3. Prisma schema (core models: `clubs`, `club_memberships`, `pages`, `page_elements`, `content_versions`, `users`, `sessions`, `page_events`)
4. Auth.js configuration (database sessions + magic link + TOTP + passkeys)
5. Multi-tenant Prisma middleware (clubId enforcement)
6. Nginx configuration (single-domain routing, custom domain passthrough, maintenance page)
7. Cloudflare R2 integration (presigned URLs, storage accounting)
8. Core Server Actions with Zod validation and `{ success, error, code }` contract
9. Resend email integration + Cloudflare Turnstile integration
10. Analytics `page_events` write path
11. Feature implementation (content editing, directory, operator dashboard)

**Cross-Component Dependencies:**
- Auth session → Edit mode state (Context reads auth session to determine edit capability)
- Multi-tenant middleware → All Server Actions and Route Handlers (must be established first)
- Prisma schema → Auth.js adapter (Auth.js Prisma adapter extends the schema)
- `page_elements` schema → TipTap integration (data shape must be agreed before editor wiring)
- R2 presigned URL flow → Gallery and Documents elements (upload architecture must be in place)
- `revalidatePath` → Content save Server Actions (caching invalidation coupled to save flow)
- `content_versions` snapshot → Restore Server Action (snapshot schema must be stable before restore UI is built)
- AES-256-GCM `lib/crypto.ts` → Contact form submission Server Action (encryption must exist before contact form stores data)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 8 areas where AI agents could make different choices — all resolved below.

---

### Naming Patterns

**Database Naming Conventions (Prisma ↔ PostgreSQL)**

Prisma models use PascalCase singular — TypeScript stays idiomatic. PostgreSQL tables use snake_case plural via `@@map` and `@map` directives — PostgreSQL stays idiomatic. Both layers get their native convention with zero ambiguity.

| Layer | Convention | Example |
|---|---|---|
| Prisma model | PascalCase singular | `Club`, `Page`, `PageElement`, `ContentVersion` |
| Prisma field | camelCase | `clubId`, `pageId`, `createdAt`, `storageUsedBytes` |
| PostgreSQL table | snake_case plural (via `@@map`) | `clubs`, `pages`, `page_elements`, `content_versions` |
| PostgreSQL column | snake_case (via `@map`) | `club_id`, `page_id`, `created_at`, `storage_used_bytes` |

Every model must declare `@@map`. Every field that diverges from Prisma's auto-mapping must declare `@map`.

```prisma
model PageElement {
  id        String      @id @default(cuid())
  pageId    String      @map("page_id")
  clubId    String      @map("club_id")
  position  Int
  type      ElementType
  data      Json

  @@map("page_elements")
}
```

**API Naming Conventions**

- Route Handler paths: kebab-case, plural resource nouns → `/api/clubs/[clubId]/pages/[pageId]/elements`
- Route parameters: `[clubId]`, `[pageId]`, `[elementId]` — camelCase with `Id` suffix
- Query parameters: camelCase → `?pageSlug=about&includeArchived=true`
- No trailing slashes; no verb in path (verbs belong in HTTP method)

**Code Naming Conventions**

| Artifact | Convention | Example |
|---|---|---|
| React component | PascalCase | `PageEditor`, `ClubCard`, `ElementPicker` |
| Component file | PascalCase `.tsx` | `PageEditor.tsx`, `ClubCard.tsx` |
| Non-component TS file | kebab-case `.ts` | `page-element.ts`, `content-version.ts` |
| Directory | kebab-case | `page-editor/`, `club-card/` |
| Server Action function | camelCase verb+noun | `savePageContent`, `approveApplication`, `restoreVersion` |
| Server Action file | `actions.ts` | co-located with route |
| Zod schema variable | camelCase + `Schema` | `pageElementSchema`, `clubCreateSchema` |
| TypeScript type (from Zod) | PascalCase | `PageElement`, `ClubCreate` (via `z.infer<>`) |
| Error code constant | SCREAMING_SNAKE_CASE | `STORAGE_LIMIT_EXCEEDED`, `CLUB_NOT_FOUND`, `SLUG_TAKEN` |
| Boolean variable | `is`/`has`/`can` prefix | `isLoading`, `isDirty`, `hasPermission`, `canEdit` |
| Async function | no `Async` suffix | `getClub`, `saveContent` — NOT `getClubAsync` |

---

### Structure Patterns

**Project Organization Rules**

```
src/
  app/
    (platform)/              # Platform site (SSR)
      page.tsx               # Directory home
      apply/
        page.tsx
        actions.ts           # ← Server Actions co-located here
    (country)/[country]/
      [club]/
        page.tsx             # Club home (SSR)
        actions.ts           # ← Club-scoped Server Actions
        [page]/
          page.tsx
          actions.ts
    api/
      clubs/[clubId]/
        pages/
          route.ts           # GET /api/clubs/[clubId]/pages
        storage/
          route.ts           # GET /api/clubs/[clubId]/storage
    admin/
      page.tsx
      actions.ts             # ← Operator-scoped Server Actions
  components/
    ui/                      # shadcn/ui owned copies — never manually modified
    app/                     # Product components — feature-specific
      page-editor/
        PageEditor.tsx
        PageEditor.test.tsx  # ← Test co-located with source
        ElementPicker.tsx
  server/
    db.ts                    # Prisma client singleton — one instance, exported
    auth.ts                  # Auth.js configuration — one instance, exported
  lib/
    schemas/                 # Zod schemas — one file per domain
      club.ts
      page.ts
      user.ts
      analytics.ts
    crypto.ts                # AES-256-GCM helpers
    totp.ts                  # otplib helpers
    webauthn.ts              # @simplewebauthn/* helpers
    rate-limit.ts            # In-memory rate limiter
  styles/
    globals.css              # OKLCH tokens + base styles only
```

**File Organization Rules**

- One Server Action file per route segment (`actions.ts`); never import Server Actions across route segments
- `src/server/db.ts` and `src/server/auth.ts` are the **only** places Prisma client and Auth.js are instantiated — all other files import from these
- Zod schema files export named schemas and their inferred types; no barrel re-exports that obscure the source domain
- `src/components/ui/` is append-only from `shadcn` CLI — agents must not manually edit files in this directory

---

### Format Patterns

**API Response Formats**

All Server Actions and Route Handlers return this union type:

```typescript
// Success
{ success: true; data: T }

// Error
{ success: false; error: string; code?: string }
```

- `data` is always nested under the `data` key — never spread at top level
- `error` is a human-readable string (may be shown to users)
- `code` is a machine-readable SCREAMING_SNAKE_CASE constant (used for client-side conditional logic)
- Route Handlers that return lists: `{ success: true; data: T[] }` — never wrapped in `{ items: T[] }`

```typescript
// Server Action typed return example
export async function savePageContent(
  input: unknown
): Promise<{ success: true; data: { version: number } } | { success: false; error: string; code?: string }> {
  const parsed = saveContentSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' }
  }
  // ...
}
```

**Date/Time Format**

- All dates serialized as ISO 8601 strings: `"2026-02-26T14:30:00.000Z"` (always UTC, always `.toISOString()`)
- Prisma `Date` objects must **never** be passed directly to Client Components — not serializable across the server/client boundary; always call `.toISOString()` before passing
- UI display formatting: use `Intl.DateTimeFormat` with the club's country locale — never hardcode locale formatting

**Data Format Rules**

- Booleans: `true`/`false` only — never `1`/`0` or `"true"`/`"false"`
- Empty collections: `[]` — never `null` for list fields
- Nullable fields: `null` — never `undefined` in JSON responses (`JSON.stringify` drops `undefined`)
- `id` fields: always strings (CUID) — never numbers

---

### Communication Patterns

**State Management Rules**

- React Context used for: `EditModeContext` (`isDirty`, `isEditMode`), `AuthContext` (session, role)
- Context updates: always via typed dispatch functions exported from the context module — never mutate context value directly
- URL state: directory filters (`?activity=ski&region=valais`) and edit mode (`?edit=true`) — managed via `useSearchParams` + `useRouter`; never mirror URL state into React state
- Form state: `react-hook-form` with `@hookform/resolvers/zod` — never uncontrolled inputs except shadcn primitives

**Loading State Patterns**

- Server Action calls: `useTransition` → `isPending` boolean — never create manual `isLoading` state for Server Actions
- Route Handler fetches (SPA surfaces): `useState<boolean>` named `isLoading` — initialized `false`, set `true` before fetch, `false` in `finally`
- Skeleton UI: shown when `isPending` or `isLoading` is `true` — never show empty states during loading
- Optimistic updates: only where explicitly specified in story acceptance criteria — never added speculatively

---

### Process Patterns

**Club Resolution Pattern (slug → clubId)**

A club is resolved from the URL **once per request** in the club layout. Both `slug` and `country` come from URL path params (`[country]` and `[club]` segments):

```typescript
// ✅ CORRECT — always resolve by (slug, country) composite key
const { country, club: slug } = await params
if (!isValidCountry(country)) notFound()
const club = await prisma.club.findUnique({
  where: { slug_country: { slug, country } },
  select: { id: true },
})
if (!club) notFound()
```

`country` is derived from the `[country]` URL path parameter and validated against `SUPPORTED_COUNTRIES` via `lib/country.ts` — **never from the Host header** (the host carries no country information in the path-based architecture). Never query a club by `slug` alone; two clubs in different countries may share the same slug.

**Multi-Tenant Query Pattern (CRITICAL)**

Every Prisma query on a club-scoped model must filter by **both** `id` and `clubId` in a single `where` clause:

```typescript
// ✅ CORRECT — atomic, secure
const page = await prisma.page.findFirst({
  where: { id: pageId, clubId },
})

// ❌ FORBIDDEN — vulnerable to TOCTOU, costs an extra round-trip
const page = await prisma.page.findFirst({ where: { id: pageId } })
if (page?.clubId !== clubId) throw new Error('Not found')
```

**Auth Check Pattern in Server Actions**

Every authenticated Server Action begins with the same three-step guard:

```typescript
export async function savePageContent(input: unknown) {
  // 1. Get session
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthenticated', code: 'UNAUTHENTICATED' }
  }
  // 2. Derive clubId from URL params — validated by the club layout membership check (never from client input)
  const { role } = session.user
  // 3. Check role capability
  if (role !== 'CLUB_ADMIN') {
    return { success: false, error: 'Forbidden', code: 'FORBIDDEN' }
  }
  // ... proceed with clubId from URL params (verified by layout)
}
```

The `clubId` used in all Prisma queries must come from the **URL params** (validated server-side by the club layout membership check), not from the session or from client-supplied input.

**Zod Validation Pattern**

```typescript
// Server Action — safeParse (never throw)
const parsed = saveContentSchema.safeParse(input)
if (!parsed.success) {
  return { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' }
}
const { elements } = parsed.data

// Route Handler — try/catch around parse
try {
  const body = querySchema.parse(await request.json())
} catch (e) {
  if (e instanceof ZodError) {
    return Response.json(
      { success: false, error: 'Invalid request', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }
  throw e
}
```

**Error Handling Pattern**

- Server Actions: return `{ success: false, error, code }` — never `throw` (unhandled throws become opaque 500 responses)
- Route Handlers: try/catch for expected errors; `throw` acceptable for unexpected errors (caught by Next.js)
- Client components: check `result.success` before accessing `result.data`; display `result.error` when `success === false`
- Logging: use `console.error` with structured JSON — `console.error({ event: 'save_content_failed', clubId, error: e.message })` — never log raw error objects or sensitive data

**Test File Convention**

- Location: co-located with source — `ComponentName.test.tsx`, `actions.test.ts`
- Framework: to be decided when testing story is prioritized (Vitest preferred for native ESM/TypeScript support)
- Naming: `describe('ComponentName')` → `it('should <expected behavior> when <condition>')`

---

### Enforcement Guidelines

**All AI Agents MUST:**

- Filter club-scoped Prisma queries with `where: { id, clubId }` — atomic double-filter, never sequential
- Return `{ success: true, data: T }` or `{ success: false, error: string, code?: string }` — no deviation
- Serialize all `Date` objects to `.toISOString()` before passing to Client Components
- Begin every authenticated Server Action with the three-step guard (session → role check → clubId from URL params verified by layout)
- Place Server Actions in `actions.ts` co-located with their route segment
- Name error codes in SCREAMING_SNAKE_CASE
- Instantiate Prisma only in `src/server/db.ts`; instantiate Auth.js only in `src/server/auth.ts`
- Never modify files in `src/components/ui/` — use `shadcn` CLI to add new components

**Anti-Patterns (Forbidden):**

```typescript
// ❌ Single-field query on club-scoped model
prisma.page.findFirst({ where: { id: pageId } })

// ❌ clubId sourced from session (removed — must come from URL params)
// session.user.clubId no longer exists

// ❌ clubId sourced from client input
const clubId = formData.get('clubId') as string

// ❌ Raw Date object passed to client
return { success: true, data: { createdAt: record.createdAt } }

// ❌ Throwing from a Server Action
throw new Error('Not found')

// ❌ Data spread at top level instead of under data key
return { success: true, page, version }

// ❌ camelCase error code
return { success: false, error: '...', code: 'storageLimitExceeded' }

// ❌ Multiple Prisma instantiations
const prisma = new PrismaClient() // in any file other than src/server/db.ts
```

## Project Structure & Boundaries

### Requirements-to-Structure Mapping

| FR Category | Surfaces | Primary Location |
|---|---|---|
| Club Site Configuration & Navigation (FR1–9) | Club site + Operator dashboard | `app/(country)/[country]/[club]/`, `app/admin/clubs/` |
| Content Editing & Element Library (FR10–19) | Club site (edit mode) | `app/(country)/[country]/[club]/[page]/`, `components/app/page-editor/` |
| Public Discovery & Contact (FR20–26) | Platform site | `app/(platform)/`, `components/app/directory/`, `components/app/contact/` |
| Application & Access (FR27–30) | Platform site + Auth | `app/(platform)/apply/`, `app/auth/`, `components/app/auth/` |
| Platform Operations (FR31–39) | Operator dashboard | `app/admin/`, `components/app/admin/` |
| Compliance & Data Rights (FR40–45) | Cross-cutting | `lib/seo.ts`, `lib/crypto.ts`, `app/admin/clubs/[clubId]/` |

---

### Complete Project Directory Structure

```
website-template/
├── .github/
│   └── workflows/
│       └── ci.yml                    # lint → typecheck → pnpm audit → build
├── nginx/
│   ├── nginx.conf                    # Single-domain + custom domain routing
│   ├── maintenance.html              # Static maintenance page (served on 502/503)
│   └── ssl/                          # Certbot-managed certs (gitignored)
├── prisma/
│   ├── schema.prisma                 # Single schema — all models with @@map/@map
│   ├── migrations/                   # Prisma migration history
│   └── seed.ts                       # Operator + sample club data for local dev
├── public/
│   └── images/
│       └── powered-by-clashware.svg  # Mandatory "Powered by" footer asset (FR26)
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout (minimal — delegates to route groups)
│   │   ├── not-found.tsx             # Global 404
│   │   ├── error.tsx                 # Global error boundary
│   │   │
│   │   ├── (platform)/               # Route group: platform site
│   │   │   ├── layout.tsx            # Platform site layout (nav, footer)
│   │   │   ├── page.tsx              # FR20–23: Directory home (SSR, filterable)
│   │   │   ├── apply/
│   │   │   │   ├── page.tsx          # FR28: Club application form
│   │   │   │   └── actions.ts        # submitApplication (+ Turnstile verify)
│   │   │   ├── about/
│   │   │   │   └── page.tsx          # Platform about page
│   │   │   └── support/
│   │   │       ├── page.tsx          # FR30: Support form
│   │   │       └── actions.ts        # submitSupportForm
│   │   │
│   │   ├── (country)/
│   │   │   └── [country]/            # Country segment: ch, fr, de, ...
│   │   │       └── [club]/           # FR1: Club slug path segment
│   │   │           ├── layout.tsx    # Club site layout (header, nav, footer, edit toolbar)
│   │   │           ├── page.tsx      # FR5/FR20: Club home page (SSR)
│   │   │           ├── actions.ts    # togglePublish (FR8), submitContactForm (FR24)
│   │   │           ├── contact/
│   │   │           │   └── page.tsx  # FR24: Contact page (anchor, non-removable)
│   │   │           └── [page]/       # FR3: Club inner pages (dynamic slug)
│   │   │               ├── page.tsx
│   │   │               └── actions.ts # savePageContent, addElement, removeElement,
│   │   │                              # reorderElements, restoreVersion (FR15–FR19)
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # FR29: Login page for both Club Admins and Operators — role-based redirect after auth
│   │   │   ├── setup/
│   │   │   │   └── page.tsx          # First login: set password + TOTP enroll
│   │   │   ├── totp/
│   │   │   │   └── page.tsx          # TOTP challenge page
│   │   │   └── magic-link/
│   │   │       └── page.tsx          # Magic link verification handler
│   │   │
│   │   ├── my-clubs/                 # Club admin dashboard — lists all clubs the user is a member of
│   │   │   └── page.tsx              # ClubMembership list with links to each club's URL
│   │   │
│   │   ├── admin/                    # FR31–39: Platform operator dashboard
│   │   │   ├── (protected)/
│   │   │   │   ├── layout.tsx        # Admin layout (OPERATOR role guard — layout-level, no middleware)
│   │   │   │   └── page.tsx          # FR35: Platform metrics dashboard
│   │   │   ├── applications/
│   │   │   │   ├── page.tsx          # FR31: Application queue
│   │   │   │   └── actions.ts        # approveApplication, rejectApplication
│   │   │   ├── clubs/
│   │   │   │   ├── page.tsx          # Club list + health overview (FR36)
│   │   │   │   └── [clubId]/
│   │   │   │       ├── page.tsx      # Club detail + settings
│   │   │   │       ├── actions.ts    # updateClubSettings, exportClubData (FR40),
│   │   │   │       │                 # deleteClubData (FR41), provisionClub (FR32),
│   │   │   │       │                 # sendNudge (FR37)
│   │   │   │       └── analytics/
│   │   │   │           └── page.tsx  # FR45: Per-club analytics view
│   │   │   ├── support/
│   │   │   │   ├── page.tsx          # FR38: Support inbox
│   │   │   │   └── actions.ts        # markResolved, replyToTicket
│   │   │   └── settings/
│   │   │       ├── page.tsx          # FR39: Platform variables config
│   │   │       └── actions.ts        # updatePlatformVariable
│   │   │
│   │   └── api/
│   │       ├── clubs/
│   │       │   └── [clubId]/
│   │       │       ├── pages/
│   │       │       │   └── route.ts  # GET — club pages list (edit mode SPA fetch)
│   │       │       ├── pages/[pageId]/elements/
│   │       │       │   └── route.ts  # GET — page elements (edit mode SPA fetch)
│   │       │       ├── storage/
│   │       │       │   └── route.ts  # GET — storage usage for club
│   │       │       ├── upload/
│   │       │       │   └── route.ts  # POST — generate R2 presigned URL
│   │       │       └── analytics/
│   │       │           └── route.ts  # GET — analytics data (operator, per-club)
│   │       └── events/
│   │           └── route.ts          # POST — analytics page_view tracking (fire-and-forget)
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui owned copies (CLI-managed, do not edit)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   └── app/                      # Product components
│   │       ├── page-editor/          # FR10–19: Content editing
│   │       │   ├── PageEditor.tsx    # Root edit mode orchestrator
│   │       │   ├── PageEditor.test.tsx
│   │       │   ├── ElementPicker.tsx # FR10: Element type picker
│   │       │   ├── ElementRenderer.tsx
│   │       │   ├── SortableElement.tsx
│   │       │   ├── SaveBar.tsx       # FR15: Explicit save + unsaved indicator
│   │       │   ├── VersionHistory.tsx # FR18: Version history panel
│   │       │   └── elements/
│   │       │       ├── RichTextElement.tsx   # FR16: TipTap editor
│   │       │       ├── GalleryElement.tsx    # FR13: Gallery grid + upload
│   │       │       ├── CalendarElement.tsx   # FR11: Event calendar
│   │       │       ├── DocumentsElement.tsx  # FR14: Documents library
│   │       │       └── ImageElement.tsx      # FR17: Inline image
│   │       │
│   │       ├── club-site/            # FR20–26: Public club site chrome
│   │       │   ├── ClubHeader.tsx
│   │       │   ├── ClubNav.tsx
│   │       │   ├── ClubFooter.tsx
│   │       │   ├── PoweredByBanner.tsx       # FR26: Mandatory footer
│   │       │   └── EditModeToolbar.tsx
│   │       │
│   │       ├── directory/            # FR20–23: Platform directory
│   │       │   ├── DirectoryPage.tsx
│   │       │   ├── ClubCard.tsx
│   │       │   └── DirectoryFilters.tsx      # FR21: Activity + region filters
│   │       │
│   │       ├── contact/              # FR24–25: Contact form
│   │       │   └── ContactForm.tsx   # With Turnstile + reply-to relay
│   │       │
│   │       ├── apply/                # FR27–28: Club application
│   │       │   └── ApplyForm.tsx     # With Turnstile
│   │       │
│   │       ├── auth/                 # FR27–30: Authentication UI
│   │       │   ├── LoginForm.tsx
│   │       │   ├── TotpForm.tsx
│   │       │   ├── PasskeyButton.tsx
│   │       │   ├── SetupPasswordForm.tsx
│   │       │   └── MagicLinkSent.tsx
│   │       │
│   │       ├── admin/                # FR31–39: Operator dashboard
│   │       │   ├── ApplicationQueue.tsx
│   │       │   ├── ClubList.tsx
│   │       │   ├── PlatformMetrics.tsx
│   │       │   ├── SupportInbox.tsx
│   │       │   ├── SettingsForm.tsx
│   │       │   └── ClubHealthBadge.tsx
│   │       │
│   │       ├── turnstile/
│   │       │   └── TurnstileWidget.tsx       # Zero-dep Cloudflare Turnstile component
│   │       │
│   │       └── seo/
│   │           └── metadata.ts       # FR44: generateClubMetadata, generateDirectoryMetadata
│   │
│   ├── server/
│   │   ├── db.ts                     # Prisma client singleton + middleware (clubId enforcement from URL params)
│   │   └── auth.ts                   # Auth.js configuration (providers, adapter, callbacks)
│   │
│   ├── lib/
│   │   ├── schemas/
│   │   │   ├── club.ts               # clubCreateSchema, clubUpdateSchema, provisionSchema
│   │   │   ├── page.ts               # pageElementSchema, saveContentSchema, elementTypeEnum
│   │   │   ├── user.ts               # loginSchema, setupPasswordSchema, totpVerifySchema, changePasswordSchema
│   │   │   ├── contact.ts            # contactFormSchema, applyFormSchema, supportFormSchema
│   │   │   └── analytics.ts          # pageEventSchema
│   │   │
│   │   ├── country.ts                # isValidCountry() — validates [country] URL param against SUPPORTED_COUNTRIES
│   │   ├── crypto.ts                 # AES-256-GCM encrypt/decrypt
│   │   ├── totp.ts                   # otplib: generateSecret, verifyToken
│   │   ├── webauthn.ts               # @simplewebauthn: registration + authentication helpers
│   │   ├── rate-limit.ts             # In-memory sliding window rate limiter
│   │   ├── slug.ts                   # Club slug generation + reserved path exclusion
│   │   ├── r2.ts                     # R2/MinIO client (@aws-sdk/client-s3) + presigned URL helpers
│   │   ├── email.ts                  # Resend/SMTP client + email sending helpers
│   │   └── turnstile.ts              # Cloudflare Turnstile server-side token verification
│   │
│   ├── proxy.ts                       # Minimal Next.js middleware stub (no route guards — auth handled at layout level)
│   │
│   └── styles/
│       └── globals.css               # OKLCH color tokens + base Tailwind directives
│
├── docker-compose.yml                # Shared base services (postgres)
├── docker-compose.dev.yml            # Dev overrides: MinIO + Mailpit
├── docker-compose.prod.yml           # Prod overrides: image tags, restart policies, nginx, certbot
├── Dockerfile                        # Multi-stage: deps → build → standalone runner
├── .env.example                      # All required env vars documented (no secrets)
├── .gitignore
├── next.config.ts                    # output: 'standalone', headers (CSP)
├── tailwind.config.ts
├── tsconfig.json                     # strict: true, paths: { "@/*": ["./src/*"] }
├── eslint.config.mjs
├── postcss.config.mjs
└── package.json
```

---

### Architectural Boundaries

**API Boundaries**

| Boundary | Entry Point | Auth | Scope |
|---|---|---|---|
| Club public site | `(country)/[country]/[club]/` | None | Read-only, SSR |
| Club edit mode | `(country)/[country]/[club]/[page]/actions.ts` | Club Admin session | Write, club-scoped |
| Platform site | `(platform)/` | None | Read-only, SSR |
| Application forms | `(platform)/apply/`, `(platform)/support/` | None + Turnstile | Write, rate-limited |
| Operator dashboard | `admin/` | Operator session (middleware-enforced) | Full platform access |
| Data API (SPA) | `api/clubs/[clubId]/` | Club Admin session | Read, club-scoped |
| Analytics ingest | `api/events/` | None | Write, rate-limited |

**Data Boundaries**

- Club data: every Prisma query scoped to `clubId` from session — no cross-club reads possible
- Operator data: accessible only via `admin/` routes with `operator` role verified in the admin layout guard
- Contact submissions: encrypted at write time in Server Action; decrypted on demand in operator inbox
- Analytics: `ip_hash` is irreversible (SHA-256 + daily salt); raw IP never persisted
- Media files: stored in R2/MinIO under `{clubId}/{uuid}.{ext}` — no predictable URL enumeration

**External Integration Points**

| Service | Integration File | Direction |
|---|---|---|
| Cloudflare R2 / MinIO (media) | `lib/r2.ts` | Server → R2 (presigned); Client → R2 (direct upload) |
| Resend / SMTP (email) | `lib/email.ts` | Server → provider |
| Cloudflare Turnstile | `lib/turnstile.ts` + `components/app/turnstile/` | Client ↔ CF; Server → CF siteverify |
| PostgreSQL | `server/db.ts` | Server only (Prisma) |
| Auth.js | `server/auth.ts` | Server only |

---

### Local Development Infrastructure

**No special subdomain routing required.** Country is a URL path segment, so local development uses plain `localhost:3000` with no `hosts` file edits or special DNS tricks. Country validation is handled via `lib/country.ts`:

```typescript
// lib/country.ts
const SUPPORTED_COUNTRIES = ['ch', 'fr', 'de'] as const
export type Country = typeof SUPPORTED_COUNTRIES[number]

export function isValidCountry(country: string): country is Country {
  return (SUPPORTED_COUNTRIES as readonly string[]).includes(country)
}
// params.country = 'ch'  → isValidCountry('ch')  → true  ✅
// params.country = 'xyz' → isValidCountry('xyz') → false → notFound() ✅
```

**Local dev URLs**

| Surface | URL |
|---|---|
| Platform directory | `http://localhost:3000` |
| Club site | `http://localhost:3000/ch/ski-club-valais` |
| Admin dashboard | `http://localhost:3000/admin` |
| MinIO console | `http://localhost:9001` |
| Mailpit inbox | `http://localhost:8025` |

**Service equivalents**

| Service | Production | Local (docker-compose.dev.yml) |
|---|---|---|
| Cloudflare R2 | R2 API | MinIO (`minio/minio`) on ports 9000/9001 |
| Resend | Resend API | Mailpit (`axllent/mailpit`) on ports 1025/8025 |
| Cloudflare Turnstile | Real challenge | Official test keys (always-pass, env var only) |

**`.env.example` (local dev values)**

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/website_template_dev"
AUTH_URL="http://localhost:3000"
AUTH_SECRET="dev_secret_change_in_production"
R2_ENDPOINT="http://localhost:9000"
R2_ACCESS_KEY_ID="minioadmin"
R2_SECRET_ACCESS_KEY="minioadmin"
R2_BUCKET_NAME="website-template"
R2_PUBLIC_URL="http://localhost:9000/website-template"
SMTP_HOST="localhost"
SMTP_PORT="1025"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
CONTACT_ENCRYPTION_KEY="dev_key_exactly_32_chars_padding!"
```

**`prisma/seed.ts` scope**

- Platform operator: `admin@platform-name.com` / `123456` (argon2-hashed at seed time)
- 2 sample clubs (`ski-club-valais`, `football-club-lausanne`) with all element types populated
- 3 versions per page (for version history testing)
- 3 applications (pending / approved / rejected)
- 5 encrypted contact form submissions (for operator inbox testing)
- 90 days of analytics events (for analytics view testing)

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

All technology choices are compatible and mutually reinforcing. Next.js 16 App Router + Prisma v7 + Auth.js v4 + Tailwind CSS + Radix UI/shadcn form a coherent, well-documented stack with no known version conflicts. Cloudflare R2 uses the standard AWS S3 SDK (`@aws-sdk/client-s3`), which is framework-agnostic. Auth.js v4 integrates natively with Next.js App Router via the `auth()` helper and Server Action support. TipTap (MIT, free) integrates via the `dynamic(() => import(...), { ssr: false })` pattern — no conflict with SSR. argon2 native bindings require `build-essential` + `python3` in the Dockerfile builder stage, documented in the implementation patterns.

**Pattern Consistency:**

Implementation patterns are self-consistent across all domains:
- Naming conventions (snake_case DB, camelCase API/code, PascalCase components) align consistently with Prisma's `@map()` decorator pattern and Next.js conventions
- Multi-tenant query guard (`clubId` always co-filtered in `findFirst`/`findMany`) is uniformly enforced at the Prisma middleware level in `server/db.ts`
- API response contract (`{ success: true; data: T }` / `{ success: false; error: string; code?: string }`) applies identically to Server Actions and Route Handlers
- Zod schemas centralized in `lib/schemas/` serve as single source of truth for both server-side parsing and react-hook-form integration

**Structure Alignment:**

The project structure directly reflects architectural decisions:
- Route group `(country)/[country]/[club]/` enforces the multi-tenant boundary at the Next.js routing level
- Route group `(platform)/` cleanly isolates platform-side pages
- `admin/` route group separated from country-tenant routes with middleware enforcement
- `server/` directory (db.ts, auth.ts) explicitly separates server-only singletons from shared lib utilities
- All 45 FRs map to specific directories/files — no "homeless" requirements

---

### Requirements Coverage Validation ✅

**Functional Requirements Coverage — 45/45 FRs:**

| FR Group | FRs | Architectural Support |
|---|---|---|
| Club Site Config & Navigation (FR1–FR9) | 9/9 | `(country)/[country]/[club]/` routes + Prisma `clubs` + `pages` tables + `proxy.ts` |
| Content Editing & Element Library (FR10–FR19) | 10/10 | `components/app/page-editor/` + `page_elements` JSONB + `page_versions` + Server Actions |
| Public Discovery & Contact (FR20–FR26) | 7/7 | `(platform)/` directory + `(country)/[country]/[club]/` public SSR + `ContactForm.tsx` + Resend relay |
| Application & Access (FR27–FR30) | 4/4 | `(platform)/apply/` + Auth.js (magic link, TOTP, passkeys, password) + `admin/` dashboard |
| Platform Operations (FR31–FR39) | 9/9 | `admin/` dashboard components + Server Actions + `api/health/route.ts` (FR35 alerting) |
| Compliance & Data Rights (FR40–FR45) | 6/6 | GDPR export/delete Server Actions + `lib/crypto.ts` + `page_events` GDPR-safe analytics |

**Non-Functional Requirements Coverage:**

| NFR | Architectural Support |
|---|---|
| 15-min email relay failure alerting | `api/health/route.ts` Route Handler + UptimeRobot 5-min polling |
| GDPR / Swiss nFADP compliance | `ip_hash` (SHA-256 + daily salt, irreversible), encrypted contact submissions (`lib/crypto.ts`), cookie consent |
| Zero-downtime template deployment | SSR architecture — code deployment inherently applies template changes; no data migration needed |
| Performance (SSR + SPA hybrid) | Server Components for initial load, client-only TipTap via `dynamic(..., { ssr: false })` |
| Security (auth, multi-tenant isolation) | argon2 password hashing, Auth.js session management, Prisma middleware clubId enforcement, Turnstile bot protection |

---

### Implementation Readiness Validation ✅

**Decision Completeness:**

All critical decisions are documented with exact versions:
- Next.js 16, Prisma v7, Auth.js v4, TipTap (latest MIT), Tailwind CSS v4, Radix UI (via shadcn), PostgreSQL 16, pnpm
- Technology choices include explicit rationale and alternative rejection reasons
- Reserved slug list defined: `lib/slug.ts → RESERVED_SLUGS` constant (21 entries)
- MVP boundary clearly drawn: custom domain TLS is operator-provisioned manually; post-MVP: automated sidecar

**Structure Completeness:**

- Complete directory tree defined with 100+ named files
- All 45 FRs mapped to specific files/directories in a requirements-to-structure table
- `api/health/route.ts` added to resolve the email relay alerting gap (gap #1)
- Component boundaries explicit: `components/ui/` (shadcn, do not edit) vs `components/app/` (product code)
- Integration points fully specified: R2 presigned URL flow, Turnstile siteverify, Auth.js adapter, Prisma middleware

**Pattern Completeness:**

- 8 conflict point categories fully resolved with concrete examples and anti-patterns
- Critical multi-tenant guard pattern documented with ✅ CORRECT / ❌ FORBIDDEN examples
- TipTap SSR pattern explicitly documented: `dynamic(() => import('./TipTapEditor'), { ssr: false })`
- argon2 Dockerfile constraint documented: `build-essential` + `python3` in builder stage
- Error handling: Zod safeParse on Server Actions, try/catch parse on Route Handlers, global error.tsx boundaries

---

### Gap Analysis Results

Six gaps identified during validation — all resolved:

**Gap 1 — Email relay failure alerting (was: Important gap)** → RESOLVED ✅
- NFR required: "15-minute alert on email relay failure"
- Solution: `/api/health` Route Handler pings Resend API; UptimeRobot polls every 5 min
- File added to project tree: `src/app/api/health/route.ts`
- Alerting SLA: failure detected within 5 min, notified within 5 min = 10 min worst-case (within 15 min SLA)

**Gap 2 — Silent template migration mechanism (was: Important gap)** → RESOLVED ✅
- NFR required: "silent template migration" (FR38)
- Solution: SSR architecture inherently resolves this — deploying updated Next.js code applies template changes to all clubs' rendered HTML with zero admin action and zero database migration
- Documented in validation only (no code change needed; architectural property)

**Gap 3 — Custom domain TLS provisioning (was: Important gap)** → RESOLVED ✅
- MVP decision: operator provisions TLS certificates manually via Certbot commands on VPS
- Post-MVP: sidecar poller monitors `pending_domain_certs` table and calls Certbot programmatically
- Acceptable for MVP given the low initial club volume and operator involvement in onboarding

**Gap 4 — Reserved slug enforcement (was: Nice-to-have → elevated to Important)** → RESOLVED ✅
- Risk: club slug could collide with platform routes (`/api`, `/auth`, `/admin`, etc.)
- Solution: `lib/slug.ts → RESERVED_SLUGS` constant enforced at application submission time via Zod schema
- 21 reserved slugs: `about`, `apply`, `support`, `admin`, `auth`, `api`, `health`, `login`, `logout`, `register`, `404`, `500`, `favicon.ico`, `robots.txt`, `sitemap.xml`, `_next`, `static`, `images`, `fonts`, `icons`, `manifest`
- Slug uniqueness is **per country**: `@@unique([slug, country])` on `Club`. The uniqueness DB check at provisioning time must be scoped to the target country: `prisma.club.count({ where: { slug: candidate, country } })`. Two clubs in different countries may share a slug.

**Gap 5 — TipTap SSR constraint (was: Critical gap)** → RESOLVED ✅
- Risk: TipTap DOM globals cause SSR crash in Next.js if imported at module level
- Solution: `dynamic(() => import('./TipTapEditor'), { ssr: false })` in every parent component
- Documented in implementation patterns as a mandatory anti-pattern prevention rule

**Gap 6 — argon2 native build dependencies (was: Important gap)** → RESOLVED ✅
- Risk: `npm install` in Docker fails for argon2 without C++ build tools
- Solution: Multi-stage Dockerfile — builder stage includes `build-essential` + `python3`; runner stage is clean
- Pattern: `RUN apt-get install -y build-essential python3` in builder stage only

---

### Validation Issues Addressed

No blocking issues found. All 6 gaps resolved collaboratively during validation. The architecture is coherent, complete, and implementation-ready without requiring any backtracking to earlier steps.

---

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed (45 FRs across 6 domains, 6 NFRs)
- [x] Scale and complexity assessed (MVP: single-VPS, 10s of clubs; post-MVP: managed DB, horizontal scale)
- [x] Technical constraints identified (argon2 native bindings, TipTap SSR, multi-tenant isolation)
- [x] Cross-cutting concerns mapped (GDPR, auth, rate limiting, encryption, analytics)

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions (Next.js 16, Prisma v7, Auth.js v4, PostgreSQL 16, pnpm)
- [x] Technology stack fully specified (all packages named with rationale)
- [x] Integration patterns defined (R2 presigned URL, Turnstile siteverify, Resend relay, Auth.js adapter)
- [x] Performance considerations addressed (SSR hybrid, TipTap dynamic import, JSONB for element data)
- [x] Deferred decisions documented (custom domain TLS post-MVP, managed DB post-MVP, CDN integration)

**✅ Implementation Patterns**

- [x] Naming conventions established (8 conflict categories fully resolved)
- [x] Structure patterns defined (co-located tests, feature-based component organization)
- [x] Communication patterns specified (Server Actions primary, Route Handlers for SPA, event analytics fire-and-forget)
- [x] Process patterns documented (multi-tenant guard, auth guard, Zod validation, error handling, loading states)
- [x] Anti-patterns explicitly listed (forbidden raw IP logging, forbidden cross-club queries, forbidden module-level TipTap import)

**✅ Project Structure**

- [x] Complete directory structure defined (100+ named files across all route groups and feature areas)
- [x] Component boundaries established (ui/ vs app/, server/ vs lib/)
- [x] Integration points mapped (5 external services with dedicated integration files)
- [x] Requirements to structure mapping complete (45/45 FRs mapped to specific files/directories)

---

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — all 45 FRs have explicit architectural support, all 6 gaps are resolved, no contradictions or missing integration points identified.

**Key Strengths:**

- **Multi-tenant safety by design**: Prisma middleware enforces `clubId` scoping at the database layer, making cross-club data leaks structurally impossible
- **SSR + SPA hybrid simplicity**: Next.js App Router handles the hard routing complexity; the edit-mode SPA is cleanly scoped to `?edit=true` with React Context
- **Local dev parity**: MinIO + Mailpit give exact production-equivalent behavior without cloud accounts; path-based routing works on plain `localhost:3000` with no hosts file hacks
- **GDPR by architecture**: Irreversible `ip_hash` analytics and AES-256-GCM encrypted contact submissions require no runtime decisions from developers
- **Minimal dependency philosophy**: pnpm + MIT-licensed stack eliminates licensing risk and reduces supply chain surface area
- **Silent template migration**: The SSR-first architecture makes FR38 a zero-cost property of every deployment

**Areas for Future Enhancement:**

- Custom domain TLS automation (post-MVP sidecar poller)
- Migrate from Docker-hosted PostgreSQL to Infomaniak Managed Database (post-MVP, when club count justifies)
- Cloudflare proxy layer (for DDoS protection and improved static asset caching)
- Monitoring dashboard (beyond UptimeRobot health check — structured logging with Axiom or similar)
- End-to-end test suite with Playwright (local dev + CI)

---

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented — versions, naming conventions, and patterns are non-negotiable
- Use the multi-tenant query guard pattern on every Prisma query (always co-filter `clubId` from session); verify club access via `ClubMembership` table — never rely on a `clubId` field on the `User` model
- Use the `{ success: boolean; data?: T; error?: string; code?: string }` contract for all Server Actions and Route Handlers
- Import TipTap only via `dynamic(() => import(...), { ssr: false })` — never at module level
- Respect the `server/` vs `lib/` boundary: `server/` files are server-only singletons; `lib/` files may be shared
- Run `pnpm` as the exclusive package manager — never `npm` or `yarn`
- All new shadcn/ui components go into `components/ui/` via the shadcn CLI; do not hand-author these files

**First Implementation Priority:**

```bash
pnpm create next-app@latest website-template \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Then: install dependencies → configure Prisma schema → configure Auth.js → scaffold route groups → implement seed data → wire local dev docker-compose.

**Reference this document** for all architectural questions — every decision has a rationale, every pattern has an example, and every gap has a documented resolution.

---

## ADR-001: Club Membership Model (Supersedes original User→Club design)

_Recorded: 2026-03-02_

### Context

The original design used a `User.clubId` foreign key, giving each user exactly one club affiliation. This assumed a single, permanent person per club. The real-world constraint is that club management passes between people over time, and multiple people may co-manage a club simultaneously. A person may also manage multiple clubs (as primary owner of some, as an invited editor in others).

### Decision

Replace the `User.clubId` FK with a `ClubMembership` junction table implementing a proper many-to-many relationship between `User` and `Club`.

**New models added to schema:**

```prisma
enum ClubMemberRole {
  OWNER   // full admin rights + can invite/remove editors + transfer ownership
  EDITOR  // content editing rights only
}

enum MembershipStatus {
  PENDING   // invited, not yet accepted
  ACTIVE
  REVOKED
}

model ClubMembership {
  id        String           @id @default(cuid())
  userId    String           @map("user_id")
  clubId    String           @map("club_id")
  role      ClubMemberRole
  status    MembershipStatus @default(ACTIVE)
  invitedBy String?          @map("invited_by") // null = operator-provisioned
  createdAt DateTime         @default(now()) @map("created_at")
  joinedAt  DateTime?        @map("joined_at")

  user    User  @relation("Memberships", ...)
  club    Club  @relation(...)
  inviter User? @relation("SentInvitations", ...)

  @@unique([userId, clubId])
}
```

**Removed from schema:** `User.clubId`, `User.club Club?` relation, `Club.admins User[]`.

### Role Semantics

| Capability | OWNER | EDITOR |
|---|:---:|:---:|
| Edit content (pages, elements, media) | ✓ | ✓ |
| Configure club settings (email, domain, slug) | ✓ | — |
| Invite / remove editors | ✓ | — |
| Transfer ownership | ✓ | — |
| Request club deletion | ✓ | — |

### Ownership Transfer

An OWNER may transfer ownership to any ACTIVE member of the club, or to a newly invited user. The transferring OWNER's role is downgraded to EDITOR (or their membership is revoked — their choice). The platform operator may also force-transfer via the admin panel (e.g., when a club loses contact with its previous manager).

### Invitation Flow

**Inviting an existing platform user** (already manages another club):
1. OWNER submits the invitee's email.
2. A `PENDING` `ClubMembership` is created.
3. An invitation email is sent with a one-time accept link (token stored hashed, TTL 48h).
4. On acceptance: `status → ACTIVE`, `joinedAt` set.

**Inviting a new user** (no existing account):
1. Same as above, but the accept link triggers credential setup (password + TOTP), identical to the operator provisioning magic link flow.
2. On completion: a new `User` is created + `ClubMembership` activated in the same transaction.

**Invitation token storage:** A lightweight `Invitation` model (or reuse `VerificationToken`) holds `{ email, clubId, role, tokenHash, expiresAt }`. Resolved and deleted on acceptance.

### Auth Session & Middleware

The Auth.js session no longer carries a `clubId`. Instead:

- Session carries: `{ userId, role: UserRole }` (platform-level role: `CLUB_ADMIN` | `OPERATOR`)
- On club selection (from personal dashboard or direct URL), the server resolves the active club context: `ClubMembership.findUnique({ where: { userId_clubId }, select: { role, status } })`
- The resolved `{ clubId, memberRole }` is stored in the session cookie for the duration of the club context
- Every club-scoped server action and route handler validates:
  1. The session's `clubId` matches the route's club slug
  2. The `ClubMembership` record is `ACTIVE`
  3. For OWNER-only actions: `memberRole === 'OWNER'`

**Performance:** `ClubMembership` has `@@unique([userId, clubId])` and `@@index([clubId])` — lookups are O(1). The resolved `{ clubId, memberRole }` in the session avoids a DB round-trip on every request; the session is invalidated on membership revocation.

### Personal Dashboard

When a `CLUB_ADMIN` user logs in:
- Query: `ClubMembership.findMany({ where: { userId, status: ACTIVE }, include: { club: true } })`
- If **one club**: redirect directly to club editor (skip dashboard)
- If **multiple clubs**: show personal dashboard listing all clubs with their role badge (Owner / Editor)

The dashboard is served at the platform domain (e.g., `ch.platform.com/dashboard`), not under a club slug.

### Impact on Implemented Stories

The following already-implemented stories require rework due to this model change:

| Story | Impact | Required Change |
|---|---|---|
| **1.2** (Club provisioning) | `User` created with `clubId` | Replace `clubId` assignment with `ClubMembership` creation (`role: OWNER`, `status: ACTIVE`, `invitedBy: null`) |
| **1.3** (Magic link + TOTP setup) | Session/token uses `clubId` on User | Auth callback and session callback must resolve club context from `ClubMembership` instead of `user.clubId` |
| `src/server/auth.ts` | `session.user.clubId` populated from `user.clubId` | Query `ClubMembership` to resolve club context; populate `session.user.clubId` + `session.user.clubRole` |
| `src/lib/schemas/user.ts` | May reference `clubId` field | Audit and update any Zod schemas referencing the removed field |
| Prisma migration | `User.clubId` column exists in DB | New migration: drop `user.club_id` column, create `club_memberships` table |

### Consequences

**Positive:**
- TOTP and passkeys work correctly — each user has personal credentials on their own device; no sharing required on handover
- Meaningful audit trail — `ContentVersion.createdBy` unambiguously identifies which person made each change
- Ownership transfer is clean — revoke old membership, promote or invite new owner; no credential sharing
- Scales naturally — same model supports 1 or 10 co-managers per club without schema change

**Negative / Accepted trade-offs:**
- Auth middleware is slightly more complex — one additional DB lookup per club-context resolution (mitigated by session caching)
- Stories 1.2 and 1.3 require rework — accepted cost of catching this before deeper implementation
- Invitation flow is a new feature surface not covered by existing stories — must be added to backlog
