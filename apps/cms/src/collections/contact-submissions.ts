import type { CollectionConfig } from 'payload';

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: { en: 'Contact Submission', vi: 'Yêu cầu liên hệ' },
    plural: { en: 'Contact Submissions', vi: 'Yêu cầu liên hệ' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'source', 'status', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    // Public create (wired in plan 4 form APIs); no UI auth needed:
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'message', type: 'textarea' },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'contact',
      options: [
        { label: 'Contact form', value: 'contact' },
        { label: 'Quote calculator', value: 'quote' },
        { label: 'Consultation', value: 'consultation' },
        { label: 'Recruitment', value: 'recruitment' },
        { label: 'Newsletter', value: 'newsletter' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    { name: 'metadata', type: 'json', admin: { description: 'Referrer, UTM, form payload extras.' } },
    { name: 'notes', type: 'textarea', admin: { description: 'Internal notes (sales).' } },
  ],
};
