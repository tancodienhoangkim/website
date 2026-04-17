import type { CollectionConfig } from 'payload';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { en: 'Media', vi: 'Tệp media' },
    plural: { en: 'Media', vi: 'Thư viện media' },
  },
  admin: { useAsTitle: 'filename' },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
    mimeTypes: ['image/*', 'video/mp4', 'application/pdf'],
    imageSizes: [
      { name: 'thumb', width: 150, height: 150, position: 'centre' },
      { name: 'card', width: 600, height: 400, position: 'centre' },
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    { name: 'alt', type: 'text', required: true, admin: { description: 'Describe image for a11y & SEO.' } },
    { name: 'caption', type: 'text' },
  ],
};
