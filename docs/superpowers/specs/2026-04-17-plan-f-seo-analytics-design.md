# Plan F — SEO + Analytics Design Spec

**Ngày:** 2026-04-17
**Phạm vi:** sitemap.xml, robots.txt, JSON-LD structured data, và analytics scripts (GA4, GTM, FB Pixel, TikTok Pixel) — tất cả optional qua env.

## Scope

### SEO
- `app/sitemap.ts` — Next.js route generate `/sitemap.xml`
- `app/robots.ts` — Next.js route generate `/robots.txt`
- `components/seo/JsonLd.tsx` — helper render LD+JSON script tag (React `dangerouslySet...HTML` pattern, known safe vì content là JSON.stringify output từ object do chính code dựng)
- Organization + LocalBusiness JSON-LD global (layout)
- BreadcrumbList + Article JSON-LD per news-detail
- BreadcrumbList + Service JSON-LD per service-detail
- BreadcrumbList + CreativeWork JSON-LD per project-detail
- BreadcrumbList per listing pages

### Analytics
- `components/seo/Analytics.tsx` — client component, load scripts conditionally qua env
- GA4 via `@next/third-parties/google` (đã có trong Next.js 15)
- GTM, FB Pixel, TikTok Pixel inline `<Script>` strategy afterInteractive
- Tất cả skip nếu env ID không set

### Env vars (all optional)
```
NEXT_PUBLIC_GA_ID            # G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID           # GTM-XXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID      # numeric
NEXT_PUBLIC_TIKTOK_PIXEL_ID  # alphanumeric
NEXT_PUBLIC_SITE_URL         # https://hoangkim-tcd.vn (fallback http://localhost:3001)
```

## Non-goals
- RSS feed
- GDPR/cookie consent banner
- GTM dataLayer per-action events
- A/B testing, heatmap
- FAQ/HowTo/Event schema

## File changes

### Mới (5)
- `apps/cms/app/sitemap.ts`
- `apps/cms/app/robots.ts`
- `apps/cms/src/components/seo/JsonLd.tsx`
- `apps/cms/src/components/seo/Analytics.tsx`
- `apps/cms/src/components/seo/schemas.ts`

### Sửa (7)
- `apps/cms/app/layout.tsx` — mount Analytics + Organization/LocalBusiness JSON-LD
- `apps/cms/src/components/site/ProjectDetailPage.tsx` — JSON-LD
- `apps/cms/src/components/site/NewsDetailPage.tsx` — JSON-LD
- `apps/cms/src/components/site/ServiceDetailPage.tsx` — JSON-LD
- `apps/cms/src/components/site/ProjectListingPage.tsx` — Breadcrumb JSON-LD
- `apps/cms/src/components/site/NewsListingPage.tsx` — Breadcrumb JSON-LD
- `apps/cms/.env.example` — 5 env vars

## Sitemap content (auto-generated từ CMS)

- 8 static routes (/, /dich-vu, /tin-tuc, 5 category root)
- 17 category child listing (từ `project-categories` có parent)
- 20 project detail `/du-an/[slug]`
- 6 news detail `/tin-tuc/[slug]`
- 4 service detail `/dich-vu/[slug]`

Tổng ~55 URL. Each với `lastModified` từ updatedAt hoặc publishedAt.

## Robots content

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /_preview/
Sitemap: https://hoangkim-tcd.vn/sitemap.xml
```

## JSON-LD schemas (dạng JSON object, render qua JsonLd component)

**Organization** (trong app/layout.tsx):
```
{ "@context": "https://schema.org", "@type": "Organization",
  "name": "Tân Cổ Điển Hoàng Kim",
  "url": SITE_URL,
  "logo": SITE_URL + "/vendor/images/logo.jpg",
  "contactPoint": { "telephone": "+84-971-199-817", "contactType": "customer service" } }
```

**LocalBusiness** (app/layout.tsx):
```
{ "@type": "HomeAndConstructionBusiness",
  "name": "Tân Cổ Điển Hoàng Kim",
  "address": { "streetAddress": "Số 81 Vạn Phúc, Hà Đông, Hà Nội", "addressCountry": "VN" },
  "telephone": "+84-971-199-817" }
```

**BreadcrumbList** (per-page helper):
```
{ "@type": "BreadcrumbList",
  "itemListElement": items.map((x, i) => ({
    "@type": "ListItem", "position": i+1, "name": x.label,
    ...(x.href ? { "item": SITE_URL + x.href } : {}) })) }
```

**Article** (news detail):
```
{ "@type": "Article",
  "headline": news.title,
  "image": coverUrl,
  "datePublished": news.publishedAt,
  "author": { "@type": "Organization", "name": "Tân Cổ Điển Hoàng Kim" },
  "publisher": { "@type": "Organization", "name": "...", "logo": { "@type": "ImageObject", "url": "..." } } }
```

**Service** (service detail):
```
{ "@type": "Service",
  "name": svc.title,
  "provider": { "@type": "Organization", "name": "..." },
  "description": svc.summary,
  "areaServed": "VN" }
```

**CreativeWork** (project detail):
```
{ "@type": "CreativeWork",
  "name": proj.title,
  "image": coverUrl,
  "description": proj.summary,
  "author": { "@type": "Organization", "name": "..." } }
```

## Analytics gating

```ts
if (gaId)  → <GoogleAnalytics gaId={gaId} />
if (gtmId) → <GoogleTagManager gtmId={gtmId} />
if (fbId)  → inline <Script> render fbq init + PageView
if (ttId)  → inline <Script> render ttq init + page
```

Không set → component trả fragment rỗng, 0 script load.

## Kiểm thử
- `curl http://localhost:3001/sitemap.xml` → XML với ≥50 URL
- `curl http://localhost:3001/robots.txt` → text với sitemap directive
- view-source `/` → thấy 2 JSON-LD block Organization + LocalBusiness
- `/du-an/<slug>` → 2 JSON-LD (Breadcrumb + CreativeWork)
- Env not set → `<head>` không có analytics script
- `pnpm typecheck` + `pnpm build` pass

## Tiêu chí done
1. sitemap.xml build-time generate ≥50 URLs
2. robots.txt include sitemap URL
3. JSON-LD hiển thị đúng trên: layout, project detail, news detail, service detail, listing pages
4. Analytics gated qua env (no env → no script)
5. Commit: `feat(web): plan F — SEO, sitemap, JSON-LD, analytics`
