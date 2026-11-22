import { Suspense } from 'react';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Clinic } from '@/types/clinic';
import { ArrowRightIcon } from 'lucide-react';

import { MIN_INDEXABLE_STATE_CLINICS, locationSeoOverride } from '@/config/location-seo';
import { siteConfig } from '@/config/site';

import { buildCityHubCopy, buildCityHubFacts, slugifyLabel } from '@/lib/city-hub';
import { imageKitUrl } from '@/lib/imagekit-url';
import { getLocationFacetsSafe } from '@/lib/listing/location-clinic-index';
import { listingClinicFromPage } from '@/lib/listing/location-filters';
import { resolveMediaUrl } from '@/lib/media';
import { MEDIA } from '@/lib/media-sizes';
import { absoluteUrl, cn, getPagination } from '@/lib/utils';

import { getAreaBySlug, getAreaHubSource } from '@/helpers/areas';
import { getChainGroups } from '@/helpers/chains';
import { getFeaturedListings } from '@/helpers/clinics';
import { getStateBySlug } from '@/helpers/states';

import AddBookingForm from '@/components/forms/add-booking-form';
import { MediaImage } from '@/components/image/media-image';
import { CityHub } from '@/components/listing/city-hub';
import { ClinicResultGrid } from '@/components/listing/location/clinic-result-grid';
import { LocationBrowser } from '@/components/listing/location/location-browser';
import { LocationHero, locationHeroStats } from '@/components/listing/location/location-hero';
import { LocationSeo } from '@/components/listing/location/location-seo';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import CollectionPageJsonLd from '@/components/structured-data/collection-page-json-ld';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import Prose from '@/components/ui/prose';

export const revalidate = 86_400;

type AreaScreenProps = {
  params: Promise<{
    state: string;
    area: string;
    page?: string;
  }>;
};

function pageNumber(raw: string | undefined): number {
  const parsed = raw ? Number(raw) : 1;
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export async function generateAreaMetadata({ params }: AreaScreenProps): Promise<Metadata> {
  const { state, area, page: pageParam } = await params;
  const currentPage = pageNumber(pageParam);

  if (process.env.NODE_ENV === 'production') {
    console.log(`[generateMetadata] Processing: state="${state}", area="${area}"`);
  }

  const limit = 20;
  const { from, to } = getPagination(currentPage, limit);
  const areaData = await getAreaBySlug(area, from, to, state);

  if (!areaData) {
    notFound();
  }

  const validState = areaData?.state?.slug === state;

  if (!validState || !areaData) {
    notFound();
  }

  const clinicCount = areaData.total_clinics || 0;
  const hubSource = await getAreaHubSource(area, state);
  const facts = buildCityHubFacts(hubSource?.clinics ?? [], hubSource?.serviceRows ?? []);
  const hub = buildCityHubCopy({
    city: areaData.name,
    state: areaData.state.name ?? '',
    facts: facts.clinicCount > 0 ? facts : { ...facts, clinicCount },
    nearbyNames: [],
  });
  const seo = locationSeoOverride({
    stateSlug: state,
    areaSlug: area,
    clinicCount,
    clinicNames: facts.clinics.slice(0, 3).map((clinic) => clinic.name),
  });
  const title = seo?.title ?? hub.title;
  const description = seo?.description ?? hub.description;
  const url = absoluteUrl(`/${state}/${area}`);

  // Build the OG image URL with optional background image
  const ogImageUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og-list`);
  ogImageUrl.searchParams.set('title', title);
  if (areaData.image || areaData.state?.image) {
    ogImageUrl.searchParams.set('image', areaData.image || areaData.state?.image || '');
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
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${title}`),
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: title,
        },
      ],
    },
  };
}

