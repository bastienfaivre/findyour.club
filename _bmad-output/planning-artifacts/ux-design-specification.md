---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
lastStep: 14
workflowStatus: complete
completedDate: 2026-02-26
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
---

# UX Design Specification website-template

**Author:** Clashware
**Date:** 2026-02-25

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

A hosted website builder for non-profit community associations — ski clubs, sports clubs, music clubs — built around a philosophical inversion: the platform owns style permanently, associations own content permanently. Associations set up their site once and stop thinking about it. The platform absorbs all design, infrastructure, and upgrade complexity, silently, forever. The measure of success is not engagement — it is people finding a club and showing up.

### Target Users

**Club Admin** — non-technical volunteer (often a club president or secretary, 40–60s). Time-poor. Sets up the site in one session, then makes infrequent content updates. Needs zero ambiguity, zero risk of breaking things, and zero ongoing maintenance obligation. Primarily desktop for initial setup; mobile must also work for edits.

**Public Visitor** — person searching for a local activity (often recently relocated or newly motivated). Mobile-first. Discovers clubs via search engines or the platform directory. Needs fast browsability, clear club information, and a frictionless contact path.

**Club Applicant** — association representative with no current web presence. Discovers the platform via a "Powered by" footer link. Needs a clear, minimal application form and a fast, human response.

**Platform Operator** — the founder. Manages the full club lifecycle (applications, health monitoring, support). Needs an efficient internal dashboard with low operational overhead.

### Key Design Challenges

1. **Edit mode / public view disambiguation**: The edit toggle lives on the club's own public site. The UX must make it unmistakably clear which mode is active — without polluting the public experience with admin chrome, and without confusing admins about what visitors see.

2. **Defensive UX as a first-class concern**: No admin should ever encounter an irreversible action by accident. Inline file constraints, explicit save, N-version history, and confirmation patterns for destructive actions must be woven into the design — not bolted on.

3. **Philosophy made tangible through the interface**: The separation of "style (platform-owned) vs. content (admin-owned)" must be felt through the editing experience — admins should intuitively understand what they can and cannot change, without documentation.

### Design Opportunities

1. **Edit mode as delightful simplicity**: Because edit scope is deliberately narrow (content only), edit mode can be clean, fast, and genuinely pleasant — card-style affordances, contextual overlays, no modal overload. This is a strong differentiator against bloated builders.

2. **Directory as the product's showcase surface**: The platform directory is both the homepage and the primary acquisition engine. Exceptional directory UX — fast filtering, clear club cards, strong visual hierarchy — directly fuels word-of-mouth growth without any marketing spend.

3. **First-session onboarding as the core proof point**: Getting a non-technical club admin to a "this looks like a real website" moment within 30 minutes of first login is the product's most important UX success metric. This onboarding arc deserves dedicated design attention.

## Core User Experience

### Defining Experience

The core interaction is in-place editing: the Club Admin toggles into edit mode directly on their club's live site — same URL, same visual context as public visitors. The product's entire value proposition is proven or disproven in this single interaction. If a non-technical admin can set up their site in one session without help and then stop thinking about it, the product works.

### Platform Strategy

Web-first with no native apps. Mouse/keyboard primary for desktop (initial setup); full touch parity for mobile (edit mode fully functional). No offline requirement — platform reliability is a product promise, not a user concern. Standard browser APIs only; no device-specific dependencies.

### Effortless Interactions

- **Edit mode toggle** — one affordance, instant, no page reload
- **Logo/image upload** — drag or click; inline constraints shown before failure, never after
- **Page management** — activate, deactivate, rename pages directly from nav, no settings screen
- **Explicit save** — one action; unsaved-changes state always visible; no autosave surprises
- **Contact form routing** — zero admin configuration; reply-to wired automatically from day one

Eliminated entirely vs. competitors: separate admin panels, theme editors, hosting dashboards, plugin management, SSL configuration, sitemap submission, template selection.

### Critical Success Moments

1. **The "real website" moment** — first login → logo upload → welcome text → save → public view. Must complete in under 30 minutes, unassisted, with no documentation.
2. **The first contact form inquiry** — a real message from a real person arrives in the club's inbox. Not a UI event; a proof-of-value event.
3. **The directory discovery** — a visitor filters by activity type and finds the club. The "Powered by" footer closes the acquisition loop back to the platform.
4. **The invisible upgrade** — club admin visits their site months later and it simply looks better. No notification. No action required. The absence of disruption is the feature.

### Experience Principles

1. **The product disappears behind the club** — the editing interface belongs to the club, not the platform. Platform identity lives in the footer, not in admin chrome.
2. **Reversibility is structural, not a warning** — version history and explicit save make every action undoable by design. No "are you sure?" modals compensating for risky UX.
3. **Inline, contextual, before-the-fact** — constraints and guidance appear at the moment of relevance, before failure. Admins are never surprised by something they already did.
4. **The first session is the entire onboarding** — no tutorial, no guide. The UI teaches through doing. Documentation need is a UX failure signal.
5. **Invisible infrastructure as felt experience** — success is a Club Admin who can't remember the last time they thought about their website.

## Desired Emotional Response

### Primary Emotional Goals

**Club Admin:** Relief and peace — the dominant goal is the *absence* of anxiety. Not feature excitement, but the genuine calm of having a web presence that runs itself. Complemented by pride when sharing the club URL, and confidence while editing.

**Public Visitor:** Discovery — finding something real and local that they didn't know existed. Briefly, belonging — a sense that this club is accessible and worth contacting.

**Platform Operator:** Quiet satisfaction — low volume, clean metrics, zero drama. The platform working invisibly is itself the feeling of success.

### Emotional Journey Mapping

| Stage | Desired feeling | Feeling to avoid |
|---|---|---|
| First reads philosophy page | Recognition — "this is for me" | Skepticism, confusion |
| Submits application | Trust, calm anticipation | Uncertainty about next steps |
| Receives acceptance email | Readiness, mild excitement | Overwhelm |
| First login → edit mode | Orientation, growing confidence | Intimidation, paralysis |
| First save → public view | **Pride, accomplishment** — "this is real" | Disappointment at the result |
| Weeks later, no notifications | **Peace** — no maintenance anxiety | Nagging obligation |
| First contact form inquiry | **Delight** — "it's working in the world" | Surprise that it happened at all |

### Micro-Emotions

- **Confidence vs. Anxiety** — editing must feel bounded and safe; admins always know what they're changing and that they can undo it
- **Trust vs. Skepticism** — inline constraints prevent the emotional whiplash of a failed upload; constraints shown *before* the action build system trust
- **Pride vs. Embarrassment** — the public site must look professionally credible with zero style input from the admin
- **Peace vs. Vigilance** — no maintenance notifications, no required actions, silence when things are fine
- **Delight vs. Frustration** — smooth transitions, instant edit feedback, loading skeletons; small "it just worked" moments compound into trust

### Design Implications

- **Confidence** → Card-based edit affordances with clear visual boundaries; explicit save (always visible when changes exist); version history as emotional safety net
- **Trust** → Inline file constraints displayed *before* upload; clear error states with recovery paths; no irreversible actions without confirmation
- **Pride** → Platform-controlled styling must be genuinely beautiful with only name, logo, and a paragraph of text — zero admin style decisions required
- **Peace** → Edit mode off by default; public view is the default state; no admin notifications unless action is required
- **Delight** → No full-page reloads in edit mode; skeleton loaders for all async content; smooth save confirmation feedback

