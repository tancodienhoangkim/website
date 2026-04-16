import type { Field } from 'payload';
import { slugifyFromTitle } from '../hooks/slugify';

export function slugField(fieldName: string = 'slug'): Field {
  return {
    name: fieldName,
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: 'URL path. Auto-generated from title if empty.',
    },
    hooks: { beforeValidate: [slugifyFromTitle] },
  };
}
