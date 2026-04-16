# Plan G1 — Admin Security Hardening Design Spec

**Ngày:** 2026-04-17
**Phạm vi:** harden Payload admin trước khi deploy production. Code-only, không cần external service. 4 sub-items.
**Tiền đề:** Plan 1-F đã xong. Admin hiện ở `/admin` default, seed password weak, không có rate limit strict hay security headers.

## 1 · Scope & quyết định

| # | Item | Impact |
|---|---|---|
| 1 | Custom admin path via env `ADMIN_PATH` | Hide default `/admin` khỏi attacker probes |
| 2 | Rate limit `/api/users/login` (5/IP/15min → ban 1h) | Chặn brute-force |
| 3 | Security headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS) | Chặn clickjacking, XSS injection, leak |
| 4 | Seed yêu cầu `SEED_ADMIN_PASSWORD` ≥ 16 char | Chặn admin deploy production với password demo |

Non-goals:
- 2FA (defer — plugin sau)
- Upstash Redis rate limit cluster-safe (G2)
- IP allowlist / CF Access (G4)
- reCAPTCHA (G4)

## 2 · Custom admin path

`apps/cms/src/payload.config.ts`:
```ts
admin: {
  user: 'users',
  meta: { titleSuffix: ' · Hoàng Kim CMS' },
  routes: {
    admin: process.env.ADMIN_PATH ?? '/admin',
  },
},
```

Env:
- `ADMIN_PATH` optional (fallback `/admin`)
- Production: **random** string, ví dụ `/kiem-soat-noi-bo-x9k2`
- Store in Vercel/Railway secret, không commit
- Update `.env.example` với comment hướng dẫn

Impact:
- Default `/admin` → 404 khi env đổi
- Admin login: `{ADMIN_PATH}/login`
- Next admin routes auto-rebase

## 3 · Rate limit middleware

File mới `apps/cms/middleware.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';

type Entry = { attempts: number[]; bannedUntil: number };
const WINDOW_MS = 15 * 60 * 1000;       // 15 min
const MAX_ATTEMPTS = 5;
const BAN_DURATION_MS = 60 * 60 * 1000; // 1 hour
const store = new Map<string, Entry>();

function ipFrom(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function isLoginAttempt(req: NextRequest): boolean {
  return req.method === 'POST' && req.nextUrl.pathname === '/api/users/login';
}

export function middleware(req: NextRequest) {
  if (!isLoginAttempt(req)) return NextResponse.next();

  const ip = ipFrom(req);
  const now = Date.now();
  const entry = store.get(ip) ?? { attempts: [], bannedUntil: 0 };

  if (entry.bannedUntil > now) {
    const retryAfter = Math.ceil((entry.bannedUntil - now) / 1000);
    return NextResponse.json(
      { error: 'Tạm khóa do quá nhiều lần đăng nhập sai. Thử lại sau.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  // Prune old attempts
  entry.attempts = entry.attempts.filter((t) => now - t < WINDOW_MS);
  entry.attempts.push(now);

  if (entry.attempts.length > MAX_ATTEMPTS) {
    entry.bannedUntil = now + BAN_DURATION_MS;
    entry.attempts = [];
    store.set(ip, entry);
    return NextResponse.json(
      { error: 'Tạm khóa do quá nhiều lần đăng nhập sai. Thử lại sau 1 giờ.' },
      { status: 429, headers: { 'Retry-After': String(BAN_DURATION_MS / 1000) } },
    );
  }

  store.set(ip, entry);
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/users/login'],
};
```

Lưu ý:
- In-memory → mỗi process instance riêng. 1 process dev = OK. Nhiều instance prod → leak attempts across pods. Chuyển Upstash Redis ở G2.
- Count attempts regardless of success/fail — attackers hit endpoint đều bị đếm
- Payload native `maxLoginAttempts: 5, lockTime: 10min` trên User collection vẫn giữ → 2 lớp defense

## 4 · Security headers

`apps/cms/next.config.mjs` — `async headers()`:

