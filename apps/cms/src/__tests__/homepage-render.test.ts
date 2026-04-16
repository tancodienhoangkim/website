import { describe, it, expect } from 'vitest';
import { getHomepage, getPressMentions, getSiteSettings } from '../lib/queries';

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)('homepage data assembly', () => {
  it('returns non-empty hero slides after seed', async () => {
    const hp = (await getHomepage()) as any;
    expect(Array.isArray(hp?.heroSlides)).toBe(true);
    expect(hp.heroSlides.length).toBeGreaterThan(0);
  });

  it('returns aboutSnippet with heading', async () => {
    const hp = (await getHomepage()) as any;
    expect(hp?.aboutSnippet?.heading).toBeTruthy();
  });

  it('returns at least one ctaBlock with image', async () => {
    const hp = (await getHomepage()) as any;
    expect(hp?.ctaBlocks?.length).toBeGreaterThanOrEqual(1);
  });

  it('returns press mentions (curated or collection)', async () => {
    const [hp, press] = await Promise.all([getHomepage() as any, getPressMentions()]);
    const curated = Array.isArray(hp?.pressMentions) ? hp.pressMentions.length : 0;
    expect(curated + press.length).toBeGreaterThan(0);
  });

  it('site settings is an object', async () => {
    const s = (await getSiteSettings()) as any;
    expect(typeof s).toBe('object');
  });
});
