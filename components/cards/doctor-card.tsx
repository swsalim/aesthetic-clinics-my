'use client';

import Link from 'next/link';

import { ClinicDoctor, ClinicImage } from '@/types/clinic';
import { AwardIcon, HospitalIcon, MapPinIcon, SquareUserRoundIcon } from 'lucide-react';

import { ImageKit } from '@/components/image/image-kit';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { StarRating } from '../ui/star-rating';

interface DoctorCardProps {
  doctor: ClinicDoctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const firstImage = doctor.images && doctor.images.length > 0 ? doctor.images[0] : null;
  const primaryClinic = doctor.clinics && doctor.clinics.length > 0 ? doctor.clinics[0] : null;

  return (
    <Link
      href={`/doctor/${doctor.slug}`}
      className="block transition-transform hover:scale-[1.02] hover:border-none"
      prefetch={false}>
      <Card className="h-full overflow-hidden rounded-2xl" role="article">
        <CardHeader className="relative h-72 overflow-hidden p-0">
          {firstImage ? (
            <ImageKit
              src={(firstImage as unknown as ClinicImage).image_url}
              alt={doctor.name}
              width={400}
              height={600}
              className="h-full w-full object-cover"
              priority={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <SquareUserRoundIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <div className="absolute right-2 top-2 flex flex-wrap justify-end gap-2">
            {doctor.is_featured && (
              <Badge variant="brand">
                <AwardIcon className="me-1 h-4 w-4" aria-hidden="true" />
                Featured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="mb-2 text-lg leading-tight">{doctor.name}</CardTitle>
          {primaryClinic && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <HospitalIcon className="h-4 w-4 flex-shrink-0 text-blue-300" aria-hidden="true" />
                <p className="line-clamp-2 text-sm font-medium text-gray-700">
                  {primaryClinic.name}
                </p>
              </div>
              {primaryClinic.rating !== null && primaryClinic.rating !== undefined && (
                <div className="mb-1 flex-shrink-0">
                  <StarRating rating={primaryClinic.rating} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 flex-shrink-0 text-blue-300" aria-hidden="true" />
                <p className="line-clamp-2 text-sm text-gray-500">
                  {primaryClinic.address && `${primaryClinic.address}, `}
                  {primaryClinic.postal_code && `${primaryClinic.postal_code}, `}
                  {primaryClinic.area?.name && `${primaryClinic.area.name}, `}
                  {primaryClinic.state?.name}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
