# Remaining Work Plan — Tân Cổ Điển Hoàng Kim

**Ngày:** 2026-04-17
**Hoàn thành tới:** G1 (security hardening) — 85 commits local.
**Mục đích:** roadmap cho các plan còn lại, ưu tiên theo dependency (account → infra → content → polish → QA).

---

## Progress tracker

| Plan | Trạng thái | Commit |
|---|---|---|
| 1 · Foundation CMS | ✅ Done | Early session |
| 2 · Homepage shell | ✅ Done | Early |
| Ornament palette | ✅ | `e5ca928` |
| Icons SVG 16 bộ | ✅ | `39c6bbe` / `080e5b8` |
| A · Services/Partners/Testimonials | ✅ | `5be53c5` |
| B · Project grids S6-S10 | ✅ | `2a374a6` + `fa98220` |
| C · Video + Factory | ✅ | `26c804c` |
| D1 · Project listing/detail | ✅ | `9d5c2cf` |
| D2 · News listing/detail | ✅ | `2944f3d` |
| D3 · Service listing/detail | ✅ | `d773817` |
| E · Contact API + Popup | ✅ | `02585ca` |
| F · SEO + Analytics | ✅ | `87d41a2` |
| Akisa image cleanup | ✅ | `cc36997` + `c75429b` |
| Admin i18n Vietnamese | ✅ | `611413d` + `84ccb49` + `d9c28ef` |
| **G1 · Security hardening** | ✅ | `2b9af26` |

---

## Plan G2 — Deploy infrastructure **[PRIORITY 1]**

**Blocker:** cần accounts Vercel + Railway/Neon + Cloudflare R2 + Resend + domain registrar.

### Scope
1. **Hosting split:**
   - Frontend + CMS combined: Vercel (Next.js + Payload adapter same process)
   - Alternative: CMS trên Railway + Frontend trên Vercel (design gốc spec §2)
2. **Database:** Neon serverless Postgres (free tier 3GB) hoặc Railway Postgres ($5/mo)
3. **Media storage:** Cloudflare R2 (10GB free + 10M requests/mo) — S3-compat, đã có code skeleton với `@payloadcms/storage-s3`
4. **Email:** Resend (3k emails/mo free) — contact form + admin notifications
5. **Domain:** `hoangkim-tcd.vn` (tên thật do client quyết)
6. **CDN + DNS:** Cloudflare (free plan)

### Deliverables
- `.env.production.example` với đầy đủ secret keys
- `apps/cms/src/email/resend.ts` wrapper cho `[contact]` log → Resend sendMail
- Vercel project config (`vercel.json` nếu cần)
- Railway/Neon connection string setup guide
- R2 bucket + CORS config
- Deploy docs `docs/deploy/*.md`

### Kiểm thử
- `curl https://hoangkim-tcd.vn/sitemap.xml` → 200
- Admin `/admin` (hoặc Basic Auth gate) reachable
- Contact form submit → email đến inbox admin
- Media upload trong admin → file trên R2

### File changes (~5 new + 3 modify)
- `apps/cms/src/email/resend.ts` — mới
- `apps/cms/app/api/contact/route.ts` — tích hợp Resend
- `apps/cms/.env.production.example` — mới
- `docs/deploy/vercel.md`, `docs/deploy/railway.md`, `docs/deploy/r2.md` — mới

### Thời gian ước tính
4-6h (phần lớn là setup accounts + domain waiting DNS propagate)

---

## Plan G3 — Monitoring + CI **[PRIORITY 2]**

**Blocker:** Sentry account + Upptime GitHub Action + Lighthouse CI secret.

### Scope
1. **Sentry:** error + performance monitoring (cả server + client)
2. **Vercel Analytics:** Core Web Vitals real-user
3. **Upptime:** uptime monitoring public status page via GitHub Actions
4. **Lighthouse CI:** performance budget check (LCP < 2.5s, CLS < 0.1, JS < 200KB)
5. **Preview deploys:** Vercel PR preview environments
6. **CI/CD polish:** extend `.github/workflows/ci.yml` với lint + typecheck + build + E2E
7. **Postgres backup:** Railway/Neon automated daily snapshot

