# Plan 2 — Homepage Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the hoangkim-tcd.com homepage shell (header, hero, about, lead-capture, press logos, footer, floating widgets) from `A.html` into the existing Next.js + Payload app, achieving pixel-identical layout driven by Plan 1's CMS globals and collections.

**Architecture:** Single Next.js 15 app hosts both `/admin` (existing `(payload)` route group) and `/` (new `(site)` route group). Public Server Components fetch from Payload via direct `getPayload({ config })` calls — no HTTP round-trip. Vendor CSS/JS from `images/` is copied verbatim into `public/vendor/` to preserve pixel fidelity. Swiper v11 replaces Owl Carousel for hero + press logos; jQuery/Owl remain loaded globally for any legacy markup copied over but aren't depended on in new React code.

**Tech Stack:** Next.js 15 App Router · React 19 · Payload 3 · Swiper 11 · TypeScript 5.6 · Vitest · Biome

**Parent spec:** `docs/superpowers/specs/2026-04-16-plan-2-homepage-shell-design.md`

**Revision 1 (post-validation):** Three validation agents found seven blockers in the initial draft — wrong field names on 4 globals/collections, Next.js root-layout conflict with Payload admin, missing image `remotePatterns`, and a broken seed CWD path. This revision:
- Moves vendor CSS/JS out of root `layout.tsx` (avoids `<html>` nesting with Payload admin)
- Adds `images.remotePatterns` to `next.config.mjs`
- Uses actual schema fields: `hotline` (not `phone`), `social.facebook` / `social.zaloPhone` / `social.messengerPageId` (not flat `socials`/`zalo`/`messenger`), `publicationName` / `articleUrl` (not `name`/`sourceUrl`)
- Extends `header` global with `leftMenu` / `rightMenu` array fields (Task 6, option 6a)
- Wraps all queries with `React.cache()` to deduplicate per-render
- Fixes `seedMedia` path (uses `import.meta.url`) and `seedGlobals` signature
- Preserves Plan 1 seed's existing homepage fields — extension only adds `heroSlides`, `aboutSnippet`, `ctaBlocks`

---

## File Structure

### New files (apps/cms)

```
apps/cms/
├── app/
│   └── (site)/
│       ├── layout.tsx                     # header + footer + widgets wrapper
│       └── page.tsx                       # homepage composition
├── src/
│   ├── components/site/
│   │   ├── Header.tsx                     # server component
│   │   ├── Footer.tsx                     # server component
│   │   ├── FloatingWidgets.tsx            # server component
│   │   ├── Hero.tsx                       # 'use client', Swiper
│   │   ├── AboutSlogan.tsx                # server component
│   │   ├── LeadCaptureBanner.tsx          # server component
│   │   └── PressMentionsCarousel.tsx      # 'use client', Swiper
│   ├── lib/
│   │   └── queries.ts                     # typed Payload query wrappers
│   ├── seed/
│   │   └── media.ts                       # NEW: seed placeholder images
│   └── __tests__/
│       ├── queries.test.ts                # with DB guard
│       └── homepage-render.test.ts        # with DB guard
└── public/
    └── vendor/
        ├── css/                           # 9 CSS files verbatim from images/
        ├── js/                            # 7 JS files verbatim from images/
        ├── fonts/                         # font-awesome glyph fonts
        └── images/
            ├── logo.png                   # hoangkim-tcd-logo.png
            ├── map.jpg                    # hoangkim-tcd-map.jpg
            └── seed/                      # 6 placeholder jpg for media seed
```

### Modified files

| File | Change |
|------|--------|
| `apps/cms/package.json` | Add `swiper` dependency |
| `apps/cms/app/layout.tsx` | Link vendor CSS in `<head>`, load jQuery + plugins with `next/script` |
| `apps/cms/src/seed/globals.ts` | Populate `heroSlides`, `aboutSnippet`, `ctaBlocks` on homepage |
| `apps/cms/src/seed/index.ts` | Invoke `seedMedia()` before globals |
| `README.md` | Document dual-route deployment (`/` site + `/admin` CMS) |

---

## Task 1: Install Swiper and stage vendor assets

**Files:**
- Modify: `apps/cms/package.json`
- Create: `apps/cms/public/vendor/css/` (copy 9 files)
- Create: `apps/cms/public/vendor/js/` (copy 7 files)
- Create: `apps/cms/public/vendor/fonts/`
- Create: `apps/cms/public/vendor/images/logo.png`, `map.jpg`, `seed/*.jpg`

- [ ] **Step 1: Add Swiper dependency**

Run from repo root:
```bash
pnpm --filter cms add swiper@^11
```

Verify `apps/cms/package.json` has `"swiper": "^11..."` under `dependencies`.

- [ ] **Step 2: Create vendor directory**

```bash
mkdir -p apps/cms/public/vendor/{css,js,fonts,images/seed}
```

