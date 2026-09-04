/** Client-side helper to upload a file to Cloudflare R2 via /api/upload-r2. */
export async function uploadFileToR2(
  file: File,
  folder: 'places' | 'persons' | 'location' | 'static' = 'places',
): Promise<{ url: string; key: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('fileName', file.name);

    const response = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('R2 upload failed:', errorData);
      return null;
    }

    const data = await response.json();
    if (!data.r2_key || !data.r2_url) {
      console.error('R2 upload missing key/url:', data);
      return null;
    }

    return { url: data.r2_url as string, key: data.r2_key as string };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    return null;
  }
}

export async function deleteFileFromR2(r2Key: string): Promise<boolean> {
  try {
    const response = await fetch('/api/delete-r2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ r2_key: r2Key }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting from R2:', error);
    return false;
  }
}
