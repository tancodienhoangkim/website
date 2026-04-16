import type { CollectionConfig } from 'payload';

export const PressMentions: CollectionConfig = {
  slug: 'press-mentions',
  labels: {
    singular: { en: 'Press Mention', vi: 'Báo chí nói về' },
    plural: { en: 'Press Mentions', vi: 'Báo chí nói về' },
  },
  admin: {
    useAsTitle: 'publicationName',
    defaultColumns: ['publicationName', 'date', 'order'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'publicationName', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', required: true },
    { name: 'articleUrl', type: 'text' },
    { name: 'date', type: 'date' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
