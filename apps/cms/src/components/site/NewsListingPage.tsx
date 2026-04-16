import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsCategories, getNewsList } from '../../lib/queries';
import { JsonLd } from '../seo/JsonLd';
import { breadcrumbListSchema } from '../seo/schemas';
import { Breadcrumb } from './Breadcrumb';
import { type CategoryChip, CategoryChips } from './CategoryChips';
import { NewsCard, type NewsCardItem } from './NewsCard';
import { Pagination } from './Pagination';

const PAGE_SIZE = 12;

type CategoryDoc = { id: string | number; title: string; slug: string };

function normalizeImage(img: unknown): { url: string; alt?: string } | null {
  if (!img || typeof img !== 'object') return null;
  const x = img as { url?: string; alt?: string };
  if (!x.url) return null;
  return { url: x.url, alt: x.alt };
}

function normalizeNews(docs: unknown[]): NewsCardItem[] {
  return docs
    .filter((d): d is Record<string, unknown> => d !== null && typeof d === 'object')
    .map((d) => {
      const categoryField = d.category;
      const categoryTitle =
        categoryField && typeof categoryField === 'object'
          ? ((categoryField as { title?: string }).title ?? undefined)
          : undefined;
      return {
        id: d.id as string | number,
        title: (d.title as string) ?? '',
        slug: (d.slug as string) ?? '',
        excerpt: (d.excerpt as string | undefined) ?? undefined,
        coverImage: normalizeImage(d.coverImage),
        publishedAt: (d.publishedAt as string | undefined) ?? undefined,
        categoryTitle,
      };
    });
}

type Props = {
  catSlug?: string;
  page?: number;
};

export async function NewsListingPage({ catSlug, page = 1 }: Props) {
  const categories = (await getNewsCategories()) as unknown as CategoryDoc[];
  const currentCat = catSlug ? (categories.find((c) => c.slug === catSlug) ?? null) : null;
  if (catSlug && !currentCat) notFound();

  const res = await getNewsList(catSlug, page, PAGE_SIZE);
  const totalPages = res.totalPages ?? 1;
  if (page > 1 && page > totalPages) notFound();

  const chips: CategoryChip[] = [
    { label: 'Tất cả', href: '/tin-tuc', active: !currentCat },
    ...categories.map((c) => ({
      label: c.title,
      href: `/tin-tuc?cat=${c.slug}`,
      active: currentCat?.id === c.id,
    })),
  ];

  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Tin tức', href: currentCat ? '/tin-tuc' : undefined },
  ];
  if (currentCat) breadcrumbItems.push({ label: currentCat.title });

  const news = normalizeNews(res.docs);

  return (
    <main id="main" className="nh-row home listing-page">
      <JsonLd data={breadcrumbListSchema(breadcrumbItems)} />
      <div className="container">
        <Breadcrumb items={breadcrumbItems} />
        <header className="listing-header">
          <h1>{currentCat ? currentCat.title : 'Tin tức'}</h1>
          <p className="listing-description">
            {currentCat
              ? `Các bài viết mới nhất về ${currentCat.title.toLowerCase()}.`
              : 'Cập nhật tin tức, hoạt động và kinh nghiệm từ Tân cổ điển Hoàng Kim.'}
          </p>
        </header>
        <CategoryChips chips={chips} ariaLabel="Chuyên mục" />
        {news.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>
            Chưa có bài viết nào trong chuyên mục này.
          </p>
        ) : (
          <div className="news-grid">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
        <NewsPagination currentPage={page} totalPages={totalPages} catSlug={catSlug} />
      </div>
    </main>
  );
}

// Custom pagination that handles ?cat= + &page= correctly.
function NewsPagination({
  currentPage,
  totalPages,
  catSlug,
}: {
  currentPage: number;
  totalPages: number;
  catSlug?: string;
}) {
  if (!totalPages || totalPages <= 1) return null;
  const basePath = catSlug ? `/tin-tuc?cat=${catSlug}` : '/tin-tuc';
  // Build fake Pagination base that Pagination.tsx will append ?page= to.
  // Since Pagination uses ?page, it won't handle & chain. So we override here.
  return <Pagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />;
}

export async function generateNewsListingMetadata(
  searchParams: Promise<{ cat?: string; page?: string }>,
): Promise<Metadata> {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const catSlug = sp.cat;
  const categories = (await getNewsCategories()) as unknown as CategoryDoc[];
  const cat = catSlug ? (categories.find((c) => c.slug === catSlug) ?? null) : null;
  const baseTitle = cat
    ? `${cat.title} | Tin tức | Tân Cổ Điển Hoàng Kim`
    : 'Tin tức | Tân Cổ Điển Hoàng Kim';
  const title = page > 1 ? `${baseTitle} — Trang ${page}` : baseTitle;
  const canonical =
    (cat ? `/tin-tuc?cat=${cat.slug}` : '/tin-tuc') + (page > 1 ? `&page=${page}` : '');
  return {
    title,
    description:
      'Tin tức kiến trúc, hoạt động Hoàng Kim và kinh nghiệm xây dựng biệt thự tân cổ điển.',
    alternates: { canonical },
  };
}
