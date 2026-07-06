import { unstable_cache } from 'next/cache';
import Link from 'next/link';

import { ArrowRightIcon } from 'lucide-react';
import pluralize from 'pluralize';

import { createAdminClient } from '@/lib/supabase';

import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

import { ImageKit } from '../image/image-kit';

type PopularState = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  clinicCount: number;
};

const getPopularStates = unstable_cache(
  async (): Promise<PopularState[]> => {
    const supabase = createAdminClient();

    const { data: statesData, error: statesError } = await supabase
      .from('states')
      .select('id, name, slug, image, clinics(count)')
      .eq('clinics.status', 'approved')
      .eq('clinics.is_active', true);

    if (statesError) {
      console.error('Error fetching states:', statesError);
      return [];
    }

    return (statesData || [])
      .map((state) => ({
        id: state.id,
        name: state.name,
        slug: state.slug,
        image: state.image,
        clinicCount: state.clinics?.[0]?.count ?? 0,
      }))
      .filter((state) => state.clinicCount > 0)
      .sort((a, b) => b.clinicCount - a.clinicCount)
      .slice(0, 8);
  },
  ['popular-states'],
  {
    revalidate: 1_209_600,
    tags: ['states', 'clinics'],
  },
);

function formatCount(value: number) {
  return value.toLocaleString('en-MY');
}

export async function ExploreStates() {
  const states = await getPopularStates();

  if (states.length === 0) {
    return null;
  }

  return (
    <Wrapper className="border-t border-gray-200 dark:border-gray-800">
      <Container className="min-w-0">
        <div className="mb-8 flex min-w-0 flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h2 className="font-display text-balance text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
              Browse by state
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
              States with the most listed clinics — open one to compare practices in your area.
            </p>
          </div>
          <Link
            href="/browse"
            prefetch={false}
            className="inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-blue-600 no-underline transition hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:self-auto dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:outline-blue-400">
            Browse all locations
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {states.map((state) => (
            <li key={state.id} className="min-w-0">
              <Link
                href={`/${state.slug}`}
                prefetch={false}
                className="group block min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white no-underline transition hover:border-blue-200 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-blue-700">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <ImageKit
                    src={state.image || 'placeholder-location.jpg'}
                    alt={state.name}
                    width={480}
                    height={270}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/85 via-gray-900/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display truncate text-base font-bold capitalize text-white md:text-lg">
                      {state.name}
                    </h3>
                    <p className="mt-0.5 text-sm font-medium text-gray-200">
                      {formatCount(state.clinicCount)} {pluralize('clinic', state.clinicCount)}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Wrapper>
  );
}
