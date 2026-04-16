# Plan D3 — Service Listing + Detail Design Spec

**Ngày:** 2026-04-17
**Phạm vi:** `/dich-vu` listing (4 service) + `/dich-vu/[slug]` detail. Reuse ServicesGrid + Breadcrumb + patterns D1.

## Scope
- 2 routes: listing + detail
- 2 components mới: ServicesListingPage, ServiceDetailPage
- 2 query helper mới: getServiceBySlug, getRelatedServices
- Seed mở rộng: thêm body richText cho 4 service

Non-goals: pricing table, FAQ, video, comparison chart.

## Routes
```
app/(site)/dich-vu/page.tsx         — listing 4 service, reuse ServicesGrid
app/(site)/dich-vu/[slug]/page.tsx  — detail, SSG với generateStaticParams
```

## Components

### ServicesListingPage
Breadcrumb (Trang chủ › Dịch vụ) → h1 "Dịch vụ của Hoàng Kim" → subtitle → ServicesGrid. Không pagination (4 service, 1 page).

### ServiceDetailPage
Breadcrumb (Trang chủ › Dịch vụ › Title) → cover 16:9 → h1 → summary → body richText → related 3 service (reuse ServicesGrid style) → CTA "Liên hệ tư vấn".

## Queries
```ts
getServiceBySlug(slug): find 1, depth:1
getRelatedServices(excludeId, 3): find others, sort order
```

## Seed
`seed/services.ts` extend 4 service với body:
```ts
body: toLexical('Nội dung chi tiết...')
```

## SEO
- Listing: title "Dịch vụ | Tân Cổ Điển Hoàng Kim"
- Detail: title từ `service.seo.metaTitle || service.title`

## File
Mới: 2 route + 2 component
Sửa: queries.ts, seed/services.ts, css_custom.css (~40 dòng)