### Deliverables
- `apps/cms/sentry.client.config.ts` + `sentry.server.config.ts`
- `instrumentation.ts` Next.js 15 pattern
- `.github/workflows/lighthouse.yml`
- `.github/workflows/uptime.yml` (Upptime)
- Status page `status.hoangkim-tcd.vn` (static GitHub Pages)

### File changes (~6 new + 1 modify)
- `apps/cms/sentry.*.config.ts` × 2
- `apps/cms/instrumentation.ts`
- `.github/workflows/lighthouse.yml`, `.github/workflows/uptime.yml`
- `.github/workflows/ci.yml` — extend

### Thời gian ước tính
3-4h

---

## Plan G4 — Cloudflare WAF + Access **[PRIORITY 3]**

**Blocker:** Cloudflare account, domain DNS đã trỏ về CF.

### Scope
1. **WAF rules:**
   - Rate limit `/api/users/login` 10/phút/IP
   - Block common bot user agents
   - Challenge high-risk IPs (Tor exits, known scanners)
2. **Cloudflare Access:** Zero Trust SSO gate trước `/admin` (Google/Apple/Microsoft OAuth)
3. **IP allowlist rule:** `/admin` chỉ từ IP công ty/VPN
4. **Turnstile CAPTCHA:** contact form (thay vì reCAPTCHA)
5. **DDoS protection:** auto qua CF Pro (hoặc Free tier basic)
6. **Page Rules:** cache tĩnh cho `/vendor/*`, `/favicon.ico`

### Deliverables
- CF Access policy JSON configs
- Turnstile site key + widget embed trong `ContactFormClient`
- Middleware update verify Turnstile token server-side
- WAF rule import file

### File changes (~3 modify)
- `apps/cms/src/components/site/ContactFormClient.tsx` — Turnstile widget
- `apps/cms/app/api/contact/route.ts` — verify token
- `.env.*.example` — Turnstile site key + secret

### Thời gian ước tính
2-3h (phần lớn là CF dashboard click)

---

## Plan H — Content pages **[PRIORITY 2, có thể song song G2]**

### H1 — Static info pages (~4 pages)
- `/ve-chung-toi/gioi-thieu` — Giới thiệu Hoàng Kim (từ homepage `aboutSnippet` mở rộng)
- `/ve-chung-toi/y-nghia-logo-thong-diep` — ý nghĩa logo + slogan
- `/ve-chung-toi/doi-ngu` — team members (dùng `team-members` collection đã có)
- `/ve-chung-toi/ho-so-nang-luc` — PDF portfolio download

**Schema:** thêm global `about-pages` hoặc collection `static-pages` (richText + slug).

### H2 — Contact page `/lien-he`
- 2-col: form ContactFormClient (reuse) + info (map + hotline + địa chỉ + giờ)
- Embed Google Maps iframe
- FAQ accordion (optional)

### H3 — Tim kiem `/tim-kiem?q=`
- Server page query Payload `projects`/`news`/`services` với `like` filter
- Result tabs (Dự án / Tin tức / Dịch vụ)
- Highlight matched term
- Empty state + "related categories" link

### H4 — Tuyển dụng `/tuyen-dung`
- Listing `jobs` collection
- Detail `/tuyen-dung/[slug]`
- Apply form → `contact-submissions` với `source: 'recruitment'`

### H5 — Báo giá `/bao-gia`
- Multi-step calculator:
  1. Loại công trình (biệt thự / lâu đài / nội thất)
  2. Diện tích + số tầng
  3. Phong cách
  4. Thông tin liên hệ
- Kết quả ước tính (công thức hardcode hoặc admin-config table)
- Lead submit → `contact-submissions`

### Scope (H1-H5 = ~10 routes, 5-7 components, ~15-20h)

---

## Plan I — Live integrations **[PRIORITY 3]**

### I1 — Promo popup content
- Seed `promo-popup` enabled với image + link thật (client cung cấp)
- Preview test trên localhost

