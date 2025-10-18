'use client';

import Image, { ImageProps } from 'next/image';

import { bypassImageKitLoader, imageKitLoader } from '@/lib/utils';

interface ImageKitProps extends ImageProps {
  src: string;
  alt: string;
  directory?: string;
  fullBleed?: boolean;
}

export function ImageKit({
  src = 'default-image.jpg',
  alt = 'Default image',
  directory,
  width = 400,
  height = 400,
  ...props
}: ImageKitProps) {
  const isOnImageKit = src.startsWith(
    `https://ik.imagekit.io/${process.env.NEXT_PUBLIC_IMAGEKIT_ID}`,
  );
  const imageSrc = directory ? `${directory}/${src}` : src;
  return (
    <Image
      loader={isOnImageKit ? bypassImageKitLoader : imageKitLoader}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      {...props}
    />
  );
}
