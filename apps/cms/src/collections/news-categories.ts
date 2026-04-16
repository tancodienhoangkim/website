import type { CollectionConfig } from 'payload';
import { slugField } from '../fields/slug';

export const NewsCategories: CollectionConfig = {
  slug: 'news-categories',
  labels: {
    singular: { en: 'News Category', vi: 'Chuyên mục tin tức' },
    plural: { en: 'News Categories', vi: 'Chuyên mục tin tức' },
  },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'order'] },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'description', type: 'textarea' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
