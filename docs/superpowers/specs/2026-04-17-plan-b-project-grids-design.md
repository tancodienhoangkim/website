# Plan B — Homepage Project Grids (S6-S10) Design Spec

**Ngày:** 2026-04-17
**Phạm vi:** bổ sung 5 section project grid vào homepage: S6 Biệt thự, S7 Lâu đài - Dinh thự, S8 Nội thất, S9 Thi công, S10 Trụ sở - Khách sạn. Dùng 1 component tái dùng + seed 20 project Unsplash.
**Dự án:** `apps/cms` (Next.js 15 + Payload CMS 3.83)
**Tiền đề:** Plan 1 Foundation + Plan 2 Homepage shell + Plan A (services/partners/testimonials) đã xong.

## 1 · Bối cảnh & quyết định

### 1.1 Trạng thái
`projects` + `project-categories` schema đã đủ (title, slug, category, coverImage, gallery, specs, featured, status, seo). Hiện seed 3 projects + 5 categories (3 top, 2 child). Homepage mới có 5 section, cần chen 5 section project grid giữa `LeadCaptureBanner` và `TestimonialsGrid`.

### 1.2 Quyết định (qua brainstorming)

| # | Quyết định | Chọn |
|---|---|---|
| 1 | Tab chip behavior | **Link tĩnh category** (không JS filter) — `<a href="/thiet-ke-biet-thu/tan-co-dien">`; click rời homepage |
| 2 | Seed volume | **4 project / section = 20 total** |
| 3 | Nguồn ảnh | **Unsplash architectural** (CC0) cho cover; gallery không seed |
| 4 | Detail / category page | **Accept 404** — link URL đúng format nhưng page chưa có (→ Plan D) |
| 5 | Component | **1 component `ProjectSection` tái dùng** — 5 lần render với props khác nhau |

### 1.3 Non-goals
- Không build listing `/thiet-ke-biet-thu/[cat]`, archive `/du-an`, detail `/du-an/[slug]` (→ Plan D).
- Không JS tab filter / AJAX / pagination / infinite scroll.
- Không seed gallery array (detail page chưa có, không cần).
- Không lightbox, không project body rich text render.
- Không sort/filter UX.

---

## 2 · Data model

### 2.1 Schema — không đổi
`projects` và `project-categories` đã có đủ field. Không migration.

### 2.2 Category tree seed (5 top + 17 children = 22)

**Slug convention:** root slug giữ semantic (không trùng URL prefix). Tab href build từ **URL_PREFIX map** tra theo `sectionId`, không phụ thuộc slug.

```
Biệt thự (slug: biet-thu, order: 1)
  ├─ Biệt thự tân cổ điển (slug: biet-thu-tan-co-dien)
  ├─ Biệt thự cổ điển Pháp (slug: biet-thu-co-dien-phap)
  ├─ Biệt thự hiện đại (slug: biet-thu-hien-dai)
  ├─ Biệt thự nhà vườn (slug: biet-thu-nha-vuon)
  ├─ Biệt thự 2 tầng (slug: biet-thu-2-tang)
  └─ Biệt thự 3 tầng (slug: biet-thu-3-tang)
Lâu đài - Dinh thự (slug: lau-dai-dinh-thu, order: 2)
  ├─ Lâu đài (slug: thiet-ke-lau-dai)
  └─ Dinh thự (slug: thiet-ke-dinh-thu)
Nội thất (slug: noi-that, order: 3)
  ├─ Nội thất phòng khách (slug: noi-that-phong-khach)
  ├─ Nội thất phòng ngủ (slug: noi-that-phong-ngu)
  ├─ Nội thất bếp (slug: noi-that-bep)
  └─ Nội thất phòng thờ (slug: noi-that-phong-tho)
Thi công (slug: thi-cong, order: 4)
  ├─ Thi công trọn gói (slug: thi-cong-tron-goi)
  └─ Thi công hoàn thiện (slug: thi-cong-hoan-thien)
Trụ sở - Khách sạn (slug: tru-so-khach-san, order: 5)
  ├─ Trụ sở văn phòng (slug: thiet-ke-tru-so-van-phong)
  └─ Khách sạn - Nhà hàng (slug: thiet-ke-khach-san-nha-hang)
```

