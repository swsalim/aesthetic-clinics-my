import { unstable_cache } from 'next/cache';

import { Clinic, ClinicArea } from '@/types/clinic';

import { embeddedCount, fetchApprovedClinics } from '@/helpers/listing-clinics';

import { hasAdminCredentials } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase';

export interface StateData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  r2_url?: string | null;
  areas: Partial<ClinicArea>[];
  clinics: Partial<Clinic>[];
  total_clinics: number;
  modified_at?: string | null;
}

export type StateListing = {
  id: string;
  name: string;
  slug: string;
  modified_at: string | null;
  clinic_count: number;
};

type StateRow = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  r2_url: string | null;
  modified_at: string | null;
};

/**
 * The ranged state RPC does `SELECT ... INTO` and
 * `id = (SELECT id FROM states WHERE slug = ...)`. More than one row for a
 * slug raises an error. helpers used to cache that error as null for two
 * weeks, so the state page and every city page (they also load the state)
 * rendered the not-found shell. This query keeps every row that shares the
 * slug and reads clinics with a normal filter.
 */
export const getStateListings = async (): Promise<StateListing[]> => {
  if (!hasAdminCredentials()) {
    return [];
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('states')
    .select('id, name, slug, modified_at, clinics(count)')
    .eq('clinics.status', 'approved')
    .eq('clinics.is_active', true);

  if (error) {
    throw new Error(`Failed to list states: ${error.message}`);
  }

  const bySlug = new Map<string, StateListing>();

  for (const row of data ?? []) {
    const listing: StateListing = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      modified_at: row.modified_at,
      clinic_count: embeddedCount(row.clinics),
    };
    const existing = bySlug.get(row.slug);
    if (!existing) {
      bySlug.set(row.slug, listing);
      continue;
    }
    existing.clinic_count += listing.clinic_count;
    if (
      listing.modified_at &&
      (!existing.modified_at || listing.modified_at > existing.modified_at)
    ) {
      existing.modified_at = listing.modified_at;
    }
  }

  return [...bySlug.values()];
};

async function fetchStateBySlug(
  slug: string,
  fromIndex: number,
  toIndex: number,
): Promise<StateData | null> {
  if (!hasAdminCredentials()) {
    return null;
  }

  const supabase = createAdminClient();
  const { data: stateRows, error: stateError } = await supabase
    .from('states')
    .select('id, name, slug, image, r2_url, modified_at')
    .eq('slug', slug);

  if (stateError) {
    throw new Error(`Failed to fetch state "${slug}": ${stateError.message}`);
  }

  const states = (stateRows ?? []) as StateRow[];
  if (states.length === 0) {
    return null;
  }

  const stateIds = states.map((state) => state.id);
  const primary = states.find((state) => state.image || state.r2_url) ?? states[0];

  const { data: areaRows, error: areaError } = await supabase
    .from('areas')
    .select('name, slug, modified_at, state:states!inner(id, name, slug)')
    .in('state_id', stateIds)
    .order('name', { ascending: true });

  if (areaError) {
    throw new Error(`Failed to fetch areas for "${slug}": ${areaError.message}`);
  }

  const seenSlugs = new Set<string>();
  const areas: Partial<ClinicArea>[] = [];

  for (const area of areaRows ?? []) {
    if (!area.slug || seenSlugs.has(area.slug)) {
      continue;
    }
    seenSlugs.add(area.slug);
    const state = Array.isArray(area.state) ? area.state[0] : area.state;
    areas.push({
      name: area.name,
      slug: area.slug,
      state: {
        id: state?.id ?? primary.id,
        name: state?.name ?? primary.name,
        slug: state?.slug ?? primary.slug,
      },
    });
  }

  const { clinics, total } = await fetchApprovedClinics({
    stateIds,
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
    areas,
    clinics,
    total_clinics: total,
  };
}

export const getStateBySlug = async (
  stateSlug: string,
  from: number,
  to: number,
): Promise<StateData | null> => {
  const slug = stateSlug;
  const fromIndex = from;
  const toIndex = to;

  if (!slug || typeof slug !== 'string') {
    console.error('Invalid stateSlug provided to getStateBySlug:', stateSlug);
    return null;
  }

  return unstable_cache(
    async () => fetchStateBySlug(slug, fromIndex, toIndex),
    [`state-by-slug-v3-${slug}-${fromIndex}-${toIndex}`],
    {
      revalidate: 1_209_600,
      tags: ['states', `state-${slug}`],
    },
  )();
};