### Emotional Design Principles

1. **Absence of anxiety is the goal, not presence of excitement** — for Club Admins, the product succeeds emotionally when it stops being thought about
2. **Safety before capability** — every editing capability is paired with its undo path; confidence comes from knowing nothing is permanent
3. **Visual credibility is non-negotiable** — if the public result doesn't look professionally good with minimal content, pride cannot emerge and the product fails its emotional contract
4. **Silence is positive feedback** — no news is good news; the system communicates only when human action is genuinely required
5. **Small moments of "it just worked" compound into trust** — fast interactions, inline feedback, and zero surprises are not polish; they are the product

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Notion (primary reference):** In-context editing with block-based content model. The UI edits exactly what will be seen — no separate admin panel. Minimal chrome, contextual toolbars, clean empty states that invite action rather than intimidate. The block metaphor (each content unit is self-contained with its own affordances) directly informs our element library design.

**Squarespace (reference for visual standard):** Sets the bar for visual credibility out of the box — a site with only a name and a paragraph looks professional. This is the minimum acceptable standard for our platform-controlled template, but we reject everything else: template pickers, color editors, font selectors, and pricing tiers.

**Linear (reference for admin UI feel):** Minimalist, fast, keyboard-accessible. Status states are clear and calm. Working interfaces have minimal chrome. The platform admin dashboard and edit mode target this level of responsiveness and clarity.

### Transferable UX Patterns

**Editing Patterns:**
- **Notion's in-context editing** → Club site edit mode: toggle directly on the live site URL, editing exactly what visitors see, no separate /admin route
- **Notion's block/element model** → Element library: each element (Calendar, Gallery, Rich Text, Contact sub-block) is a self-contained card with its own edit affordances, constrained to the page structure
- **Notion's contextual element picker** → Adapted as a minimal element picker (5–6 types only), appearing when a page section is empty or when adding a new element

**Status & Feedback Patterns:**
- **Linear's calm status clarity** → Explicit save button: one persistent affordance, clearly indicates unsaved vs. saved state, no ambiguity, no autosave surprises
- **Linear's instant responsiveness** → All edit interactions respond immediately; no full-page reloads within edit mode; skeleton loaders for any async content

**Visual Credibility Patterns:**
- **Squarespace's out-of-the-box quality** → Platform template must look professionally credible with only club name, logo, and a welcome paragraph — zero admin style decisions required

### Anti-Patterns to Avoid

- **Blank page / blank canvas** (Wix, Google Sites) — our sites arrive pre-structured; admins fill in content, not structure
- **Drag-anything-anywhere layout editing** (Wix) — too much freedom creates paralysis and ugly results for non-technical users
- **Separate admin panel URL** (WordPress) — breaks the "editing what visitors see" contract; all editing happens on the club's own URL
- **Template picker at first login** (Squarespace, Wix) — one template, always; no choice required or offered
- **Plugin / extension ecosystem** (WordPress) — no extensions, no marketplace, no optional capabilities that require decisions
- **Autosave without version history** — creates anxiety ("did it save? what did it save?"); our explicit save + N-version history is intentionally different
- **"It works but looks bad"** (Google Sites, basic CMS tools) — violates the pride principle; the public result must always look credibly professional

### Design Inspiration Strategy

**Adopt directly:**
- Notion's in-context editing paradigm for the edit mode interaction model
- Notion's block/card metaphor for the element library
- Linear's responsiveness and minimal chrome standard for the admin dashboard

**Adapt for our constraints:**
- Notion's element picker → narrowed to 5–6 element types only; no open-ended content types
- Notion's editing model → paired with explicit save (not autosave) and version history
- Squarespace's visual standard → achieved through platform-controlled template, not through admin style choices

**Avoid entirely:**
- Any pattern that introduces style decisions for the admin (template pickers, color editors, font selectors)
- Any pattern that separates editing from viewing (separate admin dashboards, /admin routes)
- Any pattern that creates blank-canvas paralysis (empty starting states, free-form layout editors)

## Design System Foundation

### Design System Choice

**Tailwind CSS + Radix UI primitives** (following the shadcn/ui pattern of owned, styled Radix components).

### Rationale for Selection

- **Full visual ownership** — the platform's style is its core value proposition; no component library aesthetic should be detectable in the public result
- **Accessibility by default** — Radix UI primitives provide WCAG 2.1 AA-compliant keyboard navigation, ARIA roles, and focus management on every interactive component, meeting the binding accessibility requirement without per-component effort
- **Color token architecture** — Tailwind's CSS variable configuration maps directly to the single-scheme, variable-ready color token system specified in the PRD; theme-level changes propagate without component edits
- **Framework-agnostic** — compatible with Next.js, SvelteKit, and Nuxt; no framework lock-in at the design system layer
- **Speed with ownership** — faster than a fully custom system for MVP; produces more distinctive results than an established system (MUI, Ant Design)

### Implementation Approach

- Define color tokens as CSS custom properties, consumed by Tailwind config
- Build component library as owned, styled Radix primitives (not a third-party dependency — components live in the codebase)
- Shared between all three surfaces: club site (public view + edit mode), platform site, and admin dashboard
- Edit mode components are a subset of the library with additional edit-affordance variants

### Customization Strategy

- Single color scheme at MVP; token architecture is variable-ready for per-club theme picker (Phase 2) without re-architecture
- Typography: one typeface, one scale — no admin-configurable font choices
- Spacing and layout grid defined as Tailwind config tokens, not inline values
- Component variants cover: public/view state, edit/active state, admin/dashboard state — three surfaces, one library

## Defining Core Experience

### Defining Experience

**"Click Edit on your club's website and change it — right there, directly on the page."**

The Club Admin never leaves their club's URL to manage it. The same page visitors browse is the page the admin edits. There is no dashboard, no admin panel, no context switch. The edit affordance appears only to authenticated admins; visitors see nothing of it. One click activates edit mode; one click saves.

If a first-time admin can describe this to a friend as "it's like editing a Facebook post, but it IS the website" — the experience has succeeded.

### User Mental Model

Club Admins arrive with two co-existing mental models:

1. **"Websites are technical"** — prior experience with WordPress, developers, or neglected CMS tools. This belief must be disproved in the first 60 seconds of the first session.
2. **"I post directly on social media"** — the familiar pattern of Facebook, Instagram, WhatsApp. This is the model to reinforce: direct, contextual, immediate.

The one ambiguity to resolve through design: admins must clearly understand that visitors cannot see edit chrome, and that changes only go live on explicit save. This must be taught visually — not with instructions.

### Success Criteria

- First-time admin completes full setup (name, logo, welcome text, first save, public view) in under 30 minutes with zero external help or documentation
- Every edit action produces immediate visual feedback — changes appear as the admin types
- Save state is always legible: "Unsaved changes" and "Saved" states are unambiguous at all times
- No admin action damages the public-facing site until explicit save — all edits are preview-only until committed
- After the first save, the admin views the public site and perceives it as "a real website"

### Novel UX Patterns

The defining experience combines **familiar patterns innovatively** — no genuinely novel interaction paradigm is required:

