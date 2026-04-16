# Missing Icons — SVG Set (design spec)

**Ngày:** 2026-04-17
**Phạm vi:** Thay 15 `<i class="fa fa-*">` đang render thành ô vuông bằng React SVG components, palette đồng bộ spec `2026-04-16-ornament-background-design.md` (burgundy + gold).
**Dự án:** `apps/cms` (Next.js 15 + Payload CMS 3.83)

## 1 · Bối cảnh

- Nhiều ô vuông xuất hiện trên homepage (Header, FloatingWidgets, Footer).
- Nguyên nhân gốc: `apps/cms/public/vendor/fonts/` **trống rỗng** — `font-awesome.css` reference `/fonts/fontawesome/fontawesome-webfont.{eot,woff2,woff,ttf,svg}` nhưng không file nào tồn tại. Mọi `<i class="fa fa-*">` render thành "tofu" (PUA glyph thiếu font).
- User yêu cầu: bổ sung SVG còn thiếu, preview ở một localhost khác, design phải đồng bộ với palette burgundy/gold của trang.

## 2 · Quyết định đã chốt (qua brainstorming visual)

| # | Quyết định | Chọn | Lý do |
|---|---|---|---|
| 1 | Approach | **SVG branded (inline React component)** | Đồng bộ palette, không phụ thuộc font CDN, tree-shake tốt, tuỳ biến stroke/gradient |
| 2 | Scope | **Chỉ 16 icon đang vuông** (không ornamental, không placeholder ảnh) | Gọn, đủ fix homepage hiện tại |
| 3 | Visual style | **Outline + linear-gradient gold (#F1E075 → #AE7F41)** stroke 1.75 | Lộng lẫy, gợi dát vàng giống logo |
| 4 | On-gold context | **Monochrome burgundy** (`.icon-on-gold` → `stroke: var(--text-on-gold) !important`) | Tương phản cao trên nút gradient gold tròn |
| 5 | Code structure | **1 file per icon** trong `src/components/icons/` + barrel | Chuẩn pattern lucide-react, tree-shake, dễ diễn biến |
| 6 | Preview | **`/_preview/icons` route** + visual companion | Live gallery trong context thật của app |

## 3 · Icon inventory (16 unique)

| # | Tên | Dùng ở | Thay cho |
|---|---|---|---|
| 1 | `Phone` | Header, Footer, FloatingWidgets mobile | `fa-phone` |
| 2 | `Search` | Header | `fa-search` |
| 3 | `AngleDown` | Header (nav dropdown caret) | `fa-angle-down` |
| 4 | `PaperPlane` | FloatingWidgets desktop (nhận nhà mẫu) | `fa-paper-plane` |
| 5 | `Gift` | FloatingWidgets (desktop + mobile) | `fa-gift` |
| 6 | `ArrowRight` | FloatingWidgets desktop (back-to-top) | `fa-arrow-right` |
| 7 | `Comments` | FloatingWidgets mobile (Zalo) | `fa-comments` |
| 8 | `Headphones` | FloatingWidgets mobile (y/c gọi lại) | `fa-headphones` |
| 9 | `MapMarker` | Footer địa chỉ | `fa-map-marker` |
| 10 | `Envelope` | Footer email | `fa-envelope` |
| 11 | `Facebook` | Footer social, FloatingWidgets fanpage | `fa-facebook` |
| 12 | `Youtube` | Footer social, FloatingWidgets youtube | `fa-youtube-play` |
| 13 | `Instagram` | Footer social (nếu `site-settings.social.instagram`) | `fa-instagram` |
| 14 | `Tiktok` | Footer social | `fa-tiktok` |
| 15 | `Zalo` | Footer social (nếu config) | (custom — FA không có) |
| 16 | `Messenger` | Footer social (nếu config) | (custom — FA không có) |

Lưu ý:
- Nút `btn-zalo` desktop giữ nguyên text "Zalo" (không icon) theo markup hiện tại.
- Footer `socialLinks` build động từ `site-settings.social`; **bug tiền hiện:** dòng `Footer.tsx:23` push `icon: 'fa-tiktok'` (có prefix `fa-`) tạo ra className `fa fa-fa-tiktok`. Spec fix: đổi thành `icon: 'tiktok'` đồng nhất với các nhánh khác, và mapping component qua lookup object.

## 4 · Visual tokens

Phụ thuộc tokens đã có trong `css_custom.css`:

```css
:root {
  --gold-light:   #F1E075;
  --gold-dark:    #AE7F41;
  --text-on-gold: #2F0A10;
}
```

Thêm mới (gradient id + override rule):

```css
/* đặt cuối css_custom.css */
.icon-on-gold {
  stroke: var(--text-on-gold) !important;
}
```

Gradient def đặt trong component `IconGradientDefs`:

```svg
<svg width="0" height="0" aria-hidden="true" style="position:absolute">
  <defs>
    <linearGradient id="icon-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="var(--gold-light, #F1E075)"/>
      <stop offset="100%" stop-color="var(--gold-dark, #AE7F41)"/>
    </linearGradient>
  </defs>
</svg>
```

## 5 · Kiến trúc code

### 5.1 Cấu trúc thư mục

```
apps/cms/src/components/icons/
├── index.ts                 # barrel export
├── IconGradientDefs.tsx     # <defs> gradient mount 1 lần trong layout
├── Phone.tsx
├── Search.tsx
├── AngleDown.tsx
├── PaperPlane.tsx
├── Gift.tsx
├── ArrowRight.tsx
├── Comments.tsx
├── Headphones.tsx
├── MapMarker.tsx
├── Envelope.tsx
├── Facebook.tsx
├── Youtube.tsx
├── Instagram.tsx
├── Tiktok.tsx
├── Zalo.tsx
└── Messenger.tsx
```

### 5.2 Icon component contract

```tsx
// Phone.tsx (template cho 16 icon)
import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & { size?: number };

export function Phone({ size = 16, className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#icon-gold)"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      role="img"
      className={className}
      {...props}
    >
      <path d="…phone path…" />
    </svg>
  );
}
```

- Default `stroke="url(#icon-gold)"` → hiển thị gradient gold.
- Khi parent cần burgundy (nền gold): thêm `className="icon-on-gold"` → CSS `stroke: var(--text-on-gold) !important` override url reference.
- `size` prop điều chỉnh `width`/`height` (default 16px để khớp Font Awesome default inline em).
- `strokeWidth` luôn **1.75** trong component. Nếu context gold cần nét dày hơn, bump qua CSS: `.icon-on-gold { stroke-width: 2; }` (CSS selector override SVG attribute).

### 5.3 Gradient defs mount

```tsx
// IconGradientDefs.tsx — server component, render 1 lần ở (site)/layout.tsx
export function IconGradientDefs() {
  return (
    <svg
      width={0}
      height={0}
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <linearGradient id="icon-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F1E075" />
          <stop offset="100%" stopColor="#AE7F41" />
        </linearGradient>
      </defs>
    </svg>
  );
}
```

Mount trong `apps/cms/app/(site)/layout.tsx` ở vị trí đầu `<body>` children (trước `<Header />`). `/admin` không render `(site)/layout.tsx` nên không ảnh hưởng Payload UI.

### 5.4 Path data source

Sử dụng path từ **Feather Icons v4.29** (MIT license) — style line-art mảnh, 24×24. Feather cover 13/16; 3 icon còn lại dùng Simple Icons hoặc custom:

| Icon | Nguồn |
|---|---|
| phone, search, angle-down (chevron-down), paper-plane (send), gift, arrow-right, comments (message-circle), headphones, map-marker (map-pin), envelope (mail), facebook, youtube, instagram | Feather v4.29 path trực tiếp |
| tiktok | Simple Icons v11 (CC0) path — đơn giản hoá thành stroke line-art |
| zalo | Custom — chữ "Z" cách điệu trong khung vuông, bo góc nhẹ |
| messenger | Custom — bong bóng chat với tia chớp trong |

Attribution notice trong comment đầu mỗi file từ Feather: `/* path from feathericons.com (MIT) */`.

## 6 · Preview route

`apps/cms/app/(site)/_preview/icons/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import * as Icons from '@/components/icons';

export default function IconsPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const iconList: [string, React.ComponentType<{size?:number;className?:string}>][] = [
    ['Phone', Icons.Phone], /* …13 dòng nữa… */
  ];
  return (
    <main className="icons-preview">
      <section className="ctx-burgundy"> {/* nền #3B0D12 */}
        {iconList.map(([name, Icon]) => (
          <div key={name}>
            <Icon size={16} /><Icon size={24} /><Icon size={32} />
            <span>{name}</span>
          </div>
        ))}
      </section>
      <section className="ctx-gold"> {/* nền linear-gradient gold */}
        {iconList.map(([name, Icon]) => (
          <div key={name}>
            <Icon size={24} className="icon-on-gold" />
            <span>{name}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
```

- Route guard: `notFound()` trong production → 404 ẩn preview.
- Styles: một `<style>` local block hoặc `css_custom.css` section `.icons-preview` đặt grid + bg.
- Truy cập: `http://localhost:3000/_preview/icons` (cùng Next.js process với homepage — "localhost khác" = path khác, không phải port khác).

## 7 · Integration

### 7.1 File sửa

| File | Thay đổi |
|---|---|
| `apps/cms/src/components/site/Header.tsx` | 3 `<i class="fa">` → `<AngleDown />`, `<Phone />`, `<Search />`; import từ `@/components/icons` |
| `apps/cms/src/components/site/FloatingWidgets.tsx` | 8 `<i>` → component tương ứng; thêm `className="icon-on-gold"` cho các nút cluster desktop (paper-plane, gift, facebook, youtube, arrow-right) và nút mobile gift-box (đã có `style color var(--text-on-gold)` — xoá inline style, thay bằng className) |
| `apps/cms/src/components/site/Footer.tsx` | `fa-map-marker`/`fa-phone`/`fa-envelope` → component; social map: build dict `{ facebook: Facebook, youtube: Youtube, tiktok: Tiktok, zalo: Zalo, messenger: Messenger }` và render theo `link.icon` |
| `apps/cms/app/(site)/layout.tsx` | Mount `<IconGradientDefs />` ngay đầu body children |
| `apps/cms/public/vendor/css/css_custom.css` | Thêm rule `.icon-on-gold { stroke: var(--text-on-gold) !important; }` cuối file; thêm block `.icons-preview` nếu preview route dùng class này |
| `apps/cms/app/(site)/_preview/icons/page.tsx` | **Mới** |
| `apps/cms/src/components/icons/*.tsx` + `index.ts` + `IconGradientDefs.tsx` | **Mới** (18 file: 16 icon + barrel + defs) |

### 7.2 File KHÔNG sửa

- Token palette (`:root` vars) — đã đủ.
- Payload collections/globals/seed — không liên quan content.
- `font-awesome.css` — vẫn link (không xoá vội; các icon khác trên trang admin hoặc future có thể còn dùng). CSS còn đó nhưng icon hiện tại đã được thay component.

## 8 · Behavior chi tiết

### 8.1 FloatingWidgets nút cluster desktop

Markup hiện tại: `<div class="item-scoll backgroud-border-gr"><a><i class="fa fa-gift"/></a></div>`.

Class `backgroud-border-gr` apply gold gradient. Icon bên trong cần burgundy.

Sau thay: `<div class="item-scoll backgroud-border-gr"><a><Gift className="icon-on-gold" size={18} /></a></div>`.

Inline style `color: 'var(--text-on-gold)'` ở dòng 137 xoá (đã không cần — `.icon-on-gold` đảm nhiệm). `fontSize: '18px'` xoá — thay bằng `size={18}` ở props component. Các icon cluster (paper-plane, gift, facebook, youtube) giữ size 18 để khớp footprint FA cũ.

### 8.2 FloatingWidgets mobile bar

Markup mobile: `<li><a><i class="fa fa-comments"/><span>Zalo</span></a></li>`.

Nền mobile bar (kiểm `css_custom.css` xung quanh `.scoll-bottom-mobile`): nền burgundy/gradient tuỳ item. Nếu burgundy solid → dùng default gradient icon. Nếu gold → thêm `icon-on-gold`.

Quyết định: mặc định gradient gold (ít dùng burgundy-on-gold hơn); chỉ item `btn-gift` có `button_gift_box` (nền gold) → `icon-on-gold`. Item khác: default.

### 8.3 Footer social

Fix bug `icon: 'fa-tiktok'` → `icon: 'tiktok'` (đồng nhất với các nhánh khác). Lookup component qua map:

```tsx
const socialIconMap = {
  facebook: Facebook,
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Tiktok,
  zalo: Zalo,
  messenger: Messenger,
} as const;

// render
{displayLinks.map(link => {
  const Icon = socialIconMap[link.icon as keyof typeof socialIconMap];
  if (!Icon) return null;
  return (
    <li key={link.label}>
      <a href={link.url} target="_blank" rel="nofollow noreferrer" aria-label={link.label}>
        <Icon size={18} />
      </a>
    </li>
  );
})}
```

## 9 · Kiểm thử

### 9.1 Tự động

- `pnpm -w typecheck` — pass (thêm 17 component TS).
- `pnpm --filter cms build` — pass (Turbopack bundle, không lỗi import path).
- `pnpm -w lint` — pass (Biome; disable `no-unused-vars` cho icon paths không cần).

### 9.2 Visual

- `http://localhost:3000/_preview/icons` — render đủ 16 icon, 2 context (burgundy + gold), 3 size (16/24/32).
- `http://localhost:3000/` — 1920 / 1440 / 768 / 375 — đếm **0 ô vuông** ở Header top bar, nav chevron, Footer info block, FloatingWidgets cluster + mobile bar.
- Chụp screenshot trước/sau ít nhất 1 width (1440) để so sánh.

### 9.3 Không test

- Không thêm test unit (visual-only, low risk).
- Không Playwright screenshot diff (out of scope, spec plan 2 đã nêu).

## 10 · Tiêu chí done

1. 16 file icon component trong `apps/cms/src/components/icons/`, export từ `index.ts`.
2. `IconGradientDefs` mount trong `(site)/layout.tsx`, `<defs>` xuất hiện 1 lần trong DOM homepage.
3. `.icon-on-gold` rule trong `css_custom.css`, override stroke.
4. Header, FloatingWidgets, Footer không còn `<i class="fa fa-*">` cho 16 icon đã liệt kê.
5. `localhost:3000/_preview/icons` mở được trong dev, 404 trong prod.
6. `localhost:3000/` không còn ô vuông từ các component đã liệt kê (kiểm tại 4 breakpoints).
7. `pnpm typecheck` + `pnpm lint` pass.
8. Git commit riêng: `feat(web): replace missing fa icons with branded SVG set`.

## 11 · Rủi ro & rollback

| Rủi ro | Khả năng | Mitigation |
|---|---|---|
| Gradient `<defs>` không render khi icon mount trước `<IconGradientDefs>` (thứ tự DOM) | Thấp | Mount `IconGradientDefs` ngay đầu body children trong layout, trước Header. SVG `url(#id)` reference resolve post-render, không phụ thuộc thứ tự. |
| CSS `!important` xung đột rule khác | Thấp | `.icon-on-gold` chỉ target `stroke`, không ảnh hưởng fill/color. Test trong `/_preview/icons` context B. |
| Safari cũ không render gradient stroke trên SVG inline | Rất thấp | Safari 14+ hỗ trợ đầy đủ. Target của Next.js 15 không bao gồm Safari ≤13. Fallback tự nhiên: stroke inherit `currentColor`, vẫn thấy icon (không gradient). |
| Zalo/Messenger custom SVG không đẹp | Trung bình | Iterate qua `/_preview/icons`, điều chỉnh path nếu user không hài lòng trong review. |
| Tăng bundle size | Rất thấp | 16 icon × ~400 bytes path ≈ 6KB JSX; tree-shake khi page không dùng |

**Rollback:** `git revert <commit-hash>` — toàn bộ thay đổi trong 1 commit riêng biệt.

## 12 · Scope KHÔNG làm

- Không nạp font Font Awesome (vendor/fonts/ vẫn trống).
- Không xoá `font-awesome.css` link (dọn dẹp sau khi audit toàn site).
- Không tạo ornamental SVG (divider, corner flourish, monogram HK).
- Không fallback placeholder SVG cho `<img>` Media 404.
- Không đổi token `:root` CSS, không đổi seed.
- Không migrate sang `lucide-react` npm package.
- Không test Playwright visual diff.
