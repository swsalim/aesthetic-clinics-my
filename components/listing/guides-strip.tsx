import Image from 'next/image';
import Link from 'next/link';

import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';

import { guideCategoryHref } from '@/lib/guide-categories';
import { getGuideCategories, GUIDE_IMAGE_HEIGHT, GUIDE_IMAGE_WIDTH } from '@/lib/guides';

import Container from '@/components/ui/container';

export function GuidesStrip() {
  const categories = getGuideCategories();

  if (categories.length === 0) {
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
              Jump to a topic: finding a clinic, injectables, laser, or skin treatments.
            </p>
          </div>
          <Link
            href="/guides"
            prefetch={false}
            className="inline-flex min-h-11 items-center text-sm font-semibold"
          >
            All guides
            <ArrowRightIcon weight="duotone" className="ms-1 size-4" aria-hidden="true" />
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
      </Container>
    </section>
  );
}
