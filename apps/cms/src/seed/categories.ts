import type { Payload } from 'payload';

type ChildNode = { title: string; slug: string };
type RootNode = { title: string; slug: string; description?: string; children: ChildNode[] };

const TREE: RootNode[] = [
  {
    title: 'Biệt thự',
    slug: 'biet-thu',
    description: 'Thiết kế biệt thự đa phong cách.',
    children: [
      { title: 'Biệt thự tân cổ điển', slug: 'biet-thu-tan-co-dien' },
      { title: 'Biệt thự cổ điển Pháp', slug: 'biet-thu-co-dien-phap' },
      { title: 'Biệt thự hiện đại', slug: 'biet-thu-hien-dai' },
      { title: 'Biệt thự nhà vườn', slug: 'biet-thu-nha-vuon' },
      { title: 'Biệt thự 2 tầng', slug: 'biet-thu-2-tang' },
      { title: 'Biệt thự 3 tầng', slug: 'biet-thu-3-tang' },
    ],
  },
  {
    title: 'Lâu đài - Dinh thự',
    slug: 'lau-dai-dinh-thu',
    description: 'Lâu đài, dinh thự đỉnh cao.',
    children: [
      { title: 'Lâu đài', slug: 'thiet-ke-lau-dai' },
      { title: 'Dinh thự', slug: 'thiet-ke-dinh-thu' },
    ],
  },
  {
    title: 'Nội thất',
    slug: 'noi-that',
    description: 'Thiết kế nội thất tân cổ điển & hiện đại.',
    children: [
      { title: 'Nội thất phòng khách', slug: 'noi-that-phong-khach' },
      { title: 'Nội thất phòng ngủ', slug: 'noi-that-phong-ngu' },
      { title: 'Nội thất bếp', slug: 'noi-that-bep' },
      { title: 'Nội thất phòng thờ', slug: 'noi-that-phong-tho' },
    ],
  },
  {
    title: 'Thi công',
    slug: 'thi-cong',
    description: 'Thi công trọn gói & hoàn thiện.',
    children: [
      { title: 'Thi công trọn gói', slug: 'thi-cong-tron-goi' },
      { title: 'Thi công hoàn thiện', slug: 'thi-cong-hoan-thien' },
    ],
  },
  {
    title: 'Trụ sở - Khách sạn',
    slug: 'tru-so-khach-san',
    description: 'Công trình trụ sở, khách sạn, nhà hàng.',
    children: [
      { title: 'Trụ sở văn phòng', slug: 'thiet-ke-tru-so-van-phong' },
      { title: 'Khách sạn - Nhà hàng', slug: 'thiet-ke-khach-san-nha-hang' },
    ],
  },
  // Legacy top retained for backward compat with earlier seed.
  {
    title: 'Nhà phố',
    slug: 'nha-pho',
    description: 'Nhà phố, shophouse hiện đại.',
    children: [],
  },
];

/** Returns a map of title → native Payload id. */
export async function seedCategories(p: Payload): Promise<Map<string, string | number>> {
  const map = new Map<string, string | number>();

  for (let i = 0; i < TREE.length; i++) {
    const root = TREE[i]!;
    const existing = await p.find({
      collection: 'project-categories',
      where: { title: { equals: root.title } },
      limit: 1,
    });
    let rootId: string | number;
    if (existing.docs[0]) {
      rootId = existing.docs[0].id;
    } else {
      const doc = await p.create({
        collection: 'project-categories',
        data: {
          title: root.title,
          slug: root.slug,
          description: root.description,
          order: i + 1,
        } as never,
      });
      rootId = doc.id;
      p.logger.info(`category root created: ${root.title}`);
    }
    map.set(root.title, rootId);

    for (let j = 0; j < root.children.length; j++) {
      const child = root.children[j]!;
      const existingChild = await p.find({
        collection: 'project-categories',
        where: { title: { equals: child.title } },
        limit: 1,
      });
      if (existingChild.docs[0]) {
        map.set(child.title, existingChild.docs[0].id);
        continue;
      }
      const doc = await p.create({
        collection: 'project-categories',
        data: {
          title: child.title,
          slug: child.slug,
          parent: rootId,
          order: j + 1,
        } as never,
      });
      map.set(child.title, doc.id);
      p.logger.info(`category child created: ${child.title}`);
    }
  }

  return map;
}
