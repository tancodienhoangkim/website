'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export type PromoPopupData = {
  id: string | number;
  enabled: boolean;
  image: { url: string; alt?: string } | null;
  link?: string;
  suppressHours?: number;
} | null;

export function PromoPopup({ data }: { data: PromoPopupData }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!data?.enabled || !data.image?.url) return;
    const key = `hoangkim-popup-seen-${data.id}`;
    const suppressMs = (data.suppressHours ?? 24) * 60 * 60 * 1000;
    const seen = localStorage.getItem(key);
    if (seen) {
      const seenAt = Number(seen);
      if (!Number.isNaN(seenAt) && Date.now() - seenAt < suppressMs) return;
    }
    const timer = window.setTimeout(() => setOpen(true), 1500);
    return () => window.clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.showModal();
  }, [open]);

  function close() {
    if (!data) return;
    const key = `hoangkim-popup-seen-${data.id}`;
    localStorage.setItem(key, String(Date.now()));
    dialogRef.current?.close();
    setOpen(false);
  }

  if (!open || !data?.image?.url) return null;
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: native <dialog> closes on Escape.
    <dialog
      ref={dialogRef}
      className="promo-popup"
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
    >
      <div className="promo-popup-inner">
        <button
          type="button"
          className="promo-popup-close"
          onClick={close}
          aria-label="Đóng"
        >
          ×
        </button>
        {data.link ? (
          <Link href={data.link} onClick={close}>
            <Image
              src={data.image.url}
              alt={data.image.alt ?? 'Ưu đãi'}
              width={600}
              height={800}
              sizes="(max-width:575px) 85vw, 600px"
            />
          </Link>
        ) : (
          <Image
            src={data.image.url}
            alt={data.image.alt ?? 'Ưu đãi'}
            width={600}
            height={800}
            sizes="(max-width:575px) 85vw, 600px"
          />
        )}
      </div>
    </dialog>
  );
}
