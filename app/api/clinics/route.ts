import { NextResponse } from 'next/server';

import { DatabaseService } from '@/services/database.service';
import { GoogleMapsService } from '@/services/google-maps.service';
import { z } from 'zod';

import { sendNewClinicNotification } from '@/lib/email';
import { slugify } from '@/lib/utils';

// Types
interface ClinicSubmissionData {
  name: string;
  email: string;
  clinic_name: string;
  clinic_email?: string;
  description: string;
  state_id: string;
  area_id: string;
  address: string;
  phone: string;
  postal_code: string;
  images?: Array<{ url: string; fileId: string }>;
  youtube_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  featured_video?: string;
  price: 'instant' | 'free';
}

// Validation schema
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  clinic_name: z.string().min(1, 'Clinic name is required'),
  clinic_email: z.string().email('Invalid clinic email').optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  state_id: z.string().min(1, 'State is required'),
  area_id: z.string().min(1, 'Area is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  postal_code: z.string().min(5, 'Postal code must be at least 5 characters'),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        fileId: z.string(),
      }),
    )
    .optional(),
  youtube_url: z.string().url('Invalid YouTube URL').optional().or(z.literal('')),
  facebook_url: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
  featured_video: z.string().url('Invalid featured video URL').optional().or(z.literal('')),
  price: z.enum(['instant', 'free']),
});

export async function POST(request: Request) {
  try {
    // Parse JSON data instead of FormData
    const data: ClinicSubmissionData = await request.json();

    // Validate the data
    const validatedData = schema.parse(data);

    // Initialize services
    const googleMapsService = new GoogleMapsService();
    const databaseService = new DatabaseService();

    // Images are already uploaded to ImageKit, so we can use them directly
    const images: Array<{ url: string; fileId: string }> = validatedData.images || [];

    // Geocode address
    const { lat, lng, placeId, neighborhood, city } = await googleMapsService.geocodeAddress(
      validatedData.address,
      validatedData.postal_code,
    );

    // Generate slug
    const slug = slugify(
      `${validatedData.clinic_name}-${validatedData.area_id}-${Math.floor(Math.random() * 10000)}`,
    );

    // Create clinic in database
    const clinic = await databaseService.createClinic({
      name: validatedData.clinic_name,
      description: validatedData.description,
      slug,
      state_id: validatedData.state_id,
      area_id: validatedData.area_id,
      address: validatedData.address,
      phone: validatedData.phone,
      postal_code: validatedData.postal_code,
      email: validatedData.clinic_email,
      images: null, // Set to null since images are stored in clinic_images table
      neighborhood,
      city,
      latitude: lat,
      longitude: lng,
      location: `POINT(${lng} ${lat})`,
      youtube_url: validatedData.youtube_url,
      facebook_url: validatedData.facebook_url,
      instagram_url: validatedData.instagram_url,
      featured_video: validatedData.featured_video,
      place_id: placeId,
      source: 'ugc_free',
      status: 'pending',
    });

    // Insert images into clinic_images table
    if (images.length > 0) {
      await databaseService.insertClinicImages(clinic.id, images);
    }

    // Send notification email
    await sendNewClinicNotification({
      name: validatedData.name,
      email: validatedData.email,
      clinicName: validatedData.clinic_name,
      clinicEmail: validatedData.clinic_email,
      phone: validatedData.phone,
      address: validatedData.address,
      description: validatedData.description,
      price: validatedData.price,
    });

    return NextResponse.json(
      {
        success: true,
        clinic,
        imageCount: images.length,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error('Error processing submission:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to process submission',
        details: errorMessage,
      },
      { status: 400 },
    );
  }
}
