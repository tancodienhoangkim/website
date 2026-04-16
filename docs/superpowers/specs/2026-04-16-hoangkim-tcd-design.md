# Tân cổ điển Hoàng Kim — Design Spec

**Ngày:** 2026-04-16
**Tác giả:** Brainstorm giữa user & Claude
**Input:** `A.html` (bản lưu homepage hoangkim-tcd.com) + ~187 asset trong `images/`
**Goal:** Deploy một site mới có **layout & visual giống hệt** A.html khi mở trên trình duyệt, đồng thời **đầy đủ chức năng** như site Tân cổ điển Hoàng Kim gốc.

---

## 1. Bối cảnh & mục tiêu

### Vấn đề
File `A.html` là bản saved-from-URL của homepage hoangkim-tcd.com (425 KB, 1479 dòng, có inline minified styles + nhiều script tracking). Người dùng muốn tái dựng thành một website Next.js **mới**, deploy thật, với:

- Homepage nhìn giống y hệt A.html khi mở browser.
- Đầy đủ các trang con + tính năng như site Tân cổ điển Hoàng Kim gốc (mega menu, popup, Zalo/Messenger chat, form tư vấn, báo giá, carousel, lightbox, search, v.v.).
- CMS quản lý content (dự án, tin tức, dịch vụ, đội ngũ, báo chí, testimonials).
- Content ban đầu: placeholder + vài mẫu demo (không migrate toàn bộ nội dung gốc).

### Mục tiêu (Goals)
1. **Pixel-perfect homepage** so với A.html (tolerance < 0.5% visual diff trong Playwright screenshot test).
2. **Feature parity** với các chức năng liệt kê trong §5 Feature matrix.
3. **CMS-driven**: admin sửa được mọi nội dung mà không cần code.
4. **Production-ready**: deploy thật, SEO tốt, performance tốt, có monitoring.
5. **Codebase maintainable**: typed end-to-end, test cover các flow chính.

### Non-goals
- Không migrate toàn bộ nội dung/ảnh gốc của Tân cổ điển Hoàng Kim.
- Không hỗ trợ đa ngôn ngữ ngay (chỉ tiếng Việt); có thể bật sau qua plugin `localization` của Payload.
- Không có dark mode.
- Không tự host search engine riêng (dùng full-text search của Postgres qua Payload).
- Không build native mobile app.

---

## 2. Kiến trúc tổng thể (Approach B — tách Backend/Frontend)

```
┌────────────────────────┐        ┌─────────────────────────┐
│  Next.js Frontend      │  HTTP  │  Payload CMS Backend    │
│  (Vercel)              │ ─────► │  (Railway)              │
│                        │ REST   │                         │
│  - App Router          │ /api/* │  - Node.js + Express    │
│  - ISR + on-demand     │        │  - Admin UI /admin      │
│  - SEO metadata        │        │  - Auth (JWT)           │
│  - www.hoangkim-tcd.vn  │        │  - api.hoangkim-tcd.vn   │
└────────────────────────┘        └──────────┬──────────────┘
                                             │
                      ┌──────────────────────┴──────────────┐
                      │                                     │
                 ┌────▼─────────┐                    ┌──────▼───────┐
                 │ Neon/Railway │                    │ Cloudflare R2│
                 │ PostgreSQL   │                    │ media.hoangkim-tcd..│
                 └──────────────┘                    └──────────────┘
```

**Quyết định chính:**
- **2 process riêng**, 2 domain, 2 deploy pipeline.
- Frontend render bằng **ISR** (`revalidate: 60–300s` + webhook `revalidateTag` on-demand khi CMS publish).
- Payload `afterChange` hook → `POST /api/revalidate` → Next.js invalidate đúng tag.
- DB: **PostgreSQL** (Neon serverless cho auto-scale, hoặc Railway Postgres cho đơn giản).
- Media storage: **Cloudflare R2** (S3-compat, egress free, rẻ). Serve qua CDN domain `media.hoangkim-tcd.vn`.

**Trade-off chấp nhận:** 2 pipeline thay vì 1, bù lại scale độc lập, CMS có vấn đề không ảnh hưởng frontend cache.

