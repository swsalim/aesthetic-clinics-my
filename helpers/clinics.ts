import { unstable_cache } from 'next/cache';

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

export const getRecentClinics = unstable_cache(
  async (limit: number = 20) => {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('clinics')
      .select(
        `
        id,
        name,
        slug,
        address,
        phone,
        postal_code,
        rating,
        images:clinic_images(image_url, imagekit_file_id),
        is_permanently_closed,
        open_on_public_holidays,
        is_featured,
        hours:clinic_hours(*),
        special_hours:clinic_special_hours(*),
        area:areas!inner(name),
        state:states!inner(name)
      `,
      )
      .eq('is_active', true)
      .order('modified_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data as unknown as Partial<Clinic>[]) || [];
  },
  ['recent-clinics'],
  {
    revalidate: 1_209_600, // Cache for 2 weeks
    tags: ['clinics'],
  },
);

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

export async function getClinicByServiceId(
  id: string,
  from: number,
  to: number,
  status: string = 'approved',
): Promise<{ count: number; clinics: Partial<Clinic>[] | null }> {
  // Capture parameters immediately to avoid closure issues in concurrent requests
  const serviceId = id;
  const fromIndex = from;
  const toIndex = to;
  const statusParam = status;

  // Validate inputs
  if (!serviceId || typeof serviceId !== 'string') {
    console.error('Invalid service id provided to getClinicByServiceId:', id);
    return { count: 0, clinics: [] };
  }

  return unstable_cache(
    async () => {
      const supabase = await createAdminClient();

      const { data, error } = await supabase.rpc('get_clinics_by_service_id', {
        service_id_param: serviceId,
        from_index: fromIndex,
        to_index: toIndex,
        status_param: statusParam,
      });

      if (error) {
        console.error(
          `Error fetching clinics by service "${serviceId}" (from: ${fromIndex}, to: ${toIndex}):`,
          error,
        );
        return { count: 0, clinics: [] };
      }

      if (!data) {
        return { count: 0, clinics: [] };
      }

      return {
        count: Number((data as unknown as { count: number })?.count || 0),
        clinics: (data as unknown as { clinics: Partial<Clinic>[] })?.clinics || [],
      };
    },
    [`clinics-service-${serviceId}-${fromIndex}-${toIndex}-${statusParam}`],
    {
      revalidate: 1_209_600, // Cache for 2 weeks
      tags: ['clinics', `service-${serviceId}`],
    },
  )();
}

/**
 * Fetches clinics within a radius of a given location
 */
export const getClinicsNearLocation = async (
  latitude: number,
  longitude: number,
  radiusInKm: number,
  limit: number = 5,
) => {
  // Capture parameters immediately to avoid closure issues in concurrent requests
  const lat = latitude;
  const lng = longitude;
  const radius = radiusInKm;
  const limitCount = limit;

  // Validate inputs
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    console.error('Invalid coordinates provided to getClinicsNearLocation:', {
      latitude,
      longitude,
    });
    return [];
  }

  // Create a unique cache key based on all parameters
  const cacheKey = `nearby-clinics-${lat.toFixed(4)}-${lng.toFixed(4)}-${radius}-${limitCount}`;

  return unstable_cache(
    async () => {
      const supabase = await createAdminClient();

      const { data, error } = await supabase.rpc('get_nearby_clinics', {
        clinic_latitude: lat,
        clinic_longitude: lng,
        radius_km: radius,
        result_limit: limitCount,
      });

      if (error) {
        console.error(
          `Error fetching nearest clinics (lat: ${lat}, lng: ${lng}, radius: ${radius}km):`,
          error,
        );
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data;
    },
    [cacheKey],
    {
      revalidate: 1_209_600, // Cache for 2 weeks
      tags: ['clinics', 'nearby-clinics'],
    },
  )();
};

/**
 * Fetches clinic reviews with pagination
 */
export const getClinicReviews = unstable_cache(
  async (clinicId: string, page: number = 1, pageSize: number = 10) => {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('clinic_reviews')
      .select('author_name, review_time, rating, email, text, status')
      .eq('clinic_id', clinicId)
      .order('review_time', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    return data;
  },
  ['clinic-reviews'],
  {
    revalidate: 1_209_600, // Cache for 2 weeks
    tags: ['reviews', 'clinics'],
  },
);

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
