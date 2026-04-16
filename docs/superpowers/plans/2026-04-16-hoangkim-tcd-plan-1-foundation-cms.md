# Tân cổ điển Hoàng Kim — Plan 1: Foundation & CMS Core

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng xong foundation repo + Payload CMS standalone với 13 collections + 5 globals, admin có thể login và CRUD toàn bộ content types, có seed data 3 mẫu/collection.

**Architecture:** Monorepo pnpm + Turborepo. `apps/cms` là Payload 3 mounted trong **Next.js 15 App Router** (đây là cách chính thức Payload 3 chạy standalone — không phải Express). `apps/cms` chỉ serve `/admin` + `/api/*`, không có public pages — đó là job của `apps/web` ở Plan 2. Postgres qua Docker (local) / Neon (staging), media upload Cloudflare R2 (S3-compat adapter). Sau Plan 1, frontend chưa build — admin UI là deliverable chính.

**Tech Stack:** Node 20, pnpm 9, Turborepo 2, **Next.js 15**, Payload 3, PostgreSQL 16, `@payloadcms/db-postgres`, `@payloadcms/next`, `@payloadcms/storage-s3`, Vitest, Biome, Docker Compose.

**Spec reference:** `docs/superpowers/specs/2026-04-16-hoangkim-tcd-design.md` §3 (data model), §7 (repo structure), §11 (security), §13 (seeding).

---

## File Structure (Plan 1 output)

```
hoangkim-tcd/
├── .gitignore
├── .nvmrc
├── .env.example
├── README.md
├── biome.json
├── docker-compose.yml
├── package.json                        workspace root
├── pnpm-workspace.yaml
├── turbo.json
├── .github/workflows/ci.yml
└── apps/cms/
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    ├── next.config.mjs
    ├── vitest.config.ts
    ├── app/
    │   ├── (payload)/                  Payload Next.js route group
    │   │   ├── admin/[[...segments]]/page.tsx    Admin UI
    │   │   ├── admin/[[...segments]]/not-found.tsx
    │   │   ├── api/[...slug]/route.ts  REST
    │   │   ├── api/graphql/route.ts    GraphQL (optional)
    │   │   ├── api/graphql-playground/route.ts
    │   │   └── layout.tsx
    │   └── layout.tsx                  Minimal root layout
    └── src/
        ├── payload.config.ts           Main config
        ├── access/
        │   ├── isAdmin.ts
        │   └── isPublic.ts
        ├── fields/
        │   ├── seo.ts                  Shared seo group field
        │   └── slug.ts                 Shared slug field + hook
        ├── hooks/
        │   ├── slugify.ts
        │   └── revalidate-web.ts       Stub (filled Plan 5)
        ├── collections/
        │   ├── users.ts
        │   ├── media.ts
        │   ├── project-categories.ts
        │   ├── projects.ts
        │   ├── news-categories.ts
        │   ├── news.ts
        │   ├── services.ts
        │   ├── team-members.ts
        │   ├── press-mentions.ts
        │   ├── testimonials.ts
        │   ├── jobs.ts
        │   ├── contact-submissions.ts
        │   ├── subscribers.ts
        │   └── nav-menu.ts
        ├── globals/
        │   ├── site-settings.ts
        │   ├── header.ts
        │   ├── footer.ts
        │   ├── homepage.ts
        │   └── promo-popup.ts
        ├── seed/
        │   ├── index.ts                Entrypoint
        │   ├── users.ts
        │   ├── categories.ts
        │   ├── projects.ts
        │   ├── news.ts
        │   ├── services.ts
        │   ├── team.ts
        │   ├── press.ts
        │   ├── testimonials.ts
        │   ├── jobs.ts
        │   ├── nav-menu.ts
        │   └── globals.ts
        └── __tests__/
            ├── slug.test.ts
            ├── access.test.ts
            └── seed.test.ts
```

---

## Task 1: Initialize repo root

**Files:**
- Create: `/Users/minhlex/Documents/A/.gitignore`
- Create: `/Users/minhlex/Documents/A/.nvmrc`
- Create: `/Users/minhlex/Documents/A/README.md`
- Create: `/Users/minhlex/Documents/A/.env.example`

- [ ] **Step 1: Verify working directory and git status**

Run: `cd /Users/minhlex/Documents/A && ls && git status 2>&1 | head -3`
Expected: thấy `A.html`, `images/`, `docs/` và dòng `fatal: not a git repository`.

- [ ] **Step 2: Initialize git**

Run: `cd /Users/minhlex/Documents/A && git init -b main`
Expected: `Initialized empty Git repository...`

- [ ] **Step 3: Write `.gitignore`**

```gitignore
# Node
node_modules/
.pnpm-store/
.pnpm-debug.log
npm-debug.log*

# Build outputs
dist/
.next/
.turbo/
build/
out/

# Env
.env
.env.local
.env.*.local
!.env.example

# IDE
.vscode/
.idea/
*.swp
.DS_Store

# Logs
logs/
*.log

# Testing
coverage/
.nyc_output/

# Payload
apps/cms/media/
apps/cms/payload-types.ts
```

- [ ] **Step 4: Write `.nvmrc`**

```
20.11.0
```

- [ ] **Step 5: Write minimal `README.md`**

```markdown
# Tân cổ điển Hoàng Kim

Next.js + Payload CMS clone của hoangkim-tcd.com. Xem spec: `docs/superpowers/specs/2026-04-16-hoangkim-tcd-design.md`.

## Dev quickstart
```bash
nvm use
corepack enable
pnpm install
docker compose up -d postgres
pnpm --filter cms dev
# Admin UI: http://localhost:3001/admin
```

## Workspace
- `apps/cms/` — Payload 3 standalone (`api.hoangkim-tcd.vn` in prod).
- `apps/web/` — Next.js frontend (Plan 2 onwards).
```

- [ ] **Step 6: Write `.env.example`**

```ini
# Local dev defaults, copy to .env.local and override as needed
# Postgres
DATABASE_URL=postgres://hoangkim-tcd:hoangkim-tcd@localhost:5432/hoangkim-tcd_cms

# Payload
PAYLOAD_SECRET=change-me-to-a-long-random-string-min-32-chars
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
PORT=3001

# Cloudflare R2 (media)
S3_ENDPOINT=
S3_REGION=auto
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_URL=http://localhost:3001/media

# Webhook to Next.js (wired in Plan 5)
WEB_REVALIDATE_URL=http://localhost:3000/api/revalidate
WEB_REVALIDATE_SECRET=change-me

# Seed admin (only used by seed script)
SEED_ADMIN_EMAIL=admin@hoangkim-tcd.local
SEED_ADMIN_PASSWORD=change-me-admin-pass
```

- [ ] **Step 7: Commit**

```bash
cd /Users/minhlex/Documents/A
git add .gitignore .nvmrc README.md .env.example docs/
git commit -m "chore: bootstrap repo with spec, plan, and ignore rules"
```
Expected: commit tạo thành công, `git log --oneline` cho 1 commit.

---

## Task 2: Setup pnpm workspace + Turborepo + Biome

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `biome.json`

- [ ] **Step 1: Verify pnpm available**

Run: `corepack enable && pnpm --version`
Expected: `9.x.x` or newer. Nếu chưa có: `npm i -g pnpm@latest`.

- [ ] **Step 2: Write root `package.json`**

```json
{
  "name": "hoangkim-tcd",
  "private": true,
  "packageManager": "pnpm@9.12.0",
  "engines": { "node": ">=20.11.0" },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "biome check .",
    "format": "biome format . --write",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "seed": "pnpm --filter cms seed"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "turbo": "^2.1.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 3: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 4: Write `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env.example", "biome.json"],
  "globalEnv": ["NODE_ENV", "CI"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "env": ["DATABASE_URL", "PAYLOAD_SECRET", "PAYLOAD_PUBLIC_SERVER_URL"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

- [ ] **Step 5: Write `biome.json`**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": { "noNonNullAssertion": "off" },
      "suspicious": { "noExplicitAny": "warn" }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": { "quoteStyle": "single", "semicolons": "always" }
  },
  "files": {
    "ignore": ["node_modules", "dist", ".next", ".turbo", "coverage", "payload-types.ts"]
  }
}
```

- [ ] **Step 6: Install root deps**

Run: `pnpm install`
Expected: `pnpm-lock.yaml` created, no errors.

- [ ] **Step 7: Verify lint works on empty repo**

Run: `pnpm lint`
Expected: `Checked X file(s)` with no errors (repo is empty of code).

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json biome.json pnpm-lock.yaml
git commit -m "chore: add pnpm workspace, turborepo, biome"
```

