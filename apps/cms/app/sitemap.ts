import type { MetadataRoute } from 'next';
import { getPayload } from 'payload';
import config from '../src/payload.config';
import { SITE_URL } from '../src/components/seo/schemas';

const URL_PREFIX: Record<string, string> = {
  'biet-thu': '/thiet-ke-biet-thu',
  'lau-dai-dinh-thu': '/lau-dai-dinh-thu',
  'noi-that': '/thiet-ke-noi-that',
  'thi-cong': '/thi-cong',
  'tru-so-khach-san': '/thiet-ke-tru-so-khach-san',
};

type Doc = Record<string, unknown>;

function getSlug(d: Doc): string | undefined {
  return typeof d.slug === 'string' ? d.slug : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/dich-vu',
    '/tin-tuc',
    '/thiet-ke-biet-thu',
    '/lau-dai-dinh-thu',
    '/thiet-ke-noi-that',
    '/thi-cong',
    '/thiet-ke-tru-so-khach-san',
  ].map((path) => ({
    url: `${SITE_URL}${path || '/'}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const [projectsRes, newsRes, servicesRes, catsRes] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: { status: { equals: 'published' } },
      limit: 500,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'news',
      where: { status: { equals: 'published' } },
      limit: 500,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'services',
      limit: 100,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'project-categories',
      limit: 200,
      depth: 1,
      overrideAccess: false,
    }),
  ]);

  const projectRoutes: MetadataRoute.Sitemap = projectsRes.docs
    .map((d) => {
      const slug = getSlug(d as Doc);
      if (!slug) return null;
      const updatedAt = (d as Doc).updatedAt;
      return {
        url: `${SITE_URL}/du-an/${slug}`,
        lastModified: typeof updatedAt === 'string' ? new Date(updatedAt) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const newsRoutes: MetadataRoute.Sitemap = newsRes.docs
    .map((d) => {
      const slug = getSlug(d as Doc);
      if (!slug) return null;
      const publishedAt = (d as Doc).publishedAt;
      return {
        url: `${SITE_URL}/tin-tuc/${slug}`,
        lastModified: typeof publishedAt === 'string' ? new Date(publishedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const serviceRoutes: MetadataRoute.Sitemap = servicesRes.docs
    .map((d) => {
      const slug = getSlug(d as Doc);
      if (!slug) return null;
      return {
        url: `${SITE_URL}/dich-vu/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const categoryRoutes: MetadataRoute.Sitemap = catsRes.docs
    .map((c) => {
      const child = c as Doc;
      const childSlug = getSlug(child);
      const parent = child.parent;
      if (!childSlug || !parent || typeof parent !== 'object') return null;
      const parentSlug = (parent as Doc).slug;
      if (typeof parentSlug !== 'string') return null;
      const prefix = URL_PREFIX[parentSlug];
      if (!prefix) return null;
      return {
        url: `${SITE_URL}${prefix}/${childSlug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...projectRoutes,
    ...newsRoutes,
    ...serviceRoutes,
  ];
}
