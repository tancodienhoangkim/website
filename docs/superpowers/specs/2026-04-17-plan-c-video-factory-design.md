# Plan C — Video Showcase (S4) + Factory Carousel (S5) Design Spec

**Ngày:** 2026-04-17
**Phạm vi:** bổ sung 2 section từ A.html: **S4 Video công trình thi công** (1 hero + 2 side, link ra YouTube) và **S5 Xưởng sản xuất nội thất** (Swiper carousel 12 ảnh Unsplash). Cả hai data đều nằm trong `homepage` global — không collection mới.
**Dự án:** `apps/cms` (Next.js 15 + Payload CMS 3.83)
**Tiền đề:** Plan 1 Foundation + Plan 2 Shell + Plan A + Plan B đã xong.

## 1 · Bối cảnh & quyết định

### 1.1 Vị trí trên homepage
Chen 2 section giữa `AboutSlogan` và `ServicesGrid`:
```
Hero → AboutSlogan → VideoShowcase → FactoryCarousel → ServicesGrid → LeadCaptureBanner → 5×ProjectSection → TestimonialsGrid → PressMentionsCarousel → PartnersCarousel
```

### 1.2 Quyết định (brainstorming)

| # | Quyết định | Chọn |
|---|---|---|
| 1 | Video playback | **Mở tab mới YouTube** (target="_blank"). Không embed iframe, không lightGallery modal. |
| 2 | Data storage | **Extend `homepage` global** — 2 array field `featuredVideos`, `factoryPhotos`. Không collection mới. |
| 3 | Factory photo source | **12 Unsplash workshop/carpentry** CC0. |
| 4 | Video thumbnail fallback | **YouTube `i.ytimg.com/vi/${id}/hqdefault.jpg`** khi admin không upload custom. Cần `next.config remotePatterns`. |
| 5 | Seed video IDs | **Placeholder từ A.html** (public YouTube URLs) với disclaimer "demo only — replace via admin before production". |

### 1.3 Non-goals
- Không inline iframe embed, không lazy `youtube-nocookie` click-to-load.
- Không lightGallery modal (A.html dùng; bỏ để giảm JS bundle).
- Không collection riêng (nếu sau cần pool videos đa trang, migrate dễ dàng).
- Không video detail page `/video/[slug]`.
- Không caption overlay cho factory photo.

---

## 2 · Schema delta

### 2.1 `homepage` global extend

`apps/cms/src/globals/homepage.ts` — thêm 2 field sau `ctaBlocks`:

```ts
{
  name: 'featuredVideos',
  type: 'array',
  maxRows: 6,
  admin: {
    description:
      'Top 3 hiển thị trên homepage. Video đầu = hero lớn (trái), 2 video kế = hai ô nhỏ (phải).',
  },
  fields: [
    {
      name: 'youtubeId',
      type: 'text',
      required: true,
      admin: { description: 'ID 11 ký tự từ URL youtube.com/watch?v=… (ví dụ: jfH46cHFino).' },
    },
    { name: 'title', type: 'text', required: true },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Tuỳ chọn. Nếu trống, component dùng YouTube hqdefault CDN.',
      },
    },
  ],
},
{
  name: 'factoryPhotos',
  type: 'array',
  maxRows: 30,
  admin: { description: 'Ảnh xưởng sản xuất nội thất — carousel 3 ảnh/view desktop.' },
  fields: [
    { name: 'photo', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
  ],
},
```

### 2.2 `next.config` remote patterns

`apps/cms/next.config.ts` hoặc `next.config.js` — thêm allow-list cho YouTube thumbnails:

```ts
images: {
  remotePatterns: [
    // …existing patterns
    { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
  ],
},
```

---

## 3 · Components

### 3.1 `VideoShowcase.tsx` (RSC)

Props:
```ts
export type VideoItem = {
  id: string | number;
  youtubeId: string;
  title: string;
  thumbnail: { url: string; alt?: string } | null;
};
type Props = { videos: VideoItem[] };
```

Layout logic:
- `videos.length === 0` → return null.
- `videos.length === 1` → render chỉ hero full-width (grid-cols 1).
- `videos.length === 2` → hero trái full-height + 1 side bên phải (grid 2fr 1fr, 1 row).
- `videos.length ≥ 3` → hero 2fr × 2 rows + 2 items 1fr bên phải stacked (grid 2fr 1fr × 2 rows).

Mỗi video item:
```tsx
<a
  href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
  target="_blank"
  rel="nofollow noreferrer"
  className={clsx('video-item', isHero && 'hero')}
  aria-label={v.title}
>
  <Image
    src={v.thumbnail?.url ?? `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
    alt={v.thumbnail?.alt ?? v.title}
    width={isHero ? 800 : 400}
    height={isHero ? 450 : 225}
    sizes="(max-width:767px) 100vw, 50vw"
  />
  <span className="video-play-badge">
    <Youtube size={48} />
  </span>
  <span className="video-caption">{v.title}</span>
