'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export type HeroSlide = {
  image: { url: string; alt?: string; width?: number; height?: number } | null;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export function Hero({ slides }: { slides: HeroSlide[] }) {
  if (!slides || slides.length === 0) return null;
  return (
    <div id="content-row-33" className="nh-row nhslider">
      <div className="row">
        <div className="col-sm-12 col-xs-12">
          <div className="mighty-slider">
            <Swiper
              className="silder-element owl-theme owl-carousel"
              modules={[A11y, Autoplay, Pagination]}
              loop
              autoplay={{ delay: 10_000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              slidesPerView={1}
              a11y={{
                prevSlideMessage: 'Slide trước',
                nextSlideMessage: 'Slide kế',
                slideLabelMessage: 'Slide {{index}} / {{slidesLength}}',
              }}
            >
              {slides.map((s, i) => (
                <SwiperSlide key={i}>
                  <div className="item">
                    <div className="image">
                      {s.image?.url && (
                        <Image
                          src={s.image.url}
                          alt={s.image.alt ?? s.heading ?? 'Tân cổ điển Hoàng Kim'}
                          width={1920}
                          height={800}
                          sizes="100vw"
                          style={{ width: '100%', height: 'auto' }}
                          priority={i === 0}
                        />
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
  );
}
