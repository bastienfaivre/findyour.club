# Strategic Improvement Task Plan

Derived from: `strategic-improvement-plan-v2.md`
Created: 2026-03-10

Status legend: `[ ]` pending | `[~]` in progress | `[x]` done | `[—]` deferred

---

## Phase 0 — Root Blocker

- [x] **0.1** Decide platform name
  - **Decision: findyour.club**
  - Note: findyourclub.com exists (sports marketing platform) — different service, accepted overlap
  - Blocks: everything brand-related

- [x] **0.2** Secure domain
  - **Done: findyour.club registered**
  - Blocks: deployment, canonical URLs, QR cards

---

## Phase 1 — Visual Identity Foundation
> Blocked by: Phase 0

- [x] **1.1** Design minimal visual identity
  - **Decision: Keep shadcn defaults (no custom brand color), wordmark = `findyour.club`, favicon = magnifying glass icon**
  - Blocks: OG images, printable cards, badge, favicon

- [x] **1.2** Deploy favicon
  - Favicon assets in `public/`, meta tags in root layout, webmanifest updated with platform name
  - Also updated root layout title to use `findyour.club` branding

---

## Phase 2 — Copy & Messaging (No Engineering Dependencies)
> Can start immediately, parallel with any phase

- [x] **2.1** Rewrite homepage subtitle
  - EN: "Clubs near you, with everything you need to join. No noise."
  - FR: "Les clubs près de chez toi, avec tout ce qu'il faut pour les rejoindre. Sans superflu."
  - DE: "Vereine in deiner Nähe, mit allem was du brauchst, um mitzumachen. Ohne Umwege."
  - IT: "I club vicino a te, con tutto quello che serve per iscriverti. Senza fronzoli."

- [—] **2.2** ~~Remove stats section from homepage~~
  - **Rejected**: Keep stats — transparency is core to the project's volunteer mission

- [x] **2.3** Remove philosophy line from homepage
  - Removed `t.platform.philosophy` from hero section
  - Text preserved in translations for About page (task 3.2)

- [x] **2.4** Add "Free for all clubs. Manually verified." to homepage
  - Added `platform.trustLine` key in all 4 languages
  - Rendered below country buttons section

- [x] **2.5** Rename nav label "Apply" → "List your club"
  - EN: "List your club" | FR: "Inscrire ton club" | DE: "Verein eintragen" | IT: "Registra il tuo club"

- [—] **2.6** ~~Add "Free for all clubs" to footer~~
  - **Rejected**: No added benefit in the footer

- [x] **2.7** Rename Support nav label → "Donate"
  - EN: "Donate" | FR: "Faire un don" | DE: "Spenden" | IT: "Dona"
  - Content rewrite is task 8.1

---

## Phase 3 — Content Pages Rewrite
> Blocked by: Phase 0 (platform name needed in copy)

- [x] **3.1** Rewrite Apply page copy
  - Title: "List Your Club — Free Forever" (+ FR/DE/IT)
  - Benefits checklist with green checkmarks (free, verified, simple, visible)
  - "No cost. No catch. No ads." line
  - "Reviewed within 48 hours" commitment
  - All 4 languages updated

- [—] **3.2** ~~Rewrite About page with founder story~~
  - **Deferred**: User will write the founder story themselves

- [—] **3.3** ~~Add club page preview/mockup to Apply page~~
  - **Deferred**: Blocked by having a demo/real club page to showcase

- [—] **3.4** ~~Record founder video~~
  - **Deferred**: Non-engineering task, user will handle

- [x] **3.5** Embed video on About page
  - Created `YouTubeEmbed` component (`src/components/app/YouTubeEmbed.tsx`)
  - Privacy-enhanced mode (youtube-nocookie.com)
  - Added to About page with rickroll placeholder (dQw4w9WgXcQ)
  - Ready to swap videoId when real video is uploaded

---

## Phase 4 — SEO & Social Metadata Overhaul
> Blocked by: Phase 0 (name in every meta tag) + Phase 1 (logo for OG images)

- [x] **4.1** Rewrite all static meta descriptions
  - Added 5 new SEO description keys (`homeDescription`, `searchDescription`, `aboutDescription`, `supportDescription`, `applyDescription`) to types + all 4 languages
  - Updated homepage, search, about, support pages to use proper SEO descriptions instead of `t.platform.philosophy`
  - Added `generateMetadata` to apply page (had none)
  - Fixed country page title removing redundant `— findyour.club` (template handles it)

- [x] **4.2** Fix browser tab title format
  - Root layout already had `template: '%s — findyour.club'` — verified all pages use it correctly
  - Fixed country page double-appending `— findyour.club`

