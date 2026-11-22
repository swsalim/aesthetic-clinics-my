import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { siteConfig } from '@/config/site';

import {
  formatGuideDate,
  getAllGuides,
  getGuideCategories,
  getGuidesIndexLastmod,
  GUIDE_IMAGE_HEIGHT,
  GUIDE_IMAGE_WIDTH,
} from '@/lib/guides';
import { absoluteUrl } from '@/lib/utils';

import { GuideHashScroll } from '@/components/guides/guide-hash-scroll';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import JsonLd from '@/components/structured-data/json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';

const title = 'Guides to finding an aesthetic clinic in Malaysia';
const description =
  'Practical guides on comparing aesthetic clinics, checking an LCP, and reading a botulinum toxin listing before you book.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/guides',
  },
  openGraph: {
    title,
    description,
    url: '/guides',
    type: 'website',
    locale: 'en_US',
    siteName: siteConfig.siteName,
    images: [
      {
        url: siteConfig.openGraph.image,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    creator: siteConfig.creator,
    images: [siteConfig.openGraph.image],
  },
};

export default function GuidesPage() {
  const guides = getAllGuides();
  const categories = getGuideCategories();

  const breadcrumbs = [
    { position: '1', name: 'Home', item: absoluteUrl('/') },
    { position: '2', name: 'Guides', item: absoluteUrl('/guides') },
  ];

  return (
    <>
      <GuideHashScroll />
      <JsonLd id="guides-collection-jsonld">
        {{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          description,
          url: absoluteUrl('/guides'),
          inLanguage: 'en-MY',
          dateModified: getGuidesIndexLastmod(),
          isPartOf: {
            '@type': 'WebSite',
            name: siteConfig.siteName,
            url: absoluteUrl('/'),
          },
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

      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <Container className="py-10 md:py-14">
          <Breadcrumb items={[{ name: 'Guides' }]} />
          <h1 className="mt-4 max-w-3xl text-balance font-display text-[clamp(2rem,5vw,3.25rem)] font-black leading-[1.05] tracking-tight text-gray-900 dark:text-gray-50">
            Guides
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
            Practical notes on comparing clinics, checking an LCP, and reading a treatment listing
            before you book.
          </p>
          <nav aria-label="Guide categories" className="mt-6">
            <ul className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(({ category, guides: items }) => (
                <li key={category.id} className="shrink-0">
                  <a
                    href={`#${category.id}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-200"
                  >
                    {category.title}
                    <span className="ms-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {items.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>

      <div className="bg-white dark:bg-gray-950">
        <Container className="space-y-14 py-10 md:py-14">
          {categories.map(({ category, guides: items }, categoryIndex) => (
            <section key={category.id} id={category.id} className="scroll-mt-28">
              <div className="max-w-2xl">
                <h2 className="font-display text-2xl font-black text-gray-900 md:text-3xl dark:text-gray-50">
                  {category.title}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  {category.description}
                </p>
              </div>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                {items.map((guide, index) => (
                  <li key={guide.slug}>
                    <article className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                      <Link
                        href={`/guides/${guide.slug}`}
                        prefetch={false}
                        className="block hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                      >
                        <Image
                          src={guide.image}
                          alt={guide.imageAlt}
                          width={GUIDE_IMAGE_WIDTH}
                          height={GUIDE_IMAGE_HEIGHT}
                          priority={categoryIndex === 0 && index === 0}
                          className="aspect-[16/9] w-full object-cover"
                        />
                        <div className="p-5">
                          <h3 className="font-display text-xl font-black text-gray-900 dark:text-gray-50">
                            {guide.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                            {guide.description}
                          </p>
                          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            {guide.readingTimeMinutes} min read
                            <span aria-hidden="true"> · </span>
                            <time dateTime={guide.updatedAt}>{formatGuideDate(guide.updatedAt)}</time>
                          </p>
                        </div>
                      </Link>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Container>
      </div>
    </>
  );
}
