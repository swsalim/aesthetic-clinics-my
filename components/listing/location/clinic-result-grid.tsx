import React from 'react';

import Image from 'next/image';

import type { ListingClinic } from '@/lib/listing/location-filters';
import { MEDIA } from '@/lib/media-sizes';

import { LazyAdsArticle } from '@/components/ads/lazy-ads-article';
import { ClinicCard } from '@/components/cards/clinic-card';
import {
  getFeaturedListingCardPlaceholder,
  getFeaturedPartnerCardPlaceholder,
} from '@/components/listing/featured-clinic-spotlight';

export function ClinicResultGrid({
  clinics,
  showSampleCards = false,
  sampleState = '',
  sampleArea,
}: {
  clinics: ListingClinic[];
  showSampleCards?: boolean;
  sampleState?: string;
  sampleArea?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {showSampleCards ? (
        <>
          <ClinicCard
            key="featured-placeholder-partner"
            {...getFeaturedPartnerCardPlaceholder(sampleState, sampleArea)}
          />
          <ClinicCard
            key="featured-placeholder-listing"
            {...getFeaturedListingCardPlaceholder(sampleState, sampleArea)}
          />
        </>
      ) : null}
      {clinics.map((clinic, index) => (
        <React.Fragment key={clinic.slug || `${clinic.name}-${index}`}>
          {index === 5 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <a
                href="https://invl.me/clnm6di"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="hover:!border-b-transparent">
                <Image
                  src="/images/banner-total-image-2.jpg"
                  alt="Total Image Whita Glo"
                  width={MEDIA.adGrid.width}
                  height={MEDIA.adGrid.height}
                  quality={85}
                  sizes={MEDIA.adGrid.sizes}
                  className="mb-0 h-auto w-full object-cover"
                />
              </a>
            </div>
          ) : null}
          {index !== 5 && (index + 1) % 6 === 0 ? <LazyAdsArticle /> : null}
          <div id={clinic.anchorId} className="min-w-0">
          <ClinicCard
            slug={clinic.slug}
            name={clinic.name}
            address={clinic.address}
            neighborhood={clinic.neighborhood}
            city={clinic.city}
            phone={clinic.phone}
            postalCode={clinic.postalCode}
            state={clinic.state}
            area={clinic.area}
            image={clinic.image}
            rating={clinic.rating}
            isFeatured={clinic.isFeatured}
            isFeaturedPartner={clinic.isFeaturedPartner}
            hours={clinic.hours}
            specialHours={clinic.specialHours}
            openOnPublicHolidays={clinic.openOnPublicHolidays}
            isPermanentlyClosed={clinic.isPermanentlyClosed}
          />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
