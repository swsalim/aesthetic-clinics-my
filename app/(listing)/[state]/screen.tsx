import { Suspense } from 'react';

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Clinic } from '@/types/clinic';
import { ArrowRightIcon, PersonStandingIcon } from 'lucide-react';

import pluralize from 'pluralize';

import {
  MIN_INDEXABLE_STATE_CLINICS,
  aestheticClinicTitle,
  stateSeoOverride,
} from '@/config/location-seo';
import { siteConfig } from '@/config/site';

import { imageKitUrl } from '@/lib/imagekit-url';
import { getLocationFacetsSafe } from '@/lib/listing/location-clinic-index';
import { listingClinicFromPage } from '@/lib/listing/location-filters';
import { resolveMediaUrl } from '@/lib/media';
import { MEDIA } from '@/lib/media-sizes';
import { absoluteUrl, cn, getPagination } from '@/lib/utils';

import { getFeaturedListings } from '@/helpers/clinics';
import { getDoctorsByState } from '@/helpers/doctors';
import { getStateBySlug, getStateListings } from '@/helpers/states';

import { MediaImage } from '@/components/image/media-image';
import { ClinicResultGrid } from '@/components/listing/location/clinic-result-grid';
import { LocationBrowser } from '@/components/listing/location/location-browser';
import { LocationHero, locationHeroStats } from '@/components/listing/location/location-hero';
import { LocationSeo } from '@/components/listing/location/location-seo';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import CollectionPageJsonLd from '@/components/structured-data/collection-page-json-ld';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';

export const revalidate = 86_400;
export const dynamicParams = true;

type StatePageProps = {
  params: Promise<{
    state: string;
    page?: string;
  }>;
};

