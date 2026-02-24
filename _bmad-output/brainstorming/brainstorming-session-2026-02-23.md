---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Website builder platform for associations (ski clubs, sports clubs, music clubs)'
session_goals: 'Explore all dimensions: product features, business model, branding/positioning, technical architecture'
selected_approach: 'progressive-flow'
techniques_used: ['What If Scenarios', 'Mind Mapping', 'SCAMPER Method', 'Decision Tree Mapping']
ideas_generated: []
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** Clashware
**Date:** 2026-02-23

## Session Overview

**Topic:** Website builder platform for associations (ski clubs, sports clubs, music clubs)
**Goals:** Explore all dimensions — Product · Business · Branding · Technical

### Session Setup

A radically simple website builder targeting non-profit associations (ski clubs, sports clubs, music clubs) whose websites are either nonexistent or outdated. Core philosophy: uniform structure and style across all sites, customizable content only. Associations should spend their resources on their activity, not on their online presence. Very affordable pricing. Intuitive in-page admin editing.

## Technique Selection

**Approach:** Progressive Technique Flow
**Journey Design:** Systematic development from exploration to action

**Progressive Techniques:**

- **Phase 1 - Exploration:** What If Scenarios — maximum idea generation without constraints
- **Phase 2 - Pattern Recognition:** Mind Mapping — organizing insights into meaningful clusters
- **Phase 3 - Development:** SCAMPER Method — systematic product refinement through 7 lenses
- **Phase 4 - Action Planning:** Decision Tree Mapping — concrete implementation pathways

---

## Phase 1: Expansive Exploration — What If Scenarios