</a>
```

Reuse `Youtube` icon từ `components/icons/`. Không dùng `clsx` — nếu chưa có dep, inline class string.

### 3.2 `FactoryCarousel.tsx` (client, Swiper)

Reuse pattern `PartnersCarousel` / `PressMentionsCarousel`.

Props:
```ts
export type FactoryPhotoItem = {
  id: string | number;
  photo: { url: string; alt?: string } | null;
  caption?: string;
};
type Props = { items: FactoryPhotoItem[] };
```

Config:
- `slidesPerView: 3` (≥1024), `2` (≥768), `1.5` (<768, peek)
- `autoplay: { delay: 3000, disableOnInteraction: false }`
- `loop: true`
- Aspect `4/3`, rounded `6px`, hover scale(1.05)

Empty → return null.

---

## 4 · Homepage composition

`apps/cms/app/(site)/page.tsx` — extract + render:

```tsx
import { FactoryCarousel, type FactoryPhotoItem } from '…';
import { VideoShowcase, type VideoItem } from '…';

// trong HomePage():
const videos: VideoItem[] = (h?.featuredVideos ?? [])
  .slice(0, 3)
  .map((v: any) => ({
    id: v.id,
    youtubeId: v.youtubeId ?? '',
    title: v.title ?? '',
    thumbnail: normalizeImage(v.thumbnail),
  }))
  .filter((v) => v.youtubeId);

const factoryPhotos: FactoryPhotoItem[] = (h?.factoryPhotos ?? [])
  .map((f: any) => ({
    id: f.id,
    photo: normalizeImage(f.photo),
    caption: f.caption,
  }))
  .filter((f) => f.photo);

// JSX:
<AboutSlogan data={aboutData} />
<VideoShowcase videos={videos} />          {/* NEW S4 */}
<FactoryCarousel items={factoryPhotos} />   {/* NEW S5 */}
<ServicesGrid services={services} />
```

---

## 5 · Seed

### 5.1 Asset download (`scripts/fetch-plan-c-assets.sh`)

12 Unsplash photo IDs (workshop/carpentry/furniture making):

```bash
download 'nha-may-1.jpg'   '1504148455328-c376907d081c'  # woodworking
download 'nha-may-2.jpg'   '1565883903925-2e17f2ad0d4d'  # carpenter
download 'nha-may-3.jpg'   '1558618666-fcd25c85cd64'     # workshop
download 'nha-may-4.jpg'   '1558618047-3c8c76ca7d13'     # craftsman
download 'nha-may-5.jpg'   '1611447937094-bdf8b1b4dec2'  # cnc saw
download 'nha-may-6.jpg'   '1600585152915-d208bec867a1'  # carpentry tools
download 'nha-may-7.jpg'   '1533090481720-856c6e3c1fdc'  # furniture assembly
download 'nha-may-8.jpg'   '1595514535316-49c08a08fcbf'  # wood planks
download 'nha-may-9.jpg'   '1517463700628-5103184eac47'  # sanding
download 'nha-may-10.jpg'  '1558002038-1055907df827'     # lathe
download 'nha-may-11.jpg'  '1621905251918-48416bd8575a'  # lumber yard
download 'nha-may-12.jpg'  '1540574163026-643ea20ade25'  # furniture finishing
```

⚠️ Nếu URL Unsplash 404 (photo deleted), script log warn + tiếp tục. Trước khi seed, kiểm file nhỏ <1KB → thay photo ID.

Lưu vào `apps/cms/public/vendor/images/seed/factory/`.

### 5.2 Seed media

`apps/cms/src/seed/media.ts` — thêm group `factory`:
```ts
{
  subdir: 'factory',
  mime: 'image/jpeg',
  files: ['nha-may-1.jpg', …, 'nha-may-12.jpg'],
},
```

### 5.3 Seed homepage global

`apps/cms/src/seed/globals.ts` — trong hàm `seedGlobals`, patch homepage payload khi set `featuredVideos` + `factoryPhotos`:

```ts
const featuredVideos = [
  {
    youtubeId: 'jfH46cHFino',
    title: 'Biệt thự tân cổ điển 20 tỷ — kiệt tác kiến trúc giữa lòng Hà Nội',
  },
  {
    youtubeId: 'yACEpA7-wZQ',
    title: 'Biệt thự phố 200m² gỗ tự nhiên 100% — Hoàng Kim Studio',
  },
  {
    youtubeId: 'ooSqeYwRCBI',
    title: 'Choáng ngợp biệt thự 2 tầng tân cổ điển nội thất chế tác riêng',
  },
];

const factoryPhotos = [
  { photo: media['nha-may-1.jpg'], caption: 'Khu xẻ gỗ' },
  // …12 entries
];