---

## 3. Data model

### Collections

| Collection | Fields chính | Ghi chú |
|---|---|---|
| `projects` | title, slug, category (rel), coverImage, gallery[], summary, body (Lexical rich text), location, area, year, featured:bool, status:enum, seo:group | Dự án: biệt thự, lâu đài, nội thất, thi công... |
| `project-categories` | title, slug, description, coverImage, parent (rel self), order | Hỗ trợ nested (biệt thự → tân cổ điển, Pháp, hiện đại...) |
| `services` | title, slug, icon, summary, body, order, seo | Dịch vụ chính |
| `news` | title, slug, category (rel), coverImage, excerpt, body, publishedAt, author (rel user), seo | Tin tức / blog |
| `news-categories` | title, slug, order | — |
| `team-members` | name, role, photo, bio, order | Đội ngũ |
| `press-mentions` | publicationName, logo, articleUrl, date, order | Logo "báo chí nói về Tân cổ điển Hoàng Kim" |
| `testimonials` | clientName, clientRole, avatar, content, rating, videoUrl?, order | Cảm nhận khách hàng |
| `jobs` | title, slug, department, location, summary, body, deadline, status | Tuyển dụng |
| `contact-submissions` | name, phone, email, message, source (enum: contact/quote/consultation/newsletter), createdAt, status, notes | Read-only trong admin, có export CSV |
| `subscribers` | email, createdAt, source | Newsletter footer |
| `nav-menu` | title, slug, url?, parent (rel self), order, megaMenuLayout?, featuredImage? | Megamenu config — nested, max 3 levels |
| `media` | file (upload), alt, caption | Payload built-in, storage R2 |
| `users` | email, role:enum(admin,editor), avatar | Payload built-in, 2FA |

### Globals (single-instance)

- `site-settings` — logo, favicon, hotline, email, address, hours, social links, GA/GTM/Pixel IDs, meta defaults.
- `header` — top-bar text, CTA button, nav-menu binding.
- `footer` — columns (array of { title, links[] }), copyright, payment/cert images.
- `homepage` — hero slides (array), featuredCategories (rel many), featuredProjects (rel many), aboutSnippet (rich text), stats (array of { label, value }), pressMentionIds (rel many), testimonialIds (rel many), ctaBlocks.
- `promo-popup` — enabled, image, link, startDate, endDate, suppressHours (default 24).

### Shared fields
- `seo` group: metaTitle, metaDescription, ogImage, canonicalOverride?, noindex:bool.
- `slug` field tự generate từ `title` (hook `slugify.ts`), có thể edit thủ công.

### Quan hệ
```
project        ─► project-category (many-to-one)
project-category ─► project-category parent (self, nested)
news           ─► news-category (many-to-one)
homepage.featuredProjects ─► projects (m2m, ordered)
homepage.featuredCategories ─► project-categories (m2m, ordered)
nav-menu       ─► nav-menu parent (self, tree)
```

---

## 4. Sitemap & routes

