'use client';

import Image from 'next/image';
import { A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export type FactoryPhotoItem = {
  id: string | number;
  photo: { url: string; alt?: string } | null;
  caption?: string;
};

type Props = { items: FactoryPhotoItem[] };

export function FactoryCarousel({ items }: Props) {
  if (!items || items.length === 0) return null;
  return (
    <div id="content-row-factory" className="nh-row py-30 mb-30 block-factory-carousel">
      <div className="container">
        <h2 className="section-title-center">XƯỞNG SẢN XUẤT NỘI THẤT</h2>
        <Swiper
          className="owl-carousel owl-theme"
          modules={[A11y, Autoplay]}
          loop
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          a11y={{ prevSlideMessage: 'Ảnh trước', nextSlideMessage: 'Ảnh kế' }}
          breakpoints={{
            0: { slidesPerView: 1.5, spaceBetween: 12 },
            768: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
        >
          {items.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="factory-slide">
                {item.photo?.url ? (
                  <Image
                    src={item.photo.url}
                    alt={item.photo.alt ?? item.caption ?? 'Xưởng sản xuất'}
                    width={600}
                    height={450}
                    sizes="(max-width:767px) 66vw, (max-width:1023px) 50vw, 33vw"
                  />
                ) : null}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