**URL_PREFIX map** (dùng trong `page.tsx` build tab href, khớp sitemap gốc):

```ts
const URL_PREFIX: Record<string, string> = {
  'biet-thu': '/thiet-ke-biet-thu',
  'lau-dai-dinh-thu': '/lau-dai-dinh-thu',
  'noi-that': '/thiet-ke-noi-that',
  'thi-cong': '/thi-cong',
  'tru-so-khach-san': '/thiet-ke-tru-so-khach-san',
};
```

Root slug `noi-that` khác service slug `thiet-ke-noi-that` — không đụng unique constraint giữa 2 collection (Payload không enforce unique cross-collection, nhưng giữ khác để rõ ràng).

Seed `seedCategories` reset lại: tạo tất cả top + children, trả Map<title → id> (tất cả, không chỉ 5 cũ). **Đổi behavior** so với hiện tại (chỉ có Biệt thự/Lâu đài/Nhà phố + 2 children).

**Bug hiện tại cần vá:** `categories.ts` có category "Nhà phố" + 2 children không khớp với Plan B. Giữ nguyên "Nhà phố" (không xoá, không breaking), chỉ thêm các category mới.

### 2.3 Projects seed — 20 sample

4 project / section. Mỗi project gán đến **child category** (random round-robin trong các child của root).

```ts
// Ví dụ S6 Biệt thự (4 project)
[
  { title: 'Biệt thự tân cổ điển 3 tầng tại Hà Nội',
    categoryTitle: 'Biệt thự tân cổ điển',
    cover: 'biet-thu-1.jpg',
    specs: { location: 'Hà Nội', area: 350, floors: 3, year: 2024, style: 'Tân cổ điển' },
    summary: 'Biệt thự tân cổ điển 3 tầng dát vàng, 350m² sàn, phong cách châu Âu.',
  },
  { title: 'Biệt thự cổ điển Pháp 2 tầng',
    categoryTitle: 'Biệt thự cổ điển Pháp',
    cover: 'biet-thu-2.jpg', ...
  },
  // … 2 more
]
```

Tổng 20 project:
- S6 Biệt thự — 4 (4 style khác nhau)
- S7 Lâu đài - Dinh thự — 4 (2 lâu đài + 2 dinh thự)
- S8 Nội thất — 4 (4 loại phòng)
- S9 Thi công — 4 (2 trọn gói + 2 hoàn thiện)
- S10 Trụ sở - Khách sạn — 4 (2 trụ sở + 2 khách sạn)

Tất cả `status: 'published'`, `featured: true`, `publishedAt: now`.

---

## 3 · Query helpers

`apps/cms/src/lib/queries.ts` — thêm:

```ts
export const getProjectsByRootCategory = cache(
  async (rootSlug: string, limit = 4) => {
    const payload = await p();
    // 1. find root category by slug
    const rootRes = await payload.find({
      collection: 'project-categories',
      where: { slug: { equals: rootSlug } },
      limit: 1,
      depth: 0,
    });
    const root = rootRes.docs[0];
    if (!root) return { root: null, children: [], projects: [] };

    // 2. find children of root
    const childrenRes = await payload.find({
      collection: 'project-categories',
      where: { parent: { equals: root.id } },
      limit: 50,
      sort: 'order',
      depth: 0,
    });
    const children = childrenRes.docs;
    const ids = [root.id, ...children.map((c) => c.id)];

    // 3. find projects where category in ids
    const projRes = await payload.find({
      collection: 'projects',
      where: {
        and: [
          { status: { equals: 'published' } },
          { category: { in: ids } },
        ],
      },
      sort: '-updatedAt',
      limit,
      depth: 1,
      overrideAccess: false,
    });

    return { root, children, projects: projRes.docs };
  },
);
```

Helper build tabs array từ `children`, dùng URL_PREFIX map (§2.2):
```ts
const tabs = children.map((c) => ({
  label: c.title,
  href: `${URL_PREFIX[root.slug]}/${c.slug}`,
}));
```

