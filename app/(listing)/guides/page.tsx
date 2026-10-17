import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { siteConfig } from '@/config/site';

import { formatGuideDate, getAllGuides, readingTimeLabel } from '@/lib/guides';
import { absoluteUrl } from '@/lib/utils';

import PageHeading from '@/components/page-heading';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import JsonLd from '@/components/structured-data/json-ld';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

const config = {
  title: 'Guides to finding an aesthetic clinic in Malaysia',
  description:
    'Practical guides on comparing aesthetic clinics, checking an LCP, and reading a botulinum toxin listing before you book.',
  url: '/guides',
};

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: {
    canonical: config.url,
  },
  openGraph: {
    title: config.title,
    description: config.description,
    url: config.url,
    images: [
      {
        url: absoluteUrl('/images/guides/finding-a-clinic.svg'),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: 'Illustrated checklist for finding an aesthetic clinic in Malaysia',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    title: config.title,
    description: config.description,
    card: 'summary_large_image',
    creator: siteConfig.creator,
    images: [absoluteUrl('/images/guides/finding-a-clinic.svg')],
  },
};

export default function GuidesPage() {
  const guides = getAllGuides();
  const [featured, ...rest] = guides;

  const breadcrumbs = [
    { position: '1', name: 'Home', item: absoluteUrl('/') },
    { position: '2', name: 'Guides', item: absoluteUrl('/guides') },
  ];

  return (
    <>
      <JsonLd id="guides-collection-jsonld">
        {{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: config.title,
          description: config.description,
          url: absoluteUrl('/guides'),
          inLanguage: 'en-MY',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: guides.map((guide, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: guide.title,
              url: absoluteUrl(`/guides/${guide.slug}`),
            })),
          },
        }}
      </JsonLd>
      <BreadcrumbJsonLd itemListElements={breadcrumbs} />
      <Wrapper className="pt-0 md:pt-0">
        <PageHeading label="Guides" title={config.title}>
          <p>
            Practical notes on comparing clinics, checking an LCP, and reading a botulinum toxin
            listing before you book.
          </p>
        </PageHeading>
        <Container className="flex flex-col gap-12">
          {featured && (
            <article>
              <Link
                href={`/guides/${featured.slug}`}
                prefetch={false}
                className="group grid overflow-hidden rounded-2xl border border-gray-200 bg-white no-underline shadow-sm transition hover:border-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-blue-700"
              >
                <Image
                  src={featured.image}
                  alt={featured.imageAlt}
                  width={1200}
                  height={900}
                  unoptimized
                  className="h-full w-full bg-blue-50 object-cover"
                />
                <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    Featured
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-gray-900 group-hover:text-blue-700 md:text-3xl dark:text-gray-50 dark:group-hover:text-blue-300">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    {featured.description}
                  </p>
                  <p className="mt-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {readingTimeLabel(featured.readingTimeMinutes)}
                    <span aria-hidden="true"> · </span>
                    <time dateTime={featured.updatedAt}>{formatGuideDate(featured.updatedAt)}</time>
                  </p>
                </div>
              </Link>
            </article>
          )}

          {rest.length > 0 && (
            <section aria-labelledby="more-guides">
              <h2 id="more-guides" className="sr-only">
                More guides
              </h2>
              <ul className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {rest.map((guide) => (
                  <li key={guide.slug} className="py-6">
                    <article>
                      <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                        <Link
                          href={`/guides/${guide.slug}`}
                          prefetch={false}
                          className="text-gray-900 no-underline hover:text-blue-700 dark:text-gray-50 dark:hover:text-blue-300"
                        >
                          {guide.title}
                        </Link>
                      </h3>
                      <p className="mt-2 max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                        {guide.description}
                      </p>
                      <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {readingTimeLabel(guide.readingTimeMinutes)}
                        <span aria-hidden="true"> · </span>
                        <time dateTime={guide.updatedAt}>{formatGuideDate(guide.updatedAt)}</time>
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Container>
      </Wrapper>
    </>
  );
}
