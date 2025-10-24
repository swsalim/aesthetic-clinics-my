'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import Link from 'next/link';

import { Clinic, ClinicDoctor } from '@/types/clinic';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { addDays, format, subDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import { Calendar } from '@/components/dashboard/dynamic-imports';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

interface StatProps {
  name: string;
  value: number | undefined;
  path: string;
  isLoading?: boolean;
}

interface DashboardStats {
  approvedClinics: Partial<Clinic>[];
  toBeReviewedClinics: Partial<Clinic>[];
  approvedDoctors: Partial<ClinicDoctor>[];
  toBeReviewedDoctors: Partial<ClinicDoctor>[];
}

function Stat({ name, value, path, isLoading = false }: StatProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
      <dt>
        <p className="font-regular truncate text-sm text-gray-500">{name}</p>
      </dt>
      <dd className="flex items-baseline pb-6 sm:pb-7">
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{value ?? 0}</p>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <a href={path} className="font-medium text-blue-600 hover:text-blue-500">
              View all<span className="sr-only"> {name} data</span>
            </a>
          </div>
        </div>
      </dd>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    approvedClinics: [],
    toBeReviewedClinics: [],
    approvedDoctors: [],
    toBeReviewedDoctors: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const supabase = createClient();

  // Fetch initial data
  const fetchData = useCallback(
    async (fromDate: Date, toDate: Date) => {
      const adjustedFromDate = fromDate.toISOString();
      const adjustedToDate = addDays(toDate, 1).toISOString();

      const [clinicsResponse, doctorsResponse] = await Promise.all([
        supabase
          .from('clinics')
          .select(
            `id,
          name,
          slug,
          website,
          area:area_id(name, slug),
          state:state_id(name, slug),
          is_active,
          status`,
          )
          .lt('created_at', adjustedToDate)
          .gt('created_at', adjustedFromDate)
          .order('name', { ascending: true }),
        supabase.from('clinic_doctors').select('*').order('name', { ascending: true }),
      ]);

      if (clinicsResponse.error) throw new Error(clinicsResponse.error.message);

      const clinics = clinicsResponse.data as unknown as Partial<Clinic>[];
      const doctors = doctorsResponse.data as unknown as Partial<ClinicDoctor>[];

      setStats({
        approvedClinics: clinics.filter((c) => c.status === 'approved'),
        toBeReviewedClinics: clinics.filter((c) => c.status === 'pending'),
        approvedDoctors: doctors.filter((d) => d.status === 'approved'),
        toBeReviewedDoctors: doctors.filter((d) => d.status === 'pending'),
      });

      setIsLoading(false);
    },
    [supabase],
  );

  useEffect(() => {
    // Set your date range
    const toDate = new Date();
    const fromDate = subDays(toDate, 7);

    // Fetch initial data
    fetchData(fromDate, toDate);

    // Set up realtime subscriptions
    const clinicsChannel: RealtimeChannel = supabase
      .channel('clinics-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'clinics',
        },
        (payload) => {
          console.log('Clinic change received:', payload);

          // Refetch data when changes occur
          fetchData(fromDate, toDate);
        },
      )
      .subscribe();

    const doctorsChannel: RealtimeChannel = supabase
      .channel('doctors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clinic_doctors',
        },
        (payload) => {
          console.log('Doctor change received:', payload);

          // Refetch data when changes occur
          fetchData(fromDate, toDate);
        },
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(clinicsChannel);
      supabase.removeChannel(doctorsChannel);
    };
  }, [fetchData, supabase]);

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <section className="max-w-8xl mx-auto px-4 py-8 sm:px-6">
      <div className="space-y-6 sm:px-6 lg:col-span-10 lg:px-0">
        <h1 className="text-3xl font-bold leading-6 text-gray-900 dark:text-gray-100">Dashboard</h1>

        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
              Last 7 days
            </h2>

            <div className={cn('grid gap-2', 'mt-2')}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      'w-[300px] justify-start text-left font-normal',
                      !date && 'text-gray-500',
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(date.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              name="Approved clinics"
              value={stats.approvedClinics?.length}
              path="/dashboard/clinics"
            />
            <Stat
              name="To Be Reviewed clinics"
              value={stats.toBeReviewedClinics?.length}
              path="/dashboard/clinics/review"
            />
            <Stat
              name="Approved doctors"
              value={stats.approvedDoctors?.length}
              path="/dashboard/doctors"
            />
            <Stat
              name="To Be Reviewed doctors"
              value={stats.toBeReviewedDoctors?.length}
              path="/dashboard/doctors/review"
            />
          </dl>

          {/* Recent Pending Clinics */}
          {stats.toBeReviewedClinics.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Recent Pending Clinics</h2>
              <div className="space-y-2">
                {stats.toBeReviewedClinics.slice(0, 5).map((clinic) => (
                  <div key={clinic.id} className="rounded border p-4 hover:bg-gray-50">
                    <p className="font-medium">{clinic.name}</p>
                    <p className="text-sm text-gray-600">{clinic.slug}</p>
                    <Link href={`/dashboard/clinics/review/edit/${clinic.id}`}>Review</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Pending Doctors */}
          {stats.toBeReviewedDoctors.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Recent Pending Doctors</h2>
              <div className="space-y-2">
                {stats.toBeReviewedDoctors.slice(0, 5).map((doctor) => (
                  <div key={doctor.id} className="rounded border p-3 hover:bg-gray-50">
                    <p className="font-medium">{doctor.name}</p>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