### I2 — Zalo chat widget (real SDK)
- Zalo OA ID required
- Embed `https://sp.zalo.me/plugins/sdk.js`
- Lazy load on idle
- Mobile: keep link-out fallback từ FloatingWidgets

### I3 — Facebook Messenger plugin
- FB Page ID + app ID required
- Embed Messenger Customer Chat plugin
- GDPR consent gate (skip cho VN market)

### I4 — Resend email templates
- Welcome email (newsletter signup)
- Contact notification (to admin)
- Auto-reply (to customer)
- HTML templates (react-email hoặc mjml)

### Blocker
- Zalo OA account setup (client)
- FB Page access (client)
- Resend domain verify DNS

### Thời gian
3-4h sau khi có access

---

## Plan J — QA + Polish **[PRIORITY 3, before launch]**

### J1 — Accessibility audit
- Run `@axe-core/playwright` trên 5 page chính
- Fix color contrast issues (gold trên burgundy ~4.5:1 OK, check details)
- Keyboard navigation (skip links, focus traps)
- Screen reader labels (aria-label đầy đủ)

### J2 — Responsive audit manual
- Test 1920 / 1440 / 1200 / 768 / 375 / 320
- Header hamburger menu mobile
- FloatingWidgets mobile bar
- Tables/grids break sanh OK

### J3 — Performance
- Lighthouse score ≥ 90 cả 4 categories
- LCP < 2.5s, CLS < 0.1, TBT < 200ms
- JS bundle < 200KB gzip
- Image optimization (WebP + blur placeholder)

### J4 — E2E tests Playwright
- Contact form submit flow
- Navigation mega menu
- Project card click → detail
- Admin login (basic auth + payload auth)
- Visual regression: homepage baseline

### J5 — Content review
- Proofreading Vietnamese copy
- Legal disclaimers (privacy, terms)
- Cookie consent banner (nếu GDPR apply)
- 404 page design

---

## Plan K — CSP strict [OPTIONAL]

- Remove `'unsafe-inline'` và `'unsafe-eval'` từ CSP
- Replace vendor CSS inline styles với CSS files
- Add nonce per request
- Test mọi third-party script (GA, GTM, Pixel) vẫn work

**Phức tạp, defer sau launch nếu cần compliance audit.**

---

## Plan L — Marketing features [FUTURE]

- Newsletter editor trong admin (Send Resend campaign)
- Blog related-posts AI (OpenAI embeddings)
- Schema.org FAQ + HowTo + Event markup
- Multi-language VI/EN (`@payloadcms/plugin-localization`)
- A/B testing (Vercel Edge Config)
- Heatmap (Microsoft Clarity free)
- Pop-up builder (variants, scheduling)

---

## Đề xuất thứ tự thi công

```
NGAY SAU KHI CÓ ACCOUNTS:
  1. G2 Deploy → site live trước
  2. G3 Monitoring → alerts/errors visible
  3. G4 Cloudflare WAF → production security

SONG SONG (khi đang chờ domain DNS):
  4. H2 Contact page (2-3h)
  5. H1 About pages (3-4h)
  6. H3 Tim kiem (2h)

POST-LAUNCH (tuần đầu):
  7. J1-J4 QA audit
  8. H4 Tuyển dụng
  9. H5 Báo giá calculator
  10. I1-I4 Live integrations

BACKLOG:
  11. K CSP strict
  12. L Marketing features
```

---

## Tổng commit còn lại ước tính

| Plan | Commit | Hours |
|---|---|---|
| G2 Deploy | 4-5 | 4-6 |
| G3 Monitoring | 3-4 | 3-4 |
| G4 Cloudflare | 2-3 | 2-3 |
| H1-H5 Content | 10-15 | 15-20 |
| I1-I4 Integrations | 4-6 | 3-4 |
| J1-J5 QA | 5-8 | 10-15 |
| K CSP (optional) | 2-3 | 3-5 |
| L Marketing (backlog) | 10+ | 20+ |

**Tổng từ G1 đến launch:** ~40-60h work nữa (chưa tính accounts setup / DNS / client content).