---

## Task 3: Scaffold `apps/cms` package (Next.js + Payload 3)

**Files:**
- Create: `apps/cms/package.json`
- Create: `apps/cms/tsconfig.json`
- Create: `apps/cms/next.config.mjs`
- Create: `apps/cms/vitest.config.ts`
- Create: `apps/cms/.env.example`
- Create: `apps/cms/src/payload.config.ts` (stub)
- Create: `apps/cms/app/layout.tsx`
- Create: `apps/cms/app/(payload)/layout.tsx`
- Create: `apps/cms/app/(payload)/admin/[[...segments]]/page.tsx`
- Create: `apps/cms/app/(payload)/admin/[[...segments]]/not-found.tsx`
- Create: `apps/cms/app/(payload)/api/[...slug]/route.ts`
- Create: `apps/cms/app/(payload)/api/graphql/route.ts`
- Create: `apps/cms/app/(payload)/api/graphql-playground/route.ts`

- [ ] **Step 1: Create directory skeleton**

Run:
```bash
cd /Users/minhlex/Documents/A
mkdir -p apps/cms/src/{access,fields,hooks,collections,globals,seed,__tests__}
mkdir -p "apps/cms/app/(payload)/admin/[[...segments]]"
mkdir -p "apps/cms/app/(payload)/api/[...slug]"
mkdir -p "apps/cms/app/(payload)/api/graphql"
mkdir -p "apps/cms/app/(payload)/api/graphql-playground"
```

- [ ] **Step 2: Write `apps/cms/package.json`**

```json
{
  "name": "cms",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
    "seed": "tsx --env-file=.env.local src/seed/index.ts",
    "generate:types": "payload generate:types",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@payloadcms/db-postgres": "^3.0.0",
    "@payloadcms/next": "^3.0.0",
    "@payloadcms/richtext-lexical": "^3.0.0",
    "@payloadcms/storage-s3": "^3.0.0",
    "graphql": "^16.9.0",
    "next": "^15.0.0",
    "payload": "^3.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "resend": "^4.0.0",
    "sharp": "^0.33.5"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tsx": "^4.19.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Write `apps/cms/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "noEmit": true,
    "declaration": false,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["app/**/*", "src/**/*", "next-env.d.ts", "vitest.config.ts"],
  "exclude": ["node_modules", ".next"]
}
```

- [ ] **Step 4: Write `apps/cms/next.config.mjs`**

```js
import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { reactCompiler: false },
};

export default withPayload(nextConfig);
```

- [ ] **Step 5: Write `apps/cms/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    coverage: { reporter: ['text', 'html'], exclude: ['src/seed/**'] },
  },
});
```

- [ ] **Step 6: Write root app layout (minimal, non-Payload routes unused)**

```tsx
// apps/cms/app/layout.tsx
export const metadata = { title: 'Tân cổ điển Hoàng Kim CMS' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Write Payload route group layout + routes**

```tsx
// apps/cms/app/(payload)/layout.tsx
import config from '../../src/payload.config';
import { RootLayout } from '@payloadcms/next/layouts';
import '@payloadcms/next/css';

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return <RootLayout config={config}>{children}</RootLayout>;
}
```

```tsx
// apps/cms/app/(payload)/admin/[[...segments]]/page.tsx
import type { Metadata } from 'next';
import config from '../../../../src/payload.config';
import { generatePageMetadata, RootPage } from '@payloadcms/next/views';

type Args = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

export default function Page({ params, searchParams }: Args) {
  return RootPage({ config, params, searchParams });
}
```

```tsx
// apps/cms/app/(payload)/admin/[[...segments]]/not-found.tsx
import config from '../../../../src/payload.config';
import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views';

type Args = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config, params, searchParams });
export default function NotFound({ params, searchParams }: Args) {
  return NotFoundPage({ config, params, searchParams });
}
```

```ts
// apps/cms/app/(payload)/api/[...slug]/route.ts
import config from '../../../../src/payload.config';
import { REST_DELETE, REST_GET, REST_PATCH, REST_POST, REST_PUT, REST_OPTIONS } from '@payloadcms/next/routes';

export const GET = REST_GET(config);
export const POST = REST_POST(config);
export const DELETE = REST_DELETE(config);
export const PATCH = REST_PATCH(config);
export const PUT = REST_PUT(config);
export const OPTIONS = REST_OPTIONS(config);
```

```ts
// apps/cms/app/(payload)/api/graphql/route.ts
import config from '../../../../src/payload.config';
import { GRAPHQL_POST, REST_OPTIONS } from '@payloadcms/next/routes';

export const POST = GRAPHQL_POST(config);
export const OPTIONS = REST_OPTIONS(config);
```

```ts
// apps/cms/app/(payload)/api/graphql-playground/route.ts
import config from '../../../../src/payload.config';
import { GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes';

export const GET = GRAPHQL_PLAYGROUND_GET(config);
```

- [ ] **Step 8: Write `apps/cms/src/payload.config.ts` (minimal stub, filled in Task 6+)**

```ts
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  secret: process.env.PAYLOAD_SECRET!,
  admin: {
    user: 'users',
    meta: { titleSuffix: ' · Tân cổ điển Hoàng Kim CMS' },
  },
  editor: lexicalEditor(),
  collections: [],
  globals: [],
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },
});
```

- [ ] **Step 9: Write `apps/cms/.env.example`**

```ini
DATABASE_URL=postgres://hoangkim-tcd:hoangkim-tcd@localhost:5432/hoangkim-tcd_cms
PAYLOAD_SECRET=change-me-to-a-long-random-string-min-32-chars
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
S3_ENDPOINT=
S3_REGION=auto
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_URL=
SEED_ADMIN_EMAIL=admin@hoangkim-tcd.local
SEED_ADMIN_PASSWORD=change-me-admin-pass
```

- [ ] **Step 10: Install workspace deps**

Run: `cd /Users/minhlex/Documents/A && pnpm install`
Expected: all packages installed. Warnings about peer deps OK, no errors.

- [ ] **Step 11: Commit**

```bash
git add apps/cms/
git commit -m "chore(cms): scaffold Payload 3 on Next.js 15 with admin + REST routes"
```

---

## Task 4: Docker Compose Postgres

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Write `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: hoangkim-tcd-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: hoangkim-tcd
      POSTGRES_PASSWORD: hoangkim-tcd
      POSTGRES_DB: hoangkim-tcd_cms
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hoangkim-tcd -d hoangkim-tcd_cms"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  postgres_data:
```

- [ ] **Step 2: Start Postgres**

Run: `docker compose up -d postgres`
Expected: `Container hoangkim-tcd-postgres Started`.

- [ ] **Step 3: Verify Postgres is healthy**

Run: `docker compose ps postgres`
Expected: STATE = `running`, STATUS contains `healthy` (sau ~10s).

- [ ] **Step 4: Verify connection**

Run: `docker compose exec postgres psql -U hoangkim-tcd -d hoangkim-tcd_cms -c 'SELECT version();'`
Expected: một dòng `PostgreSQL 16.x ...`.

- [ ] **Step 5: Copy env**

Run: `cp .env.example .env.local && cp apps/cms/.env.example apps/cms/.env.local`
Edit both: replace `PAYLOAD_SECRET` with output of `openssl rand -base64 48`.

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml
git commit -m "chore: add docker-compose with Postgres 16"
```

---

## Task 5: Boot Next.js + Payload, verify admin loads

**Files:** (no code changes, verification only)

- [ ] **Step 1: Start CMS (Next.js dev)**

Run (in a new terminal): `cd /Users/minhlex/Documents/A && pnpm --filter cms dev`
Expected: `▲ Next.js 15.x.x` then `✓ Ready on http://localhost:3001`.

Nếu lỗi "Cannot find module @payloadcms/next": `pnpm install` lại.
Nếu lỗi DB connection: verify `docker compose ps postgres` → healthy, `apps/cms/.env.local` có `DATABASE_URL` đúng.

- [ ] **Step 2: Open admin**

In browser: http://localhost:3001/admin
Expected: screen "Create First User" (chưa có users nào — vì Users collection chưa register, Payload hiện trang create-first-user chung).

Actually at this stage `collections: []`, Payload UI sẽ báo no collections. Continue to Task 6.

- [ ] **Step 3: Stop dev server (Ctrl+C)**

- [ ] **Step 4: Commit lockfile if updated**

```bash
git add pnpm-lock.yaml
git diff --cached --quiet && echo "no lockfile change" || git commit -m "chore: lockfile from first install"
```

---

## Task 6: Users collection

**Files:**
- Create: `apps/cms/src/collections/users.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write Users collection**

```ts
// apps/cms/src/collections/users.ts
import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'updatedAt'],
  },
  auth: {
    tokenExpiration: 7200,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000,
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req, id }) => req.user?.role === 'admin' || req.user?.id === id,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ],
};
```

- [ ] **Step 2: Register Users in payload.config.ts**

Edit `apps/cms/src/payload.config.ts`, change `collections: []` to import and include Users:

```ts
// add near top
import { Users } from './collections/users';

