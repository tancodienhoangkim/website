import type { Payload } from 'payload';
import type { SeededMedia } from './media';

const FEATURED: Array<{
  clientName: string;
  clientRole: string;
  content: string;
  avatar: string;
  order: number;
}> = [
  {
    clientName: 'Anh Tuấn',
    clientRole: 'Chủ biệt thự · Hà Nội',
    content:
      'Biệt thự tân cổ điển ở Hà Đông của tôi đã trở thành tác phẩm nghệ thuật nhờ Hoàng Kim. Đội ngũ rất chuyên nghiệp, từ kiến trúc sư đến thợ thi công.',
    avatar: 'avatar-tuan.jpg',
    order: 1,
  },
  {
    clientName: 'Chị Linh',
    clientRole: 'Nhà phố · Bắc Ninh',
    content:
      'Thi công đúng tiến độ, không phát sinh chi phí. Chất lượng nội thất vượt kỳ vọng, gia đình rất hài lòng.',
    avatar: 'avatar-linh.jpg',
    order: 2,
  },
  {
    clientName: 'Ông Phát',
    clientRole: 'Lâu đài · Hải Phòng',
    content:
      'Phong cách tân cổ điển đúng gu gia đình tôi. Kiến trúc sư lắng nghe và điều chỉnh theo phong thủy, rất đáng tin cậy.',
    avatar: 'avatar-phat.jpg',
    order: 3,
  },
];

export async function seedTestimonials(
  p: Payload,
  media: SeededMedia = {},
): Promise<Array<string | number>> {
  const ids: Array<string | number> = [];
  for (const t of FEATURED) {
    const existing = await p.find({
      collection: 'testimonials',
      where: { clientName: { equals: t.clientName } },
      limit: 1,
    });
    const avatarId = media[t.avatar];
    if (existing.docs[0]) {
      const current = existing.docs[0] as { id: string | number; avatar?: unknown };
      // Patch content/role/avatar to new canonical values.
      await p.update({
        collection: 'testimonials',
        id: current.id,
        data: {
          clientRole: t.clientRole,
          content: t.content,
          order: t.order,
          rating: '5',
          ...(avatarId ? { avatar: avatarId } : {}),
        } as unknown as never,
      });
      ids.push(current.id);
      continue;
    }
    const doc = await p.create({
      collection: 'testimonials',
      data: {
        clientName: t.clientName,
        clientRole: t.clientRole,
        content: t.content,
        rating: '5',
        order: t.order,
        ...(avatarId ? { avatar: avatarId } : {}),
      } as unknown as never,
    });
    ids.push(doc.id);
  }
  return ids;
}