- Familiar elements: edit button, text fields, image upload, save button, WYSIWYG editing
- **Innovative combination**: all interactions occur on the public-facing URL — no /admin route, no context switch, no separate dashboard
- Teaching requirement is minimal: each micro-interaction is already understood; only the "you're editing the live page" framing requires communication — handled visually, not textually

### Experience Mechanics

**Initiation:**
- Admin visits their club URL (authenticated via persistent session)
- A subtle "Edit" affordance is visible only to authenticated admins (floating button or minimal top bar) — completely absent for public visitors
- Single click activates edit mode with no page reload

**Interaction:**
- Page transitions to edit mode: unmistakable visual indicator (edit bar, page border, or background treatment) communicates the mode clearly
- Editable content areas reveal card affordances on hover — each element becomes visually "touchable"
- Non-editable elements (layout, typography, colors, footer attribution) show no hover affordance — the content/style boundary is felt, not explained
- Inline editing begins on click: text cursor in place for text fields, upload trigger for images, element picker for empty page sections

**Feedback:**
- Changes appear instantly as admin edits — live preview in place
- Persistent save indicator shows "Unsaved changes" clearly whenever pending changes exist
- Inline constraints (file size, accepted formats) displayed at the moment of upload interaction, before any failure
- Element-level confirmations for structured elements (e.g. calendar event saved, gallery image uploaded)

**Completion:**
- Single "Save" action commits all pending changes
- Brief "Saved" confirmation with timestamp, then quiet return to edit-active state
- Admin can toggle to public view at any time to see exactly what visitors see
- Each save creates a named restore point in version history

## Visual Design Foundation

### Color System

**Color space:** OKLCH (shadcn/ui v4 default). All tokens defined as CSS custom properties, consumed by Tailwind config.

**Architecture: fixed zinc base + configurable accent**

The base palette (backgrounds, text, cards, borders) is platform-controlled zinc and never changes. The accent/primary color is configurable per club from a curated preset palette, allowing clubs to match their logo without introducing design chaos.

**Tokens affected by accent:** `--primary`, `--primary-foreground`, `--ring`. All others are fixed zinc.

**Light mode (`:root`) — zinc base:**

| Token | Value |
|---|---|
| `--background` | `oklch(1 0 0)` |
| `--foreground` | `oklch(0.141 0.005 285.823)` |
| `--secondary` | `oklch(0.967 0.001 286.375)` |
| `--secondary-foreground` | `oklch(0.21 0.006 285.885)` |
| `--muted` | `oklch(0.967 0.001 286.375)` |
| `--muted-foreground` | `oklch(0.552 0.016 285.938)` |
| `--accent` | `oklch(0.967 0.001 286.375)` |
| `--accent-foreground` | `oklch(0.21 0.006 285.885)` |
| `--border` | `oklch(0.92 0.004 286.32)` |
| `--input` | `oklch(0.92 0.004 286.32)` |
| `--card` | `oklch(1 0 0)` |
| `--card-foreground` | `oklch(0.141 0.005 285.823)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` |
| `--destructive-foreground` | `oklch(0.985 0 0)` |

**Dark mode (`.dark`) — zinc base:**

| Token | Value |
|---|---|
| `--background` | `oklch(0.141 0.005 285.823)` |
| `--foreground` | `oklch(0.985 0 0)` |
| `--secondary` | `oklch(0.274 0.006 286.033)` |
| `--secondary-foreground` | `oklch(0.985 0 0)` |
| `--muted` | `oklch(0.274 0.006 286.033)` |
| `--muted-foreground` | `oklch(0.705 0.015 286.067)` |
| `--accent` | `oklch(0.274 0.006 286.033)` |
| `--accent-foreground` | `oklch(0.985 0 0)` |
| `--border` | `oklch(1 0 0 / 10%)` |
| `--input` | `oklch(1 0 0 / 15%)` |
| `--card` | `oklch(0.21 0.006 285.885)` |
| `--card-foreground` | `oklch(0.985 0 0)` |
| `--destructive` | `oklch(0.704 0.191 22.216)` |
| `--destructive-foreground` | `oklch(0.985 0 0)` |

**Configurable accent presets (per club — affects `--primary`, `--primary-foreground`, `--ring`):**

| Preset | Best for |
|---|---|
| **Zinc** (default) | Monochrome — no logo color match needed |
| **Blue** | Sports, water, general purpose |
| **Green** | Nature, outdoors, ecology, hiking |
| **Red** | Sports, alpine, high-energy activities |
| **Violet** | Cultural associations, arts, music |
| **Orange** | Adventure, social clubs, scouts |
| **Rose** | Community, dance, social associations |
| **Yellow** | Optimism, youth groups |

All presets sourced from shadcn/ui theme palette; all pass WCAG 2.1 AA on both light and dark zinc bases. Single CSS custom property injection per club — no re-architecture.

**Accent picker UX:**
- 8 color swatches in the club's edit mode settings panel
- No hex input, no custom colors — curated presets only
- Live preview: change applies immediately in edit mode before saving
- Persisted per club in database; applied to both light and dark variants

**Edit mode accent (both modes):** `amber-500` — the single additional warm signal, used exclusively for the "Unsaved changes" indicator. Not part of the configurable accent system.

**Theme switching (light/dark):**
- Default: `prefers-color-scheme` OS setting
- User-toggleable via UI control, persisted in `localStorage`
- Applies to club sites, platform site, and admin dashboard

### Typography System

**System sans-serif stack — zero external font payload:**

```
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif
```

Tailwind's default `font-sans`. Instant render on all OS and device types; no network round-trip.

| Level | Size | Weight | Use |
|---|---|---|---|
| `text-xs` | 12px | 400 | Labels, captions, metadata |
| `text-sm` | 14px | 400–500 | UI text, inputs, nav items |
| `text-base` | 16px | 400 | Body copy, descriptions |
| `text-lg` | 18px | 500–600 | Section subheadings |
| `text-xl` | 20px | 600 | Page headings |
| `text-2xl` | 24px | 700 | Major headings |
| `text-3xl–4xl` | 30–36px | 700 | Hero / display text |

### Spacing & Layout Foundation

- **Base unit:** 4px (Tailwind default spacing scale)
- **Grid:** 8-column for content pages; 12-column for admin/dashboard layouts
- **Max widths:** `max-w-3xl` (48rem) for reading-optimized content; `max-w-7xl` (80rem) for directory and dashboard layouts
- **Component padding:** `p-4` (16px) standard; `p-6` (24px) for cards; `p-8` (32px) for page sections
- **Philosophy:** generous whitespace signals calm and trust — space is intentional, not wasted

### Accessibility Considerations

- All zinc base token pairings meet WCAG 2.1 AA contrast ratios in both light and dark modes
- All 8 accent presets verified to meet WCAG 2.1 AA on zinc backgrounds in both modes
- System font stack: no render-blocking font loading
- Focus rings use `--ring` (inherits accent color) — sufficient contrast on zinc backgrounds in all presets
- `--destructive` adjusted per mode to maintain AA contrast on each background
- "Unsaved changes" indicator (amber-500) always paired with text label — not color alone
- Theme toggle and accent picker are keyboard-accessible and ARIA-labelled
- Accent picker uses presets only — prevents clubs from accidentally choosing inaccessible color combinations

---

## Design Direction Decision

### Design Directions Explored

