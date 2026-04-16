import Link from 'next/link';

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

function hrefFor(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

function buildPages(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'ellipsis', total];
  if (current >= total - 3)
    return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

export function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (!totalPages || totalPages <= 1) return null;
  const pages = buildPages(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  return (
    <nav aria-label="Phân trang" className="pagination">
      {hasPrev ? (
        <Link href={hrefFor(basePath, currentPage - 1)} rel="prev" aria-label="Trang trước">
          ‹
        </Link>
      ) : (
        <span aria-hidden="true" className="disabled">
          ‹
        </span>
      )}
      {pages.map((p, idx) => {
        const slotKey = p === 'ellipsis' ? `e-${idx}-of-${pages.length}` : `p-${p}`;
        if (p === 'ellipsis') {
          return (
            <span key={slotKey} className="ellipsis" aria-hidden="true">
              …
            </span>
          );
        }
        if (p === currentPage) {
          return (
            <span key={slotKey} className="active" aria-current="page">
              {p}
            </span>
          );
        }
        return (
          <Link key={slotKey} href={hrefFor(basePath, p)} aria-label={`Trang ${p}`}>
            {p}
          </Link>
        );
      })}
      {hasNext ? (
        <Link href={hrefFor(basePath, currentPage + 1)} rel="next" aria-label="Trang sau">
          ›
        </Link>
      ) : (
        <span aria-hidden="true" className="disabled">
          ›
        </span>
      )}
    </nav>
  );
}
