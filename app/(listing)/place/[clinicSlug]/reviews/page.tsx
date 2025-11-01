import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ClinicHours, ClinicReview } from '@/types/clinic';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRightIcon } from 'lucide-react';

import { siteConfig } from '@/config/site';

import { absoluteUrl } from '@/lib/utils';

import { getClinicBySlug, getClinicListings, getClinicMetadataBySlug } from '@/helpers/clinics';

import BusinessJsonLd from '@/components/structured-data/business-json-ld';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import Container from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/ui/star-rating';

type ReviewsPageProps = {
  params: Promise<{
    clinicSlug: string;
  }>;
};

const formatOpeningHoursForJsonLd = (hours: Partial<ClinicHours>[] | null) => {
  if (!hours) return [];

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return hours.map((hour) => {
    const day = days[hour.day_of_week ?? 0];
    const openTime = hour.open_time?.slice(0, 5) || '';
    const closeTime = hour.close_time?.slice(0, 5) || '';

    return {
      '@type': 'OpeningHoursSpecification' as const,
      dayOfWeek: day,
      opens: openTime,
      closes: closeTime,
    };
  });
};

export async function generateMetadata({ params }: ReviewsPageProps): Promise<Metadata> {
  const { clinicSlug } = await params;

  const clinic = await getClinicMetadataBySlug(clinicSlug);

  if (!clinic) {
    notFound();
  }

  const title = `Reviews for ${clinic.name}`;
  const description = `Read reviews and ratings for ${clinic.name}, a aesthetic clinic located in ${clinic.area.name}, ${clinic.state.name}.`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/place/${clinicSlug}/reviews`),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/place/${clinicSlug}/reviews`),
      images: [
        {
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${clinic?.name}`),
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: clinic?.name,
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
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${clinic?.name}`),
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: clinic?.name,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const clinics = await getClinicListings();

  return clinics.map((clinic) => ({
    clinicSlug: clinic.slug,
  }));
}

// Force static generation - this ensures the page is generated at build time
export const revalidate = 3600; // Revalidate every hour (3600 seconds)

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { clinicSlug } = await params;

  const parsedClinic = await getClinicBySlug(clinicSlug);

  if (!parsedClinic) {
    notFound();
  }

  const memberOf: { '@type': string; '@id': string } | null = null;

  // Format opening hours for JSON-LD using OpeningHoursSpecification
  const openingHoursSpecification = formatOpeningHoursForJsonLd(parsedClinic.hours);

  const breadcrumbItems = [
    { name: parsedClinic.state?.name, url: `/${parsedClinic.state?.slug}` },
    {
      name: parsedClinic.area?.name,
      url: `/${parsedClinic.state?.slug}/${parsedClinic.area?.slug}`,
    },
    { name: parsedClinic.name, url: `/place/${parsedClinic.slug}` },
    { name: 'Reviews' },
  ];

  return (
    <>
      <WebsiteJsonLd />
      <BusinessJsonLd
        name={parsedClinic.name}
        url={absoluteUrl(`/place/${parsedClinic.slug}`)}
        image={absoluteUrl(`/api/og?title=${parsedClinic.name}`)}
        phone={parsedClinic.phone}
        email={parsedClinic.email}
        location={{
          address: parsedClinic.address ?? '',
          postal_code: parsedClinic.postal_code ?? '',
          area: parsedClinic.area?.name ?? '',
          state: parsedClinic.state?.name ?? '',
        }}
        coordinate={{ lat: parsedClinic.latitude ?? 0, long: parsedClinic.longitude ?? 0 }}
        rating={{ value: parsedClinic.rating || 0, count: parsedClinic.review_count || 0 }}
        memberOf={memberOf}
        openingHoursSpecification={openingHoursSpecification}
        reviews={parsedClinic.reviews?.slice(0, 5) ?? []}
      />
      <Container>
        <div className="py-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-8">
            <h1 className="text-3xl font-bold">Reviews for {parsedClinic.name}</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {parsedClinic.review_count} reviews • {parsedClinic.rating?.toFixed(1)} average rating
            </p>
            <p className="mt-2 gap-x-2 text-gray-500 dark:text-gray-400">
              <Link
                href={`/place/${parsedClinic.slug}`}
                className="inline-flex items-center gap-x-2"
                prefetch={false}>
                View clinic profile
                <ArrowRightIcon className="size-4" />
              </Link>
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {parsedClinic.reviews?.map((review: Partial<ClinicReview>) => (
              <Card key={`${review.author_name}-${review.review_time}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{review.author_name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {review.review_time &&
                            formatDistanceToNow(new Date(review.review_time), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <StarRating rating={review.rating || 0} />
                  </div>
                  {review.text && (
                    <>
                      <Separator className="my-4" />
                      <p className="text-gray-500 dark:text-gray-400">{review.text}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