```
/                                  Homepage (mirror A.html)
├── /ve-chung-toi/                  Giới thiệu (group)
│   ├── /gioi-thieu                  Về TÂN CỔ ĐIỂN HOÀNG KIM
│   ├── /y-nghia-logo-thong-diep
│   ├── /doi-ngu
│   ├── /xuong-san-xuat
│   ├── /ho-so-nang-luc
│   ├── /bao-chi
│   └── /hoat-dong
├── /dich-vu/                       Dịch vụ listing
│   └── /[slug]                      thiet-ke-kien-truc, thi-cong-tron-goi,
│                                    thiet-ke-noi-that, thi-cong-xay-dung-co-ban,
│                                    thi-cong-hoan-thien-noi-that, san-xuat-noi-that
├── /bao-gia                        Báo giá calculator
├── /thiet-ke-biet-thu/             Biệt thự (category parent)
│   └── /[style]                     15 styles: tan-co-dien, co-dien-phap, hien-dai,
│                                    chau-au, dia-trung-hai, indochine, nha-vuon,
│                                    mai-thai, mai-nhat, mai-mansard, 1-tang...6-tang,
│                                    pho, mini
├── /lau-dai-dinh-thu/
│   └── /{thiet-ke-lau-dai, thiet-ke-dinh-thu}
├── /thiet-ke-nha-pho/
│   └── /[style]                     10 styles: 2-6 tang, kieu-phap, tan-co-dien,
│                                    hien-dai, indochine
├── /thiet-ke-tru-so-khach-san/
│   └── /{thiet-ke-tru-so-van-phong, thiet-ke-khach-san-nha-hang}
├── /thiet-ke-noi-that/
│   └── /[style]                     8 styles
├── /thi-cong/
│   └── /[slug]                      hinh-anh-hoan-thien-*, giam-sat-thi-cong-*
├── /thiet-ke-san-vuon
├── /du-an/[slug]                   Chi tiết dự án
├── /tin-tuc/                       Tin tức listing (pagination)
│   └── /[slug]                      Chi tiết bài
├── /video/cam-nhan-khach-hang      Video testimonial
├── /tuyen-dung/
│   └── /[slug]
├── /lien-he                        Liên hệ (form + map + info)
├── /dang-ky-tu-van                 Landing form tư vấn
├── /tim-kiem?q=...                 Search results
├── /sitemap.xml                    Auto-generate từ CMS
├── /robots.txt
├── /tin-tuc/rss.xml                RSS feed
├── /404                            Custom 404
└── /500                            Custom 500
```

### Rendering strategy

| Route | Strategy | Revalidate |
|---|---|---|
| `/` | SSG + ISR | 300s + webhook |
| `/du-an` + `/du-an/[slug]` | SSG + ISR | 300s + on-demand tag |
| `/tin-tuc/*` | SSG + ISR | 60s + on-demand tag |
| `/lien-he`, `/bao-gia` | Static shell + client form | never (form ở client) |
| `/tim-kiem` | Dynamic (SSR) | per-request, cache 60s nếu query trùng |
| `/sitemap.xml` | SSG + ISR | 3600s |

---

## 5. Feature matrix (parity với Tân cổ điển Hoàng Kim)

| Feature | Vị trí | Implementation |
|---|---|---|
| Mega menu nhiều cấp | Header | Payload `nav-menu` (tree), render bằng Radix `NavigationMenu` |
| Sticky header | Toàn site | `position: sticky` + shrink-on-scroll |
| Hero slider | Homepage | Owl Carousel (legacy, pixel-match) qua dynamic import |
| Popup chào mừng | Homepage | Global `promo-popup` + localStorage suppress 24h |
| Lazy load images | Mọi nơi | `next/image` + blur placeholder |
| Lightbox / gallery | Project detail | `yet-another-react-lightbox` |
| Carousel category | Homepage/listing | Owl Carousel (homepage mirror) + Embla (pages mới) |
| Form đăng ký tư vấn | Homepage + sticky sidebar + `/dang-ky-tu-van` | React Hook Form + Zod + reCAPTCHA v3 → POST `/api/contact` → lưu `contact-submissions` + email SMTP |
| Hotline sticky button | Mobile bottom | Float: `tel:` + Zalo + Messenger |
| Zalo chat | Toàn site | Zalo OA SDK, lazy load on idle |
| Facebook Messenger | Toàn site | FB Customer Chat plugin, lazy load |
| Back-to-top | Toàn site | Visible khi scroll > 400px |
| Search | Header | Full-text Postgres qua Payload `where` với `like` + rank → `/tim-kiem` |
| Newsletter subscribe | Footer | Email → `subscribers` collection |
| Báo giá calculator | `/bao-gia` | Multi-step form (loại công trình → DT → tầng) → ước tính + lưu lead |
| Video embed | News/Project | YouTube lazy (`react-lite-youtube-embed`) |
| GA4 + GTM | Toàn site | `@next/third-parties/google` |
| Facebook Pixel | Toàn site | Script trong root layout |
| SEO meta per page | Mọi page | `generateMetadata()` từ CMS `seo` field |
| Sitemap.xml | `/sitemap.xml` | Next `sitemap.ts` generate từ CMS |
| Robots.txt | `/robots.txt` | Static |
| Breadcrumb | Mọi page con | Component dùng `next/navigation` segments + JSON-LD |
| RSS feed | `/tin-tuc/rss.xml` | Generate từ news collection |
| 404 custom | `not-found.tsx` | Search + link phổ biến |
| Responsive mobile | Toàn site | Tailwind breakpoints, mobile-first |
| JSON-LD | Toàn site | Organization, LocalBusiness, Article, Product |
| Tuyển dụng | `/tuyen-dung` | Listing + detail từ `jobs` collection, apply form gửi về `contact-submissions` (source=recruitment) |

