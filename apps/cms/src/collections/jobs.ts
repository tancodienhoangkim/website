import type { CollectionConfig } from 'payload';
import { slugField } from '../fields/slug';
import { seoField } from '../fields/seo';

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  labels: {
    singular: { en: 'Job', vi: 'Tin tuyển dụng' },
    plural: { en: 'Jobs', vi: 'Tuyển dụng' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'department', 'location', 'status', 'deadline'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: 'open' } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'department', type: 'text' },
    { name: 'location', type: 'text', defaultValue: 'Hà Nội' },
    { name: 'employmentType', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Intern'] },
    { name: 'salaryRange', type: 'text' },
    { name: 'summary', type: 'textarea', maxLength: 300 },
    { name: 'body', type: 'richText' },
    { name: 'deadline', type: 'date' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    seoField(),
  ],
};
