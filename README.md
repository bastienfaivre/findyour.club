# Clashware — Website Template

Multi-tenant club website platform. Each club gets a public site on a country subdomain (`ch.lvh.me/<club-slug>`). The platform directory lives at the apex (`lvh.me`).

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

# 4. Generate Prisma client
pnpm prisma generate

# 5. Start the dev server
pnpm dev
```

The app is now available at:

| Surface | URL |
|---|---|
| Platform directory | http://lvh.me:3000 |
| Club site (CH) | http://ch.lvh.me:3000/\<club-slug\> |
| MinIO console | http://localhost:9001 |
| Mailpit inbox | http://localhost:8025 |

> `*.lvh.me` resolves to `127.0.0.1` via public DNS — no `/etc/hosts` edits needed.

### Subdomain routing

Country is read from the subdomain via `src/lib/country.ts`:

```
ch.lvh.me:3000/ski-club-valais  →  country=ch, club=ski-club-valais
lvh.me:3000                     →  platform directory
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
    (platform)/     # Platform routes — lvh.me/
    (country)/      # Country routes  — ch.lvh.me/[club]
    admin/          # Admin dashboard (Story 1.4+)
    api/            # API routes
  server/
    db.ts           # Prisma client singleton (only instantiation point)
    auth.ts         # Auth.js config (Story 1.3+)
  lib/
    country.ts      # Subdomain → country resolution
    schemas/        # Zod schemas per domain
  components/
    ui/             # shadcn/ui components (managed by shadcn CLI — do not edit)
    app/            # Product components
```