// append to existing homepage.update(...) call
```

⚠️ **Disclaimer comment trong seed/globals.ts:**
```ts
// DEMO ONLY: youtubeId values are placeholders from A.html scrape.
// Replace with Hoàng Kim's actual videos via admin before production deploy.
```

### 5.4 Seed idempotency

Homepage là global (1 row) → `update` luôn patch. Nếu `featuredVideos` đã có entry (admin đã thêm custom), seed KHÔNG ghi đè — check length trước khi set.

Pattern:
```ts
const currentHp = await p.findGlobal({ slug: 'homepage' });
if (!currentHp.featuredVideos || currentHp.featuredVideos.length === 0) {
  patchData.featuredVideos = featuredVideos;
}
if (!currentHp.factoryPhotos || currentHp.factoryPhotos.length === 0) {
  patchData.factoryPhotos = factoryPhotos;
}
```

---

## 6 · Styling (append `css_custom.css`)

~80 dòng CSS. Scoped class `.block-video-showcase`, `.block-factory-carousel`. Key rules:

```css
.block-video-showcase { padding: 60px 0; }
.video-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 16px;
}
@media (max-width: 767.98px) {
    .video-grid { grid-template-columns: 1fr; grid-template-rows: auto; }
}
.video-item {
    position: relative;
    display: block;
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid var(--border-gold);
    background: var(--bg-elevated);
    aspect-ratio: 16 / 9;
    text-decoration: none;
}
.video-item.hero {
    grid-row: 1 / span 2;
    aspect-ratio: 16 / 9;
}
.video-item img { width: 100%; height: 100%; object-fit: cover; }
.video-play-badge {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(20, 5, 10, 0.25);
    transition: background 0.2s;
}
.video-item:hover .video-play-badge { background: rgba(20, 5, 10, 0.1); }
.video-caption {
    position: absolute; left: 0; right: 0; bottom: 0;
    padding: 36px 16px 14px;
    background: linear-gradient(to top, rgba(20,5,10,0.9), transparent);
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
    display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
}

.block-factory-carousel { padding: 40px 0; }
.block-factory-carousel .section-title-center {
    color: var(--gold-light);
    margin-bottom: 28px;
}
.factory-slide {
    aspect-ratio: 4 / 3;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(241, 224, 117, 0.2);
}
.factory-slide img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.5s ease;
}
.factory-slide:hover img { transform: scale(1.05); }
```

---

## 7 · Kiểm thử

- `pnpm --filter cms typecheck` pass.
- `pnpm --filter cms seed`:
  - 12 factory media created
  - homepage patched với featuredVideos (3) + factoryPhotos (12)
  - idempotent: re-run không ghi đè user data
- `localhost:3001/`:
  - S4 render 1 hero + 2 side (desktop), stack vertical (mobile)
  - Click video → tab mới YouTube
  - S5 Swiper 3-per-view autoplay, loop, hover scale
  - 1920/1440/768/375 không lỗi

Tiêu chí done:
1. `homepage` global có 2 field mới, admin UI render.
2. 3 video + 12 factory photo seeded.
3. `next.config` có `i.ytimg.com` remote pattern.
4. S4 + S5 render trên homepage ở vị trí chuẩn.
5. Commit: `feat(web): homepage plan C — video + factory carousel`.

---

## 8 · Rủi ro & rollback

| Rủi ro | Khả năng | Mitigation |
|---|---|---|
| YouTube thumbnail URL bị block CORS | Thấp | `i.ytimg.com` public CDN, Next.js chỉ proxy ở build; remotePatterns là whitelist |
| Video IDs placeholder gây hiểu nhầm brand | Trung bình | Disclaimer rõ trong seed comment + admin description; user phải thay trước deploy |
| Unsplash photo ID 404 | Thấp | Script log warn, tiếp tục; kiểm file size < 1KB → thay ID (pattern từ Plan B) |
| Admin xoá homepage global | Rất thấp | Homepage là required global; không thể xoá, chỉ edit |
| Swiper 3-per-view chỉ 12 ảnh loop mượt? | Thấp | Swiper `loop: true` tự duplicate; 12 ảnh đủ smooth |

Rollback: 1 commit revert. Homepage schema rollback cần migration DB (Payload auto-detect drop fields).

---

## 9 · File changes summary

### Mới (3 code + 1 script + 12 asset)
- `apps/cms/src/components/site/VideoShowcase.tsx`
- `apps/cms/src/components/site/FactoryCarousel.tsx`
- `apps/cms/scripts/fetch-plan-c-assets.sh`
- `apps/cms/public/vendor/images/seed/factory/` — 12 jpg

### Sửa (6)
- `apps/cms/src/globals/homepage.ts` — 2 array field
- `apps/cms/src/seed/media.ts` — group `factory` 12 file
- `apps/cms/src/seed/globals.ts` — populate featuredVideos + factoryPhotos (idempotent check)
- `apps/cms/next.config.*` — `remotePatterns` cho `i.ytimg.com`
- `apps/cms/app/(site)/page.tsx` — extract data + compose 2 section
- `apps/cms/public/vendor/css/css_custom.css` — append ~80 dòng

**Tổng:** 3 code + 12 asset mới + 6 sửa.