Six initial directions (D1–D6) were explored covering layout approaches, information hierarchy, navigation patterns, and visual weight variations across four surfaces: club site public view, edit mode, platform directory, and admin dashboard.

### Chosen Direction

A composite direction built from the most effective elements of the exploration:

**Platform Homepage (Surface 01):** Sober, minimal layout inspired by howmuch.tax — short declarative headline ("The worldwide activities glossary"), country selector buttons directing to country paths (e.g. `platform-name.com/{lang}/ch`), aggregate statistics (total clubs, countries, members). No listing on the main page.

**Country Page (Surface 02):** Country-specific path (`/{lang}/{country}`) with a search form adapted to local administrative structure (Switzerland: canton as first field), followed by a filterable club grid.

**Club Site Public (Surface 03):** D4-style persistent sidebar navigation combined with a D1-style centered hero section on the homepage (club logo, name, tagline, primary CTA). Inner pages use sidebar nav with content area.

**Club Site Edit Mode (Surface 04):** Same D4 dark sidebar, extended with an Admin tab (visible only in edit mode) containing: accent color picker, account settings, version history, custom domain, export. Edit fields card with live preview rendered below it. Amber-500 unsaved-changes indicator.

**Platform Admin Dashboard (Surface 05):** D4-style dark sidebar (consistent with club edit mode) combined with D6-style content area: key metrics, application queue with approve/reject actions, club health indicators.

### Design Rationale

The composite direction unifies two distinct contexts (public-facing club sites and platform-internal surfaces) under a single visual language: D4's persistent dark sidebar. This creates an immediate and unmistakable mode signal — the sidebar is dark in edit and admin contexts, absent in the public view. The platform homepage deliberately avoids a directory-on-landing-page pattern to stay neutral across countries and to lead with the value proposition before geography. Country subdomains (ch.platform-name.com, fr.platform-name.com) allow country-specific search schemas (canton field for Switzerland) without complicating the global entry point.

### Implementation Approach

- Shared Tailwind + shadcn/ui component library across all surfaces
- Path-based routing: `/{lang}/{country}` (e.g. `platform-name.com/fr/ch`) with country-specific search field schemas; `{lang}` and `{country}` are independent segments
- Single in-place edit URL per club (no /admin route); dark sidebar signals edit vs. public state
- Admin tab gated by auth state (hidden from public, shown only in edit mode)
- Dark sidebar as the design anchor for all authenticated and operator-facing surfaces
- Visual reference file: `_bmad-output/planning-artifacts/ux-design-directions.html`

---

## User Journey Flows

### Journey 1: Club Admin — Initial Site Setup

**Persona:** Marie, 52 — non-technical club president, setup in one afternoon

**Entry point:** Acceptance email → login link

```mermaid
flowchart TD
    A([Email: Acceptance + Login Link]) --> B[Click login link]
    B --> C[Club site loads in Edit Mode\ndark sidebar visible]
    C --> D[Configure identity\nclub name · logo · welcome text]
    D --> E{Amber dot visible\nUnsaved changes}
    E --> F[Save]
    F --> G[Confirmation shown]
    G --> H{Add custom pages?}
    H -->|Yes| I[Name page + choose elements\nCalendar · Gallery · Rich text · Documents]
    I --> J{Add more elements?}
    J -->|Yes| I
    J -->|No| K{Add more pages?\nmax 5 total}
    K -->|Yes| I
    K -->|No| L[Configure Contact page\nform · map · phone · subjects]
    H -->|No| L
    L --> M[Save]
    M --> N[Toggle to Public View]
    N --> O{Satisfied?}
    O -->|Yes| P[Copy URL / share]
    P --> Q([Setup complete — zero ongoing obligation])
    O -->|Needs changes| R[Toggle back to Edit Mode]
    R --> D
```

**Key moments:**
- Amber unsaved dot is the single persistent signal between edits and save
- Toggling public view is the verification step — not a separate deployment
- No wizard, no onboarding checklist — the edit mode IS the setup

---

### Journey 1b: Club Admin — Ongoing Content Update

**Entry point:** Club site public URL → "Edit" button in footer

```mermaid
flowchart TD
    A([Club admin visits club site]) --> B[Click Edit in footer]
    B --> C[Authenticate via platform\nif session expired]
    C --> D[Edit mode activates\ndark sidebar appears]
    D --> E[Navigate to page to update\nvia sidebar]
    E --> F[Make content changes\ntext · image · event · document]
    F --> G{Amber dot visible}
    G --> H{Happy with changes?}
    H -->|Yes| I[Save]
    I --> J[Confirmation]
    J --> K{Preview public view?}
    K -->|Yes| L[Toggle to Public View\nverify changes]
    L --> M([Done — exit])
    K -->|No| M
    H -->|No — revert| N[Open Version History\nin Admin sidebar tab]
    N --> O[Select previous version]
    O --> P[Restore]
    P --> Q[Edit mode with restored state]
    Q --> H
```

---

### Journey 2: Public Visitor — Finding an Activity

**Persona:** Thomas, 28 — recently relocated, searching for a club

**Entry points:** Search engine query OR platform directory

```mermaid
flowchart TD
    A([Search: 'badminton club Lausanne']) --> B{Landing surface}
    B -->|Direct club site in SERP| C[Club site: Home\nlogo · name · welcome text · CTA]
    B -->|Platform directory in SERP| D[platform-name.com/fr/ch\nCountry page]
    D --> E[Filter: Activity type + Canton]
    E --> F[Club listing]
    F --> C
    C --> G{Want more info?}
    G -->|Yes| H[Navigate inner pages\nCalendar · About · Gallery\nSPA-style with loading skeleton]
    H --> I{Contact intent formed?}
    G -->|Direct intent| I
    I -->|Yes| J[Go to Contact page]
    J --> K[Fill form: name · email · message]
    K --> L[Submit]
    L --> M[On-screen confirmation]
    M --> N([Club admin receives email\nreply-to set to visitor])
    I -->|Not yet — bookmarks| O([Return later])
    C --> P{Notice footer?}
    P -->|Sees Powered by link| Q[Click → Platform homepage]
    Q --> R[Explore directory further]
    R --> F
```

---

### Journey 3: Club Applicant — Application & Decision

**Persona:** Ahmed, 35 — newly elected secretary, cultural association, no web presence

**Entry point:** "Powered by" footer link on another club's site

```mermaid
flowchart TD
    A([Clicks Powered by footer link]) --> B[Platform homepage\nshort headline + country buttons]
    B --> C[Reads philosophy]
    C --> D{Resonates?}
    D -->|No| E([Exits — self-selection works])
    D -->|Yes| F[Click Apply]
    F --> G[Apply form\nAssociation name · Activity type · Description]
    G --> H{Valid submission?}
    H -->|Incomplete| I[Inline field errors\nremain on form]
    I --> G
    H -->|Complete| J[Submit]
    J --> K([Operator review queue — within 48h])
    K --> L{Operator decision}
    L -->|Fits niche| M[Approve — one click]
    M --> N[Auto: subdomain provisioned]
    N --> O[Auto: acceptance email sent\nsubdomain + login link]
    O --> P([Ahmed clicks login link\n→ Journey 1: Initial Setup])
    L -->|Does not fit niche| Q[Reject]
    Q --> R[Rejection email with short explanation]
    R --> S([Applicant exits — curation was visible])
```

