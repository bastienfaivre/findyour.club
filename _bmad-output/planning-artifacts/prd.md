---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary,
  step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type,
  step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish,
  step-e-01-discovery, step-e-02-review, step-e-03-edit]
inputDocuments:
  - _bmad-output/brainstorming/brainstorming-session-2026-02-23.md
brainstormingCount: 1
briefCount: 0
researchCount: 0
projectDocsCount: 0
workflowType: 'prd'
workflow: 'edit'
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
lastEdited: '2026-03-09'
editHistory:
  - date: '2026-03-09'
    changes: 'Dashboard migration sync: Updated technical architecture references to reflect unified
      dashboard shell. All pages now render within single (dashboard) route group with AppSidebar.
      Search page replaces country directory. Club admin at /{lang}/club/{clubId}/. Messaging
      evolved from one-way operator messages to bidirectional threaded conversations. User journeys
      updated to reflect unified navigation. FR descriptions unchanged (they describe capabilities,
      not routing).'
  - date: '2026-03-08'
    changes: 'Unified admin routing: All admin pages (platform operator + club admin) consolidated
      under /{lang}/admin/. Club admin pages move from /{lang}/{country}/{club}/admin/ to
      /{lang}/admin/club/{clubId}/. Users with multiple clubs see all their clubs in a single
      sidebar. Shadcn dashboard pattern (SidebarProvider + SidebarInset) adopted for both
      platform and club admin areas with collapsible sidebar, responsive mobile drawer,
      and header with sidebar trigger. Platform admin sidebar shows Dashboard, Applications,
      Clubs; club admin sidebar shows per-club entries with Profile and Settings sub-items.'
  - date: '2026-03-07'
    changes: 'MVP scope pivot: Single-page club profile replaces multi-page CMS. Application
      form collects profile fields (description, schedule, contact, how to join) that seed
      the club profile — no duplicate data entry. Photos (5-10, carousel) added after approval
      only. Two-flag visibility system: admin isPublished + operator forceOffline override.
      Unified operator message model for application feedback and post-live moderation.
      Deferred to post-MVP: multi-page site builder, content elements (rich text, calendar,
      gallery, documents), contact form/email relay, accent color picker, version history.
      Architecture retains extensibility for multi-page expansion.'
  - date: '2026-03-07'
    changes: 'Design direction pivot: Public pages adopt Dub.co-inspired centered layout
      (~1200px max-width, sticky top navbar, standard footer). Club edit mode becomes a
      standard shadcn dashboard (sidebar + content area) replacing in-place editing on
      the live URL. Dark/light mode follows system preference by default (next-themes).
      Admin dashboard unchanged (already shadcn dashboard pattern). In-place editing
      paradigm (EditFieldCard, LivePreviewPanel, ?edit=true URL param) removed in favor
      of conventional /admin route.'
  - date: '2026-03-06'
    changes: 'Vision pivot: website builder → worldwide club directory/hub. Free for all clubs
      (donation-funded). Inclusive model (clubs with existing websites welcome).
      Custom domain deferred to post-MVP. Directory elevated to primary product surface.
      External website link feature added. Added Journey 3b.'
---

# Product Requirements Document - website-template

**Author:** Clashware
**Date:** 2026-02-24

## Executive Summary

**[Platform name TBD]** is a worldwide directory and discovery hub for clubs, associations,
and social activity groups. It is the starting point for anyone looking to find and join a
group — sports, music, culture, gaming, hiking, or any activity built around people doing
things together. Think of it as the Yellow Pages for social activities.

Every club on the platform gets a single-page profile with the essentials: name, description,
a photo carousel showcasing the club's people and locale, schedule or availability info,
contact details, and a "how to join" section. Clubs with an existing website can add a direct
link out to their own site. The profile is deliberately simple — it answers the one question
visitors have: "How do I join this club?" The directory is the product.

Post-MVP, the platform may evolve into a multi-page site builder — the architecture supports
it — but the MVP validates the directory model with the simplest possible club presence.

The platform solves a visibility problem: real-world and online social activities are
happening, but people searching for them can't find them. A public, filterable directory —
searchable by country, activity type, location, and more — forms the core discovery engine.
Growth comes from the platform's own SEO and word of mouth. Zero marketing spend.

