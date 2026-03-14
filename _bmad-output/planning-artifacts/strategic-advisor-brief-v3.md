# Strategic Advisor Brief v3 — findyour.club
*Updated 2026-03-14 — Post-implementation status report*

---

## WHAT CHANGED SINCE V2 (2026-03-10)

The platform now has a **name, domain, and identity**: **findyour.club**. This was the #1 blocker identified in the v2 analysis. The domain itself IS the tagline — "find your club" — which means every URL shared is a branded message.

### Implementation Status of v2 Recommendations

| # | Recommendation | Status | Notes |
|---|---------------|--------|-------|
| 1 | Add "free" to 5 locations | **DONE** | Apply page, homepage, footer, meta descriptions |
| 2 | Rewrite Apply page | **DONE** | Title → "List Your Club", benefits listed, "free" prominent |
| 3 | Rewrite homepage subtitle | **DONE** | Clean, minimal, gets visitors moving |
| 4 | Remove stats section at low numbers | **PARTIALLY** | Stats shown but with bootstrap messaging when count is low |
| 5 | Move philosophy line to About | **DONE** | |
| 6 | Rename nav "Apply" → "List your club" | **DONE** | |
| 7 | Choose platform name | **DONE** | **findyour.club** — the domain IS the name |
| 8 | Record founder video | **NOT DONE** | Still planned |
| 9 | Dynamic OG images | **DONE** | Per-page OG images for club pages, category pages, static pages |
| 10 | Rewrite About page | **DONE** | Founder story, personal WHY, transparency |
| 11 | Minimal visual identity | **DONE** | Dark theme, clean typography, accent colors per club |
| 12 | Club page preview on Apply page | **NOT DONE** | |
| 13 | Twitter/X card metadata | **DONE** | summary_large_image cards |
| 14 | Rewrite meta descriptions | **DONE** | Per-page SEO metadata |
| 15 | Printable club cards | **DONE** | QR card (PNG) + new A4 poster (PDF) with branded design |
| 16 | Expand activity taxonomy | **PARTIALLY** | Added some, still limited |

### New Features Since v2

1. **Platform name & domain**: `findyour.club` — the URL is the brand. Every shared link contains the message.

2. **Social media links for clubs**: Clubs can now list their Instagram, Facebook, X/Twitter, TikTok, Discord, YouTube, WhatsApp, Telegram, and GitHub. This makes club pages more complete and connects visitors to clubs' existing communities.

3. **Photo carousel with lightbox**: Full-screen photo viewing with keyboard navigation, previous/next peek UI, dot indicators. Professional gallery experience.

4. **Printable A4 poster (PDF)**: Clubs can download a branded A4 poster with their name, QR code linking to their page, club logo, and findyour.club branding. Designed for physical notice boards — bridges online and physical (addresses the "Public" gap in STEPPS).

5. **"Promote" section in club admin**: Dedicated page for clubs to download promotional materials (poster PDF, badge, QR card). Makes it easy for club admins to spread the word.

6. **Improved admin filtering**: Both platform operator and public directory now have removable filter badges, text search, and pagination. Better UX for managing growing lists.

7. **City-level search** (Switzerland): Visitors can search by specific city using the swisstopo API, not just by canton. More precise discovery.

8. **Donation/Support page**: Transparent cost breakdown with "funded until" date. Fully transparent about hosting costs and volunteer model.

9. **Roadmap page**: Public roadmap showing what's planned.

10. **Share prompt on club pages**: After viewing a club page, visitors see a share button. Every share spreads the brand via OG cards.

---

## CURRENT PRODUCT STATE

### What's Live
- **4 languages**: French, German, Italian, English
- **Multilingual SEO**: Hreflang, sitemaps, JSON-LD (SportsClub + LocalBusiness + BreadcrumbList)
- **Club profiles**: Name, description, schedule, how to join, photos, logo, contact info, social links, accent colors
- **Directory**: Filter by country, canton, city (CH), activity type. Text search.
- **Application flow**: 2-step form, Turnstile captcha, operator review with edit/preview
- **Operator admin**: Full CRUD on clubs, applications, users. Force offline, delete, photo management.
- **Club admin**: Profile editing with live preview, logo upload, photo gallery with main photo, promote tools, messaging with platform, visibility toggle, member management, data export
- **Auth**: Email/password, passkeys, TOTP 2FA, password reset, account deletion
- **OG images**: Dynamic per club page, static for platform pages, branded

### What's NOT Live Yet
- Founder video
- Club page preview/mockup on Apply page
- Mobile app
- Map view
- Notifications (email on new message, etc.)
- Blog/content

### Tech Stack
- Next.js 16 (App Router), React 19, TypeScript
- Prisma ORM, PostgreSQL
- Cloudflare R2 for images
- Tailwind CSS + shadcn/ui
- Deployed on [hosting TBD]

---

## CURRENT STRATEGIC POSITION

