import { unstable_cache } from 'next/cache';

import { ClinicDoctor } from '@/types/clinic';

import { createAdminClient, createServerClient } from '@/lib/supabase';

/**
 * Doctor Helper Functions
 *
 * This module provides functions to fetch doctor data from the database.
 *
 * NEW: getDoctorsByStateRPC() - Uses an optimized RPC function for better performance
 * This function fetches doctors by state with pagination using a database RPC function
 * instead of a direct query, providing better performance and reduced network overhead.
 *
 * Usage:
 * ```typescript
 * const result = await getDoctorsByStateRPC('selangor', 20, 0, 'approved');
 * console.log(result.data); // Array of doctors
 * console.log(result.count); // Total count
 * ```
 */

// Reusable column selection for doctor queries with clinic relations
export const DOCTOR_WITH_CLINICS_SELECT = `
  id,
  name,
  slug,
  bio,
  specialty,
  qualification,
  images:clinic_doctor_images(id,image_url, imagekit_file_id),
  featured_video,
  is_active,
  is_featured,
  status,
  created_at,
  modified_at,
  clinic_doctor_relations(
    clinic_id,
    clinics(
      id,
      name,
      slug,
      address,
      neighborhood,
      postal_code,
      phone,
      email,
      latitude,
      longitude,
      rating,
      review_count,
      is_permanently_closed,
      open_on_public_holidays,
      images:clinic_images(id,image_url, imagekit_file_id),
      area:areas(name),
      state:states(name)
    )
  )
`;

// Type for raw doctor data from Supabase with clinic relations
type RawDoctorWithClinics = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  specialty: string | null;
  qualification: string | null;
  images: { id: string; image_url: string; imagekit_file_id: string }[] | null;
  featured_video: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  status: string | null;
  created_at: string | null;
  modified_at: string | null;
  clinic_doctor_relations?: {
    clinics: {
      id: string;
      name: string;
      slug: string;
      address: string | null;
      neighborhood: string | null;
      postal_code: string | null;
      phone: string | null;
      email: string | null;
      latitude: number | null;
      longitude: number | null;
      rating: number | null;
      review_count: number | null;
      is_permanently_closed: boolean | null;
      open_on_public_holidays: boolean | null;
      images: { id: string; image_url: string; imagekit_file_id: string }[] | null;
      area?: { name: string } | null;
      state?: { name: string } | null;
    };
  }[];
};

// Helper function to transform raw doctor data to ClinicDoctor type
export function transformDoctorData(doctorData: RawDoctorWithClinics): ClinicDoctor {
  const { clinic_doctor_relations, ...doctorDataWithoutRelations } = doctorData;
  return {
    ...doctorDataWithoutRelations,
    clinics: clinic_doctor_relations?.map((relation) => relation.clinics).filter(Boolean) || [],
  };
}

// Helper function to transform array of raw doctor data
function transformDoctorsData(doctorsData: RawDoctorWithClinics[]): ClinicDoctor[] {
  return doctorsData.map(transformDoctorData);
}

export const getDoctorListings = async (status: string = 'approved') => {
  const supabase = createAdminClient();

  const { data: doctorData } = (await supabase
    .from('clinic_doctors')
    .select(
      `
        id,
        name,
        slug,
        is_active,
        status
      `,
    )
    .match({ is_active: true, status })) as {
    data: {
      id: string;
      name: string;
      slug: string;
      is_active: boolean | null;
      status: string | null;
    }[];
  };

  return doctorData ?? [];
};

/**
 * Fetches a doctor by its slug with all related data using admin client for static generation
 */
