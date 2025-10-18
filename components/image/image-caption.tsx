import { Suspense } from 'react';

import Link from 'next/link';

import { cn } from '@/lib/utils';

import { ImageCloudinary } from '@/components/image/image-cloudinary';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageCaptionProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  priority?: boolean;
  fullBleed?: boolean;
  showAttribute?: boolean;
  authorName?: string;
  authorLink?: string;
  isPortrait?: boolean;
  isSolid?: boolean;
  className?: string;
  noMarginTop?: boolean;
  directory?: string;
}

interface ImageWrapperProps {
  children: React.ReactNode;
  className?: string;
  isPortrait?: boolean;
  fullBleed?: boolean;
}

interface CaptionProps {
  showAttribute?: boolean;
  caption?: string;
  authorName?: string;
  authorLink?: string;
}

function ImageWrapper({ children, className, isPortrait, fullBleed }: ImageWrapperProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        {
          'aspect-h-4 aspect-w-3': isPortrait,
          'aspect-h-3 aspect-w-4': !isPortrait,
          'lg:rounded-2xl': fullBleed,
          'rounded-2xl': !fullBleed,
        },
        className,
      )}>
      {children}
    </div>
  );
}

function Caption({ showAttribute, caption, authorName, authorLink }: CaptionProps) {
  if (!caption && !showAttribute) return null;

  return (
    <figcaption className="mt-2 block text-center text-sm text-gray-500">
      {!showAttribute && caption}
      {showAttribute && authorLink && authorName && (
        <span>
          Photo by{' '}
          <Link href={authorLink} target="_blank" rel="noreferrer" className="hover:text-gray-700">
            {authorName}
          </Link>
        </span>
      )}
    </figcaption>
  );
}

function ImageSkeleton() {
  return (
    <div className="h-full w-full animate-pulse bg-gray-200">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

export default function ImageCaption({
  src,
  alt,
  width,
  height,
  caption,
  priority,
  fullBleed,
  showAttribute,
  authorName,
  authorLink,
  isPortrait = false,
  isSolid = false,
  className,
  noMarginTop = false,
  directory,
}: ImageCaptionProps) {
  const defaultWidth = fullBleed ? 1000 : 800;
  const defaultHeight = fullBleed ? 1000 : 800;

  const imageContent = (
    <ImageWrapper className={className} isPortrait={isPortrait} fullBleed={fullBleed}>
      <Suspense fallback={<ImageSkeleton />}>
        <ImageCloudinary
          src={src}
          alt={alt}
          directory={directory}
          priority={priority}
          width={width || defaultWidth}
          height={height || defaultHeight}
          className="mt-0 h-full w-full transform bg-gray-100 object-cover object-center"
        />
      </Suspense>
      <div
        className={cn('absolute inset-0 ring-1 ring-inset ring-gray-900/10', {
          'lg:rounded-2xl': fullBleed,
          'rounded-2xl': !fullBleed,
        })}
      />
    </ImageWrapper>
  );

  return (
    <>
      {fullBleed ? (
        <div className="full-bleed">
          <div className="group relative">
            <figure className={cn({ 'mt-0': noMarginTop })}>
              {imageContent}
              <Caption
                showAttribute={showAttribute}
                caption={caption}
                authorName={authorName}
                authorLink={authorLink}
              />
            </figure>
          </div>
        </div>
      ) : (
        <div className="group relative">
          <figure className={cn('mx-auto max-w-2xl', { 'mt-0': isSolid })}>
            {imageContent}
            <Caption
              showAttribute={showAttribute}
              caption={caption}
              authorName={authorName}
              authorLink={authorLink}
            />
          </figure>
          {isSolid && (
            <div
              className="absolute -right-1 -top-1 -z-10 mb-4 h-full w-full overflow-hidden rounded-2xl bg-blue-100 opacity-100 transition-all duration-200 group-hover:right-1 group-hover:top-1 group-hover:bg-blue-400 group-hover:bg-opacity-30"
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </>
  );
}
