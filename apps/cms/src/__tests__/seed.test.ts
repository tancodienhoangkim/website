import { describe, expect, it } from 'vitest';

const API = process.env.CMS_TEST_URL ?? 'http://localhost:3001/api';

async function count(collection: string): Promise<number> {
  try {
    const res = await fetch(`${API}/${collection}?limit=0`);
    if (!res.ok) return -1;
    const j = await res.json();
    return Number(j.totalDocs ?? -1);
  } catch {
    return -1;
  }
}

describe('seed idempotency (smoke)', () => {
  it.skipIf(!process.env.CMS_TEST_URL)('projects has exactly 3 seeded', async () => {
    expect(await count('projects')).toBe(3);
  });
  it.skipIf(!process.env.CMS_TEST_URL)('services has exactly 6 seeded', async () => {
    expect(await count('services')).toBe(6);
  });
});
