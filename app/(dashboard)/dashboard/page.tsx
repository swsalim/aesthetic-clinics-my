import { Clinic, ClinicDoctor } from '@/types/clinic';
import { addDays, format, subDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { createServerClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

import { Calendar } from '@/components/dashboard/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

interface StatProps {
  name: string;
  value: number | undefined;
  path: string;
  isLoading?: boolean;
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

export default async function Dashboard() {
  const supabase = await createServerClient();
  const now = new Date();
  const date = {
    from: subDays(now, 7),
    to: now,
  };

  // Add 1 day to the end date to account for timezone differences
  const adjustedToDate = addDays(date.to, 1).toISOString();
  const adjustedFromDate = date.from.toISOString();

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
        is_active`,
      )
      .lt('created_at', adjustedToDate)
      .gt('created_at', adjustedFromDate)
      .order('name', { ascending: true }),
    supabase.from('clinic_doctors').select('*').order('name', { ascending: true }),
  ]);

  if (clinicsResponse.error) throw new Error(clinicsResponse.error.message);

  const clinics = clinicsResponse.data as unknown as Partial<Clinic>[];

  const doctors = doctorsResponse.data as unknown as Partial<ClinicDoctor>[];

  return (
    <section className="max-w-8xl mx-auto px-4 py-8 sm:px-6">
      <div className="space-y-6 sm:px-6 lg:col-span-10 lg:px-0">
        <h1 className="text-3xl font-bold leading-6 text-gray-900 dark:text-gray-100">Dashboard</h1>

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
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Stat name="clinics" value={clinics?.length} path="/dashboard/clinics" />
            <Stat name="doctors" value={doctors?.length} path="/dashboard/doctors" />
          </dl>
        </div>
      </div>
    </section>
  );
}
