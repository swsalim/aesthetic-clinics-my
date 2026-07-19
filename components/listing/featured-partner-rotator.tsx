'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { ClinicHours, ClinicSpecialHours } from '@/types/clinic';
import { ArrowRightIcon, MapPinIcon, SparklesIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { ClinicStatus } from '@/components/clinic-status';
import { ImageKit } from '@/components/image/image-kit';
import { buttonVariants } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';

export type FeaturedPartnerCard = {
  slug: string;
  name: string;
  address: string;
  postalCode: string;
  state: string;
  area: string;
  image?: string;
  rating?: number | null;
  hours: Partial<ClinicHours>[];
  specialHours: Partial<ClinicSpecialHours>[];
  isPermanentlyClosed: boolean;
};

const STORAGE_KEY = 'featured-partner-index';

/**
 * Picks which featured partner to spotlight on the client at mount time so the
 * placement rotates on every page load while the page itself stays statically
 * cached. SSR (and the first client render) always shows index 0 to avoid a
 * hydration mismatch; the random swap happens in an effect. The last shown index
 * is remembered in sessionStorage so partners don't repeat back-to-back.
 */
function useRotatingIndex(length: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length <= 1) return;

    let last = -1;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored !== null) last = Number(stored);
    } catch {
      // sessionStorage may be unavailable (private mode, SSR) — ignore.
    }

    let next = Math.floor(Math.random() * length);
    if (next === last) {
      next = (next + 1) % length;
    }

    setIndex(next);

    try {
      sessionStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore
    }
  }, [length]);

  return index;
}

function PartnerImage({ partner }: { partner: FeaturedPartnerCard }) {
  if (partner.image) {
    return (
      <ImageKit
        src={partner.image}
        alt={partner.name}
        width={800}
        height={600}
        sizes="(max-width: 1024px) 100vw, 55vw"
        quality={85}
        priority
        className="h-56 w-full object-cover sm:h-72 lg:h-full"
      />
    );
  }

  const initial = partner.name.charAt(0).toUpperCase();

  return (
    <div
      className="relative flex h-56 w-full items-end bg-gradient-to-br from-blue-600/90 via-blue-500/70 to-cyan-400/50 sm:h-72 lg:h-full"
      role="img"
      aria-label={`Placeholder image for ${partner.name}`}>
      <span
        className="m-6 inline-flex size-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 font-display text-2xl font-black text-white backdrop-blur-sm"
        aria-hidden="true">
        {initial}
      </span>
    </div>
  );
}

export function FeaturedPartnerRotator({ partners }: { partners: FeaturedPartnerCard[] }) {
  const index = useRotatingIndex(partners.length);
  const partner = partners[index] ?? partners[0];

  if (!partner) return null;

  return (
    <Link
      href={`/place/${partner.slug}`}
      prefetch={false}
      aria-label={`View ${partner.name}`}
      className="group block overflow-hidden rounded-2xl border border-amber-300/70 bg-white no-underline shadow-[0_20px_50px_-24px_rgba(245,158,11,0.45)] ring-1 ring-amber-200/70 transition duration-300 hover:border-amber-400 hover:shadow-[0_28px_60px_-22px_rgba(245,158,11,0.5)] motion-reduce:transition-none dark:border-amber-700/50 dark:bg-gray-900 dark:ring-amber-800/40">
      <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="relative min-h-[220px] overflow-hidden lg:min-h-[320px]">
          <PartnerImage partner={partner} />
        </div>

        <div className="flex min-w-0 flex-col gap-4 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-2 md:flex-row">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                <SparklesIcon className="size-3.5 shrink-0" aria-hidden="true" />
                Featured partner
              </span>
            </div>

            {!partner.isPermanentlyClosed && (
              <div className="flex flex-wrap items-center gap-2">
                <ClinicStatus hours={partner.hours} specialHours={partner.specialHours} />
              </div>
            )}
          </div>

          <h3 className="min-w-0 font-display text-2xl font-black leading-tight tracking-tight text-gray-900 [overflow-wrap:anywhere] sm:text-3xl dark:text-gray-50">
            {partner.name}
          </h3>

          {partner.rating !== null && partner.rating !== undefined && (
            <div className="">
              <StarRating rating={partner.rating} />
            </div>
          )}

          <p className="flex min-w-0 items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-blue-400" aria-hidden="true" />
            <span className="min-w-0">
              {partner.address}, {partner.postalCode}, {partner.area}, {partner.state}
            </span>
          </p>

          <span
            className={cn(
              buttonVariants({ variant: 'primary', size: 'large', rounded: true }),
              'w-full justify-center sm:w-auto',
            )}>
            View clinic profile
            <ArrowRightIcon
              className="ms-2 size-4 transition group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
