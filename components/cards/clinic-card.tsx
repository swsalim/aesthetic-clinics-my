'use client';

import Link from 'next/link';

import { ClinicHours, ClinicSpecialHours } from '@/types/clinic';
import {
  AwardIcon,
  ClockIcon,
  MapPinIcon,
  MapPinXInsideIcon,
  PhoneIcon,
  SparklesIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { ClinicStatus } from '@/components/clinic-status';
import { ImageKit } from '@/components/image/image-kit';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';

interface ClinicCardProps {
  slug: string;
  name: string;
  address: string;
  phone: string;
  postalCode: string;
  state: string;
  area: string;
  image?: string;
  isFeatured?: boolean;
  isFeaturedPartner?: boolean;
  rating?: number | null;
  hours: Partial<ClinicHours>[];
  specialHours: Partial<ClinicSpecialHours>[];
  openOnPublicHolidays: boolean;
  isPermanentlyClosed: boolean;
  distance?: number;
  isPlaceholder?: boolean;
}

export function ClinicCard({
  slug,
  name,
  address,
  phone,
  postalCode,
  state,
  area,
  image,
  isFeatured,
  isFeaturedPartner,
  rating,
  hours,
  specialHours,
  openOnPublicHolidays,
  isPermanentlyClosed,
  distance,
  isPlaceholder,
}: ClinicCardProps) {
  const card = (
    <Card
      className={cn(
        'h-full overflow-hidden rounded-2xl',
        isFeaturedPartner &&
          'shadow-[0_12px_40px_-16px_rgba(245,158,11,0.45)] ring-2 ring-amber-300/80 dark:ring-amber-600/50',
        isPlaceholder && !isFeaturedPartner && 'ring-2 ring-blue-200 dark:ring-blue-800',
      )}
      role="article">
      <CardHeader className="relative h-48 overflow-hidden p-0">
        {image && (
          <ImageKit
            src={image}
            alt={name}
            width={400}
            height={300}
            sizes="(max-width: 600px) 100vw, 350px"
            quality={85}
            className="h-full w-full object-cover"
            priority={false}
          />
        )}
        <div className="absolute right-2 top-2 flex flex-wrap justify-end gap-2">
          {isPlaceholder && <Badge variant="gray">Sample</Badge>}
          {isFeaturedPartner && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-500 to-amber-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              <SparklesIcon className="size-3 shrink-0" aria-hidden="true" />
              Featured partner
            </span>
          )}
          {isFeatured && !isFeaturedPartner && (
            <span className="dark:bg-blue-950/50 inline-flex items-center gap-1 rounded-md border border-blue-300/50 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:border-blue-800 dark:text-blue-300">
              <AwardIcon className="size-3" aria-hidden="true" />
              Featured
            </span>
          )}
          {!isPermanentlyClosed &&
            hours.length === 7 &&
            hours.every((hour) => hour.open_time && hour.close_time) && (
              <Badge variant="blue">
                <ClockIcon className="me-1 h-4 w-4" aria-hidden="true" />
                Open everyday
              </Badge>
            )}
          {!isPermanentlyClosed && <ClinicStatus hours={hours} specialHours={specialHours} />}
          {!isPermanentlyClosed && openOnPublicHolidays && (
            <Badge variant="gray">Open on public holidays</Badge>
          )}
          {isPermanentlyClosed && (
            <Badge variant="red">
              <MapPinXInsideIcon className="me-1 h-4 w-4" aria-hidden="true" />
              Closed permanently
            </Badge>
          )}
        </div>
        <div className="absolute bottom-2 right-2 flex flex-wrap justify-end gap-2">
          {distance && distance > 0 && (
            <Badge variant="gray">Distance: {distance.toFixed(1)} km</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="mb-2 text-lg leading-tight">{name}</CardTitle>
        {rating !== null && rating !== undefined && (
          <div className="mb-3 flex-shrink-0">
            <StarRating rating={rating} />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 flex-shrink-0 text-blue-300" aria-hidden="true" />
            <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-300">
              {address}, {postalCode}, {area}, {state}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 flex-shrink-0 text-blue-300" aria-hidden="true" />
            <p className="text-sm text-gray-500 dark:text-gray-300">{phone}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isPlaceholder) {
    return <div className="block">{card}</div>;
  }

  return (
    <Link
      href={`/place/${slug}`}
      className="block transition-transform hover:scale-[1.02] hover:border-none"
      prefetch={false}>
      {card}
    </Link>
  );
}
