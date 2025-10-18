import {
  Clinic,
  ClinicArea,
  ClinicDetails,
  ClinicDoctor,
  ClinicHours,
  ClinicReview,
  ClinicService,
  ClinicSpecialHours,
  ClinicState,
} from '@/types/clinic';

import { createAdminClient, createServerClient } from '@/lib/supabase';

export async function getClinicMetadataBySlug(slug: string, status: string = 'approved') {
  const supabase = createAdminClient();

  const { data: clinicData } = (await supabase
    .from('clinics')
    .select(
      `
      id,
      name,
      slug,
      description,
      area:areas(name),
      state:states(name)
    `,
    )
    .match({ slug, is_active: true, status })
    .single()) as {
    data: {
      id: string;
      name: string;
      slug: string;
      description: string;
      area: {
        name: string;
      };
      state: {
        name: string;
      };
    };
  };

  return clinicData ?? null;
}

export async function getClinicListings(status: string = 'approved') {
  const supabase = createAdminClient();

  const { data: clinicData } = (await supabase
    .from('clinics')
    .select(
      `
      id,
      name,
      slug
    `,
    )
    .match({ is_active: true, status })) as {
    data: {
      id: string;
      name: string;
      slug: string;
    }[];
  };

  return clinicData ?? [];
}

/**
 * Fetches a clinic by its slug with all related data
 */

export async function getClinicBySlug(
  slug: string,
  status: string = 'approved',
): Promise<ClinicDetails | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('get_clinic_by_slug', {
    slug_input: slug,
    status_input: status,
    review_limit: 6,
  });

  if (error) {
    console.error('Error fetching nearest clinics:', error);
    return null;
  }

  return data as unknown as ClinicDetails;
}

/**
 * Fetches a clinic by its slug with all related data using admin client for static generation
 */
export async function getClinicBySlugStatic(
  slug: string,
  status: string = 'approved',
): Promise<ClinicDetails | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('get_clinic_by_slug', {
    slug_input: slug,
    status_input: status,
    review_limit: 6,
  });

  if (error) {
    console.error('Error fetching clinic for static generation:', error);
    return null;
  }

  return data as unknown as ClinicDetails;
}

export async function getClinicByServiceMetadataId(id: string) {
  const supabase = await createServerClient();

  // TODO: get approved clinics
  const { data: clinicIds } = await supabase
    .from('clinic_service_relations')
    .select('clinic_id')
    .eq('service_id', id);

  if (!clinicIds || clinicIds.length === 0) {
    return [];
  }

  return clinicIds.length;
}

export async function getClinicByServiceId(
  id: string,
  from: number,
  to: number,
  status: string = 'approved',
) {
  const supabase = await createServerClient();

  // First get clinic IDs that have this service
  const { data: clinicIds } = await supabase
    .from('clinic_service_relations')
    .select('clinic_id')
    .eq('service_id', id)
    .range(from, to);

  if (!clinicIds || clinicIds.length === 0) {
    return [];
  }

  const clinicIdList = clinicIds.map((item) => item.clinic_id);

  // Then get full clinic details for those clinics only
  const { data } = await supabase
    .from('clinics')
    .select(
      `
      id,
      name,
      slug,
      postal_code,
      address,
      neighborhood,
      phone,
      latitude,
      longitude,
      rating,
      review_count,
      images:clinic_images(image_url, imagekit_file_id),
      is_permanently_closed,
      open_on_public_holidays,
      is_active,
      is_featured,
      modified_at,
      area:areas(id, name, slug),
      state:states(id, name, slug),
      hours:clinic_hours(day_of_week, open_time, close_time),
      special_hours:clinic_special_hours(date, is_closed, open_time, close_time),
      services:clinic_service_relations(service:clinic_services(id, name, slug))
      `,
    )
    .in('id', clinicIdList)
    .match({ is_active: true, status })
    .order('modified_at', { ascending: false });

  return data || [];
}

/**
 * Fetches clinics with optional filters
 */
