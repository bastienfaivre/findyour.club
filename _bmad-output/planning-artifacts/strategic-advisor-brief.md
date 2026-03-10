# Strategic Advisor Brief — Clashware Platform

> **Purpose**: Complete inventory of everything visible to users — messaging, page structure, UI elements, gaps — to optimize the platform's stickiness (ref: "Made to Stick" by Chip & Dan Heath).

---

## 1. BRAND IDENTITY (Current State)

| Element | Current Value | Notes |
|---------|--------------|-------|
| **Platform Name** | Clashware | Temporary/working name — NOT final |
| **Domain** | localhost (dev only) | No production domain chosen yet |
| **Tagline** | "Find your club" | Used in browser tab title |
| **Meta Title** | "Clashware — Find your club" | Browser tab / Google result |
| **Meta Description** | "Find your club — the open directory for sports clubs and associations. Browse by activity, region, and discover how to join." | Google snippet |
| **Logo** | None | No logo files exist. `/public/images/` is empty |
| **Favicon** | None (Next.js default) | No custom favicon |
| **Brand Colors** | Neutral zinc/gray palette | No distinctive brand color — uses shadcn defaults |
| **Typography** | Geist Sans / Geist Mono | Clean, modern, but generic (same as many Next.js projects) |
| **Visual Identity** | Minimal | Dark/light mode supported, but no distinctive visual signature |

### What's Missing (Brand)
- **No final platform name** — "Clashware" is likely a working name
- **No dedicated domain**
- **No logo or wordmark**
- **No favicon**
- **No brand color** — everything is zinc gray
- **No visual identity** that distinguishes the platform from any other shadcn/Next.js project
- **No illustrations or imagery** on marketing pages

---

## 2. HOMEPAGE — What Visitors See

**URL**: `/{lang}/` (e.g., `/en/`, `/fr/`)

### Hero Section
- **Headline prefix**: "Find your" (static)
- **Rotating words** (animated, color-changing): football team, yoga class, hiking group, dance partners, ski club, running crew, chess circle, book club, swim team, community
- **8 accent colors cycle** through: blue, violet, pink, orange, green, cyan, amber, rose

### Core Messaging (below hero)
- **Tagline**: "Stop spending hours browsing dozens of club websites just to figure out how to join."
- **Philosophy**: "Here, we only show what matters — nothing more."

### Stats Section
- Number of clubs (dynamic)
- Number of countries (dynamic)
- Number of activity types (dynamic)

### Country Navigation
- **"Available now"** section — shows active countries with club counts as buttons
- **"Coming soon"** section — shows countries launching soon
- Countries displayed as button chips with country code + count

