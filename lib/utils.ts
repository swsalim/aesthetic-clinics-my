import { type ClassValue, clsx } from 'clsx';
import crypto from 'crypto-js';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(input = '') {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}${input}`
    : process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}${input}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}${input}`;
}

export function imageKitLoader({
  src,
  width,
  quality = 85,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const commonImageWidths = [200, 350, 600, 900, 1200, 1800];
  const closestWidth = commonImageWidths.reduce((a, b) =>
    Math.abs(b - width) < Math.abs(a - width) ? b : a,
  );

  if (src[0] === '/') src = src.slice(1);

  const params = [`w-${closestWidth}`];
  if (quality) params.push(`q-${quality}`);
  params.push('f-auto', 'c-at_max'); // Auto format and crop at max
  const paramsString = params.join(',');

  let urlEndpoint = `https://ik.imagekit.io/${process.env.NEXT_PUBLIC_IMAGEKIT_ID}`;
  if (urlEndpoint[urlEndpoint.length - 1] === '/') {
    urlEndpoint = urlEndpoint.substring(0, urlEndpoint.length - 1);
  }
  return `${urlEndpoint}/${src}?tr=${paramsString}`;
}

export function bypassImageKitLoader({
  src,
  width,
  quality = 85,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const commonImageWidths = [200, 350, 600, 900, 1200, 1800];
  const closestWidth = commonImageWidths.reduce((a, b) =>
    Math.abs(b - width) < Math.abs(a - width) ? b : a,
  );

  const url = new URL(src);
  const transformations = [
    `w-${closestWidth}`,
    `q-${quality}`,
    'f-auto', // Auto format
    'c-at_max', // Crop at max (similar to Cloudinary's c_limit)
  ];

  url.searchParams.set('tr', transformations.join(','));

  return url.toString();
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error: unknown) {
    console.error('Invalid URL:', error);
    return false;
  }
}

export function getUrlFromString(str: string): string | null {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes('.') && !str.includes(' ')) {
      return new URL(`https://${str}`).toString();
    }
  } catch (error: unknown) {
    console.error('Failed to parse URL:', error);
    return null;
  }
  return null;
}

const normalizeSrc = (src: string): string => {
  return src.startsWith('/') ? src.slice(1) : src;
};

interface CloudinaryLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export const cloudinaryLoader = ({ src, width, quality }: CloudinaryLoaderParams): string => {
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];

  return `https://res.cloudinary.com/${
    process.env.NEXT_PUBLIC_CLOUDIARY_API_NAME
  }/image/upload/${params.join(',')}/${normalizeSrc(src)}`;
};

export const bypassCloudinaryLoader = ({ src, width, quality }: CloudinaryLoaderParams): string => {
  const publicId = getCloudinaryPublicId(src);
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];

  return `https://res.cloudinary.com/${
    process.env.NEXT_PUBLIC_CLOUDIARY_API_NAME
  }/image/upload/${params.join(',')}/${publicId}`;
};

export function getCloudinaryPublicId(url: string): string | null {
  try {
    // Use a regular expression to match 'aesthetic-clinics-my/' and everything after it
    const match = url.match(/aesthetic-clinics-my\/(.+?)(\.[a-zA-Z]+(\?.*)?)?$/);
    if (match) {
      return 'aesthetic-clinics-my/' + match[1];
    }
  } catch (error) {
    // Handle any errors gracefully
    console.error('Error extracting info:', error);
  }
  return null;
}

export const generateSHA1 = (data: string): string => {
  const hash = crypto.SHA1(data);
  return hash.toString(crypto.enc.Hex);
};

export const generateSignature = (publicId: string, apiSecret: string): string => {
  const timestamp = new Date().getTime();
  return `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
};

export function slugify(str: string): string {
  const from = 'àáãäâèéëêìíïîòóöôùúüûñç·/_,:;';
  const to = 'aaaaaeeeeiiiioooouuuunc------';

  return str
    .split('')
    .map((letter, i) => letter.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i)))
    .join('')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/\/+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

interface PaginationResult {
  from: number;
  to: number;
}

export const getPagination = (page?: number, size?: number): PaginationResult => {
  const limit = size && size > 0 ? +size : 3;
  // Ensure page is a valid positive integer, default to 1 if invalid
  const validPage = page && page > 0 ? Math.floor(page) : 1;
  const from = (validPage - 1) * limit;
  const to = from + limit - 1;

  // Extra safety check: ensure from and to are never negative
  return { from: Math.max(0, from), to: Math.max(0, to) };
};

/**
 * Converts empty HTML content to null
 * @param value - The HTML string to sanitize
 * @returns The original value if it has content, or null if empty
 */
export const sanitizeHtmlField = (value: string | undefined): string | null => {
  if (!value) return null;

  // Remove HTML tags and trim whitespace
  const textContent = value.replace(/<[^>]*>/g, '').trim();

  // If the result is empty, return null
  return textContent === '' ? null : value;
};

export const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = Date.now();
  const extension = originalFilename.split('.').pop();
  const baseName = originalFilename.replace(/\.[^/.]+$/, '');
  // Use slug for more readable filenames
  const cleanSlug = baseName.replace(/[^a-zA-Z0-9-]/g, '');
  return `${cleanSlug}_${timestamp}.${extension}`;
};
