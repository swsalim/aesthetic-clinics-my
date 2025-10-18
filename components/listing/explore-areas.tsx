import { createServerClient } from '@/lib/supabase';

import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

import { ExploreAreasClient } from './explore-areas-client';

export async function ExploreAreas() {
  const supabase = await createServerClient();
  const { data: areas } = await supabase
    .from('areas')
    .select('id, name, slug, thumbnail_image, state:states (slug), clinics(count)')
    .eq('clinics.status', 'approved');

  const sortedAreas = areas
    ? [...areas].sort((a, b) => b.clinics[0].count - a.clinics[0].count).slice(0, 8)
    : [];

  return (
    <Wrapper>
      <Container>
        <div className="mb-10 flex flex-col gap-4 text-center md:mb-12">
          <span className="text-base font-semibold uppercase text-red-500">Popular Areas</span>
          <h2 className="text-balance text-3xl font-black">
            Explore aesthetic clinics in popular areas
          </h2>
          <p className="text-base font-medium text-gray-700">
            We&apos;ve compiled a list of aesthetic clinics in these locations.
          </p>
        </div>
        <ExploreAreasClient areas={sortedAreas} />
      </Container>
    </Wrapper>
  );
}
