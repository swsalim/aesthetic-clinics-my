import type { ImageLoaderProps } from 'next/image';

import { MEDIA_QUALITY } from '@/lib/media-sizes';

/** True when src is an absolute ImageKit CDN URL. */
export function isImageKitUrl(src: string): boolean {
  try {
    return new URL(src).hostname === 'ik.imagekit.io';
  } catch {
    return false;
  }
}

/**
 * next/image loader for static assets still hosted on ImageKit (logo, placeholders, etc.).
 * R2 / other hosts should use the default Vercel optimizer (no custom loader).
 *
 * @see https://imagekit.io/docs/integration/nextjs
 */
export function imageKitLoader({ src, width, quality }: ImageLoaderProps): string {
  const tr = `w-${width},q-${quality ?? MEDIA_QUALITY}`;

  try {
    const url = new URL(src);
    url.searchParams.delete('tr');
    url.searchParams.set('tr', tr);
    return url.toString();
  } catch {
    const sep = src.includes('?') ? '&' : '?';
    return `${src}${sep}tr=${tr}`;
  }
}
