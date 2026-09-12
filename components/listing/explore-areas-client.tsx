'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import pluralize from 'pluralize';

import { imageKitUrl } from '@/lib/imagekit-url';
import { resolveMediaUrl } from '@/lib/media';
import { MEDIA } from '@/lib/media-sizes';

import { MediaImage } from '../image/media-image';

interface AreaWithCount {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  imagekit_file_id?: string | null;
  r2_url?: string | null;
  state: { slug: string } | null;
  clinics: { count: number }[];
}

interface ExploreAreasClientProps {
  areas: AreaWithCount[];
}

export function ExploreAreasClient({ areas }: ExploreAreasClientProps) {
  const [filteredAreas, setFilteredAreas] = useState<AreaWithCount[]>([]);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('exploreAreasDate');
    const storedAreas = localStorage.getItem('exploreAreas');

    if (storedDate === today && storedAreas) {
      setFilteredAreas(JSON.parse(storedAreas));
    } else {
      const randomizedAreas = [...areas].sort(() => 0.5 - Math.random());
      localStorage.setItem('exploreAreasDate', today);
      localStorage.setItem('exploreAreas', JSON.stringify(randomizedAreas));
      setFilteredAreas(randomizedAreas);
    }
  }, [areas]);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
      {filteredAreas?.map((area) => {
        const imageSrc =
          resolveMediaUrl({
            image: area.image,
            r2_url: area.r2_url,
          }) ?? imageKitUrl('aesthetic-clinics-my/placeholder-location.jpg');

        return (
          <div key={area.id}>
            <Link href={`/${area.state?.slug}/${area.slug}`}>
              <div className="relative mb-2 h-56 w-full overflow-hidden rounded-lg md:h-52 lg:h-48">
                <MediaImage
                  src={imageSrc}
                  alt={area.name}
                  width={MEDIA.areaThumb.width}
                  height={MEDIA.areaThumb.height}
                  sizes={MEDIA.areaThumb.sizes}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-base font-semibold">{area.name}</h3>
              <p className="text-sm font-medium text-gray-700">
                {area.clinics?.[0].count} {pluralize('clinic', area.clinics?.[0].count)}
              </p>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
