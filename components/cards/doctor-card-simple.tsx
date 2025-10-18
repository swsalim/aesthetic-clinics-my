'use client';

import Link from 'next/link';

import { ClinicDoctor } from '@/types/clinic';
import { AwardIcon, SquareUserRoundIcon } from 'lucide-react';

import { ImageKit } from '@/components/image/image-kit';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface DoctorCardProps {
  doctor: ClinicDoctor;
}

export function DoctorCardSimple({ doctor }: DoctorCardProps) {
  const firstImage = doctor.images && doctor.images.length > 0 ? doctor.images[0] : null;

  return (
    <Link
      href={`/doctor/${doctor.slug}`}
      className="not-prose block w-full hover:border-none"
      title={`View ${doctor.name}'s profile`}
      prefetch={false}>
      <Card className="h-full w-full overflow-hidden rounded-2xl" role="article">
        <CardContent className="flex flex-row items-center gap-2 p-0">
          <div className="relative h-24 w-24">
            {firstImage ? (
              <ImageKit
                src={firstImage.image_url}
                alt={doctor.name}
                width={150}
                height={300}
                className="m-0 h-full w-full object-cover"
                priority={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <SquareUserRoundIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex flex-col items-start gap-2 p-4">
            <CardTitle className="text-base leading-tight">{doctor.name}</CardTitle>
            {doctor.is_featured && (
              <Badge variant="brand">
                <AwardIcon className="me-1 h-4 w-4" aria-hidden="true" />
                Featured
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
