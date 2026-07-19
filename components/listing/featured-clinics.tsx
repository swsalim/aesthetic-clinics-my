import Link from 'next/link';

import { ClinicImage } from '@/types/clinic';
import { ArrowRightIcon, AwardIcon, MapPinIcon } from 'lucide-react';

import { isFeatured, isFeaturedPartner } from '@/config/featured';

import { cn } from '@/lib/utils';

import { getFeaturedListings } from '@/helpers/clinics';

import { ClinicCard } from '@/components/cards/clinic-card';
import {
  FeaturedClinicSpotlight,
  type FeaturedClinicSpotlightData,
} from '@/components/listing/featured-clinic-spotlight';
import {
  type FeaturedPartnerCard,
  FeaturedPartnerRotator,
} from '@/components/listing/featured-partner-rotator';
import Container from '@/components/ui/container';
import { StarRating } from '@/components/ui/star-rating';
import { Wrapper } from '@/components/ui/wrapper';

/* Hallmark · macrostructure: Split Studio (section) · genre: editorial · tone: luxury-utilitarian
 * section: spotlight diptych + supporting pair · enrichment: Tier-A gradient wash
 * audience: patients + paying clinic partners · use: spotlight featured listings
 */

const PLACEHOLDER_CLINICS: FeaturedClinicSpotlightData[] = [
  {
    name: 'Lumière Aesthetics',
    area: 'Bukit Bintang',
    state: 'Kuala Lumpur',
    rating: 4.9,
    reviewCount: 128,
    excerpt:
      'Boutique LCP-certified clinic specialising in skin rejuvenation, injectables, and personalised treatment plans.',
    specialties: ['Botox', 'Fillers', 'Laser'],
    accent: 'from-blue-600/90 via-blue-500/70 to-cyan-400/50',
  },
  {
    name: 'Velvet Skin Clinic',
    area: 'Georgetown',
    state: 'Penang',
    rating: 4.8,
    reviewCount: 94,
    excerpt: 'Medical-grade facials and body contouring in a calm, private setting.',
    specialties: ['Facials', 'Body'],
    accent: 'from-violet-600/85 via-violet-500/65 to-blue-400/45',
  },
  {
    name: 'Harmony Medical Aesthetics',
    area: 'Mount Austin',
    state: 'Johor',
    rating: 4.7,
    reviewCount: 76,
    excerpt: 'Trusted for subtle, natural-looking results with board-certified aesthetic doctors.',
    specialties: ['Injectables', 'Skin'],
    accent: 'from-amber-600/80 via-orange-500/60 to-rose-400/45',
  },
];

function SecondaryCard({ clinic }: { clinic: FeaturedClinicSpotlightData }) {
  const initial = clinic.name.charAt(0).toUpperCase();

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-300 hover:border-blue-200 hover:shadow-md motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-900/60 dark:hover:border-blue-800">
      <div
        className={cn(
          'relative flex min-h-[160px] items-end overflow-hidden bg-gradient-to-br sm:min-h-[180px]',
          clinic.accent,
        )}
        role="img"
        aria-label={`Placeholder image for ${clinic.name}`}>
        <div className="relative w-full p-5">
          <span
            className="inline-flex size-12 items-center justify-center rounded-xl border border-white/25 bg-white/15 font-display text-xl font-black text-white backdrop-blur-sm"
            aria-hidden="true">
            {initial}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="dark:bg-blue-950/50 inline-flex items-center gap-1 rounded-md border border-blue-300/50 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:border-blue-800 dark:text-blue-300">
            <AwardIcon className="size-3" aria-hidden="true" />
            Featured
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Sample
          </span>
        </div>

        <h3 className="min-w-0 font-display text-lg font-bold leading-snug text-gray-900 [overflow-wrap:anywhere] dark:text-gray-50">
          {clinic.name}
        </h3>

        <StarRating rating={clinic.rating} className="text-sm" />

        <p className="flex min-w-0 items-start gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-blue-300" aria-hidden="true" />
          <span className="min-w-0">
            {clinic.area}, {clinic.state}
          </span>
        </p>

        <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {clinic.excerpt}
        </p>
      </div>
    </article>
  );
}

function PlaceholderShowcase() {
  const [spotlight, ...secondary] = PLACEHOLDER_CLINICS;

  if (!spotlight) {
    return null;
  }

  return (
    <div className="grid min-w-0 gap-6 lg:gap-8">
      <FeaturedClinicSpotlight clinic={spotlight} />

      <ul className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        {secondary.map((clinic) => (
          <li key={clinic.name} className="min-w-0">
            <SecondaryCard clinic={clinic} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function FeaturedClinics() {
  const featuredListings = await getFeaturedListings();
  const hasFeaturedListings = featuredListings.length > 0;

  const partnerCards: FeaturedPartnerCard[] = featuredListings
    .filter((clinic) => isFeaturedPartner(clinic.slug))
    .map((clinic) => ({
      slug: clinic.slug ?? '',
      name: clinic.name ?? '',
      address: clinic.address ?? '',
      postalCode: clinic.postal_code ?? '',
      state: clinic.state?.name ?? '',
      area: clinic.area?.name ?? '',
      image: clinic.images?.[0]
        ? (clinic.images[0] as unknown as ClinicImage).image_url
        : undefined,
      rating: clinic.rating,
      hours: clinic.hours ?? [],
      specialHours: clinic.special_hours ?? [],
      isPermanentlyClosed: clinic.is_permanently_closed ?? false,
    }));

  const otherFeatured = featuredListings.filter((clinic) => !isFeaturedPartner(clinic.slug));

  return (
    <Wrapper
      className="relative overflow-x-clip border-y border-blue-100/80 bg-gradient-to-b from-blue-50/90 via-white to-white dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"
      size="default">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent dark:via-blue-700/40"
        aria-hidden="true"
      />

      <Container className="relative min-w-0">
        <div className="mb-8 flex min-w-0 flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <p className="mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              Hand-picked for you
            </p>
            <h2 className="min-w-0 text-balance font-display text-2xl font-black tracking-tight text-gray-900 [overflow-wrap:anywhere] md:text-3xl dark:text-gray-50">
              Featured aesthetic clinics
            </h2>
          </div>

          <Link
            href="/advertise-with-us"
            prefetch={false}
            className="dark:hover:bg-blue-950/40 inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 no-underline shadow-sm transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 motion-reduce:transition-none dark:border-blue-800 dark:bg-gray-900 dark:text-blue-300 dark:focus-visible:outline-blue-400">
            List your clinic here
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {hasFeaturedListings ? (
          <div className="grid min-w-0 gap-6 lg:gap-8">
            {partnerCards.length > 0 && <FeaturedPartnerRotator partners={partnerCards} />}

            {otherFeatured.length > 0 && (
              <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
                {otherFeatured.map((clinic) => (
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
                    isFeatured={isFeatured(clinic.slug)}
                    isFeaturedPartner={isFeaturedPartner(clinic.slug)}
                    hours={clinic.hours ?? []}
                    specialHours={clinic.special_hours ?? []}
                    openOnPublicHolidays={clinic.open_on_public_holidays ?? false}
                    isPermanentlyClosed={clinic.is_permanently_closed ?? false}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <PlaceholderShowcase />
        )}
      </Container>
    </Wrapper>
  );
}
