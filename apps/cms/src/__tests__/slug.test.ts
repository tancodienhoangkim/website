import { describe, it, expect } from 'vitest';
import { slugify } from '../hooks/slugify';

describe('slugify', () => {
  it('converts Vietnamese title to URL-safe slug', () => {
    expect(slugify('Biệt thự 3 tầng tân cổ điển')).toBe('biet-thu-3-tang-tan-co-dien');
  });
  it('strips special chars and collapses dashes', () => {
    expect(slugify('Hello --- World!!!')).toBe('hello-world');
  });
  it('handles empty / null gracefully', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
  });
  it('handles đ/Đ specifically', () => {
    expect(slugify('Đinh Tiên Hoàng')).toBe('dinh-tien-hoang');
  });
});
