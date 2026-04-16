import { type Payload, getPayload } from 'payload';
import { beforeAll, describe, expect, it } from 'vitest';
import config from '../payload.config';

const hasDb = Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
let payload: Payload;

describe.skipIf(!hasDb)('projects collection (local API)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config });
  });

  it('rejects create without category (required field)', async () => {
    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: Payload local API requires partial data in tests
      payload.create({ collection: 'projects', data: { title: 'No cat' } as any }),
    ).rejects.toThrow();
  });

  it('rejects anonymous read of draft', async () => {
    const cat = await payload.create({
      collection: 'project-categories',
      // biome-ignore lint/suspicious/noExplicitAny: Payload local API requires partial data in tests
      data: { title: `t-${Date.now()}` } as any,
    });
    // coverImage is required — use any existing media (if none exists, skip this test)
    const mediaResult = await payload.find({ collection: 'media', limit: 1 });
    const coverImage = mediaResult.docs[0]?.id;
    if (!coverImage) {
      // No media available — seed media first or skip
      console.warn('Skipping draft-access test: no media in DB');
      return;
    }
    const draft = await payload.create({
      collection: 'projects',
      // biome-ignore lint/suspicious/noExplicitAny: Payload local API requires partial data in tests
      data: { title: `draft-${Date.now()}`, category: cat.id, coverImage, status: 'draft' } as any,
    });
    const result = await payload.find({
      collection: 'projects',
      where: { id: { equals: draft.id } },
      overrideAccess: false,
    });
    expect(result.docs.length).toBe(0);
  });
});
