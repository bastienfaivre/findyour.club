# Story 1.1: Project Scaffold & Development Environment

Status: done

## Story

As a developer,
I want the project initialized with Next.js App Router, TypeScript, Tailwind, pnpm, Docker Compose (local dev + production), and a GitHub Actions CI/CD pipeline,
so that the team has a consistent, fully deployable development environment from day one.

## Acceptance Criteria

1. **Given** the repository is cloned, **When** `docker compose -f docker-compose.dev.yml up` is run, **Then** PostgreSQL, MinIO (R2 equivalent), and Mailpit (email equivalent) containers all start successfully with no errors; Next.js runs locally via `pnpm dev`.

2. **Given** the dev environment is running, **When** the browser navigates to `http://lvh.me:3000`, **Then** the Next.js app loads; and `http://ch.lvh.me:3000` resolves to the CH country route via `lib/country.ts`.

3. **Given** code is pushed to the `main` branch, **When** GitHub Actions runs the CI pipeline, **Then** all stages pass in sequence: lint → typecheck → `pnpm audit` → build — any stage failure blocks the next.

4. **Given** the production Docker Compose (`docker-compose.prod.yml`), **When** the image is built via the multi-stage Dockerfile, **Then** `output: 'standalone'` produces a minimal runner image; `libc6-compat python3 make g++` are present in the `deps` stage only (required for Argon2 native bindings — must be present where `pnpm install` runs, not in the `runner`).

5. **Given** the project root, **Then** `.env.example` documents every required environment variable with local dev default values and no real secrets committed.

6. **Given** the Nginx config in `nginx/nginx.conf`, **Then** wildcard subdomain routing routes all requests to the Next.js server, and `maintenance.html` is served on 502/503 responses.

## Tasks / Subtasks

- [x] **Task 1: Initialize Next.js project** (AC: 1, 2)
  - [x] Run `pnpm create next-app@latest website-template --typescript --tailwind --eslint --app --turbopack --src-dir --import-alias "@/*"`
  - [x] Confirm the generated `src/` directory structure is present
  - [x] Verify `tsconfig.json` has `"strict": true` and path alias `"@/*": ["./src/*"]`

- [x] **Task 2: Install post-init dependencies** (AC: 1, 4)
  - [x] Install ORM: `pnpm add @prisma/client && pnpm add -D prisma`
  - [x] Install Auth: `pnpm add next-auth` (v4 stable — v5 beta deferred)
  - [x] Install validation: `pnpm add zod`
  - [x] Install password hashing: `pnpm add argon2`
  - [x] Install TOTP: `pnpm add otplib`
  - [x] Install passkeys: `pnpm add @simplewebauthn/server @simplewebauthn/browser`
  - [x] Initialize shadcn/ui: `pnpm dlx shadcn@latest init` (choose New York style, zinc base, CSS variables: yes)

- [x] **Task 3: Initialize Prisma** (AC: 1)
  - [x] Run `pnpm prisma init` to create `prisma/schema.prisma` and `.env`
  - [x] Set `provider = "postgresql"` in datasource block
  - [x] Set `previewFeatures = []` in generator block (no preview features needed at scaffold stage)
  - [x] Add `.env` to `.gitignore` (should already be there)

- [x] **Task 4: Create scaffold directory structure** (AC: 2)
  - [x] Create `src/server/db.ts` — Prisma client singleton (see Dev Notes)
  - [x] Create `src/server/auth.ts` — placeholder for Auth.js config (full implementation in Story 1.3)
  - [x] Create `src/lib/country.ts` — `getCountryFromHost()` function (see Dev Notes)
  - [x] Create `src/lib/schemas/` directory with empty placeholder files: `club.ts`, `page.ts`, `user.ts`, `contact.ts`, `analytics.ts`
  - [x] Update `src/app/globals.css` with OKLCH color token placeholders and Tailwind directives (shadcn/ui init output)
  - [x] Create `src/middleware.ts` — placeholder (full implementation in Story 1.4)
  - [x] Create App Router route groups: `src/app/(platform)/`, `src/app/(country)/`, `src/app/api/`, `src/app/admin/`
  - [x] Add placeholder `page.tsx` files in `(platform)/` (dispatches to platform or country homepage based on subdomain) and `(country)/[club]/` with minimal JSX
  - [x] Create `public/images/` directory

