import { ArrowRightIcon, MapPinIcon, SparklesIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { StarRating } from '@/components/ui/star-rating';
import { buttonVariants } from '@/components/ui/button';

export type FeaturedClinicSpotlightData = {
  name: string;
  area: string;
  state: string;
  rating: number;
  reviewCount: number;
  excerpt: string;
  specialties: string[];
  accent: string;
};

export function getVelvetSkinClinicCardPlaceholder(stateName: string, areaName?: string) {
  return {
    slug: 'velvet-skin-clinic-demo',
    name: 'Velvet Skin Clinic',
    address: '88 Beach Street',
    phone: '+60 4-261 8800',
    postalCode: '10300',
    state: stateName,
    area: areaName ?? 'Central',
    rating: 4.8,
    isFeatured: true,
    isPlaceholder: true,
    hours: [],
    specialHours: [],
    openOnPublicHolidays: false,
    isPermanentlyClosed: false,
  };
}

export function getVelvetSkinClinicPlaceholder(
  stateName: string,
  areaName?: string,
): FeaturedClinicSpotlightData {
  return {
    name: 'Velvet Skin Clinic',
    area: areaName ?? 'Central',
    state: stateName,
    rating: 4.8,
    reviewCount: 94,
    excerpt: 'Medical-grade facials and body contouring in a calm, private setting.',
    specialties: ['Facials', 'Body'],
    accent: 'from-violet-600/85 via-violet-500/65 to-blue-400/45',
  };
}

function ClinicImagePlaceholder({
  name,
  accent,
  className,
}: {
  name: string;
  accent: string;
  className?: string;
}) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'relative flex min-h-[220px] items-end overflow-hidden bg-gradient-to-br sm:min-h-[280px] lg:min-h-0 lg:h-full',
        accent,
        className,
      )}
      role="img"
      aria-label={`Placeholder image for ${name}`}>
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-6 size-48 rounded-full bg-black/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative w-full p-5 sm:p-6">
        <span
          className="inline-flex size-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 font-display text-2xl font-black text-white backdrop-blur-sm"
          aria-hidden="true">
          {initial}
        </span>
      </div>
    </div>
  );
}

function FeaturedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm',
        className,
      )}>
      <SparklesIcon className="size-3.5 shrink-0" aria-hidden="true" />
      Featured partner
    </span>
  );
}

export function FeaturedClinicSpotlight({ clinic }: { clinic: FeaturedClinicSpotlightData }) {
  return (
    <article className="group relative min-w-0 overflow-hidden rounded-2xl border border-blue-200/70 bg-white shadow-[0_20px_50px_-24px_rgba(42,102,159,0.35)] ring-1 ring-blue-100/80 transition duration-300 hover:shadow-[0_28px_60px_-22px_rgba(42,102,159,0.42)] motion-reduce:transition-none dark:border-blue-900/50 dark:bg-gray-900 dark:ring-blue-900/40">
      <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <ClinicImagePlaceholder
          name={clinic.name}
          accent={clinic.accent}
          className="lg:min-h-[320px]"
        />

        <div className="flex min-w-0 flex-col justify-between gap-6 p-6 sm:p-8">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <FeaturedBadge />
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Sample listing
              </span>
            </div>

            <h3 className="min-w-0 font-display text-2xl font-black leading-tight tracking-tight text-gray-900 [overflow-wrap:anywhere] sm:text-3xl dark:text-gray-50">
              {clinic.name}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <StarRating rating={clinic.rating} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {clinic.reviewCount} reviews
              </span>
            </div>

            <p className="mt-3 flex min-w-0 items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-blue-400" aria-hidden="true" />
              <span className="min-w-0">
                {clinic.area}, {clinic.state}
              </span>
            </p>

            <p className="mt-4 max-w-prose text-base leading-relaxed text-gray-600 dark:text-gray-300">
              {clinic.excerpt}
            </p>

            <ul className="mt-5 flex min-w-0 flex-wrap gap-2" aria-label="Specialties">
              {clinic.specialties.map((specialty) => (
                <li key={specialty}>
                  <span className="inline-block rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {specialty}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <span
              className={cn(
                buttonVariants({ variant: 'primary', size: 'large', rounded: true }),
                'w-full cursor-default justify-center opacity-90 sm:w-auto',
              )}
              aria-disabled="true">
              View clinic profile
              <ArrowRightIcon className="ms-2 size-4" aria-hidden="true" />
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Placeholder — links go live with a real featured listing.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
