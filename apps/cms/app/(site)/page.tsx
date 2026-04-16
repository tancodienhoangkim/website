import type { Metadata } from 'next';
import { AboutSlogan } from '../../src/components/site/AboutSlogan';
import { FactoryCarousel, type FactoryPhotoItem } from '../../src/components/site/FactoryCarousel';
import { Hero } from '../../src/components/site/Hero';
import { LeadCaptureBanner } from '../../src/components/site/LeadCaptureBanner';
import { PartnersCarousel } from '../../src/components/site/PartnersCarousel';
import { PressMentionsCarousel } from '../../src/components/site/PressMentionsCarousel';
import {
  ProjectSection,
  type ProjectSectionItem,
  type ProjectSectionTab,
} from '../../src/components/site/ProjectSection';
import { ServicesGrid } from '../../src/components/site/ServicesGrid';
import { TestimonialsGrid } from '../../src/components/site/TestimonialsGrid';
import { VideoShowcase, type VideoItem } from '../../src/components/site/VideoShowcase';
import {
  getHomepage,
  getPartners,
  getPressMentions,
  getProjectsByRootCategory,
  getServices,
  getSiteSettings,
  getTestimonialsFeatured,
} from '../../src/lib/queries';

const URL_PREFIX: Record<string, string> = {
  'biet-thu': '/thiet-ke-biet-thu',
  'lau-dai-dinh-thu': '/lau-dai-dinh-thu',
  'noi-that': '/thiet-ke-noi-that',
  'thi-cong': '/thi-cong',
  'tru-so-khach-san': '/thiet-ke-tru-so-khach-san',
};

function toTabs(root: unknown, children: unknown[]): ProjectSectionTab[] {
  if (!root || typeof root !== 'object') return [];
  const r = root as { slug?: string };
  const slug = r.slug;
  if (!slug) return [];
  const prefix = URL_PREFIX[slug] ?? `/${slug}`;
  return children
    .filter((c): c is { title: string; slug: string } => {
      if (!c || typeof c !== 'object') return false;
      const x = c as { title?: unknown; slug?: unknown };
      return typeof x.title === 'string' && typeof x.slug === 'string';
    })
    .map((c) => ({ label: c.title, href: `${prefix}/${c.slug}` }));
}

function toProjectItems(docs: unknown[]): ProjectSectionItem[] {
  return docs
    .filter((d): d is Record<string, unknown> => d !== null && typeof d === 'object')
    .map((d) => {
      const specs = (d.specs ?? undefined) as ProjectSectionItem['specs'];
      return {
        id: d.id as string | number,
        title: (d.title as string | undefined) ?? '',
        slug: (d.slug as string | undefined) ?? '',
        coverImage: normalizeImage(d.coverImage),
        specs,
      };
    });
}

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [hp, settings] = await Promise.all([getHomepage(), getSiteSettings()]);
  const seo = (hp as any)?.seo ?? {};
  const s = settings as any;
  const title = seo.metaTitle ?? s?.siteName ?? 'Tân cổ điển Hoàng Kim';
  return {
    title: { absolute: title },
    description: seo.metaDescription ?? 'Thiết kế tận tâm – Thi công tận lực',
    openGraph: seo.ogImage?.url ? { images: [{ url: seo.ogImage.url }] } : undefined,
  };
}

function normalizeImage(img: any) {
  if (!img || typeof img !== 'object') return null;
  return { url: img.url ?? '', alt: img.alt ?? '', width: img.width, height: img.height };
}

