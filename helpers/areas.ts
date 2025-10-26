import { unstable_cache } from 'next/cache';

import { Clinic, ClinicState } from '@/types/clinic';

import { createAdminClient } from '@/lib/supabase';

interface AreaData {
  id: string;
  name: string;
  slug: string;
  image: string;
  state: Partial<ClinicState>;
  clinics: Partial<Clinic>[];
}

export const getAreaMetadataBySlug = unstable_cache(
  async (areaSlug: string) => {
    const supabase = createAdminClient();

    const { data: area } = await supabase.rpc('get_area_metadata_by_slug', {
      area_slug: areaSlug,
    });

    return area as AreaData | null;
  },
  ['area-metadata-by-slug'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['areas'],
  },
);

export const getAreasForBrowse = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const { data: areasData } = await supabase
      .from('areas')
      .select('id, name, slug, state_id', { count: 'exact' });

    return areasData || [];
  },
  ['areas-for-browse'],
  {
    revalidate: 2592000, // Cache for 30 days
    tags: ['areas'],
  },
);

export const getAreaListings =
  async () => {
    const supabase = createAdminClient();

    const { data: areaData } = (await supabase.from('areas').select(
      `
        id,
        name,
        slug,
        state:states(name, slug)
      `,
    )) as {
      data: {
        id: string;
        name: string;
        slug: string;
        state: {
          name: string;
          slug: string;
        };
      }[];
    };

    return areaData ?? [];
  }

/**
 * Fetches an area by its slug with all related data using admin client for static generation
 */
export const getAreaBySlug = unstable_cache(
  async (areaSlug: string, from: number, to: number) => {
    const supabase = createAdminClient();

    const { data: area } = await supabase.rpc('get_ranged_area_metadata_by_slug', {
      area_slug: areaSlug,
      from_index: from,
      to_index: to,
    });

    return area as AreaData | null;
  },
  ['area-by-slug'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['areas'],
  },
);