---

## 6. Design system

### Color tokens (extracted từ `main.css`)
```css
--brand-primary:    #ed1c24   /* đỏ Tân cổ điển Hoàng Kim signature */
--brand-primary-2:  #ea0009   /* đỏ đậm hover */
--brand-accent:     #ffb300   /* vàng CTA */
--brand-ink:        #1e1e1e
--brand-ink-2:      #383838
--brand-gray-1:     #333333
--brand-gray-2:     #666666
--brand-gray-3:     #999999
--brand-gray-4:     #cccccc
--brand-gray-5:     #dedede
--brand-bg:         #f0f0f0
--brand-white:      #ffffff
```

### Typography
- **Font:** Roboto duy nhất (Google Fonts, self-host qua `next/font/google`).
- **Scale:** 12/14/16/18/20/24/30/36/48/60 px.

### Layout
- Container: `max-width: 1200px`.
- Grid: 12 cột, gutter 24px (Bootstrap v4 compatible).
- Breakpoints: sm 576 / md 768 / lg 992 / xl 1200 / 2xl 1400.
- Spacing scale: 0/4/8/12/16/20/24/32/40/48/64/80/96 px.

### CSS strategy (pixel-perfect port)
- **Port trực tiếp** các CSS gốc vào `apps/web/public/assets/css/`:
  - `main.css`, `css_custom.css`, `megamenu.css`, `megamenu_custom.css`, `animate.min.css`, `owl.carousel.css`, `jquery.gritter.min.css`, `jquery-ui.css`, `bootstrap.min.css`, `font-awesome.css`, `page.css`.
- Import trong root layout qua `<link rel="stylesheet">`.
- React component **giữ nguyên class names** của Bootstrap/megamenu gốc để CSS cascade đúng.
- **Tailwind CSS v4** chỉ dùng cho code mới (pages chưa có trong A.html: listing/detail/search/forms).
- `clsx` + `tailwind-merge` khi compose class.

### jQuery & Owl Carousel
- Load qua `next/script strategy="afterInteractive"`.
- Carousel wrap trong client component với `dynamic(() => ..., { ssr: false })`.
- Isolated trong client, không rò rỉ vào SSR.

### Component library (Tailwind + CVA + Radix)

| Component | Base |
|---|---|
| `Button` (primary/secondary/ghost) | native + CVA |
| `Input`, `Textarea`, `Select` | native / Radix |
| `Card` (project/news/service) | — |
| `Badge` | — |
| `Breadcrumb` | — |
| `Accordion` (FAQ, mobile menu) | Radix Accordion |
| `Dialog/Modal` | Radix Dialog |
| `NavigationMenu` (mega menu, pages mới) | Radix NavigationMenu |
| `Tabs` (project detail) | Radix Tabs |
| `Carousel` | Owl (legacy) + Embla (new) |
| `Lightbox` | yet-another-react-lightbox |
| `Toast` | Sonner |
| `Skeleton` | Tailwind animation |

### Animation
- `tailwindcss-animate` cho enter/exit.
- Framer Motion cho scroll reveal + hero transitions.
- Respect `prefers-reduced-motion`.

### Icons
- `lucide-react` (tree-shaken).
- Custom SVG cho logo + icon dịch vụ cụ thể.

---

## 7. Repo structure & data flow

### Monorepo (pnpm workspace + Turborepo)

