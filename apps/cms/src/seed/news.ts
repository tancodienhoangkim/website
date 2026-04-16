import type { Payload } from 'payload';
import type { SeededMedia } from './media';

type NewsSample = {
  title: string;
  slug: string;
  categoryTitle: string;
  cover: string;
  excerpt: string;
  body: string;
  publishedAt: string;
};

const CATEGORIES: Array<{ title: string; slug: string }> = [
  { title: 'Tin ngành', slug: 'tin-nganh' },
  { title: 'Hoạt động Hoàng Kim', slug: 'hoat-dong-hoang-kim' },
  { title: 'Kinh nghiệm xây dựng', slug: 'kinh-nghiem-xay-dung' },
];

const POSTS: NewsSample[] = [
  {
    title: 'Tân cổ điển Hoàng Kim đạt Top 10 thương hiệu tiêu biểu 2025',
    slug: 'top-10-thuong-hieu-tieu-bieu-2025',
    categoryTitle: 'Hoạt động Hoàng Kim',
    cover: 'news-1.jpg',
    excerpt:
      'Sự kiện vinh danh các doanh nghiệp kiến trúc - xây dựng tiêu biểu 2025 ghi nhận đóng góp của Hoàng Kim cho lĩnh vực tân cổ điển.',
    body: 'Ngày 15/01/2025, lễ vinh danh Top 10 Thương hiệu Tiêu biểu 2025 được tổ chức tại Hà Nội. Tân cổ điển Hoàng Kim được xướng tên với tư cách đơn vị kiến trúc - thiết kế tân cổ điển hàng đầu.\n\nĐại diện Hoàng Kim chia sẻ đây là kết quả của 15 năm bền bỉ theo đuổi phong cách tân cổ điển, khẳng định bản sắc thương hiệu trên thị trường Việt Nam.',
    publishedAt: '2025-01-15T09:00:00.000Z',
  },
  {
    title: 'Xu hướng thiết kế biệt thự tân cổ điển 2026',
    slug: 'xu-huong-thiet-ke-biet-thu-tan-co-dien-2026',
    categoryTitle: 'Tin ngành',
    cover: 'news-2.jpg',
    excerpt:
      '5 xu hướng mới định hình thiết kế biệt thự tân cổ điển năm 2026: từ mặt dựng tối giản hoá đến vật liệu thân thiện môi trường.',
    body: 'Năm 2026 chứng kiến sự dịch chuyển của phong cách tân cổ điển theo hướng tối giản hoá. Chi tiết trang trí ít đi nhưng tinh xảo hơn, kết hợp với vật liệu bền vững.\n\nHoàng Kim đã tiên phong áp dụng xu hướng này cho 20+ dự án gần đây tại Hà Nội, TP.HCM, Đà Nẵng.',
    publishedAt: '2025-02-10T10:00:00.000Z',
  },
  {
    title: 'Báo chí nói về Tân cổ điển Hoàng Kim',
    slug: 'bao-chi-noi-ve-tan-co-dien-hoang-kim',
    categoryTitle: 'Hoạt động Hoàng Kim',
    cover: 'news-3.jpg',
    excerpt:
      'Tạp chí Kiến trúc, Diễn đàn Doanh nghiệp, và Tuổi Trẻ cùng giới thiệu mô hình thiết kế - thi công trọn gói của Hoàng Kim.',
    body: 'Trong tháng 3/2025, nhiều tờ báo uy tín đã đăng bài về Hoàng Kim. Tạp chí Kiến trúc ấn tượng với xưởng sản xuất nội thất 2000m². Diễn đàn Doanh nghiệp ca ngợi mô hình thi công trọn gói.\n\nTuổi Trẻ phỏng vấn CEO Hoàng Kim về định hướng phát triển 5 năm tới, tập trung vào thị trường miền Nam.',
    publishedAt: '2025-03-05T08:30:00.000Z',
  },
  {
    title: '10 kinh nghiệm chọn vật liệu xây biệt thự tân cổ điển',
    slug: '10-kinh-nghiem-chon-vat-lieu-biet-thu',
    categoryTitle: 'Kinh nghiệm xây dựng',
    cover: 'news-4.jpg',
    excerpt:
      'Từ đá Marble Italia đến gỗ gõ đỏ Lào — 10 nguyên tắc chọn vật liệu để biệt thự tân cổ điển bền đẹp qua thời gian.',
    body: 'Vật liệu là yếu tố quyết định tính thẩm mỹ và tuổi thọ của biệt thự tân cổ điển. Đá Marble Italia cho sàn, cầu thang là lựa chọn kinh điển.\n\nGỗ gõ đỏ Lào phù hợp cho nội thất: bền, thớ đẹp, chống mối tốt. Thép mạ vàng 24K dùng tiết chế cho chi tiết trang trí cao cấp.\n\nHoàng Kim luôn đồng hành cùng gia chủ trong khâu chọn vật liệu, đảm bảo cân bằng giữa ngân sách và chất lượng.',
    publishedAt: '2025-03-20T11:00:00.000Z',
  },
  {
    title: 'Hoàng Kim khánh thành xưởng sản xuất nội thất mới 2000m²',
    slug: 'khanh-thanh-xuong-san-xuat-2000m2',
    categoryTitle: 'Hoạt động Hoàng Kim',
    cover: 'news-5.jpg',
    excerpt:
      'Xưởng nội thất 2000m² tại Bắc Ninh chính thức đi vào hoạt động, nâng công suất sản xuất lên 300%.',
    body: 'Xưởng mới của Hoàng Kim tại Bắc Ninh chính thức vận hành từ tháng 4/2025. Trang bị máy CNC hiện đại, dây chuyền sơn PU tự động, đội ngũ 40 thợ lành nghề.\n\nVới 2000m² sàn, xưởng có thể đồng thời xử lý 10+ dự án biệt thự cao cấp, giảm thời gian thi công xuống còn 60-90 ngày.',
    publishedAt: '2025-04-12T09:15:00.000Z',
  },
  {
    title: 'Phong thủy trong thiết kế biệt thự tân cổ điển',
    slug: 'phong-thuy-trong-thiet-ke-biet-thu-tan-co-dien',
    categoryTitle: 'Kinh nghiệm xây dựng',
    cover: 'news-6.jpg',
    excerpt:
      'Cân bằng giữa phong cách tân cổ điển châu Âu và yếu tố phong thuỷ Á Đông — chia sẻ từ kiến trúc sư trưởng Hoàng Kim.',
    body: 'Tân cổ điển châu Âu và phong thuỷ Á Đông tưởng chừng đối lập nhưng có nhiều điểm đồng điệu. Cả hai đều đề cao đối xứng, hài hoà, và tính trật tự.\n\nKiến trúc sư trưởng Hoàng Kim chia sẻ nguyên tắc 5 yếu tố: hướng nhà, sắp xếp phòng, chọn màu, bố trí sân vườn, và vị trí cầu thang — đảm bảo biệt thự đẹp và thuận phong thuỷ.',
    publishedAt: '2025-05-08T14:00:00.000Z',
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

export async function seedNews(
  p: Payload,
  admin: { id: string | number },
  media: SeededMedia = {},
): Promise<string | number> {
  const catMap = new Map<string, string | number>();
  for (const cat of CATEGORIES) {
    const existing = await p.find({
      collection: 'news-categories',
      where: { title: { equals: cat.title } },
      limit: 1,
    });
    if (existing.docs[0]) {
      catMap.set(cat.title, existing.docs[0].id);
      continue;
    }
    const doc = await p.create({
      collection: 'news-categories',
      data: { title: cat.title, slug: cat.slug } as never,
    });
    catMap.set(cat.title, doc.id);
  }

  for (const post of POSTS) {
    const existing = await p.find({
      collection: 'news',
      where: { title: { equals: post.title } },
      limit: 1,
    });
    const catId = catMap.get(post.categoryTitle);
    const coverId = media[post.cover];
    if (existing.docs[0]) {
      const current = existing.docs[0] as { id: string | number };
      await p.update({
        collection: 'news',
        id: current.id,
        data: {
          slug: post.slug,
          excerpt: post.excerpt,
          body: toLexical(post.body),
          ...(coverId ? { coverImage: coverId } : {}),
          ...(catId ? { category: catId } : {}),
          publishedAt: post.publishedAt,
          status: 'published',
        } as unknown as never,
      });
      continue;
    }
    if (!catId) {
      p.logger.warn(`news seed: missing category ${post.categoryTitle}, skip ${post.title}`);
      continue;
    }
    await p.create({
      collection: 'news',
      data: {
        title: post.title,
        slug: post.slug,
        category: catId,
        ...(coverId ? { coverImage: coverId } : {}),
        excerpt: post.excerpt,
        body: toLexical(post.body),
        author: admin.id,
        publishedAt: post.publishedAt,
        status: 'published',
      } as unknown as never,
    });
    p.logger.info(`news created: ${post.title}`);
  }

  return catMap.get('Tin ngành') ?? '';
}
