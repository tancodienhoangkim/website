# Plan D1 — Project Listing + Detail Pages Design Spec

**Ngày:** 2026-04-17
**Phạm vi:** build listing + detail pages cho `projects` collection. Khử 404 từ Plan B card/tab clicks. Mở SEO cho tất cả project.
**Dự án:** `apps/cms` (Next.js 15 + Payload CMS 3.83)
**Tiền đề:** Plan 1-2 + ornament + icons + Plan A/B/C đã xong. Homepage có 14 section, projects collection có 20 doc + 22 category.

## 1 · Bối cảnh & quyết định

### 1.1 Trạng thái hiện tại
Card project trong Plan B link tới `/du-an/[slug]`, tab chips link tới `/thiet-ke-biet-thu/[cat]` etc. — hiện 404. Plan D1 build ra route thật, không đụng data/schema.

### 1.2 Quyết định (brainstorming)

| # | Quyết định | Chọn |
|---|---|---|
| 1 | Scope | **D1 only** — projects listing + detail. News/Service defer (D2/D3). |
| 2 | Pagination | **Page-based `?page=N`** (12/page), server-render, Link prev/next + số trang. |
| 3 | Detail layout | **Full**: breadcrumb + cover + specs + body + gallery lightbox + related 3 + CTA. |
| 4 | Template strategy | **1 component tái dùng `ProjectListingPage`** — 5 route file thin wrap. |
| 5 | Gallery lightbox | **Native `<dialog>` + client thin wrapper**. Không cần lib. |

### 1.3 Non-goals
- Không News/Service detail (Plan D2/D3).
- Không JSON-LD structured data (Plan F SEO).
- Không full-text search, filter UI, sort control.
- Không comment, share buttons, print view.
- Không infinite scroll, không AJAX.
- Không authentication cho admin preview draft.

---

## 2 · Routing

### 2.1 Route files (6)

```
apps/cms/app/(site)/
├── thiet-ke-biet-thu/[[...cat]]/page.tsx
├── lau-dai-dinh-thu/[[...cat]]/page.tsx
├── thiet-ke-noi-that/[[...cat]]/page.tsx
├── thi-cong/[[...cat]]/page.tsx
├── thiet-ke-tru-so-khach-san/[[...cat]]/page.tsx
└── du-an/[slug]/page.tsx
```

Optional catch-all `[[...cat]]` handle cả `/thiet-ke-biet-thu` (root) và `/thiet-ke-biet-thu/biet-thu-tan-co-dien` (child). `params.cat` là `undefined | string[]`.

Validation:
- `!params.cat` → root listing (all projects under root + all children categories)
- `params.cat.length === 1` → child listing (filter by `params.cat[0]` slug)
- `params.cat.length >= 2` → `notFound()`

### 2.2 URL_PREFIX map (reuse từ Plan B)

Định nghĩa 1 lần trong `ProjectListingPage.tsx`:

```ts
export const URL_PREFIX: Record<string, string> = {
  'biet-thu': '/thiet-ke-biet-thu',
  'lau-dai-dinh-thu': '/lau-dai-dinh-thu',
  'noi-that': '/thiet-ke-noi-that',
  'thi-cong': '/thi-cong',
  'tru-so-khach-san': '/thiet-ke-tru-so-khach-san',
};
```

### 2.3 Wrapper pattern

Mỗi route file (~15 dòng):

```tsx
// app/(site)/thiet-ke-biet-thu/[[...cat]]/page.tsx
import {
  ProjectListingPage,
  generateListingMetadata,
  generateListingStaticParams,
} from '@/components/site/ProjectListingPage';

export const revalidate = 3600;

export const generateMetadata = generateListingMetadata('biet-thu');
export const generateStaticParams = generateListingStaticParams('biet-thu');

export default async function Page({ params, searchParams }: {
  params: Promise<{ cat?: string[] }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const p = await params;
  const sp = await searchParams;
  return <ProjectListingPage rootSlug="biet-thu" cat={p.cat} page={Number(sp.page) || 1} />;
}
```

5 route file listing + 1 detail file, tổng **6 route file**.

---

## 3 · Components mới (7)

### 3.1 `ProjectListingPage.tsx` (RSC)

Props:
```ts
type Props = {
  rootSlug: string;       // 'biet-thu', 'lau-dai-dinh-thu', …
  cat?: string[];          // undefined | ['<child-slug>']
  page?: number;           // 1-based
};
```

