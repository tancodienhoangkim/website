import type { CollectionConfig } from 'payload';

export const NavMenu: CollectionConfig = {
  slug: 'nav-menu',
  labels: {
    singular: { en: 'Nav Menu Item', vi: 'Mục menu điều hướng' },
    plural: { en: 'Nav Menu Items', vi: 'Menu điều hướng' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'order', 'url'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'nav-menu',
      admin: { description: 'Leave empty for top-level item.' },
    },
    { name: 'url', type: 'text', admin: { description: 'Absolute or relative. Use /du-an/... for internal.' } },
    {
      name: 'linkType',
      type: 'select',
      defaultValue: 'url',
      options: [
        { label: 'Custom URL', value: 'url' },
        { label: 'Project Category', value: 'project-category' },
        { label: 'Service', value: 'service' },
        { label: 'News Category', value: 'news-category' },
      ],
    },
    {
      name: 'linkedDoc',
      type: 'relationship',
      relationTo: ['project-categories', 'services', 'news-categories'],
    },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'featuredImage', type: 'upload', relationTo: 'media', admin: { description: 'Shown in mega-menu panel.' } },
    {
      name: 'megaMenuLayout',
      type: 'select',
      options: [
        { label: 'Simple dropdown', value: 'simple' },
        { label: 'Mega (grid)', value: 'mega' },
      ],
      defaultValue: 'simple',
    },
  ],
};
