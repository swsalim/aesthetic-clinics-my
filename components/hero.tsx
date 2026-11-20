import { unstable_cache } from 'next/cache';
import Link from 'next/link';

import { ArrowRightIcon } from 'lucide-react';
import pluralize from 'pluralize';

import { groupClinicChains } from '@/lib/chains';
import { hasAdminCredentials } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

import { fetchChainBranches } from '@/helpers/chains';
import { embeddedCount } from '@/helpers/listing-clinics';

import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

/* Redesign · preserve brand tokens · trust-first directory
 * asymmetric split · stats as quiet measures (no accent border / card chrome)
 */

export type HeroStateCount = { name: string; slug: string; clinicCount: number };
export type HeroCityCount = {
  name: string;
  slug: string;
  stateSlug: string;
  clinicCount: number;
};
export type HeroChainCount = { name: string; slug: string; branchCount: number };

const emptyHeroStats = {
  clinicCount: 0,
  doctorCount: 0,
  stateCount: 0,
  states: [] as HeroStateCount[],
  cities: [] as HeroCityCount[],
  chains: [] as HeroChainCount[],
};

export const getHeroStats = unstable_cache(
  async () => {
    if (!hasAdminCredentials()) {
      return emptyHeroStats;
    }

    const supabase = createAdminClient();

    const [
      { count: clinicCount, error: clinicError },
      { count: doctorCount, error: doctorError },
      { data: statesData, error: statesError },
      { data: areaData, error: areaError },
      branches,
    ] =
      await Promise.all([
        supabase
          .from('clinics')
          .select('*', { count: 'exact', head: true })
          .match({ is_active: true, status: 'approved' }),
        supabase.from('clinic_doctors').select('*', { count: 'exact', head: true }),
        supabase
          .from('states')
          .select('id, name, slug, clinics(count)')
          .eq('clinics.status', 'approved')
          .eq('clinics.is_active', true),
        supabase
          .from('areas')
          .select('name, slug, state:states!inner(slug), clinics(count)')
          .eq('clinics.status', 'approved')
          .eq('clinics.is_active', true),
        fetchChainBranches(),
      ]);

    if (clinicError) throw new Error(`Failed to count clinics: ${clinicError.message}`);
    if (doctorError) throw new Error(`Failed to count doctors: ${doctorError.message}`);
    if (statesError) throw new Error(`Failed to count clinics by state: ${statesError.message}`);
    if (areaError) throw new Error(`Failed to count clinics by city: ${areaError.message}`);

    const statesBySlug = new Map<string, HeroStateCount>();
    for (const state of statesData || []) {
      const clinicCountForState = embeddedCount(state.clinics);
      if (!state.slug) continue;
      const existing = statesBySlug.get(state.slug);
      if (existing) {
        existing.clinicCount += clinicCountForState;
      } else {
        statesBySlug.set(state.slug, {
          name: state.name,
          slug: state.slug,
          clinicCount: clinicCountForState,
        });
      }
    }

    const citiesByKey = new Map<string, HeroCityCount>();
    for (const area of areaData || []) {
      const state = Array.isArray(area.state) ? area.state[0] : area.state;
      const clinicCountForCity = embeddedCount(area.clinics);
      if (!area.slug || !state?.slug || clinicCountForCity <= 0) continue;
      const key = `${state.slug}/${area.slug}`;
      const existing = citiesByKey.get(key);
      if (existing) {
        existing.clinicCount += clinicCountForCity;
      } else {
        citiesByKey.set(key, {
          name: area.name,
          slug: area.slug,
          stateSlug: state.slug,
          clinicCount: clinicCountForCity,
        });
      }
    }

    return {
      clinicCount: clinicCount || 0,
      doctorCount: doctorCount || 0,
      stateCount: [...statesBySlug.values()].filter((state) => state.clinicCount > 0).length,
      states: [...statesBySlug.values()].sort(
        (a, b) => b.clinicCount - a.clinicCount || a.name.localeCompare(b.name),
      ),
      cities: [...citiesByKey.values()].sort(
        (a, b) => b.clinicCount - a.clinicCount || a.name.localeCompare(b.name),
      ),
      chains: groupClinicChains(branches)
        .map((group) => ({
          name: group.name,
          slug: group.slug,
          branchCount: group.branches.length,
        }))
        .sort((a, b) => b.branchCount - a.branchCount || a.name.localeCompare(b.name)),
    };
  },
  ['hero-stats-v2'],
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

  const stats = [
    { label: 'Clinics', value: clinicCount },
    { label: 'States', value: stateCount },
    { label: 'Doctors', value: doctorCount },
  ];

  return (
    <Wrapper as="div" size="sm" className="pb-6 md:pb-8">
      <Container className="min-w-0">
        <div className="grid min-w-0 grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:gap-16">
          <div className="min-w-0">
            <h1 className="max-w-2xl text-balance font-display text-[clamp(2rem,5vw,3.25rem)] font-black leading-[1.1] tracking-tight text-gray-900 dark:text-gray-50">
              Aesthetic clinics in Malaysia
            </h1>

            <p className="mt-5 max-w-xl text-balance text-base font-medium leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
              Browse aesthetic clinics and aesthetic doctors listed in Malaysia by state and city.
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
            <aside className="min-w-0 lg:pb-1" aria-label="Directory overview">
              <dl className="grid min-w-0 grid-cols-3 gap-4 border-t border-gray-200 pt-5 lg:grid-cols-1 lg:gap-6 lg:border-t-0 lg:border-s lg:border-gray-200 lg:pt-0 lg:ps-8 dark:border-gray-700">
                {stats.map((stat) => (
                  <div key={stat.label} className="min-w-0">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</dt>
                    <dd className="mt-1 truncate font-display text-2xl font-black tabular-nums tracking-tight text-gray-900 sm:text-3xl dark:text-gray-50">
                      {formatCount(stat.value)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 hidden text-sm leading-relaxed text-gray-500 lg:block dark:text-gray-400">
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
