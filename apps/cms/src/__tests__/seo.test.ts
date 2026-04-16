import { describe, it, expect } from 'vitest';
import type { NamedGroupField } from 'payload';
import { seoField } from '../fields/seo';

describe('seoField', () => {
  it('returns a group field named seo with required subfields', () => {
    const f = seoField() as NamedGroupField;
    expect(f.type).toBe('group');
    expect(f.name).toBe('seo');
    const names = (f.fields as Array<{ name: string }>).map((x) => x.name);
    expect(names).toEqual(['metaTitle', 'metaDescription', 'ogImage', 'canonicalOverride', 'noindex']);
  });

  it('accepts an overrides.label option', () => {
    const f = seoField({ label: 'SEO' }) as NamedGroupField;
    expect(f.label).toBe('SEO');
  });
});
