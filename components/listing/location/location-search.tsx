'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { locationFilterHref, parseLocationFilters } from '@/lib/listing/location-filters';

import { LocationSearchForm } from '@/components/listing/location/location-search-form';

export function LocationSearch({
  basePath,
  placeholder,
}: {
  basePath: string;
  placeholder: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const filters = parseLocationFilters(params);
  const [query, setQuery] = useState(filters.q);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    setQuery(filters.q);
  }, [filters.q]);

  useEffect(() => {
    if (query.trim() === filtersRef.current.q) return undefined;

    const timer = window.setTimeout(() => {
      router.replace(locationFilterHref(basePath, { ...filtersRef.current, q: query, page: 1 }), {
        scroll: false,
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [basePath, query, router]);

  return (
    <LocationSearchForm
      basePath={basePath}
      placeholder={placeholder}
      query={query}
      onQueryChange={setQuery}
      onSubmit={() => {
        router.replace(locationFilterHref(basePath, { ...filters, q: query, page: 1 }), {
          scroll: false,
        });
      }}
    />
  );
}
