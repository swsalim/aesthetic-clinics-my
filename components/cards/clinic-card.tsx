'use client';

import Link from 'next/link';

import { ClinicHours, ClinicSpecialHours } from '@/types/clinic';
import { AwardIcon, ClockIcon, MapPinIcon, PhoneIcon } from 'lucide-react';

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
  rating?: number | null;
  hours: Partial<ClinicHours>[];
  specialHours: Partial<ClinicSpecialHours>[];
  openOnPublicHolidays: boolean;
  distance?: number;
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
  rating,
  hours,
  specialHours,
  openOnPublicHolidays,
  distance,
}: ClinicCardProps) {
  return (
    <Link
      href={`/place/${slug}`}
      className="block transition-transform hover:scale-[1.02] hover:border-none"
      prefetch={false}>
      <Card className="h-full overflow-hidden rounded-2xl" role="article">
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
            {isFeatured && (
              <Badge variant="brand">
                <AwardIcon className="me-1 h-4 w-4" aria-hidden="true" />
                Featured
              </Badge>
            )}
            {hours.length === 7 && hours.every((hour) => hour.open_time && hour.close_time) && (
              <Badge variant="blue">
                <ClockIcon className="me-1 h-4 w-4" aria-hidden="true" />
                Open everyday
              </Badge>
            )}
            <ClinicStatus hours={hours} specialHours={specialHours} />
            {openOnPublicHolidays && <Badge variant="gray">Open on public holidays</Badge>}
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
    </Link>
  );
}
