import Script from 'next/script';
import { Header } from '../../src/components/site/Header';
import { Footer } from '../../src/components/site/Footer';
import { FloatingWidgets } from '../../src/components/site/FloatingWidgets';
import { PromoPopup, type PromoPopupData } from '../../src/components/site/PromoPopup';
import { IconGradientDefs } from '../../src/components/icons';
import { getPromoPopup } from '../../src/lib/queries';

function normalizePromoImage(img: unknown): { url: string; alt?: string } | null {
  if (!img || typeof img !== 'object') return null;
  const x = img as { url?: string; alt?: string };
  if (!x.url) return null;
  return { url: x.url, alt: x.alt };
}

async function loadPromo(): Promise<PromoPopupData> {
  try {
    const doc = (await getPromoPopup()) as Record<string, unknown>;
    if (!doc || !doc.enabled) return null;
    const img = normalizePromoImage(doc.image);
    if (!img) return null;
    return {
      id: (doc.id as string | number) ?? 'popup',
      enabled: true,
      image: img,
      link: typeof doc.link === 'string' ? doc.link : undefined,
      suppressHours:
        typeof doc.suppressHours === 'number' ? (doc.suppressHours as number) : 24,
    };
  } catch {
    return null;
  }
}

const VENDOR_CSS = [
  '/vendor/css/bootstrap.min.css',
  '/vendor/css/font-awesome.css',
  '/vendor/css/owl.carousel.css',
  '/vendor/css/jquery-ui.css',
  '/vendor/css/animate.min.css',
  '/vendor/css/jquery.gritter.min.css',
  '/vendor/css/main.css',
  '/vendor/css/main2.css',
  '/vendor/css/megamenu.css',
  '/vendor/css/megamenu_custom.css',
  '/vendor/css/page.css',
  '/vendor/css/css_custom.css',
];

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const popup = await loadPromo();
  return (
    <>
      {VENDOR_CSS.map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="default" />
      ))}
      <IconGradientDefs />
      <Header />
      {children}
      <Footer />
      <FloatingWidgets />
      <PromoPopup data={popup} />
      {/* jQuery loads first in document order; plugins defer via $(document).ready */}
      <Script src="/vendor/js/jquery.2.1.1.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/bootstrap.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/owl.carousel.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/jquery.gritter.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/jquery.lazy.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/jquery.lazy.plugins.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/jquery.validate.min.js" strategy="afterInteractive" />
      <Script src="/vendor/js/style-menu.js" strategy="afterInteractive" />
      <Script src="/vendor/js/js_custom.js" strategy="lazyOnload" />
    </>
  );
}
