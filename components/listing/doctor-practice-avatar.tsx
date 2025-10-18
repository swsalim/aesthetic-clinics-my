import Link from 'next/link';

import { SquareUserRoundIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { getDoctorsByClinicSlug } from '@/helpers/doctors';

import { ImageKit } from '../image/image-kit';

interface DoctorPracticeProps {
  clinicSlug: string;
  className?: string;
}

export default async function DoctorPracticeAvatar({ clinicSlug, className }: DoctorPracticeProps) {
  const doctors = await getDoctorsByClinicSlug(clinicSlug);

  if (doctors.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-6 lg:hidden', className)}>
      <h2 className="text-xl font-semibold">Our Doctors</h2>

      <div className="not-prose flex flex-wrap gap-4">
        {doctors.map((doctor) => {
          const firstImage = doctor.images && doctor.images.length > 0 ? doctor.images[0] : null;
          return (
            <Link
              role="button"
              key={doctor.id}
              href={`/doctor/${doctor.slug}`}
              className="relative h-24 w-24 transform overflow-hidden rounded-full transition-all duration-300 hover:scale-105 hover:border-none hover:opacity-90"
              title={`View ${doctor.name}'s profile`}>
              {firstImage && firstImage.image_url ? (
                <ImageKit
                  src={firstImage.image_url}
                  alt={doctor.name}
                  width={150}
                  height={150}
                  className="h-full w-full object-cover"
                  priority={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <SquareUserRoundIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