// replace collections line
collections: [Users],
```

- [ ] **Step 3: Start dev**

Run: `pnpm --filter cms dev`
Expected: no type errors, server boots. DB migration auto-applied (Payload dev mode).

- [ ] **Step 4: Create first admin via UI**

Open http://localhost:3001/admin → fill email, password, name; post-signup set role to `admin` in user edit screen.
Expected: logged in successfully, dashboard shows Users collection.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/collections/users.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add Users collection with role-based access"
```

---

## Task 7: Shared `seo` field builder

**Files:**
- Create: `apps/cms/src/fields/seo.ts`
- Create: `apps/cms/src/__tests__/seo.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// apps/cms/src/__tests__/seo.test.ts
import { describe, it, expect } from 'vitest';
import { seoField } from '../fields/seo';

describe('seoField', () => {
  it('returns a group field named seo with required subfields', () => {
    const f = seoField();
    expect(f.type).toBe('group');
    expect(f.name).toBe('seo');
    const names = (f.fields as Array<{ name: string }>).map((x) => x.name);
    expect(names).toEqual(['metaTitle', 'metaDescription', 'ogImage', 'canonicalOverride', 'noindex']);
  });

  it('accepts an overrides.label option', () => {
    const f = seoField({ label: 'SEO' });
    expect(f.label).toBe('SEO');
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

Run: `pnpm --filter cms test`
Expected: FAIL "Cannot find module '../fields/seo'".

- [ ] **Step 3: Implement `seoField`**

```ts
// apps/cms/src/fields/seo.ts
import type { Field } from 'payload';

export function seoField(overrides: { label?: string } = {}): Field {
  return {
    name: 'seo',
    type: 'group',
    label: overrides.label ?? 'SEO',
    admin: { position: 'sidebar' },
    fields: [
      {
        name: 'metaTitle',
        type: 'text',
        maxLength: 70,
        admin: { description: 'Leave empty to use page title. Max 70 chars.' },
      },
      {
        name: 'metaDescription',
        type: 'textarea',
        maxLength: 170,
        admin: { description: 'Max 170 chars.' },
      },
      { name: 'ogImage', type: 'upload', relationTo: 'media' },
      { name: 'canonicalOverride', type: 'text', admin: { description: 'Leave empty to use default.' } },
      { name: 'noindex', type: 'checkbox', defaultValue: false },
    ],
  };
}
```

- [ ] **Step 4: Run test, confirm pass**

Run: `pnpm --filter cms test`
Expected: PASS both assertions.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/fields/seo.ts apps/cms/src/__tests__/seo.test.ts
git commit -m "feat(cms): add shared seo group field"
```

---

## Task 8: Shared `slug` field + slugify hook

**Files:**
- Create: `apps/cms/src/hooks/slugify.ts`
- Create: `apps/cms/src/fields/slug.ts`
- Create: `apps/cms/src/__tests__/slug.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// apps/cms/src/__tests__/slug.test.ts
import { describe, it, expect } from 'vitest';
import { slugify } from '../hooks/slugify';

describe('slugify', () => {
  it('converts Vietnamese title to URL-safe slug', () => {
    expect(slugify('Biệt thự 3 tầng tân cổ điển')).toBe('biet-thu-3-tang-tan-co-dien');
  });
  it('strips special chars and collapses dashes', () => {
    expect(slugify('Hello --- World!!!')).toBe('hello-world');
  });
  it('handles empty / null gracefully', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
  });
  it('handles đ/Đ specifically', () => {
    expect(slugify('Đinh Tiên Hoàng')).toBe('dinh-tien-hoang');
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

Run: `pnpm --filter cms test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement slugify**

```ts
// apps/cms/src/hooks/slugify.ts
import type { FieldHook } from 'payload';

export function slugify(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const slugifyFromTitle: FieldHook = ({ value, data, operation }) => {
  if (typeof value === 'string' && value.length > 0) return slugify(value);
  if (operation === 'create' && data?.title) return slugify(String(data.title));
  return value;
};
```

- [ ] **Step 4: Run test, confirm pass**

Run: `pnpm --filter cms test`
Expected: all 4 tests PASS.

- [ ] **Step 5: Implement slug field**

```ts
// apps/cms/src/fields/slug.ts
import type { Field } from 'payload';
import { slugifyFromTitle } from '../hooks/slugify';

export function slugField(fieldName: string = 'slug'): Field {
  return {
    name: fieldName,
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: 'URL path. Auto-generated from title if empty.',
    },
    hooks: { beforeValidate: [slugifyFromTitle] },
  };
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/hooks/slugify.ts apps/cms/src/fields/slug.ts apps/cms/src/__tests__/slug.test.ts
git commit -m "feat(cms): add slugify hook and shared slug field"
```

---

## Task 9: Media collection with R2 storage

**Files:**
- Create: `apps/cms/src/collections/media.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write Media collection**

```ts
// apps/cms/src/collections/media.ts
import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { useAsTitle: 'filename' },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  upload: {
    mimeTypes: ['image/*', 'video/mp4', 'application/pdf'],
    imageSizes: [
      { name: 'thumb', width: 150, height: 150, position: 'centre' },
      { name: 'card', width: 600, height: 400, position: 'centre' },
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    { name: 'alt', type: 'text', required: true, admin: { description: 'Describe image for a11y & SEO.' } },
    { name: 'caption', type: 'text' },
  ],
};
```

- [ ] **Step 2: Wire R2 storage adapter**

Edit `apps/cms/src/payload.config.ts`, add imports and plugin:

```ts
// add imports
import { s3Storage } from '@payloadcms/storage-s3';
import { Media } from './collections/media';

// add to buildConfig:
collections: [Users, Media],
plugins: [
  s3Storage({
    collections: { media: { disableLocalStorage: !process.env.S3_BUCKET } },
    bucket: process.env.S3_BUCKET ?? '',
    config: {
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION ?? 'auto',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
      },
      forcePathStyle: true,
    },
  }),
],
```

Note: khi `S3_BUCKET` rỗng (local dev), adapter disable → dùng local filesystem `apps/cms/media/` (already in `.gitignore`).

- [ ] **Step 3: Restart dev, verify upload works**

Run: `pnpm --filter cms dev`
In admin → Media → Upload → chọn bất kỳ file `.jpg` trong `/Users/minhlex/Documents/A/images/`.
Expected: upload thành công, thấy thumbnail.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/collections/media.ts apps/cms/src/payload.config.ts pnpm-lock.yaml
git commit -m "feat(cms): add Media collection with S3/R2 adapter"
```

---

## Task 10: `project-categories` collection (nested)

**Files:**
- Create: `apps/cms/src/collections/project-categories.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write collection**

```ts
// apps/cms/src/collections/project-categories.ts
import type { CollectionConfig } from 'payload';
import { slugField } from '../fields/slug';
import { seoField } from '../fields/seo';

