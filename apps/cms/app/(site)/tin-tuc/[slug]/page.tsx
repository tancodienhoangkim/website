import type { Metadata } from 'next';
import { getPayload } from 'payload';
import { NewsDetailPage } from '../../../../src/components/site/NewsDetailPage';
import { getNewsBySlug } from '../../../../src/lib/queries';
import config from '../../../../src/payload.config';

export const revalidate = 3600;

type NewsDoc = {
  title?: string;
  excerpt?: string;
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
    collection: 'news',
    where: { status: { equals: 'published' } },
    limit: 200,
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
  const news = (await getNewsBySlug(slug)) as unknown as NewsDoc | null;
  if (!news) return { title: 'Không tìm thấy bài viết' };
  const seo = news.seo ?? {};
  const title = seo.metaTitle || `${news.title} | Tân Cổ Điển Hoàng Kim`;
  const description = seo.metaDescription || news.excerpt;
  const ogImage = seo.ogImage?.url || extractOg(news.coverImage);
  return {
    title,
    description,
    alternates: { canonical: `/tin-tuc/${slug}` },
    openGraph: ogImage ? { images: [{ url: ogImage }] } : undefined,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <NewsDetailPage slug={slug} />;
}
