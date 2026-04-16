import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import config from '../../../src/payload.config';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu JSON không hợp lệ' }, { status: 400 });
  }
  const email = String((body as Record<string, unknown>)?.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ.' }, { status: 400 });
  }

  const payload = await getPayload({ config });
  // Idempotent: if email already subscribed, return ok.
  const existing = await payload.find({
    collection: 'subscribers',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.docs[0]) {
    return NextResponse.json({ ok: true, existed: true });
  }
  await payload.create({
    collection: 'subscribers',
    data: { email, source: 'footer' } as never,
  });
  payload.logger.info(`[newsletter] subscribed ${email}`);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
