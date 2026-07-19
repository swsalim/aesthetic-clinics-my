import type { SupabaseClient } from '@supabase/supabase-js';

import type { ClinicImage } from '@/types/clinic';

export type ClinicImageEntry =
  | {
      kind: 'existing';
      id: string;
      image_url: string;
      imagekit_file_id: string;
      display_order?: number;
    }
  | {
      kind: 'new';
      file: File;
      tempId: string;
    };

export function clinicImagesToEntries(images: ClinicImage[]): ClinicImageEntry[] {
  return [...images]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((image) => ({
      kind: 'existing' as const,
      id: image.id,
      image_url: image.image_url,
      imagekit_file_id: image.imagekit_file_id,
      display_order: image.display_order,
    }));
}

export function createNewImageEntries(files: File[]): ClinicImageEntry[] {
  return files.map((file) => ({
    kind: 'new' as const,
    file,
    tempId: crypto.randomUUID(),
  }));
}

export function entriesToClinicImages(entries: ClinicImageEntry[]): ClinicImage[] {
  return entries
    .filter((entry): entry is Extract<ClinicImageEntry, { kind: 'existing' }> => entry.kind === 'existing')
    .map((entry) => ({
      id: entry.id,
      image_url: entry.image_url,
      imagekit_file_id: entry.imagekit_file_id,
      display_order: entry.display_order,
    }));
}

type UploadResult = { url: string; fileId: string };

export async function uploadOrderedNewImages(
  orderedImages: ClinicImageEntry[],
  uploadFn: (file: File) => Promise<UploadResult | null>,
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const entry of orderedImages) {
    if (entry.kind !== 'new') {
      continue;
    }

    const result = await uploadFn(entry.file);
    if (!result) {
      throw new Error('Failed to upload one or more images. Please try again.');
    }

    results.push(result);
  }

  return results;
}

export async function persistClinicImageOrder(
  supabase: SupabaseClient,
  clinicId: string,
  orderedImages: ClinicImageEntry[],
  uploadFn: (file: File) => Promise<UploadResult | null>,
): Promise<ClinicImage[]> {
  if (orderedImages.length === 0) {
    return [];
  }

  const uploadedMap = new Map<string, UploadResult>();

  for (const entry of orderedImages) {
    if (entry.kind === 'new') {
      const result = await uploadFn(entry.file);
      if (result) {
        uploadedMap.set(entry.tempId, result);
      }
    }
  }

  const savedImages: ClinicImage[] = [];

  for (let index = 0; index < orderedImages.length; index++) {
    const entry = orderedImages[index];
    const display_order = index + 1;

    if (entry.kind === 'existing') {
      const { data, error } = await supabase
        .from('clinic_images')
        .update({ display_order })
        .eq('id', entry.id)
        .select('id, image_url, imagekit_file_id, display_order')
        .single();

      if (error) {
        console.error('Error updating image display order:', error);
        continue;
      }

      if (data) {
        savedImages.push(data);
      }
    } else {
      const uploaded = uploadedMap.get(entry.tempId);
      if (!uploaded) {
        continue;
      }

      const { data, error } = await supabase
        .from('clinic_images')
        .insert({
          clinic_id: clinicId,
          image_url: uploaded.url,
          imagekit_file_id: uploaded.fileId,
          display_order,
        })
        .select('id, image_url, imagekit_file_id, display_order')
        .single();

      if (error) {
        console.error('Error inserting clinic image:', error);
        continue;
      }

      if (data) {
        savedImages.push(data);
      }
    }
  }

  return savedImages;
}
