import type { GlobalConfig } from 'payload';

export const PromoPopup: GlobalConfig = {
  slug: 'promo-popup',
  label: { en: 'Promo Popup', vi: 'Popup khuyến mãi' },
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: false },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'link', type: 'text' },
    { name: 'startDate', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'endDate', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'suppressHours', type: 'number', defaultValue: 24, admin: { description: 'Hours to suppress after dismiss.' } },
  ],
};
