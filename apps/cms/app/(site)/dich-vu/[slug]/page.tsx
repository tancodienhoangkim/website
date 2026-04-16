import type { Metadata } from 'next';
import { getPayload } from 'payload';
import { ServiceDetailPage } from '../../../../src/components/site/ServiceDetailPage';
import { getServiceBySlug } from '../../../../src/lib/queries';
import config from '../../../../src/payload.config';

export const revalidate = 3600;

type ServiceDoc = {
  title?: string;
  summary?: string;
  coverImage?: { url?: string } | string | number;
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } };
};

function extractOg(img: unknown): string | undefined {
  if (!img || typeof img !== 'object') return undefined;
  return (img as { url?: string }).url;
}

export const dynamicParams = true;
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: 'services',
    limit: 50,
    depth: 0,
    overrideAccess: false,
  });
  return res.docs
    .map((d) => (d as { slug?: string }).slug)
    .filter((s): s is string => typeof s === 'string' && s.length > 0)
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const svc = (await getServiceBySlug(slug)) as unknown as ServiceDoc | null;
  if (!svc) return { title: 'Không tìm thấy dịch vụ' };
  const seo = svc.seo ?? {};
  const title = seo.metaTitle || `${svc.title} | Tân Cổ Điển Hoàng Kim`;
  const description = seo.metaDescription || svc.summary;
  const ogImage = seo.ogImage?.url || extractOg(svc.coverImage);
  return {
    title,
    description,
    alternates: { canonical: `/dich-vu/${slug}` },
    openGraph: ogImage ? { images: [{ url: ogImage }] } : undefined,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ServiceDetailPage slug={slug} />;
}
