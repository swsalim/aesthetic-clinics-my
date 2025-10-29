import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ClinicDetails, ClinicHours, ClinicImage } from '@/types/clinic';
import { YouTubeEmbed } from '@next/third-parties/google';
import {
  AwardIcon,
  CarIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  YoutubeIcon,
} from 'lucide-react';

import { siteConfig } from '@/config/site';

import { absoluteUrl, cn } from '@/lib/utils';

import { getClinicBySlug, getClinicListings, getClinicMetadataBySlug } from '@/helpers/clinics';
import { getServiceIcon } from '@/helpers/services';

import { LazyAdsLeaderboard } from '@/components/ads/lazy-ads-leaderboard';
import { ClinicStatus } from '@/components/clinic-status';
import AddReviewForm from '@/components/forms/add-review-form';
import { ImageGallery } from '@/components/image/image-gallery';
import { ImageKit } from '@/components/image/image-kit';
import { BookAppointmentButton } from '@/components/listing/book-appointment-button';
import DoctorPractice from '@/components/listing/doctor-practice';
import DoctorPracticeAvatar from '@/components/listing/doctor-practice-avatar';
import NearbyClinics from '@/components/listing/nearby-clinics';
import Reviews from '@/components/listing/reviews';
import MapWrapper from '@/components/mapbox-map/map-wrapper';
import { StickyBookButton } from '@/components/sticky-book-button';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import BusinessJsonLd from '@/components/structured-data/business-json-ld';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import { Badge } from '@/components/ui/badge';
import Breadcrumb from '@/components/ui/breadcrumb';
import { Button, buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import Prose from '@/components/ui/prose';
import { StarRating } from '@/components/ui/star-rating';
import { TruncatedHtml } from '@/components/ui/truncated-html';
import { Wrapper } from '@/components/ui/wrapper';

type ClinicPageProps = {
  params: Promise<{
    clinicSlug: string;
  }>;
};

function Map({
  latitude = 0,
  longitude = 0,
  name = '',
}: {
  latitude: number;
  longitude: number;
  name: string;
}) {
  return (
    <>
      <h2 className="mt-0">Map</h2>

      <div className="mb-6 mt-2">
        <MapWrapper
          locations={[
            {
              lat: latitude,
              long: longitude,
              name,
            },
          ]}
        />
      </div>
    </>
  );
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
};

const formatShift = (open: string, close: string) => {
  const openHour = parseInt(open.split(':')[0], 10);
  const closeHour = parseInt(close.split(':')[0], 10);
  const openPeriod = openHour >= 12 ? 'PM' : 'AM';
  const closePeriod = closeHour >= 12 ? 'PM' : 'AM';

  const formattedOpen = formatTime(open);
  const formattedClose = formatTime(close);

  // If both times are in the same period, only show AM/PM once
  if (openPeriod === closePeriod) {
    return `${formattedOpen.replace(` ${openPeriod}`, '')} - ${formattedClose}`;
  }

  return `${formattedOpen} - ${formattedClose}`;
};

// Helper function to check if clinic has social accounts
const checkSocialAccounts = (clinic: ClinicDetails) => {
  return !!(clinic.facebook_url || clinic.instagram_url || clinic.youtube_url);
};

// Helper function to format opening hours for JSON-LD
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

// Helper function to build full address
const buildFullAddress = (clinic: ClinicDetails) => {
  return [
    clinic.address,
    clinic.neighborhood,
    `${clinic.postal_code} ${clinic.area?.name}`,
    clinic.state?.name,
  ]
    .filter(Boolean)
    .join(', ');
};

const renderOpeningHours = (parsedClinic: ClinicDetails) => {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <ul className="my-0 divide-y divide-gray-200 pl-0 dark:divide-gray-700">
      {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
        const dayShifts = parsedClinic.hours?.filter(
          (h: Partial<ClinicHours>) => h.day_of_week === dayIndex,
        );

        return (
          <li key={dayIndex} className="flex items-center justify-between gap-4 p-4">
            <span className="font-medium text-gray-700 dark:text-gray-50">
              {dayNames[dayIndex]}
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              {dayShifts && dayShifts.length > 0
                ? dayShifts
                    .map((shift: Partial<ClinicHours>) =>
                      shift.open_time && shift.close_time
                        ? formatShift(shift.open_time, shift.close_time)
                        : 'Closed',
                    )
                    .join(', ')
                : 'Closed'}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export async function generateMetadata({ params }: ClinicPageProps): Promise<Metadata> {
  const { clinicSlug } = await params;

  // Use getClinicMetadataBySlug for build-time metadata generation
  const clinic = await getClinicMetadataBySlug(clinicSlug);

  if (!clinic) {
    notFound();
  }

  const title = `${clinic.name} - Aesthetic Clinic in ${clinic.area?.name}, ${clinic.state?.name}`;
  const description = `Learn about ${clinic.name}, a trusted aesthetic clinic located in ${clinic.area?.name}, ${clinic.state?.name}. See services, prices, opening hours, and patient reviews before booking an appointment.`;

  // Build the OG image URL with optional background image
  const ogImageUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og`);
  ogImageUrl.searchParams.set('title', title);

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/place/${clinicSlug}`),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/place/${clinicSlug}`),
      images: [
        {
          url: ogImageUrl,
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
          url: ogImageUrl,
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

export default async function ClinicPage({ params }: ClinicPageProps) {
  const { clinicSlug } = await params;

  // Use static generation function for build-time data fetching
  const parsedClinic = await getClinicBySlug(clinicSlug);

  if (!parsedClinic) {
    notFound();
  }

  const memberOf: { '@type': string; '@id': string } | null = null;

  // Format opening hours for JSON-LD using OpeningHoursSpecification
  const openingHoursSpecification = formatOpeningHoursForJsonLd(parsedClinic.hours);

  const hasSocialAccounts = checkSocialAccounts(parsedClinic);

  const fullAddress = buildFullAddress(parsedClinic);

  const breadcrumbItems = [
    { name: parsedClinic.state?.name, url: `/${parsedClinic.state?.slug}` },
    {
      name: parsedClinic.area?.name,
      url: `/${parsedClinic.state?.slug}/${parsedClinic.area?.slug}`,
    },
    { name: parsedClinic.name },
  ];

  const JSONLDbreadcrumbs = [
    {
      item: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      name: 'Home',
      position: '1',
    },
    {
      item: absoluteUrl(`/${parsedClinic.state?.slug}`),
      name: parsedClinic.state?.name,
      position: '2',
    },
    {
      item: absoluteUrl(`/${parsedClinic.state?.slug}/${parsedClinic.area?.slug}`),
      name: parsedClinic.area?.name,
      position: '3',
    },
    {
      item: absoluteUrl(`/place/${parsedClinic.slug}`),
      name: parsedClinic.name,
      position: '4',
    },
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
      {parsedClinic.images && parsedClinic.images.length > 0 && parsedClinic.images[0] && (
        <Wrapper
          style={{
            backgroundImage: `url('${(parsedClinic.images[0] as unknown as ClinicImage).image_url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
          }}
          className="h-56 md:h-96"></Wrapper>
      )}
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <Wrapper className="pb-0 md:pb-0">
        <Container>
          <div className="lg:flex lg:items-start lg:justify-between lg:gap-x-6">
            {/* left column */}
            <div className="flex min-w-0 flex-1 flex-col gap-y-4">
              <div>
                <Breadcrumb items={breadcrumbItems} />
              </div>
              <div className="flex flex-col flex-wrap items-start justify-between gap-x-2 gap-y-2 lg:flex-row lg:items-center lg:justify-normal">
                <h1 className="mb-0 text-xl font-black leading-7 text-gray-800 sm:truncate sm:text-3xl sm:leading-9 dark:text-gray-50">
                  {parsedClinic.name}
                </h1>
                <StarRating rating={parsedClinic.rating ?? 0} />
                {/* Open/Closed Status Badge */}
                <div className="mt-2 lg:mt-0">
                  <div className="flex items-center gap-x-2">
                    {parsedClinic.is_featured && (
                      <Badge variant="brand">
                        <AwardIcon className="me-1 h-4 w-4" aria-hidden="true" />
                        Featured
                      </Badge>
                    )}
                    {parsedClinic.hours &&
                      parsedClinic.hours.length === 7 &&
                      parsedClinic.hours.every((hour) => hour.open_time && hour.close_time) && (
                        <Badge variant="blue">Open everyday</Badge>
                      )}
                    <ClinicStatus
                      hours={parsedClinic.hours ?? []}
                      specialHours={parsedClinic.special_hours ?? []}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-x-4 gap-y-2">
                <div className="flex items-center gap-x-2">
                  <MapPinIcon className="h-5 w-5 text-blue-300" />
                  <span className="text-sm text-gray-500 dark:text-gray-300">{fullAddress}</span>
                </div>
                {parsedClinic.email && (
                  <div className="flex items-center gap-x-2">
                    <MailIcon className="h-5 w-5 text-blue-300" />
                    <Link href={`mailto:${parsedClinic.email}`} prefetch={false}>
                      <span className="text-sm">{parsedClinic.email}</span>
                    </Link>
                  </div>
                )}
                {parsedClinic.website && (
                  <div className="flex items-center gap-x-2">
                    <GlobeIcon className="h-5 w-5 text-blue-300" />
                    <Link
                      href={`${parsedClinic.website}?utm_source=aestheticclinics.my`}
                      rel="nofollow"
                      prefetch={false}>
                      <span className="text-sm">{parsedClinic.website}</span>
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-col gap-x-2 gap-y-3 sm:flex-row sm:flex-wrap"></div>
                {hasSocialAccounts && (
                  <div className="flex gap-x-2">
                    {parsedClinic.facebook_url && (
                      <Button
                        variant="outline"
                        asChild
                        className="flex-grow-0 justify-center p-3 text-[#1877f2] hover:text-[#1877f2] dark:text-[#1877f2] dark:hover:text-[#1877f2]">
                        <a
                          href={parsedClinic.facebook_url}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          aria-label="Visit business Facebook page">
                          <FacebookIcon className="h-5 w-5" />
                          <span className="sr-only">Visit Facebook</span>
                        </a>
                      </Button>
                    )}
                    {parsedClinic.instagram_url && (
                      <Button
                        variant="outline"
                        asChild
                        className="flex-grow-0 justify-center p-3 text-[#e1306c] hover:text-[#e1306c] dark:text-[#e1306c] dark:hover:text-[#e1306c]">
                        <a
                          href={parsedClinic.instagram_url}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          aria-label="Visit business Instagram page">
                          <InstagramIcon className="h-5 w-5" />
                          <span className="sr-only">Visit Instagram</span>
                        </a>
                      </Button>
                    )}
                    {parsedClinic.youtube_url && (
                      <Button
                        variant="outline"
                        asChild
                        className="flex-grow-0 justify-center p-3 text-[#ff0000] hover:text-[#ff0000] dark:text-[#ff0000] dark:hover:text-[#ff0000]">
                        <a
                          href={parsedClinic.youtube_url}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          aria-label="Visit business YouTube channel">
                          <YoutubeIcon className="h-5 w-5" />
                          <span className="sr-only">Visit YouTube</span>
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* right column */}
            <div className="mt-5 flex flex-col-reverse justify-between gap-x-4 gap-y-4 sm:flex-col lg:mt-0">
              {!parsedClinic.is_permanently_closed && parsedClinic.phone && (
                <>
                  <BookAppointmentButton
                    phone={parsedClinic.phone}
                    stateSlug={parsedClinic.state?.slug ?? ''}
                    areaSlug={parsedClinic.area?.slug ?? ''}
                    clinicSlug={clinicSlug}
                  />
                  {/* add a button with a map icon that opens the map in a new tab and show directions to the clinic */}
                  <Button
                    variant="outline"
                    asChild
                    className="flex-grow-0 justify-center p-3 text-blue-500 hover:text-blue-400 dark:text-blue-300 dark:hover:text-blue-400">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${parsedClinic.name}`}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      aria-label="Visit business on Google Maps"
                      className={cn(
                        buttonVariants({ variant: 'secondary' }),
                        'flex items-center gap-x-2',
                      )}>
                      <CarIcon className="h-5 w-5" /> Get Directions
                    </a>
                  </Button>
                  <StickyBookButton
                    phone={parsedClinic.phone}
                    stateSlug={parsedClinic.state?.slug ?? ''}
                    areaSlug={parsedClinic.area?.slug ?? ''}
                    clinicSlug={clinicSlug}
                  />
                </>
              )}
            </div>
          </div>

          <LazyAdsLeaderboard />

          {/* content */}
          <div className="py-8 md:gap-8 lg:grid lg:grid-cols-sidebar lg:gap-10">
            <Prose className="space-y-8">
              {parsedClinic.description && (
                <article>
                  <h2 className="my-0">About {parsedClinic.name}</h2>
                  <TruncatedHtml html={parsedClinic.description} limit={80} />
                </article>
              )}

              {parsedClinic.featured_video && (
                <div>
                  <YouTubeEmbed
                    videoid={parsedClinic.featured_video.split('v=')[1]}
                    height={400}
                    params="controls=0"
                  />
                </div>
              )}

              <DoctorPracticeAvatar clinicSlug={clinicSlug} />

              <div className="flex flex-col gap-2 text-center">
                <a
                  href="https://dub.sh/watsons-nivea"
                  className="hover:!border-b-transparent"
                  target="_blank">
                  <ImageKit
                    src="nivea-promo.avif"
                    directory="images"
                    alt="Watsons Club - Shop to Sail Pianoland Cruise"
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

              <div>
                <div ta-ad-container=""></div>
              </div>

              {parsedClinic.services && (
                <article className="block lg:hidden">
                  <h2>{parsedClinic.name} Services</h2>
                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-6">
                    {parsedClinic.services.map((service, index) => (
                      <div
                        key={service.slug ?? service.name ?? String(index)}
                        tabIndex={0}
                        aria-label={service.name}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-white p-3 text-gray-900 shadow-md outline-none transition hover:shadow-lg focus:ring-2 focus:ring-red-400 dark:bg-gray-950 dark:text-gray-50"
                        role="button">
                        {getServiceIcon(service.slug ?? '')}
                        <div className="mt-4 text-center text-xs">{service.name}</div>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {parsedClinic.hours && parsedClinic.hours.length > 0 && (
                <article>
                  <h2>{parsedClinic.name}&apos;s Opening Hours</h2>
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-950/40">
                    {renderOpeningHours(parsedClinic)}
                  </div>
                </article>
              )}

              {parsedClinic.images && parsedClinic.images.length > 1 && (
                <article>
                  <h2>Gallery of {parsedClinic.name}</h2>
                  <ImageGallery images={parsedClinic.images} title={parsedClinic.name || ''} />
                </article>
              )}

              <article className="block lg:hidden">
                <Map
                  latitude={parsedClinic.latitude ?? 0}
                  longitude={parsedClinic.longitude ?? 0}
                  name={parsedClinic.name ?? ''}
                />
              </article>
              {parsedClinic.id && (
                <>
                  <AddReviewForm clinicId={parsedClinic.id} />
                  <Reviews reviews={parsedClinic.reviews} clinicSlug={clinicSlug} />
                </>
              )}
            </Prose>
            <aside>
              <Prose>
                <article className="hidden lg:block">
                  <Map
                    latitude={parsedClinic.latitude ?? 0}
                    longitude={parsedClinic.longitude ?? 0}
                    name={parsedClinic.name ?? ''}
                  />
                </article>

                <DoctorPractice clinicSlug={clinicSlug} />

                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <a
                    href="https://dub.sh/loreal-skincare"
                    className="hover:!border-b-transparent"
                    target="_blank">
                    <ImageKit
                      src="loreal-skin-care.avif"
                      directory="images"
                      alt="Darlie toothpaste"
                      width={600}
                      height={600}
                      priority
                      quality={85}
                      sizes="100vw"
                      className="mb-0 h-auto w-full object-cover"
                      style={{
                        objectPosition: 'center center',
                      }}
                    />
                  </a>
                  <a
                    href="https://dub.sh/watsons-promo"
                    target="_blank"
                    className="text-sm !font-medium text-blue-500 hover:border-0 hover:text-blue-400 hover:no-underline dark:text-blue-300 dark:hover:text-blue-400">
                    Browse Watsons Promotions
                  </a>
                </div>

                {parsedClinic.services && (
                  <div className="hidden lg:block">
                    <h2 className="">{parsedClinic.name} Services</h2>
                    <div className="grid grid-cols-3 gap-4">
                      {parsedClinic.services.map((service, index) => (
                        <Link
                          key={service.slug ?? service.name ?? String(index)}
                          href={`/services/${service.slug}`}
                          aria-label={service.name}
                          className="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-white p-3 text-gray-900 shadow-md outline-none transition hover:shadow-lg focus:ring-2 focus:ring-red-400 dark:bg-gray-950/40 dark:text-gray-50"
                          role="button">
                          {getServiceIcon(service.slug ?? '')}
                          <div className="mt-4 text-center text-xs">{service.name}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </Prose>
            </aside>
          </div>
        </Container>
      </Wrapper>
      <NearbyClinics
        latitude={parsedClinic.latitude ?? 0}
        longitude={parsedClinic.longitude ?? 0}
        radiusInKm={10}
        limit={5}
      />
    </>
  );
}
