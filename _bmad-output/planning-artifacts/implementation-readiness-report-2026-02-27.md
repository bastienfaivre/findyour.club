---
stepsCompleted: ["step-01-document-discovery", "step-02-prd-analysis", "step-03-epic-coverage-validation", "step-04-ux-alignment", "step-05-epic-quality-review", "step-06-final-assessment"]
documentsSelected:
  prd: "_bmad-output/planning-artifacts/prd.md"
  architecture: "_bmad-output/planning-artifacts/architecture.md"
  epics: "_bmad-output/planning-artifacts/epics.md"
  ux: "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# Implementation Readiness Assessment Report

**Date:** 2026-02-27
**Project:** website-template

---

## PRD Analysis

### Functional Requirements

FR1: Club Admin can configure their site's core identity elements (name, logo, welcome text)
FR2: Club Admin can toggle between public view and edit mode directly on their club website
FR3: Club Admin can activate and deactivate optional pages in their site's navigation
FR4: Club Admin can create custom pages with user-defined navigation labels
FR5: Club Admin can configure one level of sub-pages within their site's navigation
FR6: System prevents Club Admin from removing anchor pages (Home and Contact)
FR7: System enforces a configurable maximum page count per club site
FR8: Club Admin can set up and manage a custom domain for their site
FR9: System provisions a subdomain for each approved club immediately upon acceptance
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
FR20: Public Visitor can browse a directory of all member associations on the platform site
FR21: Public Visitor can filter the directory by activity type and geographic region
FR22: Public Visitor can view any club's public website without authentication
FR23: Public Visitor can submit a contact message through a club's contact form
FR24: System delivers contact form submissions to the club's registered email address with reply-to set to the sender's address
FR25: Public Visitor can navigate from any club site to the platform directory via the footer attribution link
FR26: System displays a mandatory, non-removable platform attribution link in the footer of every club site
FR27: Club Applicant can submit an application to join the platform providing association name, activity type, and description
FR28: Club Admin can authenticate and access their site's edit mode via the platform site login
FR29: Platform Operator can authenticate via a dedicated platform-level admin interface separate from club sites
FR30: Club Admin can submit a support request to the platform team from the platform site
FR31: Platform Operator can view and manage a queue of pending club applications
FR32: Platform Operator can approve an application, triggering automatic subdomain provisioning and an acceptance email to the applicant
FR33: Platform Operator can reject an application with an explanatory email to the applicant
FR34: Platform Operator can view platform-wide metrics (clubs live, custom domains, uptime, performance scores, storage)
FR35: Platform Operator can monitor site health status across all hosted club sites
FR36: Platform Operator can send a notification to a club admin regarding a detected site issue
FR37: Platform Operator can view and respond to club admin support requests
FR38: Platform Operator can configure platform-wide operational variables including the per-club page limit
FR39: System applies template version updates to all club sites automatically without downtime or any action required from club admins
FR40: Club Admin can export all their club's content data in a portable standard format
FR41: Club Admin can request deletion of their club's data from the platform
FR42: System presents a cookie consent mechanism to users on the platform site and on club sites where applicable
FR43: System automatically generates and maintains SEO metadata for all club site pages without requiring any admin configuration
FR44: Club Admin can view stored contact form submissions received for their site
FR45: Platform Operator can view detailed per-club analytics (traffic, page views, edit events, login events, contact form submission counts)

**Total FRs: 45**

### Non-Functional Requirements

**Performance:**
NFR1: Club site home pages achieve Time to First Contentful Paint < 2 seconds on a standard broadband connection
NFR2: SPA-style inner page transitions load content within 2 seconds of navigation (loading skeleton displayed within 100ms)
NFR3: All public-facing pages score ≥ 90 on Core Web Vitals (Lighthouse performance, SEO, accessibility)
NFR4: No performance regression on any club site following a silent template migration
NFR5: Platform admin dashboard collects analytics per club site retained for a minimum of 12 months

**Security:**
NFR6: All data encrypted at rest and in transit (TLS 1.2+ enforced on all connections)
NFR7: Contact form submissions stored on platform servers, accessible to Club Admin, encrypted at rest
NFR8: Admin authentication supports TOTP-based 2FA; mandatory prompt on first login and every subsequent login until enabled
NFR9: Passkey (WebAuthn / FIDO2) support available as an authentication method
NFR10: Password strength enforced at account creation and password change (length, complexity, breached password rejection)
NFR11: Admin credentials hashed using bcrypt or Argon2
NFR12: No sensitive club or admin data exposed in client-side code or public API responses
NFR13: Multi-tenant isolation: one club's data and operations cannot be accessed or affected by another club

