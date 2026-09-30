'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateClinics() {
  revalidateTag('clinics');
}

export async function revalidateAreas() {
  revalidateTag('areas');
}

export async function revalidateStates() {
  revalidateTag('states');
  revalidateTag('popular-states');
}

export async function revalidateDoctors() {
  revalidateTag('doctors');
}

export async function revalidateReviews() {
  revalidateTag('reviews');
  revalidateTag('clinics');
  revalidatePath('/place/[clinicSlug]', 'page');
  revalidatePath('/place/[clinicSlug]/reviews', 'page');
}

export async function revalidateClinicReview(slugs: string[]) {
  revalidateTag('reviews');
  revalidateTag('clinics');

  const uniqueSlugs = [...new Set(slugs.filter(Boolean))];
  for (const slug of uniqueSlugs) {
    revalidatePath(`/place/${slug}`);
    revalidatePath(`/place/${slug}/reviews`);
  }
}
