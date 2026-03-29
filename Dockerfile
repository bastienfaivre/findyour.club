FROM node:20-alpine AS base
RUN corepack enable

# Stage 1: Install dependencies
# CRITICAL: libc6-compat python3 make g++ required for argon2 native bindings at install time.
# prisma/schema.prisma and prisma.config.ts must be present so the prisma postinstall hook
# (pnpm.onlyBuiltDependencies includes "prisma") can run `prisma generate` successfully.
FROM base AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
COPY package.json pnpm-lock.yaml prisma.config.ts ./
COPY prisma/ ./prisma/
RUN pnpm install --frozen-lockfile

# Stage 2: Build
# Copies compiled node_modules (including argon2 native addon) from deps.
# Runs `prisma generate` explicitly before `next build` to ensure the TypeScript
# client exists regardless of whether it was generated in deps or is gitignored.
# DATABASE_URL is a dummy value so the Prisma client can initialise during page
# data collection — no real connection is made at build time.
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
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

# Stage 4: Migrations runner (used for `docker compose run migrate`)
FROM base AS migrate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY --from=builder /app/src/generated ./src/generated
CMD ["npx", "prisma", "migrate", "deploy"]
