import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isClinicOpenNow } from './clinic-open';
import {
  buildLocationFacets,
  filterLocationClinics,
  hasActiveLocationFilters,
  locationFilterHref,
  paginateClinics,
  parseLocationFilters,
  type IndexClinic,
} from './location-filters';

function clinic(overrides: Partial<IndexClinic> = {}): IndexClinic {
  return {
    slug: 'clinic',
    name: 'Clinic',
    address: '1 Jalan Test',
    neighborhood: '',
    city: 'Kepong',
    phone: '03',
    postalCode: '52100',
    state: 'Kuala Lumpur',
    area: 'Kepong',
    image: null,
    rating: 4.2,
    isFeatured: false,
    isFeaturedPartner: false,
    hours: [],
    specialHours: [],
    openOnPublicHolidays: false,
    isPermanentlyClosed: false,
    hasWeekendHours: false,
    hasInstagram: false,
    hasFacebook: false,
    hasWebsite: false,
    serviceSlugs: [],
    modifiedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('location filter query', () => {
  it('round-trips the filters that change the listing', () => {
    const parsed = parseLocationFilters(
      new URLSearchParams(
        'q=glow&availability=open&weekend=1&instagram=1&facebook=1&website=1&rating=4.5&service=facial&service=botox&sort=rating&page=2',
      ),
    );

    assert.equal(hasActiveLocationFilters(parsed), true);
    assert.equal(
      locationFilterHref('/kuala-lumpur', parsed),
      '/kuala-lumpur?q=glow&availability=open&weekend=1&instagram=1&facebook=1&website=1&rating=4.5&service=facial&service=botox&sort=rating&page=2',
    );
  });

  it('drops the page param when no filter is selected', () => {
    const filters = parseLocationFilters(new URLSearchParams('page=3'));
    assert.equal(hasActiveLocationFilters(filters), false);
    assert.equal(locationFilterHref('/kuala-lumpur', filters), '/kuala-lumpur');
  });
});

describe('location clinic filtering', () => {
  const clinics = [
    clinic({
      slug: 'sunday-facial',
      name: 'Sunday Glow',
      rating: 4.6,
      hours: [{ day_of_week: 0, open_time: '09:00', close_time: '18:00' }],
      hasWeekendHours: true,
      hasInstagram: true,
      serviceSlugs: ['facial'],
      isFeatured: true,
      modifiedAt: '2026-02-01T00:00:00.000Z',
    }),
    clinic({
      slug: 'laser',
      name: 'Laser Care',
      rating: 3.4,
      serviceSlugs: ['laser'],
      modifiedAt: '2026-03-01T00:00:00.000Z',
    }),
    clinic({
      slug: 'both',
      name: 'Both Treatments',
      rating: 4.1,
      hasWeekendHours: false,
      serviceSlugs: ['facial', 'laser'],
      modifiedAt: '2026-04-01T00:00:00.000Z',
    }),
  ];

  it('keeps clinics that match every selected filter', () => {
    const matched = filterLocationClinics(clinics, {
      q: 'glow',
      availability: 'open',
      weekend: false,
      instagram: false,
      facebook: false,
      website: false,
      rating: '4.5',
      services: ['facial'],
      sort: 'featured',
      page: 1,
    }, new Date('2026-11-23T02:00:00.000Z'));

    assert.deepEqual(
      matched.map((item) => item.slug),
      ['sunday-facial'],
    );
  });

  it('sorts unrated clinics after rated ones', () => {
    const matched = filterLocationClinics(
      [clinic({ slug: 'none', name: 'No Rating', rating: null }), clinic({ slug: 'rated', rating: 3 })],
      {
        q: '',
        availability: '',
        weekend: false,
        instagram: false,
        facebook: false,
        website: false,
        rating: '',
        services: [],
        sort: 'rating',
        page: 1,
      },
    );

    assert.deepEqual(
      matched.map((item) => item.slug),
      ['rated', 'none'],
    );
  });

  it('counts rating floors and services from the full set', () => {
    const facets = buildLocationFacets(
      clinics,
      new Map([
        ['facial', 'Facial'],
        ['laser', 'Laser'],
      ]),
    );

    assert.equal(facets.total, 3);
    assert.equal(facets.weekend, 1);
    assert.equal(facets.instagram, 1);
    assert.equal(facets.ratings['4.5'], 1);
    assert.equal(facets.ratings['4'], 2);
    assert.equal(facets.services[0]?.slug, 'facial');
    assert.equal(facets.services[0]?.count, 2);
  });
});

describe('open now', () => {
  const hours = [{ day_of_week: 0, open_time: '09:00', close_time: '18:00' }];

  it('keeps a clinic that is closing soon', () => {
    assert.equal(isClinicOpenNow(hours, [], new Date('2026-11-23T10:20:00.000Z')), true);
  });

  it('drops a clinic after the closing-soon window', () => {
    assert.equal(isClinicOpenNow(hours, [], new Date('2026-11-23T11:00:00.000Z')), false);
  });
});

describe('location pagination', () => {
  it('clamps the page to the last page of matches', () => {
    const page = paginateClinics([1, 2, 3], 9, 2);
    assert.equal(page.page, 2);
    assert.deepEqual(page.clinics, [3]);
    assert.equal(page.totalPages, 2);
  });
});