export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  labels: { singular: 'Project Category', plural: 'Project Categories' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'order', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'project-categories',
      admin: { description: 'Leave empty for top-level category.' },
    },
    { name: 'description', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'order', type: 'number', defaultValue: 0, admin: { step: 1 } },
    seoField(),
  ],
};
```

- [ ] **Step 2: Register**

In `payload.config.ts`, import and append:
```ts
import { ProjectCategories } from './collections/project-categories';
// collections: [Users, Media, ProjectCategories],
```

- [ ] **Step 3: Restart + test via admin**

Open admin → create 2 categories: "Biệt thự" (parent=null), "Biệt thự tân cổ điển" (parent=Biệt thự).
Expected: save success, slug auto-generated.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/collections/project-categories.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add ProjectCategories with nested parent"
```

---

## Task 11: `projects` collection

**Files:**
- Create: `apps/cms/src/collections/projects.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write collection**

```ts
// apps/cms/src/collections/projects.ts
import type { CollectionConfig } from 'payload';
import { slugField } from '../fields/slug';
import { seoField } from '../fields/seo';

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'featured', 'updatedAt'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: 'published' } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'project-categories',
      required: true,
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    { name: 'summary', type: 'textarea', maxLength: 300 },
    { name: 'body', type: 'richText' },
    {
      name: 'specs',
      type: 'group',
      fields: [
        { name: 'location', type: 'text' },
        { name: 'area', type: 'number', admin: { description: 'm²' } },
        { name: 'floors', type: 'number' },
        { name: 'year', type: 'number' },
        { name: 'style', type: 'text' },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    seoField(),
  ],
};
```

- [ ] **Step 2: Register**

Add to `payload.config.ts`:
```ts
import { Projects } from './collections/projects';
// collections: [Users, Media, ProjectCategories, Projects],
```

- [ ] **Step 3: Restart + test**

Admin → Projects → create a project with title "Biệt thự 3 tầng tân cổ điển", category=Biệt thự tân cổ điển, upload cover+gallery.
Expected: save success, slug = `biet-thu-3-tang-tan-co-dien`.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/collections/projects.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add Projects collection with gallery, specs, status"
```

---

## Task 12: `news-categories` + `news` collections

**Files:**
- Create: `apps/cms/src/collections/news-categories.ts`
- Create: `apps/cms/src/collections/news.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write news-categories**

```ts
// apps/cms/src/collections/news-categories.ts
import type { CollectionConfig } from 'payload';
import { slugField } from '../fields/slug';

export const NewsCategories: CollectionConfig = {
  slug: 'news-categories',
  labels: { singular: 'News Category', plural: 'News Categories' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'order'] },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'description', type: 'textarea' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
```

- [ ] **Step 2: Write news**

```ts
// apps/cms/src/collections/news.ts
import type { CollectionConfig } from 'payload';
import { slugField } from '../fields/slug';
import { seoField } from '../fields/seo';

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'updatedAt'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: 'published' } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'category', type: 'relationship', relationTo: 'news-categories', required: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'excerpt', type: 'textarea', maxLength: 300 },
    { name: 'body', type: 'richText' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    seoField(),
  ],
};
```

- [ ] **Step 3: Register both**

Add to `payload.config.ts`:
```ts
import { NewsCategories } from './collections/news-categories';
import { News } from './collections/news';
// collections: [Users, Media, ProjectCategories, Projects, NewsCategories, News],
```

- [ ] **Step 4: Restart + smoke test**

Admin → create news-category "Tin ngành"; create news "TÂN CỔ ĐIỂN HOÀNG KIM tổ chức hội thảo" publishedAt=now, status=published.
Expected: save success.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/collections/news-categories.ts apps/cms/src/collections/news.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add NewsCategories and News collections"
```

---

## Task 13: `services` collection

**Files:**
- Create: `apps/cms/src/collections/services.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write collection**

```ts
// apps/cms/src/collections/services.ts
import type { CollectionConfig } from 'payload';
import { slugField } from '../fields/slug';
import { seoField } from '../fields/seo';

export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'order', 'updatedAt'] },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'icon', type: 'upload', relationTo: 'media' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'summary', type: 'textarea', maxLength: 300 },
    { name: 'body', type: 'richText' },
    { name: 'order', type: 'number', defaultValue: 0 },
    seoField(),
  ],
};
```

- [ ] **Step 2: Register, restart, smoke test**

Register in payload.config.ts (`[..., Services]`), restart, create 1 service "Thiết kế kiến trúc".

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/collections/services.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add Services collection"
```

---

## Task 14: `team-members`, `press-mentions`, `testimonials` collections

**Files:**
- Create: `apps/cms/src/collections/team-members.ts`
- Create: `apps/cms/src/collections/press-mentions.ts`
- Create: `apps/cms/src/collections/testimonials.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write team-members**

```ts
// apps/cms/src/collections/team-members.ts
import type { CollectionConfig } from 'payload';

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'role', 'order'] },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
```

- [ ] **Step 2: Write press-mentions**

```ts
// apps/cms/src/collections/press-mentions.ts
import type { CollectionConfig } from 'payload';

export const PressMentions: CollectionConfig = {
  slug: 'press-mentions',
  admin: {
    useAsTitle: 'publicationName',
    defaultColumns: ['publicationName', 'date', 'order'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'publicationName', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', required: true },
    { name: 'articleUrl', type: 'text' },
    { name: 'date', type: 'date' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
```

- [ ] **Step 3: Write testimonials**

```ts
// apps/cms/src/collections/testimonials.ts
import type { CollectionConfig } from 'payload';

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'clientName',
    defaultColumns: ['clientName', 'clientRole', 'rating', 'order'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'clientName', type: 'text', required: true },
    { name: 'clientRole', type: 'text' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'textarea', required: true },
    {
      name: 'rating',
      type: 'select',
      defaultValue: '5',
      options: [
        { label: '★', value: '1' },
        { label: '★★', value: '2' },
        { label: '★★★', value: '3' },
        { label: '★★★★', value: '4' },
        { label: '★★★★★', value: '5' },
      ],
    },
    { name: 'videoUrl', type: 'text', admin: { description: 'YouTube URL (optional).' } },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
```

- [ ] **Step 4: Register in payload.config.ts**

```ts
import { TeamMembers } from './collections/team-members';
import { PressMentions } from './collections/press-mentions';
import { Testimonials } from './collections/testimonials';
// collections: [..., Services, TeamMembers, PressMentions, Testimonials],
```

- [ ] **Step 5: Restart + smoke test**

Create 1 record in each via admin.

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/collections/team-members.ts apps/cms/src/collections/press-mentions.ts apps/cms/src/collections/testimonials.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add TeamMembers, PressMentions, Testimonials"
```

---

## Task 15: `jobs` collection

**Files:**
- Create: `apps/cms/src/collections/jobs.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write collection**

```ts
// apps/cms/src/collections/jobs.ts
import type { CollectionConfig } from 'payload';
import { slugField } from '../fields/slug';
import { seoField } from '../fields/seo';

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'department', 'location', 'status', 'deadline'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: 'open' } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'department', type: 'text' },
    { name: 'location', type: 'text', defaultValue: 'Hà Nội' },
    { name: 'employmentType', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Intern'] },
    { name: 'salaryRange', type: 'text' },
    { name: 'summary', type: 'textarea', maxLength: 300 },
    { name: 'body', type: 'richText' },
    { name: 'deadline', type: 'date' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    seoField(),
  ],
};
```

- [ ] **Step 2: Register, restart, smoke test**

Register in payload.config.ts, create a job "Kiến trúc sư".

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/collections/jobs.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add Jobs collection"
```

---

## Task 16: `contact-submissions` collection (read-only admin)

**Files:**
- Create: `apps/cms/src/collections/contact-submissions.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write collection**

```ts
// apps/cms/src/collections/contact-submissions.ts
import type { CollectionConfig } from 'payload';

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: { singular: 'Contact Submission', plural: 'Contact Submissions' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'source', 'status', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    // Creation only via server token (set in plan 4); no UI create:
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'message', type: 'textarea' },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'contact',
      options: [
        { label: 'Contact form', value: 'contact' },
        { label: 'Quote calculator', value: 'quote' },
        { label: 'Consultation', value: 'consultation' },
        { label: 'Recruitment', value: 'recruitment' },
        { label: 'Newsletter', value: 'newsletter' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    { name: 'metadata', type: 'json', admin: { description: 'Referrer, UTM, form payload extras.' } },
    { name: 'notes', type: 'textarea', admin: { description: 'Internal notes (sales).' } },
  ],
};
```

- [ ] **Step 2: Register, restart**

In payload.config.ts: `import { ContactSubmissions } ... collections: [..., ContactSubmissions]`.

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/collections/contact-submissions.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add ContactSubmissions (public create, auth read)"
```

---

## Task 17: `subscribers` collection

**Files:**
- Create: `apps/cms/src/collections/subscribers.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write collection**

```ts
// apps/cms/src/collections/subscribers.ts
import type { CollectionConfig } from 'payload';

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'source', 'createdAt'] },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    { name: 'source', type: 'text', defaultValue: 'footer' },
    { name: 'unsubscribedAt', type: 'date' },
  ],
};
```

- [ ] **Step 2: Register, restart, commit**

```bash
git add apps/cms/src/collections/subscribers.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add Subscribers collection"
```

---

## Task 18: `nav-menu` collection (nested tree)

**Files:**
- Create: `apps/cms/src/collections/nav-menu.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write collection**

