# Architect Briefing: MVP Scope Pivot — Single-Page Club Profile

**Date:** 2026-03-07
**From:** PM (John)
**To:** Architect
**Context:** PRD has been updated. Epic 3 is complete. Before starting Epic 4, the MVP scope has been significantly reduced. This briefing asks you to evaluate architectural and schema impact.

## What Changed

The MVP club presence has been simplified from a **multi-page CMS** (pages, content elements, navigation, version history) to a **single-page club profile** with fixed fields. The architecture must retain extensibility for multi-page expansion post-MVP.

### New MVP Club Profile

A single, fixed-layout page per club with:
- Name, logo, description (text)
- Photo carousel (5-10 images, auto-scrolling, pause on hover)
- Schedule/availability (free-text field)
- Contact info (email, phone, address, optional external website link)
- "How to join" (free-text field)

### New Application Flow

The application form now collects the club profile fields directly (name, activity type, description, schedule, contact info, how to join, optional website URL). **No photo upload at application time** (prevents storage abuse). Upon approval, these fields seed the club profile — no duplicate data entry. The admin then uploads photos and publishes when ready.

### New Visibility Model

Two independent flags control club page visibility:

| Flag | Controlled by | Purpose |
|------|--------------|---------|
| `isPublished` | Club Admin | Admin chooses when to go live; offline by default after approval |
| `forceOffline` | Platform Operator | Hard override — admin CANNOT publish while this is true |

**Page visible only when:** `isPublished = true` AND `forceOffline = false`

### Unified Operator Message System

A single `OperatorMessage` model replaces the current `OperatorNudge` concept. Used for:
- Change requests during application review (bundled in approval email)
- Post-live moderation messages (request changes, explain why page was forced offline)
- Any operator-to-club-admin communication

Same DB model, same admin dashboard UI (persistent banner until read), same email notification — regardless of when the message is sent.

## Questions for the Architect

### 1. Schema Impact Assessment

**Club profile fields:** Where should `description`, `schedule`, `howToJoin` live?
- Option A: Directly on the `Club` model (simple, but couples club identity to content)
- Option B: As JSONB content on a single `Page` record (consistent with future multi-page expansion)
- Option C: Dedicated `ClubProfile` model (separates identity from page content)

The architect should recommend based on extensibility toward multi-page sites post-MVP.

**Application model:** Currently `Application` has `name`, `activityTypeId`, `description`, `websiteUrl`. New fields needed: `schedule`, `contactEmail`, `contactPhone`, `contactAddress`, `howToJoin`. Should these be added as columns or as a JSONB `profileData` field?

**Club photos:** Need a `ClubPhoto` model or similar (id, clubId, url, order, uploadedAt). Or should photos be stored as JSONB array on the club/page? Consider that post-MVP, the gallery element will also manage images — should this be the same model?

**Visibility flags:** `isPublished` (boolean, default false) and `forceOffline` (boolean, default false) — presumably on the `Club` model. Confirm placement.

**OperatorMessage model:** Replaces `OperatorNudge`. Fields: id, clubId, message (text), createdAt, readAt (nullable). The current `OperatorNudge` model in the schema should be evaluated for replacement or adaptation.

### 2. Application → Club Profile Data Flow

When an application is approved:
1. Application fields are copied/linked to club profile fields
2. Club is created with `isPublished = false`, `forceOffline = false`
3. If operator included a message, an `OperatorMessage` is created
4. Acceptance email sent (with operator message if present)
5. Admin logs in, sees pre-populated profile, uploads photos, publishes

**Question:** Should the application store the raw submitted data and the club profile be a separate copy? Or should approval simply promote the application data into the club record? Consider: what happens if the admin edits their profile later — do we need to preserve the original application data for audit?

### 3. Existing Schema Models — Keep, Modify, or Defer?

| Model | Current Purpose | Recommendation |
|-------|----------------|----------------|
| `Page` | Multi-page content storage | **Keep** — may store the single profile page content; needed post-MVP |
| `PageElement` | Content blocks within pages | **Defer usage** — not needed for fixed-layout profile; keep model for post-MVP |
| `ContentVersion` | Version history snapshots | **Defer usage** — keep model, not populated in MVP |
| `Event` | Calendar events | **Defer usage** — keep model for post-MVP |
| `GalleryItem` | Gallery images/videos | **Evaluate** — could this serve as `ClubPhoto` for MVP? Or separate model? |
| `Document` | Document library | **Defer usage** |
| `ContactSubmission` | Contact form submissions | **Defer usage** — no contact form in MVP |
| `OperatorNudge` | Operator notifications to clubs | **Replace** with unified `OperatorMessage` model |

### 4. Existing Code Impact (Epics 2 & 3)

**Epic 2 (Application & Onboarding):**
- Application form needs additional fields (schedule, contact details, how to join)
- Approval flow needs to seed club profile from application data
- Approval flow needs optional operator message support
- Acceptance email template needs to include operator message when present

**Epic 3 (Public Platform Site & Discovery):**
- Story 3.3 (club home page rendering) needs to render the new profile layout (description, photo carousel, schedule, contact, how to join) instead of generic page content
- Story 3.4 (inner page navigation) — code stays but effectively unused since there's only one page; no rework needed, navbar simply has nothing to iterate over

### 5. New Capabilities Needing Architecture Decisions

1. **Photo upload flow:** Presigned URLs to R2/MinIO (consistent with existing architecture for file uploads). Max 10 images per club. Need to define max file size, accepted formats, and whether server-side resizing/optimization is needed.

2. **Photo carousel rendering:** Server-rendered as part of the club profile page. Auto-scrolling with pause on hover — this is a client-side behavior on a server-rendered page. Confirm this is handled via a client component island.

3. **Operator force-offline UX:** When a club page is forced offline, what does a visitor see? 404? A generic "this page is temporarily unavailable" message? Redirect to directory?

4. **Operator message email integration:** Approval email with bundled message vs. standalone moderation email. Same `OperatorMessage` DB record, but different email templates. Confirm email service (Resend) supports this pattern cleanly.

## Summary of Deliverables Expected

1. Updated architecture document reflecting schema changes
2. ADR for club profile data model (where profile fields live)
3. ADR for visibility control model (two-flag system)
4. ADR for unified operator message model (replacing OperatorNudge)
5. Confirmation of what existing models/code can remain unchanged vs. needs modification
6. Updated project structure if new routes/components are needed

## Reference

- Updated PRD: `_bmad-output/planning-artifacts/prd.md` (see edit history entry for 2026-03-07, MVP scope pivot)
- Current schema: `prisma/schema.prisma`
- Current architecture: `_bmad-output/planning-artifacts/architecture.md`
