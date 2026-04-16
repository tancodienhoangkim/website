# Plan 2 — Homepage Shell Design Spec

**Date:** 2026-04-16
**Parent project:** hoangkim-tcd.com clone (see `2026-04-16-hoangkim-tcd-design.md`)
**Predecessor:** Plan 1 — Foundation & CMS Core (complete)

---

## Goal

Port the hoangkim-tcd.com homepage *visual shell* from `A.html` into the existing Next.js 15 + Payload CMS app, achieving pixel-identical layout at 1920 / 1440 / 768 / 375 widths for the following sections:

- Header (split nav + centered logo + top utility bar)
- Hero carousel (S1, 5 slides, autoplay)
- About slogan block (S2)
- Lead capture banner (S11)
- Press mentions carousel (S10, 11 logos, 6-per-view)
- Footer (3-col with address/map/callback-form placeholder)
- Floating widgets cluster (right-side desktop + mobile bottom bar)

Data for these sections is pulled live from Payload globals/collections seeded in Plan 1.

Data-driven grids (projects, news, testimonials, feng shui forms, services tabs, video galleries) are explicitly **out of scope** and deferred to Plan 3 and Plan 4.

## Architecture Decisions (locked)

| # | Decision | Value |
|---|----------|-------|
| D1 | CSS strategy | Copy vendor + custom CSS verbatim into `public/vendor/` |
| D2 | Carousel library | Swiper v11 |
| D3 | jQuery runtime | Retained for Plan 2 (may migrate later) |
| D4 | App topology | Single Next.js app (admin + site share one process) |
| D5 | Data fetching | `getPayload({ config })` in Server Components, ISR `revalidate: 3600` |

### Rationale

- **D4 reverses the earlier "Approach B" (separate backend/frontend)** — justified by the 2GB VPS RAM budget. Payload 3's Next.js adapter is designed for colocated admin + public routes via route groups.
- **D1 (verbatim CSS)**: Preserves pixel fidelity, zero server RAM impact (static files), fastest path to working shell. Acceptable trade-off: larger CSS bundle (~200KB minified, ~40KB gzipped).
- **D2 (Swiper)**: Feature parity with Owl Carousel (autoplay, loop, multi-item view), ~30KB gzipped, actively maintained.
- **D3 (keep jQuery)**: Defers a multi-day rewrite. jQuery + Owl + lightGallery vendor files loaded once and cached. React components only touch jQuery if needed (most interactive bits in Plan 2 are Swiper-based, no jQuery dependency).

## App Topology

Before (Plan 1):
```
apps/cms/
├── app/
│   ├── layout.tsx              # minimal root
│   └── (payload)/              # admin + api
└── src/ …
```

After (Plan 2):
```
apps/cms/
├── app/
│   ├── layout.tsx              # <html lang="vi"> + vendor CSS links
│   ├── (payload)/              # unchanged: admin + api
│   └── (site)/
│       ├── layout.tsx          # header + footer + floating widgets
│       └── page.tsx            # homepage composition
├── public/
│   └── vendor/
│       ├── css/                # bootstrap, main, css_custom, owl, page, font-awesome
│       ├── js/                 # jquery, owl, lightgallery, jquery-ui, jquery-cookie
│       ├── fonts/              # font-awesome glyph fonts
│       └── images/             # logo, map, static assets
├── src/
│   ├── components/site/        # NEW: Header, Footer, FloatingWidgets, Hero, …
│   ├── lib/queries.ts          # NEW: typed Payload query wrappers
│   └── …                       # existing collections/globals/seed
```

### Route Groups

- `(payload)` — admin UI at `/admin`, REST/GraphQL under `/api/*`. Unchanged.
- `(site)` — public pages. `(site)/layout.tsx` wraps children with `<Header />` + `<Footer />` + `<FloatingWidgets />`. `(site)/page.tsx` = homepage.

Both route groups share the same root `app/layout.tsx` which emits `<html>` / `<body>` and links vendor CSS. The Payload admin CSS is loaded via the existing `(payload)/layout.tsx` (no change).

