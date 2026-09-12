/** Client-side helper to upload/delete files via ImageKit API routes. */

export type ImageKitFolder =
  | 'aesthetic-clinics-my/places'
  | 'aesthetic-clinics-my/persons'
  | 'aesthetic-clinics-my/location'
  | string;

export async function uploadFileToImageKit(
  file: File,
  folder: ImageKitFolder = 'aesthetic-clinics-my/places',
  fileName?: string,
): Promise<{ url: string; fileId: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('fileName', fileName || file.name);

    const response = await fetch('/api/upload-imagekit', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ImageKit upload failed:', errorData);
      return null;
    }

    const data = await response.json();
    if (!data.success || !data.imagekit_file_id || !data.url) {
      console.error('ImageKit upload missing fileId/url:', data);
      return null;
    }

    return { url: data.url as string, fileId: data.imagekit_file_id as string };
  } catch (error) {
    console.error('Error uploading to ImageKit:', error);
    return null;
  }
}

export async function deleteFileFromImageKit(imagekitFileId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/delete-imagekit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagekit_file_id: imagekitFileId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting from ImageKit:', error);
    return false;
  }
}
