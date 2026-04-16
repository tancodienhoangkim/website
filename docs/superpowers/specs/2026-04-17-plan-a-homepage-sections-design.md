# Plan A — Homepage Sections (S3 · S14 · S12) Design Spec

**Ngày:** 2026-04-17
**Phạm vi:** bổ sung 3 section từ A.html chưa implement: **S3 Dịch vụ**, **S14 Đối tác**, **S12 Cảm nhận khách hàng**. Dùng ảnh Unsplash thay cho ảnh scrape akisa.
**Dự án:** `apps/cms` (Next.js 15 + Payload CMS 3.83)
**Tiền đề:** Plan 1 Foundation (CMS + collections) + Plan 2 Homepage shell + Spec 2026-04-16 ornament (palette burgundy/gold) + Spec 2026-04-17 icons đã xong.

## 1 · Bối cảnh & quyết định

### 1.1 Trạng thái hiện tại
Homepage đã có: Header, Hero (S1), AboutSlogan (S2), LeadCaptureBanner (S11), PressMentionsCarousel (S13), Footer, FloatingWidgets. Còn thiếu 10 section so với A.html (S3-S10, S12, S14).

### 1.2 Quyết định (qua brainstorming visual)

| # | Quyết định | Chọn |
|---|---|---|
| 1 | Chia scope | **3 plan** — Plan A (S3+S14+S12), Plan B (S6-S10 grids), Plan C (S4+S5 media). Plan này là A. |
| 2 | Nguồn ảnh | **Unsplash/Pexels** (CC0, free commercial, no attribution) |
| 3 | S3 layout | **4-card grid** 2×2 (desktop) / 1 col (mobile) — không tab, không lightGallery |
| 4 | S14 partners | **Seed 6 brand VL/nội thất phổ biến VN** (KOHLER, TOTO, HAFELE, DULUX, JOTUN, NIPPON) + disclaimer client xác nhận trước production |
| 5 | S12 testimonials | **3 card text + avatar** (không video) |

### 1.3 Non-goals
- Không làm S4, S5, S6-S10 (để Plan B/C).
- Không tạo page `/dich-vu/[slug]` detail.
- Không implement click partner → modal/link external.
- Không video testimonial.
- Không i18n, không dark mode.

---

## 2 · Kiến trúc & data model

### 2.1 Collection mới

`apps/cms/src/collections/partners.ts`:

```ts
import type { CollectionConfig } from 'payload';

export const Partners: CollectionConfig = {
  slug: 'partners',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'order', 'updatedAt'] },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', required: true },
    { name: 'url', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
```

Đăng ký trong `apps/cms/src/payload.config.ts`:
```ts
import { Partners } from './collections/partners';
// ...
collections: [
  // …existing
  Partners,
]
```

### 2.2 Collection đã có — dùng nguyên

- `services` — reuse field `title`, `slug`, `icon`, `summary`, `body`, `order` + thêm seed `coverImage` (dùng field `icon` hoặc thêm mới).
- `testimonials` — reuse field `clientName`, `clientRole`, `avatar`, `content`, `rating`, `order`.

### 2.3 Services schema — không đổi

`apps/cms/src/collections/services.ts` đã có đủ field: `title`, `slug`, `icon`, `coverImage`, `summary`, `body`, `order`, `seo`. Plan A chỉ cần seed data — không đụng schema.

---

## 3 · Query helpers

`apps/cms/src/lib/queries.ts` — thêm 3 hàm:

```ts
export async function getServices(limit = 8) {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: 'services',
    limit,
    sort: 'order',
  });
  return res.docs;
}

export async function getPartners(limit = 12) {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: 'partners',
    limit,
    sort: 'order',
  });
  return res.docs;
}

export async function getTestimonialsFeatured(limit = 3) {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: 'testimonials',
    limit,
    sort: 'order',
  });
  return res.docs;
}
```

---

## 4 · Components

### 4.1 `ServicesGrid.tsx` (RSC)

Props:
```ts
type ServiceItem = {
  id: string | number;
  title: string;
  slug: string;
  summary?: string;
  coverImage?: { url: string; alt?: string } | null;
};
type Props = { services: ServiceItem[] };
```

