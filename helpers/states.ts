import { unstable_cache } from 'next/cache';

import { Clinic, ClinicArea } from '@/types/clinic';

import { createAdminClient } from '@/lib/supabase';

// Type definitions for the state data

interface StateData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  areas: Partial<ClinicArea>[];
  clinics: Partial<Clinic>[];
}

export const getStateMetadataBySlug = unstable_cache(
  async (stateSlug: string) => {
    const supabase = createAdminClient();

    const { data: state } = await supabase.rpc('get_state_metadata_by_slug', {
      state_slug: stateSlug,
    });

    return state as StateData | null;
  },
  ['state-metadata-by-slug'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['states'],
  },
);

export const getStateListings = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const { data: statesData } = await supabase
      .from('states')
      .select('id, name, slug', { count: 'exact' });

    return statesData || [];
  },
  ['states-for-browse'],
  {
    revalidate: 2592000, // Cache for 30 days
    tags: ['states'],
  },
);

/**
 * Fetches a state by its slug with all related data using admin client for static generation
 */
export const getStateBySlug = unstable_cache(
  async (stateSlug: string, from: number, to: number): Promise<StateData | null> => {
    const supabase = createAdminClient();

    const { data: state } = await supabase.rpc('get_ranged_state_metadata_by_slug', {
      state_slug: stateSlug,
      from_index: from,
      to_index: to,
    });

    return state as StateData | null;
  },
  ['state-by-slug'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['states'],
  },
);
