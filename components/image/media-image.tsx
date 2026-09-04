'use client';

import Image, { type ImageProps } from 'next/image';

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
 * No CDN transform loaders — Next.js handles resizing.
 */
export function MediaImage({
  src = 'placeholder.jpg',
  alt = 'Image',
  directory = null,
  width = 400,
  height = 400,
  ...props
}: MediaImageProps) {
  const imageSrc = resolveSrc(src, directory);

  return <Image src={imageSrc} alt={alt} width={width} height={height} {...props} />;
}