**[Product #1]: The Form/Content Separation Contract**
_Concept_: The platform owns the "form" permanently — infrastructure, design language, tech stack, visual trends, security — while the association owns only the "content." This is a philosophical contract, not just a UX choice.
_Novelty_: Most website builders sell control as a feature. This platform sells the abdication of control as liberation.

**[Product #2]: The Three-Layer Control Model**
_Concept_: Style is fully locked (platform's domain), structure is flexible (users add/remove pages and arrange components), content is free (users own everything inside the components).
_Novelty_: Most builders lock content into templates but let users break the style. This inverts that — style is sacred, structure is a user choice.

**[Product #3]: Opt-In Page Architecture**
_Concept_: Every club starts with core pages (Home, Contact). Additional pages — History, Gallery, Team, Partners — are opt-in modules a club can activate and populate, or leave dormant. Dormant pages simply don't exist in navigation.
_Novelty_: The site never looks "unfinished" because dormant pages simply disappear. No empty pages, no "coming soon."

**[Business #4]: The Anti-SaaS Pricing Model**
_Concept_: A fixed annual fee ≤ $100, never tiered, never upsold. Price may decrease as margins improve. Sustainability funded by voluntary supporters who believe in the philosophy.
_Novelty_: Pricing that goes down over time is almost radical. The pricing is itself a statement of values.

**[Business #5]: Curated Onboarding as a Trust Signal**
_Concept_: Manual acceptance of new associations in early phases — not a waitlist for demand management, but genuine curation for value alignment. You're not just a customer, you're accepted into a community.
_Novelty_: Scarcity and curation here serve authenticity and mission integrity, not exclusivity or prestige.

**[Branding #6]: Digital Minimalism as Brand DNA**
_Concept_: The platform explicitly aligns with Cal Newport's philosophy — real-world activities over screen time. A digital tool that argues against spending time on digital tools. "We built this so you don't have to think about it."
_Novelty_: Most tech companies want you addicted to their product. This one wants you to forget it exists.

**[Marketing #7]: Word-of-Mouth as the Only Channel**
_Concept_: No ads, no SEO content machine, no social media presence. Growth comes exclusively from association members telling other association members.
_Novelty_: The marketing strategy is itself an expression of digital minimalism. A platform fighting screen addiction refuses to buy attention on screens.

**[Marketing #8]: The Public Directory as the Homepage**
_Concept_: The platform's main public-facing page is the directory of all member associations. New visitors discover the platform by finding a member club's site, clicking "Powered by [Platform]", and landing on a living community map.
_Novelty_: The directory isn't a feature — it is the marketing. Associations are the proof, the community, and the acquisition engine simultaneously.

**[Process #9]: Deferred Technical Architecture**
_Concept_: Website generation model, propagation strategy, and infrastructure decisions reserved for a dedicated architectural session. The philosophical goal is clear; the technical means are TBD.

**[Product #10]: Single-Account v1 Model**
_Concept_: One admin account per association for v1, shared informally among members as needed. Role-based access explicitly deferred to v2.
_Novelty_: Trusts associations to self-organize internally rather than imposing a permissions model on organizations that don't think in those terms.

**[Product #11]: Edit-Mode Toggle with Visual Block Indicators**
_Concept_: A dedicated admin view mode. In this mode, each editable block displays a visual edit trigger on interaction — card-style affordance, clearly distinct from the public view.
_Novelty_: Keeps the public site experience pure; admin mode feels intentional and structured — matching how non-technical users think about "managing" something.

**[Platform #12]: The Directory Lives on the Project's Own Website**
_Concept_: The main project site is a separate entity — it carries the philosophy, the directory, and the project's identity. Club sites are the product; the project site is the community hub.

**[Technical #13]: Platform-Level i18n, Content-Level Multilingual Blocks**
_Concept_: Two distinct layers of language support. Platform UI is fully internationalizable. For club content, multilingual is opt-in per block — each content block has a slot per language the club declares.
_Novelty_: Clean separation prevents over-engineering early while making international expansion a configuration change, not a rewrite.

**[Product #14]: Two-Tier Element Model**
_Concept_: Static elements (name, logo, welcome text) are fixed in position on the homepage — content-editable but not movable. Dynamic blocks are addable, removable, and reorderable on custom pages.
_Novelty_: Protects structural coherence without restricting content freedom.

**[Product #15]: Always-Present Anchor Pages**
_Concept_: Home and Contact are permanent, non-removable pages. Contact is composed of activatable sub-blocks (map, contact form, phone, email). All other pages are optional via a customizable navbar.
_Novelty_: Every club site, however minimal, is always reachable and contactable.

**[Product #16]: Block Library for Custom Pages**
_Concept_: Custom pages are blank canvases within the platform's structure, populated by a library of typed blocks — calendar, image/video, document/PDF, rich text, and more. Edit mode uses card-style visual affordances.

**[Product #17]: Contact Form Reply-To Chain**
_Concept_: Contact form submissions forwarded to the club's registered email. Reply-to header set to the submitter's email so the club replies directly without any intermediary.
_Novelty_: Eliminates a common pain point — clubs having to copy-paste email addresses from notifications.

**[Product #18]: Login-Gated Edit Mode**
_Concept_: Login entry point visible on the main platform site. Authenticated admins taken directly to their club's website in edit mode. Admin panel exists within the website's own URL space, clearly marked as non-public.
_Novelty_: The website and its editor are the same surface — no mental context switch.

**[Platform #19]: Community Roadmap on Main Site**
_Concept_: A dedicated page on the platform's main website where member clubs submit block requests, propose features, and see what's in development. Transparent, community-driven, lightweight.

**[Product #20]: Deferred Admission Criteria**
_Concept_: Acceptance criteria remain deliberately broad ("association," "club," similar entities). Keeps it open to discover adjacent use cases and avoid premature exclusion.

**[Technical #21]: Color-Agnostic Architecture from Day One**
_Concept_: V1 ships with a single color scheme. Codebase engineered from the start with primary and secondary color tokens as variables — future per-club theming is a configuration change, not a refactor.
_Novelty_: Technical preparation without product complexity.

**[Platform #22]: Mandatory Footer Attribution**
_Concept_: Every club site carries a "Powered by [Platform]" link in the footer, always visible, non-removable. Primary organic discovery mechanism and community belonging signal.

**[Product #23]: Subdomain as a Domain Fallback**
_Concept_: Clubs without a domain or unwilling to deal with DNS setup can use a platform subdomain (e.g., clubname.platform.com). Custom domain remains recommended; subdomain removes last onboarding blocker.

**[Product #24]: Calendar Sub-Pages (deferred)**
_Concept_: Each calendar event links to a generated sub-page with full event details. Detail design deferred until calendar block is designed in full.

**[Product #25]: Fully Responsive Platform**
_Concept_: All features available on both desktop and mobile with equal priority. Admin mode fully functional on mobile — reflecting how non-technical volunteers actually work.

**[Legal #26]: GDPR Compliance + Data Export Right**
_Concept_: Full GDPR compliance as a non-negotiable requirement. Clubs can export all their content at any time in a standard format. No lock-in.
_Novelty_: Philosophically consistent — the platform serves clubs, not traps them.

**[Product #27]: Member Join Form via Contact Subjects**
_Concept_: Predefined contact form subjects (Admission / Question / Other) allow the contact block to handle membership enquiries. No separate member management system needed in v1.

**[Platform #28]: Template Versioning with Silent Migration**
_Concept_: When a new template version is released, clubs are migrated automatically. Content preserved; form improves. Clubs may be notified but never need to act.
_Novelty_: The platform absorbs all upgrade cost and complexity. Club sites simply get better over time.

**[Platform #29]: The Main Platform Site as a Minimal 5-Pager**
_Concept_: Home (philosophy + apply CTA), Directory, Apply, About, Support (donate + roadmap). Nothing more. The product's restraint is demonstrated by the platform's own restraint.

**[Business #30]: Grants, Subsidies + Easy Donation**
_Concept_: Beyond voluntary donations, the platform may be eligible for civic/digital inclusion grants. Donation mechanism built into the platform site. Could fully cover infrastructure costs and make the annual fee symbolic.
_Novelty_: Reframes the platform as civic infrastructure, not a SaaS product.

---

## Phase 2: Pattern Recognition — Mind Map

**Central Node: Association Website Builder Platform**

### PHILOSOPHY (Bedrock)
- Form/Content Separation — platform owns style, clubs own content
- Digital Minimalism — Cal Newport alignment; less screen time, more real life
- Invisible Infrastructure — SSL, updates, SEO, design evolution: silent, automatic
- Ethical Pricing — not for profit, ≤ $100/year, may decrease, donation-supported
- Curated Community — manual acceptance, broad eligibility

### PRODUCT — Website Structure
- Static Elements (homepage): club name, logo, welcome text
- Anchor Pages (non-removable): Home, Contact
  - Contact sub-blocks: form (reply-to), map, phone, email, predefined subjects
- Custom Pages: block canvas via customizable navbar
  - Block library: calendar, rich text, image/video, document/PDF, gallery, partners

### PRODUCT — Admin Experience
- Login entry point on main platform site
- Edit mode toggled on club's own website
- Card-style visual block affordances on click
- Single admin account (v1)
- Fully responsive (desktop + mobile parity)
- Admin-only pages clearly flagged as non-public

### PLATFORM — Technical Layer
- Fully responsive
- Automatic SEO (meta tags, structured data, sitemap)
- GDPR compliance + data export right
- Template versioning (silent migration)
- Platform UI i18n (switchable language)
- Multilingual content (per-block language slots)
- Color token architecture (single scheme v1, themeable later)
- Domain options: custom domain + platform subdomain fallback

### BUSINESS MODEL
- Fixed annual fee ≤ $100 (may decrease)
- Free first year (acquisition)
- Voluntary donations + easy donation on platform site
- Grants & subsidies (civic/digital inclusion)
- Manual curated acceptance
- Bottom-up growth: individual clubs first

### GROWTH & COMMUNITY
- "Powered by [Platform]" — mandatory footer link
- Public directory — primary marketing surface on platform site
- Word of mouth — the only intentional channel
- Community roadmap — block requests, publicly visible

### PLATFORM SITE (lower priority — after web app)
- Home: philosophy + apply CTA
- Directory: all member clubs
- Apply: application form
- About: who built this and why
- Support: donate + community roadmap

### V2 BACKLOG
- Role-based multi-user access
- Member management
- Per-club color theme picker
- Calendar sub-page detail design
- Federation/umbrella organization partnerships
- Annual "State of Associations" report
- Manifesto / public charter

### KEY PATTERNS
1. Everything traces back to the philosophy — no decorative decisions
2. Platform site and club sites are two distinct products with different priorities
3. V1 is remarkably focused — good ideas cleanly deferred without loss
4. "Powered by" footer + public directory form a self-reinforcing discovery loop

---

## Phase 3: Idea Development — SCAMPER

**[SCAMPER-S #31]: "Element" as the Universal Term**
_Concept_: "Block" replaced by "Element" throughout. Addition via a "+" icon opening an element picker. More natural, less technical, more action-oriented.
_Novelty_: Terminology that feels like assembling something physical, not configuring software.

**[SCAMPER-S #32]: Two-Class Element System**
_Concept_: Elements split into two categories:
- **Page-level elements** (dedicated pages only): Calendar, Image/Video Gallery, Documents library — each gets its own page
- **Building elements** (composable within any page): Rich text, inline image, inline video, section title, etc.
V1 enforces strict placement. Architecture supports relaxing this constraint later.
_Novelty_: Strictness in v1 enforces visual coherence across all club sites. Every calendar looks like a calendar page, everywhere.

**[SCAMPER-C #33]: Navbar Auto-Generated from Pages**
_Concept_: Navbar is automatically built from created pages. Custom pages have user-defined navbar labels. Standard page-level elements (Calendar, Gallery, etc.) keep platform-defined names uniformly across all sites.

**[SCAMPER-C #34]: One-Level Sub-Page Support**
_Concept_: The navbar supports one level of sub-pages (e.g., /teams/junior, /teams/senior). Enough structural depth for real association needs without introducing complexity.
_Novelty_: One level is the right constraint — two levels would invite over-engineering; zero levels would frustrate clubs with multiple sections.

**[SCAMPER-C #35]: Distinct Platform Pages, Linked by Reference**
_Concept_: Apply, Support/Donate, and Roadmap remain separate pages. They reference each other via links — loose coupling, not merged surfaces.

**[SCAMPER-A #36]: Open-Source Template (Conditional — post-v1)**
_Concept_: Subject to security review, the club website template may be published as open-source after v1. Transparency as a value. Deferred, not excluded.
_Novelty_: Open-sourcing it would be a radical act of trust that reinforces every philosophical claim the platform makes.

**[SCAMPER-A #37]: Full Public Transparency on Members and Donors**
_Concept_: All member associations and donors listed openly on the platform site. Finance publishing deferred but not excluded. Transparency is the default posture.
_Novelty_: Joining or donating is a visible public statement of values.

**[SCAMPER-A #38]: Lightweight Niche-Fit Application**
_Concept_: The application process verifies only that the applicant is a genuine association/club matching the niche. No interrogation — just enough signal to confirm eligibility and prevent misuse.

**[SCAMPER-A #39]: Informal Roadmap as Lightweight Governance**
_Concept_: The roadmap/discussion section serves cooperative governance without building a voting system. Community signals emerge organically from requests and discussion visibility.

**[SCAMPER-M #40]: Page Count as a Configurable Constraint**
_Concept_: A maximum page limit per club site is built into the code from v1. Exact limit TBD — but the mechanism exists. Technically trivial, philosophically meaningful.

**[SCAMPER-M #41]: Two-Level Admin Architecture**
_Concept_: Two completely separate admin systems:
- **Club-level admin**: Login built into each club's own webapp. Edit mode lives on the club's site.
- **Platform-level admin**: Login on the platform site, for the project team only. Dashboard with visibility across all hosted sites — metrics, storage, health.
_Novelty_: Clean separation of concerns. Clubs never see platform internals; the platform team has full operational visibility.

**[SCAMPER-M #42]: Open-Source as Future Option**
_Concept_: Open-sourcing deferred to post-v1. Security implications need assessment first. Not ruled out.

**[SCAMPER-P #43]: Filterable Directory by Activity Type**
_Concept_: The platform directory lists all associations sortable and filterable by basic category (sport, music, culture, etc.).
_Novelty_: Turns the directory into a genuinely useful civic resource — a navigable map of community life.

**[SCAMPER-P #44]: Public Platform Metrics on Project Site**
_Concept_: Aggregated, anonymized metrics from the platform admin dashboard surfaced publicly — number of clubs hosted, pages live, events listed, etc. Transparency without exposing private data.

**[SCAMPER-P #45]: Help-by-Discovery Approach**
_Concept_: Launch with minimal documentation (basic doc only). Observe first users, identify recurring struggles, add targeted help only where patterns emerge.
_Novelty_: Avoids over-engineering help for problems that may not exist, while staying genuinely responsive to real friction.

**[SCAMPER-E #46]: Defensive UX as Core Design Principle**
_Concept_: The editing interface is designed so destructive or irreversible actions are impossible by default — confirmations, constraints, and safe defaults throughout. Non-technical users never face technical error states.
_Novelty_: Error prevention over error recovery. The best error message is one that never appears.

**[SCAMPER-E #47]: Explicit Save with Version History**
_Concept_: Saving is an explicit, intentional action — not auto-save. The system retains N previous versions per site, enabling rollback. Draft states deferred to v2.
_Novelty_: Respects non-technical users' mental model of editing. Version history as a quiet safety net.

**[SCAMPER-R #48]: Proactive Personal Outreach for First Clubs**
_Concept_: The first clubs are personally contacted from the team's existing network. Local, trusted, hand-picked. Validates the product in the most controlled environment before any public exposure.
_Novelty_: The launch is a private act, not a public event. The platform earns credibility before claiming it.

**[SCAMPER-R #49]: The Badge as Community Achievement**
_Concept_: The "Powered by [Platform]" footer link reframed as an achievement marker — visible signal that this club was accepted into a curated community with values.
_Novelty_: Pride of belonging, not mandatory attribution. Changes the psychological relationship between club and badge.

**[SCAMPER-R #50]: Stealth MVP — Build First, Announce When Ready**
_Concept_: No public announcement, no project site, no waitlist until a working v1 exists with real clubs using it. The launch moment is defined by readiness and proof, not by a date.
_Novelty_: Counter to every startup instinct to announce early. The credibility of the philosophy demands the product prove itself first.

---

## Phase 4: Action Planning — Decision Tree Mapping

### Critical Path

```
[1] Define the template structure and DB schema in detail
    ↓ (required before any code — unblocks everything else)
    ├──────────────────────────────────────┐
[2] Build the club webapp                  [3] Build the project website + platform admin
    ├── Static elements (homepage)              ├── Directory (filterable by type)
    ├── Anchor pages (Home, Contact)            ├── Apply page
    ├── V1 element library (see below)          ├── About + Support/Donate
    ├── Navbar (auto-gen, 1-level sub-pages)    ├── Public metrics
    ├── Edit mode (card-style, explicit save,   └── Platform-level admin dashboard
    │   N-version history, defensive UX)            (metrics, storage, club management)
    ├── Club-level login (built into webapp)
    └── Subdomain provisioning (default)
    └──────────────────────────────────────┘
         ↓ (both complete, sharing same DB)
[4] Onboard first clubs (personal network, private)
    ├── Provision subdomain immediately after approval
    ├── Club builds site while custom domain migration runs in parallel
    └── Gather feedback → identify real friction
         ↓
[5] First users live → project website goes live → complete system operational
    └── Directory populated with real clubs from day one
```

### Resolved Decision Forks

**Fork A — Domain strategy:** Subdomain is the default post-approval. Club starts building immediately. Custom domain migration runs in parallel. No onboarding blocked by DNS.

**Fork B — V1 element set (minimum viable):**
- Page-level elements: Calendar, Image/Video Gallery, Documents library
- Building elements: Rich text, inline image

**Fork C — Platform admin dashboard:** Built in parallel with the project website, not deferred. Same build effort, shared timeline.

**Fork D — Build order:** DB schema is the single prerequisite. Club webapp and project website built in parallel thereafter — they share the same database. Architecture session needed to finalize schema design.

### Launch Readiness Definition
The system is ready to launch when:
- Club webapp is functional with v1 element set
- Project website is live with directory, apply page, and platform admin
- At least one real club is using the system on a subdomain
- First users onboarded → project website goes public → complete system is live

### Remaining Open Decisions (for later sessions)
- Technical architecture (DB schema, hosting, generation model) → dedicated session
- Exact page count limit per club
- Pricing — exact figure (≤ $100/year)
- Footer attribution wording
- Platform name and domain
- Color scheme design
- V1 element detail specs (especially Calendar block)