## Data Flow

All sections pull from Payload via direct imports (no HTTP round-trip):

```ts
// src/lib/queries.ts
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function getSiteSettings() {
  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: 'site-settings' });
}
```

Consumers in Server Components use `revalidate = 3600` (1 hour ISR) at the page level.

| Section | Data source |
|---------|-------------|
| Header | `header` global + `site-settings` global (logo, phone) |
| Footer | `footer` global + `site-settings` global |
| Hero carousel | `homepage.heroSlides` array |
| About slogan | `homepage.aboutSnippet` group |
| Lead capture banner | `homepage.ctaBlocks[0]` (first CTA block) |
| Press mentions | `homepage.pressMentions` relationship (curated subset) with `press-mentions` collection fallback if empty |
| Floating widgets | `site-settings` global (phone, zalo, facebook href) |

If a field is empty (fresh DB), components must render gracefully (fallback text or hidden) — no runtime errors.

### Seed Extension

Plan 1 seed populated `featuredProjects`, `pressMentions`, `testimonials`, `stats`, but **not** `heroSlides`, `aboutSnippet`, or `ctaBlocks`. Plan 2 extends `apps/cms/src/seed/globals.ts` to include:

- 5 sample `heroSlides` (image + heading + subheading + CTA), referencing seeded Media
- `aboutSnippet` group populated with slogan + placeholder body + optional image
- 1 `ctaBlocks` item for the lead-capture banner

Because `heroSlides.image` is required and references Media, the seed script must also create placeholder Media documents. Plan 2 adds `src/seed/media.ts` that uploads 6 bundled placeholder images from `public/vendor/images/seed/` using Payload's `create` with a local file path. `findOrCreate` on filename keeps the seed idempotent.

## Component Contracts

Each component:
- Is a React Server Component unless it needs client interactivity (Swiper instances get `'use client'`)
- Receives fully-resolved props (parent does the Payload fetch and passes data)
- No fetch inside components — data is injected from the page
- Vietnamese text and class names preserved verbatim from `A.html` where they anchor CSS selectors

### `Header`
Reproduces line 826 of `A.html`: top utility bar (search + phone), then split navbar with centered logo. Uses static menu structure for Plan 2 (hardcoded nav items from `headers` global — nested dropdowns are static markup, mega-menu panels use CSS-only reveal). Links to placeholder pages that don't yet exist → must not 404 the homepage itself.

### `Footer`
Three-column: address + social (col 1), static map + DMCA badge (col 2), callback form markup (col 3). The form is **markup only** — no submit handler in Plan 2 (wired in Plan 4). Copyright bar + back-to-top button.

### `FloatingWidgets`
Right-side sticky cluster (desktop ≥768px) + mobile bottom bar (<768px). All links are `href="tel:…"` / `href="https://zalo.me/…"` / `href="/…"` — no modal state yet. Popup modal deferred to Plan 5.

### `Hero`
Client component wrapping Swiper. 5 slides from `homepage.heroSlides`, autoplay 10s, loop. Responsive heights match Owl's stock behavior.

### `AboutSlogan`
Pure markup from `homepage.aboutSnippet` (heading + richText body + image + CTA).

### `LeadCaptureBanner`
Single image + CTA link from `homepage.ctaBlocks[0]` if present. Section renders nothing when the array is empty.

### `PressMentionsCarousel`
Client Swiper, 6-per-view desktop, 3-per-view tablet, 2-per-view mobile, autoplay 1.5s, loop. Items from `press-mentions` collection.

## Vendor Asset Inventory

Copied from `images/` (source of truth) into `public/vendor/`:

### CSS (loaded in root `layout.tsx` in order):
1. `bootstrap.min.css`
2. `font-awesome.css`
3. `owl.carousel.css`
4. `jquery-ui.css`
5. `main.css`
6. `main2.css`
7. `megamenu.css`
8. `page.css`
9. `css_custom.css` (last, overrides)

