import React from 'react';

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowRightIcon } from 'lucide-react';

import { siteConfig } from '@/config/site';

import { absoluteUrl, getPagination } from '@/lib/utils';
import { cn } from '@/lib/utils';

import { getDoctorsByState } from '@/helpers/doctors';
import { getStateListings, getStateMetadataBySlug } from '@/helpers/states';

import { LazyAdsArticle } from '@/components/ads/lazy-ads-article';
import { DoctorCard } from '@/components/cards/doctor-card';
import PageHeading from '@/components/page-heading';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import { Wrapper } from '@/components/ui/wrapper';

type DentistsByStatePageProps = {
  params: Promise<{
    state: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: DentistsByStatePageProps): Promise<Metadata> {
  const { state } = await params;
  const { page } = await searchParams;

  const stateData = await getStateMetadataBySlug(state);

  if (!stateData) {
    notFound();
  }

  const doctorsResult = await getDoctorsByState(state, 1, 0);
  const totalDoctors = doctorsResult.count || 0;

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const title = `Top ${totalDoctors} LCP-Certified Aesthetic Doctors in ${stateData.name} [${currentMonth} ${currentYear}]`;
  const description = `Discover ${totalDoctors} aesthetic doctors in ${stateData.name}. Browse by city or clinic to find a aesthetic doctor near you. Information includes clinic locations and contact details.`;
  const url = !page
    ? absoluteUrl(`/${state}/doctors`)
    : page === '1'
      ? absoluteUrl(`/${state}/doctors`)
      : absoluteUrl(`/${state}/doctors?page=${page}`);

  // Build the OG image URL
  const ogImageUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og`);
  ogImageUrl.searchParams.set('title', title);

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

export async function generateStaticParams() {
  const states = await getStateListings();

  return states.map((state) => ({
    state: state.slug,
  }));
}

export default async function DentistsByStatePage({
  params,
  searchParams,
}: DentistsByStatePageProps) {
  const { state } = await params;
  const { page } = await searchParams;

  const limit = 20;
  const currentPage = page ? +page : 1;
  const { from } = getPagination(currentPage, limit);

  // Fetch state metadata and doctors data in parallel
  const [stateData, doctorsResult] = await Promise.all([
    getStateMetadataBySlug(state),
    getDoctorsByState(state, limit, from),
  ]);

  if (!stateData) {
    notFound();
  }

  const doctors = doctorsResult.data;
  const totalDoctors = doctorsResult.count || 0;
  const totalPages = Math.ceil(totalDoctors / limit);

  if (currentPage > totalPages && totalPages > 0) {
    notFound();
  }

  const featuredDoctors = doctors.filter((doctor) => doctor.is_featured);

  const breadcrumbItems = [
    {
      name: 'Doctors',
      url: '/doctors',
    },
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
      item: `${process.env.NEXT_PUBLIC_BASE_URL}/doctors`,
      name: 'Aesthetic Doctors',
      position: '2',
    },
    {
      item: absoluteUrl(`/${state}/doctors`),
      name: stateData.name,
      position: '3',
    },
  ];

  // TODO: add JSON-LD list items for dentists
  const JSONLDlistItems = doctors?.map((doctor, index) => ({
    '@type': 'ListItem',
    name: doctor.name,
    url: absoluteUrl(`/doctor/${doctor.slug}`),
    position: `${from + index + 1}`,
  }));

  const addListItemsJsonLd = () => {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Aesthetic Doctors in ${stateData.name}",
        "description": "Discover aesthetic doctors in ${stateData.name}. Browse by city or clinic to find a aesthetic doctor near you.",
        "itemListElement": ${JSON.stringify(JSONLDlistItems)}
      }`,
    };
  };

  const title = `Browse LCP-Certified Aesthetic Doctors in ${stateData.name}`;
  const description = `Discover ${totalDoctors} aesthetic doctors in ${stateData.name}. Browse by city or clinic to find a aesthetic doctor near you. Information includes clinic locations and contact details.`;

  return (
    <>
      <WebsiteJsonLd />
      <WebPageJsonLd
        description={description}
        id={`/${state}/doctors`}
        lastReviewed={new Date().toISOString()}
        reviewedBy={process.env.NEXT_PUBLIC_SCHEMA_REVIEWER}
      />
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <script
        id="dentist-list-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={addListItemsJsonLd()}
      />
      <Wrapper size="sm">
        <Container>
          <div className="flex min-w-0 flex-1 flex-col gap-y-6 md:gap-y-12">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </Container>
      </Wrapper>

      <Wrapper className="pt-0 md:pt-0">
        <PageHeading title={title}>
          <p>
            Discover {totalDoctors} aesthetic doctors in {stateData.name}. Browse by city or clinic
            to find a aesthetic doctor near you.
          </p>
        </PageHeading>

        <Container>
          <div className="space-y-8">
            {/* Featured Aesthetic Doctors */}
            {featuredDoctors.length > 0 && (
              <section>
                <h2 className="mb-6 text-2xl font-semibold">
                  Featured Aesthetic Doctors in {stateData.name}
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {featuredDoctors.slice(0, 6).map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                  ))}
                </div>
              </section>
            )}

            {/* All Aesthetic Doctors */}
            <section>
              <h2 className="mb-6 text-balance text-xl font-bold md:text-2xl">
                All Aesthetic Doctors in {stateData.name} ({totalDoctors})
              </h2>
              {doctors.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {doctors.map((doctor, index) => (
                      <React.Fragment key={doctor.id}>
                        {(index + 1) % 6 == 0 && <LazyAdsArticle />}
                        <DoctorCard doctor={doctor} />
                      </React.Fragment>
                    ))}
                  </div>
                  <Pagination currentPage={currentPage} totalPages={totalPages} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-y-4 py-12">
                  <h3 className="text-balance text-xl font-semibold">
                    No aesthetic doctors found in {stateData.name}
                  </h3>
                  <p className="text-balance text-gray-600">
                    We couldn&apos;t find any aesthetic doctors in {stateData.name} at the moment.
                  </p>
                  <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-3">
                    <Link
                      href="/doctors"
                      className={cn(
                        'inline-flex items-center gap-x-2 text-blue-600 hover:text-blue-800',
                      )}
                      prefetch={false}>
                      Browse all aesthetic doctors
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </div>
        </Container>
      </Wrapper>
    </>
  );
}
