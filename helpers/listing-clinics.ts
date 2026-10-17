import { Clinic, ClinicImage } from '@/types/clinic';

import { hasAdminCredentials } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase';

export const LISTING_CLINIC_SELECT = `
  name,
  slug,
  postal_code,
  address,
  phone,
  rating,
  is_featured,
  is_permanently_closed,
  open_on_public_holidays,
  modified_at,
  area:areas(name, slug),
  state:states(name, slug),
  hours:clinic_hours(day_of_week, open_time, close_time),
  special_hours:clinic_special_hours(date, is_closed, open_time, close_time),
  images:clinic_images(id, image_url, imagekit_file_id, r2_url, r2_key, display_order)
`;

export function normalizeListingClinics(rows: Partial<Clinic>[] | null): Partial<Clinic>[] {
  return (rows ?? []).map((clinic) => ({
    ...clinic,
    images: [...((clinic.images as ClinicImage[] | null | undefined) ?? [])].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
    ),
  }));
}

export function embeddedCount(value: unknown): number {
  if (Array.isArray(value)) {
    const first = value[0] as { count?: number } | undefined;
    return first?.count ?? 0;
  }

  if (value && typeof value === 'object' && 'count' in value) {
    const count = (value as { count?: number }).count;
    return typeof count === 'number' ? count : 0;
  }

  return 0;
}

/**
 * Approved, active clinics are the public directory. The ranged metadata RPCs
 * counted `status = approved` only and aborted when a slug matched more than
 * one row (`SELECT ... INTO` / scalar subqueries). Callers should use this
 * table query instead.
 */
export async function fetchApprovedClinics(options: {
  stateIds?: string[];
  areaIds?: string[];
  from: number;
  to: number;
}): Promise<{ clinics: Partial<Clinic>[]; total: number }> {
  if (!hasAdminCredentials()) {
    return { clinics: [], total: 0 };
  }

  const supabase = createAdminClient();
  let query = supabase
    .from('clinics')
    .select(LISTING_CLINIC_SELECT, { count: 'exact' })
    .eq('status', 'approved')
    .eq('is_active', true)
    .order('modified_at', { ascending: false, nullsFirst: false });

  if (options.stateIds?.length) {
    query = query.in('state_id', options.stateIds);
  }

  if (options.areaIds?.length) {
    query = query.in('area_id', options.areaIds);
  }

  const { data, error, count } = await query.range(options.from, options.to);

  if (error) {
    throw new Error(`Failed to fetch clinics: ${error.message}`);
  }

  return {
    clinics: normalizeListingClinics(data as unknown as Partial<Clinic>[]),
    total: count ?? 0,
  };
}
