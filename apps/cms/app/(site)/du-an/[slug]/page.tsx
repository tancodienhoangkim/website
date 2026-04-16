import type { Metadata } from 'next';
import { getPayload } from 'payload';
import { ProjectDetailPage } from '../../../../src/components/site/ProjectDetailPage';
import { getProjectBySlug } from '../../../../src/lib/queries';
import config from '../../../../src/payload.config';

export const revalidate = 3600;

type ProjectDoc = {
  title?: string;
  summary?: string;
  coverImage?: { url?: string } | string | number;
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } };
};

function extractOgImage(img: unknown): string | undefined {
  if (!img || typeof img !== 'object') return undefined;
  const x = img as { url?: string };
  return x.url;
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: 'projects',
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
  const proj = (await getProjectBySlug(slug)) as unknown as ProjectDoc | null;
  if (!proj) return { title: 'Không tìm thấy dự án' };
  const seo = proj.seo ?? {};
  const title = seo.metaTitle || `${proj.title} | Tân Cổ Điển Hoàng Kim`;
  const description = seo.metaDescription || proj.summary;
  const ogImage = seo.ogImage?.url || extractOgImage(proj.coverImage);
  return {
    title,
    description,
    alternates: { canonical: `/du-an/${slug}` },
    openGraph: ogImage ? { images: [{ url: ogImage }] } : undefined,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProjectDetailPage slug={slug} />;
}