---

## 4 · Component `ProjectSection`

`apps/cms/src/components/site/ProjectSection.tsx` (RSC):

```tsx
import Image from 'next/image';
import Link from 'next/link';

export type ProjectSectionTab = { label: string; href: string };
export type ProjectSectionItem = {
  id: string | number;
  title: string;
  slug: string;
  coverImage: { url: string; alt?: string } | null;
  specs?: { area?: number; floors?: number; location?: string };
};

type Props = {
  id: string;                  // anchor id
  title: string;
  subtitle?: string;
  tabs: ProjectSectionTab[];
  projects: ProjectSectionItem[];
  moreHref?: string;
};

export function ProjectSection({
  id, title, subtitle, tabs, projects, moreHref,
}: Props) {
  if (projects.length === 0) return null;
  return (
    <div id={id} className="nh-row py-40 mb-30 block-project-section">
      <div className="container">
        <div className="box-product-tab-home clearfix">
          <div className="tab-product clearfix">
            <h2 className="section-title-center">{title}</h2>
            {subtitle ? <p className="section-subtitle-center">{subtitle}</p> : null}
            {tabs.length > 0 ? (
              <div className="list-tab">
                <div className="list-title-txt">
                  {tabs.map((t) => (
                    <h3 key={t.href} className="item-tab-home">
                      <Link href={t.href} className="tab-item">{t.label}</Link>
                    </h3>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="content-product-list">
            <div className="list-category row">
              {projects.map((p) => (
                <article key={p.id} className="col-md-3 col-sm-6 col-xs-12 item-project">
                  <Link href={`/du-an/${p.slug}`} className="item-product">
                    <div className="img">
                      {p.coverImage?.url ? (
                        <Image
                          src={p.coverImage.url}
                          alt={p.coverImage.alt ?? p.title}
                          width={600}
                          height={450}
                          sizes="(max-width:575px) 100vw, (max-width:991px) 50vw, 25vw"
                          className="img-product"
                        />
                      ) : null}
                    </div>
                    <div className="item-project-body">
                      <h4 className="item-project-title">{p.title}</h4>
                      {p.specs ? (
                        <p className="item-project-specs">
                          {[p.specs.area ? `${p.specs.area}m²` : null,
                            p.specs.floors ? `${p.specs.floors} tầng` : null,
                            p.specs.location ?? null,
                          ].filter(Boolean).join(' · ')}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
            {moreHref ? (
              <div className="project-section-more">
                <Link href={moreHref} className="btn-more">Xem tất cả &rarr;</Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
```

Props sẽ được build trong `page.tsx`, từ query.

---

## 5 · Homepage composition

`apps/cms/app/(site)/page.tsx`:

```tsx
const [
  hp, pressDocs, servicesDocs, partnersDocs, testimonialsDocs,
  s6, s7, s8, s9, s10,
] = await Promise.all([
  getHomepage(), getPressMentions(), getServices(4), getPartners(), getTestimonialsFeatured(3),
  getProjectsByRootCategory('biet-thu', 4),
  getProjectsByRootCategory('lau-dai-dinh-thu', 4),
  getProjectsByRootCategory('noi-that', 4),
  getProjectsByRootCategory('thi-cong', 4),
  getProjectsByRootCategory('tru-so-khach-san', 4),
]);

function toProjectItems(docs: any[]): ProjectSectionItem[] { /* normalize */ }
function toTabs(root: any, children: any[]): ProjectSectionTab[] { /* map href = /{root.slug}/{child.slug} */ }

// …JSX:
<ServicesGrid />
<LeadCaptureBanner />
<ProjectSection id="s6-biet-thu"
  title="1000+ THIẾT KẾ BIỆT THỰ ĐẲNG CẤP"
  tabs={toTabs(s6.root, s6.children)}
  projects={toProjectItems(s6.projects)}
  moreHref="/thiet-ke-biet-thu"
/>
<ProjectSection id="s7-lau-dai"
  title="LÂU ĐÀI - DINH THỰ"
  tabs={toTabs(s7.root, s7.children)}
  projects={toProjectItems(s7.projects)}
  moreHref="/lau-dai-dinh-thu"
/>
<ProjectSection id="s8-noi-that"
  title="THIẾT KẾ NỘI THẤT"
  tabs={toTabs(s8.root, s8.children)}
  projects={toProjectItems(s8.projects)}
  moreHref="/thiet-ke-noi-that"
/>
<ProjectSection id="s9-thi-cong"
  title="CÔNG TRÌNH THI CÔNG"
  tabs={toTabs(s9.root, s9.children)}
  projects={toProjectItems(s9.projects)}
  moreHref="/thi-cong"
/>
<ProjectSection id="s10-tru-so"
  title="TRỤ SỞ - KHÁCH SẠN - NHÀ HÀNG"
  tabs={toTabs(s10.root, s10.children)}
  projects={toProjectItems(s10.projects)}
  moreHref="/thiet-ke-tru-so-khach-san"
/>
<TestimonialsGrid />
```

