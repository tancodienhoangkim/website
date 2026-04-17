import type { Metadata } from 'next';
import { getSiteSettings } from '../../../src/lib/queries';
import { ContactFormClient } from '../../../src/components/site/ContactFormClient';

export const metadata: Metadata = {
  title: 'Liên hệ – Tân Cổ Điển Hoàng Kim',
  description: 'Liên hệ với Tân Cổ Điển Hoàng Kim để được tư vấn miễn phí về thiết kế kiến trúc, nội thất và thi công.',
};

export default async function LienHePage() {
  const settings = await getSiteSettings() as any;
  const hotline = settings?.hotline ?? '0971.199.817';
  const email = settings?.email ?? 'tancodienhoangkim@gmail.com';
  const address = settings?.address ?? 'Hà Nội · TP.HCM · Đà Nẵng';
  const mapEmbedUrl = settings?.mapEmbedUrl ?? null;

  return (
    <div className="page-lien-he" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="container">
        <h1 className="title-main" style={{ textAlign: 'center', marginBottom: '40px' }}>
          LIÊN HỆ
        </h1>
        <div className="row">
          {/* Thông tin liên hệ */}
          <div className="col-sm-5">
            <div className="contact-info" style={{ paddingRight: '30px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--gold-mid, #D4AF5A)' }}>
                THÔNG TIN LIÊN HỆ
              </h2>
              <div style={{ marginBottom: '16px' }}>
                <strong>Địa chỉ:</strong>
                <p style={{ marginTop: '4px', color: '#555' }}>{address}</p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Hotline / Zalo:</strong>
                <p style={{ marginTop: '4px' }}>
                  <a href={`tel:${hotline.replace(/\s/g, '')}`} style={{ color: '#6b0f1a', fontWeight: 600, fontSize: '18px' }}>
                    {hotline}
                  </a>
                </p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Email:</strong>
                <p style={{ marginTop: '4px' }}>
                  <a href={`mailto:${email}`} style={{ color: '#6b0f1a' }}>
                    {email}
                  </a>
                </p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Giờ làm việc:</strong>
                <p style={{ marginTop: '4px', color: '#555' }}>
                  {settings?.hours ?? '8:00 – 17:30, Thứ 2 – Thứ 7'}
                </p>
              </div>
            </div>
            {mapEmbedUrl && (
              <div style={{ marginTop: '24px' }}>
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="260"
                  style={{ border: 0, display: 'block', borderRadius: '4px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bản đồ Tân Cổ Điển Hoàng Kim"
                />
              </div>
            )}
          </div>

          {/* Form liên hệ */}
          <div className="col-sm-7">
            <div style={{ background: '#faf8f5', padding: '32px', borderRadius: '4px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--gold-mid, #D4AF5A)' }}>
                GỬI YÊU CẦU TƯ VẤN
              </h2>
              <ContactFormClient
                titleDefault="Liên hệ từ trang Liên hệ"
                source="contact"
                formId="lien_he_form"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
