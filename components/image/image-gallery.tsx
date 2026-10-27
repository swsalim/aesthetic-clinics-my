'use client';

import { useEffect, useRef, useState } from 'react';

import { ClinicImage } from '@/types/clinic';
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react/dist/ssr';
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';
import { A11y, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { resolveMediaUrl } from '@/lib/media';
import { MEDIA } from '@/lib/media-sizes';
import { cn } from '@/lib/utils';

import { MediaImage } from './media-image';

interface ImageGalleryProps {
  images: (string | ClinicImage | undefined)[] | null;
  title: string;
  className?: string;
}

const PREVIEW_DESKTOP = 4;
const PREVIEW_MOBILE = 3;

function getGallerySrc(img: string | ClinicImage): string | null {
  if (typeof img === 'string') return img || null;
  return resolveMediaUrl(img);
}

const THUMB_HEIGHT = 64;

function LightboxThumb({
  src,
  label,
  isActive,
  onClick,
}: {
  src: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-active={isActive}
      onClick={onClick}
      aria-label={label}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'inline-flex h-16 shrink-0 items-center overflow-hidden rounded-md bg-white/10',
        isActive ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100',
      )}
    >
      <MediaImage
        src={src}
        alt=""
        width={THUMB_HEIGHT}
        height={THUMB_HEIGHT}
        sizes="128px"
        style={{ height: THUMB_HEIGHT, width: 'auto', aspectRatio: 'auto' }}
        className="h-16 w-auto max-w-none object-contain"
      />
    </button>
  );
}

function CountOverlay({ extra, className }: { extra: number; className?: string }) {
  if (extra <= 0) return null;

  return (
    <span
      className={cn(
        'pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-gray-950/55 px-2 text-center text-white',
        className,
      )}
    >
      <span className="text-xl font-semibold leading-none sm:text-2xl">+{extra}</span>
      <span className="mt-1 text-xs font-medium sm:text-sm">View all photos</span>
    </span>
  );
}

export function ImageGallery({ images, title, className }: ImageGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const validImages = (images ?? []).filter((img): img is string | ClinicImage =>
    typeof img === 'string'
      ? !!img
      : typeof img === 'object' && img !== null && !!resolveMediaUrl(img),
  );

  useEffect(() => {
    if (openIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) return;
    const activeThumb = thumbsRef.current?.querySelector<HTMLButtonElement>('[data-active="true"]');
    activeThumb?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeIndex, openIndex]);

  if (!validImages.length) {
    return null;
  }

  const preview = validImages.slice(0, PREVIEW_DESKTOP);
  const total = validImages.length;
  const mobileExtra = Math.max(0, total - PREVIEW_MOBILE);
  const desktopExtra = Math.max(0, total - PREVIEW_DESKTOP);

  const openAt = (index: number) => {
    setActiveIndex(index);
    setOpenIndex(index);
  };

  return (
    <div className={cn('not-prose relative', className)}>
      <div
        className={cn(
          'grid gap-2',
          preview.length === 1 && 'grid-cols-1 sm:max-w-[calc(25%-0.375rem)]',
          preview.length === 2 && 'grid-cols-2 sm:max-w-[calc(50%-0.25rem)]',
          preview.length === 3 && 'grid-cols-3',
          preview.length >= 4 && 'grid-cols-3 sm:grid-cols-4',
        )}
      >
        {preview.map((image, index) => {
          const isMobileCount = index === PREVIEW_MOBILE - 1 && mobileExtra > 0;
          const isDesktopCount = index === PREVIEW_DESKTOP - 1 && desktopExtra > 0;

          return (
            <button
              key={`${title}-preview-${index}`}
              type="button"
              onClick={() => openAt(index)}
              className={cn(
                'relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800',
                index === PREVIEW_DESKTOP - 1 && 'hidden sm:block',
              )}
            >
              <MediaImage
                src={getGallerySrc(image) ?? ''}
                alt={`Photo ${index + 1} of ${title}`}
                fill
                priority={index === 0}
                sizes="(max-width: 640px) 33vw, 220px"
                className="object-cover object-center"
              />
              {isMobileCount && <CountOverlay extra={mobileExtra} className="sm:hidden" />}
              {isDesktopCount && <CountOverlay extra={desktopExtra} />}
            </button>
          );
        })}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-[80] flex flex-col bg-black"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <p className="text-sm tabular-nums">
              {activeIndex + 1} / {total}
            </p>
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              className="rounded-full p-2 text-white hover:bg-white/10"
              aria-label="Close gallery"
            >
              <X weight="duotone" className="h-6 w-6" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            <Swiper
              modules={[Keyboard, A11y]}
              initialSlide={openIndex}
              speed={400}
              spaceBetween={24}
              keyboard={{ enabled: true }}
              onSwiper={setSwiper}
              onSlideChange={(instance) => setActiveIndex(instance.activeIndex)}
              className="h-full w-full"
            >
              {validImages.map((image, index) => (
                <SwiperSlide
                  key={`${title}-lightbox-${index}`}
                  className="!flex items-center justify-center"
                >
                  <MediaImage
                    src={getGallerySrc(image) ?? ''}
                    alt={`Photo ${index + 1} for ${title}`}
                    width={MEDIA.lightbox.width}
                    height={MEDIA.lightbox.height}
                    sizes={MEDIA.lightbox.sizes}
                    draggable={false}
                    className="h-auto max-h-full w-auto max-w-[92vw] object-contain"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => swiper?.slidePrev()}
                  className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 sm:block"
                  aria-label="Previous photo"
                >
                  <CaretLeft weight="duotone" className="h-8 w-8" />
                </button>
                <button
                  type="button"
                  onClick={() => swiper?.slideNext()}
                  className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 sm:block"
                  aria-label="Next photo"
                >
                  <CaretRight weight="duotone" className="h-8 w-8" />
                </button>
              </>
            )}
          </div>

          {total > 1 && (
            <div className="flex justify-center px-4 pb-4 pt-3">
              <div
                ref={thumbsRef}
                className="flex max-w-full gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {validImages.map((image, index) => (
                  <LightboxThumb
                    key={`${title}-thumb-${index}`}
                    src={getGallerySrc(image) ?? ''}
                    label={`Photo ${index + 1} of ${total}`}
                    isActive={index === activeIndex}
                    onClick={() => swiper?.slideTo(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