---

## 6 · Seed scripts

### 6.1 `seedCategories` rewrite
Mở rộng hỗ trợ full tree. Thay hardcoded TOP/CHILDREN bằng data structure:

```ts
const TREE: Array<{ title: string; slug: string; order: number; children: Array<{ title: string; slug: string }> }> = [
  { title: 'Biệt thự', slug: 'biet-thu', order: 1, children: [
    { title: 'Biệt thự tân cổ điển', slug: 'biet-thu-tan-co-dien' },
    { title: 'Biệt thự cổ điển Pháp', slug: 'biet-thu-co-dien-phap' },
    { title: 'Biệt thự hiện đại', slug: 'biet-thu-hien-dai' },
    { title: 'Biệt thự nhà vườn', slug: 'biet-thu-nha-vuon' },
    { title: 'Biệt thự 2 tầng', slug: 'biet-thu-2-tang' },
    { title: 'Biệt thự 3 tầng', slug: 'biet-thu-3-tang' },
  ]},
  // ... 4 more roots
];
```

Giữ `Nhà phố` (top) + 2 children cũ nếu đã có — không xoá khi re-run. idempotent theo title.

### 6.2 `seedProjects` rewrite
20 sample hardcoded, mỗi item có `cover` filename. Lookup `media[filename]` để gán `coverImage`. Map `categoryTitle` → id.

### 6.3 `seedMedia` mở rộng
Thêm 20 file vào `SUBDIR_SEED_FILES` mới group `projects`:
```ts
{
  subdir: 'projects',
  mime: 'image/jpeg',
  files: [
    'biet-thu-1.jpg', ...,  // 20 tên
  ],
},
```

### 6.4 Download script `scripts/fetch-plan-b-assets.sh`

20 curl commands từ Unsplash (1200w, q=80). Sample photo IDs (kiểm thủ công có hiện):
```
biet-thu-1.jpg ← photo-1512917774080-9991f1c4c750 (classical villa)
biet-thu-2.jpg ← photo-1564013799919-ab600027ffc6 (modern villa)
...
```
Danh sách đầy đủ viết trong script; user có thể replace bằng URL khác nếu muốn.

---

## 7 · Styling (~50 dòng mới)

Append `css_custom.css`:

