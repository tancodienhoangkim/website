'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

export type GalleryImage = { url: string; alt?: string };

export function ProjectGallery({ images }: { images: GalleryImage[] }) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [index, setIndex] = useState(0);

  const open = useCallback((i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    }
    dlg.addEventListener('keydown', onKey);
    return () => {
      dlg.removeEventListener('keydown', onKey);
    };
  }, [next, prev]);

  if (!images || images.length === 0) return null;
  const current = images[index];
  return (
    <>
      <div className="project-gallery">
        {images.map((img, i) => (
          <button
            type="button"
            key={img.url}
            onClick={() => open(i)}
            aria-label={`Xem ảnh ${i + 1}/${images.length}`}
          >
            <Image
              src={img.url}
              alt={img.alt ?? `Ảnh ${i + 1}`}
              width={400}
              height={300}
              sizes="(max-width:575px) 50vw, (max-width:991px) 33vw, 25vw"
            />
          </button>
        ))}
      </div>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: native <dialog> closes on Escape; backdrop-click is convenience-only. */}
      <dialog
        ref={dialogRef}
        className="project-gallery-dialog"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        <button type="button" className="close" onClick={close} aria-label="Đóng">
          ×
        </button>
        {current ? (
          <Image
            src={current.url}
            alt={current.alt ?? `Ảnh ${index + 1}`}
            width={1600}
            height={1200}
            sizes="92vw"
            style={{ width: 'auto', height: 'auto', maxWidth: '92vw', maxHeight: '80vh' }}
          />
        ) : null}
        {images.length > 1 ? (
          <>
            <button type="button" className="prev" onClick={prev} aria-label="Ảnh trước">
              ‹
            </button>
            <button type="button" className="next" onClick={next} aria-label="Ảnh sau">
              ›
            </button>
          </>
        ) : null}
      </dialog>
    </>
  );
}
