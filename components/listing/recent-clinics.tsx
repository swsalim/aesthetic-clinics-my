import Link from 'next/link';

import { ClinicImage } from '@/types/clinic';

import { getRecentClinics } from '@/helpers/clinics';

import { ClinicCard } from '@/components/cards/clinic-card';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

export async function RecentClinics() {
  const clinics = await getRecentClinics(20);

  return (
    <Wrapper>
      <Container>
        <div className="mb-10 flex flex-col gap-2 text-center md:mb-12">
          <h2 className="text-balance text-3xl font-black">
            Discover best aesthetic clinics near you
          </h2>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-300">
            Browse verified reviews, clinic hours, and contact details to book your visit.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
          {clinics.map((clinic) => {
            return (
              <ClinicCard
                key={clinic.id}
                slug={clinic.slug || ''}
                name={clinic.name || ''}
                address={clinic.address || ''}
                phone={clinic.phone || ''}
                postalCode={clinic.postal_code || ''}
                state={clinic.state?.name || ''}
                area={clinic.area?.name || ''}
                image={
                  clinic.images?.[0]
                    ? (clinic.images[0] as unknown as ClinicImage).image_url
                    : undefined
                }
                rating={clinic.rating}
                hours={clinic.hours || []}
                specialHours={clinic.special_hours || []}
                openOnPublicHolidays={clinic.open_on_public_holidays || false}
              />
            );
          })}
        </div>
        <div className="mt-10 flex justify-center sm:mt-14">
          <Button variant="primary" size="large" asChild rounded>
            <Link href="/browse" className="no-underline">
              View More
            </Link>
          </Button>
        </div>
      </Container>
    </Wrapper>
  );
}
