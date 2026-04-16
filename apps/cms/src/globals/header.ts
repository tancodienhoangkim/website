import type { GlobalConfig, Field } from 'payload';

const childItemFields: Field[] = [
  { name: 'label', type: 'text', required: true },
  { name: 'url', type: 'text', required: true },
];

const navItemFields: Field[] = [
  { name: 'label', type: 'text', required: true },
  { name: 'url', type: 'text', required: true },
  {
    name: 'children',
    type: 'array',
    admin: { description: 'Dropdown sub-items (1 level deep).' },
    fields: childItemFields,
  },
];

export const Header: GlobalConfig = {
  slug: 'header',
  label: { en: 'Header', vi: 'Thanh đầu trang' },
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  fields: [
    { name: 'topBarText', type: 'text', admin: { description: 'Small text top of header (promo/bar).' } },
    {
      name: 'ctaButton',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'menuItems',
      type: 'relationship',
      relationTo: 'nav-menu',
      hasMany: true,
      admin: { description: 'Top-level menu items. Nested children read from nav-menu tree.' },
    },
    {
      name: 'leftMenu',
      type: 'array',
      admin: { description: 'Left half of split nav (before logo).' },
      fields: navItemFields,
    },
    {
      name: 'rightMenu',
      type: 'array',
      admin: { description: 'Right half of split nav (after logo).' },
      fields: navItemFields,
    },
  ],
};