```js
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://analytics.tiktok.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.ytimg.com https://images.unsplash.com https://*.r2.cloudflarestorage.com https://*.amazonaws.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://analytics.tiktok.com https://www.facebook.com",
  "frame-src 'self' https://www.youtube.com https://www.facebook.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

// Only add HSTS in production
if (process.env.NODE_ENV === 'production') {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  });
}

const nextConfig = {
  // ...existing
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

Trade-offs:
- `'unsafe-inline'` script/style cần vì vendor CSS (Bootstrap, Owl) + inline styles + Next.js streaming. Strict CSP với nonces cần refactor lớn.
- `'unsafe-eval'` cho Next.js dev (eval source maps). Có thể remove production nhưng Next 15 vẫn cần cho một số client chunks.
- frame-src allow YouTube + FB cho embeds (hiện không embed, nhưng safety margin cho future).
- frame-ancestors none = chặn clickjacking.

## 5 · Seed password requirement

`apps/cms/src/seed/users.ts`:
```ts
export async function seedUsers(p: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email) {
    throw new Error('SEED_ADMIN_EMAIL env required for seed');
  }
  if (!password) {
    throw new Error(
      'SEED_ADMIN_PASSWORD env required for seed. ' +
        'Generate a strong password: `openssl rand -base64 24` or `pwgen 24 1`',
    );
  }
  if (password.length < 16) {
    throw new Error(
      `SEED_ADMIN_PASSWORD too short (${password.length} chars). Minimum 16 chars required.`,
    );
  }
  // ...rest unchanged
}
```

`.env.example`:
```
# Admin seed credentials
# SEED_ADMIN_PASSWORD: min 16 chars, random. Generate: openssl rand -base64 24
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=

# Admin panel path (production: use random string, e.g., /kiem-soat-x9k2)
ADMIN_PATH=/admin
```

`.env.local` (dev): giữ 123456 hoặc đặt random — tùy user.

## 6 · README security setup

Thêm section `## Security setup` vào `README.md`:

```md
### Security setup

**Before deploying to production:**

1. Generate strong admin password:
   ```bash
   openssl rand -base64 24
   ```
   Set `SEED_ADMIN_PASSWORD` env in your deploy provider.

2. Randomize admin path:
   ```bash
   echo "/kiem-soat-$(openssl rand -hex 4)"
   # /kiem-soat-a3b7d2e9
   ```
   Set `ADMIN_PATH` env.

3. Generate Payload secret (64 chars):
   ```bash
   openssl rand -base64 48
   ```
   Set `PAYLOAD_SECRET` env.

4. Rotate secrets every 90 days.

5. Monitor login attempts: login failures get rate-limited (5/IP/15min → 1h ban).

6. Security headers: CSP + HSTS + X-Frame-Options enabled in prod via `next.config.mjs`.

7. Backup Postgres daily (see Plan G2 deploy).
```

## 7 · Kiểm thử

| Test | Expected |
|---|---|
| `curl -X POST /api/users/login -d '{invalid}'` × 6 | Lần 6 → 429 |
| `ADMIN_PATH=/test-admin pnpm dev` → `GET /admin` | 404 |
| `GET /test-admin/login` | 200 |
| `curl -I http://localhost:3001/` | Thấy CSP, X-Frame-Options, Referrer-Policy |
| `unset SEED_ADMIN_PASSWORD; pnpm seed` | Lỗi |
| `SEED_ADMIN_PASSWORD=short pnpm seed` | Lỗi minimum 16 chars |
| `SEED_ADMIN_PASSWORD=$(openssl rand -base64 24) pnpm seed` | OK |

## 8 · File changes

### Mới (1)
- `apps/cms/middleware.ts`

### Sửa (5)
- `apps/cms/src/payload.config.ts` — `admin.routes.admin` from env
- `apps/cms/next.config.mjs` — `async headers()` với security headers
- `apps/cms/src/seed/users.ts` — require strong `SEED_ADMIN_PASSWORD`
- `apps/cms/.env.example` — `ADMIN_PATH`, clear `SEED_ADMIN_PASSWORD`, comments
- `README.md` — section "Security setup"

## 9 · Rủi ro & rollback

| Rủi ro | Mitigation |
|---|---|
| CSP quá strict → break site | Test kỹ ở dev; allow `unsafe-inline` cho style/script mode mềm |
| Rate limit chặn admin thật (nhiều editor cùng IP) | 5 attempts/15min đủ khoan dung; nếu editor đông hơn, tăng MAX_ATTEMPTS |
| In-memory rate limit không cluster-safe | Chấp nhận cho MVP; upgrade Redis ở G2 |
| ADMIN_PATH leak qua git history | Secret ở env only, không commit; rotate nếu leak |
| Seed existing admin user → bảo mật không ảnh hưởng | Seed idempotent theo email; existing user không bị thay password |

**Rollback:** 1 commit revert. Env vars backward-compat (fallback `/admin` nếu không set).
