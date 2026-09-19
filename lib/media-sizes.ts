/**
 * Shared media size presets — keep in sync with next.config.ts.
 *
 * Resizing is handled by Next.js / Vercel Image Optimization (`next/image`).
 * ImageKit URLs still resize on ImageKit via a custom loader.
 * Presets keep call-site widths consistent across clinics / doctors / areas / states.
 *
 * Keep deviceSizes + imageSizes lean: every unique width is a separate ImageKit
 * transform (and Vercel Image Optimization variant). Cap at 1200 to stay on the
 * ImageKit free-tier bandwidth budget; 1920px srcset entries are not worth it.
 *
 * `sizes` must match the rendered CSS width (not the intrinsic `width` prop).
 * Overstated `sizes` (e.g. 100vw for a 1/4 grid card) force larger srcset picks
 * and raise Vercel Image Optimization + origin transfer cost.
 *
 * Usage mapping (approximate):
 * - 64–128: icons, logos, small avatars
 * - 200:    chips, ad logos, ~100–200px display
 * - 400:    clinic/doctor cards, grid thumbs
 * - 800:    carousels, galleries, 2x mobile / tablet
 * - 1200:   heroes, lightbox, max content / retina-safe cap
 */

/** Responsive srcset (`sizes` with vw/%). */
export const MEDIA_DEVICE_SIZES = [200, 400, 800, 1200] as const;

/** Fixed / small `sizes` (avatars, cards). */
export const MEDIA_IMAGE_SIZES = [64, 128, 256] as const;

export const MEDIA_QUALITY = 75;

/** Clinic / doctor listing grids: 1 → 2 → 3 → 4 columns. */
const LISTING_GRID_SIZES =
  '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';

export const MEDIA = {
  /** Logo, ad icons, doctor chips (~32–128px CSS) */
  avatar: {
    width: 128,
    height: 128,
    sizes: '128px',
  },
  /** Hero proof-column doctor tiles (3-up) */
  heroChip: {
    width: 128,
    height: 128,
    sizes: '(max-width: 1024px) 33vw, 160px',
  },
  /** Dentist profile portrait (max-w-48 → max-w-72) */
  profile: {
    width: 384,
    height: 576,
    sizes: '(max-width: 1024px) 192px, 288px',
  },
  /** Gallery secondary thumbs (half of gallery column) */
  thumb: {
    width: 384,
    height: 384,
    sizes: '(max-width: 1024px) 50vw, 400px',
  },
  /** Clinic cards (landscape) in listing grids */
  card: {
    width: 400,
    height: 300,
    sizes: LISTING_GRID_SIZES,
  },
  /** Doctor cards (portrait) in listing grids */
  cardPortrait: {
    width: 400,
    height: 600,
    sizes: LISTING_GRID_SIZES,
  },
  /** Place gallery main tile (half of main column) */
  gallery: {
    width: 800,
    height: 800,
    sizes: '(max-width: 1024px) 50vw, 600px',
  },
  /** Full-bleed carousel slides inside the content column */
  carousel: {
    width: 800,
    height: 800,
    sizes: '(max-width: 1280px) 100vw, 1280px',
  },
  /** Empty-state illustrations (size-64 / size-96) */
  empty: {
    width: 384,
    height: 384,
    sizes: '384px',
  },
  /** Featured / partner spotlight / advertise previews (2-col on lg) */
  featured: {
    width: 1080,
    height: 810,
    sizes: '(max-width: 1024px) 100vw, 50vw',
  },
  /** Lightbox / large grids */
  lightbox: {
    width: 1080,
    height: 1080,
    sizes: '(max-width: 1080px) 100vw, 1080px',
  },
  /** State / area page banners (full-bleed) */
  hero: {
    width: 1200,
    height: 400,
    sizes: '100vw',
  },
  /** Explore-states 16:9 tiles (1 / 2 / 4 cols) */
  landscapeMd: {
    width: 640,
    height: 360,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
  },
  /** Browse / wide state cards inside max-w-7xl */
  landscapeLg: {
    width: 1080,
    height: 463,
    sizes: '(max-width: 1280px) 100vw, 1280px',
  },
  /** Area grid thumbs (1 / 2 / 5 cols) */
  areaThumb: {
    width: 384,
    height: 384,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw',
  },
  /** Mid-grid affiliate tiles (same cell as clinic cards) */
  adGrid: {
    width: 600,
    height: 600,
    sizes: LISTING_GRID_SIZES,
  },
  /** max-w-2xl leaderboard / promo banners */
  adLeaderboard: {
    width: 672,
    height: 672,
    sizes: '(max-width: 672px) 100vw, 672px',
  },
  /** Sticky clinic sidebar partner tile (320px column) */
  adSidebar: {
    width: 320,
    height: 320,
    sizes: '(max-width: 1024px) 100vw, 320px',
  },
} as const;

export type MediaPreset = keyof typeof MEDIA;