function pageNumber(raw: string | undefined): number {
  const parsed = raw ? Number(raw) : 1;
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export async function generateStateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { state, page } = await params;

  // Log params for debugging production issues
  if (process.env.NODE_ENV === 'production') {
    console.log(`[generateMetadata] Processing: state="${state}"`);
  }

  const limit = 20;
  const currentPage = pageNumber(page);
  const { from, to } = getPagination(currentPage, limit);
  const stateData = await getStateBySlug(state, from, to);

  if (!stateData) {
    notFound();
  }

  const clinicCount = stateData.total_clinics || 0;
  const totalPages = Math.ceil(clinicCount / limit);
  if (currentPage > 1 && currentPage > totalPages) {
    notFound();
  }
  const seo = stateSeoOverride({ stateSlug: state, clinicCount });
  const title = seo?.title ?? aestheticClinicTitle(clinicCount, stateData.name);
  const description =
    seo?.description ??
    `Explore aesthetic clinics in ${stateData.name}. View ratings, services, and treatment options to find a clinic for your skincare or cosmetic goals.`;
  const url = absoluteUrl(`/${state}`);

  // Build the OG image URL with optional background image
  const ogImageUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og-list`);
  ogImageUrl.searchParams.set('title', title);
  if (stateData.image) {
    ogImageUrl.searchParams.set('image', stateData.image);
  }

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots:
      clinicCount >= MIN_INDEXABLE_STATE_CLINICS && currentPage === 1
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: ogImageUrl,
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
          url: ogImageUrl,
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: title,
        },
      ],
    },
  };
}

export async function generateStateStaticParams() {
  const states = await getStateListings();

  return states.map((state) => ({
    state: state.slug,
  }));
}

export default async function StateScreen({ params }: StatePageProps) {
  const { state, page } = await params;

  // Log params for debugging production issues
  if (process.env.NODE_ENV === 'production') {
    console.log(`[StatePage] Processing: state="${state}"`);
  }

  const limit = 20;
  const currentPage = pageNumber(page);
  const { from, to } = getPagination(currentPage, limit);

  const [stateData, doctorsResult, facets] = await Promise.all([
    getStateBySlug(state, from, to),
    getDoctorsByState(state, 5, 0),
    getLocationFacetsSafe({ kind: 'state', stateSlug: state }),
  ]);

  if (!stateData) {
    notFound();
  }

  const doctors = doctorsResult.data;
  const totalDoctors = doctorsResult.count || 0;

  // Featured listings pinned to the top of this state's listing.
  const featuredListings = (await getFeaturedListings()).filter(
    (clinic) => clinic.state?.slug === state,
  );
  const featuredSlugs = new Set(featuredListings.map((clinic) => clinic.slug));
  const listingClinics = (stateData.clinics ?? []).filter(
    (clinic) => !featuredSlugs.has(clinic.slug),
  );

  const totalClinics = stateData.total_clinics || 0;
  const totalPages = Math.ceil(totalClinics / limit);
  if (currentPage > 1 && currentPage > totalPages) {
    notFound();
  }
  const seo = stateSeoOverride({ stateSlug: state, clinicCount: totalClinics });

  const nearbyAreasWithLinks = stateData.areas?.slice(0, 3) ?? [];
  const nearbyAreas = nearbyAreasWithLinks.map((area) => area.name).join(', ');
  const relatedLinks = [
    ...(stateData.areas ?? [])
      .filter((area) => area.slug)
      .map((area) => ({
        href: `/${state}/${area.slug}`,
        label: area.name ?? area.slug ?? '',
      })),
    ...facets.services.slice(0, 6).map((service) => ({
      href: `/services/${service.slug}`,
      label: service.name,
    })),
  ];
  const sortedListings = [...listingClinics].sort(
    (left, right) => Number(right.is_featured) - Number(left.is_featured),
  );
  const pageClinics = [
    ...(currentPage === 1 ? featuredListings : []),
    ...sortedListings,
  ].map((clinic) => listingClinicFromPage(clinic, { state: stateData.name }));
  const listHeading = `${totalClinics} Aesthetic ${pluralize('Clinic', totalClinics)} in ${stateData.name}`;
  const heroStats = locationHeroStats(totalClinics, facets);

  const title = `Aesthetic Clinics in ${stateData.name}`;
  const description =
    seo?.description ??
    `Explore ${totalClinics} ${pluralize('aesthetic clinic', totalClinics)} across cities like ${nearbyAreas} in ${stateData?.name}. View ratings, services, and treatment options.`;

  const breadcrumbItems = [
    {
      name: stateData.name,
    },
  ];

  const JSONLDbreadcrumbs = [
    {
      item: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      name: 'Home',
      position: '1',
    },
    {
      item: absoluteUrl(`/${state}`),
      name: stateData.name,
      position: '2',
    },
  ];

  const stateBackgroundSrc = resolveMediaUrl({
    image: stateData.image,
    r2_url: stateData.r2_url,
  });

  return (
    <>
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <CollectionPageJsonLd
        name={seo?.jsonLdName ?? `Aesthetic Clinics in ${stateData.name}`}
        url={`/${state}`}
        description={description}
        clinics={(stateData.clinics?.slice(0, 20) as Partial<Clinic>[]) || []}
      />
      <LocationHero
        breadcrumbItems={breadcrumbItems}
        heading={title}
        intro={
          seo ? (
            <>
              Looking for a skin clinic in Kuala Lumpur? This directory lists {totalClinics}{' '}
              aesthetic clinics in Kuala Lumpur
              {nearbyAreasWithLinks.length > 0 ? (
                <>
                  , across areas such as{' '}
                  {nearbyAreasWithLinks.map((area, index) => (
                    <span key={area.slug}>
                      <Link
                        href={`/${area.state?.slug}/${area.slug}`}
                        className="font-semibold text-blue-600 hover:text-blue-700"
                        prefetch={false}>
                        {area.name}
                      </Link>
                      {index < nearbyAreasWithLinks.length - 2 && ', '}
                      {index === nearbyAreasWithLinks.length - 2 && ', and '}
                    </span>
                  ))}
                </>
              ) : null}
              . Compare listings, then confirm services, reviews and the doctor with the clinic.
            </>
          ) : (
            <>
              Explore {totalClinics} {pluralize('aesthetic clinic', totalClinics)}
              {nearbyAreasWithLinks.length > 0 ? (
                <>
                  {' '}
                  across cities like{' '}
                  {nearbyAreasWithLinks.map((area, index) => (
                    <span key={area.slug}>
                      <Link
                        href={`/${area.state?.slug}/${area.slug}`}
                        className="font-semibold text-blue-600 hover:text-blue-700"
                        prefetch={false}>
                        {area.name}
                      </Link>
                      {index < nearbyAreasWithLinks.length - 2 && ', '}
                      {index === nearbyAreasWithLinks.length - 2 && ', and '}
                    </span>
                  ))}
                </>
              ) : null}{' '}
              in {stateData.name}. Find services, reviews, and opening hours.
            </>
          )
        }
        backHref={`/${state}`}
        placeName={stateData.name}
        currentPage={currentPage}
        backgroundSrc={stateBackgroundSrc}
        searchBasePath={`/${state}`}
        searchPlaceholder={`Search clinics in ${stateData.name}...`}
        stats={heroStats}
      />

      <section className="bg-white dark:bg-gray-900">
        <Container className="py-8 md:py-10">
          <div className="flex flex-col gap-y-6">
            {totalDoctors > 0 && (
              <div className="flex flex-col gap-y-4 rounded-lg border-blue-300 bg-blue-50/70 px-6 py-4 text-blue-900">
                <h2 className="text-balance text-xl font-bold md:text-xl">
                  Browse Aesthetic Doctors in {stateData.name}
                </h2>
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:justify-start">
                  <div className="flex space-x-3 md:-space-x-1">
                    {doctors.map((doctor, index) => (
                      <Link
                        href={`/doctor/${doctor.slug}`}
                        className="relative size-16 overflow-hidden rounded-full outline -outline-offset-1 outline-blue-200 ring-2 ring-blue-300"
                        key={`${doctor.id}-${index}`}
                      >
                        {resolveMediaUrl(doctor.images?.[0]) && (
                          <MediaImage
                            src={resolveMediaUrl(doctor.images?.[0]) ?? ''}
                            alt={`Photo of ${doctor.name}`}
                            width={MEDIA.avatar.width}
                            height={MEDIA.avatar.height}
                            sizes={MEDIA.avatar.sizes}
                            priority
                            className="h-full w-full object-cover"
                          />
                        )}
                        {!doctor.images?.[0] && (
                          <div className="mx-auto mb-6 h-full w-full p-0 md:p-0">
                            <PersonStandingIcon className="size-12" />
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/${state}/doctors`}
                    className={cn(
                      buttonVariants({ variant: 'secondary' }),
                      'w-full border-blue-300 bg-blue-200/40 text-sm text-blue-800 hover:border-blue-400 hover:bg-blue-200/60 hover:text-blue-900 active:border-blue-400 active:bg-blue-200/80 active:text-blue-900 sm:w-auto',
                    )}
                    prefetch={false}
                  >
                    View All Aesthetic Doctors
                  </Link>
                </div>
              </div>
            )}
            {pageClinics.length > 0 || currentPage > 1 ? (
              <>
                <Suspense
                  fallback={
                    <div className="lg:grid lg:grid-cols-sidebar-left lg:items-start lg:gap-8">
                      <div className="hidden lg:block" aria-hidden="true" />
                      <div>
                        <h2 className="mb-4 font-display text-xl font-bold md:text-2xl">{listHeading}</h2>
                        <ClinicResultGrid
                          clinics={pageClinics}
                          showSampleCards={currentPage === 1 && featuredListings.length === 0}
                          sampleState={stateData.name}
                          sampleArea={stateData.areas?.[0]?.name}
                        />
                        <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/${state}`} />
                      </div>
                    </div>
                  }
                >
                  <LocationBrowser
                    basePath={`/${state}`}
                    scope={{ kind: 'state', stateSlug: state }}
                    limit={limit}
                    currentPage={currentPage}
                    totalClinics={totalClinics}
                    totalPages={totalPages}
                    clinics={pageClinics}
                    facets={facets}
                    showSampleCards={currentPage === 1 && featuredListings.length === 0}
                    sampleState={stateData.name}
                    sampleArea={stateData.areas?.[0]?.name}
                    emptyHref={`/${state}`}
                    listHeading={listHeading}
                  />
                </Suspense>
                {currentPage === 1 ? (
                  <LocationSeo
                    placeName={stateData.name}
                    placeLabel={stateData.name}
                    clinicCount={totalClinics}
                    weekendCount={facets.weekend}
                    links={relatedLinks}
                  />
                ) : null}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-y-4 py-8">
                <div className="relative size-64 md:size-96">
                  <MediaImage
                    src={imageKitUrl('aesthetic-clinics-my/lost-boy.png')}
                    alt="No aesthetic clinics found"
                    width={MEDIA.empty.width}
                    height={MEDIA.empty.height}
                    className="h-full w-full object-cover"
                    sizes={MEDIA.empty.sizes}
                  />
                </div>
                <h2 className="text-balance font-display text-2xl font-bold md:text-4xl">Oops!</h2>
                <p className="text-balance text-lg">No aesthetic clinics found in {stateData.name}.</p>
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
          </div>
        </Container>
      </section>
    </>
  );
}
