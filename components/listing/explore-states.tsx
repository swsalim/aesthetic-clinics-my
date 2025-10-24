import { unstable_cache } from 'next/cache';
import Link from 'next/link';

import pluralize from 'pluralize';

import { createAdminClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

import { ImageKit } from '../image/image-kit';

const getPopularStatesWithRandomization = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    // First get all states
    const { data: allStates, error: statesError } = await supabase
      .from('states')
      .select('id, name, slug, image');

    if (statesError) {
      console.error('Error fetching states:', statesError);
      return [];
    }

    if (!allStates || allStates.length === 0) {
      return [];
    }

    // Then get clinic counts for each state
    const statesWithCounts = await Promise.all(
      allStates.map(async (state) => {
        const { count, error: countError } = await supabase
          .from('clinics')
          .select('*', { count: 'exact', head: true })
          .eq('state_id', state.id)
          .eq('status', 'approved')
          .eq('is_active', true);

        if (countError) {
          console.error(`Error fetching clinic count for ${state.name}:`, countError);
        }

        return {
          ...state,
          clinics: [{ count: count || 0 }],
        };
      }),
    );

    const filteredStates = statesWithCounts
      .filter((state) => state.clinics[0].count > 0)
      .sort((a, b) => b.clinics[0].count - a.clinics[0].count)
      .slice(0, 8);

    // Randomize the order for display (this will be cached for 1 hour)
    const randomizedStates = filteredStates.sort(() => 0.5 - Math.random());

    return randomizedStates;
  },
  ['popular-states-randomized'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['popular-states'],
  },
);

export async function ExploreStates() {
  const states = await getPopularStatesWithRandomization();

  // Show loading state if no states are provided
  if (!states || states.length === 0) {
    return (
      <Wrapper className="bg-gray-50 dark:bg-gray-950/30">
        <Container>
          <div className="mb-10 flex flex-col gap-2 text-center md:mb-12">
            <h2 className="text-balance text-3xl font-black">
              Top States for Aesthetic Clinics in Malaysia
            </h2>
            <p className="text-lg font-medium text-gray-500 dark:text-gray-300">
              Looking for aesthetic care? Start by exploring the most popular states below,
              featuring top-rated clinics.
            </p>
          </div>
          <div className="py-8 text-center">
            <p className="text-gray-500">Loading states...</p>
          </div>
        </Container>
      </Wrapper>
    );
  }

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
        <div className="lg:grid-cols- grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-6">
          {states.map((state, index) => (
            <div
              key={state.id}
              className={cn(
                'overflow-hidden',
                (index === 0 || index === 6) && 'lg:col-span-3 lg:row-span-2',
                index === 2 && 'lg:col-span-2',
                index === 3 && 'lg:col-span-3',
                index === 5 && 'lg:col-span-2',
                index === 7 && 'lg:col-span-3',
                index === 8 && 'lg:col-span-2',
              )}>
              <Link
                href={`/${state.slug}`}
                className="relative overflow-hidden rounded-lg text-blue-300">
                <div
                  className={cn(
                    'group relative h-56 w-full overflow-hidden rounded-lg transition md:h-52 lg:h-56',
                    (index === 0 || index === 6) && 'lg:h-full lg:max-h-[480px]',
                  )}>
                  {state.image && (
                    <ImageKit
                      src={state.image}
                      alt={state.name}
                      width={600}
                      height={600}
                      sizes="(max-width: 600px) 100vw, 350px"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                  {!state.image && (
                    <ImageKit
                      src="placeholder-location.jpg"
                      alt={state.name}
                      width={600}
                      height={600}
                      sizes="(max-width: 600px) 100vw, 350px"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="absolute -bottom-1 left-0 right-0 h-4/5 rounded-b-lg bg-gradient-to-t from-gray-900/100 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                  <h3 className="text-lg font-semibold">{state.name}</h3>
                  <p className="text-base font-medium text-gray-100 dark:text-gray-100">
                    {state.clinics?.[0].count} {pluralize('clinic', state.clinics?.[0].count)}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </Wrapper>
  );
}