Layout:
```
┌─────────────────────────────────────────────────┐
│ Breadcrumb: Trang chủ › Biệt thự [› Tân cổ điển]│
│ <h1> Title </h1>                                │
│ <p> Description </p>                            │
│ CategoryChips (row of child categories)         │
│ Grid 3-col project cards (12/page)              │
│ Pagination ← 1 2 3 4 5 →                        │
└─────────────────────────────────────────────────┘
```

Flow:
1. Find root category by `rootSlug`. 404 nếu không có.
2. Nếu `cat?.[0]` exists, find child category by slug. 404 nếu child không thuộc root.
3. Current category = child || root.
4. Children list (cho CategoryChips).
5. Fetch projects: `category IN [root.id, ...children.map(c=>c.id)]` nếu current=root; hoặc `category = child.id` nếu current=child. Sort `-updatedAt`, limit=12, offset=(page-1)*12. Lấy `totalDocs` cho pagination.
6. Render breadcrumb (Home › Root.title › [Child.title]), h1 = current.title, description, chips, grid, pagination.

Exports:
```ts
export function ProjectListingPage(props: Props): Promise<JSX.Element>;
export function generateListingMetadata(rootSlug: string): (args) => Promise<Metadata>;
export function generateListingStaticParams(rootSlug: string): () => Promise<{ cat?: string[] }[]>;
```

`generateListingStaticParams` trả:
- `{ cat: [] }` (root — optional catch-all empty array = no segment)
- `{ cat: [childSlug] }` cho mỗi child

Không build page>1 tĩnh — pagination chạy qua searchParams, ISR với `revalidate: 3600` handle.

### 3.2 `ProjectDetailPage.tsx` (RSC)

Props: `{ slug: string }`.

Flow:
1. `getProjectBySlug(slug)` depth:2 (populate category, coverImage, gallery.image).
2. If null → `notFound()`.
3. Build breadcrumb: Home › Root (category.parent) › Child (category) › Title.
4. Fetch related: same root category id, exclude current id, limit 3.
5. Render.

Sections:
- Breadcrumb
- Cover image full-width (aspect 16:9, max-height 560px)
- Title block: h1 + category tag
- Specs row: pills (area / floors / location / year / style)
- Rich body (Lexical render)
- Gallery grid (nếu có; 3-col, click mở lightbox)
- Related projects (reuse `item-project` style Plan B)
- CTA banner "Liên hệ tư vấn miễn phí" → `/lien-he`

### 3.3 `Breadcrumb.tsx` (RSC)

Props: `items: { label: string; href?: string }[]`. Cuối cùng không có href (current page). Render list `<nav aria-label="Breadcrumb">`.

### 3.4 `Pagination.tsx` (RSC)

Props:
```ts
{
  currentPage: number;
  totalPages: number;
  basePath: string;       // /thiet-ke-biet-thu or /thiet-ke-biet-thu/abc
}
```
Render ≤7 numeric chips quanh current, + prev/next. `<Link href={`${basePath}?page=${n}`}>`. Nếu `n===1` → basePath (no query). `aria-current="page"` cho current.

### 3.5 `ProjectGallery.tsx` (Client)

Dùng native `<dialog>`. Props: `images: { url, alt }[]`.

```tsx
'use client';
export function ProjectGallery({ images }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [i, setI] = useState(0);
  const open = (idx) => { setI(idx); ref.current?.showModal(); };
  const close = () => ref.current?.close();
  return (
    <>
      <div className="project-gallery">
        {images.map((img, idx) => (
          <button key={idx} onClick={() => open(idx)} aria-label={`Xem ảnh ${idx+1}`}>
            <Image src={img.url} alt={img.alt} width={400} height={300} />
          </button>
        ))}
      </div>
      <dialog ref={ref} className="project-gallery-dialog" onClick={close}>
        <button className="close" onClick={close} aria-label="Đóng">×</button>
        <Image src={images[i]?.url} alt={images[i]?.alt} width={1200} height={800} />
        <button className="prev" onClick={() => setI((i-1+images.length)%images.length)}>‹</button>
        <button className="next" onClick={() => setI((i+1)%images.length)}>›</button>
      </dialog>
    </>
  );
}
```

Keyboard: ESC closes (dialog default). Click backdrop closes.

### 3.6 `RelatedProjects.tsx` (RSC)

Props: `{ projects: ProjectSectionItem[] }`. Reuse card markup từ `ProjectSection`. Title "Dự án tương tự".

### 3.7 `CategoryChips.tsx` (RSC)

Props: `{ chips: {label, href, active}[] }`. Row flex wrap, active chip gold highlight, hover underline gold.

---

## 4 · Query helpers (4 mới + 0 sửa)