The service is free for all clubs. The platform is funded by voluntary donations and civic
grants. This is civic infrastructure, not a SaaS product.

**Why this, why now:** The founder applies software engineering skills to serve society rather
than extract attention from it. The long-term vision is geographic expansion — Switzerland
first → country → worldwide — spreading the philosophy that social interaction is a health
imperative. The measure of success is not engagement metrics. It is people finding a group
and showing up.

### What Makes This Special

Most platforms that connect people to activities are event-centric (Meetup, Eventbrite) or
marketplace-driven. This platform is club-centric and permanent: it indexes durable social
groups, not ephemeral events. A club listed today is still discoverable next year.

The directory is inclusive by design. Every club gets the same single-page profile. Clubs with
polished websites and clubs with no digital presence at all coexist as equals — same
structure, same discoverability, same weight in search. The platform never penalizes a club
for having less content.

The differentiator is not the club page. It's being the single place where anyone, anywhere,
can search "what can I join near me?" and get an answer. Every product decision traces back
to that root: make social activities findable, and make joining frictionless.

## Project Classification

- **Project Type:** Web application — multi-tenant club directory and hosting platform
- **Domain:** General / civic / community
- **Complexity:** Low — no regulated industry, standard web stack, GDPR compliance required
- **Project Context:** Greenfield — no existing codebase

## Success Criteria

### User Success

- A Club Admin completes their club profile — description, schedule, contact info, photos —
  without external technical help or documentation (profile fields pre-populated from
  application)
- Clubs with existing websites complete their profile setup — including external website
  link — without external help
- Club Admins experience zero ongoing maintenance burden for design, infrastructure, or
  technical upkeep; the platform absorbs it entirely
- Clubs receive measurable real-world benefit within the first weeks of going live: contact
  requests, membership enquiries, new member discoveries attributable to their platform presence
- Public visitors find relevant clubs through the directory's filtering system within their
  first search session
- Club Admins feel pride in being listed on the platform — it signals belonging to a curated
  community of social activity groups
- No admin ever encounters a destructive or irreversible action by accident; the admin
  dashboard prevents technical error states entirely

### Business Success

- **Month 1:** ~10 clubs live on the platform (personal network, Switzerland) — mix of hosted
  sites — sufficient to identify and resolve real-world friction before
  wider exposure
- **Year 1:** Platform is nationally recognized in Switzerland as the go-to directory for
  finding clubs and social activities
- **Beyond Year 1:** Expand into at least one additional European country, leveraging Swiss
  credibility as proof of concept and philosophy
- Zero marketing spend at any stage — all growth through word of mouth and directory discovery
- Platform financially self-sustaining through voluntary donations and civic grants; no
  venture dependency

### Technical Success

- 99.9% uptime — associations never deal with their site being down
- All club sites score ≥ 90 on Core Web Vitals (Lighthouse performance, accessibility, SEO)
- Fully responsive with full feature parity on mobile, including admin/edit mode
- GDPR compliant at launch, with full data export right available to every club
- Automatic SEO on all club sites: meta tags, structured data, sitemap — zero configuration
  required
- Template migrations are silent and zero-downtime; clubs are never notified of upgrades,
  sites simply improve
- Explicit save with unsaved-changes protection — no admin ever loses work

### Measurable Outcomes

| Metric | Target | Timeframe |
|---|---|---|
| Clubs live | ≥ 10 | Month 1 |
| Clubs with existing website (using external link) | ≥ 3 | Month 1 |
| Support tickets for content editing | 0 | Ongoing |
| Directory searches by visitors | Tracked from launch | Ongoing |
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
club listed in one afternoon."* Marie clicks the link, reads the philosophy on the platform
homepage. She recognizes herself in it immediately. She fills out the Apply form — club name,
a description of what the club does, their weekly schedule ("Saturdays 9h-12h, Piste de
Thyon"), how to join ("Send us a message on WhatsApp or email"), and contact details (email,
phone). She writes it all in plain French. Two days later she receives a personal email: her
club has been accepted. The approval email includes a note from the operator — "Your
description looks great, consider adding your website URL if you have one."