### What's Missing (Homepage)
- **No call-to-action button** prominently saying "Browse clubs" or "Search now"
- **No social proof** (testimonials, club quotes, success stories)
- **No visual imagery** — no photos of real clubs, activities, people
- **No explanation of HOW it works** (3-step process, etc.)
- **No "For clubs" pitch** visible — the value prop for club admins isn't on the homepage
- **No emotional hook** beyond the rotating words — no story, no scenario
- **Stats are abstract** — numbers without context ("12 clubs" doesn't mean much early on)

---

## 3. ABOUT PAGE — What Visitors See

**URL**: `/{lang}/about`

### Content (full text)
> "We created this platform because we believe every community deserves visibility. Too many local clubs and associations remain hidden, reachable only by word of mouth. Our directory gives them a home on the web — simple, beautiful, and free from the noise of social media. Our vision is a world where finding a local club is as easy as searching for a restaurant. Whether you ski, hike, play volleyball, or practice yoga, your next community is just a click away."

### What's Missing (About)
- **No founder story** — who is behind this? Why do they care?
- **No "made to stick" elements** — no concrete anecdote, no unexpected fact, no emotional story
- **No photos of the team or context**
- **No mention of the business model** (donation-funded, free for clubs)
- **Reads like a mission statement**, not a story that sticks

---

## 4. SUPPORT / DONATE PAGE — What Visitors See

**URL**: `/{lang}/support`

### Content
- **Heading**: "Help us keep this platform running"
- **Text**: "This platform is maintained by a small team and funded entirely by voluntary contributions. If you find value in what we do, consider supporting us with a donation. Every contribution — no matter how small — helps us keep the lights on and continue improving the experience for clubs and visitors alike. To make a donation, please contact us at support@clashware.com for bank transfer details."
- **Contact form placeholder**: "A contact form is coming soon. In the meantime, reach out to us at support@clashware.com."

### What's Missing (Support)
- **No donation button or payment link** — only "contact us for bank transfer details"
- **No contact form yet** (just a placeholder)
- **No transparency on costs** — what does the donation support?
- **No social proof** — who else has donated?

---

## 5. SEARCH / DIRECTORY PAGE — What Visitors See

**URL**: `/{lang}/search?country=ch&activity=...`

### Filters Available
- Country dropdown ("All countries")
- Canton/region dropdown ("All cantons" — appears when country selected)
- City/location typeahead ("Search a city...")
- Activity type dropdown ("All activities")
- "Reset filters" button

### Results Display
- Club count: "{count} clubs"
- Grid of **Club Cards** showing: avatar/logo, club name, activity badge, location
- Each card is clickable → goes to club public page

### Empty State
- "No clubs match these filters"
- "Try a different canton or activity type"

### What's Missing (Search)
- **No map view** — purely list-based
- **No sorting options** (alphabetical, newest, nearest)
- **No search by club name** — only filter-based discovery
- **No featured/highlighted clubs**

---

## 6. CLUB PUBLIC PAGE — What Visitors See

**URL**: `/{lang}/{country}/{club-slug}` (e.g., `/en/ch/ski-club-valais`)

### Page Structure (top to bottom)
1. **Club logo/avatar** + **Club name** (h1)
2. **Description** paragraph
3. **Photos** section — carousel with "Go to photo" button, auto-scroll, pause-on-hover
4. **Schedule / Availability** section
5. **How to Join** section
6. **Contact Information** section:
   - Email
   - Phone
   - Address
   - "Visit our website" button (external link)
7. **Footer**: "Powered by Clashware"

### Navigation (sidebar)
- Home
- Contact
- "Edit site" (only visible to authenticated club admins)

### What's Missing (Club Page)
- **No social sharing buttons**
- **No "Join" or "Contact this club" CTA button** prominently placed at the top
- **No activity type displayed** on the page itself (only in metadata)
- **No location/map** visible on the page
- **No "Similar clubs" or "Other clubs in this area"** suggestions

---

## 7. COUNTRY & CATEGORY LANDING PAGES — What Visitors See

### Country Landing (`/{lang}/{country}`)
- Title: "Clubs in {country}"
- "Browse by activity" — activity pills with club count badges
- "Browse by region" — canton pills (if applicable)
- Full club card grid

### Activity Landing (`/{lang}/{country}/{activity}`)
- Title: "{Activity} clubs in {country}"
- Filtered club cards

### Canton Landing (`/{lang}/{country}/{canton}`)
- Title: "Clubs in {canton}, {country}"
- Filtered club cards

### What's Missing (Landing Pages)
- **No editorial content** — pure listing pages with no personality
- **No intro text** explaining the activity or region
- **No imagery** beyond club logos

---

## 8. APPLICATION FORM — What Club Admins See

**URL**: `/{lang}/apply`

### Page Messaging
- **Title**: "Apply to Join"
- **Subtitle**: "Submit your association's application to join our platform."

### Form Fields
- Association Name, Email, Country, Activity Type, Location (typeahead), Description, How to Join, Desired URL slug
- Optional: Schedule, Phone, Address, Website URL
- Live URL preview as user types slug
- Slug hint: "The final slug will be decided by the platform operator and can be changed at any time."

### Success Message
- "Your application has been submitted successfully! We will review it and get back to you."

### What's Missing (Apply)
- **No explanation of what the club gets** — no "Here's what your page will look like" preview
- **No timeline expectation** — how long until they hear back?
- **No mention it's free** — this is a HUGE selling point buried nowhere
- **"Apply to Join"** sounds like the CLUB is joining something — confusing framing

---

## 9. CLUB ADMIN EXPERIENCE — What Club Admins See After Approval

### Dashboard
- Sidebar with: Club Profile, Messages, Settings
- Tabbed editor: Edit | Preview (side-by-side)
- All profile fields editable: name, description, email, phone, address, schedule, how to join, website
- Logo upload + photo gallery (5-10 photos, drag-to-reorder)
- **Save bar** (sticky) with amber unsaved indicator, Save/Discard buttons
- **Publish toggle** with validation (min 5 photos required)

### Messages
- Threaded chat with platform operator
- "You" vs "Platform" sender labels

### Settings (Owner only)
- Visibility toggle (published/unpublished)
- View public page link
- Invite editors (by email)
- Transfer ownership
- Data export (JSON)

### What's Missing (Admin Experience)
- **No onboarding wizard or guided first steps**
- **No "Your page is X% complete" progress indicator**
- **No tips or guidance** within the editor
- **No "How it looks on Google" preview**

---

## 10. NAVIGATION & FOOTER — What Everyone Sees

### Sidebar Navigation (Public)
- Home, Search, About, Support, Apply (if not logged in or no clubs)

### Sidebar Footer
- Privacy link, Terms link
- "© {year} Clashware"
- Theme toggle (light/dark/system)
- Language switcher (EN, FR, DE, IT)

### Club Page Footer
- "Powered by Clashware" (links back to platform homepage)

### What's Missing (Navigation)
- **No privacy page content** (link exists but page content unknown)
- **No terms page content** (link exists but page content unknown)
- **"Powered by Clashware"** — with a working name, this branding is premature

---

## 11. MULTILINGUAL SUPPORT

- **4 languages**: English, French, German, Italian
- All user-facing copy is translated
- Language switcher in sidebar footer
- URL-based language routing (`/en/`, `/fr/`, `/de/`, `/it/`)
- SEO hreflang tags for all language variants

---

## 12. SEO & DISCOVERABILITY

### What's Implemented
- Dynamic sitemap (all pages, clubs, countries, activities, cantons)
- robots.txt (disallows admin/auth/api routes)
- JSON-LD schemas: WebSite, Organization, SportsClub, LocalBusiness, BreadcrumbList
- OpenGraph meta tags (title, description)
- Hreflang links for all language variants
- Canonical URLs
- Semantic URL structure (`/{lang}/{country}/{club-slug}`)

### What's Missing (SEO)
- **No OpenGraph images** — no og:image for social sharing
- **No Twitter/X card** metadata
- **No blog or content marketing** pages
- **No FAQ page** (could capture long-tail search queries)

---

## 13. ACTIVITY TYPES TAXONOMY

Current supported activities (displayed in dropdowns/filters):
- Skiing, Football, Mountaineering, Rowing, Gymnastics, Yoga, Swimming, Chess
- "Other" (with free-text description)

### What's Missing
- **Very limited taxonomy** — only 8 specific sports + "Other"
- **No cultural activities** explicitly listed (music, theater, art)
- **No social activities** (board games, book clubs, community gardens)
- **"Other" is a catch-all** that reduces discoverability

---

## 14. EMOTIONAL & PSYCHOLOGICAL ANALYSIS

### Current Emotional Tone
- **Clinical/functional** — the platform communicates WHAT it does but not WHY it matters emotionally
- **Minimalist** — "we only show what matters" is a design philosophy, not an emotional hook
- **Missing warmth** — no human stories, no faces, no testimonials, no scenarios

### "Made to Stick" SUCCESs Framework Assessment

| Principle | Current Score | Analysis |
|-----------|:---:|----------|
| **S**imple | 7/10 | "Find your club" is clear and simple. But "open directory for sports clubs and associations" is generic. |
| **U**nexpected | 2/10 | Nothing surprising. No curiosity gap. No "wait, what?" moment. |
| **C**oncrete | 4/10 | Rotating words (yoga class, ski club) add concreteness, but no real stories or specific examples. |
| **C**redible | 3/10 | No social proof. No numbers that matter. No testimonials. No "used by X clubs in Y cities." |
| **E**motional | 3/10 | The About page tries but reads as a mission statement. No emotional scenario like "Marie spent 3 months trying to find a hiking group..." |
| **S**tories | 1/10 | Zero stories anywhere. No user journeys told on the public site. The PRD has great user journeys (Marie, Thomas, Ahmed) but NONE appear on the website. |

---

## 15. COMPREHENSIVE GAP LIST

### Critical (Must address before launch)
1. **No platform name** — "Clashware" is a working name, not a brand
2. **No domain name** — no production URL
3. **No logo or visual identity** — indistinguishable from any template
4. **No "it's free" messaging** — the single biggest hook for clubs is invisible
5. **No social proof** — no testimonials, no club quotes, no usage numbers in context

### High Priority (Significantly impacts stickiness)
6. **No stories on the public site** — the PRD user journeys are gold, but hidden from visitors
7. **No emotional hook on homepage** — functional but not memorable
8. **No "how it works" section** — visitors don't understand the process
9. **No "for clubs" value proposition** on homepage — why should a club admin care?
10. **No OpenGraph images** — social sharing looks blank
11. **Activity taxonomy too narrow** — 8 sports + "Other" limits perceived scope
12. **Apply page doesn't sell** — no mention it's free, no preview of what clubs get

### Medium Priority (Would improve stickiness)
13. **No onboarding guidance** for new club admins
14. **No founder/team story** on About page
15. **No FAQ page**
16. **No blog or content marketing**
17. **No contact CTA on club pages** beyond raw email/phone display
18. **No "similar clubs" suggestions**
19. **No map view** in search
20. **Support page has no actual donation mechanism**

### Low Priority (Nice to have)
21. Social sharing buttons on club pages
22. "How it looks on Google" preview for club admins
23. Club page completion percentage indicator
24. Editorial content on landing pages

---

## 16. WHAT'S WORKING WELL

1. **Clean, uncluttered design** — the minimalism is genuine, not lazy
2. **Multilingual from day one** — 4 languages, proper SEO per language
3. **SEO fundamentals are solid** — sitemap, JSON-LD, hreflang, semantic URLs
4. **The core product works** — you can apply, get approved, build a profile, and be discovered
5. **Club page structure is thoughtful** — schedule, how to join, contact, photos — these are exactly what someone looking for a club needs
6. **Dark/light mode** — polished touch
7. **The rotating words on homepage** — creates visual energy and variety
8. **"We only show what matters"** — this philosophy is a genuine differentiator if communicated well

---

*This brief is ready for the Strategic Advisor to analyze and produce actionable recommendations for messaging, positioning, and stickiness optimization.*
