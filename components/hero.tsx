import Link from 'next/link';

// import { ClinicImage } from '@/types/clinic';
// import { ArrowRightIcon, PersonStandingIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// import { getDoctors } from '@/helpers/doctors';
import { buttonVariants } from '@/components/ui/button';

// import { ImageKit } from './image/image-kit';

export async function Hero() {
  // const doctors = await getDoctors({ limit: 5 });
  // const doctorsData = doctors.data;
  // const doctorsCount = doctors.count;

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center gap-8 px-6 pb-6 pt-0 sm:gap-16 sm:p-20">
      <div className="row-start-2 flex flex-col items-start justify-center gap-12 text-start">
        <div className="flex flex-col gap-2">
          <h1 className="max-w-xl text-balance text-start text-4xl font-black capitalize leading-tight md:text-5xl">
            Let&apos;s find a perfect aesthetic clinic for you
          </h1>
          <p className="max-w-xl text-start text-base font-medium text-gray-500 dark:text-gray-300">
            Malaysia&apos;s Most Trusted Aesthetic Clinic Directory
          </p>

          <svg
            width="155"
            height="20"
            viewBox="0 0 155 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-500 dark:text-blue-300">
            <path
              d="M1.77001 13.4143C2.28873 13.1363 2.59997 12.9509 3.01494 12.6729C3.42992 12.4876 3.74115 12.3022 4.15613 12.1169C4.88234 11.7462 5.71229 11.3754 6.4385 11.0047C7.99466 10.2633 9.55082 9.70728 11.0032 9.05855C14.1156 7.85376 17.2279 6.83433 20.4439 5.90757C26.7723 4.14672 33.3082 2.75658 39.7403 1.82983C46.38 0.903066 52.9158 0.34701 59.4517 0.161658C65.9876 -0.11637 72.5235 -0.0236942 79.0593 0.34701C80.7192 0.439686 82.2754 0.532362 83.9353 0.625038C85.5952 0.717714 87.1514 0.81039 88.8113 0.995741C92.0273 1.36645 95.2434 1.64447 98.4595 2.10785L103.335 2.75658L108.108 3.49799C111.324 3.96137 114.436 4.6101 117.652 5.25884C130.309 7.76109 142.758 11.0974 155 14.8971C142.551 11.6535 129.998 8.8732 117.237 7.01968C114.021 6.5563 110.909 6.09292 107.693 5.72222L102.92 5.16616L98.1482 4.79546C94.9322 4.51743 91.7161 4.33208 88.5001 4.14672C86.9439 4.05405 85.284 4.05405 83.7278 3.96137C82.1717 3.8687 80.5118 3.8687 78.9556 3.8687C66.1951 3.77602 53.3308 4.79546 40.9853 7.20503C34.7606 8.40982 28.7435 9.98531 22.8301 11.9315C19.9252 12.9509 17.0204 14.0631 14.2193 15.2678C12.8706 15.9166 11.4182 16.5653 10.1733 17.214C9.55082 17.5847 8.82461 17.8628 8.20215 18.2335C7.89091 18.4188 7.57968 18.6042 7.26845 18.7895C6.95722 18.9749 6.64598 19.1602 6.4385 19.2529C4.67485 20.4577 2.18499 20.1797 0.836317 18.6042C-0.512355 17.0287 -0.201123 14.8045 1.56253 13.5997C1.66627 13.507 1.66627 13.507 1.77001 13.4143Z"
              fill="currentColor"></path>
          </svg>
        </div>
        <div className="flex w-full flex-col items-start justify-center gap-4 sm:flex-row">
          <Link
            className={cn(
              buttonVariants({
                variant: 'primary',
                size: 'large',
              }),
              'w-full rounded-full bg-blue-500 capitalize text-white hover:bg-blue-600',
            )}
            href="/browse">
            Find a Clinic near you
          </Link>
        </div>
        {/* <div className="flex w-full flex-col items-center justify-center gap-6 text-center text-sm font-semibold text-gray-900 dark:text-gray-50">
          OR
        </div>
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:justify-start">
          <div className="flex -space-x-1 md:-space-x-1">
            {doctorsData.map((doctor, index) => (
              <Link
                href={`/doctor/${doctor.slug}`}
                className="relative size-16 overflow-hidden rounded-full outline -outline-offset-1 outline-blue-200 ring-2 ring-blue-300 hover:border-transparent hover:ring-blue-400"
                key={`${doctor.id}-${index}`}>
                {doctor.images?.[0] && (
                  <ImageKit
                    src={(doctor.images?.[0] as unknown as ClinicImage).image_url}
                    alt={`Photo of ${doctor.name}`}
                    width={100}
                    height={100}
                    priority
                    className="h-full w-full object-cover"
                  />
                )}
                {!doctor.images?.[0] && (
                  <div className="mx-auto mb-6 h-full w-full p-0 md:p-0">
                    <PersonStandingIcon className="size-12" />
                  </div>
                )}
              </Link>
            ))}
          </div>
          <Link
            href={`/doctors`}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'w-full border-blue-300 bg-blue-200/40 text-sm text-blue-800 hover:border-blue-400 hover:bg-blue-200/60 hover:text-blue-900 active:border-blue-400 active:bg-blue-200/80 active:text-blue-900 sm:w-auto dark:border-blue-400 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:border-blue-300 dark:hover:bg-blue-900/60 dark:hover:text-blue-200 dark:active:border-blue-300 dark:active:bg-blue-900/80 dark:active:text-blue-200',
            )}>
            Browse over {doctorsCount} Aesthetic Doctors <ArrowRightIcon className="ms-2 size-4" />
          </Link>
        </div> */}
      </div>
    </div>
  );
}