```css
/* Plan B — Project Section grid -------------------------------- */
.block-project-section { padding: 60px 0; }
.block-project-section .section-title-center {
    color: var(--gold-light);
    margin-bottom: 12px;
}
.block-project-section .list-tab { margin-bottom: 28px; }
.block-project-section .list-title-txt {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    justify-content: center;
}
.block-project-section .item-tab-home { margin: 0; font-size: 14px; }
.block-project-section .tab-item {
    color: var(--gold-mid);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    padding: 2px 0;
    transition: color 0.2s, border-color 0.2s;
}
.block-project-section .tab-item:hover {
    color: var(--gold-light);
    border-bottom-color: var(--gold-mid);
}
.block-project-section .list-category { display: grid; gap: 20px; }
.block-project-section .list-category.row { display: grid; grid-template-columns: repeat(4, 1fr); }
@media (max-width: 991.98px) {
    .block-project-section .list-category.row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 575.98px) {
    .block-project-section .list-category.row { grid-template-columns: 1fr; }
}
.item-project .item-product {
    display: block;
    background: var(--bg-elevated);
    border: 1px solid var(--border-gold);
    border-radius: 8px;
    overflow: hidden;
    text-decoration: none;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.item-project .item-product:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.item-project .img { aspect-ratio: 4 / 3; overflow: hidden; }
.item-project .img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.item-project-body { padding: 14px 16px; }
.item-project-title {
    color: var(--gold-light);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    margin: 0 0 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.item-project-specs {
    color: var(--text-muted);
    font-size: 12px;
    margin: 0;
}
.project-section-more { text-align: center; margin-top: 24px; }
.btn-more {
    display: inline-block;
    color: var(--gold-mid);
    border: 1px solid var(--border-gold);
    padding: 8px 20px;
    border-radius: 4px;
    text-decoration: none;
    font-size: 13px;
    letter-spacing: 0.05em;
    transition: background 0.2s, color 0.2s;
}
.btn-more:hover { background: var(--gold-mid); color: var(--bg-deep); }
```

Override khi cần thay class A.html có sẵn (nếu conflict `.box-product-tab-home` từ `main.css`). Bỏ qua khi cascade hợp lý.

---

## 8 · Kiểm thử

### 8.1 Tự động
- `pnpm --filter cms typecheck` pass.
- `pnpm --filter cms build` pass (Payload regenerate types cho count collection không đổi).
- Biome lint pass trên file mới.

### 8.2 Manual
- `pnpm seed`: log ra 22 category, 20 project, 20 media new.
- `localhost:3001/` render đủ 5 section mới ở đúng vị trí, tab chips link URL đúng format.
- Click card → `/du-an/<slug>` → 404 (expected, ghi vào commit msg).
- Click tab → `/thiet-ke-biet-thu/<cat>` → 404 (expected).
- 1920 / 1440 / 768 / 375 layout không vỡ.

### 8.3 Tiêu chí done
1. 5 top category + 17 child category trong admin `/admin/collections/project-categories`.
2. 20 project seed + 20 cover media.
3. 5 section render trên homepage, grid 4-col desktop / 2-col tablet / 1-col mobile.
4. Tabs + card link URL đúng format (dù 404).
5. `pnpm seed` idempotent (chạy 2 lần không duplicate).
6. Typecheck + lint pass trên file mới.
7. Commit: `feat(web): homepage plan B — project grids (S6-S10)`.

---

## 9 · Rủi ro & rollback

| Rủi ro | Khả năng | Mitigation |
|---|---|---|
| `seedCategories` rewrite phá category cũ | Thấp | Rewrite giữ behavior idempotent (theo title), không xoá existing |
| Unsplash photo ID deleted | Thấp | Script download 1 lần, lưu local |
| Query by `category.in [ids]` hiệu năng kém nếu nhiều project | Thấp | 20 project total, indexed field → nhanh |
| Cover image load chậm (20 ảnh) | Trung bình | `next/image` optimize + lazy load; chỉ 4 ảnh/section eager |
| Tabs CSS conflict với `.list-tab` cũ trong `main.css` | Thấp | Scope class `.block-project-section .list-tab` |

Rollback: 1 commit revert. Không DB migration.

---

## 10 · File changes summary

### Mới (3)
- `apps/cms/src/components/site/ProjectSection.tsx`
- `apps/cms/scripts/fetch-plan-b-assets.sh`
- `apps/cms/public/vendor/images/seed/projects/` — 20 jpg

### Sửa (6)
- `apps/cms/src/seed/categories.ts` — rewrite tree (5 top + 17 children)
- `apps/cms/src/seed/projects.ts` — 20 sample projects
- `apps/cms/src/seed/media.ts` — thêm group `projects` 20 file
- `apps/cms/src/lib/queries.ts` — `getProjectsByRootCategory(rootSlug, limit)`
- `apps/cms/app/(site)/page.tsx` — compose 5 `<ProjectSection />`
- `apps/cms/public/vendor/css/css_custom.css` — append ~50 dòng

**Tổng:** 3 code mới + 20 asset mới + 6 file sửa.