**Reliability:**
NFR14: Platform uptime ≥ 99.9% measured monthly across all hosted club sites and the platform site
NFR15: Template migrations complete with zero downtime
NFR16: Email relay delivery monitored; failures trigger an operator alert within 15 minutes of failure detection
NFR17: Version history restore completes within 30 seconds of a Club Admin initiating a rollback

**Scalability:**
NFR18: Architecture supports growth from ~10 clubs to thousands without re-architecture
NFR19: Hosting infrastructure is horizontally scalable — capacity added without service interruption
NFR20: Multi-tenant data model isolates clubs at the storage layer — one club's growth does not degrade another's performance

**Accessibility:**
NFR21: WCAG 2.1 AA compliance on all public-facing surfaces and the admin/edit interface
NFR22: Best-effort WCAG AAA where practically achievable
NFR23: All interactive elements operable via keyboard alone
NFR24: All dynamic content compatible with screen readers (ARIA roles and labels on all interactive components)

**Maintainability:**
NFR25: Template versioning system supports silent migration of all club sites without manual intervention
NFR26: Platform color scheme updatable via a single token variable change
NFR27: All platform-wide configurable variables adjustable via the admin dashboard without a code deployment

**Total NFRs: 27**

### Additional Requirements

- **Browser Matrix:** Chrome, Firefox, Safari, Edge (last 2 major versions); Internet Explorer explicitly not supported
- **GDPR / Swiss nDSG dual compliance** required at launch
- **Data subject rights:** access, deletion, and portability (export) implemented
- **DPAs** required with all sub-processors before they handle platform data
- **Hosting:** Swiss or EU infrastructure strongly preferred
- **Eligibility verification:** self-declaration only (no legal registration check)
- **Billing:** deferred to post-MVP; early adopters onboarded without charge
- **Page limit:** 5 pages maximum per club in v1, enforced in code, configurable from admin dashboard without deployment
- **Build order:** Database schema first (prerequisite), then Club webapp and Platform site built in parallel
- **Hybrid MPA/SPA rendering:** club home + platform site server-rendered; inner pages + edit mode + admin dashboard SPA-style
- **Image alt text** in edit mode: enforced field, not optional

### PRD Completeness Assessment

The PRD is thorough and well-structured. Requirements are explicitly numbered (FR1–FR45, NFR1–NFR27), making traceability straightforward. All four core user journeys (Club Admin, Public Visitor, Club Applicant, Platform Operator) are fully described. Phased development is clearly defined with MVP vs. post-MVP boundaries. The document is suitable as a complete basis for epic coverage validation.

---

## Epic Coverage Validation

### Coverage Matrix