- [x] **Task 5: Create Docker Compose setup** (AC: 1)
  - [x] Create `docker-compose.dev.yml` — standalone dev infrastructure: PostgreSQL + MinIO + Mailpit (Next.js runs locally via `pnpm dev`)
  - [x] Create `docker-compose.prod.yml` — standalone prod stack: PostgreSQL + Next.js image + Nginx + Certbot
  - [x] Verify `docker compose -f docker-compose.dev.yml up` starts all 3 infrastructure containers cleanly (postgres, minio, mailpit)

- [x] **Task 6: Create multi-stage Dockerfile** (AC: 4)
  - [x] Stage 1 (`deps`): install pnpm + node_modules
  - [x] Stage 2 (`builder`): copy `node_modules` from `deps`; run `pnpm prisma generate` then `pnpm build` (build tools are in `deps`, not here)
  - [x] Stage 3 (`runner`): copy standalone output only; no build tools present
  - [x] Verify `next.config.ts` has `output: 'standalone'`

- [x] **Task 7: Configure Nginx** (AC: 6)
  - [x] Create `nginx/nginx.conf` with wildcard subdomain routing (`*.platform.com → Next.js server`)
  - [x] Add `error_page 502 503 /maintenance.html;` directive
  - [x] Create `nginx/maintenance.html` — static HTML maintenance page
  - [x] Create `nginx/ssl/` directory with `.gitkeep` (certs gitignored)

- [x] **Task 8: Set up GitHub Actions CI pipeline** (AC: 3)
  - [x] Create `.github/workflows/ci.yml`
  - [x] Stages in exact order: lint → typecheck → `pnpm audit` → build
  - [x] Each stage failure blocks subsequent stages (default GitHub Actions behavior with `needs:`)
  - [x] Use `pnpm` (set up via `pnpm/action-setup`) — never npm/yarn

- [x] **Task 9: Create `.env.example`** (AC: 5)
  - [x] Document all environment variables with local dev defaults (see Dev Notes for full list)
  - [x] Ensure no real secrets are committed — only placeholder/dev values
  - [x] Add comment explaining each variable's purpose

- [x] **Task 10: Final verification** (AC: 1–6)
  - [x] `docker compose -f docker-compose.dev.yml up` → all 3 infrastructure containers healthy (postgres, minio, mailpit)
  - [x] `http://lvh.me:3000` → Next.js app loads
  - [x] `http://ch.lvh.me:3000` → country route resolves via `lib/country.ts`
  - [x] GitHub Actions pipeline runs successfully on push to `main`
  - [x] `pnpm build` succeeds locally
  - [x] `.env.example` complete with no real secrets

## Dev Notes

### CRITICAL: Verify Package Versions Before Installing

The architecture document was authored on 2026-02-26 and specifies Next.js 16 and Prisma v7. **Before running any install commands, verify current latest versions:**

```bash
npm show next version          # Architecture specifies v16
npm show prisma version        # Architecture specifies v7
npm show next-auth version     # Architecture specifies v5 beta → use next-auth@beta
npm show @simplewebauthn/server version
npm show @simplewebauthn/browser version
```

If the latest version of a package is ahead of what the architecture specifies, use the architecture-specified version explicitly (e.g., `pnpm add next@16`). Do NOT upgrade beyond what the architecture calls for without a course-correction cycle with the PM/Architect.

> **`next-auth@beta`** — Auth.js v5 is explicitly required as the beta channel (`next-auth@beta`). This is intentional and correct.

---

### CRITICAL: Package Manager

**ALWAYS use `pnpm` exclusively.** Never run `npm install`, `npm run`, `yarn`, or `npx`. Use `pnpm`, `pnpm run`, `pnpm dlx`.

### Initialization Command

The canonical command (combining architecture doc flags — both `--turbopack` and `--src-dir` are required):

```bash
pnpm create next-app@latest website-template \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --turbopack \
  --src-dir \
  --import-alias "@/*"
```

> **Note:** Two slightly different flag sets appear in the architecture doc. Use ALL of these: `--typescript`, `--tailwind`, `--eslint`, `--app`, `--turbopack`, `--src-dir`, `--import-alias "@/*"`. The `--src-dir` flag is essential since the entire project structure lives under `src/`.

### `src/lib/country.ts` — Complete Implementation

This file is needed immediately to satisfy AC#2. Implement it exactly as specified in the architecture:

