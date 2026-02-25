---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary,
  step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type,
  step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments:
  - _bmad-output/brainstorming/brainstorming-session-2026-02-23.md
brainstormingCount: 1
briefCount: 0
researchCount: 0
projectDocsCount: 0
workflowType: 'prd'
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
---

# Product Requirements Document - website-template

**Author:** Clashware
**Date:** 2026-02-24

## Executive Summary

**[Platform name TBD]** is a hosted website builder for non-profit associations — ski clubs,
sports clubs, music clubs, and similar community organizations — whose digital presence is
either nonexistent or chronically neglected. It removes the ongoing maintenance cost of a
website entirely by separating form (owned permanently by the platform) from content (owned
by the association). Associations manage their content; the platform handles design,
infrastructure, SEO, security, and evolution — silently and permanently.

The product solves a visibility problem: real-world community activities are happening, but
people searching for them can't find them. Each hosted association site, combined with a
public filterable directory on the platform's own website, forms a self-reinforcing discovery
engine. The "Powered by" footer on every club site is both attribution and organic
acquisition. Growth comes exclusively from word of mouth.

The business model is intentionally minimal: a fixed annual fee ≤ CHF 100/year per
association, never tiered, never upsold — supplemented by voluntary donations and civic
grants. The price may decrease as margins improve. This is civic infrastructure, not a SaaS
product.

**Why this, why now:** The founder applies software engineering skills to serve society rather
than extract attention from it. The long-term vision is geographic expansion — origin region →
country → international — spreading the philosophy that real-world community activity is a
health imperative. The measure of success is not engagement metrics. It is people finding a
club and showing up.

### What Makes This Special

Most website builders sell control as the feature. This platform inverts that: it sells the
permanent abdication of control as liberation. Style is sacred (platform-owned). Content is
free (association-owned). Associations never worry about design trends, framework upgrades,
SSL certificates, or template migrations — the platform absorbs all of it, silently, forever.