Markup (conceptual):
```tsx
<section className="nh-row py-30 mb-30 block-services">
  <div className="container">
    <h2 className="section-title-center">DỊCH VỤ CỦA HOÀNG KIM</h2>
    <p className="section-subtitle-center">Giải pháp tân cổ điển trọn gói từ thiết kế đến thi công</p>
    <div className="row services-grid">
      {services.map(s => (
        <article key={s.id} className="col-sm-6 col-xs-12 service-card">
          <div className="service-img">
            {s.coverImage ? <Image src={s.coverImage.url} alt={s.coverImage.alt ?? s.title} width={600} height={375} /> : null}
          </div>
          <div className="service-body">
            <h3 className="service-title">{s.title}</h3>
            {s.summary && <p className="service-desc">{s.summary}</p>}
            <Link className="service-cta" href={`/dich-vu/${s.slug}`}>Xem chi tiết <ArrowRight size={14} /></Link>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>
```

Render nothing khi `services.length === 0` (graceful empty).

### 4.2 `PartnersCarousel.tsx` (client, Swiper)

Reuse pattern từ `PressMentionsCarousel`. Props:
```ts
type PartnerItem = { id: string | number; name: string; logo: { url: string; alt?: string }; url?: string };
type Props = { items: PartnerItem[] };
```

Swiper config: `slidesPerView: 6` (≥1200), `4` (tablet), `3` (sm), `2` (xs). Autoplay 2000ms loop. Pagination dots ẩn.

Mỗi logo wrap trong `<a href={url} target="_blank" rel="nofollow noreferrer">` nếu có `url`, nếu không thì `<div>`. Khi `items.length === 0`, section không render.

### 4.3 `TestimonialsGrid.tsx` (RSC)

Props:
```ts
type TestimonialItem = {
  id: string | number;
  clientName: string;
  clientRole?: string;
  avatar?: { url: string; alt?: string } | null;
  content: string;
  rating?: number;
};
type Props = { items: TestimonialItem[] };
```

3 card grid (`col-sm-4` × 3). Mỗi card:
```tsx
<article className="testimonial-card">
  <blockquote className="testimonial-quote">"{item.content}"</blockquote>
  <div className="testimonial-meta">
    {item.avatar ? <Image src={item.avatar.url} alt={item.avatar.alt ?? item.clientName} width={48} height={48} className="testimonial-avatar" /> : <div className="testimonial-avatar fallback" />}
    <div>
      <div className="testimonial-name">{item.clientName}</div>
      {item.clientRole && <div className="testimonial-role">{item.clientRole}</div>}
    </div>
  </div>
</article>
```

Empty state: khi `items.length === 0`, section không render.

---

## 5 · Homepage composition

`apps/cms/app/(site)/page.tsx` — import và compose:

```tsx
import { ServicesGrid } from '../../src/components/site/ServicesGrid';
import { PartnersCarousel } from '../../src/components/site/PartnersCarousel';
import { TestimonialsGrid } from '../../src/components/site/TestimonialsGrid';
import { getServices, getPartners, getTestimonialsFeatured } from '../../src/lib/queries';

// …trong HomePage():
const [hp, pressDocs, services, partners, testimonials] = await Promise.all([
  getHomepage(), getPressMentions(), getServices(4), getPartners(), getTestimonialsFeatured(3),
]);

// …trong JSX (thứ tự A.html):
<main id="main" className="nh-row home">
  <Hero slides={heroSlides} />
  <AboutSlogan data={aboutData} />
  <ServicesGrid services={normalizeServices(services)} />
  <LeadCaptureBanner data={ctaBlock} />
  <TestimonialsGrid items={normalizeTestimonials(testimonials)} />
  <PressMentionsCarousel items={press} />
  <PartnersCarousel items={normalizePartners(partners)} />
</main>
```

Helper `normalize*` tương tự `normalizeImage` — chuẩn hoá Media URL, chặn crash khi field empty.

---

## 6 · Seed data

### 6.1 Ảnh download (Unsplash)

**4 service images** (lưu `apps/cms/public/vendor/images/seed/services/`):
| File | Nguồn Unsplash (photo ID) |
|---|---|
| `thiet-ke-kien-truc.jpg` | photo-1503387762-592deb58ef4e (architect blueprint) |
| `thi-cong-xay-dung.jpg` | photo-1541976590-713941681591 (construction crane/site) |
| `thiet-ke-noi-that.jpg` | photo-1586023492125-27b2c045efd7 (classical interior) |
| `san-xuat-noi-that.jpg` | photo-1504148455328-c376907d081c (woodworking workshop) |

**6 partner logos** (lưu `apps/cms/public/vendor/images/seed/partners/`):
Logo PNG từ brandkit chính thức mỗi hãng — tải về manual, không embed URL CDN của hãng.

