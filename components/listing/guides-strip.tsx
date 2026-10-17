import Link from 'next/link';

import { ArrowRightIcon } from 'lucide-react';

import { getAllGuides } from '@/lib/guides';

import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

export function GuidesStrip() {
  const guides = getAllGuides();
  const [featured, ...rest] = guides;

  if (!featured) {
    return null;
  }

  return (
    <Wrapper size="sm" className="border-t border-gray-200 dark:border-gray-800">
      <Container className="min-w-0">
        <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h2 className="text-balance font-display text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
              Guides
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
              How to compare clinics and check an LCP before you book.
            </p>
            <Link
              href={`/guides/${featured.slug}`}
              prefetch={false}
              className="mt-4 inline-flex items-center gap-1.5 text-base font-semibold text-blue-700 no-underline hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
            >
              {featured.title}
              <ArrowRightIcon className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
          <ul className="min-w-0 space-y-2 md:text-right">
            {rest.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guides/${guide.slug}`}
                  prefetch={false}
                  className="text-sm font-medium text-gray-700 no-underline hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-300"
                >
                  {guide.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/guides"
                prefetch={false}
                className="text-sm font-semibold text-blue-700 no-underline hover:text-blue-800 dark:text-blue-300"
              >
                All guides
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </Wrapper>
  );
}
