import type { Payload } from 'payload';
import type { SeededMedia } from './media';

// NOTE: brand names are placeholders for demo only. Client must confirm
// actual partnerships with these or other vendors before production deploy.
const PARTNERS: Array<{ name: string; logo: string; url?: string; order: number }> = [
  { name: 'KOHLER', logo: 'kohler.png', url: 'https://www.kohler.com/en-vn', order: 1 },
  { name: 'TOTO', logo: 'toto.png', url: 'https://vn.toto.com', order: 2 },
  { name: 'Häfele', logo: 'hafele.png', url: 'https://www.hafele.com.vn', order: 3 },
  { name: 'Dulux', logo: 'dulux.png', url: 'https://www.dulux.com.vn', order: 4 },
  { name: 'Jotun', logo: 'jotun.png', url: 'https://www.jotun.com/vn', order: 5 },
  { name: 'Nippon Paint', logo: 'nippon.png', url: 'https://www.nipponpaint.com.vn', order: 6 },
];

export async function seedPartners(
  p: Payload,
  media: SeededMedia,
): Promise<Array<string | number>> {
  const ids: Array<string | number> = [];
  for (const partner of PARTNERS) {
    const existing = await p.find({
      collection: 'partners',
      where: { name: { equals: partner.name } },
      limit: 1,
    });
    if (existing.docs[0]) {
      ids.push(existing.docs[0].id);
      p.logger.info(`partner exists: ${partner.name}`);
      continue;
    }
    const logoId = media[partner.logo];
    if (!logoId) {
      p.logger.warn(`partner missing logo media: ${partner.logo}, skipping ${partner.name}`);
      continue;
    }
    const doc = await p.create({
      collection: 'partners',
      data: {
        name: partner.name,
        logo: logoId,
        url: partner.url,
        order: partner.order,
      } as never,
    });
    ids.push(doc.id);
    p.logger.info(`partner created: ${partner.name}`);
  }
  return ids;
}
