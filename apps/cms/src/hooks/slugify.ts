import type { FieldHook } from 'payload';

export function slugify(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const slugifyFromTitle: FieldHook = ({ value, data, operation }) => {
  if (typeof value === 'string' && value.length > 0) return slugify(value);
  if (operation === 'create' && data?.title) return slugify(String(data.title));
  return value;
};