---

### Journey 4: Platform Operator — Daily Operations

**Persona:** The founder — single operator, low-volume dashboard

**Entry point:** Platform admin login

```mermaid
flowchart TD
    A([Operator login]) --> B[Admin dashboard\ndark sidebar · metrics · application queue]
    B --> C{New applications?}
    C -->|Yes| D[Review: name · type · description]
    D --> E{Decision}
    E -->|Approve| F[Click Approve]
    F --> G[Auto: subdomain provisioned + acceptance email]
    G --> H([Club admin receives login link])
    E -->|Reject| I[Click Reject]
    I --> J[Templated rejection email sent]
    J --> K([Applicant notified])
    C -->|Queue empty| L[Check metrics panel\nclubs live · uptime · Lighthouse · storage]
    B --> L
    L --> M{Site health flags?}
    M -->|Issues detected| N[Review affected club]
    N --> O[Send nudge to club admin]
    O --> P([Admin alerted])
    M -->|All healthy| Q[Check support queue]
    B --> Q
    Q --> R{Open tickets?}
    R -->|Yes| S[Read ticket: club + issue]
    S --> T[Reply directly — within 24h]
    T --> U([Ticket resolved])
    R -->|No| V([Close tab — back to building])
```

---

### Journey Patterns

**Navigation Patterns:**
- **Email-as-authenticated-gateway:** Acceptance email + login link is the entry point for club admin edit mode — no username discovery flow, no password reset friction on first use
- **Footer "Powered by" as acquisition loop:** Every public club site footer is an entry point to the platform directory — visitor becomes applicant; applicant becomes club admin
- **Dark sidebar = authenticated context:** Public view has no sidebar; dark sidebar appears only in edit mode and operator dashboard — immediate visual disambiguation without labels

**Decision Patterns:**
- **Philosophy-first self-selection:** Platform homepage shows philosophy before the Apply CTA — misaligned applicants exit before consuming operator review time
- **Explicit save with amber indicator:** No autosave anywhere — amber dot persists until explicit save; prevents surprise state loss and makes saving a deliberate, satisfying action
- **One-click approval with cascading automation:** Operator approves in one click; subdomain provisioning and email are fully automatic — low operational overhead by design

**Feedback Patterns:**
- **Inline constraint display:** File size, format, and page count limits shown at point of relevance — not in documentation, not in error messages after the fact
- **Loading skeleton within 100ms:** SPA-style inner page transitions display a skeleton immediately — no blank states, no layout shift
- **On-screen contact confirmation:** Visitor sees confirmation before email arrives — trust established at the moment of submission

---

### Flow Optimization Principles

- **Minimize steps to first value:** Club admin goes from email link to a publicly shareable site in one uninterrupted session — no account creation screen, no dashboard navigation, no multi-step setup wizard
- **Error prevention over error recovery:** Inline constraint display eliminates upload errors before they happen; accessible accent presets prevent inaccessible color choices
- **Rollback as safety net, not primary flow:** Version history is available and visible in the Admin sidebar tab — it exists for peace of mind, and admins rarely need it
- **Low cognitive load at every decision point:** Apply form has 3 fields; operator approval is one click; contact form is name + email + message — friction removed from every conversion point
- **Self-selection reduces operator burden:** Philosophy visibility at platform homepage and club site footer attracts aligned applicants and filters misaligned ones before operator review

---

## Component Strategy

### Design System Components (shadcn/ui — use as-is or lightly extended)

The following components are available from the shadcn/ui library (owned copies, not a dependency) and satisfy standard UI needs without custom design work:

| Category | Components |
|---|---|
| **Form primitives** | Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Label, Form (react-hook-form) |
| **Overlay** | Dialog, Sheet, Popover, Tooltip, DropdownMenu |
| **Layout** | Card, Separator, ScrollArea, Tabs, Accordion |
| **Feedback** | Alert, Toast (Sonner), Badge, Progress |
| **Data** | Table, Avatar |
| **Navigation** | Command (cmdk), Breadcrumb |
| **Date** | Calendar (date picker primitive) |

These cover: apply form fields, login form, version history list structure, filter selects in directory, support ticket replies, metrics display rows, toast notifications.

---

### Custom Components

Components required by the product that have no equivalent in shadcn/ui — each built on Tailwind tokens and Radix primitives for accessibility and consistency.

#### EditFieldCard

**Purpose:** The primary edit affordance — a card containing the editable fields for a content section, shown in edit mode only. The visual anchor of the in-place editing pattern.

**Anatomy:**
- Section label (e.g. "Club identity", "Welcome text")
- One or more Input / Textarea / ImageUploadField children
- Amber unsaved-changes indicator dot (appears after any field change)
- Save button (primary)
- Cancel / Discard button (ghost)

**States:**
- `pristine` — no changes; Save and Discard dimmed/hidden
- `dirty` — changes made; amber dot visible; Save and Discard active
- `saving` — Save button shows spinner; fields disabled
- `saved` — brief success toast; returns to pristine

**Variants:** Standard (single section) / Compound (multiple sections with sub-labels)

**Accessibility:** `aria-live="polite"` on unsaved indicator; Save button always focusable; Discard confirms if dirty to prevent accidental loss

---

#### LivePreviewPanel

**Purpose:** Renders a live read-only preview of the club's current page below the EditFieldCard, reflecting unsaved changes in real time. Closes the feedback loop without requiring a page reload or toggle.

**Anatomy:**
- "Preview" label bar (non-interactive, subtle)
- Rendered club page content (public-view styles, read-only)
- Responsive scaling: desktop-width by default; mobile toggle button

**States:**
- `synced` — reflects current field values
- `loading` — brief skeleton on initial mount or heavy media update

**Accessibility:** `aria-label="Live preview of changes"`, `role="region"`, not keyboard-navigable (read-only decorative region)

---

#### ClubHeroSection

**Purpose:** The centered homepage hero for every public club site — the first thing a visitor sees. Server-rendered for SEO. Contains the club's identity anchor elements.

**Anatomy:**
- Club logo (circular avatar, configurable size)
- Club name (`text-2xl–4xl`, `font-bold`)
- Tagline / welcome text (`text-base`, `text-muted-foreground`)
- Primary CTA button (configurable label, links to Contact page)
- Accent color applied to CTA button (`--primary` token)

**States:**
- `public` — rendered, fully SEO-indexed
- `edit` — logo has upload affordance overlay; name and tagline are inline-editable (focused by EditFieldCard above)

**Variants:** Logo present / Logo placeholder (shows club initial monogram)

**Accessibility:** `<h1>` for club name; logo `<img>` with club name as alt text; CTA is a semantic `<a>` not a `<button>`

---

#### ClubSidebarNav

**Purpose:** Persistent left sidebar navigation for club sites. The structural anchor for both public view (navigation only) and edit mode (navigation + admin functions).

**Anatomy — Public mode:**
- Club name or logo lockup at top
- Navigation links: Home + custom pages (active state highlighted)
- Theme toggle (light/dark) at bottom
- "Edit" entry point at bottom (visible only to authenticated admin)

**Anatomy — Edit mode (additions):**
- Dark background (`--sidebar` dark tokens)
- "Editing" mode label / badge
- Admin tab appears (accent picker, version history, account, custom domain, export)
- Amber unsaved dot mirrored next to club name

