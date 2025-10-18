import { createAdminClient } from '@/lib/supabase/admin';

export interface ClinicData {
  name: string;
  description: string;
  slug: string;
  state_id: string;
  area_id: string;
  address: string;
  phone: string;
  postal_code: string;
  email?: string;
  images: null; // Changed to null since images are now stored in clinic_images table
  neighborhood: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  location: string;
  youtube_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  featured_video?: string;
  place_id: string;
  source: string;
  status: string;
}

export interface ClinicImageData {
  url: string;
  fileId: string;
}

export class DatabaseService {
  private readonly supabase;

  constructor() {
    this.supabase = createAdminClient();
  }

  async createClinic(data: ClinicData) {
    const { error, data: clinic } = await this.supabase
      .from('clinics')
      .insert({
        ...data,
        images: null, // Always set images to null since they're stored in clinic_images table
        rating: 0,
        review_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create clinic: ${error.message}`);
    }

    return clinic;
  }

  async getClinicById(clinicId: string) {
    const { data, error } = await this.supabase
      .from('clinics')
      .select('*')
      .eq('id', clinicId)
      .single();

    if (error) {
      throw new Error(`Failed to get clinic by id: ${error.message}`);
    }

    return data;
  }

  async insertClinicImages(clinicId: string, images: ClinicImageData[]) {
    if (images.length === 0) {
      return [];
    }

    const imageRecords = images.map((image, index) => ({
      clinic_id: clinicId,
      image_url: image.url,
      imagekit_file_id: image.fileId,
      display_order: index + 1,
    }));

    const { error, data: insertedImages } = await this.supabase
      .from('clinic_images')
      .insert(imageRecords)
      .select();

    if (error) {
      throw new Error(`Failed to insert clinic images: ${error.message}`);
    }

    return insertedImages || [];
  }

  async updateClinicStatus(clinicId: string, status: string) {
    const { error, data } = await this.supabase
      .from('clinics')
      .update({ status })
      .eq('id', clinicId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update clinic status: ${error.message}`);
    }

    return data;
  }
}
