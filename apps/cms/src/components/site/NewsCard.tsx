import Image from 'next/image';
import Link from 'next/link';

export type NewsCardItem = {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage: { url: string; alt?: string } | null;
  publishedAt?: string;
  categoryTitle?: string;
};

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function NewsCard({ item }: { item: NewsCardItem }) {
  const dateStr = formatDate(item.publishedAt);
  return (
    <article className="news-card">
      <Link href={`/tin-tuc/${item.slug}`} className="news-card-link">
        <div className="news-card-cover">
          {item.coverImage?.url ? (
            <Image
              src={item.coverImage.url}
              alt={item.coverImage.alt ?? item.title}
              width={600}
              height={400}
              sizes="(max-width:767px) 100vw, (max-width:991px) 50vw, 33vw"
            />
          ) : null}
        </div>
        <div className="news-card-body">
          <div className="news-card-meta">
            {dateStr ? <time dateTime={item.publishedAt}>{dateStr}</time> : null}
            {item.categoryTitle ? <span>·</span> : null}
            {item.categoryTitle ? <span>{item.categoryTitle}</span> : null}
          </div>
          <h3 className="news-card-title">{item.title}</h3>
          {item.excerpt ? <p className="news-card-excerpt">{item.excerpt}</p> : null}
        </div>
      </Link>
    </article>
  );
}
