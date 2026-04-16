#!/usr/bin/env node
// Generate placeholder PNG logos for 6 partner brands.
// Real brand logos are trademarks — client must upload real assets
// via /admin/collections/partners before production deploy.
// Run from apps/cms so sharp resolves: `node scripts/generate-partner-placeholders.mjs`

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const DEST = path.resolve(here, '..', 'public', 'vendor', 'images', 'seed', 'partners');

const BRANDS = [
  { file: 'kohler.png', name: 'KOHLER', tagline: 'Thiết bị nhà tắm' },
  { file: 'toto.png', name: 'TOTO', tagline: 'Phụ kiện phòng tắm' },
  { file: 'hafele.png', name: 'HÄFELE', tagline: 'Phụ kiện tủ bếp' },
  { file: 'dulux.png', name: 'DULUX', tagline: 'Sơn cao cấp' },
  { file: 'jotun.png', name: 'JOTUN', tagline: 'Sơn ngoại thất' },
  { file: 'nippon.png', name: 'NIPPON PAINT', tagline: 'Sơn công nghiệp' },
];

function svg({ name, tagline }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120" width="300" height="120">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F1E075"/>
      <stop offset="100%" stop-color="#AE7F41"/>
    </linearGradient>
  </defs>
  <rect width="300" height="120" fill="#2F0A10" rx="6"/>
  <rect x="4" y="4" width="292" height="112" fill="none" stroke="url(#g)" stroke-width="1" rx="4"/>
  <text x="150" y="62" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="700" fill="url(#g)" letter-spacing="2">${name}</text>
  <text x="150" y="88" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="11" fill="rgba(255,255,255,0.6)" letter-spacing="1.5">${tagline.toUpperCase()}</text>
</svg>
`;
}

async function main() {
  await mkdir(DEST, { recursive: true });
  for (const brand of BRANDS) {
    const dest = path.join(DEST, brand.file);
    const pngBuf = await sharp(Buffer.from(svg(brand))).png().toBuffer();
    await writeFile(dest, pngBuf);
    console.log(`generated ${dest}`);
  }
  console.log(`\n✅ ${BRANDS.length} partner placeholders written to ${DEST}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
