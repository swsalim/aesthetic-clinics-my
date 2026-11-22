import Image from 'next/image';
import Link from 'next/link';

import { ArrowRight } from '@phosphor-icons/react/dist/ssr';

import { guideCategoryHref } from '@/lib/guide-categories';
import { getGuideCategories, GUIDE_IMAGE_HEIGHT, GUIDE_IMAGE_WIDTH } from '@/lib/guides';

type LocationLink = {
  href: string;
  label: string;
};

export function LocationSeo({
  placeName,
  placeLabel,
  clinicCount,
  weekendCount,
  links,
}: {
  placeName: string;
  placeLabel: string;
  clinicCount: number;
  weekendCount: number;
  links: LocationLink[];
}) {
  const categories = getGuideCategories();
  return (
    <section className="mt-4 border-t border-gray-200 pt-10 dark:border-gray-800">
      <h2 className="text-balance font-display text-2xl font-bold text-gray-950 dark:text-white">
        About aesthetic clinics in {placeName}
      </h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-gray-700 dark:text-gray-300">
        This page lists {clinicCount.toLocaleString('en-MY')} aesthetic clinics in {placeLabel}.
        Compare them by whether they are open now, weekend hours, rating, and treatments.
        {weekendCount > 0
          ? ` ${weekendCount.toLocaleString('en-MY')} clinics have both Saturday and Sunday hours stored.`
          : ''}{' '}
        Open and closed follow current hours in Malaysia. Confirm services,
        reviews, and the doctor with the clinic before you book.
      </p>

      {links.length > 0 ? (
        <nav className="mt-10" aria-label="Related pages">
          <h2 className="font-display text-2xl font-bold text-gray-950 dark:text-white">
            Aesthetic clinics near {placeName}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className="inline-flex rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-blue-700 no-underline hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:text-blue-300 dark:hover:bg-blue-950">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {categories.length > 0 ? (
        <section className="mt-10" aria-labelledby="location-guides">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 max-w-xl">
              <h2
                id="location-guides"
                className="font-display text-2xl font-bold text-gray-950 md:text-3xl dark:text-white"
              >
                Guides
              </h2>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                Jump to a topic: finding a clinic, injectables, laser, or skin treatments.
              </p>
            </div>
            <Link
              href="/guides"
              prefetch={false}
              className="inline-flex min-h-11 items-center text-sm font-semibold"
            >
              All guides
              <ArrowRight weight="duotone" className="ms-1 size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ category, guides }) => {
              const cover = guides[0];
              if (!cover) return null;

              return (
                <li key={category.id}>
                  <Link
                    href={guideCategoryHref(category.id)}
                    prefetch={false}
                    className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-700 dark:focus-visible:ring-offset-gray-900"
                  >
                    <Image
                      src={cover.image}
                      alt=""
                      width={GUIDE_IMAGE_WIDTH}
                      height={GUIDE_IMAGE_HEIGHT}
                      className="aspect-[16/9] w-full object-cover"
                    />
                    <span className="flex flex-1 flex-col p-4">
                      <span className="font-display text-lg font-bold text-gray-900 dark:text-gray-50">
                        {category.title}
                      </span>
                      <span className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        {category.description}
                      </span>
                      <span className="mt-3 text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {guides.length} guides
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
