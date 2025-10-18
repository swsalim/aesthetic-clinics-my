import React from 'react';

import Link from 'next/link';

import { getAllServices, getServiceIcon } from '@/helpers/services';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string | null;
  modified_at: string | null;
}

async function fetchServices(): Promise<Service[]> {
  const services = await getAllServices();
  return services.slice(0, 6) as Service[];
}

export async function BrowseServices() {
  const services = await fetchServices();

  return (
    <Wrapper className="bg-gray-50 dark:bg-gray-950/30">
      <Container>
        <div className="flex w-full flex-col items-center justify-center md:flex-row">
          <div className="mb-10 w-full px-4 md:mb-0 md:w-5/12">
            <h2 className="mb-4 text-3xl font-black text-black md:text-4xl dark:text-gray-50">
              Browse a Variety of Aesthetic Services
            </h2>
            <p className="mb-8 text-gray-500 dark:text-gray-300">
              Whether you’re coming in for a regular checkup or need something more specialized,
              we’re here to help keep your skin bright and healthy. Take a look at the services we
              offer for kids, teens, and adults alike!
            </p>
            <Button
              asChild
              variant="primary"
              aria-label="Browse Services"
              className="rounded-full"
              size="large">
              <Link href="/services/general-dentistry">
                Browse Services
                <span className="ml-2" aria-hidden="true">
                  →
                </span>
              </Link>
            </Button>
          </div>
          <div className="grid w-full grid-cols-2 gap-6 px-4 sm:grid-cols-3 md:w-7/12">
            {services.length === 0 && (
              <div className="col-span-full text-center text-gray-400 dark:text-gray-500">
                No services found.
              </div>
            )}
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                tabIndex={0}
                aria-label={service.name}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-white p-8 text-gray-900 shadow-md outline-none transition hover:border-transparent hover:shadow-lg focus:ring-2 focus:ring-red-400 dark:bg-gray-950/40 dark:text-gray-50"
                role="button"
                prefetch={false}>
                {getServiceIcon(service.slug)}
                <div className="mt-4 text-center text-lg font-semibold text-black dark:text-gray-50">
                  {service.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Wrapper>
  );
}

export default BrowseServices;