She clicks the login link in the email. She's taken to her club's admin dashboard. Her
profile is already populated with everything she typed in the application — name, description,
schedule, contact info. She uploads a few photos: one of the club house, one of a group ski
day, one of the kids' training session. She hits Save. She clicks "View public page." It
looks like a real page — clean, with her photos flowing in a carousel. She screenshots it and
sends it to the WhatsApp group.

Three weeks later, a family from the village calls the phone number listed on the club
page — they want to enroll their two kids. Marie didn't have to do anything. The info was
just there.

Six months later, someone at the club AGM asks "who manages the website?" Marie realizes she
hasn't thought about it once since that afternoon.

**Edge case — admin hits a genuine wall:** All basic constraints (file size limits, image
dimensions, accepted formats) are displayed inline, contextually, before or at the moment
they're relevant. Marie never has to guess what's allowed. She finds a "Contact Support"
link on the platform site, submits a short form with her club name and the issue. Within
24 hours she receives a direct reply from the founder. Resolved.

**Edge case — operator requests changes on a live club:** Six months in, the operator
notices Marie's club description has become outdated — it still references last season's
schedule. The operator sends a message through the platform: "Hi Marie, your schedule still
shows last season's times — could you update it?" Marie sees the message as a banner in her
admin dashboard and in her email. She updates the schedule field and saves. Done.

**This journey reveals requirements for:** application form with profile fields, operator
review with change request, admin dashboard with pre-populated profile, photo upload,
explicit save, public single-page club view, directory listing, inline constraint display,
operator message system, support contact form.

---

### Journey 2: Public Visitor — Finding an Activity (Happy Path + Edge Case)

**Thomas, 28. Recently moved to Lausanne from Zurich.**

Thomas wants to find a badminton club. He doesn't know anyone locally yet. He Googles
*"badminton club Lausanne"* and lands on the platform's search page — a clean, fast-loading
page within the dashboard shell, with a master-detail layout: filters and club list on the
left, club detail on the right. He filters by *Sport* and *Canton Vaud* using the sidebar
filters. He finds a badminton club, clicks it to see the detail panel, browses the schedule,
finds a training session on Thursday evenings. He clicks through to the full club profile
page and sends a message through the contact form: *"I'm looking to join. What's the
process?"*

Back on the search page, he notices four other clubs he didn't know existed — including a
volleyball club 10 minutes from his apartment. He bookmarks two.

**Edge case:** Thomas is looking for a music ensemble — something informal, not a
conservatory. He filters by *Music*. Only two results in his region, neither quite what he
wanted. He finds one anyway, visits their profile, checks the About section and the calendar.
He sends a message asking if they accept beginners. The club president replies within a day.
He shows up the following Saturday.

**This journey reveals requirements for:** public site browsability (no account), contact
form, search page with country, activity type, and location filters (master-detail layout),
responsive mobile experience, SEO/searchability of the platform search page itself.

---

### Journey 3: Club Applicant — Application and Acceptance (+ Rejection Edge Case)

**Ahmed, 35. Newly elected secretary of a cultural association in Bern.**

Ahmed's association was founded 8 years ago. They organize concerts, language exchanges, and
community dinners for a diaspora community in Bern. They have no website. Their only online
presence is a Facebook page updated sporadically.