`apps/cms/src/lib/queries.ts`:

```ts
export const getProjectBySlug = cache(async (slug: string) => {
  const res = await (await p()).find({
    collection: 'projects',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  });
  return res.docs[0] ?? null;
});

export const getProjectsByCategoryIds = cache(
  async (categoryIds: Array<string | number>, page = 1, limit = 12) => {
    const res = await (await p()).find({
      collection: 'projects',
      where: { and: [
        { status: { equals: 'published' } },
        { category: { in: categoryIds } },
      ]},
      sort: '-updatedAt',
      limit,
      page,
      depth: 1,
      overrideAccess: false,
    });
    return res; // { docs, totalDocs, totalPages, page, hasNextPage, hasPrevPage }
  },
);

export const getCategoryBySlug = cache(async (slug: string) => {
  const res = await (await p()).find({
    collection: 'project-categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  });
  return res.docs[0] ?? null;
});

export const getRelatedProjects = cache(
  async (rootCategoryId: string | number, excludeId: string | number, limit = 3) => {
    const payload = await p();
    // collect root + children ids
    const rootRes = await payload.find({
      collection: 'project-categories',
      where: { id: { equals: rootCategoryId } },
      limit: 1,
      depth: 0,
    });
    const childrenRes = await payload.find({
      collection: 'project-categories',
      where: { parent: { equals: rootCategoryId } },
      limit: 50,
      depth: 0,
    });
    const ids = [rootCategoryId, ...childrenRes.docs.map((c) => c.id)];
    const res = await payload.find({
      collection: 'projects',
      where: { and: [
        { status: { equals: 'published' } },
        { category: { in: ids } },
        { id: { not_equals: excludeId } },
      ]},
      sort: '-updatedAt',
      limit,
      depth: 1,
    });
    return res.docs;
  },
);
```

Reuse existing `getProjectsByRootCategory` cho homepage (không đổi).

---

## 5 · Pagination logic

Listing renders Pagination nếu `totalPages > 1`. Algorithm chọn numeric chips (max 7 visible):
```
if total <= 7: [1..total]
else:
  if current <= 4:      [1,2,3,4,5,…,total]
  else if current >= total-3: [1,…,total-4,total-3,total-2,total-1,total]
  else:                 [1,…,current-1,current,current+1,…,total]
```
Ellipsis "…" là `<span>`, không link.

URL pattern:
- `basePath` = `/thiet-ke-biet-thu` hoặc `/thiet-ke-biet-thu/biet-thu-tan-co-dien`
- page=1 → `basePath` (no query)
- page>1 → `${basePath}?page=${n}`

---

## 6 · SEO

### 6.1 Listing

```ts
export function generateListingMetadata(rootSlug: string) {
  return async ({ params, searchParams }): Promise<Metadata> => {
    const { cat } = await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;

    const rootCat = await getCategoryBySlug(rootSlug);
    const childCat = cat?.[0] ? await getCategoryBySlug(cat[0]) : null;
    const current = childCat ?? rootCat;
    if (!current) return { title: 'Không tìm thấy danh mục' };

    const seo = (current as any).seo ?? {};
    const baseTitle = seo.metaTitle || `${current.title} | Tân cổ điển Hoàng Kim`;
    const title = page > 1 ? `${baseTitle} — Trang ${page}` : baseTitle;
    const description = seo.metaDescription || current.description;

    const prefix = URL_PREFIX[rootSlug] ?? `/${rootSlug}`;
    const canonical =
      (childCat ? `${prefix}/${childCat.slug}` : prefix) +
      (page > 1 ? `?page=${page}` : '');

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: seo.ogImage?.url ? { images: [{ url: seo.ogImage.url }] } : undefined,
    };
  };
}
```

### 6.2 Detail

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'Không tìm thấy dự án' };
  const seo = (project as any).seo ?? {};
  return {
    title: seo.metaTitle || `${project.title} | Tân cổ điển Hoàng Kim`,
    description: seo.metaDescription || project.summary,
    alternates: { canonical: `/du-an/${slug}` },
    openGraph: {
      images: (project as any).coverImage?.url
        ? [{ url: (project as any).coverImage.url }]
        : undefined,
    },
  };
}
```

---

## 7 · Styling (~120 dòng append `css_custom.css`)

Nhóm chính:

```css
/* Plan D1 — Listing ------------------------------------------ */
.listing-page { padding: 40px 0 80px; }
.listing-page .listing-header { margin-bottom: 28px; }
.listing-page h1 {
    color: var(--gold-light);
    font-size: clamp(24px, 4vw, 36px);
    margin: 0 0 10px;
}
.listing-description {
    color: var(--text-muted);
    font-size: 14px;
    line-height: 1.6;
    max-width: 720px;
}

