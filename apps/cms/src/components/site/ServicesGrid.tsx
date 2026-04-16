import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from '../icons';

export type ServiceItem = {
  id: string | number;
  title: string;
  slug: string;
  summary?: string;
  coverImage?: { url: string; alt?: string; width?: number; height?: number } | null;
};

export function ServicesGrid({ services }: { services: ServiceItem[] }) {
  if (!services || services.length === 0) return null;
  return (
    <div id="content-row-services" className="nh-row py-30 mb-30 block-services">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <h2 className="section-title-center">DỊCH VỤ CỦA HOÀNG KIM</h2>
            <p className="section-subtitle-center">
              Giải pháp tân cổ điển trọn gói từ thiết kế đến thi công
            </p>
            <div className="services-grid">
              {services.map((s) => (
                <article key={s.id} className="service-card">
                  <div className="service-img">
                    {s.coverImage?.url ? (
                      <Image
                        src={s.coverImage.url}
                        alt={s.coverImage.alt ?? s.title}
                        width={600}
                        height={375}
                        sizes="(max-width: 767px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="service-img-placeholder" aria-hidden="true" />
                    )}
                  </div>
                  <div className="service-body">
                    <h3 className="service-title">{s.title}</h3>
                    {s.summary ? <p className="service-desc">{s.summary}</p> : null}
                    <Link className="service-cta" href={`/dich-vu/${s.slug}`}>
                      <span>Xem chi tiết</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
