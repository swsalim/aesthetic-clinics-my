import type { ImageLoaderProps } from 'next/image';

/**
 * Cloudflare Image Transformations loader for next/image.
 *
 * Production R2 URLs on NEXT_PUBLIC_R2_PUBLIC_URL become:
 *   https://media.<site>/cdn-cgi/image/width=W,quality=Q,format=auto/<object-key>
 *
 * Requires Image Transformations enabled on the media zone in Cloudflare.
 * Set NEXT_PUBLIC_CF_IMAGE_TRANSFORMS=false to serve originals (Vercel optimizer off either way).
 *
 * @see https://developers.cloudflare.com/images/transform-images/integrate-with-frameworks/
 */

function getMediaBase(): string {
  return (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://media.aestheticclinics.my').replace(
    /\/$/,
    '',
  );
}

function isCfTransformsEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_CF_IMAGE_TRANSFORMS === 'false') {
    return false;
  }
  // /cdn-cgi/image is not available when browsing via localhost
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  return true;
}

/** If src is on the R2 public host, return the object key; otherwise null. */
function r2ObjectPath(src: string, mediaBase: string): string | null {
  if (src.startsWith(`${mediaBase}/`)) {
    return src.slice(mediaBase.length + 1).replace(/^\//, '');
  }

  try {
    const url = new URL(src);
    const mediaHost = new URL(mediaBase).hostname;
    if (url.hostname === mediaHost) {
      return url.pathname.replace(/^\//, '');
    }
  } catch {
    /* ignore invalid URLs */
  }

  return null;
}

export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps): string {
  if (
    src.startsWith('blob:') ||
    src.startsWith('data:') ||
    (src.startsWith('/') && !src.startsWith('//'))
  ) {
    return src;
  }

  const mediaBase = getMediaBase();
  const objectPath = r2ObjectPath(src, mediaBase);

  // Legacy ImageKit / Cloudinary / other hosts — no CF transform
  if (!objectPath) {
    return src;
  }

  const original = `${mediaBase}/${objectPath}`;

  if (!isCfTransformsEnabled()) {
    return original;
  }

  const params = [`width=${width}`, `quality=${quality ?? 75}`, 'format=auto'];
  return `${mediaBase}/cdn-cgi/image/${params.join(',')}/${objectPath}`;
}
