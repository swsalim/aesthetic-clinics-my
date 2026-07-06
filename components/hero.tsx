import { unstable_cache } from 'next/cache';
import Link from 'next/link';

import { ArrowRightIcon } from 'lucide-react';
import pluralize from 'pluralize';

import { createAdminClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

/* Hallmark · macrostructure: Stat-Led · genre: editorial · tone: utilitarian
 * hero: H4 split-type + index panel · enrichment: none
 * audience: patients choosing a clinic · use: browse by location · anchor: site blue
 */

const getHeroStats = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const [{ count: clinicCount }, { count: doctorCount }, { data: statesData }] =
      await Promise.all([
        supabase
          .from('clinics')
          .select('*', { count: 'exact', head: true })
          .match({ is_active: true, status: 'approved' }),
        supabase.from('clinic_doctors').select('*', { count: 'exact', head: true }),
        supabase
          .from('states')
          .select('id, clinics(count)')
          .eq('clinics.status', 'approved')
          .eq('clinics.is_active', true),
      ]);

    const stateCount = (statesData || []).filter(
      (state) => (state.clinics?.[0]?.count ?? 0) > 0,
    ).length;

    return {
      clinicCount: clinicCount || 0,
      doctorCount: doctorCount || 0,
      stateCount,
    };
  },
  ['hero-stats'],
  {
    revalidate: 1_209_600,
    tags: ['hero-stats', 'clinics', 'doctors', 'states'],
  },
);

function formatCount(value: number) {
  return value.toLocaleString('en-MY');
}

export async function Hero() {
  const { clinicCount, doctorCount, stateCount } = await getHeroStats();
  const hasStats = clinicCount > 0;

  return (
    <Wrapper as="div" size="sm" className="pb-6 md:pb-8">
      <Container className="min-w-0">
        <div className="grid min-w-0 grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-14">
          <div className="min-w-0">
            <div className="mb-6 h-1 w-12 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden="true" />

            <h1 className="max-w-2xl text-balance font-display text-[clamp(2rem,5vw,3.25rem)] font-black leading-[1.08] tracking-tight text-gray-900 dark:text-gray-50">
              Find LCP-certified aesthetic clinics in Malaysia
            </h1>

            <p className="mt-5 max-w-xl text-balance text-base font-medium leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
              Browse top-rated LCP-certified aesthetic clinics and qualified aesthetic doctors in
              Malaysia with peace of mind.
            </p>

            <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/browse"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: 'primary', size: 'large', rounded: true }),
                  'w-full justify-center sm:w-auto',
                )}>
                Browse all states
                <ArrowRightIcon className="ms-2 size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/doctors"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'large', rounded: true }),
                  'w-full justify-center sm:w-auto',
                )}>
                Browse doctors
              </Link>
            </div>
          </div>

          {hasStats && (
            <aside
              className="min-w-0 rounded-xl border border-gray-200 border-l-[3px] border-l-blue-500 bg-gray-50/80 p-5 sm:p-6 dark:border-gray-700 dark:border-l-blue-400 dark:bg-gray-900/50"
              aria-label="Directory overview">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Directory at a glance
              </p>
              <dl className="mt-4 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Clinics
                  </dt>
                  <dd className="mt-1 truncate font-display text-2xl font-black tabular-nums text-gray-900 sm:text-3xl dark:text-gray-50">
                    {formatCount(clinicCount)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    States
                  </dt>
                  <dd className="mt-1 truncate font-display text-2xl font-black tabular-nums text-gray-900 sm:text-3xl dark:text-gray-50">
                    {formatCount(stateCount)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Doctors
                  </dt>
                  <dd className="mt-1 truncate font-display text-2xl font-black tabular-nums text-gray-900 sm:text-3xl dark:text-gray-50">
                    {formatCount(doctorCount)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {formatCount(clinicCount)} listed {pluralize('clinic', clinicCount)} across{' '}
                {formatCount(stateCount)} {pluralize('state', stateCount)}.
              </p>
            </aside>
          )}
        </div>
      </Container>
    </Wrapper>
  );
}
