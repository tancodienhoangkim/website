import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectBySlug, getRelatedProjects } from '../../lib/queries';
import { JsonLd } from '../seo/JsonLd';
import {
  SITE_URL,
  breadcrumbListSchema,
  creativeWorkSchema,
} from '../seo/schemas';
import { Breadcrumb } from './Breadcrumb';
import { type GalleryImage, ProjectGallery } from './ProjectGallery';
import { URL_PREFIX } from './ProjectListingPage';
import { RelatedProjects } from './RelatedProjects';

type CategoryRef = {
  id: string | number;
  title?: string;
  slug?: string;
  parent?: unknown;
};

type ProjectDoc = {
  id: string | number;
  title: string;
  slug?: string;
  summary?: string;
  body?: unknown;
  category?: CategoryRef | string | number;
  coverImage?: { url?: string; alt?: string } | string | number;
  gallery?: Array<{ image?: { url?: string; alt?: string }; caption?: string }>;
  specs?: {
    location?: string;
    area?: number;
    floors?: number;
    year?: number;
    style?: string;
  };
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

export async function ProjectDetailPage({ slug }: { slug: string }) {
  const proj = (await getProjectBySlug(slug)) as unknown as ProjectDoc | null;
  if (!proj) notFound();

  const cat = typeof proj.category === 'object' ? (proj.category as CategoryRef) : null;
  const rootCatRef =
    cat?.parent && typeof cat.parent === 'object' ? (cat.parent as CategoryRef) : (cat ?? null);
  const rootCatId = rootCatRef?.id ?? null;

  const relatedRaw = rootCatId
    ? ((await getRelatedProjects(rootCatId, proj.id, 3)) as unknown as ProjectDoc[])
    : [];

  const cover = normalizeImage(proj.coverImage);
  const galleryImages: GalleryImage[] = (proj.gallery ?? [])
    .map((g) => normalizeImage(g?.image))
    .filter((x): x is GalleryImage => x !== null);

  const bodyText = renderRichText(proj.body);

  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: 'Trang chủ', href: '/' },
  ];
  if (rootCatRef?.title && rootCatRef.slug) {
    const rootPrefix = URL_PREFIX[rootCatRef.slug] ?? `/${rootCatRef.slug}`;
    breadcrumbItems.push({ label: rootCatRef.title, href: rootPrefix });
  }
  if (cat && cat !== rootCatRef && cat.title && cat.slug && rootCatRef?.slug) {
    const rootPrefix = URL_PREFIX[rootCatRef.slug] ?? `/${rootCatRef.slug}`;
    breadcrumbItems.push({ label: cat.title, href: `${rootPrefix}/${cat.slug}` });
  }
  breadcrumbItems.push({ label: proj.title });

  const specs = proj.specs ?? {};
  const specPills = [
    specs.area ? `${specs.area}m²` : null,
    specs.floors ? `${specs.floors} tầng` : null,
    specs.location ?? null,
    specs.year ? `Năm ${specs.year}` : null,
    specs.style ?? null,
  ].filter(Boolean) as string[];

  const related = relatedRaw
    .filter((r) => r && typeof r === 'object')
    .map((r) => ({
      id: r.id,
      title: r.title ?? '',
      slug: r.slug ?? '',
      coverImage: normalizeImage(r.coverImage),
      specs: r.specs,
    }));

  return (
    <main id="main" className="nh-row home project-detail-page">
      <JsonLd data={breadcrumbListSchema(breadcrumbItems)} />
      <JsonLd
        data={creativeWorkSchema({
          name: proj.title,
          description: proj.summary,
          image: cover?.url,
          url: `${SITE_URL}/du-an/${proj.slug ?? ''}`,
        })}
      />
      <div className="container">
        <Breadcrumb items={breadcrumbItems} />

        {cover ? (
          <div className="project-detail-cover">
            <Image
              src={cover.url}
              alt={cover.alt ?? proj.title}
              width={1600}
              height={900}
              priority
              sizes="(max-width:1199px) 100vw, 1200px"
            />
          </div>
        ) : null}

        <h1 className="project-detail-title">{proj.title}</h1>

        {specPills.length > 0 ? (
          <ul className="project-specs-row">
            {specPills.map((pill) => (
              <li key={pill}>{pill}</li>
            ))}
          </ul>
        ) : null}

        {proj.summary ? (
          <p className="project-body" style={{ fontSize: '15px' }}>
            {proj.summary}
          </p>
        ) : null}

        {bodyText ? (
          <div className="project-body">
            {bodyText.split('\n\n').map((para) => (
              <p key={para.slice(0, 32)}>{para}</p>
            ))}
          </div>
        ) : null}

        {galleryImages.length > 0 ? <ProjectGallery images={galleryImages} /> : null}

        {related.length > 0 ? <RelatedProjects items={related} /> : null}

        <aside className="detail-cta-banner">
          <h3>Liên hệ tư vấn miễn phí</h3>
          <p>Gọi 0971.199.817 hoặc đăng ký để đội ngũ kiến trúc sư Hoàng Kim liên hệ trong 24h.</p>
          <Link href="/lien-he" className="btn">
            Đăng ký ngay
          </Link>
        </aside>
      </div>
    </main>
  );
}
