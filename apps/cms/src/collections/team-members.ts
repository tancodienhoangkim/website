import type { CollectionConfig } from 'payload';

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: {
    singular: { en: 'Team Member', vi: 'Thành viên đội ngũ' },
    plural: { en: 'Team Members', vi: 'Đội ngũ' },
  },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'role', 'order'] },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
