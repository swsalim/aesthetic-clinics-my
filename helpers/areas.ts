import { unstable_cache } from 'next/cache';

import { Clinic, ClinicState } from '@/types/clinic';

import { embeddedCount, fetchApprovedClinics } from '@/helpers/listing-clinics';

import { hasAdminCredentials } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase';

export interface AreaData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  r2_url?: string | null;
  state: Partial<ClinicState>;
  clinics: Partial<Clinic>[];
  total_clinics: number;
  modified_at?: string | null;
}

export type AreaListing = {
  id: string;
  name: string;
  slug: string;
  modified_at: string | null;
  clinic_count: number;
  state: {
    name: string;
    slug: string;
  };
};

type AreaRow = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  r2_url: string | null;
  modified_at: string | null;
  state:
    | {
        id?: string;
        name: string;
        slug: string;
        image?: string | null;
        r2_url?: string | null;
      }
    | {
        id?: string;
        name: string;
        slug: string;
        image?: string | null;
        r2_url?: string | null;
      }[]
    | null;
};

function stateOf(row: AreaRow) {
  return Array.isArray(row.state) ? row.state[0] : row.state;
}

export const getAreaListings = async (): Promise<AreaListing[]> => {
  if (!hasAdminCredentials()) {
    return [];
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('areas')
    .select(
      `
      id,
      name,
      slug,
      modified_at,
      state:states!inner(name, slug),
      clinics(count)
    `,
    )
    .eq('clinics.status', 'approved')
    .eq('clinics.is_active', true);

  if (error) {
    throw new Error(`Failed to list areas: ${error.message}`);
  }

  const byKey = new Map<string, AreaListing>();

  for (const row of (data ?? []) as unknown as Array<AreaRow & { clinics?: unknown }>) {
    const state = stateOf(row);
    if (!state?.slug || !row.slug) {
      continue;
    }

    const key = `${state.slug}/${row.slug}`;
    const clinicCount = embeddedCount(row.clinics);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        id: row.id,
        name: row.name,
        slug: row.slug,
        modified_at: row.modified_at,
        clinic_count: clinicCount,
        state: {
          name: state.name,
          slug: state.slug,
        },
      });
      continue;
    }

    existing.clinic_count += clinicCount;
    if (row.modified_at && (!existing.modified_at || row.modified_at > existing.modified_at)) {
      existing.modified_at = row.modified_at;
    }
  }

  return [...byKey.values()];
};

async function fetchAreaBySlug(
  slug: string,
  stateSlug: string | undefined,
  fromIndex: number,
  toIndex: number,
): Promise<AreaData | null> {
  if (!hasAdminCredentials()) {
    return null;
  }

  const supabase = createAdminClient();
  let query = supabase
    .from('areas')
    .select('id, name, slug, image, r2_url, modified_at, state:states!inner(id, name, slug, image, r2_url)')
    .eq('slug', slug);

  if (stateSlug) {
    query = query.eq('state.slug', stateSlug);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch area "${slug}": ${error.message}`);
  }

  const areas = (data ?? []) as unknown as AreaRow[];
  if (areas.length === 0) {
    return null;
  }

  const primary = areas[0];
  const state = stateOf(primary);
  if (!state) {
    return null;
  }

  const { clinics, total } = await fetchApprovedClinics({
    areaIds: areas.map((area) => area.id),
    from: fromIndex,
    to: toIndex,
  });

  return {
    id: primary.id,
    name: primary.name,
    slug: primary.slug,
    image: primary.image,
    r2_url: primary.r2_url,
    modified_at: primary.modified_at,
    state: {
      id: state.id,
      name: state.name,
      slug: state.slug,
      image: state.image,
      r2_url: state.r2_url,
    },
    clinics,
    total_clinics: total,
  };
}

export const getAreaBySlug = async (
  areaSlug: string,
  from: number,
  to: number,
  stateSlug?: string,
): Promise<AreaData | null> => {
  const slug = areaSlug;
  const fromIndex = from;
  const toIndex = to;
  const parentSlug = stateSlug;

  if (!slug || typeof slug !== 'string') {
    console.error('Invalid areaSlug provided to getAreaBySlug:', areaSlug);
    return null;
  }

  return unstable_cache(
    async () => fetchAreaBySlug(slug, parentSlug, fromIndex, toIndex),
    [`area-v3-${parentSlug ?? 'any'}-${slug}-${fromIndex}-${toIndex}`],
    {
      revalidate: 1_209_600,
      tags: ['areas', `area-${slug}`],
    },
  )();
};