**States:**
- `public-default` — neutral zinc sidebar
- `edit-mode` — dark sidebar, admin tab visible
- `mobile` — collapses to hamburger; drawer on tap

**Accessibility:** `<nav>` landmark; `aria-current="page"` on active link; hamburger button `aria-expanded`, `aria-controls`

---

#### AccentColorPicker

**Purpose:** 8-preset swatch selector in the Admin sidebar tab, allowing club admins to choose an accent color without risking inaccessible choices.

**Anatomy:**
- "Accent color" label
- 8 circular swatches (Zinc, Blue, Green, Red, Violet, Orange, Rose, Yellow)
- Active swatch has a ring indicator (`--ring` token)
- Live applies to `--primary`, `--primary-foreground`, `--ring` immediately (preview without save)
- Save required to persist

**States:**
- `idle` — current accent highlighted
- `hovered` — swatch enlarges slightly
- `selected (unsaved)` — ring + amber unsaved dot on EditFieldCard
- `saved` — ring persists, amber clears

**Accessibility:** Each swatch is a `<button>` with `aria-label="Zinc accent"` etc.; `aria-pressed="true"` on active swatch; keyboard-navigable with arrow keys

---

#### ClubCard

**Purpose:** Club listing card in the platform directory. Communicates club identity and key attributes at a glance, leading to the club's public site.

**Anatomy:**
- Club logo (small avatar)
- Club name (`font-semibold`)
- Activity type badge
- Canton / region label
- Full card is a clickable link

**States:**
- `default` — resting card
- `hover` — subtle border highlight
- `loading` — skeleton placeholder during directory fetch

**Accessibility:** Entire card wrapped in `<a>`; `aria-label` includes club name and activity type; no redundant interactive elements inside

---

#### ApplicationQueueItem

**Purpose:** A pending application row in the platform admin dashboard. The operator's primary action surface — approve or reject inline with one click.

**Anatomy:**
- Association name (`font-semibold`)
- Activity type badge
- Description (truncated, expandable)
- Submitted date (`text-muted-foreground`)
- Approve button (primary)
- Reject button (destructive ghost)

**States:**
- `pending` — both action buttons active
- `approving` — spinner on Approve; Reject disabled
- `rejecting` — spinner on Reject; Approve disabled
- `approved` — row fades out; success toast
- `rejected` — row fades out; rejection email confirmed

**Accessibility:** Approve/Reject buttons have explicit `aria-label="Approve [Club Name]"`; destructive action triggers a Confirm popover before execution

---

#### ImageUploadField

**Purpose:** Image upload input with inline constraint display — prevents errors before they happen.

**Anatomy:**
- Drop zone ("Click or drag image here")
- Constraint display: "Max 5 MB · JPG, PNG, WebP" — always visible
- Thumbnail preview after upload
- Remove / Replace action
- Alt text input field (required, enforced)

**States:**
- `empty` — drop zone shown
- `dragging-over` — drop zone highlighted
- `uploading` — progress bar
- `uploaded` — thumbnail + alt text field
- `error` — inline error message (size exceeded, wrong format)

**Accessibility:** `<input type="file">` visually hidden; labeled drop zone; alt text field `required`; error messages linked via `aria-describedby`

---

#### CountryButton

**Purpose:** Large country selector on the platform homepage linking to the country subdomain.

**Anatomy:**
- Country flag icon (decorative)
- Country name
- Club count (`text-sm text-muted-foreground`)
- Full clickable link

**States:** Default / Hover (border highlight, subtle scale)

**Accessibility:** Semantic `<a>` with descriptive label; flag icon `aria-hidden`

---

### Component Implementation Strategy

**Ownership model:** All components are owned copies (shadcn/ui pattern) — no runtime dependency on an external library. Components live in `src/components/ui/` (shadcn primitives) and `src/components/app/` (product-specific custom components).

**Token compliance:** All custom components consume only CSS custom property tokens (`--background`, `--foreground`, `--primary`, `--border`, etc.) — never hardcoded color values. This ensures light/dark mode and accent color switching work automatically across all components.

**Amber signal discipline:** The amber-500 unsaved-changes indicator is used in exactly two places: the dot on EditFieldCard and the mirrored dot on ClubSidebarNav. No other component uses amber or any warm color. This uniqueness is what makes it instantly legible.

**Radix for accessibility:** All interactive overlay components (Dialog, Sheet, Popover, Tooltip, DropdownMenu) use Radix UI primitives — keyboard focus trapping, ARIA roles, and escape-key dismissal are handled by the primitive, not reimplemented.

---

### Implementation Roadmap

#### Phase 1 — MVP Critical

| Component | Required For |
|---|---|
| ClubHeroSection | Club site public — home page render |
| ClubSidebarNav | Club site public + edit mode navigation |
| EditFieldCard | Club admin — in-place editing (identity, pages) |
| LivePreviewPanel | Club admin — change verification without toggle |
| ImageUploadField | Club admin — logo + gallery uploads |
| ContactForm | Public visitor — contact path (core conversion) |
| ClubCard | Public visitor — directory browsing |
| CountryButton | Platform homepage — country navigation |
| SearchFilterBar | Country directory — canton + activity filter |
| ApplicationQueueItem | Platform operator — approve/reject flow |
| AccentColorPicker | Club admin — identity setup (Admin sidebar tab) |
| FooterAttribution | All club sites — mandatory "Powered by" link |

#### Phase 2 — Supporting

| Component | Required For |
|---|---|
| CalendarEventCard + Form | Calendar page element |
| GalleryGrid | Image/Video Gallery page element |
| DocumentLibraryItem | Documents library page element |
| ElementPicker | Page builder — adding elements to custom pages |
| PageNavItem (edit mode) | Sidebar nav with add/remove page affordances |
| VersionHistoryEntry | Admin sidebar tab — version list + restore |
| SupportTicketItem | Operator dashboard — support queue |
| PlatformStatBadge | Platform homepage — aggregate statistics |
| ClubHealthIndicator | Operator dashboard — site health status |

---

## UX Consistency Patterns

### Button Hierarchy

shadcn/ui button variants mapped to product intent:

| Variant | Use | Examples |
|---|---|---|
| `default` (primary) | The single most important action on a surface | Save, Approve, Submit application, Send message |
| `outline` | Supporting or alternative action | Preview, Add page, Visit public site |
| `ghost` | Low-emphasis action; icon-adjacent | Discard, navigation items, edit pencil |
| `destructive` | Irreversible or high-risk action — always requires confirmation | Reject, Delete page, Remove element |
| `link` | Inline text links within prose | "Powered by", "Contact Support" |

**Rules:**
- One primary button per card or form section — never two primaries side by side
- Destructive actions are never the first or leftmost button in a group
- Icon-only buttons always have a Tooltip with a text label (`aria-label`)
- Disabled buttons are used only when the reason is immediately obvious inline — not to block invisible requirements

---

### Feedback Patterns

**Success:**
- Toast (Sonner) — bottom-right, auto-dismiss after 3 seconds
- Zinc color scheme (no color accent on success); checkmark icon
- Copy: short and past-tense — "Saved", "Approved", "Version restored"
- Used for: save confirmation, application approved, version restored

