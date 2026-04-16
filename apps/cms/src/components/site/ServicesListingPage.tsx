import type { Metadata } from 'next';
import { getServices } from '../../lib/queries';
import { Breadcrumb } from './Breadcrumb';
import { ServicesGrid, type ServiceItem } from './ServicesGrid';

function normalizeImage(img: unknown): { url: string; alt?: string } | null {
  if (!img || typeof img !== 'object') return null;
  const x = img as { url?: string; alt?: string };
  if (!x.url) return null;
  return { url: x.url, alt: x.alt };
}

export async function ServicesListingPage() {
  const docs = await getServices(12);
  const services: ServiceItem[] = docs
    .filter((d) => d !== null && typeof d === 'object')
    .map((doc) => {
      const d = doc as unknown as Record<string, unknown>;
      return {
        id: d.id as string | number,
        title: (d.title as string) ?? '',
        slug: (d.slug as string) ?? '',
        summary: (d.summary as string | undefined) ?? undefined,
        coverImage: normalizeImage(d.coverImage),
      };
    });

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Dịch vụ' },
  ];

  return (
    <main id="main" className="nh-row home listing-page services-listing-page">
      <div className="container">
        <Breadcrumb items={breadcrumbItems} />
        <header className="listing-header">
          <h1>Dịch vụ của Hoàng Kim</h1>
          <p className="listing-description">
            Giải pháp tân cổ điển trọn gói từ thiết kế kiến trúc đến thi công và sản xuất nội
            thất.
          </p>
        </header>
        <ServicesGrid services={services} />
      </div>
    </main>
  );
}

export function generateServicesListingMetadata(): Metadata {
  return {
    title: 'Dịch vụ | Tân Cổ Điển Hoàng Kim',
    description:
      'Dịch vụ kiến trúc, thi công, nội thất trọn gói từ Tân Cổ Điển Hoàng Kim — đơn vị thiết kế biệt thự tân cổ điển hàng đầu Việt Nam.',
    alternates: { canonical: '/dich-vu' },
  };
}