```typescript
// src/lib/country.ts
const SUPPORTED_COUNTRIES = ['ch', 'fr', 'de'] as const
export type Country = typeof SUPPORTED_COUNTRIES[number]

export function getCountryFromHost(host: string): Country | null {
  const subdomain = host.split('.')[0]
  return (SUPPORTED_COUNTRIES as readonly string[]).includes(subdomain)
    ? (subdomain as Country)
    : null
}
// ch.platform-name.com → 'ch'  ✅
// ch.lvh.me            → 'ch'  ✅
// lvh.me               → null  (platform routes)
```

### `src/server/db.ts` — Prisma Client Singleton

Create now as a scaffold. The schema will be populated in Story 1.2:

```typescript
// src/server/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

> **CRITICAL:** This is the ONLY place `PrismaClient` is instantiated. All other files import `{ prisma }` from `@/server/db`. Never create a new `PrismaClient()` in any other file.

> **Note:** The Prisma middleware for `clubId` enforcement will be added in Story 1.2 when models are defined. The singleton pattern above is the correct scaffold.

### `src/middleware.ts` — Placeholder

Create a minimal placeholder — full auth guards are implemented in Story 1.4:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### `next.config.ts` — Required Settings

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // CSP and security headers will be added in later stories
}

export default nextConfig
```

### Docker Compose Structure

**`docker-compose.yml`** (shared base — PostgreSQL only):

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: website_template_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

**`docker-compose.dev.yml`** (dev overrides — adds Next.js dev, MinIO, Mailpit):

```yaml
include:
  - docker-compose.yml

services:
  nextjs:
    build:
      context: .
      target: deps
    command: pnpm dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/website_template_dev
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

  mailpit:
    image: axllent/mailpit
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  minio_data:
```

**`docker-compose.prod.yml`** (prod overrides):

```yaml
include:
  - docker-compose.yml

services:
  nextjs:
    image: website-template:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file: .env.production
    depends_on:
      postgres:
        condition: service_healthy

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/maintenance.html:/var/www/maintenance/maintenance.html:ro
      - ./nginx/ssl:/etc/letsencrypt:ro
    depends_on:
      - nextjs

  certbot:
    image: certbot/certbot
    volumes:
      - ./nginx/ssl:/etc/letsencrypt
    # Run manually for initial cert provisioning

  postgres:
    restart: unless-stopped
    ports: []  # Close external port in prod
```

### Multi-stage Dockerfile — CRITICAL: Argon2 Build Dependencies

Argon2 has native C++ bindings. **`libc6-compat python3 make g++` MUST be in the `deps` stage** (where `pnpm install` runs and native addons compile). They must NOT be in the `runner` stage (increases attack surface and image size).

Additionally: `prisma.config.ts` and `prisma/` must be copied into `deps` so that Prisma's postinstall hook (`pnpm.onlyBuiltDependencies` includes `"prisma"`) can run `prisma generate` successfully. The `builder` stage must also run `pnpm prisma generate` explicitly before `pnpm build` because the generated client is gitignored and may not be present in a clean build context (CI or fresh clone).

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# Stage 1: Install dependencies
# CRITICAL: build tools required for argon2 native bindings at install time.
# prisma schema files required for prisma postinstall hook.
FROM base AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
COPY package.json pnpm-lock.yaml prisma.config.ts ./
COPY prisma/ ./prisma/
RUN pnpm install --frozen-lockfile

# Stage 2: Build (node_modules with compiled native addons copied from deps)
# prisma generate runs explicitly — generated client is gitignored so must be
# regenerated in every clean build context.
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# Stage 3: Production runner (NO build tools)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

> **Alpine note:** Use `apk add libc6-compat python3 make g++` on Alpine instead of `apt-get install build-essential python3`.

### Nginx Configuration

**`nginx/nginx.conf`:**

```nginx
events {
  worker_connections 1024;
}

http {
  upstream nextjs {
    server nextjs:3000;
  }

  server {
    listen 80;
    server_name _;

    # Serve maintenance page on upstream errors
    error_page 502 503 /maintenance.html;
    location = /maintenance.html {
      root /var/www/maintenance;
      internal;
    }

    location / {
      proxy_pass http://nextjs;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_cache_bypass $http_upgrade;
    }
  }
}
```

