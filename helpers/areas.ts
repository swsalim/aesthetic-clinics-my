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
  total_clinics: number;
}

export const getAreaListings = async () => {
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
};

export const getAreaBySlug = async (
  areaSlug: string,
  from: number,
  to: number,
): Promise<AreaData | null> => {
  // Capture parameters immediately to avoid closure issues in concurrent requests
  const slug = areaSlug;
  const fromIndex = from;
  const toIndex = to;

  // Validate inputs
  if (!slug || typeof slug !== 'string') {
    console.error('Invalid areaSlug provided to getAreaBySlug:', areaSlug);
    return null;
  }

  return unstable_cache(
    async () => {
      const supabase = createAdminClient();

      const { data: area, error } = await supabase.rpc('get_ranged_area_metadata_by_slug', {
        area_slug: slug,
        from_index: fromIndex,
        to_index: toIndex,
      });

      if (error) {
        console.error(
          `Error fetching area by slug "${slug}" (from: ${fromIndex}, to: ${toIndex}):`,
          error,
        );
        return null;
      }

      return area as AreaData | null;
    },
    [`area-${slug}-${fromIndex}-${toIndex}`],
    {
      revalidate: 1_209_600, // Cache for 2 weeks
      tags: ['areas', `area-${slug}`],
    },
  )();
};
