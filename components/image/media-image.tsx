'use client';

import Image, { type ImageProps } from 'next/image';

import { MEDIA } from '@/lib/media-sizes';
import { getR2PublicUrl } from '@/lib/r2-public';

interface MediaImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  /** Optional key under the public R2 host (when src is not absolute). */
  directory?: string | null;
}

function resolveSrc(src: string, directory?: string | null): string {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
    return src;
  }

  const publicBase = getR2PublicUrl();
  const prefix = directory ? `${directory.replace(/\/$/, '')}/` : '';
  return `${publicBase}/${prefix}${src.replace(/^\//, '')}`;
}

/**
 * Generic next/image wrapper for R2 (and absolute legacy ImageKit/Cloudinary URLs during migration).
 * Prefer presets from `@/lib/media-sizes` at call sites so transform widths stay small.
 * Resizing in production is handled by Cloudflare via `image-loader.ts` (not Vercel).
 */
export function MediaImage({
  src = 'placeholder.jpg',
  alt = 'Image',
  directory = null,
  width = MEDIA.gallery.width,
  height = MEDIA.gallery.height,
  ...props
}: MediaImageProps) {
  const imageSrc = resolveSrc(src, directory);

  return <Image src={imageSrc} alt={alt} width={width} height={height} {...props} />;
}