**Error:**
- Never in a toast — errors must be readable and actionable
- Form field errors: inline below the field, red text, icon (`aria-describedby` pointing to error)
- Page-level errors: `Alert` component, destructive variant, with a specific action to resolve
- Copy: specific and actionable — "Image must be under 5 MB" not "Upload failed"

**Warning (amber):**
- Reserved exclusively for the unsaved-changes state (amber-500 dot)
- No other warning uses amber — this uniqueness is load-bearing for the pattern's legibility
- Always paired with the text label "Unsaved changes" (not color alone)

**Info:**
- Inline hint text below form fields (`text-sm text-muted-foreground`)
- Constraint text shown permanently (not only on error): "Max 5 MB · JPG, PNG, WebP"
- No info toast — hints live at the point of use

**Loading:**
- Skeleton within 100ms on any SPA-style page transition
- Spinner inside the Button for async actions (Save, Approve) — button disabled during
- No full-page loading overlay — never blocks access to the rest of the UI

---

### Form Patterns

**Layout:**
- Labels above inputs (not floating labels — too ambiguous when filled)
- Error messages directly below the field they describe
- Constraint text permanently below file upload fields
- Submit / Save button: bottom-right of the form card
- One column on mobile; can be two columns on desktop for short field pairs

**Validation:**
- Validate on `blur` (when field loses focus), not on every keystroke — reduces noise while typing
- Show inline errors immediately after blur; clear them as soon as the field value becomes valid
- Never show all errors at once on submit — surface them field by field as the user encounters them

**Required fields:**
- Asterisk (*) next to label with a single legend per form ("* Required")
- No "Optional" label on optional fields — minimizes visual noise

**Save behavior:**
- Explicit save only — no autosave anywhere in the product
- Amber dot appears after any field change; Save button becomes active
- Discard (with confirmation dialog) is offered alongside Save when dirty
- After save: amber dot clears; toast confirms; form returns to pristine state

---

### Navigation Patterns

**Club site sidebar (desktop):**
- Always visible; fixed position; width: ~240px
- Active page: `font-medium` + left border in `--primary` accent color
- Hover: `bg-accent` / `bg-sidebar-accent` depending on mode
- Public mode: zinc/neutral background
- Edit mode: dark background (sidebar-specific dark tokens)

**Club site sidebar (mobile):**
- Collapses to hamburger icon (top-left)
- Opens as a full-height drawer (`Sheet` component) — slides from left
- Closes on navigation or backdrop tap
- Edit mode dark styling preserved in drawer

**Admin sidebar tab:**
- Appears as a second tab in ClubSidebarNav, visible only in edit mode
- Contains: Accent picker, Version History, Account, Custom Domain, Export
- Uses `Tabs` or `Accordion` pattern internally for sub-sections

**Breadcrumb:**
- Only for multi-level content navigation (edit mode: page > sub-page)
- Not used on flat navigation structures

**"Edit" entry point:**
- Ghost button in sidebar footer
- Visible only to authenticated club admin (server-side auth check)
- Label: "Edit site" with pencil icon

---

### Modal and Overlay Patterns

**When to use a confirmation dialog:**
- Destructive or irreversible actions only: Reject application, Delete page, Remove element, Discard unsaved changes
- Non-destructive actions never require confirmation — removes friction for non-technical admins

**Confirmation dialog pattern:**
- `Dialog` component (modal)
- Title: action name — "Delete this page?"
- Body: one sentence consequence — "This page and all its content will be permanently removed."
- Buttons: Destructive primary ("Delete page") + Ghost cancel ("Keep page")
- Cancel is always the default / escape-key action

**Sheet (slide-in panel):**
- Used for ElementPicker (selecting elements to add to a page) — less disruptive than modal
- Slides from right; backdrop closes it; full height on mobile

**Tooltip:**
- Icon-only buttons always have a Tooltip (`delayDuration={0}` for accessibility)
- Position: above by default; auto-flip if near viewport edge
- Plain text only — no rich content in tooltips

**Popover:**
- For inline pickers: date picker in CalendarEventForm, color-adjacent details
- Closes on outside click and Escape key

---

### Loading and Empty States

**Loading skeleton:**
- Mimics the shape of the expected content (card skeleton, list skeleton, grid skeleton)
- Zinc-toned (`bg-muted` animated pulse)
- Shown within 100ms of navigation — never a blank white flash

**Empty directory (no clubs found):**
- Centered message: "No clubs match these filters"
- Sub-text: "Try a different canton or activity type"
- "Reset filters" link (not button) — low emphasis
- No illustration or decorative graphic

**Empty pages list (new club):**
- Actionable prompt: "Your site has a Home and Contact page. Add more pages below."
- Primary button: "Add a page"
- Warm and welcoming — new admins should feel capable, not overwhelmed

**Empty gallery / documents:**
- ImageUploadField or FileUploadField is the empty state — the upload zone IS the empty state

**Empty version history:**
- Inline text: "Save your content to create your first version"
- No action button — informs without pressuring

---

### Edit Mode Patterns

**Mode signal:**
- Dark sidebar = edit mode. No banner, overlay, or mode label needed beyond the sidebar.
- The visual contrast of the dark sidebar is the only mode indicator — sufficient and unambiguous

**Editable vs. non-editable areas:**
- In edit mode, only content areas show edit affordances (pencil icon on hover or EditFieldCard)
- Layout structure, navigation, footer, typography — no affordance in edit mode
- The boundary between content and style is experienced, not explained

**In-place edit flow:**
- Hover content area → pencil icon appears → click → EditFieldCard activates → amber dot → edit → Save → pristine
- EditFieldCard is always positioned directly above or adjacent to the content it controls
- LivePreviewPanel is always below the EditFieldCard for the current section

**Discard vs. Cancel:**
- "Discard" when form is dirty: triggers confirmation dialog; amber dot clears on confirm
- "Cancel" when form is pristine: no confirmation; simply closes the edit state

**Version history restore:**
- User selects version from list in Admin sidebar tab
- Confirmation dialog: "Restore this version? Your current content will be replaced."
- After restore: edit mode active with restored content; amber dot visible (not yet saved)
- Admin must Save after restore to persist — restoring does not auto-save

---

### Search and Filtering Patterns

**Directory filter behavior:**
- Filters apply immediately on change — no "Search" or "Apply" button
- Results update with a brief skeleton (100ms) — no full-page reload
- Active filters shown as removable badge chips above results
- "Reset filters" link clears all active filters

**No results in filter:**
- Inline: "No clubs match these filters"
- Reset link — low emphasis; never a dead end

**Filter field order (country-specific):**
- Switzerland: Canton (first) → Activity type (second)
- Other countries: follow local administrative first-level geography first
- Rationale: users think geographically first, then by activity

---

## Responsive Design & Accessibility

### Responsive Strategy

**Philosophy:** Mobile-first design — base styles target mobile, progressively enhanced for larger screens with Tailwind's responsive prefix system (`md:`, `lg:`, `xl:`). Full feature parity across all devices — no degraded mobile experience, no "mobile version." The edit/admin interface must be fully functional on mobile with touch-friendly affordances.

**Per-surface adaptation:**