```
hoangkim-tcd/
├── apps/
│   ├── web/                     Next.js 15 App Router
│   │   ├── app/
│   │   │   ├── (marketing)/     Group các page công khai
│   │   │   │   ├── page.tsx           Homepage (mirror A.html)
│   │   │   │   ├── ve-chung-toi/
│   │   │   │   ├── dich-vu/[slug]/
│   │   │   │   ├── du-an/[slug]/
│   │   │   │   ├── tin-tuc/[slug]/
│   │   │   │   ├── lien-he/
│   │   │   │   └── bao-gia/
│   │   │   ├── api/
│   │   │   │   ├── contact/route.ts
│   │   │   │   ├── newsletter/route.ts
│   │   │   │   └── revalidate/route.ts
│   │   │   ├── layout.tsx       Root: GTM, Pixel, fonts, legacy CSS
│   │   │   ├── sitemap.ts
│   │   │   └── robots.ts
│   │   ├── components/
│   │   │   ├── layout/          Header, Footer, MegaMenu, StickyCTA, PromoPopup
│   │   │   ├── home/            HeroSlider, CategoryGrid, PressLogos,
│   │   │   │                    FeaturedProjects, Testimonials, ContactBlock,
│   │   │   │                    StatsBlock, AboutSnippet
│   │   │   ├── project/         ProjectCard, ProjectGallery, ProjectInfo
│   │   │   ├── news/            NewsCard, NewsBody
│   │   │   ├── forms/           ContactForm, QuoteCalculator, NewsletterInput
│   │   │   ├── chat/            ZaloWidget, MessengerWidget, HotlineFab
│   │   │   └── ui/              Button, Card, Badge, Modal, Toast...
│   │   ├── lib/
│   │   │   ├── payload-client.ts
│   │   │   ├── fetch.ts
│   │   │   └── seo.ts
│   │   ├── public/assets/       Legacy CSS/JS từ images/
│   │   └── package.json
│   │
│   └── cms/                     Payload 3 standalone
│       ├── src/
│       │   ├── collections/
│       │   ├── globals/
│       │   ├── fields/          shared (seo, slug)
│       │   ├── hooks/           revalidate, slugify, email
│       │   ├── access/
│       │   └── payload.config.ts
│       ├── server.ts
│       └── package.json
│
├── packages/
│   └── types/                   TS types từ Payload generated
│
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

### Data flow — read path
```
User GET /du-an/biet-thu-phap-3-tang
 → Next App Router → generateStaticParams (build/ISR)
 → fetch(`${CMS_URL}/api/projects?where[slug][equals]=...`,
         { next: { revalidate: 300, tags: ['project:biet-thu-phap-3-tang'] } })
 → Payload handler → Postgres query → JSON
 → RSC render → HTML → browser
```

### Data flow — write/revalidate
```
Admin edits project in /admin
 → Payload afterChange hook
 → POST https://www.hoangkim-tcd.vn/api/revalidate
    { tag: 'project:<slug>', secret: $WEBHOOK_SECRET }
 → Next revalidateTag(...) → cache invalidated
 → Next user request → rebuild page
```

### Contact form flow
```
ContactForm (client) → validate Zod
 → POST /api/contact (Next route handler, rate-limited 5/min/IP)
 → Verify reCAPTCHA v3 token
 → POST $CMS_URL/api/contact-submissions (service token)
 → Payload afterChange → send email via Resend
 → 200 → Toast success
