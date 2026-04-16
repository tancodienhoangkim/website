# Tân cổ điển Hoàng Kim

Next.js + Payload CMS cho thương hiệu **Tân cổ điển Hoàng Kim** (`hoangkim-tcd.com`). Spec: `docs/superpowers/specs/2026-04-16-hoangkim-tcd-design.md`.

## Prerequisites
- Node 20 (see `.nvmrc`)
- pnpm 9 (`corepack enable`)
- Docker Desktop (for local Postgres)

## Quickstart
```bash
nvm use
corepack enable
pnpm install
cp .env.example .env.local
cp apps/cms/.env.example apps/cms/.env.local
# Edit PAYLOAD_SECRET in both .env.local (openssl rand -base64 48)
docker compose up -d postgres
pnpm --filter cms dev
# Admin UI: http://localhost:3001/admin
# First run: create admin via UI, then:
pnpm seed   # populate placeholder content
```

## Workspace
- `apps/cms/` — Payload 3 CMS (`api.hoangkim-tcd.com` in prod).
- `apps/web/` — Next.js frontend (Plan 2 onwards).

## Scripts
- `pnpm dev` — run all apps in parallel (Turbo)
- `pnpm --filter cms dev` — run CMS only
- `pnpm lint` / `pnpm typecheck` / `pnpm test` — quality gates
- `pnpm seed` — seed placeholder content (idempotent)

### Public site + CMS dual routes

This single Next.js app serves both:

- `/` — public marketing site (homepage shell in Plan 2; more pages in Plans 3–5)
- `/admin` — Payload CMS admin UI

After `pnpm seed`, visit `http://localhost:3000/` for the homepage and `http://localhost:3000/admin` for the CMS.

## Troubleshooting
- **Payload boot fails on DB**: `docker compose ps postgres` → must be healthy. Check `apps/cms/.env.local` has matching `DATABASE_URL`.
- **Admin panel blank**: check browser console; usually missing `importMap.js` or `PAYLOAD_SECRET` mismatch.
- **Seed fails with "user exists"**: that's idempotency working — no action needed.

## Security setup (before production)

1. **Generate strong Payload secret** (48+ chars):
   ```bash
   openssl rand -base64 48
   ```
   Set `PAYLOAD_SECRET` in your deploy provider (Vercel / Railway secret).

2. **HTTP Basic Auth gate on `/admin`** (second factor before Payload login):
   Set `ADMIN_BASIC_AUTH="user:pass"` — middleware base64-encodes for
   comparison. Browser prompts for credentials before Payload's own login
   form loads. Pick a long random password:
   ```bash
   echo "kiemsoat:$(openssl rand -base64 24)"
   ```

3. **Strong admin seed password** (min 16 chars):
   ```bash
   openssl rand -base64 24
   ```
   Set `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD`. Seed script now errors if missing/too short.

4. **Rate limiting on login**: `apps/cms/middleware.ts` throttles
   `POST /api/users/login` to 5 attempts per IP per 15 minutes; subsequent
   attempts return `429` with a 1-hour ban. In-memory store — swap to
   Upstash Redis when scaling beyond a single process.

5. **Security headers**: `next.config.mjs` emits CSP, X-Frame-Options,
   Referrer-Policy, Permissions-Policy, and (production-only) HSTS on
   every response.

6. **Rotate secrets** every 90 days; never commit them.

7. **Back up Postgres daily** and keep encrypted off-site copies.
