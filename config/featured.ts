/**
 * Static configuration for featured clinics.
 *
 * Three tiers exist:
 * - Featured: baseline highlight (blue "Featured" badge). Also driven by the
 *   `is_featured` DB flag on individual pages.
 * - Featured Partner: premium paid tier (amber "Featured partner" badge).
 * - Featured Listing: clinics that receive prominent placement (homepage +
 *   pinned to the top of their state/area listing). Featured partners always
 *   count as featured listings.
 *
 * Kept as plain static arrays for now since the list is small. Add clinic slugs
 * to the relevant array to enable each tier.
 */

export const FEATURED_SLUGS: string[] = [];

export const FEATURED_PARTNER_SLUGS: string[] = [
  'dr-a-clinic-damansara-ttdi-kuala-lumpur',
  'dr-a-clinic-sunway-geo-subang-jaya',
];

export const FEATURED_LISTING_SLUGS: string[] = [];

export function isFeaturedPartner(slug?: string | null): boolean {
  if (!slug) return false;
  return FEATURED_PARTNER_SLUGS.includes(slug);
}

export function isFeatured(slug?: string | null): boolean {
  if (!slug) return false;
  return FEATURED_SLUGS.includes(slug) || isFeaturedPartner(slug);
}

export function isFeaturedListing(slug?: string | null): boolean {
  if (!slug) return false;
  return FEATURED_LISTING_SLUGS.includes(slug) || isFeaturedPartner(slug);
}

/**
 * All slugs that should receive featured-listing placement (partners + any
 * explicit featured listings), de-duplicated and preserving partner-first order.
 */
export function getFeaturedListingSlugs(): string[] {
  return Array.from(new Set([...FEATURED_PARTNER_SLUGS, ...FEATURED_LISTING_SLUGS]));
}