```

---

## 8. Testing

| Layer | Tool | Coverage target |
|---|---|---|
| Unit (lib/utils) | Vitest | lib helpers, validators, slug |
| Component | Vitest + Testing Library | forms, cards, breadcrumb |
| E2E (critical flows) | Playwright | submit contact, nav megamenu, view project detail, search |
| Visual regression | Playwright screenshots | homepage + 3 trang key so với A.html baseline |
| CMS schema | Payload test utils | CRUD + relationship integrity |
| API contract | MSW | mock Payload responses trong web tests |
| Accessibility | `@axe-core/playwright` | homepage, contact form, navigation |
| Performance | Lighthouse CI | LCP < 2.5s, CLS < 0.1 |

**Không test:** third-party widget (Zalo, Messenger), GA tracking pixels.

---

## 9. Error handling

| Scenario | Handling |
|---|---|
| Payload down | Serve stale ISR cache + banner "Đang cập nhật". Log Sentry. |
| Contact form fail | Retry 2x, fallback hiển thị hotline. |
| Image missing | `next/image` fallback `logo-hoangkim-tcd.png`. |
| 404 project slug | `notFound()` → `not-found.tsx` với related items. |
| Invalid route | `notFound()`. |
| Slow CMS query | `Promise.race` timeout 3s → fallback stale. |
| Form validation | Zod inline errors tiếng Việt. |
| reCAPTCHA fail | Block submission, show hotline CTA. |

---

## 10. Deployment

```
┌──────────────────────────────────────┐
│ Vercel (Next.js frontend)            │
│   - Edge /api/contact                │
│   - ISR storage                      │
│   - www.hoangkim-tcd.vn               │
└──────────┬───────────────────────────┘
           │ REST https://api.hoangkim-tcd.vn
           ▼
┌──────────────────────────────────────┐
│ Railway (Payload CMS)                │
│   - Node.js                          │
│   - /admin                           │
│   - api.hoangkim-tcd.vn               │
└──┬──────────────────┬────────────────┘
┌──▼──────────┐   ┌───▼────────────┐
│ Neon        │   │ Cloudflare R2  │
│ PostgreSQL  │   │ media.hoangkim-tcd... │
└─────────────┘   └────────────────┘
```

### Environments
- **dev** — local, docker-compose Postgres, Payload local storage.
- **staging** — Vercel preview + Railway staging (branch = PR).
- **prod** — `main` auto-deploy.

### CI/CD (GitHub Actions)
```
on: push
  → lint (Biome) + typecheck (tsc) + unit test (Vitest)
  → build web + cms (Turborepo cache)
  → E2E on staging URL (Playwright)
  → deploy: Vercel (web) + Railway (cms)
  → post-deploy: Lighthouse CI + Sentry release tag
