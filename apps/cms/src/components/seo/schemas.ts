export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';

const BRAND = {
  name: 'Tân Cổ Điển Hoàng Kim',
  phone: '+84-971-199-817',
  address: 'Số 81 đường Vạn Phúc, phường Hà Đông, TP. Hà Nội',
  email: 'tancodienhoangkim@gmail.com',
  logoPath: '/vendor/images/logo.jpg',
};

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.name,
    url: SITE_URL,
    logo: `${SITE_URL}${BRAND.logoPath}`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BRAND.phone,
      contactType: 'customer service',
      areaServed: 'VN',
      availableLanguage: ['vi'],
    },
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: BRAND.name,
    url: SITE_URL,
    telephone: BRAND.phone,
    email: BRAND.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BRAND.address,
      addressCountry: 'VN',
    },
    openingHours: 'Mo-Sa 08:00-17:30',
  };
}

export type BreadcrumbItem = { label: string; href?: string };

export function breadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: item.href.startsWith('http') ? item.href : `${SITE_URL}${item.href}` } : {}),
    })),
  };
}

export function articleSchema(args: {
  headline: string;
  datePublished?: string;
  image?: string;
  description?: string;
  url?: string;
}) {
  const { headline, datePublished, image, description, url } = args;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(image ? { image } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
    author: { '@type': 'Organization', name: BRAND.name },
    publisher: {
      '@type': 'Organization',
      name: BRAND.name,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}${BRAND.logoPath}` },
    },
  };
}

export function serviceSchema(args: { name: string; description?: string; image?: string; url?: string }) {
  const { name, description, image, url } = args;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(url ? { url } : {}),
    provider: { '@type': 'Organization', name: BRAND.name, url: SITE_URL },
    areaServed: 'VN',
  };
}

export function creativeWorkSchema(args: {
  name: string;
  description?: string;
  image?: string;
  url?: string;
  dateCreated?: string;
}) {
  const { name, description, image, url, dateCreated } = args;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(url ? { url } : {}),
    ...(dateCreated ? { dateCreated } : {}),
    creator: { '@type': 'Organization', name: BRAND.name, url: SITE_URL },
  };
}