| File | Hãng | Nguồn brandkit URL (manual fetch) |
|---|---|---|
| `kohler.png` | KOHLER | kohler.com press room |
| `toto.png` | TOTO Vietnam | toto.com.vn brand assets |
| `hafele.png` | Häfele | hafele.com.vn media center |
| `dulux.png` | Dulux (AkzoNobel) | dulux.com.vn brand guidelines |
| `jotun.png` | Jotun | jotun.com.vn logo download |
| `nippon.png` | Nippon Paint | nipponpaint.com.vn press |

⚠️ **Disclaimer:** Logo hãng là trademark. Trước khi deploy production, client phải có văn bản chấp thuận partner với các hãng này, hoặc thay bằng logo đối tác thực tế. Seed ở đây là DEMO.

**3 testimonial avatars** (lưu `apps/cms/public/vendor/images/seed/testimonials/`):
| File | Unsplash photo ID |
|---|---|
| `avatar-tuan.jpg` | photo-1472099645785-5658abf4ff4e (nam trung niên) |
| `avatar-linh.jpg` | photo-1494790108377-be9c29b29330 (nữ trung niên) |
| `avatar-phat.jpg` | photo-1560250097-0b93528c311a (nam doanh nhân) |

**Alt attribute:** `"Khách hàng minh hoạ"` cho 3 avatar — ghi rõ là minh hoạ, tránh gây hiểu nhầm là khách hàng thật.

### 6.2 Seed script

`apps/cms/src/seed/media.ts` — thêm findOrCreate cho 4 service + 6 partner + 3 avatar (13 Media docs mới).

`apps/cms/src/seed/services.ts` — reuse / tạo mới, seed 4 service:
```ts
const SERVICES = [
  {
    title: 'Thiết kế kiến trúc',
    slug: 'thiet-ke-kien-truc',
    summary: 'Kiến trúc sư Hoàng Kim thiết kế biệt thự, lâu đài, nhà phố tân cổ điển theo phong cách châu Âu.',
    order: 1,
    coverImage: 'thiet-ke-kien-truc.jpg',
  },
  {
    title: 'Thi công xây dựng',
    slug: 'thi-cong-xay-dung',
    summary: 'Thi công trọn gói hoặc phần thô, đảm bảo tiến độ và chất lượng theo tiêu chuẩn Việt Nam.',
    order: 2,
    coverImage: 'thi-cong-xay-dung.jpg',
  },
  {
    title: 'Thiết kế nội thất',
    slug: 'thiet-ke-noi-that',
    summary: 'Nội thất tân cổ điển dát vàng với chất liệu gỗ tự nhiên, da thật, đá cẩm thạch nhập khẩu.',
    order: 3,
    coverImage: 'thiet-ke-noi-that.jpg',
  },
  {
    title: 'Sản xuất nội thất',
    slug: 'san-xuat-noi-that',
    summary: 'Xưởng riêng 2.000m², sản xuất đồ gỗ, tủ bếp, giường, sofa cao cấp theo yêu cầu thiết kế.',
    order: 4,
    coverImage: 'san-xuat-noi-that.jpg',
  },
];
```

`apps/cms/src/seed/partners.ts` — **mới**:
```ts
const PARTNERS = [
  { name: 'KOHLER', logo: 'kohler.png', url: 'https://www.kohler.com/en-vn', order: 1 },
  { name: 'TOTO', logo: 'toto.png', url: 'https://vn.toto.com', order: 2 },
  { name: 'Häfele', logo: 'hafele.png', url: 'https://www.hafele.com.vn', order: 3 },
  { name: 'Dulux', logo: 'dulux.png', url: 'https://www.dulux.com.vn', order: 4 },
  { name: 'Jotun', logo: 'jotun.png', url: 'https://www.jotun.com/vn', order: 5 },
  { name: 'Nippon Paint', logo: 'nippon.png', url: 'https://www.nipponpaint.com.vn', order: 6 },
];
```

