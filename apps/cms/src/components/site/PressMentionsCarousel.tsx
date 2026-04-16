'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';

export type PressItem = {
  id: string | number;
  name: string;
  logo: { url: string; alt?: string } | null;
  sourceUrl?: string;
};

export function PressMentionsCarousel({ items }: { items: PressItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div id="content-row-197" className="nh-row py-30">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-xs-12">
            <div className="block-news box-partners">
              <h2 className="section-title-center">BÁO CHÍ NÓI VỀ TÂN CỔ ĐIỂN HOÀNG KIM</h2>
              <div className="row">
                <Swiper
                  className="owl-carousel owl-theme"
                  modules={[A11y, Autoplay]}
                  loop
                  autoplay={{ delay: 1500, disableOnInteraction: false }}
                  a11y={{ prevSlideMessage: 'Logo trước', nextSlideMessage: 'Logo kế' }}
                  breakpoints={{
                    0:    { slidesPerView: 2, spaceBetween: 16 },
                    768:  { slidesPerView: 3, spaceBetween: 24 },
                    1024: { slidesPerView: 6, spaceBetween: 32 },
                  }}
                >
                  {items.map((item) => (
                    <SwiperSlide key={item.id}>
                      <div className="col-md-12 col-sm-12 col-xs-12 item text-center">
                        <div className="item-partner">
                          {item.sourceUrl ? (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="nofollow noreferrer"
                              aria-label={item.name}
                            >
                              <PressLogo item={item} />
                            </a>
                          ) : (
                            <PressLogo item={item} />
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

function PressLogo({ item }: { item: PressItem }) {
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
