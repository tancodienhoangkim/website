# Plan E — Backend Wiring Design Spec

**Ngày:** 2026-04-17
**Phạm vi:** Contact form submit, newsletter subscribe, promo popup. Stub email (console) — Resend integrate ở Plan deploy.

## Scope
1. **E1 Contact API** — `POST /api/contact` → validate + save `contact-submissions` + log "email sent".
2. **E2 Newsletter API** — `POST /api/newsletter` → save `subscribers`.
3. **E3 Promo popup** — client component đọc `promo-popup` global, mount layout, localStorage suppress.

Non-goals: Resend live email (placeholder env), reCAPTCHA, Upstash Redis, FB Messenger SDK.

## E1 Contact API

`apps/cms/app/api/contact/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

const PHONE_RE = /^(?:\+84|0)\d{9,10}$/;

export async function POST(req: Request) {
  const body = await req.json();
  const fullName = String(body.fullName ?? '').trim();
  const phone = String(body.phone ?? '').trim().replace(/[\s.]/g, '');
  const email = String(body.email ?? '').trim();
  const content = String(body.content ?? '').trim();
  const source = ['contact','quote','consultation','newsletter','recruitment'].includes(body.source)
    ? body.source : 'contact';
  if (!fullName || !PHONE_RE.test(phone)) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  const payload = await getPayload({ config });
  await payload.create({ collection: 'contact-submissions',
    data: { name: fullName, phone, email: email || undefined, message: content, source } });
  console.log('[contact]', { fullName, phone, email, source });
  return NextResponse.json({ ok: true });
}
```

Rate limit: simple in-memory Map IP → timestamps, 5/min. Skip cho dev, stub.

## E2 Newsletter API
`app/api/newsletter/route.ts` — tương tự, 1 field `email`. Save to `subscribers`.

## E3 Promo popup
Client component đọc `promo-popup` global qua server prop (pass từ layout). Nếu `enabled` + trong date range + chưa seen → show modal.

```tsx
'use client';
export function PromoPopupClient({ data }: { data: PopupData | null }) {
  useEffect(() => {
    if (!data?.enabled) return;
    const key = `hoangkim-popup-seen-${data.id}`;
    if (localStorage.getItem(key)) return;
    setOpen(true);
  }, [data]);
  // render <dialog> với image + link + close
}
```

Mount trong `(site)/layout.tsx`:
```tsx
const popup = await getPromoPopup();
<PromoPopupClient data={normalizePopup(popup)} />
```

## ContactFormClient
Footer form hiện là markup only (`<form noValidate disabled>`). Wrap trong client:
```tsx
'use client';
export function ContactFormClient({ defaultValues }) {
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  async function onSubmit(e) { ... fetch('/api/contact', POST) ... }
  return <form onSubmit={onSubmit}>...<button disabled={status==='sending'}>{statusLabel}</button></form>;
}
```

## File
Mới:
- `app/api/contact/route.ts`
- `app/api/newsletter/route.ts`
- `components/site/PromoPopup.tsx` (client)
- `components/site/ContactFormClient.tsx` (client)

Sửa:
- `components/site/Footer.tsx` — replace markup form with ContactFormClient
- `app/(site)/layout.tsx` — mount PromoPopup
- `lib/queries.ts` — getPromoPopup
- `css_custom.css` — popup modal styles (~40 dòng)

## Kiểm thử
- POST /api/contact curl test → check contact-submissions có record mới
- Footer form submit → hiển thị "Đã gửi" toast-like
- Promo popup: seed enabled=true → refresh trang thấy popup lần đầu, close → localStorage set, refresh không thấy nữa
- Typecheck + lint pass
