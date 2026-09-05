'use client';

import Image, { type ImageProps } from 'next/image';

import { imageKitLoader, isImageKitUrl } from '@/lib/imagekit-loader';
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
 * next/image wrapper for R2 + remaining static ImageKit URLs.
 * - R2 / relative / other hosts → default Vercel Image Optimization
 * - ik.imagekit.io → ImageKit `tr=` loader (no Vercel proxy for those)
 */
export function MediaImage({
  src = 'placeholder.jpg',
  alt = 'Image',
  directory = null,
  width = MEDIA.gallery.width,
  height = MEDIA.gallery.height,
  loader,
  ...props
}: MediaImageProps) {
  const imageSrc = resolveSrc(src, directory);
  const resolvedLoader = loader ?? (isImageKitUrl(imageSrc) ? imageKitLoader : undefined);

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loader={resolvedLoader}
    />
  );
}
