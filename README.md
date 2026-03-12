# findyour.club

Multi-tenant club website platform. Each club gets a public site at `/{lang}/{country}/{club-slug}`. The platform directory lives at the root (`/{lang}`).

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Prisma 7 · PostgreSQL 16 · Auth.js v4 · shadcn/ui · Vitest · pnpm

---

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org) v20+
- [pnpm](https://pnpm.io) v10+
- [Docker](https://www.docker.com) (for infrastructure services)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment variables
cp .env.example .env

# 3. Start infrastructure (PostgreSQL, MinIO, Mailpit)
docker compose -f docker-compose.dev.yml up -d

# 4. Run database migrations
pnpm prisma migrate dev

# 5. Seed development data (sample clubs, users, pages, analytics)
pnpm prisma db seed

# 6. Start the dev server
pnpm dev
```

> **Dev credentials (seeded):**
> - Operator: `admin@platform-name.com` / `123456`
> - Club admin (Ski Club Valais): `admin@ski-club-valais.ch` / `admin123`
> - Club admin (Football Club Lausanne): `admin@football-club-lausanne.ch` / `admin123`

The app is now available at:

| Surface | URL |
|---|---|
| Platform home | http://localhost:3000/en |
| Country directory | http://localhost:3000/en/ch |
| Club site | http://localhost:3000/en/ch/{club-slug} |
| Club admin dashboard | http://localhost:3000/en/club/{clubId} |
| Operator dashboard | http://localhost:3000/en/admin |
| Privacy policy | http://localhost:3000/en/privacy |
| Terms of service | http://localhost:3000/en/terms |
| MinIO console | http://localhost:9001 |
| Mailpit inbox | http://localhost:8025 |

### URL routing

Language, country, and club are resolved from URL path segments — no subdomain configuration required:

```
/en/ch/ski-club-valais           → lang=en, country=ch, club=ski-club-valais
/fr/ch                           → lang=fr, country directory (Switzerland)
/en                              → platform home
/en/admin                        → operator dashboard
/en/club/{clubId}                → club admin dashboard
```

---

## Testing

```bash
pnpm test            # Run tests once
pnpm test:watch      # Run tests in watch mode
```

---

## Production Build

```bash
# Build the standalone Docker image
docker build -t findyour-club:latest .

# Start the full prod stack (PostgreSQL + Next.js + Nginx + Certbot)
docker compose -f docker-compose.prod.yml up -d
```

Requires `.env.production` with real credentials (see `.env.example` for all variables).

---

## CI/CD

GitHub Actions runs on every push/PR to `main`:

```
lint → typecheck → audit → build
```

Each stage must pass before the next runs. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## Project Structure

```
src/
  app/
    [lang]/
      (dashboard)/
        [country]/        # Country directory + club pages
        club/[clubId]/    # Club admin dashboard (settings, messages, promote)
        admin/            # Operator dashboard (applications, clubs, users, messages)
        auth/             # Authentication (login, TOTP, passkey, setup)
        account/          # Account settings (profile, password, 2FA, passkeys)
        search/           # Club search
        apply/            # Club application form
        about/            # About page
        support/          # Support page
        privacy/          # Privacy policy
        terms/            # Terms of service
    api/
      auth/               # NextAuth + passkey endpoints
      club/[clubId]/      # QR card, badge, export
      locations/          # Location search
  server/
    db.ts                 # Prisma client singleton + multi-tenant middleware
    auth.ts               # Auth.js config + session helpers
  lib/
    i18n/                 # Translations (EN, FR, DE, IT)
    server/               # Server-side query functions
    schemas/              # Zod validation schemas
    email.ts              # Email (Resend / SMTP)
    r2.ts                 # R2/S3 storage client
    crypto.ts             # AES-256-GCM encryption
    og-image.tsx          # Dynamic OG image generation
  components/
    ui/                   # shadcn/ui components (managed by CLI — do not edit)
    app/                  # Product components
  hooks/                  # Custom React hooks
  types/                  # TypeScript type extensions
  __tests__/              # Unit tests (Vitest)
prisma/
  schema.prisma           # Data model
  seed.ts                 # Development seed data
```

---

## Key Features

- **Multi-tenant:** Each club gets isolated pages, members, settings, and analytics
- **Multi-language:** EN, FR, DE, IT with server-side i18n
- **Multi-country:** Switzerland fully supported; more countries planned
- **Authentication:** Password + TOTP + Passkey (WebAuthn) via Auth.js
- **Content management:** Rich text, image galleries, calendars, documents per club page
- **Club settings:** Data export (ZIP), club deletion with confirmation
- **User management:** Operator dashboard for viewing users, roles, and managed clubs
- **User profiles:** First name, last name, phone, preferred language
- **Security:** AES-256 encrypted contact forms, Cloudflare Turnstile CAPTCHA, multi-tenant middleware, audit logging
- **Storage:** Cloudflare R2 / S3-compatible (MinIO in dev)
- **Email:** Resend (production) + SMTP (Mailpit in dev)
