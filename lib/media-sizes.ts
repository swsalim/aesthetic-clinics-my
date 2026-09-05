/**
 * Shared media size presets — keep device/image sizes in sync with next.config.ts.
 *
 * Intentionally small set so Next (or future Cloudflare /cdn-cgi/image) generates
 * fewer unique transforms across clinics / doctors / areas / states.
 */

export const MEDIA_DEVICE_SIZES = [350, 600, 900, 1200, 1920] as const;
export const MEDIA_IMAGE_SIZES = [64, 128, 256] as const;

export const MEDIA = {
  /** Avatars, map chips, tiny thumbs */
  avatar: {
    width: 128,
    height: 128,
    sizes: '128px',
  },
  /** Gallery / list thumbs */
  thumb: {
    width: 350,
    height: 350,
    sizes: '(max-width: 600px) 100vw, 350px',
  },
  /** Clinic cards (landscape) */
  card: {
    width: 400,
    height: 300,
    sizes: '(max-width: 600px) 100vw, 350px',
  },
  /** Doctor cards (portrait) */
  cardPortrait: {
    width: 400,
    height: 600,
    sizes: '(max-width: 600px) 50vw, 400px',
  },
  /** Main gallery tile, dashboard previews, clinic detail */
  gallery: {
    width: 600,
    height: 600,
    sizes: '(max-width: 600px) 100vw, 600px',
  },
  /** Featured / partner spotlight */
  featured: {
    width: 900,
    height: 675,
    sizes: '(max-width: 1024px) 100vw, 55vw',
  },
  /** Lightbox / large grid hero tile */
  lightbox: {
    width: 1200,
    height: 1200,
    sizes: '(max-width: 1200px) 100vw, 1200px',
  },
  /** State / area page banners */
  hero: {
    width: 1200,
    height: 400,
    sizes: '100vw',
  },
  /** Explore-states style 16:9 tiles */
  landscapeMd: {
    width: 600,
    height: 338,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
  },
  /** Browse / wide state cards */
  landscapeLg: {
    width: 900,
    height: 386,
    sizes: '100vw',
  },
  /** Area grid thumbs */
  areaThumb: {
    width: 256,
    height: 256,
    sizes: '200px',
  },
} as const;

export type MediaPreset = keyof typeof MEDIA;
