import { unstable_cache } from 'next/cache';

import { Clinic, ClinicState } from '@/types/clinic';

import { CityHubClinic } from '@/lib/city-hub';

import { embeddedCount, fetchApprovedClinics } from '@/helpers/listing-clinics';

import { hasAdminCredentials } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase';

export interface AreaData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  r2_url?: string | null;
  state: Partial<ClinicState>;
  clinics: Partial<Clinic>[];
  total_clinics: number;
  modified_at?: string | null;
}

export type AreaListing = {
  id: string;
  name: string;
  slug: string;
  modified_at: string | null;
  clinic_count: number;
  state: {
    name: string;
    slug: string;
  };
};

type AreaRow = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  r2_url: string | null;
  modified_at: string | null;
  state:
    | {
        id?: string;
        name: string;
        slug: string;
        image?: string | null;
        r2_url?: string | null;
      }
    | {
        id?: string;
        name: string;
        slug: string;
        image?: string | null;
        r2_url?: string | null;
      }[]
    | null;
};

function stateOf(row: AreaRow) {
  return Array.isArray(row.state) ? row.state[0] : row.state;
}

export const getAreaListings = async (): Promise<AreaListing[]> => {
  if (!hasAdminCredentials()) {
    return [];
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('areas')
    .select(
      `
      id,
      name,
      slug,
      modified_at,
      state:states!inner(name, slug),
      clinics(count)
    `,
    )
    .eq('clinics.status', 'approved')
    .eq('clinics.is_active', true);

  if (error) {
    throw new Error(`Failed to list areas: ${error.message}`);
  }

  const byKey = new Map<string, AreaListing>();

  for (const row of (data ?? []) as unknown as Array<AreaRow & { clinics?: unknown }>) {
    const state = stateOf(row);
    if (!state?.slug || !row.slug) {
      continue;
    }

    const key = `${state.slug}/${row.slug}`;
    const clinicCount = embeddedCount(row.clinics);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        id: row.id,
        name: row.name,
        slug: row.slug,
        modified_at: row.modified_at,
        clinic_count: clinicCount,
        state: {
          name: state.name,
          slug: state.slug,
        },
      });
      continue;
    }

    existing.clinic_count += clinicCount;
    if (row.modified_at && (!existing.modified_at || row.modified_at > existing.modified_at)) {
      existing.modified_at = row.modified_at;
    }
  }

  return [...byKey.values()];
};

