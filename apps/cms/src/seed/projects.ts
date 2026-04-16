import type { Payload } from 'payload';
import type { SeededMedia } from './media';

type Sample = {
  title: string;
  categoryTitle: string;
  cover: string;
  summary: string;
  specs: { location: string; area: number; floors: number; year: number; style: string };
};

const SAMPLES: Sample[] = [
  // S6 Biệt thự (4)
  {
    title: 'Biệt thự tân cổ điển 3 tầng tại Hà Nội',
    categoryTitle: 'Biệt thự tân cổ điển',
    cover: 'biet-thu-1.jpg',
    summary: 'Biệt thự 3 tầng phong cách tân cổ điển, 350m² sàn, dát vàng chi tiết mặt dựng.',
    specs: { location: 'Hà Nội', area: 350, floors: 3, year: 2024, style: 'Tân cổ điển' },
  },
  {
    title: 'Biệt thự cổ điển Pháp 2 tầng tại Bắc Ninh',
    categoryTitle: 'Biệt thự cổ điển Pháp',
    cover: 'biet-thu-2.jpg',
    summary: 'Biệt thự 2 tầng mang đậm dấu ấn kiến trúc cổ điển Pháp, 280m² sàn.',
    specs: { location: 'Bắc Ninh', area: 280, floors: 2, year: 2024, style: 'Cổ điển Pháp' },
  },
  {
    title: 'Biệt thự hiện đại 3 tầng sang trọng',
    categoryTitle: 'Biệt thự hiện đại',
    cover: 'biet-thu-3.jpg',
    summary: 'Thiết kế hiện đại tối giản, 3 tầng, 320m², tận dụng kính và đá tự nhiên.',
    specs: { location: 'Vĩnh Phúc', area: 320, floors: 3, year: 2025, style: 'Hiện đại' },
  },
  {
    title: 'Biệt thự nhà vườn 2 tầng tại Hải Phòng',
    categoryTitle: 'Biệt thự nhà vườn',
    cover: 'biet-thu-4.jpg',
    summary: 'Biệt thự nhà vườn 2 tầng, 240m², có sân vườn phong cách Á Đông.',
    specs: { location: 'Hải Phòng', area: 240, floors: 2, year: 2024, style: 'Nhà vườn' },
  },

  // S7 Lâu đài - Dinh thự (4)
  {
    title: 'Lâu đài Pháp 4 tầng tại Quảng Bình',
    categoryTitle: 'Lâu đài',
    cover: 'lau-dai-1.jpg',
    summary: 'Lâu đài 4 tầng phong cách Pháp cổ điển, 720m² sàn, mặt tiền 18m.',
    specs: { location: 'Quảng Bình', area: 720, floors: 4, year: 2024, style: 'Lâu đài Pháp' },
  },
  {
    title: 'Dinh thự tân cổ điển 5 tầng',
    categoryTitle: 'Dinh thự',
    cover: 'lau-dai-2.jpg',
    summary: 'Dinh thự 5 tầng, 850m², sảnh đón khách dát vàng, cầu thang đá cẩm thạch.',
    specs: { location: 'Hà Nội', area: 850, floors: 5, year: 2025, style: 'Tân cổ điển' },
  },
  {
    title: 'Lâu đài 3 tầng mái Mansard',
    categoryTitle: 'Lâu đài',
    cover: 'lau-dai-3.jpg',
    summary: 'Lâu đài 3 tầng mái Mansard kiểu Pháp, 640m², vườn cảnh bao quanh.',
    specs: { location: 'Hải Phòng', area: 640, floors: 3, year: 2023, style: 'Pháp cổ điển' },
  },
  {
    title: 'Dinh thự tân cổ điển 4 tầng',
    categoryTitle: 'Dinh thự',
    cover: 'lau-dai-4.jpg',
    summary: 'Dinh thự 4 tầng tân cổ điển, 560m², phòng tiếp tân lớn, thư viện riêng.',
    specs: { location: 'Bắc Giang', area: 560, floors: 4, year: 2024, style: 'Tân cổ điển' },
  },

  // S8 Nội thất (4)
  {
    title: 'Nội thất phòng khách tân cổ điển dát vàng',
    categoryTitle: 'Nội thất phòng khách',
    cover: 'noi-that-1.jpg',
    summary: 'Phòng khách 60m² phong cách tân cổ điển, chi tiết dát vàng 24K.',
    specs: { location: 'Hà Nội', area: 60, floors: 1, year: 2024, style: 'Tân cổ điển' },
  },
  {
    title: 'Nội thất phòng ngủ master suite',
    categoryTitle: 'Nội thất phòng ngủ',
    cover: 'noi-that-2.jpg',
    summary: 'Phòng ngủ master 45m², giường 2m, toàn bộ gỗ gõ đỏ & vải nhập Ý.',
    specs: { location: 'TP.HCM', area: 45, floors: 1, year: 2025, style: 'Tân cổ điển' },
  },
  {
    title: 'Nội thất bếp mở phong cách Pháp',
    categoryTitle: 'Nội thất bếp',
    cover: 'noi-that-3.jpg',
    summary: 'Bếp mở 35m², tủ bếp ray Blum, đá cẩm thạch Calacatta nhập khẩu.',
    specs: { location: 'Đà Nẵng', area: 35, floors: 1, year: 2024, style: 'Pháp cổ điển' },
  },
  {
    title: 'Nội thất phòng thờ Bắc Bộ cổ kính',
    categoryTitle: 'Nội thất phòng thờ',
    cover: 'noi-that-4.jpg',
    summary: 'Phòng thờ 20m², gỗ mít nguyên khối, chạm trổ hoa văn truyền thống.',
    specs: { location: 'Hà Nội', area: 20, floors: 1, year: 2024, style: 'Bắc Bộ cổ' },
  },

  // S9 Thi công (4)
  {
    title: 'Thi công trọn gói biệt thự 3 tầng tại Nghệ An',
    categoryTitle: 'Thi công trọn gói',
    cover: 'thi-cong-1.jpg',
    summary: 'Thi công trọn gói biệt thự 3 tầng 380m², thời gian 9 tháng, giám sát 24/7.',
    specs: { location: 'Nghệ An', area: 380, floors: 3, year: 2024, style: 'Tân cổ điển' },
  },
  {
    title: 'Thi công phần thô lâu đài 4 tầng',
    categoryTitle: 'Thi công trọn gói',
    cover: 'thi-cong-2.jpg',
    summary: 'Phần thô lâu đài 4 tầng 820m², cọc khoan nhồi, móng bè BTCT.',
    specs: { location: 'Thanh Hoá', area: 820, floors: 4, year: 2024, style: 'Pháp' },
  },
  {
    title: 'Thi công hoàn thiện biệt thự 2 tầng',
    categoryTitle: 'Thi công hoàn thiện',
    cover: 'thi-cong-3.jpg',
    summary: 'Hoàn thiện ngoại thất & nội thất biệt thự 2 tầng 260m², ốp đá tự nhiên.',
    specs: { location: 'Quảng Ninh', area: 260, floors: 2, year: 2025, style: 'Tân cổ điển' },
  },
  {
    title: 'Thi công hoàn thiện nội thất biệt thự tân cổ điển',
    categoryTitle: 'Thi công hoàn thiện',
    cover: 'thi-cong-4.jpg',
    summary: 'Hoàn thiện nội thất 5 phòng ngủ, bếp & phòng khách, chất liệu cao cấp.',
    specs: { location: 'Bắc Ninh', area: 320, floors: 3, year: 2024, style: 'Tân cổ điển' },
  },

  // S10 Trụ sở - Khách sạn (4)
  {
    title: 'Trụ sở văn phòng 6 tầng tại Hà Nội',
    categoryTitle: 'Trụ sở văn phòng',
    cover: 'tru-so-1.jpg',
    summary: 'Trụ sở doanh nghiệp 6 tầng, 1.200m² sàn, mặt kính hai lớp cách âm.',
    specs: { location: 'Hà Nội', area: 1200, floors: 6, year: 2025, style: 'Hiện đại' },
  },
  {
    title: 'Khách sạn boutique 8 tầng tân cổ điển',
    categoryTitle: 'Khách sạn - Nhà hàng',
    cover: 'tru-so-2.jpg',
    summary: 'Khách sạn 48 phòng boutique phong cách tân cổ điển, sảnh dát vàng.',
    specs: { location: 'Hạ Long', area: 2400, floors: 8, year: 2024, style: 'Tân cổ điển' },
  },
  {
    title: 'Khách sạn resort ven biển 5 tầng',
    categoryTitle: 'Khách sạn - Nhà hàng',
    cover: 'tru-so-3.jpg',
    summary: 'Resort 5 tầng 60 phòng view biển, kết hợp kiến trúc Pháp & Việt.',
    specs: { location: 'Đà Nẵng', area: 3200, floors: 5, year: 2024, style: 'Pháp - Việt' },
  },
  {
    title: 'Nhà hàng tân cổ điển 2 tầng',
    categoryTitle: 'Khách sạn - Nhà hàng',
    cover: 'tru-so-4.jpg',
    summary: 'Nhà hàng 2 tầng, 180 chỗ ngồi, phong cách tân cổ điển Pháp.',
    specs: { location: 'TP.HCM', area: 450, floors: 2, year: 2025, style: 'Tân cổ điển' },
  },
];