export async function getClinics(filters: {
  stateId?: string;
  areaId?: string;
  categoryId?: string;
  isFeatured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createServerClient();
  let query = supabase.from('clinics').select(
    `
      *,
      area:areas(*),
      state:states(*),
      categories:clinic_category_relations(
        category:clinic_categories(*)
      )
    `,
    { count: 'exact' },
  );

  if (filters.stateId) {
    query = query.eq('state_id', filters.stateId);
  }

  if (filters.areaId) {
    query = query.eq('area_id', filters.areaId);
  }

  if (filters.categoryId) {
    query = query.eq('clinic_category_relations.category_id', filters.categoryId);
  }

  if (filters.isFeatured !== undefined) {
    query = query.eq('is_featured', filters.isFeatured);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { data, count };
}

/**
 * Fetches clinics within a radius of a given location
 */
export async function getClinicsNearLocation(
  latitude: number,
  longitude: number,
  radiusInKm: number,
  limit: number = 5,
) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('get_nearby_clinics', {
    clinic_latitude: latitude,
    clinic_longitude: longitude,
    radius_km: radiusInKm,
    result_limit: limit,
  });

  if (error) {
    console.error('Error fetching nearest clinics:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data;
}

/**
 * Fetches clinic reviews with pagination
 */
export async function getClinicReviews(clinicId: string, page: number = 1, pageSize: number = 10) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_reviews')
    .select('author_name, review_time, rating, email, text, status')
    .eq('clinic_id', clinicId)
    .order('review_time', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  return data;
}

/**
 * Fetches clinic operating hours
 */
export async function getClinicHours(clinicId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_hours')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('day_of_week');

  if (error) throw error;
  return data;
}

/**
 * Fetches clinic special hours (holidays, etc.)
 */
export async function getClinicSpecialHours(clinicId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_special_hours')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('date');

  if (error) throw error;
  return data;
}

/**
 * Fetches clinic doctors
 */
export async function getClinicDoctors(clinicId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_doctors')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('name');

  if (error) throw error;
  return data;
}

/**
 * Checks if a clinic is currently open
 */
export function isClinicOpen(
  regularHours: Partial<ClinicHours>[],
  specialHours: Partial<ClinicSpecialHours>[],
  date: Date = new Date(),
): boolean {
  const dayOfWeek = date.getDay();
  const currentTime = date.toTimeString().slice(0, 5); // HH:mm format

  // Check special hours first
  const specialHoursForDate = specialHours.find(
    (sh) => sh.date === date.toISOString().split('T')[0],
  );

  if (specialHoursForDate) {
    if (specialHoursForDate.is_closed) return false;
    if (!specialHoursForDate.open_time || !specialHoursForDate.close_time) return false;
    return (
      currentTime >= specialHoursForDate.open_time && currentTime <= specialHoursForDate.close_time
    );
  }

  // Check regular hours
  const regularHoursForDay = regularHours.find((h) => h.day_of_week === dayOfWeek);
  if (!regularHoursForDay) return false;
  if (!regularHoursForDay.open_time || !regularHoursForDay.close_time) return false;

  return (
    currentTime >= regularHoursForDay.open_time && currentTime <= regularHoursForDay.close_time
  );
}

/**
 * Gets the next opening time for a clinic
 */
export function getNextOpeningTime(
  regularHours: ClinicHours[],
  specialHours: ClinicSpecialHours[],
  date: Date = new Date(),
): Date | null {
  const currentDay = date.getDay();
  const currentTime = date.toTimeString().slice(0, 5);

  // Check if there are special hours for today
  const specialHoursForDate = specialHours.find(
    (sh) => sh.date === date.toISOString().split('T')[0],
  );

  if (specialHoursForDate && !specialHoursForDate.is_closed) {
    if (specialHoursForDate.open_time && specialHoursForDate.close_time) {
      if (currentTime < specialHoursForDate.open_time) {
        const [hours, minutes] = specialHoursForDate.open_time.split(':');
        const nextOpen = new Date(date);
        nextOpen.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return nextOpen;
      }
    }
  }

  // Check regular hours for today
  const todayHours = regularHours.find((h) => h.day_of_week === currentDay);
  if (todayHours && todayHours.open_time && todayHours.close_time) {
    if (currentTime < todayHours.open_time) {
      const [hours, minutes] = todayHours.open_time.split(':');
      const nextOpen = new Date(date);
      nextOpen.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return nextOpen;
    }
  }

  // Find next opening day
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + i);

    // Check special hours for next day
    const nextDaySpecialHours = specialHours.find(
      (sh) => sh.date === nextDate.toISOString().split('T')[0],
    );

    if (nextDaySpecialHours && !nextDaySpecialHours.is_closed) {
      if (nextDaySpecialHours.open_time) {
        const [hours, minutes] = nextDaySpecialHours.open_time.split(':');
        const nextOpen = new Date(nextDate);
        nextOpen.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return nextOpen;
      }
    }

    // Check regular hours for next day
    const nextDayHours = regularHours.find((h) => h.day_of_week === nextDay);
    if (nextDayHours && nextDayHours.open_time) {
      const [hours, minutes] = nextDayHours.open_time.split(':');
      const nextOpen = new Date(nextDate);
      nextOpen.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return nextOpen;
    }
  }

  return null;
}

/**
 * Parses and formats raw clinic data from Supabase
 */
export function parseClinicData(
  clinic: Partial<Clinic> & {
    services?: { service: Partial<ClinicService> }[] | null;
    area?: Partial<ClinicArea> | null;
    state?: Partial<ClinicState> | null;
    doctors?: { doctor: Partial<ClinicDoctor> }[] | null;
    hours?: Partial<ClinicHours>[] | null;
    special_hours?: Partial<ClinicSpecialHours>[] | null;
    reviews?: Partial<ClinicReview>[] | null;
  },
) {
  return {
    ...clinic,
    services:
      clinic.services?.map((item) => ({
        name: item.service.name,
        slug: item.service.slug,
      })) ?? [],
    doctors:
      clinic.doctors?.map((item) => ({
        name: item.doctor.name,
        slug: item.doctor.slug,
      })) ?? [],
  };
}
