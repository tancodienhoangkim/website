import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getRelatedNews } from '../../lib/queries';
import { JsonLd } from '../seo/JsonLd';
import { SITE_URL, articleSchema, breadcrumbListSchema } from '../seo/schemas';
import { Breadcrumb } from './Breadcrumb';
import { NewsCard, type NewsCardItem } from './NewsCard';

type CategoryRef = { id: string | number; title?: string; slug?: string };

type NewsDoc = {
  id: string | number;
  title: string;
  slug?: string;
  excerpt?: string;
  body?: unknown;
  coverImage?: unknown;
  publishedAt?: string;
  category?: CategoryRef | string | number;
  author?: { name?: string; email?: string } | string | number;
};

function normalizeImage(img: unknown): { url: string; alt?: string } | null {
  if (!img || typeof img !== 'object') return null;
  const x = img as { url?: string; alt?: string };
  if (!x.url) return null;
  return { url: x.url, alt: x.alt };
}

function renderRichText(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const root = (body as { root?: unknown }).root;
  if (!root || typeof root !== 'object') return null;
  const children = (root as { children?: unknown[] }).children;
  if (!Array.isArray(children)) return null;
  const text = children
    .map((child) => {
      if (!child || typeof child !== 'object') return '';
      const c = child as { children?: Array<{ text?: string }> };
      return (c.children ?? []).map((t) => t.text ?? '').join('');
    })
    .filter(Boolean)
    .join('\n\n');
  return text || null;
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function NewsDetailPage({ slug }: { slug: string }) {
  const news = (await getNewsBySlug(slug)) as unknown as NewsDoc | null;
  if (!news) notFound();

  const cat = typeof news.category === 'object' ? (news.category as CategoryRef) : null;
  const relatedRaw = cat
    ? ((await getRelatedNews(cat.id, news.id, 3)) as unknown as NewsDoc[])
    : [];

  const cover = normalizeImage(news.coverImage);
  const bodyText = renderRichText(news.body);
  const authorName =
    typeof news.author === 'object' && news.author
      ? ((news.author as { name?: string; email?: string }).name ??
        (news.author as { email?: string }).email ??
        undefined)
      : undefined;

  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Tin tức', href: '/tin-tuc' },
  ];
  if (cat?.title && cat.slug) {
    breadcrumbItems.push({ label: cat.title, href: `/tin-tuc?cat=${cat.slug}` });
  }
  breadcrumbItems.push({ label: news.title });

  const related: NewsCardItem[] = relatedRaw
    .filter((r): r is NewsDoc => r !== null && typeof r === 'object')
    .map((r) => {
      const rCat = typeof r.category === 'object' ? (r.category as CategoryRef) : null;
      return {
        id: r.id,
        title: r.title ?? '',
        slug: r.slug ?? '',
        excerpt: r.excerpt,
        coverImage: normalizeImage(r.coverImage),
        publishedAt: r.publishedAt,
        categoryTitle: rCat?.title,
      };
    });

  return (
    <main id="main" className="nh-row home project-detail-page news-detail-page">
      <JsonLd data={breadcrumbListSchema(breadcrumbItems)} />
      <JsonLd
        data={articleSchema({
          headline: news.title,
          image: cover?.url,
          description: news.excerpt,
          datePublished: news.publishedAt,
          url: `${SITE_URL}/tin-tuc/${news.slug ?? ''}`,
        })}
      />
      <div className="container">
        <Breadcrumb items={breadcrumbItems} />

        {cover ? (
          <div className="project-detail-cover">
            <Image
              src={cover.url}
              alt={cover.alt ?? news.title}
              width={1600}
              height={900}
              priority
              sizes="(max-width:1199px) 100vw, 1200px"
            />
          </div>
        ) : null}

        <h1 className="project-detail-title">{news.title}</h1>

        <ul className="project-specs-row news-meta">
          {news.publishedAt ? (
            <li>
              <time dateTime={news.publishedAt}>{formatDate(news.publishedAt)}</time>
            </li>
          ) : null}
          {cat?.title ? <li>{cat.title}</li> : null}
          {authorName ? <li>{authorName}</li> : null}
        </ul>

        {news.excerpt ? (
          <p className="project-body" style={{ fontSize: '15px', fontStyle: 'italic' }}>
            {news.excerpt}
          </p>
        ) : null}

        {bodyText ? (
          <div className="project-body">
            {bodyText.split('\n\n').map((para) => (
              <p key={para.slice(0, 32)}>{para}</p>
            ))}
          </div>
        ) : null}

        {related.length > 0 ? (
          <section className="related-projects">
            <h2>Bài viết liên quan</h2>
            <div className="news-grid">
              {related.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        <aside className="detail-cta-banner">
          <h3>Cần tư vấn thiết kế?</h3>
          <p>Đội ngũ kiến trúc sư Hoàng Kim sẵn sàng tư vấn miễn phí trong 24h.</p>
          <Link href="/lien-he" className="btn">
            Liên hệ ngay
          </Link>
        </aside>
      </div>
    </main>
  );
}
