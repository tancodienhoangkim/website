import type { CollectionConfig } from 'payload';
import { slugField } from '../fields/slug';
import { seoField } from '../fields/seo';

export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  labels: {
    singular: { en: 'Project Category', vi: 'Danh mục dự án' },
    plural: { en: 'Project Categories', vi: 'Danh mục dự án' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'order', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'project-categories',
      admin: { description: 'Leave empty for top-level category.' },
    },
    { name: 'description', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'order', type: 'number', defaultValue: 0, admin: { step: 1 } },
    seoField(),
  ],
};