`apps/cms/src/seed/testimonials.ts` — đảm bảo 3 entry có `order: 1-3` và có `avatar` set. Nếu file đã seed testimonials khác, thay/ghi đè đúng 3 featured:
```ts
const FEATURED_TESTIMONIALS = [
  {
    clientName: 'Anh Tuấn',
    clientRole: 'Chủ biệt thự · Hà Nội',
    content: 'Biệt thự tân cổ điển ở Hà Đông của tôi đã trở thành tác phẩm nghệ thuật nhờ Hoàng Kim. Đội ngũ rất chuyên nghiệp, từ kiến trúc sư đến thợ thi công.',
    avatar: 'avatar-tuan.jpg',
    order: 1,
  },
  {
    clientName: 'Chị Linh',
    clientRole: 'Nhà phố · Bắc Ninh',
    content: 'Thi công đúng tiến độ, không phát sinh chi phí. Chất lượng nội thất vượt kỳ vọng, gia đình rất hài lòng.',
    avatar: 'avatar-linh.jpg',
    order: 2,
  },
  {
    clientName: 'Ông Phát',
    clientRole: 'Lâu đài · Hải Phòng',
    content: 'Phong cách tân cổ điển đúng gu gia đình tôi. Kiến trúc sư lắng nghe và điều chỉnh theo phong thủy, rất đáng tin cậy.',
    avatar: 'avatar-phat.jpg',
    order: 3,
  },
];
```

`apps/cms/src/seed/index.ts` — thêm import + call `seedPartners()` sau `seedTestimonials()`.

### 6.3 Ảnh fetch workflow

2 cách download ảnh:
1. **Manual:** Người thực thi tải ảnh Unsplash + partner logo, đặt vào path đúng.
2. **Script:** Thêm `apps/cms/scripts/fetch-plan-a-assets.sh` — `curl` từng URL Unsplash (`https://images.unsplash.com/photo-{id}?w=1200&q=80`) + log cho partner logo manual.

Script approach (`apps/cms/scripts/fetch-plan-a-assets.sh`):
```bash
#!/usr/bin/env bash
set -euo pipefail
BASE=apps/cms/public/vendor/images/seed
mkdir -p "$BASE/services" "$BASE/partners" "$BASE/testimonials"

# Services (4)
curl -L "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80" -o "$BASE/services/thiet-ke-kien-truc.jpg"
curl -L "https://images.unsplash.com/photo-1541976590-713941681591?w=1200&q=80" -o "$BASE/services/thi-cong-xay-dung.jpg"
curl -L "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80" -o "$BASE/services/thiet-ke-noi-that.jpg"
curl -L "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80" -o "$BASE/services/san-xuat-noi-that.jpg"

# Testimonial avatars (3)
curl -L "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&q=80&fit=crop" -o "$BASE/testimonials/avatar-tuan.jpg"
curl -L "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&q=80&fit=crop" -o "$BASE/testimonials/avatar-linh.jpg"
curl -L "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&h=240&q=80&fit=crop" -o "$BASE/testimonials/avatar-phat.jpg"

echo "Partner logos — tải manual từ brandkit mỗi hãng vào $BASE/partners/ (kohler.png, toto.png, hafele.png, dulux.png, jotun.png, nippon.png)"
```

---

## 7 · Styling

`apps/cms/public/vendor/css/css_custom.css` — append block ~60 dòng:

```css
/* S3 Services grid ------------------------------------------------ */
.block-services { padding: 60px 0; }
.block-services .section-title-center { color: var(--gold-light); margin-bottom: 8px; }
.block-services .section-subtitle-center { text-align: center; color: var(--text-muted); font-size: 14px; margin-bottom: 36px; }
.services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
@media (max-width: 767.98px) { .services-grid { grid-template-columns: 1fr; } }
.service-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-gold);
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s ease;
}
.service-card:hover { transform: translateY(-4px); }
.service-img img { width: 100%; height: auto; display: block; aspect-ratio: 16/10; object-fit: cover; }
.service-body { padding: 20px; }
.service-title { color: var(--gold-light); font-size: 18px; margin: 0 0 10px; }
.service-desc { color: var(--text-muted); font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
.service-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--gold-mid);
    font-size: 13px;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
}
.service-cta:hover { border-bottom-color: var(--gold-mid); }

/* S12 Testimonials grid ------------------------------------------- */
.block-testimonials { padding: 60px 0; }
.testimonial-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-gold);
    border-radius: 8px;
    padding: 28px 24px;
    height: 100%;
}
.testimonial-quote {
    color: var(--text-primary);
    font-size: 15px;
    line-height: 1.7;
    font-style: italic;
    margin: 0 0 20px;
    quotes: '"' '"';
}
.testimonial-meta { display: flex; align-items: center; gap: 12px; }
.testimonial-avatar {
    width: 48px; height: 48px; border-radius: 50%; object-fit: cover;
    border: 2px solid var(--border-gold);
}
.testimonial-avatar.fallback {
    background: linear-gradient(135deg, var(--gold-light), var(--gold-dark));
}
.testimonial-name { color: var(--gold-light); font-size: 14px; font-weight: 600; }
.testimonial-role { color: var(--text-muted); font-size: 12px; }

/* S14 Partners carousel ------------------------------------------- */
.block-partners { padding: 40px 0; }
.partner-item {
    aspect-ratio: 3 / 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(241, 224, 117, 0.15);
    border-radius: 6px;
    padding: 16px;
}
.partner-item img {
    max-width: 100%;
    max-height: 60px;
    width: auto;
    height: auto;
    filter: brightness(0.95);
    transition: filter 0.2s;
}
.partner-item:hover img { filter: brightness(1.1); }
```