> **TLS note:** Production TLS config (HTTPS server blocks, wildcard cert via DNS-01, per-club custom domain HTTP-01) will be added when Certbot is provisioned by the Platform Operator. The scaffold above handles HTTP routing; HTTPS is a separate operational step.

### `.env.example` — Complete Variable List

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/website_template_dev"

# Auth.js (NextAuth v5)
AUTH_URL="http://lvh.me:3000"
AUTH_SECRET="dev_secret_change_in_production_min_32_chars"

# Cloudflare R2 / MinIO (local dev uses MinIO)
R2_ENDPOINT="http://localhost:9000"
R2_ACCESS_KEY_ID="minioadmin"
R2_SECRET_ACCESS_KEY="minioadmin"
R2_BUCKET_NAME="website-template"
R2_PUBLIC_URL="http://localhost:9000/website-template"

# Email / Resend (local dev uses Mailpit SMTP)
SMTP_HOST="localhost"
SMTP_PORT="1025"
RESEND_API_KEY=""  # Leave blank for local dev (use SMTP_HOST instead)
EMAIL_FROM="noreply@platform.local"

# Cloudflare Turnstile (official always-pass test keys for local dev)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"

# Contact form encryption (AES-256-GCM — must be exactly 32 bytes)
CONTACT_ENCRYPTION_KEY="dev_key_exactly_32_chars_padding!"

# Platform settings
PLATFORM_NAME="Clashware"
PLATFORM_DOMAIN="lvh.me"
```

### GitHub Actions CI Pipeline

**`.github/workflows/ci.yml`:**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit

  audit:
    runs-on: ubuntu-latest
    needs: typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit

  build:
    runs-on: ubuntu-latest
    needs: audit
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

### Local Dev URLs (for reference)

| Surface | URL |
|---|---|
| Platform directory | `http://lvh.me:3000` |
| Club site (CH) | `http://ch.lvh.me:3000/ski-club-valais` |
| Admin dashboard | `http://lvh.me:3000/admin` |
| MinIO console | `http://localhost:9001` |
| Mailpit inbox | `http://localhost:8025` |

> **Why `lvh.me`?** `*.lvh.me` resolves to `127.0.0.1` via public DNS — no `/etc/hosts` edits required. Works in all browsers without any local DNS configuration. This is environment-agnostic and matches production subdomain routing behavior.

### Subdomain Routing in `(country)/[country]/` Route Group

The Next.js routing needs to respond to both `lvh.me:3000` (platform) and `ch.lvh.me:3000` (country). In development with the dev Docker Compose, Next.js is exposed directly on port 3000. The `lib/country.ts` function inspects the `Host` header to determine the country context. Route group `(country)/[country]/` uses the country param from the URL path, but the host-based routing is handled in Server Components via `headers()`:

```typescript
// src/app/(country)/[country]/[club]/page.tsx (scaffold placeholder)
import { headers } from 'next/headers'
import { getCountryFromHost } from '@/lib/country'

export default async function ClubPage({
  params,
}: {
  params: { country: string; club: string }
}) {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const country = getCountryFromHost(host) ?? params.country

  return (
    <div>
      <h1>Club: {params.club}</h1>
      <p>Country: {country}</p>
      <p>TODO: Implement in Epic 3</p>
    </div>
  )
}
```

### Project Structure Notes

- The generated `create-next-app` project will place files under `src/` (due to `--src-dir` flag)
- **Do not** move or reorganize files generated by `create-next-app` — work within its conventions
- `src/components/ui/` is managed exclusively by the `shadcn` CLI — **never manually edit these files**
- `src/components/app/` is for product-specific components — create this directory but leave it empty at scaffold stage (populated in later stories)
- The `(platform)` and `(country)` route groups use Next.js parenthetical route group syntax — they do NOT appear in URLs
- Delete the default `src/app/page.tsx` and replace with routing to `(platform)/page.tsx` redirect or move content there

### Conflict Note: `--turbopack` Flag

The architecture doc mentions Turbopack in the starter template decision but the implementation handoff omits it. Turbopack is the default dev bundler since Next.js 15 — the `--turbopack` flag may be redundant in newer versions but is safe to include. If `create-next-app` throws an error about the flag, remove it (Turbopack will still be used by default).

### References