- [ ] **Step 3: Copy vendor CSS verbatim from images/**

```bash
cp images/bootstrap.min.css      apps/cms/public/vendor/css/
cp images/font-awesome.css       apps/cms/public/vendor/css/
cp images/owl.carousel.css       apps/cms/public/vendor/css/
cp images/jquery-ui.css          apps/cms/public/vendor/css/
cp images/main.css               apps/cms/public/vendor/css/ 2>/dev/null || true
cp images/main2.css              apps/cms/public/vendor/css/ 2>/dev/null || true
cp images/megamenu.css           apps/cms/public/vendor/css/ 2>/dev/null || true
cp images/page.css               apps/cms/public/vendor/css/ 2>/dev/null || true
cp images/css_custom.css         apps/cms/public/vendor/css/
cp images/animate.min.css        apps/cms/public/vendor/css/
cp images/jquery.gritter.min.css apps/cms/public/vendor/css/
```

Some files (`main.css`, `main2.css`, `megamenu.css`, `page.css`) may not exist in `images/` — any missing file is OK; check with `ls apps/cms/public/vendor/css/` after.

- [ ] **Step 4: Copy vendor JS verbatim from images/**

```bash
cp images/jquery.2.1.1.min.js    apps/cms/public/vendor/js/
cp images/bootstrap.min.js       apps/cms/public/vendor/js/
cp images/owl.carousel.min.js    apps/cms/public/vendor/js/  2>/dev/null || \
  echo "owl missing — check images/ for alt name"
cp images/jquery.lazy.min.js     apps/cms/public/vendor/js/
cp images/jquery.lazy.plugins.min.js apps/cms/public/vendor/js/
cp images/jquery.validate.min.js apps/cms/public/vendor/js/
cp images/js_custom.js           apps/cms/public/vendor/js/
```

- [ ] **Step 5: Copy Font Awesome glyph fonts**

```bash
ls images/ | grep -Ei "fontawesome-webfont\.(woff2?|ttf|eot|svg)" | \
  xargs -I{} cp images/{} apps/cms/public/vendor/fonts/
```

- [ ] **Step 6: Copy logo, map, and 6 placeholder seed images**

```bash
cp images/hoangkim-tcd-logo.png apps/cms/public/vendor/images/logo.png
cp images/hoangkim-tcd-map.jpg  apps/cms/public/vendor/images/map.jpg

# 6 placeholder hero/content images (must exist in images/)
for f in hoangkim-tcd-year-end-party-2025.jpg nha-may-san-xuat-noi-that-hoangkim-tcd.jpg \
         2.jpg bia-pv.jpg 1126-1.jpg biet-thu-20-ty-ha-noi.jpg; do
  cp "images/$f" "apps/cms/public/vendor/images/seed/$f"
done
```

- [ ] **Step 7: Commit**

```bash
git add apps/cms/package.json apps/cms/public/vendor pnpm-lock.yaml
git commit -m "feat(web): stage vendor assets and install Swiper for homepage shell"
```

---

## Task 2: Minimal root layout + next.config image remotePatterns

**Critical:** The root `app/layout.tsx` must NOT emit `<html>` / `<body>` / vendor CSS — Payload's admin RootLayout emits its own `<html>` tree, and nesting breaks hydration. Vendor CSS belongs in `(site)/layout.tsx` only (Task 3). The admin uses its own Payload stylesheet, the site uses Bootstrap 3 + custom CSS — neither leaks into the other.

**Files:**
- Modify: `apps/cms/app/layout.tsx`
- Modify: `apps/cms/next.config.mjs`

- [ ] **Step 1: Keep root layout minimal**

Write `apps/cms/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Tân cổ điển Hoàng Kim', template: '%s · Tân cổ điển Hoàng Kim' },
  description: 'Thiết kế tận tâm – Thi công tận lực',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
```

The `(payload)` route group supplies its own admin-specific layout; the `(site)` route group (Task 3) attaches vendor CSS and scripts to public pages only.

- [ ] **Step 2: Add `images.remotePatterns` to next.config.mjs**

Replace `apps/cms/next.config.mjs`:

```js
import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { reactCompiler: false },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'http',  hostname: 'localhost' },
    ],
  },
};

export default withPayload(nextConfig);
```

- [ ] **Step 3: Verify admin still boots**

```bash
pnpm --filter cms dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin
kill %1
```

Expected: `200` or `307`. Not `500`.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/app/layout.tsx apps/cms/next.config.mjs
git commit -m "feat(web): minimal root layout + image remotePatterns for CMS media"
```

---

## Task 3: Scaffold (site) route group with vendor CSS/JS

This layout wraps every public page (homepage + future Plan 3–5 pages). Vendor CSS/JS is scoped here so it never reaches `/admin`. jQuery loads with `afterInteractive` (document order) so plugins can defer via `$(document).ready` until jQuery is available.

**Files:**
- Create: `apps/cms/app/(site)/layout.tsx`
- Create: `apps/cms/app/(site)/page.tsx`

- [ ] **Step 1: Create site layout with vendor CSS + ordered scripts**

Write `apps/cms/app/(site)/layout.tsx`:

```tsx
import Script from 'next/script';

const VENDOR_CSS = [
  '/vendor/css/bootstrap.min.css',
  '/vendor/css/font-awesome.css',
  '/vendor/css/owl.carousel.css',
  '/vendor/css/jquery-ui.css',
  '/vendor/css/animate.min.css',
  '/vendor/css/jquery.gritter.min.css',
  '/vendor/css/main.css',
  '/vendor/css/main2.css',
  '/vendor/css/megamenu.css',
  '/vendor/css/page.css',
  '/vendor/css/css_custom.css',
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {VENDOR_CSS.map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="default" />
      ))}
      {children}
      {/* jQuery loads first in document order; plugins defer via $(document).ready */}
      <Script src="/vendor/js/jquery.2.1.1.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/bootstrap.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/owl.carousel.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/jquery.lazy.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/jquery.lazy.plugins.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/jquery.validate.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/js_custom.js" strategy="lazyOnload" />
    </>
  );
}
```

Missing files (`main.css`, `main2.css`, `megamenu.css`, `page.css`) are harmless — the browser just logs a 404 and continues. Plan can tighten this once real files are confirmed after Task 1.

- [ ] **Step 2: Create placeholder homepage**

Write `apps/cms/app/(site)/page.tsx`:

```tsx
export const revalidate = 3600;

