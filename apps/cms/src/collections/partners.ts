import type { CollectionConfig } from 'payload';

export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: {
    singular: { en: 'Partner', vi: 'Đối tác' },
    plural: { en: 'Partners', vi: 'Đối tác' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', required: true },
    { name: 'url', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
