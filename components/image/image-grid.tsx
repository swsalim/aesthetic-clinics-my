import { Suspense } from 'react';

import { ImageCloudinary } from '@/components/image/image-cloudinary';
import { ImagePlaceholder } from '@/components/image/image-placeholder';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageGridProps {
  images: string[];
  title: string;
  className?: string;
}

function ImageGridSkeleton() {
  return (
    <div className="image-grid relative overflow-y-hidden rounded-lg">
      <div className="grid grid-cols-4 grid-rows-2 gap-2">
        <div className="col-span-2 row-span-2 bg-gray-50">
          <div className="aspect-h-4 aspect-w-3 lg:aspect-h-3 lg:aspect-w-4 relative h-full w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div key={`skeleton-${index}`} className="relative h-full w-full overflow-hidden">
              <div className="aspect-h-4 aspect-w-3 lg:aspect-h-3 lg:aspect-w-4 relative h-full w-full">
                <Skeleton className="h-full w-full" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function GridImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="aspect-h-4 aspect-w-3 lg:aspect-h-3 lg:aspect-w-4 relative h-full w-full">
        <ImageCloudinary
          src={src}
          alt={alt}
          priority={priority}
          width={priority ? 800 : 600}
          height={priority ? 800 : 600}
          className="h-full w-full transform bg-gray-100 object-cover object-center"
        />
      </div>
    </div>
  );
}

export function ImageGrid({ images, title, className }: ImageGridProps) {
  if (!images?.length) {
    return null;
  }

  return (
    <div className={`image-grid relative overflow-y-hidden rounded-lg ${className ?? ''}`}>
      <div className="grid grid-cols-4 grid-rows-2 gap-2">
        <div className="col-span-2 row-span-2 bg-gray-50">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <GridImage src={images[0]} alt={`Main photo for ${title}`} priority={true} />
          </Suspense>
        </div>
        <Suspense fallback={<ImageGridSkeleton />}>
          {Array(4)
            .fill(null)
            .map((_, index) => {
              const image = images[index + 1];
              return (
                <div key={`img-${index}`} className="relative h-full w-full overflow-hidden">
                  {image ? (
                    <GridImage src={image} alt={`Photo ${index + 2} for ${title}`} />
                  ) : (
                    <ImagePlaceholder title={title} />
                  )}
                </div>
              );
            })}
        </Suspense>
      </div>
    </div>
  );
}
