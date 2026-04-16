import { getPayload } from 'payload';
import { cache } from 'react';
import config from '../payload.config';

async function p() {
  return getPayload({ config });
}

export const getSiteSettings = cache(async () => {
  return (await p()).findGlobal({ slug: 'site-settings', overrideAccess: false });
});

export const getHeader = cache(async () => {
  return (await p()).findGlobal({ slug: 'header', depth: 2, overrideAccess: false });
});

export const getFooter = cache(async () => {
  return (await p()).findGlobal({ slug: 'footer', depth: 1, overrideAccess: false });
});

export const getHomepage = cache(async () => {
  return (await p()).findGlobal({ slug: 'homepage', depth: 2, overrideAccess: false });
});

export const getPressMentions = cache(async () => {
  const res = await (await p()).find({
    collection: 'press-mentions',
    sort: 'order',
    limit: 20,
    depth: 1,
    overrideAccess: false,
  });
  return res.docs;
});

export const getServices = cache(async (limit = 8) => {
  const res = await (await p()).find({
    collection: 'services',
    sort: 'order',
    limit,
    depth: 1,
    overrideAccess: false,
  });
  return res.docs;
});

export const getPartners = cache(async (limit = 12) => {
  const res = await (await p()).find({
    collection: 'partners',
    sort: 'order',
    limit,
    depth: 1,
    overrideAccess: false,
  });
  return res.docs;
});

export const getTestimonialsFeatured = cache(async (limit = 3) => {
  const res = await (await p()).find({
    collection: 'testimonials',
    sort: 'order',
    limit,
    depth: 1,
    overrideAccess: false,
  });
  return res.docs;
});

export const getProjectBySlug = cache(async (slug: string) => {
  const res = await (
    await p()
  ).find({
    collection: 'projects',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  });
  return res.docs[0] ?? null;
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const res = await (
    await p()
  ).find({
    collection: 'project-categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  });
  return res.docs[0] ?? null;
});

export const getProjectsByCategoryIds = cache(
  async (categoryIds: Array<string | number>, page = 1, limit = 12) => {
    const res = await (
      await p()
    ).find({
      collection: 'projects',
      where: {
        and: [
          { status: { equals: 'published' } },
          { category: { in: categoryIds } },
        ],
      },
      sort: '-updatedAt',
      limit,
      page,
      depth: 1,
      overrideAccess: false,
    });
    return res;
  },
);

export const getRelatedProjects = cache(
  async (rootCategoryId: string | number, excludeId: string | number, limit = 3) => {
    const payload = await p();
    const childrenRes = await payload.find({
      collection: 'project-categories',
      where: { parent: { equals: rootCategoryId } },
      limit: 50,
      depth: 0,
      overrideAccess: false,
    });
    const categoryIds = [rootCategoryId, ...childrenRes.docs.map((c) => c.id)];
    const res = await payload.find({
      collection: 'projects',
      where: {
        and: [
          { status: { equals: 'published' } },
          { category: { in: categoryIds } },
          { id: { not_equals: excludeId } },
        ],
      },
      sort: '-updatedAt',
      limit,
      depth: 1,
      overrideAccess: false,
    });
    return res.docs;
  },
);

export const getPromoPopup = cache(async () => {
  return (await p()).findGlobal({ slug: 'promo-popup', depth: 1, overrideAccess: false });
});

export const getServiceBySlug = cache(async (slug: string) => {
  const res = await (
    await p()
  ).find({
    collection: 'services',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  });
  return res.docs[0] ?? null;
});

export const getRelatedServices = cache(
  async (excludeId: string | number, limit = 3) => {
    const res = await (
      await p()
    ).find({
      collection: 'services',
      where: { id: { not_equals: excludeId } },
      sort: 'order',
      limit,
      depth: 1,
      overrideAccess: false,
    });
    return res.docs;
  },
);

export const getNewsCategories = cache(async () => {
  const res = await (
    await p()
  ).find({
    collection: 'news-categories',
    sort: 'title',
    limit: 50,
    depth: 0,
    overrideAccess: false,
  });
  return res.docs;
});

export const getNewsBySlug = cache(async (slug: string) => {
  const res = await (
    await p()
  ).find({
    collection: 'news',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  });
  return res.docs[0] ?? null;
});

export const getNewsList = cache(
  async (catSlug: string | undefined, page = 1, limit = 12) => {
    const payload = await p();
    let catId: string | number | null = null;
    if (catSlug) {
      const cat = await payload.find({
        collection: 'news-categories',
        where: { slug: { equals: catSlug } },
        limit: 1,
        depth: 0,
        overrideAccess: false,
      });
      catId = cat.docs[0]?.id ?? null;
      if (!catId) return { docs: [], totalDocs: 0, totalPages: 0, page: 1 };
    }
    const whereClauses: Array<Record<string, unknown>> = [
      { status: { equals: 'published' } },
    ];
    if (catId) whereClauses.push({ category: { equals: catId } });
    const res = await payload.find({
      collection: 'news',
      where: { and: whereClauses } as never,
      sort: '-publishedAt',
      limit,
      page,
      depth: 1,
      overrideAccess: false,
    });
    return res;
  },
);

export const getRelatedNews = cache(
  async (categoryId: string | number, excludeId: string | number, limit = 3) => {
    const res = await (
      await p()
    ).find({
      collection: 'news',
      where: {
        and: [
          { status: { equals: 'published' } },
          { category: { equals: categoryId } },
          { id: { not_equals: excludeId } },
        ],
      },
      sort: '-publishedAt',
      limit,
      depth: 1,
      overrideAccess: false,
    });
    return res.docs;
  },
);

export const getProjectsByRootCategory = cache(async (rootSlug: string, limit = 4) => {
  const payload = await p();
  const rootRes = await payload.find({
    collection: 'project-categories',
    where: { slug: { equals: rootSlug } },
    limit: 1,
    depth: 0,
    overrideAccess: false,
  });
  const root = rootRes.docs[0];
  if (!root) return { root: null, children: [], projects: [] };

  const childrenRes = await payload.find({
    collection: 'project-categories',
    where: { parent: { equals: root.id } },
    limit: 50,
    sort: 'order',
    depth: 0,
    overrideAccess: false,
  });
  const children = childrenRes.docs;
  const categoryIds = [root.id, ...children.map((c) => c.id)];

  const projRes = await payload.find({
    collection: 'projects',
    where: {
      and: [{ status: { equals: 'published' } }, { category: { in: categoryIds } }],
    },
    sort: '-updatedAt',
    limit,
    depth: 1,
    overrideAccess: false,
  });

  return { root, children, projects: projRes.docs };
});
