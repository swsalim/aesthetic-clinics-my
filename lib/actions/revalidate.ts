'use server';

import { revalidateTag } from 'next/cache';

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