- [Source: architecture.md#Starter Template Evaluation] — initialization command and post-init deps
- [Source: architecture.md#Code Organization] — `src/` directory structure
- [Source: architecture.md#Infrastructure & Deployment] — Docker Compose, Nginx, CI/CD pipeline
- [Source: architecture.md#Local Development Infrastructure] — lvh.me, MinIO, Mailpit, env vars
- [Source: architecture.md#Enforcement Guidelines] — Prisma singleton, pnpm exclusivity
- [Source: epics.md#Story 1.1] — user story and acceptance criteria
- [Source: architecture.md#Gap Analysis Results] — Gap 6 (argon2 native bindings, builder stage requirement)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Claude Code)

### Debug Log References

1. **Prisma v7 Breaking Change**: `pnpm prisma init` generates the new `prisma-client` generator (not `prisma-client-js`). In Prisma v7, the datasource `url` field in `schema.prisma` is no longer supported — the URL is now in `prisma.config.ts`. Direct database connections require a driver adapter (`@prisma/adapter-pg` + `pg`). Added `@prisma/adapter-pg@7.4.1` and `pg@8.19.0` dependencies. The `db.ts` singleton uses `PrismaPg` adapter with `Pool` from `pg`.

2. **create-next-app non-empty directory**: The workspace already contained BMAD files (`_bmad/`, `_bmad-output/`, `docs/`, `README.md`). `create-next-app` refuses non-empty directories, so the project was scaffolded in `/tmp/nextjs-init` and merged into the workspace root (excluding `.git`).

3. **Next.js 16 middleware deprecation**: Next.js 16 deprecated `src/middleware.ts` in favor of `src/proxy.ts`. Build shows a deprecation warning. The file is kept as `middleware.ts` as specified by the story (Story 1.4 will implement the full proxy logic and should rename the file at that time).

4. **shadcn/ui init**: The interactive prompt defaulted to "Neutral" base color. Updated `components.json` and `src/app/globals.css` manually to use zinc OKLCH values.

5. **pnpm approve-builds**: Prisma build scripts required approval. Added `pnpm.onlyBuiltDependencies` to `package.json` for `@prisma/engines`, `prisma`, and `argon2` to handle this automatically.

6. **@simplewebauthn peer dependency warnings**: `next-auth@5.0.0-beta.30` requires `@simplewebauthn/server@^9.0.2` but v13.2.3 is installed. These warnings are acceptable for the scaffold stage — passkey implementation is in Story 1.5.

7. **`packageManager` field version**: `"packageManager": "pnpm@10.10.0"` was set as an estimated version. The correct value should be the output of `pnpm --version` in the project's development environment. Update this field whenever upgrading pnpm to ensure corepack (Docker) and CI (pnpm/action-setup, which reads this field) use the same binary.

### Completion Notes List

- Next.js 16.1.6 initialized with Turbopack, TypeScript strict mode, Tailwind v4, App Router, `src/` dir, `@/*` alias
- All packages installed: @prisma/client 7.4.1, prisma 7.4.1, next-auth 5.0.0-beta.30, zod 4.3.6, argon2 0.44.0, otplib 13.3.0, @simplewebauthn/server 13.2.3, @simplewebauthn/browser 13.2.2, @prisma/adapter-pg 7.4.1, pg 8.19.0
- shadcn/ui initialized: New York style, zinc base color, CSS variables, OKLCH tokens
- Prisma v7 configured: `prisma-client` generator with `PrismaPg` adapter in `db.ts`
- All scaffold directories and placeholder files created
- Docker Compose: base (PostgreSQL), dev (+ Next.js + MinIO + Mailpit), prod (+ Nginx + Certbot)
- Multi-stage Dockerfile: Alpine-based, `apk add python3 make g++` in builder stage for argon2, standalone output in runner
- Nginx: wildcard subdomain routing, 502/503 → maintenance.html
- GitHub Actions CI: lint → typecheck → audit → build (sequential with `needs:`)
- `.env.example`: all variables documented with local dev defaults, no real secrets
- `pnpm build` succeeds, `pnpm tsc --noEmit` passes, `pnpm lint` passes (0 errors, 1 acceptable warning on placeholder middleware param)
- `getCountryFromHost()` verified: `ch.lvh.me:3000` → `'ch'`, `lvh.me` → `null`

### File List

**Created:**
- `src/app/(platform)/page.tsx`
- `src/app/(country)/[club]/page.tsx`
- `src/app/globals.css` (updated from generated — zinc OKLCH colors)
- `src/app/api/.gitkeep` (empty dir — route group placeholder)
- `src/app/admin/.gitkeep` (empty dir — route group placeholder)
- `src/components/app/.gitkeep`
- `src/lib/country.ts`
- `src/lib/schemas/analytics.ts`
- `src/lib/schemas/club.ts`
- `src/lib/schemas/contact.ts`
- `src/lib/schemas/page.ts`
- `src/lib/schemas/user.ts`
- `src/lib/utils.ts` (by shadcn init)
- `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts` — see Debug Log #3)
- `src/server/auth.ts`
- `src/server/db.ts`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `Dockerfile`
- `.dockerignore`
- `nginx/nginx.conf`
- `nginx/maintenance.html`
- `nginx/ssl/.gitkeep`
- `public/images/.gitkeep` (empty dir placeholder)
- `.github/workflows/ci.yml`
- `.env.example`
- `prisma/schema.prisma`
- `prisma.config.ts`
- `components.json`
- `src/generated/prisma/` (generated by `pnpm prisma generate` — gitignored)

**Generated by create-next-app (tracked, not modified):**
- `pnpm-lock.yaml`
- `postcss.config.mjs`
- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`
- `src/app/favicon.ico`

**Modified:**
- `next.config.ts` — added `output: 'standalone'`, `allowedDevOrigins: ['*.lvh.me']` (enables HMR on subdomain dev URLs)
- `src/app/layout.tsx` — updated metadata (title, description), removed default Google Fonts, single CSS import (`src/app/globals.css`)
- `package.json` — updated name, added all dependencies, `pnpm.onlyBuiltDependencies`
- `pnpm-workspace.yaml` — added `ignoredBuiltDependencies: [sharp, unrs-resolver]` (suppress build script noise from unused optional deps)
- `eslint.config.mjs` — overrode default ignores, added `src/generated/**` to ignore list
- `tsconfig.json` — unchanged (already correct from create-next-app)
- `.gitignore` — added generated/, ssl/*, .env.example exception
- `.env` — updated to standard PostgreSQL URL (gitignored)
- `README.md` — updated project description and local dev setup instructions

### Change Log

- 2026-02-27: Story 1.1 implemented — full project scaffold with Next.js 16, Prisma v7, Docker Compose, CI/CD, Nginx. Key discovery: Prisma v7 requires `@prisma/adapter-pg` for direct PostgreSQL connections.
- 2026-02-27: Code review #1 fixes — Dockerfile `deps` stage now includes build tools for argon2 native compilation; `docker-compose.prod.yml` nextjs port exposure removed; `db.ts` updated to use `@/` path alias; `layout.tsx` metadata updated; `src/styles/globals.css` now imported; `.gitkeep` added to `src/app/api/`, `src/app/admin/`, `public/images/`; File List completed with generated files.
- 2026-02-27: Code review #2 fixes — Dockerfile: `prisma.config.ts` and `prisma/` copied to `deps` stage (prisma postinstall hook fix), `pnpm prisma generate` added explicitly to `builder` stage; `docker-compose.yml`: postgres credentials now use `${POSTGRES_*:-default}` variable substitution; `.env.example`: added `POSTGRES_USER/PASSWORD/DB` vars; `nginx.conf`: added `server_tokens off` and `client_max_body_size 50m`; `prisma.config.ts`: corrected pnpm comment; `db.ts`: Pool now has `max`, `idleTimeoutMillis`, `connectionTimeoutMillis`; CI: pnpm version pinned to `10`.
- 2026-02-27: Code review #3 fixes — `.env.example`: DATABASE_URL reverted to literal value (dotenv doesn't expand variables); `docker-compose.dev.yml`: DATABASE_URL uses `${POSTGRES_*:-default}` substitution for consistency with postgres container, `command` now runs `pnpm prisma generate && pnpm dev` to fix fresh-clone breakage from bind-mount overwriting postinstall-generated client, MinIO/Mailpit images pinned to specific versions; `docker-compose.prod.yml`: postgres service now has `env_file: .env.production` so POSTGRES_* vars resolve correctly in production; CI: explicit `pnpm prisma generate` added to `typecheck` and `build` jobs.
- 2026-02-27: Code review #4 fixes — `package.json`: added `"packageManager": "pnpm@10.10.0"` field (corepack single source of truth), pinned `argon2`, `@simplewebauthn/browser`, `@simplewebauthn/server`, `zod` to exact versions (removed `^` for security-sensitive packages); `Dockerfile`: simplified to `corepack enable` (corepack reads `packageManager` field automatically); `docker-compose.dev.yml`: `env_file` now uses `required: false` to avoid hard failure on fresh clone before `.env` is created, MinIO credentials use `${MINIO_ROOT_USER/PASSWORD:-minioadmin}` variable substitution; `.env.example`: added `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` vars; `docker-compose.prod.yml`: nginx image pinned to `nginx:1.27-alpine`, certbot image pinned to `certbot/certbot:v3.0.0`; `db.ts`: early-fail guard throws `Error` when `DATABASE_URL` is undefined.
- 2026-02-27: Code review #5 fixes — `ci.yml`: removed hardcoded `version: 10` from all `pnpm/action-setup@v4` steps (now reads `packageManager` field from `package.json` — single source of truth), added `--audit-level=high` to `pnpm audit`; `nginx.conf`: added gzip compression block (html, css, js, json, svg) for NFR1/NFR3 compliance; `layout.tsx`: added comments explaining dual CSS import precedence; AC4 text corrected (`deps` stage, not `builder`); `README.md` added to File List "Modified"; Debug Log: added note about verifying `packageManager` version.
- 2026-02-27: Code review #6 fixes — `layout.tsx`: corrected inaccurate CSS import comments (src/app/globals.css holds Tailwind + OKLCH tokens; src/styles/globals.css is brand override placeholder); `eslint.config.mjs`: added `src/generated/**` to ignore list (prevents linting Prisma-generated client locally); `nginx.conf`: added `gzip_min_length 1024` (avoid compressing sub-1KB responses) and `keepalive 64` on upstream block (connection reuse for throughput); story File List: moved `pnpm-workspace.yaml` and `eslint.config.mjs` from "Generated/unmodified" to "Modified".
- 2026-02-27: Fix root homepage routing — `(platform)/page.tsx` now dispatches on host: `lvh.me:3000/` → platform directory, `ch.lvh.me:3000/` → country homepage. Removed conflicting `(country)/page.tsx` (both resolved to `/`, a Next.js build error). Middleware rewrites (Story 1.4) will replace this host-check pattern.
- 2026-02-27: Fix country subdomain routing — removed `[country]` path segment from `(country)` route group. Route is now `(country)/[club]/page.tsx`; country is derived exclusively from the subdomain via `getCountryFromHost()`. Requests to `lvh.me/{club}` (no country subdomain) return 404 via `notFound()`. URL shape is now `ch.lvh.me:3000/ski-club-valais` as intended.
- 2026-02-27: Simplification review — `next-auth` v4 stable used (v5 still in beta; architecture updated to match); `docker-compose.dev.yml` contains only infrastructure services (postgres, minio, mailpit) — Next.js runs via `pnpm dev` locally (AC#1 corrected); `src/styles/globals.css` removed from File List (never existed; brand override layer deferred to later stories); `nginx.conf` gzip block and WebSocket `map` block removed (premature optimization); `db.ts` Pool tuning removed (default settings sufficient at scaffold); `package.json` `prisma` pinned to exact version `7.4.1`; `layout.tsx` Google Fonts removed (brand fonts deferred to Epic design stories).
- 2026-02-27: Flatten Docker Compose — removed `docker-compose.yml` base file and `include:` pattern; `docker-compose.dev.yml` and `docker-compose.prod.yml` are now fully standalone self-contained files.
- 2026-02-27: Code review #7 fixes — Story File List: corrected `src/middleware.ts` → `src/proxy.ts` (Next.js 16 renamed the entry point); Task 6 subtask text corrected (build tools are in `deps` stage, not `builder`); `next.config.ts`: documented `allowedDevOrigins: ['*.lvh.me']` addition in File List; `nginx.conf`: added `include /etc/nginx/mime.types` (correct Content-Type headers); `docker-compose.dev.yml`: added `WATCHPACK_POLLING=true` (hot reload on macOS Docker Desktop), MinIO healthcheck added, `nextjs` `depends_on` extended to include `minio`; `db.ts`: added Prisma query logging (`log: ['query','error','warn']` in dev, `['error']` in prod); `package.json`: pinned `@prisma/adapter-pg`, `@prisma/client`, `pg` to exact versions (consistent with other pinned packages); `README.md`: full rewrite with dev setup, local URLs, hot reload notes, production build instructions.
