import type { ImageLoaderProps } from 'next/image';

import { MEDIA_DEVICE_SIZES, MEDIA_IMAGE_SIZES, MEDIA_QUALITY } from '@/lib/media-sizes';

const IMAGEKIT_WIDTHS = [...new Set([...MEDIA_IMAGE_SIZES, ...MEDIA_DEVICE_SIZES])].sort(
  (a, b) => a - b,
);

function snapWidth(width: number): number {
  return IMAGEKIT_WIDTHS.reduce((closest, candidate) =>
    Math.abs(candidate - width) < Math.abs(closest - width) ? candidate : closest,
  );
}

export function isImageKitSrc(src: string): boolean {
  return src.includes('ik.imagekit.io/');
}

/**
 * Resize/format on ImageKit (`tr=`) instead of Vercel `/_next/image`.
 * Accepts a full ImageKit URL or a path under NEXT_PUBLIC_IMAGEKIT_ID.
 */
export function imageKitLoader({ src, width, quality }: ImageLoaderProps): string {
  const w = snapWidth(width);
  const q = quality ?? MEDIA_QUALITY;
  const tr = `w-${w},q-${q},f-auto,c-at_max`;

  if (src.startsWith('http://') || src.startsWith('https://')) {
    const url = new URL(src);
    url.searchParams.set('tr', tr);
    return url.toString();
  }

  const path = src.replace(/^\//, '');
  const id = process.env.NEXT_PUBLIC_IMAGEKIT_ID || '8nt3mrojl';
  return `https://ik.imagekit.io/${id}/${path}?tr=${tr}`;
}
