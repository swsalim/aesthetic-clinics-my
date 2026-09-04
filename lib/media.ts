export type MediaFields = {
  r2_url?: string | null;
  r2_key?: string | null;
  image_url?: string | null;
  image?: string | null;
  thumbnail_image?: string | null;
  original_cloudinary_url?: string | null;
};

/**
 * Prefer R2; fall back to legacy ImageKit / Cloudinary URLs when r2_url is missing.
 */
export function resolveMediaUrl(fields: MediaFields | null | undefined): string | null {
  if (!fields) return null;
  return (
    fields.r2_url ||
    fields.image_url ||
    fields.image ||
    fields.thumbnail_image ||
    fields.original_cloudinary_url ||
    null
  );
}