### JS (loaded at end of `<body>` with `defer`):
1. `jquery.2.1.1.min.js`
2. `jquery-ui.js`
3. `jquery.cookie.min.js`
4. `bootstrap.min.js`
5. `owl.carousel.min.js`
6. `jquery.lazy.min.js` + `jquery.lazy.plugins.min.js`
7. `js_custom.js`

### Fonts:
- Font Awesome glyphs (woff2/ttf/eot) copied alongside CSS.

### Swiper (new, npm):
- `swiper` added as dependency in `apps/cms/package.json`. Loaded via ES import in `Hero.tsx` + `PressMentionsCarousel.tsx`.

No CDN fetches at runtime. All vendor assets self-hosted.

## SEO & Metadata

Homepage `generateMetadata` pulls from `homepage.seo` and `site-settings`:
- `title`: from SEO group or fall back to `site-settings.siteName`
- `description`: from SEO group
- `openGraph.images`: from SEO `ogImage`
- `alternates.canonical`: `site-settings.siteURL` + pathname

Structured data (JSON-LD LocalBusiness + Person) from `A.html` lines 1–332 is deferred to Plan 5 (SEO + Widgets).

## Testing Strategy

### Unit / integration tests (Vitest)
- `__tests__/queries.test.ts` — with DB guard, verifies `getSiteSettings()`, `getHomepage()` return expected shapes.
- `__tests__/homepage-render.test.ts` — with DB guard, renders `<HomePage />` via React Testing Library (or manual JSX tree check), asserts key text from seed data is present.

### Visual check (manual, documented in README)
Run `pnpm dev`, open `http://localhost:3000/`, compare side-by-side with opening `A.html` locally. Plan 2 reports "pixel-perfect within tolerance" if header logo, hero carousel, press logos, and footer match at 1440px width.

### No screenshot-diff testing in Plan 2
Adding Playwright + pixel-match tooling is deferred — too much infra for a shell plan.

## Migration Risk & Rollback

- No database migrations are required. Plan 1 schema is already complete.
- Restructuring `apps/cms/app/` adds a new route group; existing `(payload)` group is untouched.
- If the homepage breaks the admin, the admin continues to work (separate route group, separate layout).
- Rollback: revert the Plan 2 commits; admin and seed remain intact.

## Out of Scope (explicit)

- S3 Services 4-tab with lightGallery videos
- S4 Construction video gallery
- S5 Factory photo carousel
- S6/S7/S8 Project grids with AJAX tab filtering
- S9 Testimonial videos
- S12 News tabs + video panel
- S13 Feng shui tools + consultation form (form logic)
- S14 Partners carousel
- Popup modal (gift/promo)
- JSON-LD structured data
- GTM / GA4 / Facebook Pixel / TikTok Pixel
- Zalo chat widget (only static link in Plan 2)
- Mobile megamenu hamburger (CSS-only fallback for Plan 2; full accessible menu deferred)
- Internationalization / multi-language
- Image CDN optimization pass (vendor images served as-is)
- Screenshot-diff regression tests

## Acceptance Criteria

1. `pnpm dev` starts one Next.js process serving both `/admin` (Payload) and `/` (homepage).
2. Visiting `/` after `pnpm seed` renders:
   - Header with logo + nav + phone number from `site-settings`
   - Hero carousel auto-rotating through 5 seeded slides
   - About slogan text from `homepage` global
   - Lead capture banner image + CTA
   - Press mentions carousel showing 11 seeded logos
   - Footer with address, social icons, static map, copyright
   - Right-side floating widgets cluster (desktop) or bottom bar (<768px)
3. Visiting `/admin` still works and the admin can edit `homepage`, `site-settings`, `press-mentions` — edits show up on `/` after revalidation.
4. `pnpm typecheck` + `pnpm lint` + `pnpm test` all pass in the `cms` package.
5. No console errors on homepage load at 1920 / 1440 / 768 / 375 widths.
6. README updated with "visit `/` for public site, `/admin` for CMS".