.category-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin: 20px 0 32px;
}
.category-chip {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border: 1px solid var(--border-gold);
    border-radius: 999px;
    font-size: 13px;
    color: var(--gold-mid);
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
}
.category-chip:hover { color: var(--gold-light); border-color: var(--gold-light); }
.category-chip.active {
    background: var(--gold-grad-h);
    color: var(--text-on-gold);
    border-color: transparent;
}

.listing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}
@media (max-width: 991.98px) { .listing-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 575.98px) { .listing-grid { grid-template-columns: 1fr; } }

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin-top: 40px;
}
.pagination a, .pagination span {
    min-width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-gold);
    color: var(--gold-mid);
    text-decoration: none;
    border-radius: 4px;
    font-size: 13px;
    padding: 0 10px;
}
.pagination a:hover { color: var(--gold-light); border-color: var(--gold-light); }
.pagination a.active,
.pagination span.active {
    background: var(--gold-grad-h);
    color: var(--text-on-gold);
    border-color: transparent;
    pointer-events: none;
}
.pagination span.ellipsis { border-color: transparent; }

/* Plan D1 — Detail ------------------------------------------- */
.project-detail-page { padding: 32px 0 80px; }
.project-detail-cover {
    width: 100%;
    max-height: 560px;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 10px;
    margin-bottom: 24px;
    border: 1px solid var(--border-gold);
}
.project-detail-cover img { width: 100%; height: 100%; object-fit: cover; }
.project-detail-title {
    color: var(--gold-light);
    font-size: clamp(24px, 3.6vw, 34px);
    margin: 0 0 14px;
}
.project-specs-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin-bottom: 28px;
    list-style: none;
    padding: 0;
}
.project-specs-row li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border: 1px solid var(--border-gold);
    border-radius: 4px;
    color: var(--text-muted);
    font-size: 13px;
}
.project-body {
    color: var(--text-primary);
    line-height: 1.7;
    margin-bottom: 40px;
}
.project-body p { margin: 0 0 14px; }
.project-body a { color: var(--gold-mid); }

.project-gallery {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 40px;
}
.project-gallery button {
    border: 0;
    padding: 0;
    background: transparent;
    cursor: pointer;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: 6px;
}
.project-gallery img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.project-gallery button:hover img { transform: scale(1.05); }
@media (max-width: 575.98px) { .project-gallery { grid-template-columns: repeat(2, 1fr); } }

.project-gallery-dialog::backdrop {
    background: rgba(20, 5, 10, 0.92);
}
.project-gallery-dialog {
    border: 0;
    background: transparent;
    max-width: 92vw;
    max-height: 92vh;
    padding: 0;
}
.project-gallery-dialog img { max-width: 92vw; max-height: 80vh; object-fit: contain; }
.project-gallery-dialog .close,
.project-gallery-dialog .prev,
.project-gallery-dialog .next {
    position: absolute;
    background: rgba(241, 224, 117, 0.15);
    border: 1px solid var(--border-gold);
    color: var(--gold-light);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    font-size: 22px;
    cursor: pointer;
}
.project-gallery-dialog .close { top: -56px; right: 0; }
.project-gallery-dialog .prev { left: -52px; top: 50%; transform: translateY(-50%); }
.project-gallery-dialog .next { right: -52px; top: 50%; transform: translateY(-50%); }
@media (max-width: 767.98px) {
    .project-gallery-dialog .prev { left: 8px; }
    .project-gallery-dialog .next { right: 8px; }
    .project-gallery-dialog .close { top: 8px; right: 8px; }
}

