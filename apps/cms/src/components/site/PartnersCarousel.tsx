'use client';

import Image from 'next/image';
import { A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export type PartnerItem = {
  id: string | number;
  name: string;
  logo: { url: string; alt?: string } | null;
  url?: string;
};

export function PartnersCarousel({ items }: { items: PartnerItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div id="content-row-partners" className="nh-row py-30 mb-30 block-partners">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-xs-12">
            <div className="block-news box-partners">
              <h2 className="section-title-center">ĐỐI TÁC CHIẾN LƯỢC</h2>
              <div className="row">
                <Swiper
                  className="owl-carousel owl-theme"
                  modules={[A11y, Autoplay]}
                  loop
                  autoplay={{ delay: 2000, disableOnInteraction: false }}
                  a11y={{ prevSlideMessage: 'Đối tác trước', nextSlideMessage: 'Đối tác kế' }}
                  breakpoints={{
                    0: { slidesPerView: 2, spaceBetween: 16 },
                    768: { slidesPerView: 3, spaceBetween: 24 },
                    1024: { slidesPerView: 6, spaceBetween: 32 },
                  }}
                >
                  {items.map((item) => (
                    <SwiperSlide key={item.id}>
                      <div className="col-md-12 col-sm-12 col-xs-12 item text-center">
                        <div className="item-partner partner-item">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="nofollow noreferrer"
                              aria-label={item.name}
                            >
                              <PartnerLogo item={item} />
                            </a>
                          ) : (
                            <PartnerLogo item={item} />
                          )}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerLogo({ item }: { item: PartnerItem }) {
  if (!item.logo?.url) return <span>{item.name}</span>;
  return (
    <Image
      src={item.logo.url}
      alt={item.logo.alt ?? item.name}
      width={216}
      height={120}
      style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 17vw"
    />
  );
}
