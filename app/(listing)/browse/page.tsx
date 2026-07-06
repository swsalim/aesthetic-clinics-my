import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';

import { ClinicArea } from '@/types/clinic';
import { ClinicState } from '@/types/clinic';
import { ArrowRightIcon, MapPinIcon } from 'lucide-react';
import pluralize from 'pluralize';

import { siteConfig } from '@/config/site';

import { createAdminClient } from '@/lib/supabase';
import { absoluteUrl } from '@/lib/utils';

import { ImageKit } from '@/components/image/image-kit';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

import { BROWSE_STATE_SCROLL_OFFSET } from './browse-scroll';
import { BrowseStateJumpNav } from './browse-state-jump-nav';

/* Hallmark · macrostructure: Ecosystem Index · genre: editorial · tone: utilitarian
 * nav: in-page jump rail · footer: n/a (site chrome) · enrichment: none
 * audience: patients browsing by location · use: pick a state/city · anchor: site blue
 */

const config = {
  title: 'Find Top LCP-Certified Aesthetic Clinics across Malaysia',
  description:
    'Find top LCP-certified aesthetic clinics all over Malaysia and book an appointment today.',
  url: '/browse',
};

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: {
    canonical: config.url,
  },
  openGraph: {
    title: config.title,
    description: config.description,
    url: config.url,
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${config.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    title: config.title,
    description: config.description,
    card: 'summary_large_image',
    creator: siteConfig.creator,
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${config.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
  },
};

type BrowseState = Pick<ClinicState, 'id' | 'name' | 'slug' | 'image'> & { clinicCount: number };
type BrowseArea = Pick<ClinicArea, 'id' | 'name' | 'slug' | 'state_id'> & { clinicCount: number };

const getBrowseData = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const [{ data: statesData }, { data: areasData }, { count: clinicCount }] = await Promise.all([
      supabase
        .from('states')
        .select('id, name, slug, image, clinics(count)')
        .eq('clinics.status', 'approved')
        .eq('clinics.is_active', true),
      supabase
        .from('areas')
        .select('id, name, slug, state_id, clinics(count)')
        .eq('clinics.status', 'approved')
        .eq('clinics.is_active', true),
      supabase
        .from('clinics')
        .select('*', { count: 'exact', head: true })
        .match({ is_active: true, status: 'approved' }),
    ]);

    const states: BrowseState[] = (statesData || [])
      .map((state) => ({
        id: state.id,
        name: state.name,
        slug: state.slug,
        image: state.image,
        clinicCount: state.clinics?.[0]?.count ?? 0,
      }))
      .filter((state) => state.clinicCount > 0);

    const areas: BrowseArea[] = (areasData || [])
      .map((area) => ({
        id: area.id,
        name: area.name,
        slug: area.slug,
        state_id: area.state_id,
        clinicCount: area.clinics?.[0]?.count ?? 0,
      }))
      .filter((area) => area.clinicCount > 0);

    return {
      states,
      areas,
      stateCount: states.length,
      areaCount: areas.length,
      clinicCount: clinicCount || 0,
    };
  },
  ['browse-data'],
  {
    revalidate: 1_209_600,
    tags: ['browse-data', 'states', 'areas', 'clinics'],
  },
);

function formatCount(value: number) {
  return value.toLocaleString('en-MY');
}