export default function HomePage() {
  return (
    <main>
      <h1>Tân cổ điển Hoàng Kim — Homepage shell (Plan 2)</h1>
      <p>Sections arrive as components are implemented in later tasks.</p>
    </main>
  );
}
```

- [ ] **Step 3: Verify both routes resolve**

```bash
pnpm --filter cms dev &
sleep 8
curl -s -o /dev/null -w "/ = %{http_code}\n/admin = %{http_code}\n" \
     http://localhost:3000/ \
     http://localhost:3000/admin
kill %1
```

Expected: `/` = 200, `/admin` = 200 or 307. Check admin still renders without Bootstrap reset bleed.

- [ ] **Step 4: Commit**

```bash
git add "apps/cms/app/(site)"
git commit -m "feat(web): (site) route group scopes vendor CSS/JS away from admin"
```

---

## Task 4: Typed Payload query wrappers

**Files:**
- Create: `apps/cms/src/lib/queries.ts`
- Create: `apps/cms/src/__tests__/queries.test.ts`

- [ ] **Step 1: Write failing test**

Write `apps/cms/src/__tests__/queries.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getSiteSettings, getHeader, getFooter, getHomepage, getPressMentions } from '../lib/queries';

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)('Payload query helpers', () => {
  it('getSiteSettings returns a global with an id', async () => {
    const settings = await getSiteSettings();
    expect(settings).toBeTruthy();
    expect(typeof settings).toBe('object');
  });

  it('getHeader and getFooter return globals', async () => {
    const [h, f] = await Promise.all([getHeader(), getFooter()]);
    expect(h).toBeTruthy();
    expect(f).toBeTruthy();
  });

  it('getHomepage returns a homepage global', async () => {
    const hp = await getHomepage();
    expect(hp).toBeTruthy();
  });

  it('getPressMentions returns an array', async () => {
    const press = await getPressMentions();
    expect(Array.isArray(press)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
pnpm --filter cms test -- queries
```

Expected: FAIL (module not found).

- [ ] **Step 3: Write queries module with React.cache deduplication**

Write `apps/cms/src/lib/queries.ts`:

```ts
import { cache } from 'react';
import { getPayload } from 'payload';
import config from '../payload.config';

async function p() {
  return getPayload({ config });
}

export const getSiteSettings = cache(async () => {
  return (await p()).findGlobal({ slug: 'site-settings' });
});

export const getHeader = cache(async () => {
  return (await p()).findGlobal({ slug: 'header', depth: 2 });
});

export const getFooter = cache(async () => {
  return (await p()).findGlobal({ slug: 'footer', depth: 1 });
});

export const getHomepage = cache(async () => {
  return (await p()).findGlobal({ slug: 'homepage', depth: 2 });
});

export const getPressMentions = cache(async (limit = 20) => {
  const res = await (await p()).find({
    collection: 'press-mentions',
    sort: 'order',
    limit,
    depth: 1,
  });
  return res.docs;
});
```

`React.cache` deduplicates identical calls within the same render tree, so `Header`, `Footer`, `FloatingWidgets`, `generateMetadata`, and `HomePage` calling `getSiteSettings()` trigger exactly one Postgres round-trip per request.

- [ ] **Step 4: Run test — expect pass (with DB) or skip (without)**

```bash
pnpm --filter cms test -- queries
```

Expected: all tests pass when `DATABASE_URL` is set; all tests skip otherwise.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib apps/cms/src/__tests__/queries.test.ts
git commit -m "feat(web): add typed Payload query helpers for site components"
```

---

## Task 5: Seed extension — media + homepage content fields

**Files:**
- Create: `apps/cms/src/seed/media.ts`
- Modify: `apps/cms/src/seed/globals.ts`
- Modify: `apps/cms/src/seed/index.ts`

- [ ] **Step 1: Write seedMedia helper**

Write `apps/cms/src/seed/media.ts`. The path is resolved from `import.meta.url` so it works regardless of `cwd`:

```ts
import type { Payload } from 'payload';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const SEED_FILES = [
  'hoangkim-tcd-year-end-party-2025.jpg',
  'nha-may-san-xuat-noi-that-hoangkim-tcd.jpg',
  '2.jpg',
  'bia-pv.jpg',
  '1126-1.jpg',
  'biet-thu-20-ty-ha-noi.jpg',
];

export type SeededMedia = Record<string, string | number>;

export async function seedMedia(p: Payload): Promise<SeededMedia> {
  const ids: SeededMedia = {};
  // __dirname equivalent for ESM — resolves relative to this file
  const here = path.dirname(fileURLToPath(import.meta.url));
  // src/seed → ../../public/vendor/images/seed
  const baseDir = path.resolve(here, '..', '..', 'public', 'vendor', 'images', 'seed');

  for (const file of SEED_FILES) {
    const existing = await p.find({
      collection: 'media',
      where: { filename: { equals: file } },
      limit: 1,
    });
    if (existing.docs[0]) {
      ids[file] = existing.docs[0].id;
      p.logger.info(`media exists: ${file}`);
      continue;
    }
    const buf = await fs.readFile(path.join(baseDir, file));
    const doc = await p.create({
      collection: 'media',
      data: { alt: file.replace(/[-_]/g, ' ').replace(/\.[a-z]+$/, '') },
      file: {
        data: buf,
        mimetype: 'image/jpeg',
        name: file,
        size: buf.byteLength,
      },
    });
    ids[file] = doc.id;
    p.logger.info(`media created: ${file}`);
  }
  return ids;
}
```

- [ ] **Step 2: Wire seedMedia into seed/index.ts**

Modify `apps/cms/src/seed/index.ts`:

1. Add import: `import { seedMedia } from './media';`
2. Inside `run()`, call `seedMedia(p)` **before `seedPress`** (and therefore before all seeders that look up media). Current file order is `seedUsers → seedCategories → seedProjects → seedNews → seedServices → seedTeam → seedPress → …`. Insert `seedMedia(p)` immediately after `seedUsers(p)`:
   ```ts
   const admin = await seedUsers(p);
   const media = await seedMedia(p);
   const cats = await seedCategories(p);
   // … rest unchanged …
   ```
3. Change the `seedGlobals` call signature:
   ```ts
   await seedGlobals(p, { projects, press, testimonials, services, media });
   ```

Rationale: `seedPress` currently picks the first available media as a placeholder logo via `p.find({ collection: 'media', limit: 1 })`. Without `seedMedia` running first, `seedPress` skips every press entry (see the `if (!logo)` branch in `apps/cms/src/seed/press.ts`).

- [ ] **Step 3: Extend seedGlobals for homepage hero + aboutSnippet + ctaBlocks**

Modify `apps/cms/src/seed/globals.ts`.

Update the `Refs` type and the function signature:

```ts
import type { Payload } from 'payload';
import type { SeededMedia } from './media';

type Refs = {
  projects: Array<string | number>;
  press: Array<string | number>;
  testimonials: Array<string | number>;
  services: Array<string | number>;
  media: SeededMedia;
};

export async function seedGlobals(p: Payload, refs: Refs) {
  // ... keep existing site-settings, header, footer updates unchanged ...
```

Then add a **new** `updateGlobal` call after the existing homepage update — this one carries the three Plan 2 fields:

```ts
await p.updateGlobal({
  slug: 'homepage',
  data: {
    heroSlides: [
      { image: refs.media['hoangkim-tcd-year-end-party-2025.jpg'],
        heading: 'Tân cổ điển Hoàng Kim Year-End Party 2025',
        subheading: 'Cùng nhau kiến tạo không gian sống đẳng cấp',
        ctaLabel: 'Tìm hiểu thêm', ctaUrl: '/ve-hoangkim-tcd' },
      { image: refs.media['nha-may-san-xuat-noi-that-hoangkim-tcd.jpg'],
        heading: 'Nhà máy sản xuất nội thất Tân cổ điển Hoàng Kim',
        subheading: 'Tự chủ 100% sản xuất, kiểm soát chất lượng từng chi tiết',
        ctaLabel: 'Xem quy trình', ctaUrl: '/quy-trinh' },
      { image: refs.media['2.jpg'],
        heading: 'Kiến trúc Tân cổ điển Hoàng Kim',
        subheading: 'Top 10 công ty thiết kế kiến trúc uy tín',
        ctaLabel: 'Xem dự án', ctaUrl: '/du-an' },
      { image: refs.media['bia-pv.jpg'],
        heading: 'Đội ngũ Tân cổ điển Hoàng Kim',
        subheading: 'Kiến trúc sư · Kỹ sư · Thợ lành nghề',
        ctaLabel: 'Gặp đội ngũ', ctaUrl: '/doi-ngu' },
      { image: refs.media['1126-1.jpg'],
        heading: '1000+ biệt thự đẳng cấp',
        subheading: 'Từ cổ điển đến hiện đại, mỗi công trình một phong cách',
        ctaLabel: 'Khám phá', ctaUrl: '/biet-thu' },
    ],
    aboutSnippet: {
      heading: 'Thiết kế tận tâm – Thi công tận lực',
      body: {
        root: {
          type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
          children: [{
            type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr',
            children: [{ type: 'text', version: 1, text:
              '12 năm kinh nghiệm trong lĩnh vực thiết kế kiến trúc và thi công nội thất, Tân cổ điển Hoàng Kim đã kiến tạo hàng ngàn không gian sống đẳng cấp trên khắp ba miền đất nước.',
              format: 0, detail: 0, mode: 'normal', style: '' }],
          }],
        },
      } as any,
      image: refs.media['biet-thu-20-ty-ha-noi.jpg'],
      ctaLabel: 'Về Tân cổ điển Hoàng Kim',
      ctaUrl: '/ve-hoangkim-tcd',
    },
    ctaBlocks: [
      { heading: 'ĐĂNG KÝ NGAY ĐỂ NHẬN MẪU NHÀ MIỄN PHÍ',
        body: 'Gửi yêu cầu để đội ngũ tư vấn liên hệ trong 24 giờ',
        image: refs.media['bia-pv.jpg'],
        ctaLabel: 'Đăng ký ngay',
        ctaUrl: '/dang-ky-nhan-mau-nha' },
    ],
  } as any,
});
```

**Important:** Do NOT re-set `featuredProjects`, `pressMentions`, `testimonials`, or `stats` in this call — Plan 1's seed already writes them. A second `updateGlobal` merges top-level keys, so only `heroSlides`, `aboutSnippet`, `ctaBlocks` are overwritten.

- [ ] **Step 4: Run seed twice — verify idempotency**

```bash
pnpm seed
pnpm seed  # second run should log "exists" for all media
```

Expected: second run reports media exists for all 6 files and no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/seed
git commit -m "feat(cms): seed media + extend homepage global with hero/about/cta content"
```

---

## Task 6: Extend header global + Header component

A.html uses a split nav — left half and right half flanking the centered logo. The Plan 1 `header` global only has `menuItems` (relationship). To keep the component simple and the editor intuitive, this task adds `leftMenu` and `rightMenu` array fields to the `header` global and seeds them.

**Files:**
- Modify: `apps/cms/src/globals/header.ts`
- Modify: `apps/cms/src/seed/globals.ts` (update header seed)
- Create: `apps/cms/src/components/site/Header.tsx`

- [ ] **Step 1: Extend header global**

Add two new array fields. Edit `apps/cms/src/globals/header.ts` — keep existing fields and append:

```ts
import type { GlobalConfig } from 'payload';

const navItemFields = [
  { name: 'label', type: 'text' as const, required: true },
  { name: 'url', type: 'text' as const, required: true },
];

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
    {
      name: 'leftMenu',
      type: 'array',
      admin: { description: 'Left half of split nav (before logo).' },
      fields: navItemFields,
    },
    {
      name: 'rightMenu',
      type: 'array',
      admin: { description: 'Right half of split nav (after logo).' },
      fields: navItemFields,
    },
  ],
};
```

- [ ] **Step 2: Seed left/right menus**

Edit `apps/cms/src/seed/globals.ts` — replace the existing header `updateGlobal` call with:

```ts
await p.updateGlobal({
  slug: 'header',
  data: {
    topBarText: 'Hotline 0981 234 567 · Tư vấn miễn phí',
    ctaButton: { label: 'Đăng ký tư vấn', url: '/dang-ky-tu-van' },
    leftMenu: [
      { label: 'TRANG CHỦ', url: '/' },
      { label: 'VỀ TÂN CỔ ĐIỂN HOÀNG KIM', url: '/ve-hoangkim-tcd' },
      { label: 'DỊCH VỤ', url: '/dich-vu' },
      { label: 'THIẾT KẾ KIẾN TRÚC', url: '/kien-truc' },
    ],
    rightMenu: [
      { label: 'THIẾT KẾ NỘI THẤT', url: '/noi-that' },
      { label: 'DỰ ÁN THI CÔNG', url: '/du-an' },
      { label: 'VIDEO', url: '/video' },
      { label: 'LIÊN HỆ', url: '/lien-he' },
    ],
  } as any,
});
```

- [ ] **Step 3: Write Header component**

Write `apps/cms/src/components/site/Header.tsx`:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { getHeader, getSiteSettings } from '../../lib/queries';

type NavItem = { label: string; url: string };

export async function Header() {
  const [header, settings] = await Promise.all([getHeader(), getSiteSettings()]);
  const h = header as any;
  const s = settings as any;
  const hotline = s?.hotline ?? '0966 885 000';
  const left: NavItem[] = h?.leftMenu ?? [];
  const right: NavItem[] = h?.rightMenu ?? [];

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container">
          {h?.topBarText && <span className="topbar-text">{h.topBarText}</span>}
          <form className="topbar-search" action="/tim-kiem" method="get">
            <input type="text" name="q" placeholder="Tìm kiếm..." />
            <button type="submit" aria-label="Tìm kiếm"><i className="fa fa-search" /></button>
          </form>
          <a className="topbar-phone" href={`tel:${hotline.replace(/\s/g, '')}`}>
            <i className="fa fa-phone" /> {hotline}
          </a>
        </div>
      </div>
      <nav className="main-nav container">
        <ul className="nav-left">
          {left.map((item) => (
            <li key={item.url}><Link href={item.url}>{item.label}</Link></li>
          ))}
        </ul>
        <Link href="/" className="nav-logo" aria-label="Tân cổ điển Hoàng Kim">
          <Image src="/vendor/images/logo.png" alt="Tân cổ điển Hoàng Kim" width={180} height={60} priority />
        </Link>
        <ul className="nav-right">
          {right.map((item) => (
            <li key={item.url}><Link href={item.url}>{item.label}</Link></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Re-seed to populate new fields**

```bash
pnpm seed
```

Expected: `header` global now has `leftMenu` and `rightMenu` arrays populated.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/globals/header.ts apps/cms/src/seed/globals.ts apps/cms/src/components/site/Header.tsx
git commit -m "feat(web): Header with split nav + extend header global with leftMenu/rightMenu"
```

---

## Task 7: Footer component

**Files:**
- Create: `apps/cms/src/components/site/Footer.tsx`

- [ ] **Step 1: Write Footer**

Write `apps/cms/src/components/site/Footer.tsx`. Reads `site-settings.hotline`, `site-settings.email`, `site-settings.address`, `site-settings.social.{facebook,youtube,instagram,tiktok}`:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { getFooter, getSiteSettings } from '../../lib/queries';

export async function Footer() {
  const [footer, settings] = await Promise.all([getFooter(), getSiteSettings()]);
  const s = settings as any;
  const f = footer as any;
  const address = s?.address ?? 'Hà Nội · TP.HCM · Đà Nẵng';
  const hotline = s?.hotline ?? '0966 885 000';
  const email = s?.email ?? 'info@hoangkim-tcd.com';
  const social = s?.social ?? {};
  const copyright = f?.copyright ?? '© 2026 Tân cổ điển Hoàng Kim. All rights reserved.';

  const socialLinks: Array<{ icon: string; url: string; label: string }> = [];
  if (social.facebook)  socialLinks.push({ icon: 'facebook',      url: social.facebook,  label: 'Facebook' });
  if (social.youtube)   socialLinks.push({ icon: 'youtube-play',  url: social.youtube,   label: 'YouTube' });
  if (social.instagram) socialLinks.push({ icon: 'instagram',     url: social.instagram, label: 'Instagram' });
  if (social.tiktok)    socialLinks.push({ icon: 'music',         url: social.tiktok,    label: 'TikTok' });

  return (
    <footer id="footer" className="site-footer">
      <div className="container">
        <div className="row">
          <div className="col-sm-4">
            <h4>LIÊN HỆ</h4>
            <p><i className="fa fa-map-marker" /> {address}</p>
            <p><i className="fa fa-phone" /> <a href={`tel:${hotline.replace(/\s/g, '')}`}>{hotline}</a></p>
            <p><i className="fa fa-envelope" /> <a href={`mailto:${email}`}>{email}</a></p>
            {socialLinks.length > 0 && (
              <div className="socials">
                {socialLinks.map((sc) => (
                  <a key={sc.url} href={sc.url} target="_blank" rel="noopener noreferrer" aria-label={sc.label}>
                    <i className={`fa fa-${sc.icon}`} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="col-sm-4 text-center">
            <Image src="/vendor/images/map.jpg" alt="Bản đồ Tân cổ điển Hoàng Kim" width={360} height={240} />
          </div>
          <div className="col-sm-4">
            <h4>YÊU CẦU TƯ VẤN</h4>
            <form className="footer-callback" action="#" method="post" noValidate>
              <input type="text" name="name" placeholder="Họ và tên" required />
              <input type="tel" name="phone" placeholder="Số điện thoại" required />
              <textarea name="message" placeholder="Nội dung" rows={3} />
              <button type="submit" disabled aria-label="Gửi (sẽ kích hoạt ở Plan 4)">
                GỬI YÊU CẦU
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="copyright">
        <div className="container">{copyright}</div>
      </div>
      <Link href="#top" className="back-to-top" aria-label="Về đầu trang">
        <i className="fa fa-chevron-up" />
      </Link>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cms/src/components/site/Footer.tsx
git commit -m "feat(web): Footer component with 3-col layout and callback form shell"
```

---

## Task 8: FloatingWidgets component

**Files:**
- Create: `apps/cms/src/components/site/FloatingWidgets.tsx`

- [ ] **Step 1: Write FloatingWidgets**

Write `apps/cms/src/components/site/FloatingWidgets.tsx`. Reads `site-settings.hotline`, `site-settings.social.zaloPhone`, `site-settings.social.messengerPageId`, `site-settings.social.youtube`:

```tsx
import Link from 'next/link';
import { getSiteSettings } from '../../lib/queries';

export async function FloatingWidgets() {
  const settings = (await getSiteSettings()) as any;
  const hotline = settings?.hotline ?? '0966 885 000';
  const social = settings?.social ?? {};
  const zaloNumber = (social.zaloPhone ?? hotline).replace(/\s/g, '');
  const zaloUrl = `https://zalo.me/${zaloNumber}`;
  const messengerUrl = social.messengerPageId
    ? `https://m.me/${social.messengerPageId}`
    : social.facebook ?? 'https://www.facebook.com/';
  const youtubeUrl = social.youtube ?? 'https://youtube.com/';
  const phoneHref = `tel:${hotline.replace(/\s/g, '')}`;

  return (
    <>
      <div className="floating-cluster" aria-label="Liên hệ nhanh">
        <Link href="/dang-ky-nhan-mau-nha" className="fc-item fc-promo">Nhận mẫu</Link>
        <Link href="/gui-yeu-cau-tu-van" className="fc-item fc-consult" aria-label="Tư vấn">
          <i className="fa fa-gift" />
        </Link>
        <a href={messengerUrl} className="fc-item fc-fb" target="_blank" rel="noopener noreferrer" aria-label="Messenger">
          <i className="fa fa-facebook" />
        </a>
        <a href={youtubeUrl} className="fc-item fc-yt" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <i className="fa fa-youtube-play" />
        </a>
        <a href={zaloUrl} className="fc-item fc-zalo" target="_blank" rel="noopener noreferrer">Zalo</a>
      </div>
      <nav className="mobile-bottom-bar" aria-label="Thanh liên hệ di động">
        <a href={zaloUrl} target="_blank" rel="noopener noreferrer">Zalo</a>
        <a href={phoneHref}><i className="fa fa-phone" /> Gọi</a>
        <Link href="/gui-yeu-cau-tu-van">Gọi lại</Link>
        <Link href="/uu-dai">Ưu đãi</Link>
      </nav>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cms/src/components/site/FloatingWidgets.tsx
git commit -m "feat(web): FloatingWidgets (desktop cluster + mobile bottom bar)"
```

---

## Task 9: Hero component (Swiper client)

**Files:**
- Create: `apps/cms/src/components/site/Hero.tsx`

- [ ] **Step 1: Write Hero**

Write `apps/cms/src/components/site/Hero.tsx`:

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export type HeroSlide = {
  image: { url: string; alt?: string; width?: number; height?: number } | null;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export function Hero({ slides }: { slides: HeroSlide[] }) {
  if (!slides || slides.length === 0) return null;
  return (
    <section className="hero-banner">
      <Swiper
        modules={[Autoplay, Pagination]}
        loop
        autoplay={{ delay: 10_000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        slidesPerView={1}
      >
        {slides.map((s, i) => (
          <SwiperSlide key={i}>
            <div className="hero-slide">
              {s.image?.url && (
                <Image
                  src={s.image.url}
                  alt={s.image.alt ?? s.heading ?? 'Tân cổ điển Hoàng Kim'}
                  width={1920}
                  height={800}
                  priority={i === 0}
                />
              )}
              {(s.heading || s.subheading) && (
                <div className="hero-caption">
                  {s.heading && <h2>{s.heading}</h2>}
                  {s.subheading && <p>{s.subheading}</p>}
                  {s.ctaLabel && s.ctaUrl && (
                    <Link href={s.ctaUrl} className="hero-cta">{s.ctaLabel}</Link>
                  )}
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cms/src/components/site/Hero.tsx
git commit -m "feat(web): Hero component with Swiper autoplay carousel"
```

---

## Task 10: AboutSlogan + LeadCaptureBanner components

**Files:**
- Create: `apps/cms/src/components/site/AboutSlogan.tsx`
- Create: `apps/cms/src/components/site/LeadCaptureBanner.tsx`

- [ ] **Step 1: Write AboutSlogan**

Write `apps/cms/src/components/site/AboutSlogan.tsx`:

```tsx
import Image from 'next/image';
import Link from 'next/link';

export type AboutSnippet = {
  heading?: string;
  body?: unknown; // Lexical serialized state, rendered as plain text fallback
  image?: { url: string; alt?: string } | null;
  ctaLabel?: string;
  ctaUrl?: string;
};

function extractLexicalText(root: any): string {
  if (!root?.root?.children) return '';
  const walk = (n: any): string =>
    n.type === 'text' ? n.text : (n.children ?? []).map(walk).join(' ');
  return root.root.children.map(walk).join('\n\n');
}

export function AboutSlogan({ data }: { data?: AboutSnippet }) {
  if (!data || (!data.heading && !data.body)) return null;
  const text = extractLexicalText(data.body);
  return (
    <section className="about-slogan">
      <div className="container">
        <div className="row">
          {data.image?.url && (
            <div className="col-sm-5">
              <Image src={data.image.url} alt={data.image.alt ?? data.heading ?? ''}
                width={560} height={400} />
            </div>
          )}
          <div className={data.image?.url ? 'col-sm-7' : 'col-sm-12 text-center'}>
            {data.heading && <h2 className="slogan-heading">{data.heading}</h2>}
            {text && <p className="slogan-body">{text}</p>}
            {data.ctaLabel && data.ctaUrl && (
              <Link href={data.ctaUrl} className="btn btn-primary">{data.ctaLabel}</Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write LeadCaptureBanner**

Write `apps/cms/src/components/site/LeadCaptureBanner.tsx`:

```tsx
import Image from 'next/image';
import Link from 'next/link';

export type CtaBlock = {
  heading?: string;
  body?: string;
  image?: { url: string; alt?: string } | null;
  ctaLabel?: string;
  ctaUrl?: string;
};

export function LeadCaptureBanner({ data }: { data?: CtaBlock }) {
  if (!data || !data.image?.url) return null;
  return (
    <section className="lead-capture">
      <Link href={data.ctaUrl ?? '#'} className="lead-capture-link">
        <Image src={data.image.url} alt={data.heading ?? 'Đăng ký'}
          width={1920} height={360} />
        {data.heading && (
          <div className="lead-capture-overlay">
            <h3>{data.heading}</h3>
            {data.body && <p>{data.body}</p>}
            {data.ctaLabel && <span className="btn btn-accent">{data.ctaLabel}</span>}
          </div>
        )}
      </Link>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/components/site/AboutSlogan.tsx apps/cms/src/components/site/LeadCaptureBanner.tsx
git commit -m "feat(web): AboutSlogan and LeadCaptureBanner static content sections"
```

---

## Task 11: PressMentionsCarousel (Swiper client)

**Files:**
- Create: `apps/cms/src/components/site/PressMentionsCarousel.tsx`

- [ ] **Step 1: Write PressMentionsCarousel**

Write `apps/cms/src/components/site/PressMentionsCarousel.tsx`:

```tsx
'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

export type PressItem = {
  id: string | number;
  name: string;
  logo: { url: string; alt?: string } | null;
  sourceUrl?: string;
};

export function PressMentionsCarousel({ items }: { items: PressItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="press-mentions">
      <div className="container">
        <h2 className="section-title">BÁO CHÍ NÓI VỀ TÂN CỔ ĐIỂN HOÀNG KIM</h2>
        <Swiper
          modules={[Autoplay]}
          loop
          autoplay={{ delay: 1500, disableOnInteraction: false }}
          breakpoints={{
            0:    { slidesPerView: 2, spaceBetween: 16 },
            768:  { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 6, spaceBetween: 32 },
          }}
        >
          {items.map((p) => (
            <SwiperSlide key={p.id}>
              {p.sourceUrl ? (
                <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <PressLogo item={p} />
                </a>
              ) : <PressLogo item={p} />}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function PressLogo({ item }: { item: PressItem }) {
  return item.logo?.url ? (
    <Image src={item.logo.url} alt={item.logo.alt ?? item.name} width={160} height={80} />
  ) : (
    <span>{item.name}</span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cms/src/components/site/PressMentionsCarousel.tsx
git commit -m "feat(web): PressMentionsCarousel with Swiper responsive breakpoints"
```

---

## Task 12: Compose homepage + site layout + metadata

**Files:**
- Modify: `apps/cms/app/(site)/layout.tsx`
- Modify: `apps/cms/app/(site)/page.tsx`
- Create: `apps/cms/src/__tests__/homepage-render.test.ts`
- Modify: `README.md`

- [ ] **Step 1: Wire site layout with Header/Footer/FloatingWidgets**

Replace `apps/cms/app/(site)/layout.tsx`:

```tsx
import { Header } from '../../src/components/site/Header';
import { Footer } from '../../src/components/site/Footer';
import { FloatingWidgets } from '../../src/components/site/FloatingWidgets';

export const revalidate = 3600;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <FloatingWidgets />
    </>
  );
}
```

- [ ] **Step 2: Compose homepage page**

Replace `apps/cms/app/(site)/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { Hero } from '../../src/components/site/Hero';
import { AboutSlogan } from '../../src/components/site/AboutSlogan';
import { LeadCaptureBanner } from '../../src/components/site/LeadCaptureBanner';
import { PressMentionsCarousel } from '../../src/components/site/PressMentionsCarousel';
import { getHomepage, getPressMentions, getSiteSettings } from '../../src/lib/queries';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [hp, settings] = await Promise.all([getHomepage(), getSiteSettings()]);
  const seo = (hp as any)?.seo ?? {};
  const s = settings as any;
  return {
    title: seo.metaTitle ?? s?.siteName ?? 'Tân cổ điển Hoàng Kim',
    description: seo.metaDescription ?? 'Thiết kế tận tâm – Thi công tận lực',
    openGraph: seo.ogImage?.url ? { images: [{ url: seo.ogImage.url }] } : undefined,
    // canonical deferred until `site-settings.siteURL` field is added (Plan 5)
  };
}

function normalizeImage(img: any) {
  if (!img || typeof img !== 'object') return null;
  return { url: img.url ?? '', alt: img.alt ?? '', width: img.width, height: img.height };
}

export default async function HomePage() {
  const [hp, pressDocs] = await Promise.all([getHomepage(), getPressMentions()]);
  const h = hp as any;

  const heroSlides = (h?.heroSlides ?? []).map((s: any) => ({
    image: normalizeImage(s.image),
    heading: s.heading, subheading: s.subheading,
    ctaLabel: s.ctaLabel, ctaUrl: s.ctaUrl,
  }));
  const aboutData = h?.aboutSnippet
    ? { ...h.aboutSnippet, image: normalizeImage(h.aboutSnippet.image) }
    : undefined;
  const ctaBlock = h?.ctaBlocks?.[0]
    ? { ...h.ctaBlocks[0], image: normalizeImage(h.ctaBlocks[0].image) }
    : undefined;

  // Prefer curated pressMentions on homepage; fall back to collection list.
  const pressSource = Array.isArray(h?.pressMentions) && h.pressMentions.length > 0
    ? h.pressMentions
    : pressDocs;
  const press = pressSource.map((pm: any) => ({
    id: pm.id,
    name: pm.publicationName ?? '',
    logo: normalizeImage(pm.logo),
    sourceUrl: pm.articleUrl ?? undefined,
  }));

  return (
    <main>
      <Hero slides={heroSlides} />
      <AboutSlogan data={aboutData} />
      <LeadCaptureBanner data={ctaBlock} />
      <PressMentionsCarousel items={press} />
    </main>
  );
}
```

- [ ] **Step 3: Write integration test (DB-guarded)**

Write `apps/cms/src/__tests__/homepage-render.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getHomepage, getPressMentions, getSiteSettings } from '../lib/queries';

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)('homepage data assembly', () => {
  it('returns non-empty hero slides after seed', async () => {
    const hp = (await getHomepage()) as any;
    expect(Array.isArray(hp?.heroSlides)).toBe(true);
    expect(hp.heroSlides.length).toBeGreaterThan(0);
  });

  it('returns aboutSnippet with heading', async () => {
    const hp = (await getHomepage()) as any;
    expect(hp?.aboutSnippet?.heading).toBeTruthy();
  });

  it('returns at least one ctaBlock with image', async () => {
    const hp = (await getHomepage()) as any;
    expect(hp?.ctaBlocks?.length).toBeGreaterThanOrEqual(1);
  });

  it('returns press mentions (curated or collection)', async () => {
    const [hp, press] = await Promise.all([getHomepage() as any, getPressMentions()]);
    const curated = Array.isArray(hp?.pressMentions) ? hp.pressMentions.length : 0;
    expect(curated + press.length).toBeGreaterThan(0);
  });

  it('site settings include a site name', async () => {
    const s = (await getSiteSettings()) as any;
    expect(typeof s).toBe('object');
  });
});
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter cms test
```

Expected: without DB, tests skip and earlier suites pass. With DB + after `pnpm seed`, all tests pass.

- [ ] **Step 5: Manual visual check**

```bash
pnpm --filter cms dev &
sleep 10
echo "Open http://localhost:3000/ and compare to A.html side-by-side"
# (manual step)
# kill %1 when done
```

- [ ] **Step 6: Update README**

Append under "Quickstart" in `README.md`:

```markdown
### Public site + CMS dual routes

This single Next.js app serves both:

- `/` — public marketing site (homepage shell in Plan 2; more pages in Plans 3–5)
- `/admin` — Payload CMS admin UI

After `pnpm seed`, visit `http://localhost:3000/` for the homepage and `http://localhost:3000/admin` for the CMS.
```

- [ ] **Step 7: Typecheck + lint + test**

```bash
pnpm --filter cms typecheck
pnpm --filter cms test
pnpm lint || true   # pre-existing Payload boilerplate warnings are tolerated
```

Expected: typecheck clean, tests pass (or skip cleanly), lint reports only pre-existing issues.

- [ ] **Step 8: Commit**

```bash
git add "apps/cms/app/(site)" apps/cms/src/__tests__/homepage-render.test.ts README.md
git commit -m "feat(web): compose homepage with Hero/About/LeadCapture/PressMentions + tests"
```

---

## Self-Review Checklist (for implementers)

Before marking a task complete, confirm:

- [ ] File was created at the exact path listed in the task
- [ ] Code was written verbatim (no paraphrasing or improvisation on interfaces)
- [ ] Type checks pass (`pnpm --filter cms typecheck`)
- [ ] Relevant test passes or skips cleanly (`pnpm --filter cms test`)
- [ ] Commit message matches the task's suggested format
- [ ] No unrelated files were modified

## Out of Scope (explicit)

Not in this plan — these belong to Plans 3-5:
- S3 Services tabs, S4 video gallery, S5 factory carousel, S6-S8 project grids, S9 testimonial videos, S12 news tabs, S13 forms, S14 partners carousel
- Popup modal, GTM/GA4/Facebook Pixel/TikTok Pixel, JSON-LD structured data
- Zalo chat widget embed (floating link only in Plan 2)
- Mobile accessible mega-menu
- Screenshot-diff regression tests