.related-projects { margin-bottom: 48px; }
.related-projects h2 {
    color: var(--gold-light);
    text-align: center;
    font-size: 20px;
    margin: 0 0 24px;
}
.related-projects .list-category {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
@media (max-width: 767.98px) { .related-projects .list-category { grid-template-columns: 1fr; } }

.detail-cta-banner {
    background: var(--gold-grad-h);
    color: var(--text-on-gold);
    padding: 32px 24px;
    border-radius: 10px;
    text-align: center;
}
.detail-cta-banner h3 { margin: 0 0 8px; font-size: 22px; }
.detail-cta-banner .btn {
    display: inline-block;
    margin-top: 14px;
    padding: 10px 24px;
    background: var(--bg-deep);
    color: var(--gold-light);
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
}

/* Breadcrumb -------------------------------------------------- */
.breadcrumb {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 18px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    list-style: none;
    padding: 0;
}
.breadcrumb li { display: inline; }
.breadcrumb li + li::before { content: '›'; margin-right: 4px; color: var(--text-muted); }
.breadcrumb a { color: var(--gold-mid); text-decoration: none; }
.breadcrumb a:hover { color: var(--gold-light); }
.breadcrumb [aria-current="page"] { color: var(--text-primary); }
```

---

## 8 · Kiểm thử

### 8.1 Manual test grid

| URL | Expect |
|---|---|
| `/thiet-ke-biet-thu` | Grid 4-12 project dưới root "Biệt thự" |
| `/thiet-ke-biet-thu/biet-thu-tan-co-dien` | Grid chỉ project gán child này (4 → 1 hit) |
| `/thiet-ke-biet-thu?page=2` | Render nếu totalPages≥2, hiện trang 2 |
| `/thiet-ke-biet-thu/invalid-child` | 404 |
| `/thiet-ke-biet-thu/x/y` | 404 (cat.length≥2) |
| `/du-an/biet-thu-tan-co-dien-3-tang-tai-ha-noi` | Detail với breadcrumb, cover, specs, body, gallery empty (seed không có), related 3 |
| `/du-an/nonexistent` | 404 |

### 8.2 Tự động
- `pnpm --filter cms typecheck` pass
- `pnpm --filter cms build` pass (generateStaticParams resolve đúng)
- Biome lint 0 error trên file mới

### 8.3 Done criteria

1. Click tab chip trong homepage Plan B → mở đúng listing, không 404.
2. Click card project → mở `/du-an/[slug]` detail, không 404.
3. 5 URL prefix + root + ít nhất 1 child slug render OK.
4. Detail page đầy đủ breadcrumb + cover + specs + body (or empty graceful) + related.
5. Pagination 1 trang chỉ render nếu có page khác (seed 20 project → mỗi cat ≤4 → 1 trang, pagination không hiện).
6. SEO `title`, `canonical`, `og:image` đúng trên inspect.
7. Commit: `feat(web): plan D1 — project listing + detail pages`.

---

## 9 · Rủi ro & rollback

| Rủi ro | Khả năng | Mitigation |
|---|---|---|
| `generateStaticParams` conflict 5 route cùng `[[...cat]]` | Thấp | Mỗi route file tự build param độc lập theo rootSlug |
| Catch-all bắt sai path (e.g. `/thiet-ke-biet-thu/random`) | Thấp | Validate `cat.length >= 2 → notFound()`; lookup child → null → notFound |
| `<dialog>` không support Safari cũ | Thấp | Safari 15.4+ hỗ trợ fully; fallback: link mở image new tab |
| Lexical richText render fail | Trung bình | Check `project.body?.root` null; render fallback plain text |
| Slug Vietnamese collision | Thấp | `slugField` Payload strip diacritics; 20 seed không collision |
| Related projects empty khi chỉ có 1 project trong root | Thấp | Component return null khi empty |

**Rollback:** 1 commit revert. Không DB migration.

---

## 10 · File changes summary

### Mới (13)
- `apps/cms/app/(site)/thiet-ke-biet-thu/[[...cat]]/page.tsx`
- `apps/cms/app/(site)/lau-dai-dinh-thu/[[...cat]]/page.tsx`
- `apps/cms/app/(site)/thiet-ke-noi-that/[[...cat]]/page.tsx`
- `apps/cms/app/(site)/thi-cong/[[...cat]]/page.tsx`
- `apps/cms/app/(site)/thiet-ke-tru-so-khach-san/[[...cat]]/page.tsx`
- `apps/cms/app/(site)/du-an/[slug]/page.tsx`
- `apps/cms/src/components/site/ProjectListingPage.tsx`
- `apps/cms/src/components/site/ProjectDetailPage.tsx`
- `apps/cms/src/components/site/Breadcrumb.tsx`
- `apps/cms/src/components/site/Pagination.tsx`
- `apps/cms/src/components/site/ProjectGallery.tsx`
- `apps/cms/src/components/site/RelatedProjects.tsx`
- `apps/cms/src/components/site/CategoryChips.tsx`

### Sửa (2)
- `apps/cms/src/lib/queries.ts` — thêm 4 helper (`getProjectBySlug`, `getProjectsByCategoryIds`, `getCategoryBySlug`, `getRelatedProjects`)
- `apps/cms/public/vendor/css/css_custom.css` — append ~180 dòng

**Tổng:** 13 code mới + 2 file sửa.
