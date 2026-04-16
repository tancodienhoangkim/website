import type { CollectionConfig } from 'payload';

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: {
    singular: { en: 'Subscriber', vi: 'Người đăng ký nhận tin' },
    plural: { en: 'Subscribers', vi: 'Người đăng ký nhận tin' },
  },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'source', 'createdAt'] },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    { name: 'source', type: 'text', defaultValue: 'footer' },
    { name: 'unsubscribedAt', type: 'date' },
  ],
};
