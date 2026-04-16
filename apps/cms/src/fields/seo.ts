import type { Field } from 'payload';

export function seoField(overrides: { label?: string } = {}): Field {
  return {
    name: 'seo',
    type: 'group',
    label: overrides.label ?? 'SEO',
    admin: { position: 'sidebar' },
    fields: [
      {
        name: 'metaTitle',
        type: 'text',
        maxLength: 70,
        admin: { description: 'Leave empty to use page title. Max 70 chars.' },
      },
      {
        name: 'metaDescription',
        type: 'textarea',
        maxLength: 170,
        admin: { description: 'Max 170 chars.' },
      },
      { name: 'ogImage', type: 'upload', relationTo: 'media' },
      { name: 'canonicalOverride', type: 'text', admin: { description: 'Leave empty to use default.' } },
      { name: 'noindex', type: 'checkbox', defaultValue: false },
    ],
  };
}