export async function seedProjects(
  p: Payload,
  cats: Map<string, string | number>,
  media: SeededMedia = {},
): Promise<Array<string | number>> {
  const ids: Array<string | number> = [];
  for (const s of SAMPLES) {
    const existing = await p.find({
      collection: 'projects',
      where: { title: { equals: s.title } },
      limit: 1,
    });
    const coverId = media[s.cover];
    const categoryId = cats.get(s.categoryTitle);
    if (existing.docs[0]) {
      const current = existing.docs[0] as { id: string | number };
      // Patch cover image if missing.
      if (coverId) {
        await p.update({
          collection: 'projects',
          id: current.id,
          data: { coverImage: coverId } as unknown as never,
        });
      }
      ids.push(current.id);
      continue;
    }
    if (!coverId || !categoryId) {
      p.logger.warn(
        `projects seed: missing cover (${s.cover}=${coverId}) or category (${s.categoryTitle}=${categoryId}); skipping ${s.title}`,
      );
      continue;
    }
    const doc = await p.create({
      collection: 'projects',
      data: {
        title: s.title,
        category: categoryId,
        coverImage: coverId,
        summary: s.summary,
        specs: s.specs,
        featured: true,
        status: 'published',
        publishedAt: new Date().toISOString(),
      } as never,
    });
    ids.push(doc.id);
    p.logger.info(`project created: ${s.title}`);
  }
  return ids;
}
