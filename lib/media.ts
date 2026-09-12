export type MediaFields = {
  r2_url?: string | null;
  r2_key?: string | null;
  image_url?: string | null;
  image?: string | null;
  thumbnail_image?: string | null;
  original_cloudinary_url?: string | null;
};

/**
 * Prefer ImageKit / legacy URLs; fall back to R2 when ImageKit columns are empty.
 */
export function resolveMediaUrl(fields: MediaFields | null | undefined): string | null {
  if (!fields) return null;
  return (
    fields.image_url ||
    fields.image ||
    fields.thumbnail_image ||
    fields.r2_url ||
    fields.original_cloudinary_url ||
    null
  );
}