async function fetchAreaBySlug(
  slug: string,
  stateSlug: string | undefined,
  fromIndex: number,
  toIndex: number,
): Promise<AreaData | null> {
  if (!hasAdminCredentials()) {
    return null;
  }

  const supabase = createAdminClient();
  let query = supabase
    .from('areas')
    .select('id, name, slug, image, r2_url, modified_at, state:states!inner(id, name, slug, image, r2_url)')
    .eq('slug', slug);

  if (stateSlug) {
    query = query.eq('state.slug', stateSlug);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch area "${slug}": ${error.message}`);
  }

  const areas = (data ?? []) as unknown as AreaRow[];
  if (areas.length === 0) {
    return null;
  }

  const primary = areas[0];
  const state = stateOf(primary);
  if (!state) {
    return null;
  }

  const { clinics, total } = await fetchApprovedClinics({
    areaIds: areas.map((area) => area.id),
    from: fromIndex,
    to: toIndex,
  });

  return {
    id: primary.id,
    name: primary.name,
    slug: primary.slug,
    image: primary.image,
    r2_url: primary.r2_url,
    modified_at: primary.modified_at,
    state: {
      id: state.id,
      name: state.name,
      slug: state.slug,
      image: state.image,
      r2_url: state.r2_url,
    },
    clinics,
    total_clinics: total,
  };
}

export type AreaHubSource = {
  clinics: CityHubClinic[];
  serviceRows: Array<{
    clinicSlug: string;
    clinicName: string;
    serviceName: string;
    serviceSlug: string;
  }>;
};

type HubClinicRow = {
  id: string;
  name: string;
  slug: string;
  neighborhood: string | null;
  city: string | null;
  rating: number | null;
  review_count: number | null;
};

type HubServiceRow = {
  clinic_id: string;
  service: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

async function fetchAreaHubSource(
  slug: string,
  stateSlug: string | undefined,
): Promise<AreaHubSource | null> {
  if (!hasAdminCredentials()) return null;

  const supabase = createAdminClient();
  let query = supabase
    .from('areas')
    .select('id, slug, state:states!inner(slug)')
    .eq('slug', slug);

  if (stateSlug) {
    query = query.eq('state.slug', stateSlug);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch area hub "${slug}": ${error.message}`);
  }

  const areas = (data ?? []) as unknown as Array<{ id: string }>;
  if (areas.length === 0) return null;

  const areaIds = areas.map((area) => area.id);
  const clinics: HubClinicRow[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data: clinicRows, error: clinicError } = await supabase
      .from('clinics')
      .select('id, name, slug, neighborhood, city, rating, review_count')
      .in('area_id', areaIds)
      .eq('status', 'approved')
      .eq('is_active', true)
      .order('slug', { ascending: true })
      .range(from, from + pageSize - 1);

    if (clinicError) {
      throw new Error(`Failed to list clinics for area hub "${slug}": ${clinicError.message}`);
    }

    const page = (clinicRows ?? []) as HubClinicRow[];
    clinics.push(...page);
    if (page.length < pageSize) break;
    from += pageSize;
  }

  const clinicById = new Map(clinics.map((clinic) => [clinic.id, clinic]));
  const serviceRows: AreaHubSource['serviceRows'] = [];
  const ids = clinics.map((clinic) => clinic.id);

  for (let index = 0; index < ids.length; index += 80) {
    const chunk = ids.slice(index, index + 200);
    if (chunk.length === 0) continue;

    const { data: relations, error: serviceError } = await supabase
      .from('clinic_service_relations')
      .select('clinic_id, service:clinic_services(name, slug)')
      .in('clinic_id', chunk);

    if (serviceError) {
      throw new Error(`Failed to list services for area hub "${slug}": ${serviceError.message}`);
    }

    for (const relation of (relations ?? []) as unknown as HubServiceRow[]) {
      const clinic = clinicById.get(relation.clinic_id);
      const service = Array.isArray(relation.service) ? relation.service[0] : relation.service;
      if (!clinic || !service?.name || !service.slug) continue;
      serviceRows.push({
        clinicSlug: clinic.slug,
        clinicName: clinic.name,
        serviceName: service.name,
        serviceSlug: service.slug,
      });
    }
  }

  return {
    clinics: clinics.map((clinic) => ({
      name: clinic.name,
      slug: clinic.slug,
      neighborhood: clinic.neighborhood,
      city: clinic.city,
      rating: clinic.rating,
      reviewCount: clinic.review_count,
    })),
    serviceRows,
  };
}

export async function getAreaHubSource(
  areaSlug: string,
  stateSlug?: string,
): Promise<AreaHubSource | null> {
  if (!areaSlug) return null;

  return unstable_cache(
    async () => fetchAreaHubSource(areaSlug, stateSlug),
    [`area-hub-v1-${stateSlug ?? 'any'}-${areaSlug}`],
    { revalidate: 86_400, tags: ['areas', `area-${areaSlug}`] },
  )();
}

export const getAreaBySlug = async (
  areaSlug: string,
  from: number,
  to: number,
  stateSlug?: string,
): Promise<AreaData | null> => {
  const slug = areaSlug;
  const fromIndex = from;
  const toIndex = to;
  const parentSlug = stateSlug;

  if (!slug || typeof slug !== 'string') {
    console.error('Invalid areaSlug provided to getAreaBySlug:', areaSlug);
    return null;
  }

  return unstable_cache(
    async () => fetchAreaBySlug(slug, parentSlug, fromIndex, toIndex),
    [`area-v3-${parentSlug ?? 'any'}-${slug}-${fromIndex}-${toIndex}`],
    {
      revalidate: 1_209_600,
      tags: ['areas', `area-${slug}`],
    },
  )();
};
