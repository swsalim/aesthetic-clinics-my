'use client';

import Image, { type ImageProps } from 'next/image';

import { imageKitLoader, isImageKitUrl } from '@/lib/imagekit-loader';
import { getImageKitId } from '@/lib/imagekit-url';
import { MEDIA } from '@/lib/media-sizes';

interface MediaImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  /** Optional path prefix under the ImageKit account (when src is not absolute). */
  directory?: string | null;
}

function resolveSrc(src: string, directory?: string | null): string {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
    return src;
  }

  const id = getImageKitId();
  const prefix = directory ? `${directory.replace(/\/$/, '')}/` : '';
  return `https://ik.imagekit.io/${id}/${prefix}${src.replace(/^\//, '')}`;
}

/**
 * next/image wrapper for ImageKit + remaining absolute URLs (R2, Cloudinary, local).
 * - ik.imagekit.io → ImageKit `tr=` loader (no Vercel proxy for those)
 * - other hosts / relative → default Vercel Image Optimization
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