export default async function AreaScreen({ params }: AreaScreenProps) {
  const { state, area, page: pageParam } = await params;
  const isJohorBahru = state === 'johor' && area === 'johor-bahru';
  const currentPage = pageNumber(pageParam);

  if (process.env.NODE_ENV === 'production') {
    console.log(`[AreaPage] Processing: state="${state}", area="${area}"`);
  }

  const limit = isJohorBahru ? 21 : 20;
  const { from, to } = getPagination(currentPage, limit);

  // Fetch area metadata and clinics data in parallel
  const [areaData, stateData, facets] = await Promise.all([
    getAreaBySlug(area, from, to, state),
    getStateBySlug(state, from, to),
    getLocationFacetsSafe({ kind: 'area', stateSlug: state, areaSlug: area }),
  ]);

  if (!areaData || areaData.state?.slug !== state) {
    notFound();
  }

  const totalClinics = areaData.total_clinics || 0;
  const totalPages = Math.ceil(totalClinics / limit);
  if (currentPage > 1 && currentPage > totalPages) {
    notFound();
  }

  // Featured listings pinned to the top of this area's listing.
  const featuredListings = (await getFeaturedListings()).filter(
    (clinic) => clinic.area?.slug === area,
  );
  const featuredSlugs = new Set(featuredListings.map((clinic) => clinic.slug));
  const listingClinics = (areaData.clinics ?? []).filter(
    (clinic) => !featuredSlugs.has(clinic.slug),
  );

  const hubSource = await getAreaHubSource(area, state);
  const facts = buildCityHubFacts(hubSource?.clinics ?? [], hubSource?.serviceRows ?? []);
  const displayFacts = facts.clinicCount > 0 ? facts : { ...facts, clinicCount: totalClinics };
  const nearbyAreas = (stateData?.areas ?? []).filter((item) => item.slug && item.slug !== area);
  const hub = buildCityHubCopy({
    city: areaData.name,
    state: areaData.state?.name ?? '',
    facts: displayFacts,
    nearbyNames: nearbyAreas.map((item) => item.name).filter((name): name is string => Boolean(name)),
  });
  const seo = locationSeoOverride({
    stateSlug: state,
    areaSlug: area,
    clinicCount: totalClinics,
    clinicNames: displayFacts.clinics.slice(0, 3).map((clinic) => clinic.name),
  });
  const title = seo?.h1 ?? hub.h1;
  const description = seo?.description ?? hub.description;
  const chains = (await getChainGroups())
    .map((group) => ({
      name: group.name,
      href: `/chains/${group.slug}`,
      count: group.branches.filter((branch) => branch.stateSlug === state && branch.areaSlug === area).length,
    }))
    .filter((group) => group.count > 0);

  const breadcrumbItems = [
    {
      name: areaData.state?.name,
      url: absoluteUrl(`/${areaData.state?.slug}`),
    },
    {
      name: areaData.name,
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
      name: areaData.state?.name,
      position: '2',
    },
    {
      item: absoluteUrl(`/${state}/${area}`),
      name: areaData.name,
      position: '3',
    },
  ];

  const areaBackgroundSrc =
    resolveMediaUrl({
      image: areaData.image,
      r2_url: areaData.r2_url,
    }) ||
    resolveMediaUrl({
      image: areaData.state?.image,
      r2_url: areaData.state?.r2_url,
    });
  const relatedLinks = [
    {
      href: `/${state}`,
      label: `Aesthetic clinics in ${areaData.state?.name ?? 'this state'}`,
    },
    ...nearbyAreas
      .filter((item) => item.slug && item.name)
      .slice(0, 12)
      .map((item) => ({
        href: `/${state}/${item.slug}`,
        label: item.name ?? '',
      })),
    ...facets.services.slice(0, 6).map((service) => ({
      href: `/services/${service.slug}`,
      label: service.name,
    })),
  ];
  const sortedListings = [...listingClinics].sort(
    (left, right) => Number(right.is_featured) - Number(left.is_featured),
  );
  const seenNeighbourhoods = new Set<string>();
  const pageClinics = [...(currentPage === 1 ? featuredListings : []), ...sortedListings].map(
    (clinic) => {
      const mapped = listingClinicFromPage(clinic, {
        state: areaData.state?.name ?? '',
        area: areaData.name,
      });
      const neighbourhood = slugifyLabel(mapped.neighborhood || mapped.city || '');
      if (!neighbourhood || seenNeighbourhoods.has(neighbourhood)) return mapped;
      seenNeighbourhoods.add(neighbourhood);
      return { ...mapped, anchorId: `neighbourhood-${neighbourhood}` };
    },
  );
  const listHeading = seo?.listingHeading ?? hub.listingHeading;
  const heroStats = locationHeroStats(totalClinics, facets);
  const placeLabel = `${areaData.name}, ${areaData.state?.name ?? ''}`.replace(/, $/, '');

  return (
    <>
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <CollectionPageJsonLd
        name={seo?.jsonLdName ?? `Aesthetic Clinics in ${areaData.name}, ${areaData.state?.name}`}
        url={`/${state}/${area}`}
        description={description}
        clinics={(areaData.clinics?.slice(0, 20) as Partial<Clinic>[]) || []}
      />
      <LocationHero
        breadcrumbItems={breadcrumbItems}
        heading={title}
        intro={seo?.intro ?? hub.intro}
        backHref={`/${state}/${area}`}
        placeName={areaData.name}
        currentPage={currentPage}
        backgroundSrc={areaBackgroundSrc}
        searchBasePath={`/${state}/${area}`}
        searchPlaceholder={`Search clinics in ${areaData.name}...`}
        stats={heroStats}
      />
      <section className="bg-white dark:bg-gray-900">
        <Container className="py-8 md:py-10">
          <div className="mx-auto mb-10 max-w-2xl">
            <a
              href="https://invl.me/clnm6di"
              className="hover:!border-b-transparent"
              target="_blank">
              <Image
                src="/images/banner-total-image-1.jpg"
                alt="Total Image Whita Glo"
                width={600}
                height={600}
                priority
                quality={85}
                sizes="100vw"
                className="m-0 h-auto w-full object-cover"
                style={{
                  objectPosition: 'center center',
                }}
              />
            </a>
          </div>

          {isJohorBahru ? (
            <Prose className="mb-8">
              <AddBookingForm currentUrl={absoluteUrl(`/${state}/${area}`)} area={areaData.name} />
            </Prose>
          ) : null}
          {currentPage === 1 && (
            <CityHub
              copy={{ ...hub, faqs: hub.faqs }}
              facts={displayFacts}
              city={areaData.name}
              state={areaData.state?.name ?? ''}
              nearby={nearbyAreas.slice(0, 8).map((item) => ({
                name: item.name ?? '',
                href: `/${state}/${item.slug}`,
              }))}
              chains={chains}
            />
          )}
          {pageClinics.length > 0 || currentPage > 1 ? (
            <>
              <Suspense
                fallback={
                  <div className="lg:grid lg:grid-cols-sidebar-left lg:items-start lg:gap-8">
                    <div className="hidden lg:block" aria-hidden="true" />
                    <div>
                      <h2 id="city-listings" className="mb-4 font-display text-xl font-bold md:text-2xl">
                        {listHeading}
                      </h2>
                      <ClinicResultGrid clinics={pageClinics} />
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        basePath={`/${state}/${area}`}
                      />
                    </div>
                  </div>
                }
              >
                <LocationBrowser
                  basePath={`/${state}/${area}`}
                  scope={{ kind: 'area', stateSlug: state, areaSlug: area }}
                  limit={limit}
                  currentPage={currentPage}
                  totalClinics={totalClinics}
                  totalPages={totalPages}
                  clinics={pageClinics}
                  facets={facets}
                  showSampleCards={false}
                  sampleState={areaData.state?.name ?? ''}
                  sampleArea={areaData.name}
                  emptyHref={`/${state}/${area}`}
                  listHeading={listHeading}
                />
              </Suspense>
              {currentPage === 1 ? (
                <LocationSeo
                  placeName={areaData.name}
                  placeLabel={placeLabel}
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
                  sizes={MEDIA.empty.sizes}
                  className="h-full w-full object-cover"
                />
              </div>
              <h2 className="text-balance font-display text-2xl font-bold md:text-4xl">Oops!</h2>
              <p className="text-balance text-lg">
                We&apos;re not ready in {areaData.name}, {areaData.state?.name}.
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
      </section>
    </>
  );
}
