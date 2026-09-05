/**
 * Shared media size presets — keep in sync with next.config.ts.
 *
 * Resizing is handled by Next.js / Vercel Image Optimization (`next/image`).
 * Presets keep call-site widths consistent across clinics / doctors / areas / states.
 */

/** Responsive srcset (`sizes` with vw/%). */
export const MEDIA_DEVICE_SIZES = [640, 1080, 1920] as const;

/** Fixed / small `sizes` (avatars, cards). */
export const MEDIA_IMAGE_SIZES = [128, 256, 384] as const;

export const MEDIA_QUALITY = 75;

export const MEDIA = {
  /** Avatars, logo, ad icons, doctor chips */
  avatar: {
    width: 128,
    height: 128,
    sizes: '128px',
  },
  /** Gallery secondary thumbs */
  thumb: {
    width: 384,
    height: 384,
    sizes: '(max-width: 600px) 100vw, 384px',
  },
  /** Clinic cards (landscape) */
  card: {
    width: 400,
    height: 300,
    sizes: '(max-width: 600px) 100vw, 400px',
  },
  /** Doctor cards (portrait) */
  cardPortrait: {
    width: 400,
    height: 600,
    sizes: '(max-width: 600px) 50vw, 400px',
  },
  /** Main gallery, profiles, dashboard previews */
  gallery: {
    width: 800,
    height: 800,
    sizes: '(max-width: 800px) 100vw, 800px',
  },
  /** Featured / partner spotlight */
  featured: {
    width: 1080,
    height: 810,
    sizes: '(max-width: 1024px) 100vw, 55vw',
  },
  /** Lightbox / large grids */
  lightbox: {
    width: 1080,
    height: 1080,
    sizes: '(max-width: 1080px) 100vw, 1080px',
  },
  /** State / area page banners */
  hero: {
    width: 1920,
    height: 640,
    sizes: '100vw',
  },
  /** Explore-states 16:9 tiles */
  landscapeMd: {
    width: 640,
    height: 360,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
  },
  /** Browse / wide state cards */
  landscapeLg: {
    width: 1080,
    height: 463,
    sizes: '100vw',
  },
  /** Area grid thumbs */
  areaThumb: {
    width: 384,
    height: 384,
    sizes: '256px',
  },
} as const;

export type MediaPreset = keyof typeof MEDIA;
