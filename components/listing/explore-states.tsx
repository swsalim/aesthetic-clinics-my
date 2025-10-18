import { unstable_cache } from 'next/cache';

import { createServerClient } from '@/lib/supabase';

import { ExploreStatesClient } from '@/components/listing/explore-states-client';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

const getPopularStates = unstable_cache(
  async (supabase: Awaited<ReturnType<typeof createServerClient>>) => {
    const { data: states } = await supabase
      .from('states')
      .select('id, name, slug, image, clinics:clinics(count)')
      .eq('clinics.status', 'approved');

    return states
      ? [...states].sort((a, b) => b.clinics[0].count - a.clinics[0].count).slice(0, 8)
      : [];
  },
  ['popular-states'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['popular-states'],
  },
);

export async function ExploreStates() {
  const supabase = await createServerClient();
  const sortedStates = await getPopularStates(supabase);

  return (
    <Wrapper className="bg-gray-50 dark:bg-gray-950/30">
      <Container>
        <div className="mb-10 flex flex-col gap-2 text-center md:mb-12">
          <h2 className="text-balance text-3xl font-black">
            Top States for Aesthetic Clinics in Malaysia
          </h2>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-300">
            Looking for aesthetic care? Start by exploring the most popular states below, featuring
            top-rated clinics.
          </p>
        </div>
        <ExploreStatesClient states={sortedStates} />
      </Container>
    </Wrapper>
  );
}
