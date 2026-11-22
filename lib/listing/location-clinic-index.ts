import { unstable_cache } from 'next/cache';

import { isFeatured, isFeaturedPartner } from '@/config/featured';

import { createAdminClient } from '@/lib/supabase';

import {
  buildLocationFacets,
  EMPTY_LOCATION_FACETS,
  type IndexClinic,
  type LocationFacets,
  type LocationScope,
} from '@/lib/listing/location-filters';

export type { LocationScope };

const PAGE_SIZE = 1000;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Relation<T> = T | T[] | null;

type ImageRow = {
  image_url?: string | null;
  r2_url?: string | null;
  r2_key?: string | null;
  display_order?: number | null;
};

type ServiceRow = {
  clinic_services: Relation<{ slug?: string | null; name?: string | null }>;
};

type ClinicRow = {
  name?: string | null;
  slug?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  phone?: string | null;
  postal_code?: string | null;
  rating?: number | string | null;
  is_featured?: boolean | null;
  is_permanently_closed?: boolean | null;
  open_on_public_holidays?: boolean | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  website?: string | null;
  modified_at?: string | null;
  area?: Relation<{ name?: string | null }>;
  state?: Relation<{ name?: string | null }>;
  hours?:
    | {
        day_of_week?: number | null;
        open_time?: string | null;
        close_time?: string | null;
      }[]
    | null;
  special_hours?:
    | {
        date?: string | null;
        is_closed?: boolean | null;
        open_time?: string | null;
        close_time?: string | null;
      }[]
    | null;
  images?: ImageRow[] | null;
  clinic_service_relations?: ServiceRow[] | null;
};

function one<T>(value: Relation<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function isSlug(value: string | null | undefined): value is string {
  return Boolean(value && SLUG.test(value));
}

export function isLocationScope(scope: LocationScope): boolean {
  if (!isSlug(scope.stateSlug)) return false;
  if (scope.kind === 'area') return isSlug(scope.areaSlug);
  return true;
}

function hasOpenDay(hours: ClinicRow['hours'], day: number): boolean {
  return (hours ?? []).some(
    (hour) => hour.day_of_week === day && (hour.open_time ?? '').trim() !== '',
  );
}

function filled(value: string | null | undefined): boolean {
  return (value ?? '').trim() !== '';
}

function mapClinic(
  row: ClinicRow,
): { clinic: IndexClinic; serviceNames: Record<string, string> } | null {
  if (!row.slug || !row.name) return null;

  const images = [...(row.images ?? [])].sort(
    (left, right) => (left.display_order ?? 0) - (right.display_order ?? 0),
  );
  const image = images[0] ?? null;
  const serviceNames: Record<string, string> = {};
  const serviceSlugs: string[] = [];

  for (const relation of row.clinic_service_relations ?? []) {
    const service = one(relation.clinic_services);
    const slug = service?.slug?.trim().toLowerCase();
    if (!slug || !isSlug(slug)) continue;
    serviceSlugs.push(slug);
    if (service?.name) serviceNames[slug] = service.name;
  }

  const ratingValue = row.rating == null || row.rating === '' ? null : Number(row.rating);
  const hasSaturdayHours = hasOpenDay(row.hours, 5);
  const hasSundayHours = hasOpenDay(row.hours, 6);

  const clinic: IndexClinic = {
    slug: row.slug,
    name: row.name,
    address: row.address ?? '',
    neighborhood: row.neighborhood ?? '',
    city: row.city ?? '',
    phone: row.phone ?? '',
    postalCode: row.postal_code ?? '',
    state: one(row.state)?.name ?? '',
    area: one(row.area)?.name ?? '',
    image: image
      ? {
          image_url: image.image_url,
          r2_url: image.r2_url,
          r2_key: image.r2_key,
        }
      : null,
    rating: ratingValue != null && Number.isFinite(ratingValue) ? ratingValue : null,
    isFeatured: isFeatured(row.slug) || Boolean(row.is_featured),
    isFeaturedPartner: isFeaturedPartner(row.slug),
    hours: (row.hours ?? []).map((hour) => ({
      day_of_week: hour.day_of_week ?? undefined,
      open_time: hour.open_time,
      close_time: hour.close_time,
    })),
    specialHours: (row.special_hours ?? []).map((hour) => ({
      date: hour.date ?? undefined,
      is_closed: hour.is_closed,
      open_time: hour.open_time,
      close_time: hour.close_time,
    })),
    openOnPublicHolidays: row.open_on_public_holidays ?? false,
    isPermanentlyClosed: row.is_permanently_closed ?? false,
    hasWeekendHours: hasSaturdayHours && hasSundayHours,
    hasInstagram: filled(row.instagram_url),
    hasFacebook: filled(row.facebook_url),
    hasWebsite: filled(row.website),
    serviceSlugs,
    modifiedAt: row.modified_at ?? '',
  };

  return { clinic, serviceNames };
}

type LocationCatalog = {
  clinics: IndexClinic[];
  serviceNames: Record<string, string>;
};

async function loadLocationCatalog(scope: LocationScope): Promise<LocationCatalog> {
  const supabase = createAdminClient();
  const clinics: IndexClinic[] = [];
  const serviceNames: Record<string, string> = {};

  for (let from = 0; from < 20_000; from += PAGE_SIZE) {
    let query = supabase
      .from('clinics')
      .select(
        `
        name,
        slug,
        address,
        neighborhood,
        city,
        phone,
        postal_code,
        rating,
        is_featured,
        is_permanently_closed,
        open_on_public_holidays,
        instagram_url,
        facebook_url,
        website,
        modified_at,
        area:areas!inner(name, slug),
        state:states!inner(name, slug),
        hours:clinic_hours(day_of_week, open_time, close_time),
        special_hours:clinic_special_hours(date, is_closed, open_time, close_time),
        images:clinic_images(image_url, r2_url, r2_key, display_order),
        clinic_service_relations(clinic_services(slug, name))
      `,
      )
      .eq('status', 'approved')
      .eq('state.slug', scope.stateSlug)
      .order('modified_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (scope.kind === 'area') {
      query = query.eq('area.slug', scope.areaSlug);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Location clinic index failed: ${error.message}`);
    }

    const rows = (data ?? []) as ClinicRow[];
    for (const row of rows) {
      const mapped = mapClinic(row);
      if (!mapped) continue;
      clinics.push(mapped.clinic);
      Object.assign(serviceNames, mapped.serviceNames);
    }

    if (rows.length < PAGE_SIZE) break;
  }

  return { clinics, serviceNames };
}

function cacheKey(scope: LocationScope): string[] {
  return [
    'location-clinic-index-v2',
    scope.kind,
    scope.stateSlug,
    scope.kind === 'area' ? scope.areaSlug : '',
  ];
}

export async function getLocationCatalog(scope: LocationScope): Promise<LocationCatalog> {
  if (!isLocationScope(scope)) {
    throw new Error('Invalid location scope');
  }

  return unstable_cache(() => loadLocationCatalog(scope), cacheKey(scope), {
    revalidate: 2_592_000,
    tags: ['clinics', `state-${scope.stateSlug}`],
  })();
}

export async function getLocationFacets(scope: LocationScope): Promise<LocationFacets> {
  const catalog = await getLocationCatalog(scope);
  return buildLocationFacets(catalog.clinics, new Map(Object.entries(catalog.serviceNames)));
}

export async function getLocationFacetsSafe(scope: LocationScope): Promise<LocationFacets> {
  try {
    return await getLocationFacets(scope);
  } catch (error) {
    console.error('Location facets failed', error);
    return EMPTY_LOCATION_FACETS;
  }
}