Every product decision traces back to the same root: associations should spend their energy
doing the thing, not managing the website about the thing. The differentiation is visible
across the entire product — pricing (radical simplicity), growth strategy (no marketing
spend), architecture (the directory is the homepage), admin experience (edit mode lives on the
club's own site), and brand DNA (digital minimalism as first principle).

Alternatives like Wix, Squarespace, or WordPress offer flexibility that creates obligation —
ongoing decisions, maintenance, and skill requirements. The target user doesn't want a tool.
They want infrastructure that disappears.

## Project Classification

- **Project Type:** Web application — multi-tenant website builder and hosting platform
- **Domain:** General / civic / community
- **Complexity:** Low — no regulated industry, standard web stack, GDPR compliance required
- **Project Context:** Greenfield — no existing codebase

## Success Criteria

### User Success

- A Club Admin completes their initial site setup — pages, content, static elements — without
  external technical help or documentation
- Club Admins experience zero ongoing maintenance burden for design, infrastructure, or
  technical upkeep; the platform absorbs it entirely
- Clubs receive measurable real-world benefit within the first weeks of going live: contact
  requests, membership enquiries, new member discoveries attributable to their digital presence
- Club Admins feel pride in displaying the "Powered by" badge — it signals belonging to a
  curated community with a shared philosophy, not just platform attribution
- No admin ever encounters a destructive or irreversible action by accident; the editing
  interface prevents technical error states entirely

### Business Success

- **Month 1:** ~10 clubs live on the platform (personal network, Switzerland) — sufficient to
  identify and resolve real-world friction before wider exposure
- **Year 1:** Platform is nationally known in Switzerland; the association community recognizes
  it as the standard for club digital presence
- **Beyond Year 1:** Expand into at least one additional European country, leveraging Swiss
  credibility as proof of concept and philosophy
- Zero marketing spend at any stage — all growth through word of mouth and directory discovery
- Platform financially self-sustaining through annual fees (≤ CHF 100/year) supplemented by
  voluntary donations and civic grants; no venture dependency

### Technical Success

- 99.9% uptime — associations never deal with their site being down
- All club sites score ≥ 90 on Core Web Vitals (Lighthouse performance, accessibility, SEO)
- Fully responsive with full feature parity on mobile, including admin/edit mode
- GDPR compliant at launch, with full data export right available to every club
- Automatic SEO on all club sites: meta tags, structured data, sitemap — zero configuration
  required
- Template migrations are silent and zero-downtime; clubs are never notified of upgrades,
  sites simply improve
- Explicit save with N-version history and rollback — no admin ever loses work

### Measurable Outcomes

| Metric | Target | Timeframe |
|---|---|---|
| Clubs live | ≥ 10 | Month 1 |
| Support tickets for content editing | 0 | Ongoing |
| GDPR compliance | 100% | Launch |
| Core Web Vitals (Lighthouse) | ≥ 90 | Launch |
| Uptime | ≥ 99.9% | Ongoing |
| National recognition (CH) | ✓ | Month 12 |
| European country #2 live | ✓ | Post-CH consolidation |
| Marketing spend | CHF 0 | Ongoing |

## User Journeys

### Journey 1: Club Admin — Setup and Ongoing Life (Happy Path)

**Marie, 52. President of a ski club in canton Valais.**

Marie has been running her ski club for 11 years. The club has 80 members, a WhatsApp group,
and a page on a regional sports federation portal that nobody has touched since 2017 —
outdated fees, a dead email address, and a photo of the old committee. Every year she means
to "fix the website." Every year, she doesn't.

A friend who runs a football club sends her a message: *"You need to see this. We got our
site live in one afternoon."* Marie clicks the link, reads the philosophy on the platform
homepage. She recognizes herself in it immediately. She fills out the Apply form — two fields
and a short description of the club. Two days later she receives a personal email: her club
has been accepted.

She clicks the login link in the email. She's taken directly to her club's new site — already
structured, already her subdomain — in edit mode. She types the club name. She uploads the
logo from her phone. She writes a welcome paragraph in plain French. She creates a Calendar
page and adds the upcoming ski weekend in Verbier. She saves. She visits the public view. It
looks exactly like a real website. She screenshots the directory page showing *Ski Club
Valais* and sends it to the WhatsApp group.

Three weeks later, a family from the village contacts the club through the contact form —
they want to enroll their two kids. The email arrives in Marie's inbox. She hits reply.
That's it.

Six months later, someone at the club AGM asks "who manages the website?" Marie realizes she
hasn't thought about it once since that afternoon.

**Edge case — admin hits a genuine wall:** All basic constraints (file size limits, image
dimensions, accepted formats) are displayed inline, contextually, before or at the moment
they're relevant. Marie never has to guess what's allowed. But one day she encounters
something the UI can't resolve: custom domain DNS propagation isn't completing as expected.
She finds a "Contact Support" link on the platform site, submits a short form with her club
name and the issue. Within 24 hours she receives a direct reply from the founder. Resolved.
The low volume of support requests like this is itself a product quality signal.

**This journey reveals requirements for:** application flow, subdomain provisioning, in-page
edit mode, static homepage elements, calendar element, contact form with reply-to email relay,
explicit save with version history, public site view, directory listing, inline constraint
display, support contact form.

---

### Journey 2: Public Visitor — Finding an Activity (Happy Path + Edge Case)

**Thomas, 28. Recently moved to Lausanne from Zurich.**

Thomas wants to find a badminton club. He doesn't know anyone locally yet. He Googles
*"badminton club Lausanne"* and finds a result — a clean, fast-loading site for a sports
club. He browses the calendar, finds a training session on Thursday evenings. He sends a
message through the contact form: *"I'm looking to join. What's the process?"*

He notices the "Powered by [Platform]" link in the footer. Out of curiosity, he clicks it.
He lands on the platform directory. He filters by *Sport* and *Canton Vaud*. He finds four
clubs he didn't know existed — including a volleyball club 10 minutes from his apartment.
He bookmarks two.

**Edge case:** Thomas is looking for a music ensemble — something informal, not a
conservatory. He searches the directory, filters by *Music*. Only two results in his region,
neither quite what he wanted. He finds one anyway, visits their site, checks the About
section and the calendar. He sends a message asking if they accept beginners. The club
president replies within a day. He shows up the following Saturday.

**This journey reveals requirements for:** public site browsability (no account), contact
form, directory with activity type and region filters, responsive mobile experience,
SEO/searchability, "Powered by" footer link back to platform.

---

### Journey 3: Club Applicant — Application and Acceptance (+ Rejection Edge Case)

**Ahmed, 35. Newly elected secretary of a cultural association in Bern.**

Ahmed's association was founded 8 years ago. They organize concerts, language exchanges, and
community dinners for a diaspora community in Bern. They have no website. Their only online
presence is a Facebook page updated sporadically.

Ahmed discovers the platform through a footer link on another association's site. He reads
the philosophy. He opens the Apply page, fills in the association's name, activity type, a
short description. He submits. He goes back to his day.

Forty-eight hours later he receives an email. He's been accepted. The email contains his
subdomain — already live — and a login link. He clicks it, arrives at his new site in edit
mode. He spends an hour setting it up. By the end of the day, the association has a public
website for the first time in 8 years.

**Edge case — rejection:** A user applies claiming to represent a "digital marketing
collective." The operator reviews the application — it doesn't fit the association niche.
A short email explains that the platform is specifically for non-profit associations focused
on real-world activities, and that this application doesn't match that profile. The curation
was visible in the product — they knew what they were applying to.

**This journey reveals requirements for:** Apply page with form, manual operator review
queue, acceptance email with login link and subdomain, rejection email with explanation,
immediate subdomain provisioning on acceptance.

---

### Journey 4: Platform Operator — Daily Operations

**The founder. Managing the platform.**

It's a Tuesday morning. The operator logs into the platform admin dashboard.

There's one new application — a brass band association from canton Fribourg. The operator
reads the description, checks the activity type, confirms it fits the niche. One click:
approved. The subdomain is provisioned automatically. An acceptance email goes out.

The operator scans the metrics panel: 24 clubs now live, 19 have set up custom domains.
Platform uptime: 100% for the last 30 days. All club sites returning Lighthouse scores ≥ 90.
Storage usage is well within bounds.

One flag: a club site in Geneva has a broken image in its Gallery element. The operator
notes it and sends a brief nudge to the club admin to review their Gallery page.

The support queue has one ticket: a club admin with a custom domain DNS question. The
operator replies directly. The low ticket volume confirms the interface is working as
intended — admins aren't confused by basic constraints because those are displayed inline.

No billing issues. The operator closes the tab and goes back to building the next feature.

**This journey reveals requirements for:** platform admin dashboard (application queue,
approval/rejection, metrics — clubs live, uptime, Lighthouse scores, storage), automated
subdomain provisioning on approval, templated acceptance/rejection emails, site health
monitoring, operator nudge mechanism, support ticket inbox.

---

## Domain-Specific Requirements

### Privacy & Data Protection

The platform operates under dual compliance: **GDPR** (for European users and future EU
expansion) and **Swiss nDSG** (revised Federal Act on Data Protection, in force September
2023). In practice these are closely aligned. Requirements:

- Platform and all club sites must include a compliant privacy policy covering data
  collection, processing purpose, retention, and subject rights
- Data subject rights implemented: access, deletion, and portability (data export) — export
  right already in scope as a core product value
- Data processing agreements (DPAs) required with all sub-processors (hosting provider,
  email relay service, etc.)
- Cookie consent mechanism required on the platform site; club sites must handle cookies for
  any third-party embeds (maps, etc.)
- Hosting on Swiss or EU infrastructure strongly preferred for compliance alignment and
  association trust

### Association Eligibility

Eligibility is verified by **self-declaration only** — applicants describe their association
in the Apply form. No legal registration check, no ZGB verification. This is intentional:
it keeps onboarding frictionless, trusts applicants to be honest, and reflects the
platform's broad and inclusive eligibility criteria. The operator exercises judgment on edge
cases during manual review.

### Billing

**Deferred to post-MVP.** The annual fee mechanism (payment processor, invoicing, CHF
handling) will be defined once the platform is live and validated with real clubs. MVP ships
without payment infrastructure. Early adopters onboarded without charge during the
validation phase.

### Risk Mitigations

| Risk | Mitigation |
|---|---|
| Club uploads personally identifiable content (member photos, etc.) | Privacy policy places responsibility on Club Admins for content they publish; platform provides the tools, not the editorial judgment |
| Ineligible applicant slips through self-declaration | Manual operator review is the filter; rejection email process already defined |
| Sub-processor non-compliance | DPAs required before any sub-processor handles platform data |
| Billing deferred creates expectation gap | First clubs onboarded with explicit understanding that billing is coming post-MVP |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Philosophical Inversion of the Website Builder Model**
Every major website builder (Wix, Squarespace, WordPress) sells *control* as the primary
feature — more flexibility, more customization, more options. This platform inverts that
entirely: it sells the *permanent abdication of control* as liberation. The platform owns
style forever; associations own content forever. This is not a niche positioning — it is a
category inversion. No comparable product makes this argument or builds around this contract.

**2. Product Architecture as Acquisition Engine**
The platform's acquisition strategy is structurally embedded in the product itself. Every
club site footer carries a mandatory "Powered by" link to the platform directory. Every new
club site is a new acquisition surface. There is no marketing budget, no SEO content
machine, no ad spend — growth is a byproduct of product usage. The directory *is* the
homepage. This inverts the conventional SaaS growth model.

**3. Pricing That Decreases Over Time**
SaaS pricing universally increases — tiers, upsells, inflation adjustments. This platform's
pricing model explicitly *may decrease* as margins improve. Pricing is framed as a
philosophical commitment, not a revenue optimization lever. This is essentially unheard of
in the category and functions as a trust signal and values statement simultaneously.

**4. Silent Infrastructure Improvement as Core Promise**
Most platforms push updates that require user action, approval, or at minimum awareness.
This platform promises the structural opposite: associations simply find their sites have
improved over time. Template versioning with zero-downtime silent migration means the
platform absorbs all upgrade complexity permanently. The *absence of user obligation* is the
feature.

**5. Civic Infrastructure Framing, Not SaaS Framing**
The product deliberately rejects SaaS mental models — growth metrics, engagement
optimization, retention hacks — in favor of civic infrastructure positioning: stable,
essential, invisible, community-serving. This shapes every product and business decision in
a coherent and genuinely differentiated way.

### Market Context & Competitive Landscape

Existing website builders target users who *want* control and *enjoy* customization. This
platform targets a segment those builders have structurally neglected: organizations that
need a web presence but have neither the time, skills, nor desire to manage one. The target
user is not underserved by bad tools — they are underserved by tools that assume engagement
they cannot provide.

No direct competitor occupies this positioning. The closest analogues are niche CMS products
for specific verticals, but none combine: voluntary pricing, philosophy-driven curation,
directory-as-marketing, and permanent form ownership.

### Validation Approach

- **Month 1 validation:** 10 clubs onboarded from personal network. Key signals: setup time,
  support ticket volume, first contact form submissions received by clubs, admin return rate
  after initial setup
- **Word-of-mouth validation:** Track how new applicants discovered the platform — if the
  "Powered by" footer and directory drive inbound applications without any outreach, the
  acquisition model is validated
- **Invisibility validation:** If club admins stop thinking about their website within 30
  days of launch, the silent infrastructure promise is working
- **Philosophy resonance:** Qualitative signal — do accepted clubs express pride in the
  "Powered by" badge, or treat it as an obligation?

### Risk Mitigation

| Innovation Risk | Mitigation |
|---|---|
| Clubs resist ceding style control — want customization | Philosophy communicated explicitly at Apply stage; self-selection filters misaligned applicants before onboarding |
| Word-of-mouth too slow for Swiss national reach by Year 1 | Personal network launch builds critical mass for directory density; density accelerates organic discovery |
| "Pricing may decrease" creates unsustainable expectation | Commitment is conditional on margin improvement — stated as aspiration, not guarantee; billing deferred to post-MVP |
| Silent migrations break club content unexpectedly | Template versioning architecture designed to preserve content on all migrations; N-version history enables rollback |

## Web Application Specific Requirements

### Project-Type Overview

Multi-surface web platform combining server-rendered public pages for SEO with SPA-style
interactive interfaces for inner navigation and admin. Three distinct rendering contexts with
different requirements, handled by a single framework supporting hybrid rendering.

### Technical Architecture Considerations

**Rendering Strategy — Hybrid MPA/SPA:**

| Surface | Rendering | Rationale |
|---|---|---|
| Club site — home page | Server-rendered (MPA) | SEO-critical — contains name, logo, welcome text, structured data |
| Club site — inner pages (navbar tabs) | SPA-style | Client-side navigation, content fetched from backend, loading skeleton while fetching |
| Club site — edit mode | SPA-style | Rich interactive editing on same URL surface as public site |
| Platform site (directory, apply, home, about, support) | Server-rendered (MPA) | SEO-critical — directory must be indexed and discoverable |
| Platform admin dashboard | SPA-style | Internal tool, no SEO requirement, needs rich interactivity |

The framework must natively support this hybrid model (e.g., Next.js, SvelteKit, Nuxt).
Backend API required for SPA-style content fetching across club pages and edit mode.

### Browser Matrix

- Chrome — last 2 major versions
- Firefox — last 2 major versions
- Safari — last 2 major versions
- Edge — last 2 major versions
- Internet Explorer — explicitly not supported

### Responsive Design

- Full feature parity across desktop and mobile — no degraded mobile experience
- Admin/edit mode fully functional on mobile, including touch-friendly edit affordances
- Touch targets sized appropriately for mobile interaction in edit mode
- No horizontal scrolling on any surface at any standard viewport

### Performance Targets

- Core Web Vitals ≥ 90 (Lighthouse) on all club home pages and platform site pages
- Loading skeletons for all SPA-style content transitions — no blank or jumpy states
- Club home page: optimized Time to First Contentful Paint — server-rendered HTML, no layout shift
- No performance regressions from template migrations (silent upgrades must not degrade scores)

### SEO Strategy

- Club home pages: server-rendered with full meta tags, Open Graph, JSON-LD structured data,
  included in platform-level sitemap
- Club inner pages: accessible via direct URL, crawlable
- Platform directory: server-rendered, each club entry with structured data, filterable
  without JS
- Zero SEO configuration required by club admins — fully automated

### Accessibility

- **Binding requirement:** WCAG 2.1 AA — auditable and legally solid
- **Best-effort:** WCAG AAA criteria applied where practical — enhanced contrast, no time
  limits, descriptive labels, clear focus indicators
- All interactive elements keyboard-navigable, including edit mode
- ARIA labels on all dynamic and interactive components
- Image and media elements in edit mode require alt text (enforced field, not optional)
- Color token architecture designed to meet AA contrast ratios by default

## Project Scope & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — the founding validation question is not "can we build
this?" but "does the philosophy work in practice?" Ten clubs from the personal network
interact with the product as real users. If non-technical admins set up their sites without
help and stop thinking about them within weeks, the product proves itself. No timeline
pressure, no resource constraints — quality and correctness over speed.

**Build Order:** Database schema is the single prerequisite (unblocks all parallel work).
Club webapp and platform site are built in parallel thereafter — they share the same
database.

**Page Limit:** 5 pages maximum per club site in v1. This constraint is enforced in code
and configurable from the platform admin dashboard — adjustable without a deployment.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Club Admin — setup and ongoing content management (full happy path + edge cases)
- Public Visitor — discovery via directory and club site browsing
- Club Applicant — application, manual review, acceptance/rejection, subdomain provisioning
- Platform Operator — dashboard, application queue, site health, support queue

**Must-Have Capabilities:**

*Club Webapp:*
- Static homepage elements: club name, logo, welcome text (server-rendered, SEO-optimized)
- Anchor pages (non-removable): Home, Contact with composable sub-blocks (form + reply-to
  relay, map, phone, email, predefined subjects)
- Opt-in custom pages via auto-generated navbar, 1 level of sub-pages, maximum 5 pages
  total (configurable)
- V1 element library — page-level: Calendar, Image/Video Gallery, Documents library;
  building: Rich text, inline image
- Hybrid MPA/SPA rendering: home page server-rendered, inner pages SPA-style with loading
  skeletons
- Edit mode: toggled on club's own site, card-style affordances, explicit save, N-version
  history, defensive UX, inline constraint display
- Single admin account per club; login entry from platform site
- Subdomain provisioning (immediate on approval); custom domain support
- Mandatory non-removable "Powered by" footer
- Full mobile/desktop parity including admin mode
- WCAG 2.1 AA accessibility (best-effort AAA)

*Platform Site:*
- Home (philosophy + apply CTA), Directory (filterable by activity type and region), Apply,
  About, Support/Donate
- All pages server-rendered for SEO

*Platform Admin Dashboard:*
- Application queue (approve/reject with templated emails)
- Club management (metrics, storage, site health monitoring)
- Configurable platform variables (page limit per club, etc.)
- Support ticket inbox

*Platform-wide:*
- Automatic SEO on all club sites (meta tags, Open Graph, JSON-LD, sitemap)
- GDPR/nDSG dual compliance, cookie consent, DPAs with sub-processors
- Data export right available to every club
- Template versioning with silent zero-downtime migration
- Color token architecture (single scheme, variable-ready)
- Hosting on Swiss or EU infrastructure

### Post-MVP Features (Phase 2 — Growth)

- Role-based multi-user access per club
- Member management
- Per-club color theme picker
- Calendar event sub-page detail design
- Federation / umbrella organization partnerships
- Community roadmap page (block requests, feature visibility)
- Billing infrastructure (annual fee collection, CHF payment processing)
- Open-source template (post security review)

### Vision Features (Phase 3 — Expansion)

- International expansion beyond Europe
- Annual "State of Associations" report
- Manifesto / public charter
- Full public transparency on members and donors
- Aggregated public metrics on platform site
- Multilingual content (per-block language slots)

### Risk Mitigation Strategy

| Risk | Mitigation |
|---|---|
| Clubs resist ceding style control | Philosophy visible at Apply stage — self-selection filters misaligned applicants |
| Word-of-mouth growth too slow | Personal network launch builds directory density; density accelerates organic discovery |
| Contact form or email relay failure | Robust email relay with delivery monitoring; operator alerts on failure |
| Silent template migration breaks club content | Schema designed for content preservation from day one; N-version history enables rollback |
| 5-page limit frustrates clubs with complex structures | Limit is configurable from admin dashboard — adjustable without a deployment when evidence warrants |

## Functional Requirements

### Club Site Configuration & Navigation

- **FR1:** Club Admin can configure their site's core identity elements (name, logo, welcome text)
- **FR2:** Club Admin can toggle between public view and edit mode directly on their club website
- **FR3:** Club Admin can activate and deactivate optional pages in their site's navigation
- **FR4:** Club Admin can create custom pages with user-defined navigation labels
- **FR5:** Club Admin can configure one level of sub-pages within their site's navigation
- **FR6:** System prevents Club Admin from removing anchor pages (Home and Contact)
- **FR7:** System enforces a configurable maximum page count per club site
- **FR8:** Club Admin can set up and manage a custom domain for their site
- **FR9:** System provisions a subdomain for each approved club immediately upon acceptance

### Content Editing & Element Library

- **FR10:** Club Admin can add, configure, and remove elements on custom pages using a visual element picker
- **FR11:** Club Admin can configure Contact page sub-blocks (contact form, map, phone number, email address, predefined message subjects) independently
- **FR12:** Club Admin can create, edit, and delete calendar events on a Calendar page
- **FR13:** Club Admin can upload and manage images and videos in a Gallery page
- **FR14:** Club Admin can upload and manage documents and PDFs in a Documents library page
- **FR15:** Club Admin can add and edit rich text content on custom pages
- **FR16:** Club Admin can add and edit inline images on custom pages
- **FR17:** Club Admin can explicitly save changes to their site
- **FR18:** Club Admin can view their site's version history and restore a previous version
- **FR19:** System displays file constraints (size limits, accepted formats) inline at the point of upload

### Public Discovery & Contact

- **FR20:** Public Visitor can browse a directory of all member associations on the platform site
- **FR21:** Public Visitor can filter the directory by activity type and geographic region
- **FR22:** Public Visitor can view any club's public website without authentication
- **FR23:** Public Visitor can submit a contact message through a club's contact form
- **FR24:** System delivers contact form submissions to the club's registered email address with reply-to set to the sender's address
- **FR25:** Public Visitor can navigate from any club site to the platform directory via the footer attribution link
- **FR26:** System displays a mandatory, non-removable platform attribution link in the footer of every club site

### Application & Access

- **FR27:** Club Applicant can submit an application to join the platform providing association name, activity type, and description
- **FR28:** Club Admin can authenticate and access their site's edit mode via the platform site login
- **FR29:** Platform Operator can authenticate via a dedicated platform-level admin interface separate from club sites
- **FR30:** Club Admin can submit a support request to the platform team from the platform site

### Platform Operations

- **FR31:** Platform Operator can view and manage a queue of pending club applications
- **FR32:** Platform Operator can approve an application, triggering automatic subdomain provisioning and an acceptance email to the applicant
- **FR33:** Platform Operator can reject an application with an explanatory email to the applicant
- **FR34:** Platform Operator can view platform-wide metrics (clubs live, custom domains, uptime, performance scores, storage)
- **FR35:** Platform Operator can monitor site health status across all hosted club sites
- **FR36:** Platform Operator can send a notification to a club admin regarding a detected site issue
- **FR37:** Platform Operator can view and respond to club admin support requests
- **FR38:** Platform Operator can configure platform-wide operational variables including the per-club page limit
- **FR39:** System applies template version updates to all club sites automatically without downtime or any action required from club admins

### Compliance & Data Rights

- **FR40:** Club Admin can export all their club's content data in a portable standard format
- **FR41:** Club Admin can request deletion of their club's data from the platform
- **FR42:** System presents a cookie consent mechanism to users on the platform site and on club sites where applicable
- **FR43:** System automatically generates and maintains SEO metadata for all club site pages without requiring any admin configuration
- **FR44:** Club Admin can view stored contact form submissions received for their site
- **FR45:** Platform Operator can view detailed per-club analytics (traffic, page views, edit events, login events, contact form submission counts)

## Non-Functional Requirements

### Performance

- Club site home pages achieve Time to First Contentful Paint < 2 seconds on a standard broadband connection
- SPA-style inner page transitions load content within 2 seconds of navigation (loading skeleton displayed within 100ms)
- All public-facing pages score ≥ 90 on Core Web Vitals (Lighthouse performance, SEO, accessibility)
- No performance regression on any club site following a silent template migration
- Platform admin dashboard collects analytics per club site: traffic, page views, edit events, login events, contact form submission events — retained for a minimum of 12 months for operational insight

### Security

- All data encrypted at rest and in transit (TLS 1.2+ enforced on all connections)
- Contact form submissions stored on platform servers and accessible to the Club Admin — ensuring visibility even if email delivery fails; stored submissions encrypted at rest
- Admin authentication supports TOTP-based two-factor authentication (authenticator app); 2FA strongly recommended and displayed as a mandatory prompt on first login and on each subsequent login until 2FA is enabled, to all Club Admins and Platform Operators
- Passkey (WebAuthn / FIDO2) support available as an authentication method for Club Admins and Platform Operators
- Password strength enforced at account creation and password change: minimum length, character complexity, rejection of common/breached passwords
- Admin credentials hashed using a modern algorithm (bcrypt or Argon2)
- No sensitive club or admin data exposed in client-side code or public API responses
- Multi-tenant isolation: one club's data and operations cannot be accessed or affected by another club

### Reliability

- Platform uptime ≥ 99.9% measured monthly across all hosted club sites and the platform site
- Template migrations complete with zero downtime — no club site goes offline or degrades during an upgrade
- Email relay delivery is monitored; failures trigger an operator alert within 15 minutes of failure detection
- Version history restore completes within 30 seconds of a Club Admin initiating a rollback

### Scalability

- Architecture supports growth from ~10 clubs (Swiss personal network) to thousands of clubs (European scale) without re-architecture
- Hosting infrastructure is horizontally scalable — capacity added without service interruption
- Multi-tenant data model isolates clubs at the storage layer — one club's growth does not degrade another's performance

### Accessibility

- WCAG 2.1 AA compliance is the binding requirement for all public-facing surfaces and the admin/edit interface
- Best-effort WCAG AAA applied where practically achievable (enhanced contrast ratios, no time limits, fully descriptive labels)
- All interactive elements operable via keyboard alone
- All dynamic content compatible with screen readers (ARIA roles and labels on all interactive components)

### Maintainability

- Template versioning system supports silent migration of all club sites without any manual operator or admin intervention
- Platform color scheme updatable via a single token variable change — no component-level edits required
- All platform-wide configurable variables adjustable via the admin dashboard without a code deployment