export const getDoctorBySlug = async (
  slug: string,
  status: string = 'approved',
): Promise<ClinicDoctor | null> => {
  const getCachedDoctor = unstable_cache(
    async () => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('clinic_doctors')
        .select(DOCTOR_WITH_CLINICS_SELECT)
        .match({ slug, is_active: true, status })
        .single();

      if (error) {
        console.error('Error fetching doctor for static generation:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return transformDoctorData(data as unknown as RawDoctorWithClinics);
    },
    [`doctor-${slug}-${status}`],
    {
      revalidate: 1_209_600, // Cache for 2 weeks
      tags: ['doctors', `doctor-${slug}`],
    },
  );

  return getCachedDoctor();
};

/**
 * Fetches doctors with optional filters
 */
export async function getDoctors(
  filters: {
    specialty?: string;
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
  } | null = null,
) {
  // Create a stable cache key based on filter values
  const cacheKey = [
    'doctors',
    filters?.specialty || 'all',
    filters?.isFeatured !== undefined ? `featured-${filters.isFeatured}` : 'all',
    `limit-${filters?.limit || 'none'}`,
    `offset-${filters?.offset || 0}`,
  ].join('-');

  const getCachedDoctors = unstable_cache(
    async () => {
      const supabase = createAdminClient();
      let query = supabase
        .from('clinic_doctors')
        .select(DOCTOR_WITH_CLINICS_SELECT, { count: 'exact' })
        // .eq('status', 'approved')
        .order('modified_at', { ascending: false });

      if (filters?.specialty) {
        query = query.eq('specialty', filters.specialty);
      }

      if (filters?.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const doctors = transformDoctorsData(data as unknown as RawDoctorWithClinics[]);

      return { data: doctors, count };
    },
    [cacheKey],
    {
      revalidate: 1_209_600, // Cache for 2 weeks
      tags: ['doctors', ...(filters?.specialty ? [`doctors-specialty-${filters.specialty}`] : [])],
    },
  );

  return getCachedDoctors();
}

/**
 * Fetches doctors by specialty
 */
export async function getDoctorsBySpecialty(
  specialty: string,
  limit: number = 10,
  offset: number = 0,
  status: string = 'approved',
) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_doctors')
    .select(DOCTOR_WITH_CLINICS_SELECT)
    .eq('specialty', specialty)
    .match({ is_active: true, status })
    .range(offset, offset + limit - 1)
    .order('modified_at', { ascending: false });

  if (error) {
    console.error('Error fetching doctors by specialty:', error);
    return [];
  }

  return transformDoctorsData(data || []);
}

/**
 * Fetches all unique specialties
 */
export async function getDoctorSpecialties() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_doctors')
    .select('specialty')
    .not('specialty', 'is', null)
    .eq('is_active', true)
    .eq('status', 'approved');

  if (error) {
    console.error('Error fetching doctor specialties:', error);
    return [];
  }

  // Get unique specialties
  const specialties = [...new Set(data?.map((item) => item.specialty).filter(Boolean))];
  return specialties;
}

/**
 * Parses and formats raw doctor data from Supabase
 */
export function parseDoctorData(
  doctor: Partial<ClinicDoctor> & {
    clinic_doctor_relations?: { clinics: Partial<ClinicDoctor> }[] | null;
  },
) {
  return transformDoctorData(doctor as RawDoctorWithClinics);
}

/**
 * Fetches all doctors in a specific clinic by clinic slug
 */
export async function getDoctorsByClinicSlug(
  clinicSlug: string,
  status: string = 'approved',
): Promise<ClinicDoctor[]> {
  // Capture parameters immediately to avoid closure issues in concurrent requests
  const slug = clinicSlug;
  const statusParam = status;

  return unstable_cache(
    async () => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('get_doctors_by_clinic_slug', {
        clinic_slug_param: slug,
        status_param: statusParam,
      });

      if (error) {
        console.error('Error fetching doctors by clinic slug:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      // The RPC function returns JSON, so we need to parse it
      const doctorsData = data as RawDoctorWithClinics[];
      return transformDoctorsData(doctorsData);
    },
    [`doctors-clinic-${slug}-${statusParam}`],
    {
      revalidate: 1_209_600, // Cache for 2 weeks
      tags: ['doctors', `doctors-clinic-${slug}`],
    },
  )();
}

/**
 * Fetches doctors by state with pagination
 */
export const getDoctorsByState = async (
  stateSlug: string,
  limit: number = 20,
  offset: number = 0,
  status: string = 'approved',
) => {
  // Capture parameters immediately to avoid closure issues in concurrent requests
  const slug = stateSlug;
  const limitCount = limit;
  const offsetCount = offset;
  const statusParam = status;

  // Validate inputs
  if (!slug || typeof slug !== 'string') {
    console.error('Invalid stateSlug provided to getDoctorsByState:', stateSlug);
    return { data: [], count: 0 };
  }

  return unstable_cache(
    async () => {
      const supabase = createAdminClient();

      const { data: result, error } = await supabase.rpc('get_ranged_doctor_by_state_slug', {
        state_slug_param: slug,
        from_index_param: offsetCount,
        to_index_param: offsetCount + limitCount - 1,
        status_param: statusParam,
      });

      if (error) {
        console.error(
          `Error fetching doctors by state "${slug}" (limit: ${limitCount}, offset: ${offsetCount}):`,
          error,
        );
        return { data: [], count: 0 };
      }

      if (!result) {
        return { data: [], count: 0 };
      }

      // Type assertion for the RPC result structure
      const typedResult = result as { data: RawDoctorWithClinics[]; count: number };

      const doctors = transformDoctorsData(typedResult.data || []);

      return { data: doctors, count: typedResult.count || 0 };
    },
    [`doctors-state-${slug}-${limitCount}-${offsetCount}-${statusParam}`],
    {
      revalidate: 1_209_600, // Cache for 2 weeks
      tags: ['doctors', `doctors-state-${slug}`],
    },
  )();
};