| Surface | Mobile | Tablet | Desktop |
|---|---|---|---|
| Club site — public | Single column; hamburger drawer nav | Single column or narrow sidebar | Persistent sidebar (~240px) + content area |
| Club site — edit mode | Full-width EditFieldCard stacked above LivePreviewPanel; sidebar as drawer | Same as mobile; sidebar drawer | Persistent dark sidebar + edit card + preview panel |
| Platform homepage | Country buttons wrap to 2-column grid; stats stacked | 3-column button grid | 4–5 column button grid; stats in a row |
| Country directory | Filter bar stacks vertically; club cards single column | 2-column club grid | 3-column club grid; filter bar horizontal |
| Platform admin dashboard | Sidebar as hamburger; metrics stacked; queue full-width | Narrow sidebar or drawer; metrics 2-column | Persistent dark sidebar; metrics grid; queue table |

**Mobile edit mode specifics:**
- Hamburger drawer opens the dark sidebar; edit mode styling preserved in drawer
- EditFieldCard renders full-width below the section being edited
- LivePreviewPanel visible below EditFieldCard — user scrolls down to see preview
- Entering edit on a section auto-scrolls to the EditFieldCard for that section
- Drawer closes automatically when a section edit begins (prevents obscuring content)

---

### Breakpoint Strategy

Using Tailwind CSS default breakpoints (mobile-first):

| Breakpoint | Min-width | Primary layout shift |
|---|---|---|
| (base) | 0px | Single column; hamburger nav; stacked content |
| `sm` | 640px | Minor refinements; country buttons 2-column |
| `md` | 768px | Tablet: 2-column grids; wider form layouts |
| `lg` | 1024px | Desktop: sidebar becomes persistent; 3-column grids |
| `xl` | 1280px | Wide desktop: increased max-widths; richer density |
| `2xl` | 1536px | Max content width enforced — no unbounded wide layouts |

**Max-width anchors (established in Visual Foundation):**
- `max-w-3xl` (48rem): reading-optimized content (club About text, rich text pages)
- `max-w-5xl` (64rem): edit form layouts (card + preview panel)
- `max-w-7xl` (80rem): directory, dashboard, platform homepage

---

### Accessibility Strategy

**Binding requirement:** WCAG 2.1 Level AA — auditable, legally solid for CH/EU deployment.

**Best-effort:** WCAG 2.1 Level AAA where achievable — enhanced contrast, no time limits, fully descriptive labels, generous touch targets beyond minimum.

**Color contrast:**
- All zinc token pairings verified at ≥ 4.5:1 (AA, normal text) in both light and dark modes
- All 8 accent presets verified at ≥ 4.5:1 on zinc backgrounds
- Focus rings (`--ring` token) provide ≥ 3:1 contrast against adjacent backgrounds
- Amber-500 unsaved indicator always paired with text label — not color alone

**Keyboard navigation:**
- All interactive elements reachable via Tab in logical DOM order
- No keyboard traps outside of Modal/Dialog (which use Radix focus management)
- Skip link: "Skip to main content" at top of every page (visible on focus)
- Escape key dismisses all overlays (Dialog, Sheet, Popover, Tooltip)
- Arrow keys navigate within AccentColorPicker swatches and RadioGroup

**Focus indicators:**
- Never suppressed — `focus-visible:ring-2 focus-visible:ring-ring` on all interactive elements (shadcn/ui default)
- Ring color inherits `--ring` (accent color) — visible in all 8 accent presets

**Screen reader support:**
- Semantic HTML structure: `<main>`, `<nav>`, `<aside>`, `<article>`, `<section>`, headings hierarchy (one `<h1>` per page)
- ARIA landmarks on every surface
- `aria-live="polite"` on the unsaved-changes indicator and toast region
- `aria-current="page"` on active nav item in ClubSidebarNav
- `aria-label` on all icon-only buttons
- `aria-expanded` + `aria-controls` on hamburger toggle
- `aria-required` on required form fields
- All Radix UI overlay components provide ARIA roles and keyboard behavior by default

**Images and media:**
- Alt text is a required field in ImageUploadField — enforced at component level, not just recommended
- Decorative icons use `aria-hidden="true"`
- Gallery images require descriptive alt text (not filename); enforced in upload flow

**Motion:**
- `prefers-reduced-motion: reduce` respected — all CSS transitions and animations disabled or reduced
- Loading skeleton pulse animation disabled under reduced motion (static skeleton shown)

**Touch targets:**
- Minimum 44×44px for all interactive elements (WCAG 2.5.5, Level AAA — applied as standard)
- Edit mode affordances (pencil icons) expanded to 44px tap area on mobile even if visually smaller
- Country buttons and ClubCards designed with generous tap areas

---

### Testing Strategy

**Automated (continuous):**
- `axe-core` integrated in development (browser extension + `jest-axe` in unit tests)
- Lighthouse accessibility audit in CI/CD pipeline — gate at ≥ 90 score
- `Pa11y` CLI for automated WCAG 2.1 AA scan against key routes on each deployment

**Manual keyboard testing (per release):**
- Tab through every surface without a mouse — verify logical order and no traps
- Verify all modals trap focus correctly and restore focus on close
- Verify all dropdowns, tooltips, and popovers open/close with keyboard alone

**Screen reader testing (per release):**
- **VoiceOver + Safari** (macOS and iOS) — primary (platform's likely admin user base)
- **NVDA + Chrome** (Windows) — secondary
- Test: page structure, form interaction, error announcement, edit mode state changes, toast announcements

**Responsive / device testing (per release):**
- Browser dev tools device simulation: iPhone SE (375px), iPhone 14 Pro (393px), iPad (768px), standard desktop (1440px)
- Real device: iOS Safari (iPhone), Android Chrome
- No horizontal scroll verified at all standard viewports
- Edit mode touch interactions verified on iOS Safari

**Color and visual testing:**
- Color blindness simulation: deuteranopia, protanopia, tritanopia (Polypane or Chrome DevTools)
- Amber-500 unsaved indicator: robust by design (relies on text label, not color alone)

---

### Implementation Guidelines

**Mobile-first development:**
- Write base CSS/Tailwind classes for mobile; add `md:` and `lg:` prefixes for larger screens
- No desktop-first `@media (max-width)` queries — Tailwind's default mobile-first breakpoints only

**Semantic HTML:**
- `<main>` wraps primary content on every page
- `<nav>` for ClubSidebarNav and platform site nav — never a `<div>` with `role="navigation"`
- `<section>` with `aria-labelledby` for named content regions
- Heading hierarchy: `<h1>` for page/club name, `<h2>` for major sections, `<h3>` for sub-sections — no skipping levels

**Relative units:**
- Font sizes: Tailwind `text-*` scale (rem-based) — no px font sizes
- Spacing: Tailwind spacing scale — no hardcoded px margins/padding in component code
- Layout widths: `max-w-*` classes — no fixed-width containers except defined max-widths

**Reduced motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
Applied globally; loading skeleton pulse animation also targeted specifically.

**Touch targets:**
- All `<button>` and `<a>` elements: `min-h-[44px] min-w-[44px]` via Tailwind
- Edit affordance icons in edit mode: wrapped in a 44×44px tap area even if icon is 16px

**Focus rings:**
- Never use `outline: none` or `focus:outline-none` without `focus-visible:ring-2` replacement
- Follow shadcn/ui convention: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

**Skip link:**
```html
<a href="#main-content"
   class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded">
  Skip to main content
</a>
```
First element in `<body>` on every page.