```ts
// apps/cms/src/collections/nav-menu.ts
import type { CollectionConfig } from 'payload';

export const NavMenu: CollectionConfig = {
  slug: 'nav-menu',
  labels: { singular: 'Nav Menu Item', plural: 'Nav Menu Items' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'order', 'url'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'nav-menu',
      admin: { description: 'Leave empty for top-level item.' },
    },
    { name: 'url', type: 'text', admin: { description: 'Absolute or relative. Use /du-an/... for internal.' } },
    {
      name: 'linkType',
      type: 'select',
      defaultValue: 'url',
      options: [
        { label: 'Custom URL', value: 'url' },
        { label: 'Project Category', value: 'project-category' },
        { label: 'Service', value: 'service' },
        { label: 'News Category', value: 'news-category' },
      ],
    },
    {
      name: 'linkedDoc',
      type: 'relationship',
      relationTo: ['project-categories', 'services', 'news-categories'],
    },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'featuredImage', type: 'upload', relationTo: 'media', admin: { description: 'Shown in mega-menu panel.' } },
    {
      name: 'megaMenuLayout',
      type: 'select',
      options: [
        { label: 'Simple dropdown', value: 'simple' },
        { label: 'Mega (grid)', value: 'mega' },
      ],
      defaultValue: 'simple',
    },
  ],
};
```

- [ ] **Step 2: Register, restart, commit**

Register in payload.config.ts.

```bash
git add apps/cms/src/collections/nav-menu.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add NavMenu collection with nested tree + mega layout"
```

---

## Task 19: `site-settings` global

**Files:**
- Create: `apps/cms/src/globals/site-settings.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write global**

```ts
// apps/cms/src/globals/site-settings.ts
import type { GlobalConfig } from 'payload';
import { seoField } from '../fields/seo';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'TÂN CỔ ĐIỂN HOÀNG KIM' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'favicon', type: 'upload', relationTo: 'media' },
    { name: 'hotline', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'address', type: 'textarea' },
    { name: 'hours', type: 'text', admin: { description: 'e.g., 8:00 - 17:30, Mon-Sat' } },
    {
      name: 'social',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'youtube', type: 'text' },
        { name: 'zaloOaId', type: 'text' },
        { name: 'zaloPhone', type: 'text' },
        { name: 'messengerPageId', type: 'text' },
        { name: 'tiktok', type: 'text' },
        { name: 'instagram', type: 'text' },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      fields: [
        { name: 'gtmId', type: 'text' },
        { name: 'ga4Id', type: 'text' },
        { name: 'fbPixelId', type: 'text' },
      ],
    },
    seoField({ label: 'Default SEO' }),
  ],
};
```

- [ ] **Step 2: Register in payload.config.ts**

```ts
import { SiteSettings } from './globals/site-settings';
// globals: [SiteSettings],
```

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/globals/site-settings.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add SiteSettings global"
```

---

## Task 20: `header` + `footer` globals

**Files:**
- Create: `apps/cms/src/globals/header.ts`
- Create: `apps/cms/src/globals/footer.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write header**

```ts
// apps/cms/src/globals/header.ts
import type { GlobalConfig } from 'payload';

export const Header: GlobalConfig = {
  slug: 'header',
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  fields: [
    { name: 'topBarText', type: 'text', admin: { description: 'Small text top of header (promo/bar).' } },
    {
      name: 'ctaButton',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'menuItems',
      type: 'relationship',
      relationTo: 'nav-menu',
      hasMany: true,
      admin: { description: 'Top-level menu items. Nested children read from nav-menu tree.' },
    },
  ],
};
```

- [ ] **Step 2: Write footer**

```ts
// apps/cms/src/globals/footer.ts
import type { GlobalConfig } from 'payload';

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  fields: [
    {
      name: 'columns',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'paymentImages',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    {
      name: 'certImages',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    { name: 'copyright', type: 'text' },
  ],
};
```

- [ ] **Step 3: Register**

In payload.config.ts:
```ts
import { Header } from './globals/header';
import { Footer } from './globals/footer';
// globals: [SiteSettings, Header, Footer],
```

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/globals/header.ts apps/cms/src/globals/footer.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add Header and Footer globals"
```

---

## Task 21: `homepage` global

**Files:**
- Create: `apps/cms/src/globals/homepage.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write homepage**

```ts
// apps/cms/src/globals/homepage.ts
import type { GlobalConfig } from 'payload';
import { seoField } from '../fields/seo';

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  fields: [
    {
      name: 'heroSlides',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'heading', type: 'text' },
        { name: 'subheading', type: 'text' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaUrl', type: 'text' },
      ],
    },
    {
      name: 'featuredCategories',
      type: 'relationship',
      relationTo: 'project-categories',
      hasMany: true,
    },
    {
      name: 'featuredProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: { description: 'Pick 6-12 projects to feature on homepage.' },
    },
    {
      name: 'aboutSnippet',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'richText' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaUrl', type: 'text' },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
    {
      name: 'pressMentions',
      type: 'relationship',
      relationTo: 'press-mentions',
      hasMany: true,
    },
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
    },
    {
      name: 'ctaBlocks',
      type: 'array',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaUrl', type: 'text' },
      ],
    },
    seoField(),
  ],
};
```

- [ ] **Step 2: Register, commit**

In payload.config.ts: `import { Homepage } ... globals: [..., Homepage]`.

```bash
git add apps/cms/src/globals/homepage.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add Homepage global with hero/featured/stats/cta"
```

---

## Task 22: `promo-popup` global

**Files:**
- Create: `apps/cms/src/globals/promo-popup.ts`
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Write global**

```ts
// apps/cms/src/globals/promo-popup.ts
import type { GlobalConfig } from 'payload';

export const PromoPopup: GlobalConfig = {
  slug: 'promo-popup',
  label: 'Promo Popup',
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: false },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'link', type: 'text' },
    { name: 'startDate', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'endDate', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'suppressHours', type: 'number', defaultValue: 24, admin: { description: 'Hours to suppress after dismiss.' } },
  ],
};
```

- [ ] **Step 2: Register, commit**

In payload.config.ts: `import { PromoPopup } ... globals: [..., PromoPopup]`.

```bash
git add apps/cms/src/globals/promo-popup.ts apps/cms/src/payload.config.ts
git commit -m "feat(cms): add PromoPopup global"
```

---

## Task 23: Centralize access helpers + access test

**Files:**
- Create: `apps/cms/src/access/isAdmin.ts`
- Create: `apps/cms/src/access/isPublic.ts`
- Create: `apps/cms/src/__tests__/access.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// apps/cms/src/__tests__/access.test.ts
import { describe, it, expect } from 'vitest';
import { isAdmin, isAuth, isPublic } from '../access/isAdmin';

const mkReq = (role?: 'admin' | 'editor') => ({ req: { user: role ? { id: 'u1', role } : undefined } } as any);

