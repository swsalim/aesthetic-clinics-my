import Link from 'next/link';

import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';

import { getAllGuides } from '@/lib/guides';

import Container from '@/components/ui/container';

export function GuidesStrip() {
  const guides = getAllGuides().slice(0, 6);

  if (guides.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <Container className="py-12 md:py-14">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-xl">
            <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
              Guides
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
              How to compare clinics, pick one nearby, and handle an urgent visit.
            </p>
          </div>
          <Link
            href="/guides"
            prefetch={false}
            className="inline-flex min-h-11 items-center text-sm font-semibold">
            All guides
            <ArrowRightIcon weight="duotone" className="ms-1 size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-6 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                prefetch={false}
                className="flex min-h-11 flex-col gap-1 py-4 hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:flex-row sm:items-baseline sm:justify-between dark:focus-visible:ring-offset-gray-900">
                <span className="font-medium text-gray-900 dark:text-gray-50">{guide.title}</span>
                <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                  {guide.readingTimeMinutes} min read
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
