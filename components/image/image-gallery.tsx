'use client';

import { useEffect, useState } from 'react';

import { ClinicImage } from '@/types/clinic';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { resolveMediaUrl } from '@/lib/media';
import { MEDIA } from '@/lib/media-sizes';
import { cn } from '@/lib/utils';

import { MediaImage } from './media-image';

interface ImageGalleryProps {
  images: (string | ClinicImage | undefined)[] | null;
  title: string;
  className?: string;
}

function getGallerySrc(img: string | ClinicImage): string | null {
  if (typeof img === 'string') return img || null;
  return resolveMediaUrl(img);
}

export function ImageGallery({ images, title, className }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const validImages = (images ?? []).filter(
    (img): img is string | ClinicImage =>
      typeof img === 'string'
        ? !!img
        : typeof img === 'object' && img !== null && !!resolveMediaUrl(img),
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null || !validImages.length) return;

      if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => (prev === 0 ? validImages.length - 1 : (prev ?? 0) - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => ((prev ?? 0) + 1) % validImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, validImages.length]);

  if (!validImages.length) {
    return null;
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleClose = () => {
    setSelectedImageIndex(null);
  };

  const handlePrev = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? validImages.length - 1 : (prev ?? 0) - 1));
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => ((prev ?? 0) + 1) % validImages.length);
  };

  return (
    <div className={cn('not-prose relative', className)}>
      <div
        className={cn(
          'grid grid-cols-4 gap-2',
          validImages.length > 3 ? 'grid-rows-3' : 'grid-rows-2',
        )}>
        <div className="col-span-2 row-span-2 bg-gray-50">
          <button
            onClick={() => handleImageClick(0)}
            className="relative h-full max-h-[500px] w-full overflow-hidden rounded-lg">
            <MediaImage
              src={getGallerySrc(validImages[0]) ?? ''}
              alt={`Main photo for ${title}`}
              priority={true}
              width={MEDIA.gallery.width}
              height={MEDIA.gallery.height}
              sizes={MEDIA.gallery.sizes}
              className="h-full w-full transform object-cover object-center transition-transform hover:scale-105"
            />
          </button>
        </div>
        {validImages.slice(1).map((image, index) => (
          <button
            key={`${title}-image-${index + 1}`}
            onClick={() => handleImageClick(index + 1)}
            className="relative col-span-2 row-span-1 h-60 w-full overflow-hidden rounded-lg">
            <MediaImage
              src={getGallerySrc(image) ?? ''}
              alt={`Photo ${index + 2} for ${title}`}
              width={MEDIA.thumb.width}
              height={MEDIA.thumb.height}
              sizes={MEDIA.thumb.sizes}
              className="h-full w-full transform object-cover object-center transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 text-white hover:text-gray-300">
            <X className="h-8 w-8" />
          </button>
          <button
            onClick={handlePrev}
            className="absolute left-4 z-10 text-white hover:text-gray-300">
            <ChevronLeft className="h-12 w-12" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 z-10 text-white hover:text-gray-300">
            <ChevronRight className="h-12 w-12" />
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <MediaImage
              src={getGallerySrc(validImages[selectedImageIndex]) ?? ''}
              alt={`Photo ${selectedImageIndex + 1} for ${title}`}
              width={MEDIA.lightbox.width}
              height={MEDIA.lightbox.height}
              sizes={MEDIA.lightbox.sizes}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
