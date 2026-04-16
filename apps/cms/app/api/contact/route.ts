import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import config from '../../../src/payload.config';

const PHONE_RE = /^(?:\+84|0)\d{9,10}$/;
const VALID_SOURCES = [
  'contact',
  'quote',
  'consultation',
  'newsletter',
  'recruitment',
] as const;

// Simple in-memory rate limit — 5 submissions per IP per minute.
// Not cluster-safe; upgrade to Upstash Redis in production.
const WINDOW_MS = 60_000;
const MAX_SUBMISSIONS = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = hits.get(ip) ?? [];
  const recent = arr.filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_SUBMISSIONS;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Gửi quá nhanh, vui lòng thử lại sau.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu JSON không hợp lệ' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const fullName = String(b.fullName ?? '').trim();
  const phoneRaw = String(b.phone ?? '').trim();
  const phone = phoneRaw.replace(/[\s.]/g, '');
  const email = String(b.email ?? '').trim();
  const content = String(b.content ?? b.message ?? '').trim();
  const sourceValue = String(b.source ?? 'contact');
  const source = (VALID_SOURCES as readonly string[]).includes(sourceValue)
    ? sourceValue
    : 'contact';

  if (!fullName) {
    return NextResponse.json({ error: 'Vui lòng nhập họ tên.' }, { status: 400 });
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json({ error: 'Số điện thoại không hợp lệ.' }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ.' }, { status: 400 });
  }

  const payload = await getPayload({ config });
  await payload.create({
    collection: 'contact-submissions',
    data: {
      name: fullName,
      phone,
      email: email || undefined,
      message: content || undefined,
      source,
    } as never,
  });

  // TODO Plan deploy: send email via Resend. For dev, log to console.
  payload.logger.info(
    `[contact] new submission — name=${fullName} phone=${phone} source=${source}`,
  );

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
