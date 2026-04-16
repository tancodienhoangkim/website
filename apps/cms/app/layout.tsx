import type { Metadata } from 'next';
import { Analytics } from '../src/components/seo/Analytics';
import { JsonLd } from '../src/components/seo/JsonLd';
import { localBusinessSchema, organizationSchema } from '../src/components/seo/schemas';

export const metadata: Metadata = {
  title: { default: 'Tân cổ điển Hoàng Kim', template: '%s · Tân cổ điển Hoàng Kim' },
  description: 'Thiết kế tận tâm – Thi công tận lực',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={localBusinessSchema()} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
