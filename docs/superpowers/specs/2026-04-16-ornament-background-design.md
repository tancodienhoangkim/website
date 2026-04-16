# Thiết kế nền burgundy + hoa văn mây cuốn (design spec)

**Ngày:** 2026-04-16
**Phạm vi:** rebrand visual palette — chuyển site từ navy sang burgundy thống nhất với logo, thêm hoa văn Việt cổ (mây cuốn + lôi văn) làm nền.
**Dự án:** `apps/cms` (Next.js 15 + Payload CMS 3.83, monorepo `hoangkim-tcd`)

## 1 · Bối cảnh

- Logo mới tải từ `hoangkim-tcd.com` là 1024×1024 JPEG, kiến trúc tân cổ điển dát vàng trên nền burgundy đậm (~`#3D0E13`).
- Theme CSS hiện tại (`apps/cms/public/vendor/css/css_custom.css`) thừa kế từ template Nukeviet của akisa.vn với palette navy `#071828` / `#15324E` / `#061827` và vàng `#F1E075` / `#AE7F41`.
- `body { background: url('/uploads/tiny_uploads/bg-body.jpg') }` trỏ tới asset không tồn tại trong repo (404) — akisa.vn có file thật nhưng chưa tải về.
- User yêu cầu: (1) tham khảo hoa văn ở nền akisa.vn, tạo hoa văn tương tự, (2) đồng nhất màu nền với logo.

## 2 · Các quyết định đã chốt (qua brainstorming visual)

| # | Quyết định | Chọn | Lý do |
|---|---|---|---|
| 1 | Hướng màu | **A · toàn bộ burgundy** | Thống nhất với logo; navy không còn đại diện thương hiệu sau rebrand |
| 2 | Phong cách hoa văn | **B · mây cuốn + lôi văn (Việt cổ)** | Đối thoại với tân cổ điển châu Âu trên logo, tạo bản sắc Việt |
| 3 | Độ đậm | **Mức 2 · opacity 22% — "vải gấm hoàng gia"** | Cân bằng giữa thẩm mỹ và khả năng đọc |
| 4 | Cách triển khai | **Cách 2 · CSS custom properties** | Đầu tư một lần, dễ đổi theme/dark-mode sau này |

## 3 · Kiến trúc

### 3.1 File thay đổi

| File | Loại | Mục đích |
|---|---|---|
| `apps/cms/public/vendor/images/pattern-hoa-van.svg` | **mới** | SVG tileable 110×110 chứa họa tiết mây + góc lôi văn |
| `apps/cms/public/vendor/css/css_custom.css` | sửa | Thêm `:root { --tokens }`, thay hex cứng bằng `var(--…)`, cập nhật `body { background }` |
| `apps/cms/src/components/site/FloatingWidgets.tsx` | sửa 1 dòng | `style={{ color: '#0e253b' }}` → `style={{ color: 'var(--text-on-gold)' }}` (dòng 137) |

### 3.2 File KHÔNG thay đổi

- Seed data (`apps/cms/src/seed/*`) — màu là concern CSS, không phải content
- Payload admin UI — admin có theme riêng, không đọc từ `css_custom.css`
- Các collection/global schemas — không có field nào lưu màu
- Các React component khác trong `src/components/site/` — tất cả đọc màu qua class CSS

### 3.3 Luồng dữ liệu

```
pattern-hoa-van.svg  ─┐
                      ├─► css_custom.css (:root vars) ─► mọi selector dùng var(--bg-primary) / var(--pattern-url)
:root tokens          ─┘                              └─► body::before lớp overlay burgundy mờ để tạo opacity watermark
```

## 4 · Token design

Đặt ở đầu `css_custom.css`:

```css
:root {
  /* Nền */
  --bg-primary:   #3B0D12;   /* burgundy chính (body, header) */
  --bg-elevated:  #4A121A;   /* burgundy sáng hơn (card, section nổi) */
  --bg-deep:      #1E0609;   /* burgundy tối (footer, modal backdrop) */
  --bg-overlay:   rgba(20, 5, 10, 0.55);

  /* Nhấn vàng */
  --gold-light:   #F1E075;
  --gold-mid:     #D4AF5A;
  --gold-dark:    #AE7F41;
  --gold-grad:    linear-gradient(135deg, var(--gold-light) 0%, var(--gold-dark) 100%);
  --gold-grad-h:  linear-gradient(to right, var(--gold-light) 0%, var(--gold-dark) 100%);

  /* Text */
  --text-primary:   #ffffff;
  --text-muted:     rgba(255, 255, 255, 0.75);
  --text-on-gold:   #2F0A10;

  /* Đường viền */
  --border-gold:    rgba(241, 224, 117, 0.35);
  --border-subtle:  rgba(255, 255, 255, 0.08);

  /* Hoa văn */
  --pattern-url:     url('/vendor/images/pattern-hoa-van.svg');
  --pattern-size:    110px;
  --pattern-opacity: 0.22;
}
```

### 4.1 Bảng map hex cũ → token

| Hex cũ | Token mới |
|---|---|
| `#071828`, `#061827` | `var(--bg-primary)` |
| `#15324E` | `var(--bg-elevated)` |
| `#000` (dùng làm nền solid) | `var(--bg-deep)` |
| `#F1E075` | `var(--gold-light)` |
| `#AE7F41` | `var(--gold-dark)` |
| `#cdac58` (ở `.backgroud-border-gr`) | `var(--gold-mid)` (hợp nhất) |
| `#fff` (text) | `var(--text-primary)` |
| `#0e253b` (inline trong FloatingWidgets) | `var(--text-on-gold)` |

