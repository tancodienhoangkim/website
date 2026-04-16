import { describe, it, expect } from 'vitest';
import { getSiteSettings, getHeader, getFooter, getHomepage, getPressMentions } from '../lib/queries';

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)('Payload query helpers', () => {
  it('getSiteSettings returns a global with an id', async () => {
    const settings = await getSiteSettings();
    expect(settings).toBeTruthy();
    expect(typeof settings).toBe('object');
  });

  it('getHeader and getFooter return globals', async () => {
    const [h, f] = await Promise.all([getHeader(), getFooter()]);
    expect(h).toBeTruthy();
    expect(f).toBeTruthy();
  });

  it('getHomepage returns a homepage global', async () => {
    const hp = await getHomepage();
    expect(hp).toBeTruthy();
  });

  it('getPressMentions returns an array', async () => {
    const press = await getPressMentions();
    expect(Array.isArray(press)).toBe(true);
  });
});