| FR | PRD Requirement (summary) | Epic (coverage map) | Story | Status |
|---|---|---|---|---|
| FR1 | Club Admin configures name, logo, welcome text | Epic 4 | Story 4.2 | ✅ Covered |
| FR2 | Toggle edit/public mode on club website | Epic 4 | Story 4.1 | ✅ Covered |
| FR3 | Activate/deactivate optional pages | Epic 4 | Story 4.3 | ✅ Covered |
| FR4 | Create custom pages with nav labels | Epic 4 | Story 4.3 | ✅ Covered |
| FR5 | Configure one level of sub-pages | Epic 4 | Story 4.4 | ✅ Covered |
| FR6 | System prevents removal of anchor pages (Home, Contact) | Epic 4 | Story 4.3 | ✅ Covered |
| FR7 | Enforce configurable max page count | Epic 4 | Story 4.3 | ✅ Covered |
| FR8 | Club Admin sets up and manages custom domain | Epic 8 | Story 8.1 | ✅ Covered |
| FR9 | System provisions subdomain on acceptance | Epic 2 | Story 2.3 | ✅ Covered |
| FR10 | Visual element picker on custom pages | Epic 5 | Story 5.1 | ✅ Covered |
| FR11 | Contact page sub-blocks (form, map, phone, email, subjects) | Epic 5 | Story 5.6 | ✅ Covered |
| FR12 | Calendar event management | Epic 5 | Story 5.3 | ✅ Covered |
| FR13 | Gallery image/video management | Epic 5 | Story 5.4 | ✅ Covered |
| FR14 | Documents library management | Epic 5 | Story 5.5 | ✅ Covered |
| FR15 | Rich text content editing | Epic 5 | Story 5.2 | ✅ Covered |
| FR16 | Inline image editing | Epic 5 | Story 5.2 | ✅ Covered |
| FR17 | Explicit save | Epic 4 | Story 4.5 | ✅ Covered |
| FR18 | Version history & restore | Epic 4 | Story 4.6 | ✅ Covered |
| FR19 | Inline file constraint display | Epic 5 | Stories 5.2, 5.4, 5.5 | ✅ Covered |
| FR20 | Public directory browsing | Epic 3 | Story 3.2 | ✅ Covered |
| FR21 | Directory filtering by activity type and region | Epic 3 | Story 3.2 | ✅ Covered |
| FR22 | View club public site without auth | Epic 3 | Story 3.3 | ✅ Covered |
| FR23 | Public contact form submission | Epic 6 | Story 6.1 | ✅ Covered |
| FR24 | Email relay with reply-to | Epic 6 | Story 6.1 | ✅ Covered |
| FR25 | Footer link to platform directory | Epic 3 | Story 3.5 | ✅ Covered |
| FR26 | Mandatory non-removable footer attribution | Epic 3 | Story 3.5 | ✅ Covered |
| FR27 | Club application form | Epic 2 | Story 2.1 | ✅ Covered |
| FR28 | Club Admin authentication | Epic 1 | Stories 1.3, 1.5 | ✅ Covered |
| FR29 | Platform Operator authentication (dedicated interface) | Epic 1 | Story 1.4 | ✅ Covered |
| FR30 | Club Admin submits support request | Epic 6 | Story 6.4 | ✅ Covered |
| FR31 | Operator views/manages application queue | Epic 2 | Story 2.2 | ✅ Covered |
| FR32 | Operator approves application + provisioning | Epic 2 | Story 2.3 | ✅ Covered |
| FR33 | Operator rejects application with email | Epic 2 | Story 2.4 | ✅ Covered |
| FR34 | Operator views platform-wide metrics (aggregate) | Epic 7 | Story 7.1 (partial — per-club list only, no aggregate dashboard) | ⚠️ Partial |
| FR35 | Operator monitors site health across all clubs | Epic 7 | Story 7.4 (misplaced reference — settings page, not health monitoring) | ❌ Missing story |
| FR36 | Operator sends notification/nudge to club admin | Epic 7 | Story 7.2 (misplaced reference — metrics display, not nudge) | ❌ Missing story |
| FR37 | Operator views and responds to support requests | Epic 7 | Story 7.2 (misplaced reference — limits enforcement, not support inbox) | ❌ Missing story |
| FR38 | Operator configures platform-wide variables | Epic 7 | Story 7.4 (implements it but doesn't reference FR38) | ✅ Covered (ref error) |
| FR39 | System auto-applies template updates without downtime | Epic 7 | Story 7.4 (misplaced reference — settings panel, not migration mechanism) | ❌ Missing story |
| FR40 | Club Admin exports club data in portable format | Epic 8 | Story 8.2 (references FR40 in deletion context — wrong) | ❌ Missing story |
| FR41 | Club Admin requests data deletion | Epic 8 | Story 8.2 | ✅ Covered |
| FR42 | Cookie consent mechanism | Epic 8 | Story 8.3 (references FR42 for cleanup job — wrong context) | ❌ Missing story |
| FR43 | Automated SEO metadata generation | Epic 3 | Stories 3.3, 3.5 | ✅ Covered |
| FR44 | Club Admin views stored contact submissions | Epic 6 | Story 6.3 | ✅ Covered |
| FR45 | Operator views per-club analytics | Epic 7 | Stories 7.3, 7.5 | ✅ Covered |

### Missing Requirements

#### ❌ Critical Missing Stories

**FR35: Platform Operator monitors site health status across all hosted club sites**
- Impact: The PRD user journey explicitly describes the operator checking Lighthouse scores ≥ 90 and uptime % for all sites. No story implements a health monitoring view (beyond email relay in Story 6.2).
- Recommendation: New story in Epic 7 — "Operator Dashboard — Site Health Status" covering Lighthouse score tracking, uptime indicators, and per-club health status panel.

**FR36: Platform Operator sends a notification/nudge to a club admin regarding a detected site issue**
- Impact: Core operational workflow described in PRD Journey 4 (operator sends a nudge about a broken gallery image). Referenced in Story 7.2 with an incorrect/misplaced AC.
- Recommendation: New story in Epic 7 — "Operator Nudge — Club Admin Notification" covering the nudge sending interface and the email delivery to the Club Admin.

**FR37: Platform Operator views and responds to club admin support requests**
- Impact: Story 6.4 covers Club Admin submitting a ticket and operator receiving a notification email. But no story covers the operator's admin interface for viewing, managing, and responding to the support inbox. Referenced in Story 7.2 with an incorrect AC.
- Recommendation: New story in Epic 7 — "Operator Support Inbox" covering the `/admin/support` page: ticket list, status management (open/closed), and reply flow.

**FR39: System applies template version updates automatically without downtime**
- Impact: Silent template migration is a core platform promise. No story implements the migration mechanism — what happens when a new template version is deployed, how club content is preserved, and how zero-downtime is achieved.
- Recommendation: New story in Epic 7 (or Epic 1) — "Template Versioning & Silent Migration" covering: template version tracking, migration process, rollback safety, zero-downtime deployment, and content preservation validation.

**FR40: Club Admin can export all their club's content data in a portable standard format**
- Impact: GDPR data portability right. The PRD states this is a core product value ("export right already in scope"). No story implements the export UI or the export generation mechanism. Story 8.2 incorrectly references FR40 for deletion.
- Recommendation: New story in Epic 8 — "Club Admin — Data Export (GDPR Portability)" covering: export trigger, JSON/CSV generation of all club data (pages, elements, events, gallery items, documents metadata, contact submissions), and download delivery.

**FR42: Cookie consent mechanism**
- Impact: Required for GDPR compliance at launch. No story implements the consent UI. Story 8.3 references FR42 only in the context of automated data cleanup, which is unrelated.
- Recommendation: New story in Epic 8 (or Epic 3) — "Cookie Consent Mechanism" covering: consent banner on platform site, consent handling on club sites for applicable third-party embeds, consent state persistence.

#### ⚠️ Partial Coverage Issues

**FR34: Operator views platform-wide aggregate metrics**
- Story 7.1 provides a per-club list. The PRD describes a metrics panel with aggregate totals: "24 clubs now live, 19 have set up custom domains, uptime: 100% for the last 30 days, all club sites returning Lighthouse scores ≥ 90." No story implements this aggregate dashboard view.
- Recommendation: Story 7.1 should be extended or a new AC added to cover the aggregate metrics summary panel.

#### ⚠️ Incorrect FR References in Stories (Cosmetic — Not Blocking)

The following FR references in story ACs are misplaced and should be corrected for traceability:
- Story 7.2: AC "metrics displayed" references FR36 (should reference FR34/FR35)
- Story 7.2: AC "limit enforcement" references FR37 (should reference FR7/FR38)
- Story 7.4: AC "settings page displayed" references FR35 (should reference FR38)
- Story 8.2: AC "deletion list shown" references FR40 (should reference FR41; FR40 has no story)
- Story 8.3: AC "cleanup job runs" references FR41 and FR42 (FR41 is club data deletion — not analytics; FR42 is cookie consent — not cleanup)

### Coverage Statistics

- **Total PRD FRs:** 45
- **FRs with dedicated story implementation:** 37
- **FRs with partial coverage only:** 1 (FR34)
- **FRs with no story implementation:** 6 (FR35, FR36, FR37, FR39, FR40, FR42)
- **FRs with incorrect story references (no implementation gap):** 1 (FR38 — implemented but not referenced)
- **Coverage percentage (complete):** 82% (37/45)
- **Coverage percentage (including partial):** 84% (38/45)

---

## UX Alignment Assessment

### UX Document Status

**Found:** `_bmad-output/planning-artifacts/ux-design-specification.md` (64 KB, 2026-02-26) — complete 14-step workflow output covering: executive summary, user personas, emotional journey, design system, component library, journey flows, consistency patterns, responsive strategy, and accessibility implementation guidelines.

---

### UX ↔ PRD Alignment

**✅ Well-aligned areas:**
- All four user personas in the UX spec (Club Admin, Public Visitor, Club Applicant, Platform Operator) match PRD user journeys exactly
- All four user journey flows (Journey 1, 1b, 2, 3, 4) precisely map to the PRD journey narratives including edge cases
- Philosophy and value proposition framing is consistent across both documents
- Edit mode mechanics (explicit save, N-version history, amber indicator, inline constraints) match FR17, FR18, FR19 exactly
- Contact form with reply-to routing matches FR23/FR24
- "Powered by" footer as acquisition loop matches FR25/FR26
- Defensive UX patterns (confirmation dialogs for destructive actions) correctly align with PRD's "no irreversible actions by accident" requirement

**⚠️ Misalignment: AccentColorPicker — MVP vs Post-MVP scope**
- **PRD (Phase 2 — Post-MVP):** "Per-club color theme picker"
- **UX Spec (Phase 1 — MVP Critical):** `AccentColorPicker` listed in the Phase 1 MVP Critical component list under "Club admin — identity setup (Admin sidebar tab)"
- **Epics:** No story implements the AccentColorPicker
- **Verdict:** The UX designer promoted the accent picker to MVP scope without a corresponding PRD scope change. The epics correctly follow the PRD (no picker story). If MVP includes the picker, a new story is needed; if not, the UX spec's Phase 1 classification needs correction.
- **Required action:** Decide: is per-club accent color picking MVP or Post-MVP? Align UX Phase 1 component list and epics accordingly.

**⚠️ UX designs for FR40 and FR37 entry points — no story implementations**
- The UX spec explicitly designs the **"Export" entry point** in the Admin sidebar tab (Admin tab contains: "Accent picker, Version History, Account, Custom Domain, **Export**"). This is the UX home for FR40 (club data export). No story implements this.
- The UX Journey 4 operator flow explicitly shows **"Check support queue" → "Read ticket" → "Reply directly"** — this is the UX design for FR37 (operator support inbox). No story implements this.
- These reinforce the critical missing stories identified in Step 3.

---

### UX ↔ Architecture Alignment

**✅ Well-aligned areas:**
- Design system: UX specifies Tailwind CSS + Radix UI (shadcn/ui pattern) — architecture confirms same choice
- Color system: UX specifies OKLCH color tokens as CSS custom properties — architecture confirms OKLCH token architecture
- URL architecture: UX refers to country subdomains (e.g., `ch.platform-name.com`) — architecture confirms `ch.platform-name.com/{club-slug}` routing via `lib/country.ts`
- Edit mode mechanism: UX specifies `?edit=true` URL param as source of truth; `EditModeContext` — architecture confirms URL param `?edit=true` as source of truth for edit mode
- Rich text: UX implies in-place rich text editing — architecture specifies TipTap (MIT) loaded via `dynamic(..., { ssr: false })`
- File upload: UX specifies presigned URL upload, no bytes through server — architecture confirms Cloudflare R2 with presigned URLs
- Auth flow: UX Journey 1 shows "Click login link → club site loads in Edit Mode" — architecture specifies magic link flow (1-hour TTL, hashed, single-use) matching Story 1.3 exactly
- Skeleton loading within 100ms — both UX and architecture specify this threshold
- Accessibility: UX specifies WCAG 2.1 AA binding + axe-core + Pa11y + Lighthouse ≥ 90 in CI — architecture confirms axe-core + Pa11y + Lighthouse ≥ 90 gated in CI

**✅ No architectural blockers for UX requirements found**

All UX performance requirements (TTFCP < 2s, SPA transitions < 2s, skeleton < 100ms) are addressed in the architecture via hybrid MPA/SPA rendering, server-side rendering for club home pages, and loading skeleton requirements in stories.

### Warnings

1. **AccentColorPicker phase conflict** — UX lists as MVP Phase 1 Critical; PRD defers to Post-MVP. Epics contain no story. Resolution required before sprint planning begins.

2. **FR40 (Export) and FR37 (Support Inbox) have UX design but no stories** — The UX has designed the UI entry points and flows for both features. Development will be blocked waiting for story definition when teams try to implement what the UX shows.

3. **Cookie consent UI (FR42) has no UX design and no story** — Neither the UX spec nor the epics address the cookie consent banner/mechanism design or implementation. This is a GDPR launch requirement.

4. **FR36 nudge mechanism has UX flow but no story** — The UX operator journey shows "Send nudge to club admin" as a clear step after site health flag detection, but no story implements the nudge sending UI or email dispatch.

---

## Epic Quality Review

### Best Practices Compliance Matrix

| Epic | User Value | Independent | Stories Sized | No Fwd Deps | ACs Complete | FR Traced | Verdict |
|---|---|---|---|---|---|---|---|
| Epic 1 | ⚠️ Partial | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ Note |
| Epic 2 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Pass |
| Epic 3 | ✅ | ✅ | ✅ | ⚠️ Minor | ✅ | ✅ | ✅ Pass |
| Epic 4 | ✅ | ✅ | ✅ | ⚠️ Minor | ✅ | ✅ | ✅ Pass |
| Epic 5 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Pass |
| Epic 6 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Pass |
| Epic 7 | ✅ | ✅ | ✅ | ✅ | ⚠️ FR refs | 🟠 Wrong FRs | ⚠️ Note |
| Epic 8 | ✅ | ✅ | ✅ | ✅ | ⚠️ FR refs | 🟠 Wrong FRs | ⚠️ Note |

---

### 🟠 Major Issues

#### Issue 1: Epic 1 — Technical scope in first two stories (Acceptable Greenfield Exception)

- **Violation:** Stories 1.1 and 1.2 use "As a developer" as the user persona and deliver no end-user value directly.
- **Context (mitigating):** The create-epics-and-stories best practices explicitly allow for greenfield project scaffolding stories ("Greenfield projects should have: Initial project setup story, Development environment configuration, CI/CD pipeline setup early"). The PRD also states "Database schema is the single prerequisite (unblocks all parallel work)." This is intentional and documented.
- **Verdict:** Acceptable for greenfield project with documented intent. Minor framing issue only.

#### Issue 2: Story 1.2 creates complete database schema upfront — best practice deviation

- **Violation:** Best practice states "Right: Each story creates tables it needs." Story 1.2 creates the complete schema upfront: `clubs`, `pages`, `page_elements`, `content_versions`, `users`, `sessions`, `page_events`, plus Auth.js adapter tables — plus seed data referencing `events`, `gallery_items`, and `documents` that are only consumed in Epics 4, 5, and 7.
- **Impact:** Schema is tightly coupled to all planned features from Story 1.2; late-epic changes require modifying the foundation migration. Seed data in Story 1.2 depends on element types defined in Epics 4 and 5.
- **Mitigating factor:** The PRD explicitly designates database schema as the single prerequisite enabling parallel development. This is a deliberate architectural decision.
- **Verdict:** Intentional deviation with understood trade-offs. Not a blocking issue given explicit PRD guidance.

#### Issue 3: Story 4.5 (Explicit Save) defines the pattern that Stories 4.2 and 4.3 already partially implement

- **Violation:** Stories 4.2 and 4.3 reference the amber dot, Save button, and Server Action — but Story 4.5 is where the complete save-protection pattern (beforeunload, discard confirmation, full dirty-state management) is formally specified.
- **Impact:** If stories are implemented in order, developers building 4.2 and 4.3 may implement a partial save pattern; Story 4.5 then attempts to complete it. Risk of inconsistent save behavior across the epic.
- **Recommendation:** Add an explicit note to Story 4.2 that "full save protection is defined in Story 4.5 — implement holistically." Alternatively, reorder so Story 4.5 is implemented first as the save framework, then 4.2 and 4.3 build on it.

#### Issue 4: Story 7.2 — incorrect FR references undermine traceability

- **Violation:** Two misplaced FR references in Story 7.2 ACs:
  - AC "storage counters displayed (FR36)" — FR36 is "Operator sends notification to club admin." Correct: FR34/FR35.
  - AC "maximum pages error returned (FR37)" — FR37 is "Operator views support requests." Correct: FR7/FR38.
- **Impact:** Developers cannot trace from these ACs to the correct PRD requirements. Audit of FR36 and FR37 will incorrectly show them as implemented via Story 7.2.

#### Issue 5: Story 7.4 — incorrect FR references for platform settings page

- **Violation:** AC references FR35 and FR39 for the settings page display.
  - FR35 is "health monitoring" — not settings display.
  - FR39 is "template migration" — not settings display.
  - **The correct FR is FR38** (Operator configures platform-wide operational variables).
- **Impact:** FR38 appears untraced in stories (no story claims to implement it), when in fact Story 7.4 does. False negative in coverage analysis.

#### Issue 6: Stories 8.2 and 8.3 — swapped and misplaced FR references

- **Story 8.2 violation:** AC "listing exactly what will be deleted (FR40)" — FR40 is "Club Admin can EXPORT data." Story 8.2 implements FR41 (data deletion), not FR40.
- **Story 8.3 violations:**
  - AC "operator can export `page_events` records (FR41)" — FR41 is "Club Admin requests deletion," not analytics export.
  - AC "records older than 12 months deleted (FR42)" — FR42 is "cookie consent mechanism," entirely unrelated to data retention.
- **Impact:** FR40 appears falsely covered by Story 8.2. FR41 and FR42 are falsely attributed to unrelated ACs. The actual FR40 (data export) and FR42 (cookie consent) remain unimplemented.

---

### 🟡 Minor Concerns

#### Minor 1: Story 3.1 forward reference to Epic 6

Story 3.1 AC: "a `/support` placeholder page (full support form implemented in Epic 6)." This documents a forward dependency but correctly marks it as a placeholder — the page functions independently of Epic 6. Acceptable for phased delivery. Implementation note should be added to avoid confusion.

#### Minor 2: Epic 1 title is technical-sounding

"Project Foundation & Core Infrastructure" leans technical. A more user-centric framing would be "Platform Foundation: Authentication & Secure Access." Cosmetic concern only.

#### Minor 3: Story 7.3 `page_events` table was pre-created in Story 1.2

Story 7.3 references inserting into `page_events` — the table was already created in Story 1.2. No conflict, but developers should know no migration is needed in Story 7.3. Minor documentation gap.

---

### Greenfield Starter Template Check ✅

- Architecture specifies: `pnpm create next-app@latest website-template --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"`
- Story 1.1 correctly implements this as first story ("As a developer, I want the project initialized with Next.js 16 App Router...") ✅
- CI/CD pipeline (GitHub Actions: lint → typecheck → audit → build → SSH deploy) included in Story 1.1 ✅
- Development environment (Docker Compose with Next.js + PostgreSQL + Nginx + Certbot) in Story 1.1 ✅
- **Starter template requirement properly satisfied** ✅

---

### Epic Independence Validation

| Test | Result |
|---|---|
| Epic 1 stands alone | ✅ |
| Epic 2 works with only Epic 1 | ✅ |
| Epic 3 works with Epics 1–2 | ✅ |
| Epic 4 works with Epics 1–3 | ✅ |
| Epic 5 works with Epics 1–4 | ✅ |
| Epic 6 works with Epics 1–5 | ✅ |
| Epic 7 works with Epics 1–6 | ✅ |
| Epic 8 works with Epics 1–7 | ✅ |
| No circular dependencies | ✅ |
| No Epic N requires Epic N+1 | ✅ |

---

### Story AC Quality Spot Check

| Story | GWT Format | Testable | Error Coverage | Verdict |
|---|---|---|---|---|
| 1.1 Scaffold | ✅ | ✅ | Happy path focus (acceptable) | ✅ |
| 1.2 Database Schema | ✅ | ✅ | Middleware error throws | ✅ |
| 1.3 Magic Link Auth | ✅ | ✅ | Expired link, rate limit, TOTP fail | ✅ Strong |
| 2.1 Apply Form | ✅ | ✅ | Missing fields, bot fail, rate limit | ✅ Strong |
| 2.3 Approval | ✅ | ✅ | Email fail → rollback, slug collision | ✅ Strong |
| 4.1 Edit Mode | ✅ | ✅ | Unauthorized edit attempt | ✅ |
| 5.2 Rich Text | ✅ | ✅ | XSS sanitization, storage error | ✅ Strong |
| 6.1 Contact Form | ✅ | ✅ | Turnstile fail, invalid data | ✅ Strong |
| 7.2 Metrics | ✅ | ✅ | Limit enforcement, grandfathering | ✅ |
| 8.2 Data Deletion | ✅ | ✅ | Rollback on partial failure | ✅ Strong |

Overall AC quality is **high**. GWT format consistently applied. Error conditions well-covered across all sampled stories. No vague criteria found.

---

### Epic Quality Summary

- **🔴 Critical Violations:** 0
- **🟠 Major Issues:** 6 (Issues 1–2 are intentional deviations with documented rationale; Issues 3–6 are actionable traceability and sequencing problems)
- **🟡 Minor Concerns:** 3
- **Overall Epic Quality:** **High** — structurally sound, well-written ACs, no circular dependencies, proper greenfield scaffolding, clear user value in all user-facing stories. Primary concerns are incorrect FR references (Issues 4–6) and save-pattern ordering (Issue 3).

---

## Summary and Recommendations

### Overall Readiness Status

> ## ⚠️ NEEDS WORK — Conditionally Ready

**The core platform flows are well-planned and can begin implementation immediately (Epics 1–6).** However, 6 functional requirements have no story implementation, 2 of which are GDPR compliance obligations at launch. Epic 7 and Epic 8 require story additions before those epics begin development.

---

### Critical Issues Requiring Immediate Action

#### 🚨 GDPR Compliance Blockers (Must resolve before launch)

**1. FR42 — Cookie Consent Mechanism: No story, no UX design**
- Required at launch for GDPR/nDSG compliance
- Not designed in the UX spec
- Not implemented in any story
- **Action:** Create UX design for cookie consent banner (platform site + club sites with applicable third-party embeds), then add a story to Epic 8.

**2. FR40 — Club Admin Data Export: No story**
- GDPR data portability right — PRD states this is "already in scope as a core product value"
- UX Admin sidebar tab shows an "Export" link with no story behind it
- Story 8.2 incorrectly claims this FR via a mislabeled AC reference
- **Action:** Add Story 8.4 to Epic 8: "Club Admin — Data Export (GDPR Portability)" — JSON/CSV export of all club content, delivered via download link.

#### 🚨 Missing Stories for Designed Features (Epics 7 & 8)

**3. FR35 — Site Health Monitoring: No story**
- PRD Journey 4 describes the operator checking Lighthouse scores and uptime across all clubs
- Story 7.4 references FR35 incorrectly in the settings page context
- **Action:** Add Story 7.6: "Operator Dashboard — Site Health Status" covering per-club Lighthouse score tracking, uptime indicators, and health status flags across all clubs.

**4. FR36 — Operator Nudge to Club Admin: No story**
- Both PRD Journey 4 and UX Journey 4 explicitly show "Send nudge to club admin" as a distinct step after detecting a site issue
- Story 7.2 references FR36 incorrectly in a metrics context
- **Action:** Add Story 7.7: "Operator Nudge — Club Admin Notification" covering the nudge UI and email delivery via Resend.

**5. FR37 — Operator Support Inbox: No story**
- Story 6.4 covers the Club Admin submitting a ticket and operator receiving an email notification — but no story covers the operator's `/admin/support` view and response interface
- UX Journey 4 shows this as "Check support queue → Read ticket → Reply directly" — a designed flow with no implementation
- **Action:** Add Story 7.8: "Operator Support Inbox" covering the `/admin/support` page: ticket list, status tracking (open/closed), and direct reply flow.

**6. FR39 — Silent Template Migration Mechanism: No story**
- The platform's core promise ("associations simply find their sites have improved over time") depends on this mechanism
- Story 7.4 references FR39 incorrectly in a settings context
- Zero-downtime template migration is architectural and needs its own story
- **Action:** Add Story 7.9 (or Story 1.6): "Template Versioning & Silent Migration" covering: template version tracking in the database, migration trigger process, content preservation during migration, zero-downtime deployment, and CI/CD integration.

---

### Actionable Fixes (Before Sprint Planning)

These are lower-risk corrections that should be made before development begins to prevent traceability confusion:

**7. Correct FR references in stories** (cosmetic — no implementation change required):
- Story 7.2: Change `(FR36)` → `(FR34)` for metrics display; change `(FR37)` → `(FR7, FR38)` for limit enforcement
- Story 7.4: Change `(FR35, FR39)` → `(FR38)` for settings page display
- Story 8.2: Change `(FR40)` → `(FR41)` for deletion confirmation listing
- Story 8.3: Remove incorrect `(FR41)` and `(FR42)` references from cleanup job ACs

**8. Resolve AccentColorPicker phase conflict:**
- PRD places "per-club color theme picker" in Phase 2 (Post-MVP)
- UX spec lists `AccentColorPicker` as Phase 1 MVP Critical
- Epics contain no story for it
- **Decision required:** Is the accent picker MVP or Post-MVP? If MVP: add story to Epic 4 and update PRD scope. If Post-MVP: update UX Phase 1 component list to Phase 2.

**9. Add save-pattern note to Stories 4.2 and 4.3:**
- Add a dev note that the full explicit-save protection pattern (beforeunload, dirty state, discard confirmation) is defined in Story 4.5 and must be implemented holistically across the epic, not story by story.

---

### Recommended Next Steps

1. **Immediately create the 6 missing stories** (FR35, FR36, FR37, FR39, FR40, FR42) before sprint planning for Epics 7 and 8. Stories for Epics 1–6 are implementation-ready now.

2. **Resolve the AccentColorPicker MVP/Post-MVP decision** — update either the PRD scope section or the UX Phase 1 component list to eliminate the ambiguity.

3. **Fix incorrect FR references** in Stories 7.2, 7.4, 8.2, and 8.3 — this is a 15-minute edit that prevents downstream traceability confusion.

4. **Add a cookie consent UX design pass** — FR42 has zero design work. Even a brief wireframe of the consent banner for the platform site and club sites is needed before a story can be written.

5. **Clarify Story 4.5 sequencing** — add an implementation note that the save framework (4.5) should be considered foundational to 4.2 and 4.3, not implemented last.

6. **Begin implementation** — Epics 1, 2, 3, 4, 5, and 6 are implementation-ready. All 23 stories within these epics have complete ACs, clear FR traceability (after fixing minor reference errors), proper user value, and no unresolved structural dependencies.

---

### Issues Count by Category

| Category | Count |
|---|---|
| Missing stories (no implementation) | 6 (FR35, FR36, FR37, FR39, FR40, FR42) |
| Partial coverage | 1 (FR34 — aggregate metrics) |
| Incorrect FR references (cosmetic) | 4 stories affected |
| UX/PRD phase conflict | 1 (AccentColorPicker) |
| Epic quality major issues | 6 (Issues 1–6 in quality review) |
| Epic quality minor concerns | 3 |

**Total issues: 21** across 6 categories.

---

### Final Note

This assessment identified **21 issues** across **6 categories**. The most critical are the 2 GDPR compliance gaps (FR40, FR42) and the 4 missing stories for designed features (FR35, FR36, FR37, FR39). The overall planning quality is **high** — PRD is thorough, UX is complete and largely aligned, architecture is detailed and consistent, and stories 1.1–6.4 are ready for implementation.

**Epics 1–6 are cleared to begin development.** Epics 7 and 8 require the addition of 4–6 new stories before their sprint planning sessions.

---

**Assessment completed:** 2026-02-27
**Assessed by:** Implementation Readiness workflow (check-implementation-readiness)
**Report file:** `_bmad-output/planning-artifacts/implementation-readiness-report-2026-02-27.md`
