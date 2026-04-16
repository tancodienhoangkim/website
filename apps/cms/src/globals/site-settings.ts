import type { GlobalConfig } from 'payload';
import { seoField } from '../fields/seo';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { en: 'Site Settings', vi: 'Cấu hình trang' },
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'Tân Cổ Điển Hoàng Kim' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'favicon', type: 'upload', relationTo: 'media' },
    { name: 'hotline', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'address', type: 'textarea' },
    { name: 'hours', type: 'text', admin: { description: 'e.g., 8:00 - 17:30, Mon-Sat' } },
    {
      name: 'social',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'youtube', type: 'text' },
        { name: 'zaloOaId', type: 'text' },
        { name: 'zaloPhone', type: 'text' },
        { name: 'messengerPageId', type: 'text' },
        { name: 'tiktok', type: 'text' },
        { name: 'instagram', type: 'text' },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      fields: [
        { name: 'gtmId', type: 'text' },
        { name: 'ga4Id', type: 'text' },
        { name: 'fbPixelId', type: 'text' },
      ],
    },
    seoField({ label: 'Default SEO' }),
  ],
};
