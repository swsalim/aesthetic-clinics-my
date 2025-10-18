'use client';

import { Suspense } from 'react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { ImageCloudinary } from '@/components/image/image-cloudinary';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageCarouselProps {
  images: string[];
  title: string;
  className?: string;
}

function ImageCarouselSkeleton() {
  return (
    <div className="relative h-[200px] w-full overflow-hidden rounded-md sm:h-[270px] md:h-[350px]">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

function ImageSlide({ image, title, index }: { image: string; title: string; index: number }) {
  return (
    <div className="relative h-[200px] w-full overflow-hidden rounded-md sm:h-[270px] md:h-[350px]">
      <ImageCloudinary
        src={image}
        alt={`Photo ${index + 1} for ${title}`}
        priority={index === 0}
        width={800}
        height={800}
        className="h-full w-full transform bg-gray-100 object-cover object-center"
      />
    </div>
  );
}

export default function ImageCarousel({ images, title, className }: ImageCarouselProps) {
  if (!images?.length) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          clickable: true,
        }}
        className="mySwiper h-[200px] w-full sm:h-[270px] md:h-[350px]">
        <Suspense fallback={<ImageCarouselSkeleton />}>
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <ImageSlide image={image} title={title} index={index} />
            </SwiperSlide>
          ))}
        </Suspense>
      </Swiper>
    </div>
  );
}