## 5 · Hoa văn SVG

**Đường dẫn:** `apps/cms/public/vendor/images/pattern-hoa-van.svg`
**Kích thước:** `viewBox="0 0 110 110"` · tileable 4 cạnh
**Màu:** `stroke="currentColor"` — thừa kế từ body (`color: var(--gold-light)`)
**Mục tiêu:** ≤ 3 KB sau minify
**Thành phần:**
- Một họa tiết mây cuốn (xoắn ốc đối xứng) ở tâm 110×110
- Bốn góc lôi văn (chữ công) nhỏ, xoay 90° mỗi góc, đảm bảo tile ghép liền

**Áp dụng:**

```css
body {
  background-color: var(--bg-primary);
  background-image: var(--pattern-url);
  background-size: var(--pattern-size) var(--pattern-size);
  background-repeat: repeat;
  background-position: center;
  color: var(--text-primary);
  position: relative;
}
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: var(--bg-primary);
  opacity: calc(1 - var(--pattern-opacity));
  z-index: -1;
  pointer-events: none;
}
```

Pseudo-element `::before` là lớp burgundy bán trong suốt phủ lên pattern 100% opacity → tạo hiệu ứng watermark mềm, điều chỉnh qua 1 token duy nhất `--pattern-opacity`.

## 6 · CSS refactor

Các selector trong `css_custom.css` đổi giá trị (giữ tên class):

| Dòng (file gốc) | Selector | Giá trị mới |
|---|---|---|
| 1-7 | `body` | như block trong §5 |
| 33-35 | `div#header` | `background: var(--bg-primary)` |
| 97 | `.header-top` | `background: var(--bg-primary)` |
| 156, 188-190, 288-290, 446-448, 568-570, 651-653 | các gradient vàng lặp | `var(--gold-grad-h)` hoặc `var(--gold-grad)` |
| 191-200, 551-552, 641 | gradient navy → đen | `linear-gradient(to right, var(--bg-elevated), var(--bg-primary))` hoặc `…var(--bg-primary), var(--bg-deep)` |
| 390, 515 | `.divider-gold` | `linear-gradient(to left, var(--gold-dark), var(--gold-light), var(--gold-dark))` |
| 419 | `.modal-body` | `var(--bg-deep)` |
| 583-586, 658-659 | các gradient vàng theo chiều dọc | `var(--gold-grad)` |
| 709 | `.backgroud-border-gr` | `color: var(--gold-mid)` |

### 6.1 Bug CSS đã phát hiện, vá luôn

- Dòng 208, 323, 551, 564: `linear-gradient(135deg, #AE7F41, #F1E075));` thừa `)` → xoá
- Dòng 288, 446, 568, 651: `#AE7F41AE7F41` (lặp 2 lần hex) → sửa `#AE7F41`

## 7 · Inline style (React)

`apps/cms/src/components/site/FloatingWidgets.tsx:137` — đổi:

```tsx
// trước
style={{ color: '#0e253b', fontSize: '18px' }}

// sau
style={{ color: 'var(--text-on-gold)', fontSize: '18px' }}
```

Không file React nào khác đụng tới màu hex.

## 8 · Kiểm thử

### 8.1 Tự động (đã có)

- `pnpm -w typecheck` — không ảnh hưởng (1 dòng string inline)
- `pnpm --filter cms build` — Turbopack fail nếu path SVG sai
- `pnpm -w test` — không liên quan (logic tests)

### 8.2 Thủ công

| Trang | Kiểm tra |
|---|---|
| `/` | Hoa văn vàng mờ trên burgundy · header khớp logo · hero slider không tint lạ |
| `/` scroll | Press/About/LeadCapture đọc được · pattern không đè text |
| Mobile 375px | Pattern nét · FloatingWidgets mobile bar không blend nền |
| `/admin` | Không ảnh hưởng |
| Lighthouse | Contrast ≥ 4.5:1 (text trắng trên `#3B0D12` = 11.2:1 ✓) |

### 8.3 Tiêu chí done

1. `rg '#071828|#061827|#15324E|#0e253b'` trong `apps/cms` trả về 0 kết quả
2. Body render hoa văn mây cuốn, opacity cảm nhận ~22%
3. Logo header "đứng liền" nền, không có viền/khung cứng
4. Không regression form liên hệ, nút Zalo/Hotline mobile
5. Lighthouse a11y score không giảm

## 9 · Rủi ro và rollback

- **CSS `var(--xxx)`** — hỗ trợ đầy đủ từ Chrome 49+, Safari 9.1+, Edge 16+. Không support IE11, nhưng Next.js 15 không target IE → an toàn.
- **SVG `currentColor`** — tất cả trình duyệt hiện đại hỗ trợ với `background-image`. Một số trình duyệt cũ (Safari < 14) có thể không kế thừa `currentColor` qua `background-image` → fallback: SVG ghi cứng `stroke="#D4AF5A"` (token `--gold-mid`).
- **Rollback:** toàn bộ thay đổi nằm trong 1 commit → `git revert <hash>` khôi phục ngay.

## 10 · Scope không làm

- Không thêm dark/light mode (token thiết kế sẵn để mở rộng sau)
- Không animate pattern (khi scroll hoặc hover)
- Không áp hoa văn lên card/section nổi (chỉ body)
- Không đổi typography, spacing
- Không chạm seed data hoặc content
