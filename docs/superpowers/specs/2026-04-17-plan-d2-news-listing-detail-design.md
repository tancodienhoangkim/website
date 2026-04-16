# Plan D2 — News Listing + Detail Design Spec

**Ngày:** 2026-04-17
**Phạm vi:** build `/tin-tuc` listing + `/tin-tuc/[slug]` detail. Mirror Plan D1 pattern với simplier schema (news-categories phẳng).
**Tiền đề:** Plan D1 đã xong (Breadcrumb, Pagination, CategoryChips tái dùng được).

## 1 · Scope & quyết định

- **Routes**: `/tin-tuc` listing (paginate 12/page, optional `?cat=<catSlug>` filter), `/tin-tuc/[slug]` detail.
- **Reuse**: Breadcrumb, Pagination, CategoryChips từ Plan D1.
- **Detail layout**: Breadcrumb › Cover → Title → Meta (date + author + category) → Excerpt → Body → Related 3 → CTA.
- **Seed**: 6 news (mở rộng từ 3), mỗi news có cover Unsplash + excerpt + body rich text.
- **Non-goals**: tag filter, search, RSS feed (Plan F), comment, share buttons.

## 2 · Data model — không đổi schema

`news` + `news-categories` collection đã đủ. Chỉ seed thêm:
- 2 news-categories mới: "Hoạt động Hoàng Kim", "Kinh nghiệm xây dựng" (thêm vào "Tin ngành" đã có).
- 6 news với cover + excerpt + richText body + publishedAt.

## 3 · Components (3 mới)

### 3.1 `NewsCard.tsx` (RSC)
Props: `{ item: NewsItem }`. Grid item với cover aspect 4/3, title (clamp 2 line), date + category meta, excerpt (clamp 2). Link tới `/tin-tuc/[slug]`.

### 3.2 `NewsListingPage.tsx` (RSC)
Props: `{ catSlug?: string; page: number }`. Flow:
1. Load all news-categories → chips (Tất cả + N categories).
2. If `catSlug`, find category → filter news by categoryId.
3. `getNewsList(catSlug, page, 12)` → docs + totalPages.
4. Render breadcrumb (Trang chủ › Tin tức [› Category]), h1 "Tin tức" hoặc category.title, chips, grid NewsCard 3-col, Pagination.

URL pattern: `/tin-tuc` root, `/tin-tuc?cat=<slug>` filter, `/tin-tuc?cat=<slug>&page=2`. Chips link qua query param, không segment.

### 3.3 `NewsDetailPage.tsx` (RSC)
Props: `{ slug: string }`. Flow:
1. `getNewsBySlug(slug)` depth:2 (populate category, coverImage, author).
2. If null → `notFound()`.
3. `getRelatedNews(categoryId, currentId, 3)`.
4. Render layout per spec.

## 4 · Query helpers (4 mới)

```ts
export const getNewsCategories = cache(async () => { … });
export const getNewsBySlug = cache(async (slug: string) => { … });
export const getNewsList = cache(async (catSlug?, page=1, limit=12) => { … });
export const getRelatedNews = cache(async (categoryId, excludeId, limit=3) => { … });
```

## 5 · SEO

```ts
// detail
generateMetadata: title = news.seo.metaTitle || `${news.title} | Tân Cổ Điển Hoàng Kim`;
              description = news.seo.metaDescription || news.excerpt;
              canonical = `/tin-tuc/${slug}`;
              openGraph.images = coverImage.url;
// listing
generateMetadata: title = cat.title || 'Tin tức' + (page>1 ? ' — Trang N' : '');
              canonical = `/tin-tuc` + query;
```

## 6 · Seed extension

`scripts/fetch-plan-d2-assets.sh` — 6 Unsplash news cover:
- news-1.jpg `photo-1504711434969-e33886168f5c` (newspaper)
- news-2.jpg `photo-1542831371-29b0f74f9713` (magazine)
- news-3.jpg `photo-1480714378408-67cf0d13bc1b` (press conference)
- news-4.jpg `photo-1486406146926-c627a92ad1ab` (reporting)
- news-5.jpg `photo-1505664063603-28e48ca204eb` (news studio)
- news-6.jpg `photo-1451187580459-43490279c0fa` (event)

Seed `news.ts` rewrite:
```ts
const NEWS = [
  { title: '...', slug: 'top-10-thuong-hieu-tieu-bieu',
    categoryTitle: 'Tin ngành', cover: 'news-1.jpg',
    excerpt: '...', bodyText: '...', publishedAt: '2025-01-15' },
  // ×6
];
```

Seed tạo cả `news-categories` mới (findOrCreate theo title).

## 7 · Styling (~60 dòng append)

- `.news-grid` — grid 3-col desktop, 2-col tablet, 1-col mobile
- `.news-card` — card pattern reuse `.item-product` với date overlay
- `.news-meta` — pills date + category + author
- `.news-detail-page .project-body` reuse từ Plan D1

## 8 · File changes

### Mới (4 code + 1 script + 6 asset)
- `apps/cms/app/(site)/tin-tuc/page.tsx` — listing route
- `apps/cms/app/(site)/tin-tuc/[slug]/page.tsx` — detail route
- `apps/cms/src/components/site/NewsListingPage.tsx`
- `apps/cms/src/components/site/NewsDetailPage.tsx`
- `apps/cms/src/components/site/NewsCard.tsx`
- `apps/cms/scripts/fetch-plan-d2-assets.sh`
- `apps/cms/public/vendor/images/seed/news/` — 6 jpg

### Sửa (4)
- `apps/cms/src/lib/queries.ts` — 4 helper mới
- `apps/cms/src/seed/news.ts` — 6 news với cover + category mới
- `apps/cms/src/seed/media.ts` — group `news` 6 file
- `apps/cms/public/vendor/css/css_custom.css` — ~60 dòng

## 9 · Kiểm thử

- Typecheck + lint pass
- Seed log: 3 news-categories + 6 news + 6 media
- `/tin-tuc` render 6 news, chips 3 categories
- `/tin-tuc?cat=tin-nganh` filter đúng
- `/tin-tuc/<slug>` detail render cover, body, related 3
- `/tin-tuc/<invalid>` → 404
