import type { GlobalConfig } from 'payload';
import { seoField } from '../fields/seo';

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: { en: 'Homepage', vi: 'Trang chủ' },
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  fields: [
    {
      name: 'heroSlides',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'heading', type: 'text' },
        { name: 'subheading', type: 'text' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaUrl', type: 'text' },
      ],
    },
    {
      name: 'featuredCategories',
      type: 'relationship',
      relationTo: 'project-categories',
      hasMany: true,
    },
    {
      name: 'featuredProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: { description: 'Pick 6-12 projects to feature on homepage.' },
    },
    {
      name: 'aboutSnippet',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'richText' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaUrl', type: 'text' },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
    {
      name: 'pressMentions',
      type: 'relationship',
      relationTo: 'press-mentions',
      hasMany: true,
    },
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
    },
    {
      name: 'ctaBlocks',
      type: 'array',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaUrl', type: 'text' },
      ],
    },
    {
      name: 'featuredVideos',
      type: 'array',
      maxRows: 6,
      admin: {
        description:
          'Top 3 hiển thị trên homepage: video đầu = hero lớn, 2 video kế = hai ô nhỏ bên phải.',
      },
      fields: [
        {
          name: 'youtubeId',
          type: 'text',
          required: true,
          admin: {
            description:
              'ID 11 ký tự từ URL youtube.com/watch?v=… (ví dụ: jfH46cHFino).',
          },
        },
        { name: 'title', type: 'text', required: true },
        {
          name: 'thumbnail',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Tuỳ chọn. Nếu trống, component dùng YouTube hqdefault CDN.',
          },
        },
      ],
    },
    {
      name: 'factoryPhotos',
      type: 'array',
      maxRows: 30,
      admin: { description: 'Ảnh xưởng sản xuất nội thất — carousel 3 ảnh/view desktop.' },
      fields: [
        { name: 'photo', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    seoField(),
  ],
};
