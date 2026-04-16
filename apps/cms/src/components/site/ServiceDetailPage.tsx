import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRelatedServices, getServiceBySlug } from '../../lib/queries';
import { JsonLd } from '../seo/JsonLd';
import { SITE_URL, breadcrumbListSchema, serviceSchema } from '../seo/schemas';
import { Breadcrumb } from './Breadcrumb';
import { ServicesGrid, type ServiceItem } from './ServicesGrid';

type ServiceDoc = {
  id: string | number;
  title: string;
  slug?: string;
  summary?: string;
  body?: unknown;
  coverImage?: unknown;
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

export async function ServiceDetailPage({ slug }: { slug: string }) {
  const svc = (await getServiceBySlug(slug)) as unknown as ServiceDoc | null;
  if (!svc) notFound();

  const relatedRaw = (await getRelatedServices(svc.id, 3)) as unknown as ServiceDoc[];
  const related: ServiceItem[] = relatedRaw.map((r) => ({
    id: r.id,
    title: r.title ?? '',
    slug: r.slug ?? '',
    summary: r.summary,
    coverImage: normalizeImage(r.coverImage),
  }));

  const cover = normalizeImage(svc.coverImage);
  const bodyText = renderRichText(svc.body);

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Dịch vụ', href: '/dich-vu' },
    { label: svc.title },
  ];

  return (
    <main id="main" className="nh-row home project-detail-page service-detail-page">
      <JsonLd data={breadcrumbListSchema(breadcrumbItems)} />
      <JsonLd
        data={serviceSchema({
          name: svc.title,
          description: svc.summary,
          image: cover?.url,
          url: `${SITE_URL}/dich-vu/${svc.slug ?? ''}`,
        })}
      />
      <div className="container">
        <Breadcrumb items={breadcrumbItems} />

        {cover ? (
          <div className="project-detail-cover">
            <Image
              src={cover.url}
              alt={cover.alt ?? svc.title}
              width={1600}
              height={900}
              priority
              sizes="(max-width:1199px) 100vw, 1200px"
            />
          </div>
        ) : null}

        <h1 className="project-detail-title">{svc.title}</h1>

        {svc.summary ? (
          <p className="project-body" style={{ fontSize: '15px', fontStyle: 'italic' }}>
            {svc.summary}
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
            <h2>Dịch vụ khác</h2>
            <ServicesGrid services={related} />
          </section>
        ) : null}

        <aside className="detail-cta-banner">
          <h3>Liên hệ tư vấn miễn phí</h3>
          <p>Đội ngũ Hoàng Kim sẵn sàng tư vấn về dịch vụ này trong 24h.</p>
          <Link href="/lien-he" className="btn">
            Đăng ký ngay
          </Link>
        </aside>
      </div>
    </main>
  );
}
