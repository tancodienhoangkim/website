import type { CollectionConfig } from 'payload';
import { slugField } from '../fields/slug';
import { seoField } from '../fields/seo';

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: { en: 'Service', vi: 'Dịch vụ' },
    plural: { en: 'Services', vi: 'Dịch vụ' },
  },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'order', 'updatedAt'] },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'icon', type: 'upload', relationTo: 'media' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'summary', type: 'textarea', maxLength: 300 },
    { name: 'body', type: 'richText' },
    { name: 'order', type: 'number', defaultValue: 0 },
    seoField(),
  ],
};
