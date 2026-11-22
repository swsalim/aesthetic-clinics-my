'use client';

import { type ReactNode, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { CaretDown, SlidersHorizontal, Star } from '@phosphor-icons/react';

import {
  hasActiveLocationFilters,
  type ListingClinic,
  listingResultRange,
  type LocationFacets,
  locationFilterHref,
  type LocationFilters,
  locationListingRequest,
  type LocationScope,
  type LocationSort,
  parseLocationFilters,
} from '@/lib/listing/location-filters';
import { cn } from '@/lib/utils';

import { ClinicResultGrid } from '@/components/listing/location/clinic-result-grid';
import { LocationFilterPanel } from '@/components/listing/location/location-filter-panel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';

const SORT_OPTIONS: { value: LocationSort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'rating', label: 'Rating (high to low)' },
  { value: 'rating-asc', label: 'Rating (low to high)' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name (Z–A)' },
];

type FilteredPayload = {
  clinics: ListingClinic[];
  total: number;
  page: number;
  totalPages: number;
};

export function LocationBrowser({
  basePath,
  scope,
  limit,
  currentPage,
  totalClinics,
  totalPages,
  clinics,
  facets,
  showSampleCards,
  sampleState,
  sampleArea,
  emptyHref,
  listHeading,
}: {
  basePath: string;
  scope: LocationScope;
  limit: number;
  currentPage: number;
  totalClinics: number;
  totalPages: number;
  clinics: ListingClinic[];
  facets: LocationFacets;
  showSampleCards: boolean;
  sampleState: string;
  sampleArea?: string;
  emptyHref: string;
  listHeading: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const search = params.toString();
  const filters = parseLocationFilters(params);
  const active = hasActiveLocationFilters(filters);
  const [filtered, setFiltered] = useState<FilteredPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const stateSlug = scope.stateSlug;
  const areaSlug = scope.kind === 'area' ? scope.areaSlug : '';

  useEffect(() => {
    const nextFilters = parseLocationFilters(new URLSearchParams(search));
    if (!hasActiveLocationFilters(nextFilters)) {
      setFiltered(null);
      setError('');
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(locationListingRequest(scope, nextFilters, limit), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('filter failed');
        return (await response.json()) as FilteredPayload;
      })
      .then((payload) => {
        setFiltered(payload);
        setError('');
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError('Couldn’t update the clinics. Try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [areaSlug, limit, scope, search, stateSlug]);

  const replaceFilters = (next: LocationFilters) => {
    router.replace(locationFilterHref(basePath, next), { scroll: false });
  };

  const shownClinics = active ? (filtered?.clinics ?? []) : clinics;
  const shownTotal = active ? (filtered?.total ?? 0) : totalClinics;
  const shownPage = active ? (filtered?.page ?? filters.page) : currentPage;
  const shownPages = active ? (filtered?.totalPages ?? 0) : totalPages;
  const range = listingResultRange(shownPage, limit, shownTotal);
  const waiting = active && loading && !filtered;
  const chipCount =
    Number(Boolean(filters.availability)) +
    Number(filters.weekend) +
    Number(filters.instagram) +
    Number(filters.facebook) +
    Number(filters.website) +
    Number(Boolean(filters.rating)) +
    filters.services.length;

  return (
    <div className="lg:grid lg:grid-cols-sidebar-left lg:items-start lg:gap-8 xl:gap-10">
      <aside className="hidden lg:block">
        <div className="scrollbar-none lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:min-h-[650px] lg:overflow-y-auto lg:pr-1 [&::-webkit-scrollbar]:hidden">
          <LocationFilterPanel
            idPrefix="desktop"
            facets={facets}
            filters={filters}
            onChange={replaceFilters}
          />
        </div>
      </aside>

      <div id="city-listings" className="min-w-0 scroll-mt-24">
        <h2 className="mb-4 text-balance font-display text-xl font-bold text-gray-950 md:text-2xl dark:text-white">
          {listHeading}
        </h2>
        <div className="scrollbar-none mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden [&::-webkit-scrollbar]:hidden">
          <FilterChip
            pressed={filters.availability === 'open'}
            onClick={() =>
              replaceFilters({
                ...filters,
                availability: filters.availability === 'open' ? '' : 'open',
                page: 1,
              })
            }>
            Open ({facets.open.toLocaleString('en-MY')})
          </FilterChip>
          {facets.weekend > 0 ? (
            <FilterChip
              pressed={filters.weekend}
              onClick={() => replaceFilters({ ...filters, weekend: !filters.weekend, page: 1 })}>
              Weekends ({facets.weekend.toLocaleString('en-MY')})
            </FilterChip>
          ) : null}
          {facets.instagram > 0 ? (
            <FilterChip
              pressed={filters.instagram}
              onClick={() => replaceFilters({ ...filters, instagram: !filters.instagram, page: 1 })}>
              Instagram ({facets.instagram.toLocaleString('en-MY')})
            </FilterChip>
          ) : null}
          <FilterChip
            pressed={filters.rating === '4.5'}
            onClick={() =>
              replaceFilters({
                ...filters,
                rating: filters.rating === '4.5' ? '' : '4.5',
                page: 1,
              })
            }>
            <Star weight="fill" className="size-3.5 text-amber-400" aria-hidden="true" />
            4.5+
          </FilterChip>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            onClick={() => setSheetOpen(true)}>
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filters{chipCount > 0 ? ` (${chipCount})` : ''}
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
            {waiting
              ? 'Updating clinics'
              : shownTotal > 0
                ? `Showing ${range.from}–${range.to} of ${shownTotal.toLocaleString('en-MY')} clinics`
                : 'No clinics match these filters'}
          </p>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <span className="shrink-0 font-semibold">Sort</span>
            <span className="relative">
              <select
                value={filters.sort}
                onChange={(event) =>
                  replaceFilters({
                    ...filters,
                    sort: event.target.value as LocationSort,
                    page: 1,
                  })
                }
                className="h-10 appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50">
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <CaretDown
                className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-gray-500"
                aria-hidden="true"
              />
            </span>
          </label>
        </div>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <div className={cn(loading && 'opacity-60')} aria-busy={loading}>
          {waiting ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="h-72 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
              <div className="hidden h-72 animate-pulse rounded-2xl bg-gray-100 sm:block dark:bg-gray-800" />
            </div>
          ) : error ? null : shownClinics.length > 0 || (!active && showSampleCards) ? (
            <ClinicResultGrid
              clinics={shownClinics}
              showSampleCards={!active && showSampleCards}
              sampleState={sampleState}
              sampleArea={sampleArea}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center dark:border-gray-700">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                No clinics match these filters.
              </p>
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-blue-600"
                onClick={() => router.replace(emptyHref, { scroll: false })}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        <Pagination
          currentPage={shownPage}
          totalPages={shownPages}
          basePath={active ? undefined : basePath}
          onPageChange={
            active
              ? (page) => {
                  replaceFilters({ ...filters, page });
                }
              : undefined
          }
        />
      </div>

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="bottom-0 left-0 top-auto max-h-[85vh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-b-none rounded-t-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg">
          <DialogHeader>
            <DialogTitle>Filter clinics</DialogTitle>
          </DialogHeader>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-50">
            Sort
            <select
              value={filters.sort}
              onChange={(event) =>
                replaceFilters({
                  ...filters,
                  sort: event.target.value as LocationSort,
                  page: 1,
                })
              }
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium dark:border-gray-700 dark:bg-gray-900">
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <LocationFilterPanel
            idPrefix="mobile"
            facets={facets}
            filters={filters}
            onChange={replaceFilters}
            showHeading={false}
          />
          <Button type="button" className="w-full" onClick={() => setSheetOpen(false)}>
            Show clinics
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold',
        pressed
          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200'
          : 'border-gray-200 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
      )}>
      {children}
    </button>
  );
}