Ahmed discovers the platform through a friend's recommendation. He reads the philosophy. He
opens the Apply page. The form asks for: association name, activity type, a description of
what the association does, their schedule or availability ("concerts monthly, language
exchange every Wednesday 18h-20h"), how to join ("come to any Wednesday session or email us"),
and contact details (email, phone, address). He fills it all in. He submits.

Forty-eight hours later he receives an email. He's been accepted. The email contains a login
link. He clicks it, arrives at his admin dashboard. Everything he typed in the application is
already there. He uploads a few photos — one of a concert night, one of the language exchange
group. He hits save, publishes the page, and shares the link on the Facebook group. By the
end of the day, the association has a public presence for the first time in 8 years.

**Edge case — rejection:** A user applies claiming to represent a "digital marketing
collective." The operator reviews the application — it doesn't fit the association niche.
A short email explains that the platform is specifically for clubs and groups focused on
social activities, and that this application doesn't match that profile.

**Edge case — change request during application:** An applicant submits a club with a
one-word description. The operator approves the club but includes a message in the approval
email: "Your description is very brief — could you add more about what activities you offer
and when?" The message also appears as a banner in the admin dashboard when the admin first
logs in.

**This journey reveals requirements for:** Apply page with profile fields (description,
schedule, contact, how to join), manual operator review queue, acceptance email with login
link and optional operator message, rejection email with explanation, operator message
system unified across application and post-live phases.

---

### Journey 3b: Club With Existing Website — Minimal Setup

**Léa, 40. Communications lead for a well-established running club in Geneva.**

Léa's club has had a website for years — maintained by a volunteer developer. It works fine.
But the club struggles with discoverability: new residents in Geneva don't know they exist
unless someone tells them.

Léa discovers the platform through a colleague whose hiking club is listed. She applies,
providing the club name, activity type, description, schedule, how to join, contact details,
and their existing website URL. Two days later, the club is accepted.

Léa logs in. Her profile is already filled in from the application. She uploads a few photos
of training sessions. She publishes. Her club page shows all the essentials plus a prominent
link to their main website. Done in 10 minutes.

Three months later, the club president mentions that two new members found them through the
platform directory. Léa hasn't thought about the platform since she set it up. It just works.

**This journey reveals requirements for:** application form with profile fields including
existing website URL, external website link on club page, same single-page profile for all
clubs regardless of whether they have an existing website.

---

### Journey 4: Platform Operator — Daily Operations

**The founder. Managing the platform.**

It's a Tuesday morning. The operator logs into the platform admin dashboard.

There's one new application — a brass band association from canton Fribourg. The operator
reads the submitted profile — name, description, schedule, contact details, how to join. The
content is thorough and well-written. One click: approved. The club's URL path is provisioned
automatically. An acceptance email goes out.

Another application — a yoga group in Basel. The description is just "yoga classes." The
operator approves but includes a message: "Could you add more detail about your schedule,
location, and what makes your group unique? This helps visitors decide to join." The message
goes in the approval email and will appear as a banner in the admin's dashboard.

The operator scans the metrics panel: 24 clubs now live. Platform uptime: 100% for the last
30 days. Storage usage is well within bounds.

One issue: a club in Geneva has updated their description with promotional content for a
commercial service — this doesn't fit the platform's purpose. The operator sends a message
requesting changes and forces the club page offline until the content is fixed. The club
admin cannot republish until the operator lifts the override.

The support queue has one ticket: a club admin asking how to update their profile photos.
The operator replies directly. The low ticket volume confirms the interface is working as
intended.

The operator closes the tab and goes back to building the next feature.

**This journey reveals requirements for:** platform admin dashboard (application queue with
profile content review, approval/rejection, metrics), automated URL path provisioning on
approval, acceptance/rejection emails, unified operator message system (bidirectional threaded
messaging), club page visibility control (admin publish + operator force-offline override),
support messaging.

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

### Funding Model

The platform is free for all clubs. Funding comes from voluntary donations and civic grants.
A donation/support page is part of the MVP platform site. No payment processing for club
fees is required. A paid storage tier for high-usage clubs may be considered post-MVP if
infrastructure costs warrant it.

### Risk Mitigations

| Risk | Mitigation |
|---|---|
| Club uploads personally identifiable content (member photos, etc.) | Privacy policy places responsibility on Club Admins for content they publish; platform provides the tools, not the editorial judgment |
| Ineligible applicant slips through self-declaration | Manual operator review is the filter; rejection email process already defined |
| Sub-processor non-compliance | DPAs required before any sub-processor handles platform data |
| Donation funding insufficient | Minimal infrastructure costs; civic grants supplement donations; paid storage tier considered as future option |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. The Directory-First Model for Club Discovery**
Existing platforms that connect people to activities are event-centric (Meetup, Eventbrite)
or marketplace-driven. This platform is club-centric and permanent: it indexes durable social
groups, not ephemeral events. The directory is the product — not a side feature of a website
builder. A club listed today is still discoverable next year. No comparable product occupies
this positioning for clubs and social activity groups.

**2. Inclusive Presence — Clubs With or Without Websites**
The platform welcomes all clubs equally with the same capabilities. Clubs without a website
use the full feature set. Clubs with an existing website can add an external link and use as
much or as little as they want. Every club has the same site, the same discoverability, the
same weight in search. This removes the biggest barrier to directory completeness: clubs that
already have a site have no reason to stay away.

**3. Platform SEO as the Acquisition Engine**
The platform's acquisition strategy is the directory itself. Every club profile is an
indexed, searchable page. The directory is the homepage. There is no marketing budget, no ad
spend — growth is a byproduct of directory density and platform SEO. The more clubs listed,
the more discoverable every club becomes.

**4. Free for All, Donation-Funded**
The platform is free for every club — no tiers, no upsells, no annual fee. Funding comes
from voluntary donations and civic grants. This removes all friction from onboarding and
signals that the platform exists to serve communities, not to extract revenue from them. This
is essentially unheard of in the category and functions as a trust signal and values statement
simultaneously.

**5. Silent Infrastructure Improvement as Core Promise**
For clubs using full hosted sites: the platform promises silent improvement over time.
Template versioning with zero-downtime migration means clubs simply find their sites have
improved. The *absence of user obligation* is the feature.

**6. Civic Infrastructure Framing, Not SaaS Framing**
The product deliberately rejects SaaS mental models — growth metrics, engagement
optimization, retention hacks — in favor of civic infrastructure positioning: the Yellow
Pages for social activities. Stable, essential, invisible, community-serving. This shapes
every product and business decision in a coherent and genuinely differentiated way.

### Market Context & Competitive Landscape

Event platforms (Meetup, Eventbrite) focus on ephemeral events and charge organizers or
attendees. Website builders (Wix, Squarespace, WordPress) target users who want control and
enjoy customization. Social networks (Facebook Groups) optimize for engagement, not
discoverability. None of these serve the specific need: a permanent, searchable, club-centric
directory where anyone can find "what can I join near me?"

No direct competitor occupies this positioning. The closest analogues are regional sports
federation portals, but none combine: free access, philosophy-driven curation, inclusive
presence (with or without website), and directory-as-product.

### Validation Approach

- **Month 1 validation:** 10 clubs onboarded from personal network (including clubs with
  existing websites). Key signals: setup time, support ticket volume, first contact form
  submissions received by clubs, external link usage rate
- **Directory SEO validation:** Track how visitors arrive at the platform — if organic search
  drives directory visits without any outreach, the acquisition model is validated
- **Inclusivity validation:** Track whether clubs with existing websites join willingly — if
  they do, the inclusive model is working
- **Invisibility validation:** If club admins stop thinking about their platform presence
  within 30 days of launch, the promise is working

### Risk Mitigation

| Innovation Risk | Mitigation |
|---|---|
| Clubs with existing websites see no value in joining | Directory discoverability is the value proposition — validated by tracking new member referrals from platform |
| Directory too sparse to be useful at launch | Personal network launch builds critical mass for directory density; density accelerates organic discovery |
| Donation model insufficient for sustainability | Minimal infrastructure costs; civic grants supplement donations; paid tier for high-storage clubs considered as future option |
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
| Club profile page (single page) | Server-rendered (MPA) | SEO-critical — contains name, description, photos, schedule, contact, structured data |
| Club site — inner pages (navbar tabs) | ~~Deferred to post-MVP~~ SPA-style | Client-side navigation for multi-page sites (post-MVP) |
| Club admin dashboard | SPA-style | Within unified dashboard shell — AppSidebar shows club admin sections based on ClubMembership |
| Platform site (search, apply, home, about, support) | Server-rendered (MPA) | SEO-critical — search page is the primary product surface, must be indexed; all pages render within the unified dashboard shell |
| Platform admin dashboard | SPA-style | Within unified dashboard shell — AppSidebar shows operator sections based on OPERATOR role |

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

- Club home pages: server-rendered with full meta tags, Open Graph, JSON-LD
  structured data, included in platform-level sitemap
- Club inner pages: accessible via direct URL, crawlable
- Platform directory: server-rendered, each club entry with structured data, filterable
  without JS — primary SEO surface for the platform
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
this?" but "does the directory model work in practice?" Ten clubs from the personal network
— including clubs with existing websites — interact with the product as real users. If
non-technical admins set up their site without help and stop thinking about it within
weeks, the product proves itself. No timeline pressure, no resource constraints — quality and
correctness over speed.

**Build Order:** Database schema is the single prerequisite (unblocks all parallel work).
Club webapp and platform site are built in parallel thereafter — they share the same
database.

**Single-Page Profile:** MVP club presence is a single, fixed-layout page — not a multi-page
site. The underlying architecture (Page model, content storage) supports future expansion to
multi-page sites, but the application layer enforces a single profile page for MVP.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Club Admin — apply with profile content, complete account setup, upload photos, publish
- Public Visitor — discovery via platform directory and single-page club profile
- Club Applicant — application with profile fields (description, schedule, contact, how to
  join), manual review with optional change request, acceptance/rejection
- Platform Operator — dashboard, application queue with content review, club moderation
  (message, force offline), support queue

**Must-Have Capabilities:**

*Club Profile (single page):*
- Fixed-layout single page: club name, logo, description, photo carousel (5-10 images,
  auto-scrolling, pause on hover), schedule/availability (free text), contact info (email,
  phone, address, optional website link), "how to join" (free text)
- Server-rendered for SEO (meta tags, Open Graph, JSON-LD, structured data)
- Platform attribution link in footer
- Full mobile/desktop parity

*Application Form:*
- Collects club profile fields directly: name, activity type, description, schedule, contact
  info, how to join, optional existing website URL
- No photo upload at application time (prevents storage abuse — photos added after approval)
- Application content seeds the club profile — no duplicate data entry after approval

*Club Admin Dashboard:*
- Unified dashboard shell (AppSidebar + content area) — club admin sections appear in the sidebar when user has club memberships
- AppSidebar shows clubs under MY CLUBS section with collapsible sub-items: Profile, Settings, Messages
- Club admin routes at `/{lang}/club/{clubId}/` (no country/slug needed in URL)
- Club profile edit form: all profile fields pre-populated from application, plus photo
  upload (5-10 images via presigned URL to R2/MinIO)
- Explicit save with unsaved-changes protection (amber dot, beforeunload guard, discard
  confirmation)
- Publish/unpublish toggle: club page offline by default after approval, admin publishes
  when ready
- Messages: threaded bidirectional messaging with platform operator
- Inline constraint display (file size, format, field length)
- Login at `/{lang}/auth/login` within the dashboard shell
- WCAG 2.1 AA accessibility (best-effort AAA)

*Club Page Visibility:*
- Two-flag system: admin `isPublished` (admin-controlled) + operator `forceOffline` override
- Page visible only when `isPublished = true` AND `forceOffline = false`
- Operator force-offline locks admin out of publishing until operator lifts override
- Club page offline by default after approval

*Platform Site:*
- Home (philosophy + apply CTA), Search page (master-detail, filterable by country, activity type, and
  location — replaces standalone country directory), Apply, About, Support/Donate
- All pages server-rendered for SEO
- Directory is the primary product surface — the homepage

*Platform Admin Dashboard:*
- Sections within the unified AppSidebar (not a separate app) — visible based on OPERATOR role
- Application queue: review submitted profile content, approve/reject
- Approve with optional operator message (bundled in approval email + stored in DB)
- Club moderation: send operator message, request changes, force club page offline/online
- Threaded messaging: bidirectional conversations with club admins (not just one-way operator messages)
- Club management (metrics, storage)
- Configurable platform variables
- Support ticket inbox

*Platform-wide:*
- Automatic SEO on all club pages (meta tags, Open Graph, JSON-LD, sitemap)
- GDPR/nDSG dual compliance, cookie consent, DPAs with sub-processors
- Data export right available to every club
- Template versioning with silent zero-downtime migration
- Hosting on Swiss or EU infrastructure

### Post-MVP Features (Phase 2 — Growth)

- Multi-page club site builder: page management, custom pages, sub-pages, navigation
  configuration (architecture already supports this — MVP enforces single page)
- Content element library: rich text, calendar/events, image/video gallery, documents library
- Contact page with composable sub-blocks (form + reply-to email relay, map, phone, email)
- Per-club accent color picker (8 curated presets)
- Version history and content restore
- Custom domain support for hosted club sites
- Role-based multi-user access per club
- Member management
- Federation / umbrella organization partnerships
- Community roadmap page (block requests, feature visibility)
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
| Clubs with existing websites see no value in joining | Directory discoverability is the value proposition — same capabilities, minimal effort to set up |
| Directory too sparse to be useful at launch | Personal network launch builds directory density; density accelerates organic discovery |
| ~~Deferred~~ Contact form or email relay failure | Robust email relay with delivery monitoring; operator alerts on failure (post-MVP) |
| Silent template migration breaks club content | Schema designed for content preservation from day one |
| Single-page profile too limiting for some clubs | Architecture supports multi-page expansion post-MVP; single page validates the core directory model first |
| Donation model insufficient for sustainability | Minimal infrastructure costs; civic grants supplement donations; paid storage tier considered as future option |

## Functional Requirements

### Club Profile & Admin Dashboard

- **FR1:** Club Admin can configure their club's profile: name, logo, description, schedule/availability (free text), contact info (email, phone, address), "how to join" (free text), optional external website link
- **FR2:** Club Admin can access a dedicated admin dashboard to manage their club profile, with a link to preview the public page
- **FR3:** ~~Deferred to post-MVP~~ Club Admin can activate and deactivate optional pages in their site's navigation
- **FR4:** ~~Deferred to post-MVP~~ Club Admin can create custom pages with user-defined navigation labels
- **FR5:** ~~Deferred to post-MVP~~ Club Admin can configure one level of sub-pages within their site's navigation
- **FR6:** ~~Deferred to post-MVP~~ System prevents Club Admin from removing anchor pages (Home and Contact)
- **FR7:** ~~Deferred to post-MVP~~ System enforces a configurable maximum page count per club site
- **FR8:** ~~Deferred to post-MVP~~ Club Admin can set up and manage a custom domain for their site
- **FR9:** System provisions a URL path for each approved club immediately upon acceptance (path-based routing, not subdomains)
- **FR47:** Club Admin can configure an external website link on their club profile that directs visitors to the club's own website
- **FR48:** Club Admin can upload 5-10 photos displayed as an auto-scrolling carousel on the public club page (pause on hover); photos uploaded via presigned URL to object storage
- **FR49:** Club Admin can publish or unpublish their club page (offline by default after approval)

### Club Page Visibility & Moderation

- **FR51:** System uses a two-flag visibility model: admin-controlled `isPublished` and operator-controlled `forceOffline`; club page is visible only when `isPublished = true` AND `forceOffline = false`
- **FR52:** Platform Operator can force a club page offline; when forced offline, the Club Admin cannot republish until the operator lifts the override
- **FR53:** Platform Operator can lift a force-offline override, restoring the Club Admin's ability to publish
- **FR54:** Platform Operator can send an operator message to any club (free text); messages are stored in the database and sent via email
- **FR55:** Operator messages appear as a persistent banner in the Club Admin dashboard until read/acknowledged
- **FR56:** Operator messages use a single unified model regardless of context (application review or post-live moderation)
- **FR57:** When approving an application with an operator message, the message is bundled into the approval email (not sent as a separate email)

### Content Editing & Element Library

- **FR10:** ~~Deferred to post-MVP~~ Club Admin can add, configure, and remove elements on custom pages using a visual element picker
- **FR11:** ~~Deferred to post-MVP~~ Club Admin can configure Contact page sub-blocks (contact form, map, phone number, email address, predefined message subjects) independently
- **FR12:** ~~Deferred to post-MVP~~ Club Admin can create, edit, and delete calendar events on a Calendar page
- **FR13:** ~~Deferred to post-MVP~~ Club Admin can upload and manage images and videos in a Gallery page
- **FR14:** ~~Deferred to post-MVP~~ Club Admin can upload and manage documents and PDFs in a Documents library page
- **FR15:** ~~Deferred to post-MVP~~ Club Admin can add and edit rich text content on custom pages
- **FR16:** ~~Deferred to post-MVP~~ Club Admin can add and edit inline images on custom pages
- **FR17:** Club Admin can explicitly save changes to their club profile
- **FR18:** ~~Deferred to post-MVP~~ Club Admin can view their site's version history and restore a previous version
- **FR19:** System displays file constraints (size limits, accepted formats) inline at the point of upload

### Public Discovery & Contact

- **FR20:** Public Visitor can browse a directory of all member associations on the platform site
- **FR21:** Public Visitor can filter the directory by country, activity type, and location
- **FR22:** Public Visitor can view any club's public page without authentication
- **FR23:** ~~Deferred to post-MVP~~ Public Visitor can submit a contact message through a club's contact form
- **FR24:** ~~Deferred to post-MVP~~ System delivers contact form submissions to the club's registered email address with reply-to set to the sender's address
- **FR25:** Public Visitor can navigate from any club page to the platform search page via the sidebar
- **FR26:** System displays a platform attribution link in the footer of every club page

### Application & Access

- **FR27:** Club Applicant can submit an application providing association name, activity type, description, schedule/availability, contact info (email, phone, address), "how to join" instructions, and optionally their existing website URL — these fields seed the club profile upon approval (no photo upload at application time)
- **FR28:** Club Admin can authenticate and access their site's edit mode via the platform site login
- **FR29:** Platform Operator can authenticate via a dedicated platform-level admin interface separate from club sites
- **FR30:** Club Admin can submit a support request to the platform team from the platform site

### Platform Operations

- **FR31:** Platform Operator can view and manage a queue of pending club applications
- **FR32:** Platform Operator can approve an application with an optional operator message (bundled in acceptance email), triggering automatic URL path provisioning
- **FR33:** Platform Operator can reject an application with an explanatory email to the applicant
- **FR34:** Platform Operator can view platform-wide metrics (clubs live, uptime, performance scores, storage)
- **FR35:** Platform Operator can monitor site health status across all hosted club sites
- **FR36:** Platform Operator can send an operator message to any club admin (see FR54-FR57 for unified message system)
- **FR37:** Platform Operator can view and respond to club admin support requests (implemented as threaded bidirectional messaging via SupportMessage model + ChatThread component, not a simple ticket inbox)
- **FR38:** Platform Operator can configure platform-wide operational variables including the per-club page limit
- **FR39:** System applies template version updates to all club sites automatically without downtime or any action required from club admins

### Compliance & Data Rights

- **FR40:** Club Admin can export all their club's content data in a portable standard format
- **FR41:** Club Admin can request deletion of their club's data from the platform
- **FR42:** System presents a cookie consent mechanism to users on the platform site and on club sites where applicable
- **FR43:** System automatically generates and maintains SEO metadata for all club site pages without requiring any admin configuration
- **FR44:** ~~Deferred to post-MVP~~ Club Admin can view stored contact form submissions received for their site
- **FR45:** Platform Operator can view detailed per-club analytics (traffic, page views, edit events, login events)
- **FR46:** ~~Deferred to post-MVP~~ Club Admin can select an accent color for their club site from a curated palette of 8 presets (Zinc, Blue, Green, Red, Violet, Orange, Rose, Yellow)

### Platform Funding

- **FR50:** Public Visitor can access a donation/support page on the platform site to contribute to the platform's funding through voluntary donations

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
- ~~Deferred to post-MVP~~ Email relay delivery is monitored; failures trigger an operator alert within 15 minutes of failure detection
- ~~Deferred to post-MVP~~ Version history restore completes within 30 seconds of a Club Admin initiating a rollback

### Scalability

- Architecture supports growth from ~10 clubs (Swiss personal network) to 50,000 clubs (worldwide scale) without re-architecture
- Directory page loads in < 3 seconds with 10,000 listed clubs as measured by synthetic monitoring
- Hosting infrastructure scales to handle 10x current load through horizontal capacity addition without service interruption
- Multi-tenant data model isolates clubs at the storage layer — no club experiences > 10% performance degradation due to another club's activity

### Accessibility

- WCAG 2.1 AA compliance is the binding requirement for all public-facing surfaces and the admin/edit interface
- Best-effort WCAG AAA applied where practically achievable (enhanced contrast ratios, no time limits, fully descriptive labels)
- All interactive elements operable via keyboard alone
- All dynamic content compatible with screen readers (ARIA roles and labels on all interactive components)

### Maintainability

- Template versioning system supports silent migration of all club sites without any manual operator or admin intervention
- Platform color scheme updatable via a single token variable change — no component-level edits required
- All platform-wide configurable variables adjustable via the admin dashboard without a code deployment