### Strengths (what's working)
1. **The domain IS the brand**: `findyour.club` is memorable, multilingual, and self-explanatory. Every URL shared is marketing.
2. **Product completeness**: The core product is genuinely complete — a club can sign up, get approved, build a rich profile, and be discovered. This is rare for a solo volunteer project.
3. **SEO fundamentals**: Multilingual, semantic URLs, JSON-LD, sitemaps, hreflang — better than most established competitors.
4. **Physical bridge**: The poster PDF + QR card bridges online and physical worlds. Club notice boards become acquisition channels.
5. **OG images**: Every shared link is now a branded card. WhatsApp, iMessage, social media — all branded.
6. **Transparency model**: Donation-funded, open about costs, volunteer work. This builds genuine trust.
7. **Social links integration**: Clubs can connect their existing social presence, making pages more complete without competing with those platforms.

### Weaknesses (what needs attention)
1. **No clubs yet**: The platform is pre-launch. Zero clubs = zero value for visitors. Classic chicken-and-egg.
2. **No founder video**: The single strongest trust/authority/emotion signal is still missing.
3. **No club page preview on Apply page**: Club admins can't see what they're getting before investing 10 minutes.
4. **Activity taxonomy still limited**: ~10 types. Missing: music, dance, martial arts, running, cycling, tennis, volleyball, basketball, board games, theater, cultural activities, etc.
5. **No social proof**: No testimonials, no "X clubs listed," no success stories.
6. **No email notifications**: Clubs don't get notified of new messages. Users don't get notified of anything.

### Market Context
- **Geography**: Launching in French-speaking Switzerland (Romandie)
- **Target clubs**: Sports clubs, associations, cultural groups — any organized group that meets regularly
- **Competition**:
  - Google: scattered, outdated results
  - Facebook Groups: noisy, unsearchable
  - Municipal PDF lists: static, outdated
  - sport.ch / vereinsverzeichnis.ch: existing but limited, often outdated, poor UX
- **Differentiation**: Free forever, beautiful standardized pages, multilingual, verified, actually maintained

---

## QUESTIONS FOR THE STRATEGIC ADVISOR

### Strategic Questions
1. **Launch strategy**: With zero clubs, how do we bootstrap? What's the optimal sequence — get 10 clubs first, then go public? Or launch empty and fill simultaneously?
2. **Club acquisition playbook**: What's the step-by-step process to get the first 50 clubs? Who do we approach first? What do we say? Through which channels?
3. **The name evaluation**: `findyour.club` — does this change any of the v2 positioning recommendations? The URL-as-brand is unusual. Strengths/risks?
4. **Poster as acquisition tool**: The A4 poster PDF is designed for physical notice boards. Is this a viable acquisition channel? How should clubs be encouraged to use it?
5. **Social links strategy**: Now that clubs can list 9 social platforms, does this change the positioning? Are we complementary to social media or competing?

### Marketing Analysis Questions (new capability)
1. **Channel strategy**: Given zero budget and one person, what are the highest-ROI channels for acquiring clubs in Romandie?
2. **Launch sequence**: What's the optimal week-by-week launch plan for the first 3 months?
3. **Messaging by channel**: How should the pitch differ for: direct outreach to clubs, municipal partnerships, expat communities, social media posts?
4. **Retention**: Once a club is listed, how do we keep them engaged and updating their page?
5. **Measurement**: What metrics matter pre-launch vs. post-launch? What signals tell us we're working?

---

## FOUNDER CONTEXT (unchanged from v2)

- **Solo developer**, volunteer work, no commercial intent
- **Launching first in French-speaking Switzerland**, then expanding
- **Wants to be the face of the project** — plans a raw, unedited video in French
- **Business model**: Donation-funded. Transparent about hosting costs.
- **Native language**: French.

---

## ACTIVITY TYPES (current)

Skiing, Football, Mountaineering, Rowing, Gymnastics, Yoga, Swimming, Chess, Other.

Still very limited — expansion needed before launch.

---

## CURRENT PAGE STRUCTURE

```
Public pages:
  /{lang}/                    → Homepage (hero + country buttons)
  /{lang}/about               → About page (founder story)
  /{lang}/support             → Support/donate (cost transparency)
  /{lang}/roadmap             → Public roadmap
  /{lang}/search              → Directory with filters
  /{lang}/apply               → Club application form ("List your club")
  /{lang}/{country}           → Country landing page
  /{lang}/{country}/{club}    → Club public page
  /{lang}/{country}/{activity}→ Activity category (redirects to search)
  /{lang}/{country}/{canton}  → Region landing (redirects to search)

Club admin:
  /{lang}/club/{id}           → Club profile editor (with live preview)
  /{lang}/club/{id}/promote   → Download poster, badge, QR card
  /{lang}/club/{id}/messages  → Support chat with platform
  /{lang}/club/{id}/settings  → Visibility, members, data export, delete

Platform operator:
  /{lang}/admin/applications  → Review queue with filters
  /{lang}/admin/clubs         → Club management with edit/preview
  /{lang}/admin/users         → User management
  /{lang}/admin/messages      → Support conversations
  /{lang}/admin/settings      → Platform settings, rate limits, toggles
```
