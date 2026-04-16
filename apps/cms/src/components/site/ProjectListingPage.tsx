import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import { getCategoryBySlug, getProjectsByCategoryIds } from '../../lib/queries';
import config from '../../payload.config';
import { JsonLd } from '../seo/JsonLd';
import { breadcrumbListSchema } from '../seo/schemas';
import { Breadcrumb } from './Breadcrumb';
import { type CategoryChip, CategoryChips } from './CategoryChips';
import { Pagination } from './Pagination';
import { ProjectCardGrid } from './RelatedProjects';

export const URL_PREFIX: Record<string, string> = {
  'biet-thu': '/thiet-ke-biet-thu',
  'lau-dai-dinh-thu': '/lau-dai-dinh-thu',
  'noi-that': '/thiet-ke-noi-that',
  'thi-cong': '/thi-cong',
  'tru-so-khach-san': '/thiet-ke-tru-so-khach-san',
};

const PAGE_SIZE = 12;

type CategoryDoc = {
  id: string | number;
  slug: string;
  title: string;
  description?: string;
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } };
};

async function findChildrenOf(rootId: string | number): Promise<CategoryDoc[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: 'project-categories',
    where: { parent: { equals: rootId } },
    limit: 50,
    sort: 'order',
    depth: 0,
    overrideAccess: false,
  });
  return res.docs as unknown as CategoryDoc[];
}

function normalizeImage(img: unknown): { url: string; alt?: string } | null {
  if (!img || typeof img !== 'object') return null;
  const x = img as { url?: string; alt?: string };
  if (!x.url) return null;
  return { url: x.url, alt: x.alt };
}

type ListingProps = {
  rootSlug: string;
  cat?: string[];
  page?: number;
};

export async function ProjectListingPage({ rootSlug, cat, page = 1 }: ListingProps) {
  if (cat && cat.length > 1) notFound();

  const rootCat = (await getCategoryBySlug(rootSlug)) as unknown as CategoryDoc | null;
  if (!rootCat) notFound();

  let childCat: CategoryDoc | null = null;
  if (cat?.[0]) {
    childCat = (await getCategoryBySlug(cat[0])) as unknown as CategoryDoc | null;
    if (!childCat) notFound();
    const parentId = ((
      childCat as unknown as { parent?: { id: string | number } | string | number }
    ).parent ?? null) as unknown;
    const parentIdValue =
      parentId && typeof parentId === 'object'
        ? (parentId as { id: string | number }).id
        : (parentId as string | number | null);
    if (parentIdValue !== rootCat.id) notFound();
  }

  const current = childCat ?? rootCat;
  const children = await findChildrenOf(rootCat.id);
  const categoryIds: Array<string | number> = childCat
    ? [childCat.id]
    : [rootCat.id, ...children.map((c) => c.id)];

  const projectsRes = await getProjectsByCategoryIds(categoryIds, page, PAGE_SIZE);
  const prefix = URL_PREFIX[rootSlug] ?? `/${rootSlug}`;
  const basePath = childCat ? `${prefix}/${childCat.slug}` : prefix;

  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: 'Trang chủ', href: '/' },
    { label: rootCat.title, href: childCat ? prefix : undefined },
  ];
  if (childCat) breadcrumbItems.push({ label: childCat.title });

  const chips: CategoryChip[] = [
    { label: 'Tất cả', href: prefix, active: !childCat },
    ...children.map((c) => ({
      label: c.title,
      href: `${prefix}/${c.slug}`,
      active: childCat?.id === c.id,
    })),
  ];

  const totalPages = projectsRes.totalPages ?? 1;
  if (page > 1 && page > totalPages) notFound();

  return (
    <main id="main" className="nh-row home listing-page">
      <JsonLd data={breadcrumbListSchema(breadcrumbItems)} />
      <div className="container">
        <Breadcrumb items={breadcrumbItems} />
        <header className="listing-header">
          <h1>{current.title}</h1>
          {current.description ? (
            <p className="listing-description">{current.description}</p>
          ) : null}
        </header>
        <CategoryChips chips={chips} ariaLabel="Phân loại" />
        {projectsRes.docs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>
            Chưa có dự án trong danh mục này.
          </p>
        ) : (
          <ProjectCardGrid
            items={projectsRes.docs
              .filter((d) => d && typeof d === 'object')
              .map((d) => {
                const x = d as unknown as {
                  id: string | number;
                  title?: string;
                  slug?: string;
                  coverImage?: unknown;
                  specs?: {
                    area?: number;
                    floors?: number;
                    location?: string;
                    year?: number;
                    style?: string;
                  };
                };
                return {
                  id: x.id,
                  title: x.title ?? '',
                  slug: x.slug ?? '',
                  coverImage: normalizeImage(x.coverImage),
                  specs: x.specs,
                };
              })}
          />
        )}
        <Pagination currentPage={page} totalPages={totalPages} basePath={basePath} />
      </div>
    </main>
  );
}

export function generateListingMetadata(rootSlug: string) {
  return async ({
    params,
    searchParams,
  }: {
    params: Promise<{ cat?: string[] }>;
    searchParams: Promise<{ page?: string }>;
  }): Promise<Metadata> => {
    const { cat } = await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;

    const rootCat = (await getCategoryBySlug(rootSlug)) as unknown as CategoryDoc | null;
    if (!rootCat) return { title: 'Không tìm thấy danh mục' };
    const childCat = cat?.[0]
      ? ((await getCategoryBySlug(cat[0])) as unknown as CategoryDoc | null)
      : null;
    const current = childCat ?? rootCat;

    const seo = current.seo ?? {};
    const baseTitle = seo.metaTitle || `${current.title} | Tân Cổ Điển Hoàng Kim`;
    const title = page > 1 ? `${baseTitle} — Trang ${page}` : baseTitle;
    const description = seo.metaDescription || current.description;

    const prefix = URL_PREFIX[rootSlug] ?? `/${rootSlug}`;
    const canonical =
      (childCat ? `${prefix}/${childCat.slug}` : prefix) + (page > 1 ? `?page=${page}` : '');

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: seo.ogImage?.url ? { images: [{ url: seo.ogImage.url }] } : undefined,
    };
  };
}

export function generateListingStaticParams(rootSlug: string) {
  return async (): Promise<Array<{ cat: string[] }>> => {
    const rootCat = (await getCategoryBySlug(rootSlug)) as unknown as CategoryDoc | null;
    if (!rootCat) return [{ cat: [] }];
    const children = await findChildrenOf(rootCat.id);
    return [{ cat: [] }, ...children.map((c) => ({ cat: [c.slug] }))];
  };
}