- [x] **4.3** Add Twitter/X card metadata
  - Added `summary_large_image` card + `siteName` to all 4 metadata generators (platform, directory, club, category)
  - Added default `openGraph.siteName` and `twitter.card` to root layout

- [x] **4.4** Implement dynamic OG images per club page
  - Created `src/lib/og-image.tsx` shared utility with `generateClubOgImage`, `generateStaticOgImage`, `generateCategoryOgImage`
  - Created `[country]/[club]/opengraph-image.tsx` — renders club name, activity type, location
  - Dark theme design with findyour.club branding

- [x] **4.5** Implement static OG images for non-club pages
  - Created `opengraph-image.tsx` routes for: homepage, search, about, support, apply
  - All use shared `generateStaticOgImage` with page title + subtitle

- [x] **4.6** Implement semi-dynamic OG images for category/country pages
  - Created `[country]/opengraph-image.tsx` — renders country name + description
  - Uses shared `generateCategoryOgImage` utility

---

## Phase 5 — Virality & Propagation Infrastructure
> Blocked by: Phase 1 + Phase 4

- [x] **5.1** Create "We're on findyour.club" badge for clubs
  - Dynamic `ImageResponse` via `/api/club/[clubId]/badge` — renders "{club name} is on findyour.club"
  - Downloadable from new club admin "Promote" page + operator admin ClubDetail
  - Auth: club members (OWNER/EDITOR) and platform operators

- [x] **5.2** Generate printable QR card per club
  - Dynamic `ImageResponse` via `/api/club/[clubId]/qr-card` — A6 card with QR code → club URL
  - Uses existing `qrcode` dependency (already installed for TOTP)
  - Downloadable from same Promote page + operator admin

- [—] **5.3** ~~Create shareable "club info card" image~~
  - **Dropped**: OG images (4.4) already serve this purpose for link previews

- [x] **5.4** Add share prompt after club discovery
  - `SharePrompt` component on public club pages — "Know someone who'd love this club?"
  - Uses Web Share API (native on mobile) with clipboard fallback
  - All 4 languages translated

New infrastructure:
  - `src/app/[lang]/(dashboard)/club/[clubId]/promote/page.tsx` — club admin promote page
  - `src/components/app/club-admin/PromoteDownloads.tsx` — download cards component
  - `src/components/app/club-site/SharePrompt.tsx` — public share prompt
  - `src/app/api/club/[clubId]/badge/route.tsx` — badge image API
  - `src/app/api/club/[clubId]/qr-card/route.tsx` — QR card image API
  - `src/lib/og-image.tsx` — added `generateBadgeImage` + `generateQrCardImage`
  - Sidebar entry added for "Promote" in all 4 languages

---

## Phase 6 — Activity Taxonomy Expansion
> Independent — can run in parallel with any phase

- [—] **6.1** ~~Add 14+ new activity types~~
  - **Rejected**: Project philosophy is to add types only when a club of that type registers, keeping search simple

---

## Phase 7 — Adoption & Outreach Prep
> Blocked by: Phase 0 + Phase 1 + Phase 3. Non-engineering.

- [ ] **7.1** Create branded link per commune
  - For municipal officials in French-speaking Swiss towns

- [ ] **7.2** Create one-pager for HR departments
  - PDF for EPFL, CERN, UN Geneva, relocation programs
  - Blocked by: 1.1

- [ ] **7.3** Identify and onboard Maven club presidents
  - Digitally active presidents in Romandie — first ambassadors

- [ ] **7.4** Pitch to expat Facebook group admins
  - Lausanne, Geneva, Fribourg groups

---

## Phase 8 — Post-Launch Refinements

- [x] **8.1** Rewrite Support page content → "Costs & Transparency"
  - Complete redesign: intro, cost breakdown card (domain CHF 22.95 + server CHF 64.80 = CHF 87.75/yr)
  - Green "Funded until March 2027" indicator
  - Contributors list (currently: Bastien Faivre, Founder)
  - "Help us keep going" CTA with contact email
  - All 4 languages translated

- [—] **8.2** Collect "How I found my club" stories
  - **Deferred**: Waiting for first users

- [x] **8.3** Add social proof signals to search results
  - ShieldCheck icon + "Every club is manually reviewed" with info popover on search page
  - Info popover explains: verified at application time, clubs manage own content after approval
  - Also updated `apply.benefits.verified` in all 4 languages to remove "by our team"
  - All 4 languages translated

- [x] **8.4** Add launch date stat to homepage
  - Added 4th stat card: "Online since — March 2026" (localized per language)
  - Grid changed from 3 to 2×2/4-column layout
  - Stats kept visible from launch for transparency
