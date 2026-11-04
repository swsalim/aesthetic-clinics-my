import Link from 'next/link';

import { ClinicImage } from '@/types/clinic';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';

import { getRecentClinics } from '@/helpers/clinics';

import { ClinicCard } from '@/components/cards/clinic-card';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

export async function RecentClinics() {
  const clinics = await getRecentClinics();

  return (
    <Wrapper className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/30">
      <Container className="min-w-0">
        <div className="mb-8 flex min-w-0 flex-col gap-3 md:mb-10 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h2 className="text-balance font-display text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
              Recently updated clinics
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
              Fresh listings with hours, contact details, and patient reviews.
            </p>
          </div>
          <Link
            href="/browse"
            prefetch={false}
            className="inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-blue-600 no-underline transition hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:self-auto dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:outline-blue-400">
            View all clinics
            <ArrowRightIcon weight="duotone" className="size-4" aria-hidden="true" />
          </Link>
        </div>
        {clinics.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No recent clinics found.</p>
          </div>
        ) : (
          <>
            <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
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
                    image={clinic.images?.[0] as ClinicImage | undefined}
                    rating={clinic.rating}
                    hours={clinic.hours || []}
                    specialHours={clinic.special_hours || []}
                    openOnPublicHolidays={clinic.open_on_public_holidays || false}
                    isPermanentlyClosed={clinic.is_permanently_closed || false}
                  />
                );
              })}
            </div>
          </>
        )}
      </Container>
    </Wrapper>
  );
}
