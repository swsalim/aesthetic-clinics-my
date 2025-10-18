'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import pluralize from 'pluralize';

import { ImageCloudinary } from '../image/image-cloudinary';

interface AreaWithCount {
  id: string;
  name: string;
  slug: string;
  thumbnail_image: string | null;
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
      {filteredAreas?.map((area) => (
        <div key={area.id}>
          <Link href={`/${area.state?.slug}/${area.slug}`}>
            <div className="relative mb-2 h-56 w-full overflow-hidden rounded-lg md:h-52 lg:h-48">
              {area.thumbnail_image && (
                <ImageCloudinary
                  src={area.thumbnail_image}
                  alt={area.name}
                  width={200}
                  height={200}
                  className=""
                />
              )}
              {!area.thumbnail_image && (
                <ImageCloudinary
                  src="placeholder-location.jpg"
                  alt={area.name}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <h3 className="text-base font-semibold">{area.name}</h3>
            <p className="text-sm font-medium text-gray-700">
              {area.clinics?.[0].count} {pluralize('clinic', area.clinics?.[0].count)}
            </p>
          </Link>
        </div>
      ))}
    </div>
  );
}
