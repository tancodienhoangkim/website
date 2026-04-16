import type { CollectionConfig } from 'payload';
import { slugField } from '../fields/slug';
import { seoField } from '../fields/seo';

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: { en: 'Project', vi: 'Dự án' },
    plural: { en: 'Projects', vi: 'Dự án' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'featured', 'updatedAt'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: 'published' } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'category', type: 'relationship', relationTo: 'project-categories', required: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    { name: 'summary', type: 'textarea', maxLength: 300 },
    { name: 'body', type: 'richText' },
    {
      name: 'specs',
      type: 'group',
      fields: [
        { name: 'location', type: 'text' },
        { name: 'area', type: 'number', admin: { description: 'm²' } },
        { name: 'floors', type: 'number' },
        { name: 'year', type: 'number' },
        { name: 'style', type: 'text' },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    seoField(),
  ],
};
