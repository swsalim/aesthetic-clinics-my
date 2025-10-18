export interface CloudinaryResponse {
  public_id: string;
  format: string;
}

export class CloudinaryService {
  private readonly apiName: string;
  private readonly uploadPreset: string;

  constructor() {
    const apiName = process.env.NEXT_PUBLIC_CLOUDIARY_API_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_PLACE;

    if (!apiName || !uploadPreset) {
      throw new Error('Cloudinary configuration is missing');
    }

    this.apiName = apiName;
    this.uploadPreset = uploadPreset;
  }

  async uploadImage(file: File, tags?: string[], folder?: string): Promise<string> {
    try {
      const url = `https://api.cloudinary.com/v1_1/${this.apiName}/upload`;
      const formData = new FormData();
      formData.append('upload_preset', this.uploadPreset);
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }
      if (tags && tags.length > 0) {
        formData.append('tags', tags.join(','));
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
      }

      const data: CloudinaryResponse = await response.json();
      return `https://res.cloudinary.com/${this.apiName}/image/upload/f_auto,q_auto/${data.public_id}.${data.format}`;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }
}
