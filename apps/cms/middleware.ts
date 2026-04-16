import { type NextRequest, NextResponse } from 'next/server';

// ---------- HTTP Basic Auth gate for /admin ---------------------------------
// Optional extra layer in front of Payload's own login. Set
//   ADMIN_BASIC_AUTH="user:pass"  (plain; middleware will compare base64)
// to require a browser-level prompt before Payload's admin UI loads.
// Leave unset in local dev.

const BASIC_AUTH_CREDS = process.env.ADMIN_BASIC_AUTH;

function requiresBasicAuthGate(req: NextRequest): boolean {
  if (!BASIC_AUTH_CREDS) return false;
  const p = req.nextUrl.pathname;
  return p === '/admin' || p.startsWith('/admin/');
}

function matchBasicAuth(header: string | null): boolean {
  if (!header || !header.startsWith('Basic ')) return false;
  const creds = header.slice('Basic '.length);
  const expected = Buffer.from(BASIC_AUTH_CREDS ?? '').toString('base64');
  return creds === expected;
}

// ---------- Login brute-force rate limit ------------------------------------
type Entry = { attempts: number[]; bannedUntil: number };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BAN_DURATION_MS = 60 * 60 * 1000;

// In-memory store. Single-process only; swap to Upstash Redis in production
// when running multiple instances.
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

function rateLimit(req: NextRequest): NextResponse | null {
  if (!isLoginAttempt(req)) return null;

  const ip = ipFrom(req);
  const now = Date.now();
  const entry: Entry = store.get(ip) ?? { attempts: [], bannedUntil: 0 };

  if (entry.bannedUntil > now) {
    const retryAfter = Math.ceil((entry.bannedUntil - now) / 1000);
    return NextResponse.json(
      {
        error: 'Tạm khóa do quá nhiều lần đăng nhập sai. Vui lòng thử lại sau.',
      },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  entry.attempts = entry.attempts.filter((t) => now - t < WINDOW_MS);
  entry.attempts.push(now);

  if (entry.attempts.length > MAX_ATTEMPTS) {
    entry.bannedUntil = now + BAN_DURATION_MS;
    entry.attempts = [];
    store.set(ip, entry);
    return NextResponse.json(
      {
        error:
          'Tạm khóa do quá nhiều lần đăng nhập sai. Vui lòng thử lại sau 1 giờ.',
      },
      {
        status: 429,
        headers: { 'Retry-After': String(BAN_DURATION_MS / 1000) },
      },
    );
  }

  store.set(ip, entry);
  return null;
}

// ---------- Middleware entrypoint -------------------------------------------

export function middleware(req: NextRequest) {
  if (requiresBasicAuthGate(req)) {
    const auth = req.headers.get('authorization');
    if (!matchBasicAuth(auth)) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Restricted", charset="UTF-8"' },
      });
    }
  }

  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/users/login'],
};
