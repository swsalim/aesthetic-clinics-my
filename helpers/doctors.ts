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

export async function getDoctorMetadataBySlug(slug: string, status: string = 'approved') {
  const supabase = createAdminClient();

  const { data: doctorData } = (await supabase
    .from('clinic_doctors')
    .select(DOCTOR_WITH_CLINICS_SELECT)
    .match({ slug, is_active: true, status })
    .single()) as {
    data: RawDoctorWithClinics;
  };

  if (!doctorData) {
    return null;
  }

  return transformDoctorData(doctorData);
}

export async function getDoctorListings(status: string = 'approved') {
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
}

/**
 * Fetches a doctor by its slug with all related data
 */
export async function getDoctorBySlug(
  slug: string,
  status: string = 'approved',
): Promise<ClinicDoctor | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('clinic_doctors')
    .select(DOCTOR_WITH_CLINICS_SELECT)
    .match({ slug, is_active: true, status })
    .single();

  if (error) {
    console.error('Error fetching doctor:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return transformDoctorData(data as unknown as RawDoctorWithClinics);
}

/**
 * Fetches a doctor by its slug with all related data using admin client for static generation
 */
export async function getDoctorBySlugStatic(
  slug: string,
  status: string = 'approved',
): Promise<ClinicDoctor | null> {
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
}

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
  const supabase = await createServerClient();
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

  const doctors = transformDoctorsData(data || []);

  return { data: doctors, count };
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
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('get_doctors_by_clinic_slug', {
    clinic_slug_param: clinicSlug,
    status_param: status,
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
}

/**
 * Fetches doctors by state with pagination
 */
export async function getDoctorsByState(
  stateSlug: string,
  limit: number = 20,
  offset: number = 0,
  status: string = 'approved',
) {
  const supabase = await createServerClient();

  const { data: result } = await supabase.rpc('get_ranged_doctor_by_state_slug', {
    state_slug_param: stateSlug,
    from_index_param: offset,
    to_index_param: offset + limit - 1,
    status_param: status,
  });

  if (!result) {
    return { data: [], count: 0 };
  }

  // Type assertion for the RPC result structure
  const typedResult = result as { data: RawDoctorWithClinics[]; count: number };

  const doctors = transformDoctorsData(typedResult.data || []);

  return { data: doctors, count: typedResult.count || 0 };
}
