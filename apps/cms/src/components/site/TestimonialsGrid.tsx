import Image from 'next/image';

export type TestimonialItem = {
  id: string | number;
  clientName: string;
  clientRole?: string;
  avatar?: { url: string; alt?: string } | null;
  content: string;
  rating?: string;
};

export function TestimonialsGrid({ items }: { items: TestimonialItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div id="content-row-testimonials" className="nh-row py-30 mb-30 block-testimonials">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <h2 className="section-title-center">CẢM NHẬN CỦA KHÁCH HÀNG</h2>
            <div className="testimonials-grid">
              {items.map((t) => (
                <article key={t.id} className="testimonial-card">
                  <blockquote className="testimonial-quote">&ldquo;{t.content}&rdquo;</blockquote>
                  <div className="testimonial-meta">
                    {t.avatar?.url ? (
                      <Image
                        src={t.avatar.url}
                        alt={t.avatar.alt ?? `Khách hàng minh hoạ ${t.clientName}`}
                        width={48}
                        height={48}
                        className="testimonial-avatar"
                      />
                    ) : (
                      <div className="testimonial-avatar fallback" aria-hidden="true" />
                    )}
                    <div>
                      <div className="testimonial-name">{t.clientName}</div>
                      {t.clientRole ? <div className="testimonial-role">{t.clientRole}</div> : null}
                    </div>
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
