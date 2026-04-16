import type { Payload } from 'payload';
import type { SeededMedia } from './media';

const SERVICES: Array<{
  title: string;
  slug: string;
  summary: string;
  body: string;
  coverImage: string;
}> = [
  {
    title: 'Thiết kế kiến trúc',
    slug: 'thiet-ke-kien-truc',
    summary:
      'Kiến trúc sư Hoàng Kim thiết kế biệt thự, lâu đài, nhà phố tân cổ điển theo phong cách châu Âu.',
    body: 'Dịch vụ thiết kế kiến trúc Hoàng Kim bao phủ từ khảo sát đất, lập ý tưởng, dựng phối cảnh 3D đến hồ sơ thi công chi tiết.\n\nĐội ngũ 10+ kiến trúc sư có 15 năm kinh nghiệm, chuyên về phong cách tân cổ điển Pháp, châu Âu, và Indochine. Mỗi dự án 2-3 vòng điều chỉnh miễn phí tới khi gia chủ hài lòng.\n\nQuy trình: (1) Khảo sát & tư vấn sơ bộ, (2) Ký hợp đồng thiết kế, (3) Phối cảnh 3D mặt ngoài, (4) Phương án mặt bằng, (5) Hồ sơ kỹ thuật. Thời gian trung bình 30-45 ngày.',
    coverImage: 'thiet-ke-kien-truc.jpg',
  },
  {
    title: 'Thi công xây dựng',
    slug: 'thi-cong-xay-dung',
    summary:
      'Thi công trọn gói hoặc phần thô, đảm bảo tiến độ và chất lượng theo tiêu chuẩn Việt Nam.',
    body: 'Hoàng Kim thi công trọn gói biệt thự, lâu đài với đội ngũ kỹ sư giám sát 24/7 và công nhân tay nghề cao.\n\nHình thức hợp tác linh hoạt: trọn gói (bao gồm nhân công + vật tư), phần thô, hoặc hoàn thiện. Cam kết đúng tiến độ, bảo hành kết cấu 10 năm, chống thấm 5 năm.\n\nTất cả dự án được quản lý bằng phần mềm Project Management, gia chủ theo dõi tiến độ online qua app riêng của Hoàng Kim.',
    coverImage: 'thi-cong-xay-dung.jpg',
  },
  {
    title: 'Thiết kế nội thất',
    slug: 'thiet-ke-noi-that',
    summary:
      'Nội thất tân cổ điển dát vàng với chất liệu gỗ tự nhiên, da thật, đá cẩm thạch nhập khẩu.',
    body: 'Thiết kế nội thất Hoàng Kim kết hợp phong cách tân cổ điển truyền thống với tiện nghi hiện đại.\n\nChất liệu cao cấp: gỗ gõ đỏ Lào, gỗ sồi Mỹ, da thật Italy, đá Marble Calacatta, kim loại mạ vàng 24K. Kiến trúc sư nội thất đồng hành từ phối cảnh đến giám sát lắp đặt.\n\nGói dịch vụ bao gồm: concept design, thiết kế chi tiết, bản vẽ thi công, chọn vật liệu, đặt hàng nội thất xưởng, giám sát lắp đặt.',
    coverImage: 'thiet-ke-noi-that.jpg',
  },
  {
    title: 'Sản xuất nội thất',
    slug: 'san-xuat-noi-that',
    summary:
      'Xưởng riêng 2.000m², sản xuất đồ gỗ, tủ bếp, giường, sofa cao cấp theo yêu cầu thiết kế.',
    body: 'Xưởng sản xuất nội thất Hoàng Kim tại Bắc Ninh quy mô 2.000m² với máy CNC, dây chuyền sơn PU tự động, 40 thợ lành nghề.\n\nSản phẩm: tủ bếp, giường ngủ, sofa cổ điển, bàn ghế phòng khách, tủ thờ gỗ mít. Mọi chi tiết chạm trổ thủ công bởi nghệ nhân miền Bắc.\n\nBảo hành sản phẩm 5-10 năm. Giao hàng toàn quốc, lắp đặt tại công trình trong 3-7 ngày.',
    coverImage: 'san-xuat-noi-that.jpg',
  },
];

function toLexical(text: string) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: text.split('\n\n').map((para) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        children: [
          {
            type: 'text',
            version: 1,
            text: para,
            format: 0,
            detail: 0,
            mode: 'normal' as const,
            style: '',
          },
        ],
      })),
    },
  };
}

export async function seedServices(
  p: Payload,
  media: SeededMedia = {},
): Promise<Array<string | number>> {
  const ids: Array<string | number> = [];
  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i]!;
    const existing = await p.find({
      collection: 'services',
      where: { title: { equals: s.title } },
      limit: 1,
    });
    const mediaId = media[s.coverImage];
    if (existing.docs[0]) {
      const current = existing.docs[0] as { id: string | number };
      await p.update({
        collection: 'services',
        id: current.id,
        data: {
          summary: s.summary,
          body: toLexical(s.body),
          ...(mediaId ? { coverImage: mediaId } : {}),
        } as unknown as never,
      });
      ids.push(current.id);
      continue;
    }
    const doc = await p.create({
      collection: 'services',
      data: {
        title: s.title,
        slug: s.slug,
        summary: s.summary,
        body: toLexical(s.body),
        order: i + 1,
        ...(mediaId ? { coverImage: mediaId } : {}),
      } as never,
    });
    ids.push(doc.id);
  }
  return ids;
}
