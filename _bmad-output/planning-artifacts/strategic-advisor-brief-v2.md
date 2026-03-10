# Strategic Advisor Brief v2 — Club Directory Platform
*Corrected with founder input — 2026-03-10*

---

## CORE MESSAGE (Founder's Words)

Two layers:

1. **The human need**: We are social creatures. In a world where people tend to stay alone, it is vital to bring them back into the real world. This platform makes that first step — finding a club — as easy as possible.

2. **The internet problem**: The internet is full of overwhelming, unnecessary data. Finding relevant information about clubs is a nightmare: outdated websites, clubs with zero digital presence, lack of clear information scattered across Facebook groups and PDFs. This platform cuts through all of that — visitors lose the least time possible searching for something that's genuinely good for them (social interactions in the real world).

**Critical nuance**: The "isolation/loneliness" angle is the founder's personal WHY — it belongs on the About page and in the pitch to clubs, NOT in the visitor's face while they're searching. The platform itself should just work, cleanly and fast.

---

## FOUNDER CONTEXT

- **Solo developer**, volunteer work, no commercial intent
- **Launching first in French-speaking Switzerland**, then expanding
- **Wants to be the face of the project** — plans a raw, unedited video in French explaining why he built this
- **Video placement**: About page + Apply page (embedded from YouTube). NOT on the homepage.
- **Business model**: Donation-funded. Transparent about hosting costs being the only expense. All development is volunteer.
- **Native language**: French. Platform must feel natural in both French and English.

---

## TWO AUDIENCES — Different Messages

### Audience 1: Visitors (people searching for clubs)
- **Who**: Anyone looking for proper info about clubs, associations, groups. A parent looking for a sport for their child. A foreigner who just arrived in a new city. A local who wants to try something new.
- **What they need**: The platform to just work — fast, clean, relevant results.
- **Message approach**: Minimal. Don't lecture them. Don't slow them down. The product IS the message for visitors.
- **Homepage role**: Get them to their country/search as fast as possible. The CTA IS the country buttons (already implemented).

### Audience 2: Club admins (people who run clubs)
- **Who**: Anyone in a club — could be a 55-year-old club president or a 25-year-old committee member. Not necessarily tech-savvy.
- **What they need**: To be CONVINCED to apply. They need to feel that this platform understands them and that listing their club is worth 10 minutes of their time.
- **Message approach**: Human, powerful, emotional. The "loneliness/isolation" angle works here. The video works here. "Free" works here. The founder's story works here.
- **Apply page role**: This is a SALES page for clubs, not just a form.

---

## WHAT NEEDS TO BE DEFINED

### Tier 1 — Identity

