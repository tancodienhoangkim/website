import type { Payload } from 'payload';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT_SEED_FILES = [
  'hoangkim-tcd-year-end-party-2025.jpg',
  'nha-may-san-xuat-noi-that-hoangkim-tcd.jpg',
  '2.jpg',
  'bia-pv.jpg',
  '1126-1.jpg',
  'biet-thu-20-ty-ha-noi.jpg',
];

const SUBDIR_SEED_FILES: Array<{ subdir: string; files: string[]; mime: string }> = [
  {
    subdir: 'services',
    mime: 'image/jpeg',
    files: [
      'thiet-ke-kien-truc.jpg',
      'thi-cong-xay-dung.jpg',
      'thiet-ke-noi-that.jpg',
      'san-xuat-noi-that.jpg',
    ],
  },
  {
    subdir: 'partners',
    mime: 'image/png',
    files: ['kohler.png', 'toto.png', 'hafele.png', 'dulux.png', 'jotun.png', 'nippon.png'],
  },
  {
    subdir: 'testimonials',
    mime: 'image/jpeg',
    files: ['avatar-tuan.jpg', 'avatar-linh.jpg', 'avatar-phat.jpg'],
  },
  {
    subdir: 'projects',
    mime: 'image/jpeg',
    files: [
      'biet-thu-1.jpg',
      'biet-thu-2.jpg',
      'biet-thu-3.jpg',
      'biet-thu-4.jpg',
      'lau-dai-1.jpg',
      'lau-dai-2.jpg',
      'lau-dai-3.jpg',
      'lau-dai-4.jpg',
      'noi-that-1.jpg',
      'noi-that-2.jpg',
      'noi-that-3.jpg',
      'noi-that-4.jpg',
      'thi-cong-1.jpg',
      'thi-cong-2.jpg',
      'thi-cong-3.jpg',
      'thi-cong-4.jpg',
      'tru-so-1.jpg',
      'tru-so-2.jpg',
      'tru-so-3.jpg',
      'tru-so-4.jpg',
    ],
  },
  {
    subdir: 'factory',
    mime: 'image/jpeg',
    files: [
      'nha-may-1.jpg',
      'nha-may-2.jpg',
      'nha-may-3.jpg',
      'nha-may-4.jpg',
      'nha-may-5.jpg',
      'nha-may-6.jpg',
      'nha-may-7.jpg',
      'nha-may-8.jpg',
      'nha-may-9.jpg',
      'nha-may-10.jpg',
      'nha-may-11.jpg',
      'nha-may-12.jpg',
    ],
  },
  {
    subdir: 'news',
    mime: 'image/jpeg',
    files: [
      'news-1.jpg',
      'news-2.jpg',
      'news-3.jpg',
      'news-4.jpg',
      'news-5.jpg',
      'news-6.jpg',
    ],
  },
  {
    subdir: 'hero',
    mime: 'image/jpeg',
    files: [
      'hero-1.jpg',
      'hero-2.jpg',
      'hero-3.jpg',
      'hero-4.jpg',
      'hero-5.jpg',
      'about-hero.jpg',
      'cta-bg.jpg',
      'video-thumb-1.jpg',
      'video-thumb-2.jpg',
      'video-thumb-3.jpg',
    ],
  },
];

export type SeededMedia = Record<string, string | number>;

async function seedOne(
  p: Payload,
  ids: SeededMedia,
  baseDir: string,
  filename: string,
  mimetype: string,
) {
  const existing = await p.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  });
  if (existing.docs[0]) {
    ids[filename] = existing.docs[0].id;
    p.logger.info(`media exists: ${filename}`);
    return;
  }
  const buf = await fs.readFile(path.join(baseDir, filename)).catch((err: Error) => {
    throw new Error(`seedMedia: failed to read "${filename}" from ${baseDir}: ${err.message}`);
  });
  const altBase = filename
    .replace(/^avatar-/, 'Khách hàng minh hoạ ')
    .replace(/[-_]/g, ' ')
    .replace(/\.[a-z]+$/, '');
  const doc = await p.create({
    collection: 'media',
    data: { alt: altBase },
    file: {
      data: buf,
      mimetype,
      name: filename,
      size: buf.byteLength,
    },
  });
  ids[filename] = doc.id;
  p.logger.info(`media created: ${filename}`);
}

export async function seedMedia(p: Payload): Promise<SeededMedia> {
  const ids: SeededMedia = {};
  const here = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(here, '..', '..', 'public', 'vendor', 'images', 'seed');

  for (const file of ROOT_SEED_FILES) {
    await seedOne(p, ids, rootDir, file, 'image/jpeg');
  }

  for (const group of SUBDIR_SEED_FILES) {
    const dir = path.join(rootDir, group.subdir);
    for (const file of group.files) {
      await seedOne(p, ids, dir, file, group.mime);
    }
  }

  return ids;
}
