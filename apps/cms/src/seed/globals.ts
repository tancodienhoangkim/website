import type { Payload } from 'payload';
import type { SeededMedia } from './media';

type Refs = {
  projects: Array<string | number>;
  press: Array<string | number>;
  testimonials: Array<string | number>;
  services: Array<string | number>;
  media: SeededMedia;
};

export async function seedGlobals(p: Payload, refs: Refs) {
  await p.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Tân Cổ Điển Hoàng Kim',
      hotline: '0971.199.817',
      email: 'tancodienhoangkim@gmail.com',
      address: 'Số 81 đường Vạn Phúc, phường Hà Đông, TP. Hà Nội',
      hours: '8:00 - 17:30, T2 - T7',
      social: {
        facebook: 'https://facebook.com/hoangkim',
        youtube: 'https://youtube.com/@hoangkim',
        zaloPhone: '0971199817',
      },
    } as any,
  });
  await p.updateGlobal({
    slug: 'header',
    data: {
      topBarText: 'Hotline 0971.199.817 · 0792.499.888 · Tư vấn miễn phí',
      ctaButton: { label: 'Đăng ký tư vấn', url: '/dang-ky-tu-van' },
      leftMenu: [
        { label: 'TRANG CHỦ', url: '/', children: [] },
        {
          label: 'VỀ HOÀNG KIM',
          url: '/gioi-thieu-ve-hoang-kim',
          children: [
            { label: 'Về Hoàng Kim', url: '/gioi-thieu-ve-hoang-kim' },
            { label: 'Ý nghĩa Logo & Thông điệp', url: '/y-nghia-logo-thong-diep-thuong-hieu' },
            { label: 'Đội ngũ Hoàng Kim', url: '/doi-ngu-hoang-kim' },
            { label: 'Xưởng sản xuất nội thất', url: '/nha-may-san-xuat-noi-that-hoang-kim' },
            { label: 'Hồ sơ năng lực', url: '/ho-so-nang-luc' },
            { label: 'Cảm nhận khách hàng', url: '/video/cam-nhan-khach-hang' },
            { label: 'Báo chí nói về Hoàng Kim', url: '/bao-chi-noi-ve-hoang-kim' },
            { label: 'Các hoạt động của Hoàng Kim', url: '/ban-tin-hoang-kim/cac-hoat-dong-cua-hoang-kim' },
            { label: 'Tin tuyển dụng', url: '/ban-tin-hoang-kim/tin-tuyen-dung' },
            { label: 'Thông báo', url: '/ban-tin-hoang-kim/thong-bao' },
          ],
        },
        {
          label: 'DỊCH VỤ',
          url: '/dich-vu',
          children: [
            { label: 'Dịch vụ thiết kế kiến trúc', url: '/dich-vu-thiet-ke-kien-truc' },
            { label: 'Dịch vụ thiết kế nội thất', url: '/dich-vu-thiet-ke-noi-that' },
            { label: 'Dịch vụ thiết kế thi công trọn gói', url: '/dich-vu-thi-cong-tron-goi' },
            { label: 'Dịch vụ thi công xây dựng cơ bản', url: '/dich-vu-thi-cong-xay-dung-co-ban' },
            { label: 'Dịch vụ thi công hoàn thiện nội thất', url: '/dich-vu-thi-cong-hoan-thien-noi-that' },
            { label: 'Sản xuất nội thất cao cấp', url: '/xuong-san-xuat-noi-that' },
            { label: 'Báo giá xây biệt thự trọn gói', url: '/bao-gia-xay-dung-biet-thu-tron-goi' },
          ],
        },
        {
          label: 'THIẾT KẾ KIẾN TRÚC',
          url: '/thiet-ke-kien-truc',
          children: [
            { label: 'Biệt thự Tân Cổ Điển', url: '/thiet-ke-biet-thu/biet-thu-tan-co-dien' },
            { label: 'Biệt thự Cổ Điển Pháp', url: '/thiet-ke-biet-thu/biet-thu-co-dien-phap' },
            { label: 'Biệt thự Hiện Đại', url: '/thiet-ke-biet-thu/biet-thu-hien-dai' },
            { label: 'Biệt thự Châu Âu', url: '/thiet-ke-biet-thu/biet-thu-chau-au' },
            { label: 'Biệt thự Địa Trung Hải', url: '/thiet-ke-biet-thu/biet-thu-dia-trung-hai' },
            { label: 'Biệt thự Indochine', url: '/thiet-ke-biet-thu/biet-thu-indochine' },
            { label: 'Thiết kế Biệt thự', url: '/thiet-ke-biet-thu' },
            { label: 'Lâu Đài - Dinh Thự', url: '/lau-dai-dinh-thu' },
            { label: 'Biệt thự Nhà vườn', url: '/thiet-ke-biet-thu/biet-thu-nha-vuon' },
            { label: 'Biệt thự mái Thái', url: '/thiet-ke-biet-thu/biet-thu-mai-thai' },
            { label: 'Biệt thự mái Nhật', url: '/thiet-ke-biet-thu/biet-thu-mai-nhat' },
            { label: 'Biệt thự Mini', url: '/thiet-ke-biet-thu/biet-thu-mini' },
            { label: 'Biệt thự 1 tầng', url: '/thiet-ke-biet-thu/biet-thu-1-tang' },
            { label: 'Biệt thự 2 tầng', url: '/thiet-ke-biet-thu/biet-thu-2-tang' },
            { label: 'Biệt thự 3 tầng', url: '/thiet-ke-biet-thu/biet-thu-3-tang' },
            { label: 'Biệt thự 4 tầng', url: '/thiet-ke-biet-thu/biet-thu-4-tang' },
            { label: 'Biệt thự 5 tầng', url: '/thiet-ke-biet-thu/biet-thu-5-tang' },
            { label: 'Biệt thự 6 tầng', url: '/thiet-ke-biet-thu/biet-thu-6-tang' },
            { label: 'Thiết kế Trụ sở - Văn phòng', url: '/thiet-ke-tru-so-khach-san/thiet-ke-tru-so-van-phong' },
            { label: 'Thiết kế Khách sạn - Nhà hàng', url: '/thiet-ke-tru-so-khach-san/thiet-ke-khach-san-nha-hang' },
            { label: 'Biệt thự Phố', url: '/biet-thu-pho' },
            { label: 'Thiết kế nhà phố', url: '/thiet-ke-nha-pho' },
            { label: 'Thiết kế sân vườn', url: '/thiet-ke-san-vuon' },
            { label: 'Nhà mái Thái', url: '/nha-mai-thai' },
            { label: 'Nhà mái Nhật', url: '/nha-mai-nhat' },
            { label: 'Nhà mái Bằng', url: '/nha-mai-bang' },
          ],
        },
        {
          label: 'THIẾT KẾ NỘI THẤT',
          url: '/thiet-ke-noi-that',
          children: [
            { label: 'Thiết kế nội thất Biệt thự', url: '/thiet-ke-noi-that/thiet-ke-noi-that-biet-thu' },
            { label: 'Thiết kế nội thất nhà Phố', url: '/thiet-ke-noi-that/thiet-ke-noi-that-nha-pho' },
            { label: 'Thiết kế nội thất Chung cư', url: '/thiet-ke-noi-that/thiet-ke-noi-that-chung-cu' },
            { label: 'Thiết kế nội thất Luxury', url: '/thiet-ke-noi-that/thiet-ke-noi-that-luxury' },
            { label: 'Thiết kế nội thất Cổ Điển', url: '/thiet-ke-noi-that/thiet-ke-noi-that-co-dien' },
            { label: 'Thiết kế nội thất Tân Cổ Điển', url: '/thiet-ke-noi-that/thiet-ke-noi-that-tan-co-dien' },
            { label: 'Thiết kế nội thất Hiện Đại', url: '/thiet-ke-noi-that/thiet-ke-noi-that-hien-dai' },
            { label: 'Thiết kế nội thất Indochine', url: '/thiet-ke-noi-that/thiet-ke-noi-that-indochine' },
            { label: 'Thiết kế nội thất Artdeco', url: '/thiet-ke-noi-that/thiet-ke-noi-that-artdeco' },
          ],
        },
      ],
      rightMenu: [
        {
          label: 'DỰ ÁN THI CÔNG',
          url: '/du-an-thi-cong',
          children: [
            { label: 'Hình ảnh hoàn thiện kiến trúc', url: '/thi-cong-ngoai-that/hinh-anh-hoan-thien-ngoai-that' },
            { label: 'Dự án kiến trúc đang thi công', url: '/thi-cong-ngoai-that/du-an-kien-truc-dang-thi-cong' },
            { label: 'Lễ khởi công xây dựng dự án', url: '/du-an-thi-cong/le-khoi-cong-xay-dung-du-an' },
            { label: 'Video nhà đẹp', url: '/video/nha-dep' },
            { label: 'Hình ảnh hoàn thiện nội thất', url: '/thi-cong-noi-that/hinh-anh-hoan-thien-noi-that' },
            { label: 'Dự án nội thất đang thi công', url: '/thi-cong-noi-that/du-an-noi-that-dang-thi-cong' },
            { label: 'Video cập nhật tiến độ thi công', url: '/video/cap-nhat-tien-do-thi-cong' },
          ],
        },
        {
          label: 'DỰ ÁN 3 MIỀN',
          url: '/du-an-3-mien',
          children: [
            { label: 'Miền Bắc', url: '/du-an-3-mien/mien-bac' },
            { label: 'Miền Trung', url: '/du-an-3-mien/mien-trung' },
            { label: 'Miền Nam', url: '/du-an-3-mien/mien-nam' },
          ],
        },
        {
          label: 'VIDEO',
          url: '/video',
          children: [
            { label: 'Video nhà đẹp', url: '/video/nha-dep' },
            { label: 'Video tiến độ thi công', url: '/video/cap-nhat-tien-do-thi-cong' },
            { label: 'Video kỹ thuật thi công', url: '/video/ky-thuat-thi-cong' },
            { label: 'Cảm nhận của khách hàng', url: '/video/cam-nhan-khach-hang' },
            { label: 'Báo chí nói về Hoàng Kim', url: '/video/bao-chi-noi-ve-hoang-kim' },
          ],
        },
        {
          label: 'TƯ VẤN XÂY DỰNG',
          url: '/tu-van-xay-dung',
          children: [
            { label: 'Tư vấn thiết kế', url: '/tu-van-xay-dung/tin-tu-van-thiet-ke' },
            { label: 'Kinh nghiệm xây nhà', url: '/tu-van-xay-dung/kinh-nghiem-xay-nha' },
            { label: 'Thước lỗ ban', url: '/thuoc-lo-ban' },
            { label: 'Tra cứu hướng nhà', url: '/tra-cuu-huong-nha' },
            { label: 'Tra cứu tuổi xây dựng', url: '/tra-cuu-tuoi-xay-dung' },
            { label: 'Tư vấn phong thuỷ', url: '/tu-van-phong-thuy' },
            { label: 'Tạp chí nhà đẹp', url: '/tu-van-xay-dung/tap-chi-nha-dep' },
            { label: 'Kiến trúc quanh ta', url: '/tu-van-xay-dung/kien-truc-quanh-ta' },
          ],
        },
        { label: 'LIÊN HỆ', url: '/lien-he', children: [] },
      ],
    } as any,
  });
  await p.updateGlobal({
    slug: 'footer',
    data: {
      columns: [
        {
          title: 'Công ty',
          links: [
            { label: 'Giới thiệu', url: '/ve-chung-toi/gioi-thieu' },
            { label: 'Đội ngũ', url: '/ve-chung-toi/doi-ngu' },
          ],
        },
        {
          title: 'Dịch vụ',
          links: [{ label: 'Thiết kế kiến trúc', url: '/dich-vu/thiet-ke-kien-truc' }],
        },
      ],
      copyright: '© 2026 Tân Cổ Điển Hoàng Kim. Uy tín tạo nên thương hiệu.',
    } as any,
  });
  await p.updateGlobal({
    slug: 'homepage',
    data: {
      featuredProjects: refs.projects,
      pressMentions: refs.press,
      testimonials: refs.testimonials,
      stats: [
        { label: 'Dự án hoàn thành', value: '1000+' },
        { label: 'Năm kinh nghiệm', value: '15' },
        { label: 'Tỉnh thành phục vụ', value: '63' },
      ],
      seo: {
        metaTitle: 'Tân Cổ Điển Hoàng Kim – Kiến tạo biệt thự, dinh thự đậm dấu ấn gia chủ',
        metaDescription:
          'Công ty thiết kế kiến trúc tân cổ điển và thi công xây dựng chuyên nghiệp. 1000+ mẫu biệt thự đẳng cấp hoàng gia.',
      },
    } as any,
  });
  const requiredKeys = [
    'hero-1.jpg',
    'hero-2.jpg',
    'hero-3.jpg',
    'hero-4.jpg',
    'hero-5.jpg',
    'about-hero.jpg',
    'cta-bg.jpg',
  ];
  const missingMedia = requiredKeys.filter((k) => !refs.media[k]);
  if (missingMedia.length > 0) {
    p.logger.warn(`Skipping homepage hero/about/cta seed — missing media: ${missingMedia.join(', ')}`);
  } else {
    await p.updateGlobal({
      slug: 'homepage',
      data: {
        heroSlides: [
          {
            image: refs.media['hero-1.jpg'],
            heading: 'Tân Cổ Điển Hoàng Kim',
            subheading: 'Kiến tạo biệt thự, dinh thự và không gian sống đậm dấu ấn gia chủ.',
            ctaLabel: 'Tìm hiểu thêm',
            ctaUrl: '/ve-hoang-kim',
          },
          {
            image: refs.media['hero-2.jpg'],
            heading: 'Kiến trúc tân cổ điển dát vàng',
            subheading: 'Thiết kế theo phong cách châu Âu kết hợp tinh hoa Việt',
            ctaLabel: 'Xem thiết kế',
            ctaUrl: '/thiet-ke-biet-thu',
          },
          {
            image: refs.media['hero-3.jpg'],
            heading: 'Lâu đài Pháp cổ điển',
            subheading: 'Công trình đỉnh cao - 1000+ dự án đã bàn giao',
            ctaLabel: 'Xem dự án',
            ctaUrl: '/lau-dai-dinh-thu',
          },
          {
            image: refs.media['hero-4.jpg'],
            heading: 'Biệt thự hiện đại sang trọng',
            subheading: 'Thiết kế tối giản, tiện nghi, thẩm mỹ cao',
            ctaLabel: 'Tìm hiểu',
            ctaUrl: '/thiet-ke-biet-thu/biet-thu-hien-dai',
          },
          {
            image: refs.media['hero-5.jpg'],
            heading: 'Dinh thự đẳng cấp hoàng gia',
            subheading: 'Mỗi công trình một tác phẩm nghệ thuật',
            ctaLabel: 'Khám phá',
            ctaUrl: '/du-an',
          },
        ],
        aboutSnippet: {
          heading: 'Kiến tạo biệt thự, dinh thự và không gian sống đậm dấu ấn gia chủ',
          body: {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [
                {
                  type: 'paragraph',
                  format: '',
                  indent: 0,
                  version: 1,
                  direction: 'ltr',
                  children: [
                    {
                      type: 'text',
                      version: 1,
                      text: '15 năm kinh nghiệm trong lĩnh vực thiết kế kiến trúc tân cổ điển và thi công xây dựng, Tân Cổ Điển Hoàng Kim đã kiến tạo hàng nghìn không gian sống đẳng cấp hoàng gia trên khắp cả nước.',
                      format: 0,
                      detail: 0,
                      mode: 'normal',
                      style: '',
                    },
                  ],
                },
              ],
            },
          } as any,
          image: refs.media['about-hero.jpg'],
          ctaLabel: 'Về Hoàng Kim',
          ctaUrl: '/ve-hoang-kim',
        },
        ctaBlocks: [
          {
            heading: 'ĐĂNG KÝ NGAY ĐỂ NHẬN MẪU NHÀ MIỄN PHÍ',
            body: 'Gửi yêu cầu để đội ngũ tư vấn liên hệ trong 24 giờ',
            image: refs.media['cta-bg.jpg'],
            ctaLabel: 'Đăng ký ngay',
            ctaUrl: '/dang-ky-nhan-mau-nha',
          },
        ],
      } as any,
    });
  }
  await p.updateGlobal({ slug: 'promo-popup', data: { enabled: false, suppressHours: 24 } as any });

  // Plan C — featured videos + factory photos.
  // DEMO ONLY: youtubeId values below are public-archive placeholders;
  // replace with Hoàng Kim's actual YouTube videos via admin before deploy.
  const currentHp = (await p.findGlobal({ slug: 'homepage' })) as {
    featuredVideos?: unknown[];
    factoryPhotos?: unknown[];
  };
  const hpPatch: Record<string, unknown> = {};

  const currentVideos = currentHp.featuredVideos ?? [];
  const firstVideoThumb =
    currentVideos[0] && typeof currentVideos[0] === 'object'
      ? (currentVideos[0] as { thumbnail?: unknown }).thumbnail
      : null;
  const hasAkisaVideoRefs =
    currentVideos.length > 0 &&
    currentVideos.some((v) => {
      if (!v || typeof v !== 'object') return false;
      const id = (v as { youtubeId?: string }).youtubeId ?? '';
      return ['jfH46cHFino', 'yACEpA7-wZQ', 'ooSqeYwRCBI'].includes(id);
    });
  if (currentVideos.length === 0 || hasAkisaVideoRefs || !firstVideoThumb) {
    hpPatch.featuredVideos = [
      {
        youtubeId: 'zJOS0sV2a24',
        title: 'Biệt thự tân cổ điển — giới thiệu dự án Hoàng Kim (demo)',
        ...(refs.media['video-thumb-1.jpg']
          ? { thumbnail: refs.media['video-thumb-1.jpg'] }
          : {}),
      },
      {
        youtubeId: 'M_ZtUlq7Hxg',
        title: 'Nội thất tân cổ điển dát vàng — Hoàng Kim Studio (demo)',
        ...(refs.media['video-thumb-2.jpg']
          ? { thumbnail: refs.media['video-thumb-2.jpg'] }
          : {}),
      },
      {
        youtubeId: 'Y2VF8tmLFHw',
        title: 'Quy trình sản xuất nội thất tại xưởng Hoàng Kim (demo)',
        ...(refs.media['video-thumb-3.jpg']
          ? { thumbnail: refs.media['video-thumb-3.jpg'] }
          : {}),
      },
    ];
  }

  if (!currentHp.factoryPhotos || currentHp.factoryPhotos.length === 0) {
    const factoryFiles: Array<{ file: string; caption: string }> = [
      { file: 'nha-may-1.jpg', caption: 'Khu xẻ gỗ' },
      { file: 'nha-may-2.jpg', caption: 'Thợ mộc chế tác chi tiết' },
      { file: 'nha-may-3.jpg', caption: 'Khu lắp ráp khung' },
      { file: 'nha-may-4.jpg', caption: 'Nghệ nhân chạm trổ' },
      { file: 'nha-may-5.jpg', caption: 'Máy CNC gỗ chính xác' },
      { file: 'nha-may-6.jpg', caption: 'Công cụ thủ công cao cấp' },
      { file: 'nha-may-7.jpg', caption: 'Ráp nội thất cỡ lớn' },
      { file: 'nha-may-8.jpg', caption: 'Kho gỗ nguyên liệu' },
      { file: 'nha-may-9.jpg', caption: 'Chà nhám bề mặt' },
      { file: 'nha-may-10.jpg', caption: 'Máy tiện gỗ' },
      { file: 'nha-may-11.jpg', caption: 'Kho gỗ tự nhiên' },
      { file: 'nha-may-12.jpg', caption: 'Khu hoàn thiện sơn' },
    ];
    hpPatch.factoryPhotos = factoryFiles
      .filter((f) => refs.media[f.file])
      .map((f) => ({ photo: refs.media[f.file], caption: f.caption }));
  }

  if (Object.keys(hpPatch).length > 0) {
    await p.updateGlobal({ slug: 'homepage', data: hpPatch as never });
    p.logger.info(
      `homepage Plan C patched: videos=${hpPatch.featuredVideos ? 3 : 0}, factory=${
        Array.isArray(hpPatch.factoryPhotos) ? hpPatch.factoryPhotos.length : 0
      }`,
    );
  } else {
    p.logger.info('homepage Plan C: featuredVideos/factoryPhotos already populated, skip');
  }
}