| Element | Current State | Context |
|---------|--------------|---------|
| **Platform name** | None ("Clashware" is the developer's company name, NOT the platform) | Must work phonetically in FR, DE, IT, EN. Easy to remember as a URL. Easy to transmit verbally. Should feel safe/trustworthy to click. Short preferred. Open to real words or invented. |
| **Domain** | None | Must be worldwide (no country-specific extension like .ch). Prefer .com or .org. Must match the platform name. |
| **Positioning tagline** | "Find your club" (current browser tab) | To be evaluated — is this the right framing? |

### Tier 2 — Homepage

| Element | Current State | Notes |
|---------|--------------|-------|
| **Hero headline** | "Find your [rotating word]" | Rotating words: football team, yoga class, hiking group, dance partners, ski club, running crew, chess circle, book club, swim team, community |
| **Hero subtitle** | "Stop spending hours browsing dozens of club websites just to figure out how to join." | Needs rewrite — but must NOT slow the visitor down. Keep it brief. |
| **Philosophy line** | "Here, we only show what matters — nothing more." | Evaluate: keep, move to About, or rewrite? |
| **CTA** | Country buttons ("Available now" / "Coming soon") | These ARE the CTA. No additional button needed. |
| **Stats section** | Club count, countries, activity types | Keep? At launch these numbers will be small. |

### Tier 3 — About Page

| Element | Current State | Notes |
|---------|--------------|-------|
| **Page content** | Generic mission statement paragraph | Needs complete rewrite. This is where the founder's personal story lives. The "loneliness" angle. The WHY. |
| **Video** | Doesn't exist yet | Planned: raw, unedited, French, founder explaining the project. Embedded from YouTube. Advisor should recommend: what to say, how long, what tone. |
| **Business model transparency** | Not mentioned anywhere | "This is volunteer work. Hosting costs are the only expense. Here's what it costs to run." |

### Tier 4 — Apply Page (Club-Facing Sales Page)

| Element | Current State | Notes |
|---------|--------------|-------|
| **Page title** | "Apply to Join" | Confusing framing. Needs rewrite. Must sell the value. |
| **Subtitle** | "Submit your association's application to join our platform." | Bureaucratic. Should be human and compelling. |
| **"Free" messaging** | Absent | The word "free" appears NOWHERE on the platform. This is the #1 selling point for clubs. |
| **Video** | Doesn't exist yet | Same founder video as About page (or a variation). This is where emotional conviction converts club admins. |
| **What clubs get** | Not explained | No preview, no "here's what your page will look like," no benefits listed. |
| **Timeline** | Not mentioned | No indication of how long review takes. |

### Tier 5 — Support/Donation Page

| Element | Current State | Notes |
|---------|--------------|-------|
| **Page name** | "Support" | Is this the right name? Alternatives: "Contribute", "Help us run", "Costs", "Transparency"? |
| **Content** | Generic donation ask + placeholder contact form | Founder wants full transparency: show actual hosting costs, explain that all development is volunteer. |
| **Donation mechanism** | "Contact us for bank transfer details" | No button, no payment link. |

### Tier 6 — Passive Brand Propagation (Indirect Marketing)

Every shared link is a free branded impression. The advisor must address how the platform appears when someone is NOT on the platform — i.e., everywhere a link gets shared or displayed.

| Surface | Current State | What's Needed |
|---------|--------------|---------------|
| **OpenGraph card** (WhatsApp, iMessage, Slack, LinkedIn, Facebook) | Title + description only. NO image. | What should the OG image look like for: homepage, club pages, search pages, apply page? What text, layout, branding? |
| **Twitter/X card** | No Twitter card metadata at all | Card type (summary_large_image?), image, description |
| **Google search snippet** | Meta title + description (functional but generic) | Rewrite to be compelling. What should club page snippets look like vs. homepage vs. landing pages? |
| **Browser tab title** | "[Platform] — Find your club" / "Club Name | [Platform]" | Is this the right format? |
| **URL in conversation** | `platform.com/fr/ch/ski-club-valais` | The URL itself is marketing — is the structure clear and memorable when someone reads it aloud or copies it? |
| **Link preview on native apps** (Apple Messages, Telegram, etc.) | Same as OG — no image | These previews are often the FIRST impression of the platform for new visitors |
| **Google Maps / rich results** | JSON-LD SportsClub + LocalBusiness implemented | Are we maximizing what Google can display? |
| **Nav labels** | Home, Search, About, Support, Apply | Should "Apply" become "List your club" or similar? |
| **Logo/favicon/brand color** | None | Nothing exists. Platform is visually indistinguishable from a template. Critical for all link previews. |

**Key question for the advisor**: Design the ideal "club page shared on WhatsApp" experience end-to-end. What does the link preview show? What does the recipient see? What makes them tap? What do they see when they land?

---

## WHAT'S WORKING WELL (Don't Break These)

1. **Clean, uncluttered design** — minimalism is genuine, not lazy
2. **Multilingual from day one** — 4 languages, proper SEO per language
3. **SEO fundamentals are solid** — sitemap, JSON-LD, hreflang, semantic URLs
4. **The core product works** — apply, get approved, build profile, be discovered
5. **Club page structure is thoughtful** — schedule, how to join, contact, photos = exactly what someone needs
6. **The rotating words on homepage** — creates visual energy and variety
7. **Country buttons as CTA** — direct, functional, gets visitors moving immediately

---

## WHAT THE ADVISOR SHOULD DELIVER

1. **Platform name suggestions** — a list of options that work phonetically in FR/EN/DE/IT, are short, memorable, feel safe, and have available .com or .org domains
2. **Complete homepage copy** — headline, subtitle, any supporting text. Must be minimal and not slow visitors down.
3. **About page copy** — founder story, personal WHY, transparency about costs/volunteer model
4. **Apply page copy** — title, subtitle, value proposition for clubs, "free" messaging
5. **Support/donation page** — recommended name + copy approach with cost transparency
6. **Video guidance** — what the founder should say in the raw video, recommended length, tone, structure
7. **Passive brand propagation strategy** — what every shared link should look like across WhatsApp, Twitter/X, Google, iMessage, etc. OG image design, card format, snippet copy. The full "someone shares a club link" journey.
8. **Rewritten meta descriptions** — for homepage, club pages, landing pages, apply page
9. **Nav label recommendations**
10. **Full SUCCESs framework evaluation** with the corrected core message
11. **Priority action plan** ranked by impact

---

## ACTIVITY TYPES (for context)

Currently supported: Skiing, Football, Mountaineering, Rowing, Gymnastics, Yoga, Swimming, Chess, Other.

This is very limited — only 8 sports + catch-all. Missing: music, theater, dance, martial arts, running, cycling, tennis, volleyball, basketball, board games, cultural activities, etc.

---

## CURRENT PAGE STRUCTURE (for reference)

```
Public pages:
  /{lang}/                    → Homepage (hero + country buttons)
  /{lang}/about               → About page
  /{lang}/support             → Support/donate page
  /{lang}/search              → Directory with filters
  /{lang}/apply               → Club application form
  /{lang}/{country}           → Country landing page
  /{lang}/{country}/{club}    → Club public page
  /{lang}/{country}/{activity}→ Activity category page
  /{lang}/{country}/{canton}  → Region landing page
```
