'use client';

import Image, { ImageProps } from 'next/image';

import { bypassCloudinaryLoader, cloudinaryLoader } from '@/lib/utils';

interface ImageCloudinaryProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  directory?: string | null;
  width?: number;
  height?: number;
}

export function ImageCloudinary({
  src = 'default-image.jpg',
  alt = 'Default image',
  directory = null,
  width = 400,
  height = 400,
  ...props
}: ImageCloudinaryProps) {
  const isOnCloudinary =
    src.startsWith('https://res.cloudinary.com/typeeighty') ||
    src.startsWith('https://res.cloudinary.com/dentalclinicsmalaysia');
  const imageSrc = isOnCloudinary
    ? src
    : directory
      ? `dental-clinics-my/${directory}/${src}`
      : `dental-clinics-my/${src}`;

  return (
    <Image
      loader={isOnCloudinary ? bypassCloudinaryLoader : cloudinaryLoader}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      {...props}
    />
  );
}
