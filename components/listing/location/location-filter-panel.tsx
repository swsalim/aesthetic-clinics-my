'use client';

import { useState } from 'react';

import {
  LOCATION_RATING_OPTIONS,
  type LocationFacets,
  type LocationFilters,
} from '@/lib/listing/location-filters';

import { RatingStars } from '@/components/listing/location/rating-stars';

const SERVICE_PREVIEW = 6;

export function LocationFilterPanel({
  idPrefix,
  facets,
  filters,
  onChange,
  showHeading = true,
}: {
  idPrefix: string;
  facets: LocationFacets;
  filters: LocationFilters;
  onChange: (next: LocationFilters) => void;
  showHeading?: boolean;
}) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const visibleServices = servicesOpen ? facets.services : facets.services.slice(0, SERVICE_PREVIEW);
  const filtersSelected =
    Boolean(filters.availability) ||
    filters.weekend ||
    filters.instagram ||
    filters.facebook ||
    filters.website ||
    Boolean(filters.rating) ||
    filters.services.length > 0 ||
    filters.sort !== 'featured';

  const update = (patch: Partial<LocationFilters>) => {
    onChange({ ...filters, ...patch, page: 1 });
  };

  const toggleService = (slug: string) => {
    const services = filters.services.includes(slug)
      ? filters.services.filter((item) => item !== slug)
      : [...filters.services, slug];
    update({ services });
  };

  const clear = () =>
    onChange({
      ...filters,
      availability: '',
      weekend: false,
      instagram: false,
      facebook: false,
      website: false,
      rating: '',
      services: [],
      sort: 'featured',
      page: 1,
    });

  return (
    <div>
      {showHeading ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-gray-900 dark:text-gray-50">
            Filter clinics
          </h2>
          {filtersSelected ? (
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              onClick={clear}>
              Clear all
            </button>
          ) : null}
        </div>
      ) : filtersSelected ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            onClick={clear}>
            Clear all
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50">Hours</legend>
          <div className="flex flex-col gap-2.5">
            <FilterCheck
              id={`${idPrefix}-open`}
              checked={filters.availability === 'open'}
              onChange={() =>
                update({ availability: filters.availability === 'open' ? '' : 'open' })
              }
              label="Open"
              count={facets.open}
            />
            <FilterCheck
              id={`${idPrefix}-closed`}
              checked={filters.availability === 'closed'}
              onChange={() =>
                update({ availability: filters.availability === 'closed' ? '' : 'closed' })
              }
              label="Closed"
              count={facets.closed}
            />
            {facets.weekend > 0 ? (
              <FilterCheck
                id={`${idPrefix}-weekend`}
                checked={filters.weekend}
                onChange={() => update({ weekend: !filters.weekend })}
                label="Open on weekends"
                count={facets.weekend}
              />
            ) : null}
          </div>
        </fieldset>

        {facets.instagram > 0 || facets.facebook > 0 || facets.website > 0 ? (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
              Contact
            </legend>
            <div className="flex flex-col gap-2.5">
              {facets.instagram > 0 ? (
                <FilterCheck
                  id={`${idPrefix}-instagram`}
                  checked={filters.instagram}
                  onChange={() => update({ instagram: !filters.instagram })}
                  label="Has Instagram"
                  count={facets.instagram}
                />
              ) : null}
              {facets.facebook > 0 ? (
                <FilterCheck
                  id={`${idPrefix}-facebook`}
                  checked={filters.facebook}
                  onChange={() => update({ facebook: !filters.facebook })}
                  label="Has Facebook"
                  count={facets.facebook}
                />
              ) : null}
              {facets.website > 0 ? (
                <FilterCheck
                  id={`${idPrefix}-website`}
                  checked={filters.website}
                  onChange={() => update({ website: !filters.website })}
                  label="Has website"
                  count={facets.website}
                />
              ) : null}
            </div>
          </fieldset>
        ) : null}

        {facets.services.length > 0 ? (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
              Treatments
            </legend>
            <div className="flex flex-col gap-2.5">
              {visibleServices.map((service) => (
                <FilterCheck
                  key={service.slug}
                  id={`${idPrefix}-service-${service.slug}`}
                  checked={filters.services.includes(service.slug)}
                  onChange={() => toggleService(service.slug)}
                  label={service.name}
                  count={service.count}
                />
              ))}
            </div>
            {facets.services.length > SERVICE_PREVIEW ? (
              <button
                type="button"
                className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                aria-expanded={servicesOpen}
                onClick={() => setServicesOpen((open) => !open)}>
                {servicesOpen ? 'Show fewer' : 'Show more'}
              </button>
            ) : null}
          </fieldset>
        ) : null}

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50">Rating</legend>
          <div className="flex flex-col gap-2.5">
            {LOCATION_RATING_OPTIONS.map((option) => (
              <label
                key={option.value}
                htmlFor={`${idPrefix}-rating-${option.value}`}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-800 dark:text-gray-100">
                <input
                  id={`${idPrefix}-rating-${option.value}`}
                  type="checkbox"
                  className="size-4 accent-blue-600"
                  checked={filters.rating === option.value}
                  onChange={() => update({ rating: filters.rating === option.value ? '' : option.value })}
                />
                <RatingStars score={option.score} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

function FilterCheck({
  id,
  checked,
  onChange,
  label,
  count,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count: number;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-800 dark:text-gray-100">
      <input
        id={id}
        type="checkbox"
        className="size-4 accent-blue-600"
        checked={checked}
        onChange={onChange}
      />
      <span>
        {label}{' '}
        <span className="text-gray-500 dark:text-gray-400">({count.toLocaleString('en-MY')})</span>
      </span>
    </label>
  );
}
