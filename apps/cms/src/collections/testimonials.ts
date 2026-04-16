import type { CollectionConfig } from 'payload';

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: { en: 'Testimonial', vi: 'Cảm nhận khách hàng' },
    plural: { en: 'Testimonials', vi: 'Cảm nhận khách hàng' },
  },
  admin: {
    useAsTitle: 'clientName',
    defaultColumns: ['clientName', 'clientRole', 'rating', 'order'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'clientName', type: 'text', required: true },
    { name: 'clientRole', type: 'text' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'textarea', required: true },
    {
      name: 'rating',
      type: 'select',
      defaultValue: '5',
      options: [
        { label: '★', value: '1' },
        { label: '★★', value: '2' },
        { label: '★★★', value: '3' },
        { label: '★★★★', value: '4' },
        { label: '★★★★★', value: '5' },
      ],
    },
    { name: 'videoUrl', type: 'text', admin: { description: 'YouTube URL (optional).' } },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
