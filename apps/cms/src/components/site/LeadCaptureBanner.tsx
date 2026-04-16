import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export type CtaBlock = {
  heading?: string;
  body?: string;
  image?: { url: string; alt?: string } | null;
  ctaLabel?: string;
  ctaUrl?: string;
};

export function LeadCaptureBanner({ data }: { data?: CtaBlock }): ReactNode {
  if (!data || !data.image?.url) return null;
  return (
    <div id="content-row-199" className="nh-row py-30" style={{ marginTop: '60px', marginBottom: '60px' }}>
      <div className="row">
        <div className="col-sm-12 col-xs-12">
          <div className="banner-register">
            <div className="img">
              <Image
                src={data.image.url}
                alt={data.image.alt ?? data.heading ?? 'Đăng ký'}
                width={1920}
                height={360}
                sizes="100vw"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <div className="content-register">
              {data.heading && <p>{data.heading}</p>}
              {data.body && <p>{data.body}</p>}
              {data.ctaLabel && (
                <div className="link-banner">
                  <Link href={data.ctaUrl ?? '#'}>
                    {data.ctaLabel} <span className="light"></span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
