# Clashware — Website Template

Multi-tenant club website platform. Each club gets a public site at `localhost:3000/{country}/{club-slug}`. The platform directory lives at the root (`localhost:3000`).

**Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Prisma v7 · PostgreSQL 16 · Auth.js v4 · shadcn/ui · pnpm

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
| Platform directory | http://localhost:3000 |
| Club site | http://localhost:3000/{country}/{club-slug} |
| Operator dashboard | http://localhost:3000/admin |
| MinIO console | http://localhost:9001 |
| Mailpit inbox | http://localhost:8025 |

### URL routing

Country and club are resolved from URL path segments — no subdomain configuration required:

```
localhost:3000/ch/ski-club-valais  →  country=ch, club=ski-club-valais
localhost:3000                     →  platform directory
localhost:3000/admin               →  operator dashboard
```

---

## Production Build

```bash
# Build the standalone Docker image
docker build -t website-template:latest .

# Start the full prod stack (PostgreSQL + Next.js + Nginx + Certbot)
docker compose -f docker-compose.prod.yml up -d
```

Requires `.env.production` with real credentials (see `.env.example` for all variables).

---

## CI/CD

GitHub Actions runs on every push to `main`:

```
lint → typecheck → audit → build
```

Each stage must pass before the next runs.

---

## Project Structure

```
src/
  app/
    (platform)/     # Platform routes — localhost:3000/
    (country)/      # Club routes    — localhost:3000/{country}/{club-slug}
    admin/          # Operator dashboard (Story 1.5+)
    api/            # API routes
  server/
    db.ts           # Prisma client singleton (only instantiation point)
    auth.ts         # Auth.js config + getAuthSession() wrapper
  lib/
    country.ts      # Country code validation (URL path param)
    schemas/        # Zod schemas per domain
  components/
    ui/             # shadcn/ui components (managed by shadcn CLI — do not edit)
    app/            # Product components
```
