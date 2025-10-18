import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ClinicImage } from '@/types/clinic';
import { ArrowRightIcon } from 'lucide-react';

import { siteConfig } from '@/config/site';

import { cn, getPagination } from '@/lib/utils';
import { absoluteUrl } from '@/lib/utils';

import { getClinicByServiceId, getClinicByServiceMetadataId } from '@/helpers/clinics';
import { getAllServices, getServiceBySlugStatic } from '@/helpers/services';

import { ClinicCard } from '@/components/cards/clinic-card';
import { ImageCloudinary } from '@/components/image/image-cloudinary';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import WebSiteJsonLd from '@/components/structured-data/website-json-ld';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import { Wrapper } from '@/components/ui/wrapper';

type ServicePageProps = {
  params: Promise<{
    serviceSlug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: ServicePageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  const { page } = await searchParams;

  const serviceData = await getServiceBySlugStatic(serviceSlug);

  if (!serviceData) {
    notFound();
  }

  const serviceName = serviceData.name;
  const serviceDescription = serviceData.description || serviceData.name;

  const title = `${serviceName} - Find Top Aesthetic Clinics`;
  const description = `Find qualified aesthetic clinics offering ${serviceDescription.toLowerCase()} services near you. Compare reviews, locations, and book appointments online.`;
  const url = !page
    ? absoluteUrl(`/services/${serviceSlug}`)
    : page === '1'
      ? absoluteUrl(`/services/${serviceSlug}`)
      : absoluteUrl(`/services/${serviceSlug}?page=${page}`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${title}`),
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
      creator: siteConfig.creator,
      images: [
        {
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${title}`),
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: title,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  // Get all services
  const services = await getAllServices();

  return services.map((service) => ({
    serviceSlug: service.slug,
  }));
}

// Force static generation - this ensures the page is generated at build time
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour (3600 seconds)

export default async function ServicePage({ params, searchParams }: ServicePageProps) {
  const { serviceSlug } = await params;
  const { page } = await searchParams;

  const limit = 20;
  const currentPage = page ? +page : 1;
  const { from, to } = getPagination(currentPage, limit);

  const [serviceData, services] = await Promise.all([
    getServiceBySlugStatic(serviceSlug),
    getAllServices(),
  ]);

  if (!serviceData) {
    notFound();
  }

  const [totalClinics, clinics] = await Promise.all([
    getClinicByServiceMetadataId(serviceData.id).then((count) => Number(count) || 0),
    getClinicByServiceId(serviceData.id, from, to),
  ]);

  const totalPages = Math.ceil(totalClinics / limit);
  const { name: serviceName } = serviceData;
  const serviceDescription = serviceData.description ?? serviceData.name;

  const title = `${serviceName} - Find Top Aesthetic Clinics`;
  const description = `Find qualified aesthetic clinics offering ${serviceDescription.toLowerCase()} services near you. Compare reviews, locations, and book appointments online.`;

  const JSONLDbreadcrumbs = [
    {
      item: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      name: 'Home',
      position: '1',
    },
    {
      // TODO: change to services
      item: absoluteUrl(`/browse`),
      name: 'Services',
      position: '2',
    },
    {
      item: absoluteUrl(`/services/${serviceSlug}`),
      name: serviceData.name,
      position: '3',
    },
  ];

  const JSONLDlistItems = clinics.slice(0, 20).map((clinic, index) => ({
    '@type': 'ListItem',
    position: `${index + 1}`,
    item: {
      '@type': 'Dentist',
      '@id': absoluteUrl(`/place/${clinic.slug}`),
      name: clinic.name,
      image: absoluteUrl(`/api/og?title=${clinic.name}`),
      address: {
        '@type': 'PostalAddress',
        addressLocality: clinic.area?.name,
        addressRegion: clinic.state?.name,
        postalCode: clinic.postal_code,
        streetAddress: clinic.address,
        addressCountry: 'MY',
      },
      telephone: clinic.phone,
      url: absoluteUrl(`/place/${clinic.slug}`),
    },
  }));

  return (
    <>
      <WebSiteJsonLd />
      <WebPageJsonLd
        description={description}
        id={`/services/${serviceSlug}`}
        lastReviewed={new Date().toISOString()}
        reviewedBy={process.env.NEXT_PUBLIC_SCHEMA_REVIEWER}
      />
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: title,
            itemListElement: JSONLDlistItems,
          }),
        }}
      />
      <Wrapper>
        <Container>
          <h1 className="mb-0 text-xl font-black leading-7 text-gray-800 sm:truncate sm:text-3xl sm:leading-9 dark:text-gray-50">
            {serviceData.name}
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{serviceData.description}</p>
        </Container>
      </Wrapper>

      <Wrapper className="py-0 md:py-0">
        <Container>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {services.map((service) => (
              <Link
                href={absoluteUrl(`/services/${service.slug}`)}
                className="text-balance py-1 text-base font-medium hover:border-transparent md:text-lg"
                key={service.slug}
                prefetch={false}>
                {service.name}
              </Link>
            ))}
          </div>
        </Container>
      </Wrapper>

      <Wrapper>
        <Container>
          <h2 className="mb-6 text-balance text-xl font-bold md:text-2xl">
            {totalClinics} Aesthetic Clinics that provides {serviceData.name}
          </h2>
          {clinics.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
                {clinics
                  ?.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
                  .map((clinic) => (
                    <ClinicCard
                      key={clinic.slug}
                      slug={clinic.slug ?? ''}
                      name={clinic.name ?? ''}
                      address={clinic.address ?? ''}
                      phone={clinic.phone ?? ''}
                      postalCode={clinic.postal_code ?? ''}
                      state={clinic.state?.name ?? ''}
                      area={clinic.area?.name ?? ''}
                      image={
                        clinic.images?.[0]
                          ? (clinic.images[0] as unknown as ClinicImage).image_url
                          : undefined
                      }
                      rating={clinic.rating}
                      isFeatured={clinic.is_featured ?? false}
                      hours={clinic.hours ?? []}
                      specialHours={clinic.special_hours ?? []}
                      openOnPublicHolidays={clinic.open_on_public_holidays ?? false}
                    />
                  ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-y-4">
              <div className="flex flex-col items-center justify-center">
                <div className="relative size-64 md:size-96">
                  <ImageCloudinary
                    src="lost-boy.png"
                    alt="No aesthetic clinics found"
                    width={500}
                    height={500}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <h2 className="text-balance text-2xl font-bold md:text-4xl">Oops!</h2>
              <p className="text-balance text-lg">
                No aesthetic clinics provides {serviceData.name}.
              </p>
              <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-3">
                <Link
                  href="/submit"
                  className={cn(buttonVariants({ variant: 'primary' }), 'flex flex-row gap-x-2')}
                  prefetch={false}>
                  Add a clinic
                  <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  href="/"
                  className={cn(buttonVariants({ variant: 'ghost' }), 'flex flex-row gap-x-2')}
                  prefetch={false}>
                  Get back to homepage
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </div>
          )}
        </Container>
      </Wrapper>
    </>
  );
}