export default async function BrowsePage() {
  const { states, areas, clinicCount, stateCount, areaCount } = await getBrowseData();

  const stateIdsWithAreas = new Set(areas.map((area) => area.state_id));
  const visibleStates = states.filter((state) => stateIdsWithAreas.has(state.id));
  const indexedStates = [...visibleStates].sort((a, b) => a.name.localeCompare(b.name));

  const JSONLDbreadcrumbs = [
    { position: '1', name: 'Home', item: absoluteUrl('/') },
    { position: '2', name: 'Browse', item: absoluteUrl('/browse') },
  ];

  const breadcrumbItems = [{ name: 'Browse' }];

  return (
    <>
      <WebPageJsonLd
        description={config.description}
        id="/browse"
        reviewedBy={process.env.NEXT_PUBLIC_SCHEMA_REVIEWER}
      />
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <Wrapper>
        <Container className="min-w-0">
          <div className="mb-8 flex min-w-0 flex-col gap-8 md:mb-12 md:gap-10">
            <Breadcrumb items={breadcrumbItems} />

            <header className="min-w-0 border-b border-gray-200 pb-8 md:pb-10 dark:border-gray-700">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Locations
              </p>
              <h1 className="font-display max-w-3xl text-balance text-3xl font-black leading-tight text-gray-900 md:text-4xl dark:text-gray-50">
                {config.title}
              </h1>
              <p className="mt-4 max-w-2xl text-balance text-base font-medium text-gray-600 md:text-lg dark:text-gray-300">
                {config.description} Pick a state, then a city. Every listing includes reviews,
                services, and opening hours. Looking for a specific doctor?{' '}
                <Link href="/doctors" prefetch={false}>
                  Browse doctors
                </Link>
                .
              </p>

              {clinicCount > 0 && (
                <dl className="mt-8 grid min-w-0 grid-cols-3 gap-3 sm:max-w-lg sm:gap-4">
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 dark:border-gray-700 dark:bg-gray-800/50">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Clinics
                    </dt>
                    <dd className="mt-1 truncate text-xl font-bold tabular-nums text-gray-900 sm:text-2xl dark:text-gray-50">
                      {formatCount(clinicCount)}
                    </dd>
                  </div>
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 dark:border-gray-700 dark:bg-gray-800/50">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      States
                    </dt>
                    <dd className="mt-1 truncate text-xl font-bold tabular-nums text-gray-900 sm:text-2xl dark:text-gray-50">
                      {formatCount(stateCount)}
                    </dd>
                  </div>
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 dark:border-gray-700 dark:bg-gray-800/50">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Cities
                    </dt>
                    <dd className="mt-1 truncate text-xl font-bold tabular-nums text-gray-900 sm:text-2xl dark:text-gray-50">
                      {formatCount(areaCount)}
                    </dd>
                  </div>
                </dl>
              )}
            </header>

            {indexedStates.length > 0 && <BrowseStateJumpNav states={indexedStates} />}

            <div className="flex min-w-0 flex-col gap-8 md:gap-10">
              {indexedStates.map((state) => {
                const stateAreas = areas
                  .filter((area) => area.state_id === state.id)
                  .sort((a, b) => a.name.localeCompare(b.name));

                return (
                  <section
                    key={state.id}
                    id={`state-${state.slug}`}
                    aria-labelledby={`state-heading-${state.slug}`}
                    className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40"
                    style={{ scrollMarginTop: BROWSE_STATE_SCROLL_OFFSET }}>
                    <Link
                      href={`/${state.slug}`}
                      prefetch={false}
                      className="group relative block aspect-[16/9] overflow-hidden no-underline md:aspect-[21/9]">
                      <ImageKit
                        src={state.image || 'placeholder-location.jpg'}
                        alt={state.name}
                        width={960}
                        height={411}
                        sizes="100vw"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/85 via-gray-900/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 flex min-w-0 items-end justify-between gap-4 p-4 sm:p-6">
                        <div className="min-w-0">
                          <h2
                            id={`state-heading-${state.slug}`}
                            className="font-display truncate text-xl font-bold capitalize text-white sm:text-2xl">
                            {state.name}
                          </h2>
                          <p className="mt-1 text-sm font-medium text-gray-200 sm:text-base">
                            {formatCount(state.clinicCount)}{' '}
                            {pluralize('clinic', state.clinicCount)}
                          </p>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/30 bg-transparent px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition group-hover:bg-white group-hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800/40 dark:group-hover:text-gray-800">
                          View all
                          <ArrowRightIcon className="size-4" aria-hidden="true" />
                        </span>
                      </div>
                    </Link>

                    <ul className="grid min-w-0 grid-cols-1 gap-2 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                      {stateAreas.map((area) => (
                        <li key={area.id} className="min-w-0">
                          <Link
                            href={`/${state.slug}/${area.slug}`}
                            prefetch={false}
                            className="dark:bg-blue-950/40 dark:hover:bg-blue-950/30 group flex min-w-0 items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 no-underline transition hover:border-blue-200 hover:bg-blue-50 dark:hover:border-blue-800">
                            <MapPinIcon
                              className="mt-0.5 size-4 shrink-0 text-gray-400 group-hover:text-blue-500 dark:text-gray-500 dark:group-hover:text-blue-400"
                              aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium capitalize text-gray-900 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-500">
                                {area.name}
                              </span>
                              <span className="block text-sm text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-500">
                                {formatCount(area.clinicCount)}{' '}
                                {pluralize('clinic', area.clinicCount)}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </div>
        </Container>
      </Wrapper>
    </>
  );
}