---

## 8 · Kiểm thử

### 8.1 Tự động
- `pnpm --filter cms typecheck` pass.
- `pnpm --filter cms build` pass (Payload generate type cho `partners`).
- Biome lint: 0 error trên file mới.

### 8.2 Manual / Visual
- `pnpm --filter cms seed` không lỗi; admin `/admin` thấy collection `Partners` với 6 doc + `Services` 4 doc + `Testimonials` ≥ 3.
- Homepage `/` tại 1920 / 1440 / 768 / 375 render đủ 3 section mới ở đúng vị trí, không console error.
- Ảnh tất cả load (status 200), không placeholder broken.
- Admin edit 1 service title → homepage cập nhật sau revalidate 3600s hoặc hot reload trong dev.

### 8.3 Tiêu chí done
1. Collection `partners` đăng ký trong config, admin UI render.
2. 4 service card grid 2×2 (desktop) hiển thị đúng tại `/`.
3. 6 partner logo carousel Swiper autoplay loop.
4. 3 testimonial card text + avatar.
5. Ảnh 13 file (4 service + 6 partner + 3 avatar) lưu trong `public/vendor/images/seed/{services,partners,testimonials}/`.
6. `pnpm seed` idempotent (chạy lại không tạo trùng).
7. Commit riêng: `feat(web): homepage plan A — services, partners, testimonials`.

---

## 9 · Rủi ro & rollback

| Rủi ro | Khả năng | Mitigation |
|---|---|---|
| Logo partner là trademark hãng → legal | Trung bình | Disclaimer trong seed code comment + README ghi rõ "DEMO only, client phải xác nhận partner trước deploy" |
| Avatar Unsplash không phản ánh khách thật | Trung bình | `alt="Khách hàng minh hoạ"` + comment rõ; admin upload lại khi có feedback thật |
| Payload config fail khi thêm collection | Thấp | Tuân pattern collection có sẵn (`services`, `press-mentions`) — copy skeleton |
| Ảnh Unsplash URL đổi (photo ID deleted) | Thấp | Script download → lưu local; không hotlink runtime |
| Swiper SSR hydration mismatch | Thấp | Reuse pattern `PressMentionsCarousel` đã test |
| Seed chạy 2 lần tạo duplicate | Thấp | findOrCreate theo `name` (Partners), `slug` (Services), `clientName` (Testimonials) |

**Rollback:** 1 commit revert. Migration DB không phá huỷ — drop collection `partners` nếu cần qua admin.

---

## 10 · File changes summary

### File code mới (6)
- `apps/cms/src/collections/partners.ts`
- `apps/cms/src/seed/partners.ts`
- `apps/cms/src/components/site/ServicesGrid.tsx`
- `apps/cms/src/components/site/PartnersCarousel.tsx`
- `apps/cms/src/components/site/TestimonialsGrid.tsx`
- `apps/cms/scripts/fetch-plan-a-assets.sh`

### Asset mới (13 file image)
- `apps/cms/public/vendor/images/seed/services/` — 4 jpg
- `apps/cms/public/vendor/images/seed/partners/` — 6 png
- `apps/cms/public/vendor/images/seed/testimonials/` — 3 jpg

### File sửa (8)
- `apps/cms/src/payload.config.ts` — import Partners
- `apps/cms/src/lib/queries.ts` — 3 query helper
- `apps/cms/src/seed/index.ts` — call seedPartners
- `apps/cms/src/seed/media.ts` — upload 13 file mới
- `apps/cms/src/seed/services.ts` — 4 services có coverImage
- `apps/cms/src/seed/testimonials.ts` — 3 featured có avatar
- `apps/cms/app/(site)/page.tsx` — compose 3 component mới
- `apps/cms/public/vendor/css/css_custom.css` — ~60 dòng style (1 append block)

**Tổng:** 6 file code mới + 13 asset mới + 8 file sửa.