describe('access helpers', () => {
  it('isAdmin true only for admin', () => {
    expect(isAdmin(mkReq('admin'))).toBe(true);
    expect(isAdmin(mkReq('editor'))).toBe(false);
    expect(isAdmin(mkReq())).toBe(false);
  });
  it('isAuth true when logged in', () => {
    expect(isAuth(mkReq('admin'))).toBe(true);
    expect(isAuth(mkReq('editor'))).toBe(true);
    expect(isAuth(mkReq())).toBe(false);
  });
  it('isPublic always true', () => {
    expect(isPublic()).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

Run: `pnpm --filter cms test`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement helpers**

```ts
// apps/cms/src/access/isAdmin.ts
import type { Access } from 'payload';

export const isAdmin: Access = ({ req }) => req.user?.role === 'admin';
export const isAuth: Access = ({ req }) => Boolean(req.user);
export const isPublic: Access = () => true;

// Read: published-only for anon, all for auth
export const isPublishedOrAuth: Access = ({ req }) =>
  req.user ? true : { status: { equals: 'published' } };
```

```ts
// apps/cms/src/access/isPublic.ts
export { isPublic } from './isAdmin';
```

- [ ] **Step 4: Run test, confirm pass**

Run: `pnpm --filter cms test`
Expected: all 3 tests PASS.

- [ ] **Step 5: (Optional refactor) Replace inline access in collections**

For each collection with `read/create/update/delete` inlined, you can swap to `isAuth`, `isAdmin`, `isPublishedOrAuth` imports. This is optional cleanup — skip if tight on time.

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/access/ apps/cms/src/__tests__/access.test.ts
git commit -m "feat(cms): centralize access helpers with tests"
```

---

## Task 24: Seed script

**Files:**
- Create: `apps/cms/src/seed/index.ts`
- Create: `apps/cms/src/seed/users.ts`
- Create: `apps/cms/src/seed/categories.ts`
- Create: `apps/cms/src/seed/projects.ts`
- Create: `apps/cms/src/seed/news.ts`
- Create: `apps/cms/src/seed/services.ts`
- Create: `apps/cms/src/seed/team.ts`
- Create: `apps/cms/src/seed/press.ts`
- Create: `apps/cms/src/seed/testimonials.ts`
- Create: `apps/cms/src/seed/jobs.ts`
- Create: `apps/cms/src/seed/nav-menu.ts`
- Create: `apps/cms/src/seed/globals.ts`
- Create: `apps/cms/src/__tests__/seed.test.ts` (idempotency smoke)

- [ ] **Step 1: Write entrypoint**

```ts
// apps/cms/src/seed/index.ts
// Env loaded by tsx --env-file=.env.local (see package.json script)
import { getPayload } from 'payload';
import config from '../payload.config';
import { seedUsers } from './users';
import { seedCategories } from './categories';
import { seedProjects } from './projects';
import { seedNews } from './news';
import { seedServices } from './services';
import { seedTeam } from './team';
import { seedPress } from './press';
import { seedTestimonials } from './testimonials';
import { seedJobs } from './jobs';
import { seedNavMenu } from './nav-menu';
import { seedGlobals } from './globals';

async function run() {
  const p = await getPayload({ config });
  p.logger.info('🌱 Seeding Tân cổ điển Hoàng Kim CMS...');
  const admin = await seedUsers(p);
  const cats = await seedCategories(p);
  const projects = await seedProjects(p, cats);
  const newsCats = await seedNews(p, admin);
  const services = await seedServices(p);
  const team = await seedTeam(p);
  const press = await seedPress(p);
  const testimonials = await seedTestimonials(p);
  await seedJobs(p);
  await seedNavMenu(p, cats, services);
  await seedGlobals(p, { projects, press, testimonials, services });
  p.logger.info('✅ Seed complete');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Write users seed (idempotent via findOrCreate)**

```ts
// apps/cms/src/seed/users.ts
import type { Payload } from 'payload';

export async function seedUsers(p: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@hoangkim-tcd.local';
  const existing = await p.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 });
  if (existing.docs[0]) {
    p.logger.info(`user exists: ${email}`);
    return existing.docs[0];
  }
  return p.create({
    collection: 'users',
    data: {
      email,
      password: process.env.SEED_ADMIN_PASSWORD ?? 'admin-please-change',
      name: 'Admin',
      role: 'admin',
    },
  });
}
```

- [ ] **Step 3: Write categories seed (3 top + 2 nested children = 5)**

```ts
// apps/cms/src/seed/categories.ts
import type { Payload } from 'payload';

const TOP = [
  { title: 'Biệt thự', description: 'Thiết kế biệt thự đa phong cách.' },
  { title: 'Lâu đài - Dinh thự', description: 'Công trình đỉnh cao.' },
  { title: 'Nhà phố', description: 'Nhà phố, shophouse hiện đại.' },
];
const CHILDREN = [
  { title: 'Biệt thự tân cổ điển', parentTitle: 'Biệt thự' },
  { title: 'Biệt thự hiện đại', parentTitle: 'Biệt thự' },
];

export async function seedCategories(p: Payload) {
  const map = new Map<string, string>();
  for (const t of TOP) {
    const existing = await p.find({ collection: 'project-categories', where: { title: { equals: t.title } }, limit: 1 });
    const doc = existing.docs[0] ?? (await p.create({ collection: 'project-categories', data: t as any }));
    map.set(t.title, doc.id);
  }
  for (const c of CHILDREN) {
    const existing = await p.find({ collection: 'project-categories', where: { title: { equals: c.title } }, limit: 1 });
    if (existing.docs[0]) { map.set(c.title, existing.docs[0].id); continue; }
    const doc = await p.create({
      collection: 'project-categories',
      data: { title: c.title, parent: map.get(c.parentTitle)! } as any,
    });
    map.set(c.title, doc.id);
  }
  return map;
}
```

- [ ] **Step 4: Write projects seed (3 samples)**

```ts
// apps/cms/src/seed/projects.ts
import type { Payload } from 'payload';

const SAMPLES = [
  {
    title: 'Biệt thự 3 tầng tân cổ điển',
    categoryTitle: 'Biệt thự tân cổ điển',
    summary: 'Công trình 3 tầng phong cách tân cổ điển, 350m² sàn, Hà Nội.',
    specs: { location: 'Hà Nội', area: 350, floors: 3, year: 2024, style: 'Tân cổ điển' },
  },
  {
    title: 'Biệt thự hiện đại 2 tầng',
    categoryTitle: 'Biệt thự hiện đại',
    summary: 'Thiết kế tối giản 2 tầng, 240m², Vĩnh Phúc.',
    specs: { location: 'Vĩnh Phúc', area: 240, floors: 2, year: 2023, style: 'Hiện đại' },
  },
  {
    title: 'Lâu đài tân cổ điển 4 tầng',
    categoryTitle: 'Lâu đài - Dinh thự',
    summary: 'Lâu đài 4 tầng kiểu Pháp, 720m², Quảng Bình.',
    specs: { location: 'Quảng Bình', area: 720, floors: 4, year: 2024, style: 'Tân cổ điển Pháp' },
  },
];

export async function seedProjects(p: Payload, cats: Map<string, string>) {
  const ids: string[] = [];
  for (const s of SAMPLES) {
    const existing = await p.find({ collection: 'projects', where: { title: { equals: s.title } }, limit: 1 });
    if (existing.docs[0]) { ids.push(existing.docs[0].id); continue; }
    // Placeholder media: first media doc if any, else skip cover
    const media = await p.find({ collection: 'media', limit: 1 });
    const coverImage = media.docs[0]?.id;
    const doc = await p.create({
      collection: 'projects',
      data: {
        title: s.title,
        category: cats.get(s.categoryTitle)!,
        summary: s.summary,
        specs: s.specs,
        coverImage,
        status: 'published',
        publishedAt: new Date().toISOString(),
      } as any,
    });
    ids.push(doc.id);
  }
  return ids;
}
```

- [ ] **Step 5: Write remaining seed modules (compact — same pattern)**

```ts
// apps/cms/src/seed/news.ts
import type { Payload } from 'payload';

export async function seedNews(p: Payload, admin: { id: string }) {
  const catTitle = 'Tin ngành';
  let cat = (await p.find({ collection: 'news-categories', where: { title: { equals: catTitle } }, limit: 1 })).docs[0];
  cat ??= await p.create({ collection: 'news-categories', data: { title: catTitle } as any });
  const posts = [
    'TÂN CỔ ĐIỂN HOÀNG KIM đạt top 10 thương hiệu tiêu biểu',
    'Xu hướng thiết kế biệt thự 2026',
    'Báo chí viết về TÂN CỔ ĐIỂN HOÀNG KIM',
  ];
  for (const title of posts) {
    const existing = await p.find({ collection: 'news', where: { title: { equals: title } }, limit: 1 });
    if (existing.docs[0]) continue;
    await p.create({
      collection: 'news',
      data: {
        title,
        category: cat.id,
        excerpt: title,
        author: admin.id,
        publishedAt: new Date().toISOString(),
        status: 'published',
      } as any,
    });
  }
  return cat.id;
}
```

```ts
// apps/cms/src/seed/services.ts
import type { Payload } from 'payload';

const SERVICES = [
  'Thiết kế kiến trúc',
  'Thi công trọn gói',
  'Thiết kế nội thất',
  'Thi công xây dựng cơ bản',
  'Thi công hoàn thiện nội thất',
  'Sản xuất nội thất',
];

export async function seedServices(p: Payload) {
  const ids: string[] = [];
  for (let i = 0; i < SERVICES.length; i++) {
    const title = SERVICES[i]!;
    const existing = await p.find({ collection: 'services', where: { title: { equals: title } }, limit: 1 });
    if (existing.docs[0]) { ids.push(existing.docs[0].id); continue; }
    const doc = await p.create({
      collection: 'services',
      data: { title, summary: title, order: i } as any,
    });
    ids.push(doc.id);
  }
  return ids;
}
```

```ts
// apps/cms/src/seed/team.ts
import type { Payload } from 'payload';

export async function seedTeam(p: Payload) {
  const members = [
    { name: 'Nguyễn Văn A', role: 'Kiến trúc sư trưởng' },
    { name: 'Trần Thị B', role: 'Giám đốc thiết kế nội thất' },
    { name: 'Lê Văn C', role: 'Giám sát công trình' },
  ];
  const ids: string[] = [];
  for (let i = 0; i < members.length; i++) {
    const m = members[i]!;
    const existing = await p.find({ collection: 'team-members', where: { name: { equals: m.name } }, limit: 1 });
    if (existing.docs[0]) { ids.push(existing.docs[0].id); continue; }
    const doc = await p.create({ collection: 'team-members', data: { ...m, order: i } as any });
    ids.push(doc.id);
  }
  return ids;
}
```

```ts
// apps/cms/src/seed/press.ts
import type { Payload } from 'payload';

const PRESS = ['Báo Xây Dựng', 'Tạp Chí Kiến Trúc', 'VTC News'];

export async function seedPress(p: Payload) {
  const media = await p.find({ collection: 'media', limit: 1 });
  const logo = media.docs[0]?.id;
  const ids: string[] = [];
  for (let i = 0; i < PRESS.length; i++) {
    const name = PRESS[i]!;
    const existing = await p.find({ collection: 'press-mentions', where: { publicationName: { equals: name } }, limit: 1 });
    if (existing.docs[0]) { ids.push(existing.docs[0].id); continue; }
    if (!logo) { p.logger.warn('No media to use as press logo; skipping.'); continue; }
    const doc = await p.create({
      collection: 'press-mentions',
      data: { publicationName: name, logo, order: i } as any,
    });
    ids.push(doc.id);
  }
  return ids;
}
```

```ts
// apps/cms/src/seed/testimonials.ts
import type { Payload } from 'payload';

const T = [
  { clientName: 'Anh Tuấn', clientRole: 'Chủ nhà', content: 'Đội ngũ TÂN CỔ ĐIỂN HOÀNG KIM rất chuyên nghiệp.' },
  { clientName: 'Chị Lan', clientRole: 'Chủ dự án', content: 'Hài lòng với chất lượng thi công.' },
  { clientName: 'Anh Hùng', clientRole: 'Kiến trúc sư', content: 'Bàn giao đúng tiến độ.' },
];

export async function seedTestimonials(p: Payload) {
  const ids: string[] = [];
  for (let i = 0; i < T.length; i++) {
    const t = T[i]!;
    const existing = await p.find({ collection: 'testimonials', where: { clientName: { equals: t.clientName } }, limit: 1 });
    if (existing.docs[0]) { ids.push(existing.docs[0].id); continue; }
    const doc = await p.create({
      collection: 'testimonials',
      data: { ...t, rating: '5', order: i } as any,
    });
    ids.push(doc.id);
  }
  return ids;
}
```

```ts
// apps/cms/src/seed/jobs.ts
import type { Payload } from 'payload';

export async function seedJobs(p: Payload) {
  const jobs = [
    { title: 'Kiến trúc sư', department: 'Design' },
    { title: 'Giám sát công trình', department: 'Construction' },
  ];
  for (const j of jobs) {
    const existing = await p.find({ collection: 'jobs', where: { title: { equals: j.title } }, limit: 1 });
    if (existing.docs[0]) continue;
    await p.create({ collection: 'jobs', data: { ...j, summary: `Vị trí ${j.title}`, status: 'open' } as any });
  }
}
```

```ts
// apps/cms/src/seed/nav-menu.ts
import type { Payload } from 'payload';

export async function seedNavMenu(p: Payload, _cats: Map<string, string>, _services: string[]) {
  const tops = [
    { title: 'Về TÂN CỔ ĐIỂN HOÀNG KIM', url: '/ve-chung-toi/gioi-thieu', order: 1 },
    { title: 'Dịch vụ', url: '/dich-vu', order: 2 },
    { title: 'Dự án', url: '/du-an', order: 3 },
    { title: 'Tin tức', url: '/tin-tuc', order: 4 },
    { title: 'Liên hệ', url: '/lien-he', order: 5 },
  ];
  for (const t of tops) {
    const existing = await p.find({ collection: 'nav-menu', where: { title: { equals: t.title } }, limit: 1 });
    if (existing.docs[0]) continue;
    await p.create({ collection: 'nav-menu', data: t as any });
  }
}
```

```ts
// apps/cms/src/seed/globals.ts
import type { Payload } from 'payload';

type Refs = {
  projects: string[];
  press: string[];
  testimonials: string[];
  services: string[];
};

export async function seedGlobals(p: Payload, refs: Refs) {
  await p.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'TÂN CỔ ĐIỂN HOÀNG KIM',
      hotline: '0981 234 567',
      email: 'info@hoangkim-tcd.com',
      address: 'Số 1, Đường ABC, Hà Nội',
      hours: '8:00 - 17:30, T2 - T7',
    } as any,
  });

  await p.updateGlobal({
    slug: 'header',
    data: {
      topBarText: 'Hotline 0981 234 567 · Tư vấn miễn phí',
      ctaButton: { label: 'Đăng ký tư vấn', url: '/dang-ky-tu-van' },
    } as any,
  });

  await p.updateGlobal({
    slug: 'footer',
    data: {
      columns: [
        { title: 'Công ty', links: [
          { label: 'Giới thiệu', url: '/ve-chung-toi/gioi-thieu' },
          { label: 'Đội ngũ', url: '/ve-chung-toi/doi-ngu' },
        ] },
        { title: 'Dịch vụ', links: [{ label: 'Thiết kế kiến trúc', url: '/dich-vu/thiet-ke-kien-truc' }] },
      ],
      copyright: '© 2026 TÂN CỔ ĐIỂN HOÀNG KIM. All rights reserved.',
    } as any,
  });

  await p.updateGlobal({
    slug: 'homepage',
    data: {
      featuredProjects: refs.projects,
      pressMentions: refs.press,
      testimonials: refs.testimonials,
      stats: [
        { label: 'Dự án hoàn thành', value: '500+' },
        { label: 'Năm kinh nghiệm', value: '15' },
        { label: 'Tỉnh thành phục vụ', value: '63' },
      ],
    } as any,
  });

  await p.updateGlobal({
    slug: 'promo-popup',
    data: { enabled: false, suppressHours: 24 } as any,
  });
}
```

- [ ] **Step 6: Run seed**

Run: `cd /Users/minhlex/Documents/A && pnpm seed`
Expected: logs `🌱 Seeding Tân cổ điển Hoàng Kim CMS...` … `✅ Seed complete`, exit 0.

- [ ] **Step 7: Verify via admin**

Login at http://localhost:3001/admin. Check each collection has ≥1 record, each global has data.

- [ ] **Step 8: Re-run seed to verify idempotency**

Run: `pnpm seed` (lần 2).
Expected: logs `user exists: admin@...`, no duplicates in any collection.

- [ ] **Step 9: Write idempotency test**

```ts
// apps/cms/src/__tests__/seed.test.ts
import { describe, it, expect } from 'vitest';

// This is a smoke test: assumes `pnpm seed` ran at least once.
// It checks idempotency shape by counting expected records via REST.
// Skip in CI if PAYLOAD not reachable.
const API = process.env.CMS_TEST_URL ?? 'http://localhost:3001/api';

async function count(collection: string): Promise<number> {
  try {
    const res = await fetch(`${API}/${collection}?limit=0`);
    if (!res.ok) return -1;
    const j = await res.json();
    return Number(j.totalDocs ?? -1);
  } catch {
    return -1;
  }
}

describe('seed idempotency (smoke)', () => {
  it.skipIf(!process.env.CMS_TEST_URL)('projects has exactly 3 seeded', async () => {
    expect(await count('projects')).toBe(3);
  });
  it.skipIf(!process.env.CMS_TEST_URL)('services has exactly 6 seeded', async () => {
    expect(await count('services')).toBe(6);
  });
});
```

- [ ] **Step 10: Commit**

```bash
git add apps/cms/src/seed/ apps/cms/src/__tests__/seed.test.ts
git commit -m "feat(cms): add idempotent seed script for all collections/globals"
```

---

## Task 25: Integration test — create + query project via local API

**Files:**
- Create: `apps/cms/src/__tests__/projects-api.test.ts`

- [ ] **Step 1: Write integration test**

```ts
// apps/cms/src/__tests__/projects-api.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { getPayload, type Payload } from 'payload';
import config from '../payload.config';

const hasDb = Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
let payload: Payload;

describe.skipIf(!hasDb)('projects collection (local API)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config });
  });

  it('rejects create without category (required field)', async () => {
    await expect(
      payload.create({ collection: 'projects', data: { title: 'No cat' } as any }),
    ).rejects.toThrow();
  });

  it('rejects anonymous read of draft', async () => {
    const cat = await payload.create({ collection: 'project-categories', data: { title: `t-${Date.now()}` } as any });
    const draft = await payload.create({
      collection: 'projects',
      data: { title: `draft-${Date.now()}`, category: cat.id, status: 'draft' } as any,
    });
    const result = await payload.find({
      collection: 'projects',
      where: { id: { equals: draft.id } },
      overrideAccess: false, // simulate anon
    });
    expect(result.docs.length).toBe(0);
  });
});
```

Env handling: vitest runs with process env. Locally, run `pnpm --filter cms exec dotenv -e .env.local -- pnpm test`, or source env inline: `DATABASE_URL=... pnpm test`. In CI, env vars set in workflow (see Task 26).

Add a guard so the integration test skips when DB isn't available:

```ts
// at top of projects-api.test.ts, after imports
const hasDb = Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);

describe.skipIf(!hasDb)('projects collection (local API)', () => {
  // ...
});
```

- [ ] **Step 2: Run tests**

Run: `pnpm --filter cms test`
Expected: both tests PASS. (Note: requires DATABASE_URL reachable; ensure `docker compose up -d postgres` first.)

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/__tests__/projects-api.test.ts
git commit -m "test(cms): integration test for projects access + validation"
```

---

## Task 26: CI pipeline

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write workflow**

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: hoangkim-tcd
          POSTGRES_PASSWORD: hoangkim-tcd
          POSTGRES_DB: hoangkim-tcd_cms
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U hoangkim-tcd"
          --health-interval 5s
          --health-timeout 3s
          --health-retries 10
    env:
      DATABASE_URL: postgres://hoangkim-tcd:hoangkim-tcd@localhost:5432/hoangkim-tcd_cms
      PAYLOAD_SECRET: ci-secret-32-chars-long-enough-to-pass-validation
      PAYLOAD_PUBLIC_SERVER_URL: http://localhost:3001
      NODE_ENV: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
```

- [ ] **Step 2: Commit + push**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions pipeline with Postgres service"
# If remote configured:
# git push -u origin main
```

- [ ] **Step 3: Verify locally that pipeline steps pass**

Run sequentially:
```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
```
Expected: all 4 green.

---

## Task 27: README polish + Plan 1 exit

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README with complete quickstart**

```markdown
# Tân cổ điển Hoàng Kim

Next.js + Payload CMS clone của hoangkim-tcd.com. Spec: `docs/superpowers/specs/2026-04-16-hoangkim-tcd-design.md`.

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
- `apps/cms/` — Payload 3 CMS (`api.hoangkim-tcd.vn` in prod).
- `apps/web/` — Next.js frontend (Plan 2 onwards).

## Scripts
- `pnpm dev` — run all apps in parallel.
- `pnpm lint` — Biome check.
- `pnpm typecheck` — tsc across apps.
- `pnpm test` — Vitest across apps.
- `pnpm seed` — seed placeholder content (idempotent).

## Deployment (future)
- CMS → Railway (Plan 6).
- Web → Vercel (Plan 6).
- DB → Neon Postgres (Plan 6).
- Media → Cloudflare R2 (Plan 6).
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: complete Plan 1 quickstart in README"
```

- [ ] **Step 3: Verify Plan 1 exit criteria**

Checklist (all must be ✅):
- [ ] `docker compose up -d postgres` → healthy
- [ ] `pnpm install && pnpm --filter cms dev` → admin UI at :3001/admin
- [ ] `pnpm seed` runs twice without error, no duplicates in DB
- [ ] 13 collections visible in admin UI:
      users, media, project-categories, projects, news-categories, news, services,
      team-members, press-mentions, testimonials, jobs, contact-submissions,
      subscribers, nav-menu (14 total counting both)
- [ ] 5 globals visible: site-settings, header, footer, homepage, promo-popup
- [ ] `pnpm test` green (slug, seo, access, seed smoke, projects-api)
- [ ] `pnpm lint` green
- [ ] `pnpm typecheck` green
- [ ] Git log shows ~27 commits, one per task

- [ ] **Step 4: Final commit + tag**

```bash
git tag -a plan-1-complete -m "Plan 1: Foundation & CMS core complete"
```

---

## Plan 1 Exit Summary

Sau Plan 1, bạn có:
- Monorepo chạy được (pnpm + Turborepo).
- Payload CMS standalone với 14 collections (counted users + media + 12 content) + 5 globals.
- Admin UI CRUD toàn bộ content types.
- Seed idempotent với placeholder data.
- CI pipeline chạy lint + typecheck + test trên push.

**Next:** Plan 2 — Homepage pixel-perfect. Plan 2 sẽ scaffold `apps/web` (Next.js 15), port legacy CSS từ `images/`, build Header + Footer + MegaMenu + homepage sections đọc từ CMS, visual regression test chống A.html.

**Pending from spec not yet covered:**
- Frontend rendering (Plans 2-3)
- Forms + email + reCAPTCHA (Plan 4)
- Third-party widgets + SEO + analytics (Plan 5)
- Deploy + monitoring (Plan 6)
- On-demand revalidation webhook stub (will be filled in Plan 5)

---

## Self-Review Notes

**Spec coverage (Plan 1 scope only):**
- §3 Data model: ✅ all 13 content collections + Users + Media + 5 globals present.
- §6 Design system: N/A (frontend, Plan 2).
- §11 Security: access helpers added (Task 23), full CSP/CORS in Plan 5-6.
- §13 Seeding: ✅ placeholder + 3 mẫu/collection (some have fewer when spec calls for ≥3, see Task 24).

**Placeholder scan:** no TBD/TODO — all code inline.

**Type consistency:** `seoField()`, `slugField()`, `isAdmin`/`isAuth`/`isPublic`/`isPublishedOrAuth` names used consistently. `status` enum uses `draft|published` in Projects and News, and `open|closed` in Jobs — this is intentional semantic difference.

**Known pragmatic deviations:**
- Strict TDD not applied to every collection declaration (pure schema is tautological to test). TDD applied to: slugify, seo field, access helpers, seed idempotency, projects validation/access. This is a deliberate choice noted in Plan 1.
