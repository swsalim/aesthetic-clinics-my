export interface ClinicImage {
  id: string;
  image_url: string;
  imagekit_file_id: string;
}
export interface ClinicService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string | null;
  modified_at: string | null;
}

export interface ClinicServiceRelation {
  id: string;
  clinic_id: string;
  service_id: string;
  created_at: string | null;
  modified_at: string | null;
}

export interface ClinicArea {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  thumbnail_image: string | null;
  banner_image: string | null;
  image: string | null;
  imagekit_file_id: string | null;
  state_id: string | null;
  created_at: string | null;
  modified_at: string | null;
  state: { id: string; name: string; slug: string };
  clinics?: { count: number }[] | null;
}

export interface ClinicState {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  thumbnail_image: string | null;
  banner_image: string | null;
  image: string | null;
  imagekit_file_id: string | null;
  created_at: string | null;
  modified_at: string | null;
  clinics?: Partial<ClinicInsert>[] | null;
  areas?: { id: string; name: string }[] | null;
}

export type ClinicServiceInsert = Omit<ClinicService, 'id' | 'created_at' | 'modified_at'>;
export type ClinicServiceUpdate = Partial<ClinicServiceInsert>;

export interface ClinicDoctor {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  specialty: string | null;
  qualification: string | null;
  status: string | null;
  images: { id: string; image_url: string; imagekit_file_id: string }[] | null;
  featured_video: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  created_at: string | null;
  modified_at: string | null;
  clinics?:
    | {
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
      }[]
    | null;
}

export type ClinicDoctorInsert = Omit<ClinicDoctor, 'id' | 'created_at' | 'modified_at'>;
export type ClinicDoctorUpdate = Partial<ClinicDoctorInsert>;

export interface ClinicDoctorRelation {
  id: string;
  clinic_id: string;
  doctor_id: string;
  created_at: string | null;
  modified_at: string | null;
}

export type ClinicDoctorRelationInsert = Omit<
  ClinicDoctorRelation,
  'id' | 'created_at' | 'modified_at'
>;
export type ClinicDoctorRelationUpdate = Partial<ClinicDoctorRelationInsert>;

export interface ClinicHours {
  id: string;
  clinic_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  created_at: string | null;
  modified_at: string | null;
}

export type ClinicHoursInsert = Omit<ClinicHours, 'id' | 'created_at' | 'modified_at'>;
export type ClinicHoursUpdate = Partial<ClinicHoursInsert>;

export interface ClinicSpecialHours {
  id: string;
  clinic_id: string;
  date: string;
  is_closed: boolean | null;
  open_time: string | null;
  close_time: string | null;
  created_at: string | null;
  modified_at: string | null;
}

export type ClinicSpecialHoursInsert = Omit<
  ClinicSpecialHours,
  'id' | 'created_at' | 'modified_at'
>;
export type ClinicSpecialHoursUpdate = Partial<ClinicSpecialHoursInsert>;

export interface ClinicReview {
  id: string;
  clinic_id: string;
  author_name: string;
  rating: number | null;
  text: string | null;
  email: string | null;
  review_time: string | null;
  source: string | null;
  status: string | null;
  created_at: string | null;
  modified_at: string | null;
}

export type ClinicReviewInsert = Omit<ClinicReview, 'id' | 'created_at' | 'modified_at'>;
export type ClinicReviewUpdate = Partial<ClinicReviewInsert>;

export interface Clinic {
  id: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  postal_code: string | null;
  slug: string;
  description: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  location: unknown | null;
  place_id: string;
  rating: number | null;
  review_count: number | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  is_permanently_closed: boolean | null;
  open_on_public_holidays: boolean | null;
  images: ClinicImage[] | null; // Images are now stored in clinic_images tabl | e
  source: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  featured_video: string | null;
  youtube_url: string | null;
  status: string | null;
  created_at: string | null;
  modified_at: string | null;

  // Relationships
  area_id: string | null;
  state_id: string | null;
  area?: Partial<ClinicArea> | null;
  state?: Partial<ClinicState> | null;
  services?: { service: Partial<ClinicService> }[] | null;
  doctors?: { doctor: Partial<ClinicDoctor> }[] | null;
  hours?: Partial<ClinicHours>[] | null;
  special_hours?: Partial<ClinicSpecialHours>[] | null;
  reviews?: Partial<ClinicReview>[] | null;
}

export type ClinicInsert = Omit<Clinic, 'id' | 'created_at' | 'modified_at'>;

export type ClinicUpdate = Partial<ClinicInsert>;

/**
 * Type for the return value of getClinicBySlugRpc function
 */
export interface ClinicDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  postal_code: string;
  address: string;
  neighborhood: string;
  phone: string;
  email: string;
  website: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  images: { id: string; image_url: string; imagekit_file_id: string }[] | null;
  featured_video: string;
  youtube_url: string;
  facebook_url: string;
  instagram_url: string;
  source: string;
  is_permanently_closed: boolean;
  open_on_public_holidays: boolean;
  is_active: boolean;
  is_featured: boolean;
  area: Partial<ClinicArea>;
  state: Partial<ClinicState>;
  doctors: Partial<ClinicDoctor>[];
  hours: Partial<ClinicHours>[];
  special_hours: Partial<ClinicSpecialHours>[];
  services: Partial<ClinicService>[];
  reviews: Partial<ClinicReview>[];
}
