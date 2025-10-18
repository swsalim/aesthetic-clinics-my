'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Clinic, ClinicImage } from '@/types/clinic';

import { createClient } from '@/lib/supabase/client';

import { ClinicCard } from '@/components/cards/clinic-card';
import { ClinicCardSkeleton } from '@/components/cards/clinic-card-skeleton';
import { Button } from '@/components/ui/button';

export function RecentClinicsList() {
  const [clinics, setClinics] = useState<Partial<Clinic>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRecentClinics() {
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select(
            `
            id,
            name,
            slug,
            address,
            phone,
            postal_code,
            rating,
            images:clinic_images(image_url, imagekit_file_id),
            open_on_public_holidays,
            hours:clinic_hours(*),
            special_hours:clinic_special_hours(*),
            area:areas!inner(name),
            state:states!inner(name)
          `,
          )
          .eq('is_active', true)
          .order('modified_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        setClinics((data as unknown as Partial<Clinic>[]) || []);
      } catch (error) {
        console.error('Error fetching recent clinics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentClinics();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <ClinicCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
        {clinics.map((clinic) => {
          return (
            <ClinicCard
              key={clinic.id}
              slug={clinic.slug || ''}
              name={clinic.name || ''}
              address={clinic.address || ''}
              phone={clinic.phone || ''}
              postalCode={clinic.postal_code || ''}
              state={clinic.state?.name || ''}
              area={clinic.area?.name || ''}
              image={
                clinic.images?.[0]
                  ? (clinic.images[0] as unknown as ClinicImage).image_url
                  : undefined
              }
              rating={clinic.rating}
              hours={clinic.hours || []}
              specialHours={clinic.special_hours || []}
              openOnPublicHolidays={clinic.open_on_public_holidays || false}
            />
          );
        })}
      </div>
      <div className="mt-10 flex justify-center sm:mt-14">
        <Button variant="primary" size="large" asChild rounded>
          <Link href="/browse" className="no-underline">
            Discover clinics near me
          </Link>
        </Button>
      </div>
    </>
  );
}
