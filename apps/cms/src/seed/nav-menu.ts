import type { Payload } from 'payload';

export async function seedNavMenu(
  p: Payload,
  _cats: Map<string, string | number>,
  _services: Array<string | number>,
) {
  const tops = [
    { title: 'Về Hoàng Kim', url: '/ve-chung-toi/gioi-thieu', order: 1 },
    { title: 'Dịch vụ', url: '/dich-vu', order: 2 },
    { title: 'Dự án', url: '/du-an', order: 3 },
    { title: 'Tin tức', url: '/tin-tuc', order: 4 },
    { title: 'Liên hệ', url: '/lien-he', order: 5 },
  ];
  for (const t of tops) {
    const existing = await p.find({
      collection: 'nav-menu',
      where: { title: { equals: t.title } },
      limit: 1,
    });
    if (existing.docs[0]) continue;
    await p.create({ collection: 'nav-menu', data: t as any });
  }
}