```

---

## 11. Observability & security

### Observability
- **Sentry** cả 2 apps (error + performance).
- **Vercel Analytics** (Core Web Vitals real-user).
- **Logtail/Better Stack** cho Payload logs.
- **Upptime** (free, GitHub Actions-based) uptime monitoring.

### Security
- Env vars chỉ trong Vercel/Railway secrets; không commit.
- CORS Payload whitelist `www.hoangkim-tcd.vn`.
- Rate limit `/api/contact` 5 req/min/IP (Upstash Redis).
- CSP header: `default-src 'self'`; whitelist GTM (`*.googletagmanager.com`), FB (`connect.facebook.net`), YouTube (`www.youtube.com`, `i.ytimg.com`), Zalo (`zalo.me`, `stc-zlj.zdn.vn`), media CDN (`media.hoangkim-tcd.vn`), Google Fonts (`fonts.gstatic.com`, `fonts.googleapis.com`).
- Payload admin: 2FA bật cho role admin.
- Image upload: server-side sanitize, no SVG, max 10 MB.
- `/api/revalidate` yêu cầu secret match.

---

## 12. Performance budgets

| Target | Budget |
|---|---|
| Homepage JS | < 200 KB gzipped |
| Homepage image LCP | < 200 KB |
| LCP | < 2.5s |
| TTI | < 4s |
| Route listing JS | < 300 KB |
| CLS | < 0.1 |

**Lazy import:** Owl Carousel, FB Messenger, Zalo chat — load khi idle hoặc user tương tác.

---

## 13. Content seeding

- **Placeholder + vài mẫu demo** (user đã chọn).
- Seed 3 projects mẫu, 3 news mẫu, 6 services (đúng bộ gốc), 5 team members, 8 press mentions, 3 testimonials.
- Mỗi collection có 1 seed script (`apps/cms/src/seed/*.ts`) chạy khi setup lần đầu: `pnpm --filter cms seed`.
- Images seed dùng lại ~10 file có sẵn trong `images/` (logo-hoangkim-tcd.png, hoangkim-tcd-year-end-party-2025.jpg, nha-may-*, thiet-ke-*).

---

## 14. Open questions & future work

1. **Domain tên thật:** spec giả định `hoangkim-tcd.vn` — user sẽ quyết domain thật khi deploy.
2. **Email provider:** Resend / Postmark / SendGrid — chọn khi setup (mặc định Resend: rẻ + DX tốt).
3. **reCAPTCHA keys:** user tự tạo trên Google reCAPTCHA console trước khi deploy.
4. **Zalo OA ID + FB Page ID:** cần tài khoản thật để gắn chat widget.
5. **GA4 / GTM / FB Pixel IDs:** user cung cấp khi deploy staging.
6. **Multilingual EN:** chưa làm, có thể bật `localization` plugin Payload sau.
7. **Dark mode:** không làm.
8. **E-commerce cho nội thất cao cấp:** ngoài scope hiện tại.

---

## 15. Quyết định tổng hợp

| Dimension | Chọn |
|---|---|
| Framework | Next.js 15 (App Router) |
| CMS | Payload 3 (standalone) |
| Database | PostgreSQL (Neon/Railway) |
| Media storage | Cloudflare R2 |
| Hosting frontend | Vercel |
| Hosting CMS | Railway |
| Repo layout | Monorepo pnpm + Turborepo |
| Styling | Legacy CSS port + Tailwind v4 (code mới) |
| Component primitives | Radix + CVA + Tailwind |
| Animation | tailwindcss-animate + Framer Motion |
| Font | Roboto (self-host via next/font) |
| Icons | lucide-react + custom SVG |
| Forms | React Hook Form + Zod |
| Email | Resend (mặc định) |
| Spam protection | reCAPTCHA v3 + rate limit |
| Analytics | GA4 + FB Pixel + Vercel Analytics |
| Error monitoring | Sentry |
| Testing | Vitest + Playwright + Lighthouse CI |
| Linting | Biome |
| Content strategy | Placeholder + seed 3 mẫu / collection |
| Đa ngôn ngữ | Không (chỉ VI) |
| Dark mode | Không |

---

## Phụ lục A — Map pages mới cần thiết kế layout

Vì A.html chỉ là homepage, các page sau cần thiết kế layout mới (dựa trên design tokens §6):

| Page | Layout đề xuất |
|---|---|
| Listing (du-an, tin-tuc) | Breadcrumb → page title + filter sidebar → grid card 3 cột → pagination |
| Detail project | Breadcrumb → hero cover → title + meta (DT, tầng, năm) → body rich text → gallery lightbox → related 3 items → CTA liên hệ |
| Detail news | Breadcrumb → cover → title + meta (date, author, category) → body → share buttons → related 3 items |
| About | Hero statement → story rich text → stats block → team grid → press logos → CTA |
| Contact | 2 cột: form (left) + info + map + hotline (right) → FAQ accordion |
| Báo giá | Multi-step form: (1) loại công trình → (2) DT + tầng → (3) phong cách → (4) thông tin liên hệ → kết quả ước tính + lead save |
| Search | Query input → tabs (dự án / tin tức / dịch vụ) → result cards với highlighted term |
| 404 | Hero big "404" → search box → popular links (homepage, dịch vụ chính) |

Mỗi layout reuse Header/Footer/StickyCTA chung.

---

## Phụ lục B — Class name map legacy CSS

Để pixel-perfect homepage, React component bọc HTML giữ các class sau từ `A.html`:

- `.nh-row`, `.container`, `.row`, `.col-sm-*`, `.col-md-*` (Bootstrap grid)
- `.item_block` (Tân cổ điển Hoàng Kim generic block)
- `.menu-footer-vertical`, `.box-ft`, `.footer-fanpage`, `.footer-phone` (footer)
- `.megamenu`, `.megamenu-custom` (header mega menu)
- `.owl-carousel`, `.owl-item`, `.owl-nav`, `.owl-dots` (carousel)
- `.gritter-item`, `.gritter-top` (notification/popup)

CSS variables đã identify trong §6 giữ nguyên hex values.
