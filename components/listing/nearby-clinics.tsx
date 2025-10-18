import { Suspense } from 'react';

import { ClinicHours, ClinicImage } from '@/types/clinic';

import { getClinicsNearLocation } from '@/helpers/clinics';

import { ClinicCard } from '@/components/cards/clinic-card';
import { ListingCardsSkeleton } from '@/components/listing/listing-cards-skeleton';
import Container from '@/components/ui/container';
import Prose from '@/components/ui/prose';
import { Wrapper } from '@/components/ui/wrapper';

interface NearbyClinicsProps {
  latitude: number;
  longitude: number;
  radiusInKm?: number;
  limit?: number;
}

async function NearbyClinicsContent({
  latitude,
  longitude,
  radiusInKm = 10,
  limit = 5,
}: NearbyClinicsProps) {
  const nearbyClinics = await getClinicsNearLocation(latitude, longitude, radiusInKm, limit);

  if (!nearbyClinics || nearbyClinics.length === 0) {
    return null;
  }

  // Filter out the current clinic and get up to 4 nearby clinics
  const filteredClinics = nearbyClinics.slice(1, 5);

  return (
    <Wrapper size="lg" className="pt-12 md:pt-12">
      <Container>
        <article>
          <Prose>
            <h2 className="mb-6">Nearby Clinics</h2>
          </Prose>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
            {filteredClinics.map((clinic) => (
              <ClinicCard
                key={clinic.slug}
                slug={clinic.slug ?? ''}
                name={clinic.name ?? ''}
                address={clinic.address ?? ''}
                phone={clinic.phone ?? ''}
                image={
                  clinic.images?.[0]
                    ? (clinic.images[0] as unknown as ClinicImage).image_url
                    : undefined
                }
                postalCode={clinic.postal_code ?? ''}
                state={clinic.state_name ?? ''}
                area={clinic.area_name ?? ''}
                rating={clinic.rating ?? 0}
                isFeatured={clinic.is_featured ?? false}
                hours={Array.isArray(clinic.hours) ? (clinic.hours as Partial<ClinicHours>[]) : []}
                specialHours={[]}
                openOnPublicHolidays={clinic.open_on_public_holidays ?? false}
                distance={clinic.distance_km}
              />
            ))}
          </div>
        </article>
      </Container>
    </Wrapper>
  );
}

export default function NearbyClinics(props: NearbyClinicsProps) {
  return (
    <Suspense fallback={<ListingCardsSkeleton />}>
      <NearbyClinicsContent {...props} />
    </Suspense>
  );
}