export default async function HomePage() {
  const [hp, pressDocs, servicesDocs, partnersDocs, testimonialsDocs, s6, s7, s8, s9, s10] =
    await Promise.all([
      getHomepage(),
      getPressMentions(),
      getServices(4),
      getPartners(),
      getTestimonialsFeatured(3),
      getProjectsByRootCategory('biet-thu', 4),
      getProjectsByRootCategory('lau-dai-dinh-thu', 4),
      getProjectsByRootCategory('noi-that', 4),
      getProjectsByRootCategory('thi-cong', 4),
      getProjectsByRootCategory('tru-so-khach-san', 4),
    ]);
  const h = hp as any;

  const heroSlides = (h?.heroSlides ?? []).map((s: any) => ({
    image: normalizeImage(s.image),
    heading: s.heading,
    subheading: s.subheading,
    ctaLabel: s.ctaLabel,
    ctaUrl: s.ctaUrl,
  }));

  const aboutData = h?.aboutSnippet
    ? { ...h.aboutSnippet, image: normalizeImage(h.aboutSnippet.image) }
    : undefined;

  const ctaBlock = h?.ctaBlocks?.[0]
    ? { ...h.ctaBlocks[0], image: normalizeImage(h.ctaBlocks[0].image) }
    : undefined;

  const pressSource =
    Array.isArray(h?.pressMentions) && h.pressMentions.length > 0 ? h.pressMentions : pressDocs;

  const press = pressSource
    .filter((pm: any) => pm && typeof pm === 'object')
    .map((pm: any) => ({
      id: pm.id,
      name: pm.publicationName ?? '',
      logo: normalizeImage(pm.logo),
      sourceUrl: pm.articleUrl ?? undefined,
    }));

  const services = servicesDocs
    .filter((s: any) => s && typeof s === 'object')
    .map((s: any) => ({
      id: s.id,
      title: s.title ?? '',
      slug: s.slug ?? '',
      summary: s.summary ?? undefined,
      coverImage: normalizeImage(s.coverImage),
    }));

  const partners = partnersDocs
    .filter((p: any) => p && typeof p === 'object')
    .map((p: any) => ({
      id: p.id,
      name: p.name ?? '',
      logo: normalizeImage(p.logo),
      url: p.url ?? undefined,
    }));

  const testimonials = testimonialsDocs
    .filter((t: any) => t && typeof t === 'object')
    .map((t: any) => ({
      id: t.id,
      clientName: t.clientName ?? '',
      clientRole: t.clientRole ?? undefined,
      content: t.content ?? '',
      avatar: normalizeImage(t.avatar),
      rating: t.rating,
    }));

  const videos: VideoItem[] = (h?.featuredVideos ?? [])
    .slice(0, 3)
    .map((v: any) => ({
      id: v.id,
      youtubeId: v.youtubeId ?? '',
      title: v.title ?? '',
      thumbnail: normalizeImage(v.thumbnail),
    }))
    .filter((v: VideoItem) => v.youtubeId);

  const factoryPhotos: FactoryPhotoItem[] = (h?.factoryPhotos ?? [])
    .map((f: any) => ({
      id: f.id,
      photo: normalizeImage(f.photo),
      caption: f.caption,
    }))
    .filter((f: FactoryPhotoItem) => f.photo);

  return (
    <main id="main" className="nh-row home">
      <Hero slides={heroSlides} />
      <AboutSlogan data={aboutData} />
      <VideoShowcase videos={videos} />
      <FactoryCarousel items={factoryPhotos} />
      <ServicesGrid services={services} />
      <LeadCaptureBanner data={ctaBlock} />
      <ProjectSection
        id="s6-biet-thu"
        title="1000+ THIẾT KẾ BIỆT THỰ ĐẲNG CẤP"
        tabs={toTabs(s6.root, s6.children)}
        projects={toProjectItems(s6.projects)}
        moreHref="/thiet-ke-biet-thu"
      />
      <ProjectSection
        id="s7-lau-dai"
        title="LÂU ĐÀI - DINH THỰ"
        tabs={toTabs(s7.root, s7.children)}
        projects={toProjectItems(s7.projects)}
        moreHref="/lau-dai-dinh-thu"
      />
      <ProjectSection
        id="s8-noi-that"
        title="THIẾT KẾ NỘI THẤT"
        tabs={toTabs(s8.root, s8.children)}
        projects={toProjectItems(s8.projects)}
        moreHref="/thiet-ke-noi-that"
      />
      <ProjectSection
        id="s9-thi-cong"
        title="CÔNG TRÌNH THI CÔNG"
        tabs={toTabs(s9.root, s9.children)}
        projects={toProjectItems(s9.projects)}
        moreHref="/thi-cong"
      />
      <ProjectSection
        id="s10-tru-so"
        title="TRỤ SỞ - KHÁCH SẠN - NHÀ HÀNG"
        tabs={toTabs(s10.root, s10.children)}
        projects={toProjectItems(s10.projects)}
        moreHref="/thiet-ke-tru-so-khach-san"
      />
      <TestimonialsGrid items={testimonials} />
      <PressMentionsCarousel items={press} />
      <PartnersCarousel items={partners} />
    </main>
  );
}
