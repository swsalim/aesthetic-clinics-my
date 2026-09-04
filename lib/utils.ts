import { type ClassValue, clsx } from 'clsx';
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
