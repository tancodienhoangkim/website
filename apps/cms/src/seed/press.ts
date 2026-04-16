import type { Payload } from 'payload';

const PRESS = ['Báo Xây Dựng', 'Tạp Chí Kiến Trúc', 'VTC News'];

export async function seedPress(p: Payload): Promise<Array<string | number>> {
  const media = await p.find({ collection: 'media', limit: 1 });
  const logo = media.docs[0]?.id;
  const ids: Array<string | number> = [];
  for (let i = 0; i < PRESS.length; i++) {
    const name = PRESS[i]!;
    const existing = await p.find({
      collection: 'press-mentions',
      where: { publicationName: { equals: name } },
      limit: 1,
    });
    if (existing.docs[0]) {
      ids.push(existing.docs[0].id);
      continue;
    }
    if (!logo) {
      p.logger.warn('No media to use as press logo; skipping.');
      continue;
    }
    const doc = await p.create({
      collection: 'press-mentions',
      data: { publicationName: name, logo, order: i } as any,
    });
    ids.push(doc.id);
  }
  return ids;
}
