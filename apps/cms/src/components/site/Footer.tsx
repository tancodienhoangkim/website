import type { ComponentType, SVGProps } from 'react';
import Image from 'next/image';
import { getFooter, getSiteSettings } from '../../lib/queries';
import { ContactFormClient } from './ContactFormClient';
import {
  Envelope,
  Facebook,
  Instagram,
  MapMarker,
  Messenger,
  Phone,
  Tiktok,
  Youtube,
  Zalo,
} from '../icons';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const socialIconMap: Record<string, IconComponent> = {
  facebook: Facebook,
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Tiktok,
  zalo: Zalo,
  messenger: Messenger,
};

export async function Footer() {
  const [footer, settings] = await Promise.all([getFooter(), getSiteSettings()]);
  const s = settings as any;
  const f = footer as any;
  const address = s?.address ?? 'Hà Nội · TP.HCM · Đà Nẵng';
  const hotline = s?.hotline ?? '0971.199.817';
  const email = s?.email ?? 'tancodienhoangkim@gmail.com';
  const social = s?.social ?? {};
  const copyright =
    f?.copyright ?? '© 2026 Tân Cổ Điển Hoàng Kim. Uy tín tạo nên thương hiệu.';

  const socialLinks: Array<{ icon: string; url: string; label: string }> = [];
  if (social.facebook)
    socialLinks.push({ icon: 'facebook', url: social.facebook, label: 'Facebook' });
  if (social.youtube)
    socialLinks.push({ icon: 'youtube', url: social.youtube, label: 'YouTube' });
  if (social.instagram)
    socialLinks.push({ icon: 'instagram', url: social.instagram, label: 'Instagram' });
  if (social.tiktok)
    socialLinks.push({ icon: 'tiktok', url: social.tiktok, label: 'TikTok' });

  // Fall back to static links when CMS has no social data configured yet
  const displayLinks =
    socialLinks.length > 0
      ? socialLinks
      : [
          {
            icon: 'facebook',
            url: 'https://facebook.com/hoangkim',
            label: 'Facebook',
          },
          {
            icon: 'youtube',
            url: 'https://youtube.com/@hoangkim',
            label: 'YouTube',
          },
        ];

  return (
    <div id="footer" className="nh-row">
      {/* Row 1: 3-column main footer content */}
      <div id="footer-row-50" className="nh-row pb-20">
        <div className="container">
          <div className="row">
            {/* Col 1: Brand / social / address */}
            <div className="col-sm-4">
              <div className="menu-footer-vertical box-ft">
                <div className="title-menu-ft">TÂN CỔ ĐIỂN HOÀNG KIM</div>

                <div className="footer-fanpage">
                  <div className="menu-footer-vertical">
                    <ul className="list-fan-page">
                      {displayLinks.map((link) => {
                        const Icon = socialIconMap[link.icon];
                        if (!Icon) return null;
                        return (
                          <li key={link.label}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="nofollow noreferrer"
                              aria-label={link.label}
                            >
                              <Icon size={18} />
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="address-ft">
                  <p>
                    <MapMarker />{' '}
                    {address}
                  </p>
                  <p className="footer-phone">
                    <Phone />{' '}
                    <b>Hotline/Zalo:</b>{' '}
                    <a
                      href={`tel:${hotline.replace(/\s/g, '')}`}
                      target="_blank"
                      rel="nofollow"
                      style={{ display: 'inline-block' }}
                    >
                      {hotline}
                    </a>
                  </p>
                  <p>
                    <Envelope />{' '}
                    <b>Email:</b>{' '}
                    <a
                      href={`mailto:${email}`}
                      target="_blank"
                      rel="nofollow"
                      style={{ display: 'inline-block' }}
                    >
                      {email}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Col 2: Consultation callback form */}
            <div className="col-sm-4">
              <div className="menu-footer-vertical section-contact-footer">
                <div className="title-menu-ft">Đăng ký tư vấn miễn phí</div>
                <ContactFormClient />
              </div>
            </div>

            {/* Col 3: Map + badges */}
            <div className="col-sm-4">
              <div className="section-map">
                <div className="title-menu-ft">BẢN ĐỒ</div>
                <div className="content-map">
                  <a
                    href="https://maps.google.com/?q=Số+81+đường+Vạn+Phúc,+Hà+Đông,+Hà+Nội"
                    target="_blank"
                    rel="nofollow noreferrer"
                    aria-label="Bản đồ đường đi đến Tân cổ điển Hoàng Kim"
                  >
                    <Image
                      src="/vendor/images/map.jpg"
                      alt="Bản đồ đường đi đến Tân cổ điển Hoàng Kim"
                      width={400}
                      height={250}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Copyright bar */}
      <div id="footer-row-99" className="nh-row bottom-footer">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <p className="coppyright">{copyright}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Back-to-top */}
      <div id="footer-row-128" className="nh-row">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <a
                href="#main"
                className="btn-to-top button scroll"
                aria-label="Về đầu trang"
              >
                <span className="scroll-down-arrow"></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
