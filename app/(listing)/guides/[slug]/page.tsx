import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/config/site';

import {
  formatGuideDate,
  getAllGuides,
  getGuideBySlug,
  getRelatedGuides,
  GUIDE_IMAGE_HEIGHT,
  GUIDE_IMAGE_WIDTH,
} from '@/lib/guides';
import { GuideInline, GuideMarkdown } from '@/lib/guides/markdown';
import type { Guide } from '@/lib/guides/types';
import { absoluteUrl } from '@/lib/utils';

import { GuideDesktopToc, GuideMobileToc, GuideTocProvider } from '@/components/guides/guide-toc';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import JsonLd from '@/components/structured-data/json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import Prose from '@/components/ui/prose';

type GuidePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const url = `/guides/${guide.slug}`;
  const pageTitle = guide.metaTitle ?? guide.title;

  return {
    title: guide.metaTitle ? { absolute: guide.metaTitle } : guide.title,
    description: guide.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: pageTitle,
      description: guide.description,
      url,
      type: 'article',
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      images: [
        {
          url: absoluteUrl(guide.image),
          width: GUIDE_IMAGE_WIDTH,
          height: GUIDE_IMAGE_HEIGHT,
          alt: guide.imageAlt,
        },
      ],
      locale: 'en_US',
      siteName: siteConfig.siteName,
    },
    twitter: {
      title: pageTitle,
      description: guide.description,
      card: 'summary_large_image',
      creator: siteConfig.creator,
      images: [absoluteUrl(guide.image)],
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const related = getRelatedGuides(guide);
  const pageUrl = absoluteUrl(`/guides/${guide.slug}`);
  const organization = {
    '@type': 'Organization',
    name: siteConfig.siteName,
    url: absoluteUrl('/'),
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/images/logo.png'),
    },
  };

  const breadcrumbs = [
    { position: '1', name: 'Home', item: absoluteUrl('/') },
    { position: '2', name: 'Guides', item: absoluteUrl('/guides') },
    { position: '3', name: guide.title, item: pageUrl },
  ];

  return (
    <>
      <JsonLd id="guide-article-jsonld">
        {{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.description,
          datePublished: guide.publishedAt,
          dateModified: guide.updatedAt,
          image: absoluteUrl(guide.image),
          author: organization,
          publisher: organization,
          mainEntityOfPage: pageUrl,
          inLanguage: 'en-MY',
          keywords: guide.primaryKeyword,
        }}
      </JsonLd>
      <BreadcrumbJsonLd itemListElements={breadcrumbs} />
      <JsonLd id="guide-faq-jsonld">
        {{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: guide.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }}
      </JsonLd>
      <GuideTocProvider headings={guide.headings}>
        <article data-guide-page>
          <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <Container className="py-10 md:py-14">
              <Breadcrumb items={[{ name: 'Guides', url: '/guides' }, { name: guide.title }]} />
              <div className="mt-6 grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
                <div className="min-w-0">
                  <h1 className="text-balance font-display text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-gray-50">
                    {guide.title}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
                    {guide.description}
                  </p>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Published{' '}
                    <time dateTime={guide.publishedAt}>{formatGuideDate(guide.publishedAt)}</time>
                    <span aria-hidden="true"> · </span>
                    Updated{' '}
                    <time dateTime={guide.updatedAt}>{formatGuideDate(guide.updatedAt)}</time>
                    <span aria-hidden="true"> · </span>
                    {guide.readingTimeMinutes} min read
                  </p>
                </div>
                <Image
                  src={guide.image}
                  alt={guide.imageAlt}
                  width={GUIDE_IMAGE_WIDTH}
                  height={GUIDE_IMAGE_HEIGHT}
                  priority
                  className="h-auto w-full rounded-lg border border-gray-200 dark:border-gray-800"
                />
              </div>
            </Container>
          </header>

          <GuideMobileToc />

          <Container className="grid min-w-0 gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:py-14">
            <div className="min-w-0">
              <section
                aria-labelledby="short-version"
                className="dark:bg-blue-950/40 rounded-lg border border-blue-200 bg-blue-50 p-5 dark:border-blue-900">
                <h2
                  id="short-version"
                  className="font-display text-xl font-bold text-gray-900 dark:text-gray-50">
                  The short version
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-gray-700 dark:text-gray-200">
                  {guide.summary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <p className="mt-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                This is general information, not medical advice. Consult a registered practitioner.
              </p>

              <div className="mt-10">
                <Prose>
                  <GuideMarkdown markdown={guide.body} />
                </Prose>
              </div>

              {guide.faq.length > 0 ? (
                <section aria-labelledby="guide-faq" className="mt-12 scroll-mt-36 lg:scroll-mt-28">
                  <h2
                    id="guide-faq"
                    className="font-display text-2xl font-bold text-gray-900 dark:text-gray-50">
                    Common questions
                  </h2>
                  <div className="mt-4 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                    {guide.faq.map((item) => (
                      <details key={item.question} className="group py-4" open>
                        <summary className="cursor-pointer text-base font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-50">
                          {item.question}
                        </summary>
                        <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300 [&_a]:font-medium [&_a]:text-blue-700 [&_a]:underline dark:[&_a]:text-blue-300">
                          <GuideInline text={item.answer} />
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              ) : null}

              <FindAClinic guide={guide} />
            </div>

            <aside className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-4">
              <div className="hidden lg:block">
                <GuideDesktopToc />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500 lg:mt-8">
                Directory
              </p>
              <ul className="mt-3 space-y-2">
                {guide.relatedLinks.slice(0, 6).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} prefetch={false} className="text-sm">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </Container>

          {related.length > 0 ? (
            <section className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40">
              <Container className="py-10 md:py-14">
                <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-50">
                  Related guides
                </h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {related.map((item) => (
                    <li key={item.slug} className="min-w-0">
                      <article className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                        <Link
                          href={`/guides/${item.slug}`}
                          prefetch={false}
                          className="block hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900">
                          <Image
                            src={item.image}
                            alt={item.imageAlt}
                            width={GUIDE_IMAGE_WIDTH}
                            height={GUIDE_IMAGE_HEIGHT}
                            className="aspect-[16/9] w-full object-cover"
                          />
                          <div className="p-5">
                            <h3 className="font-display text-xl font-black text-gray-900 dark:text-gray-50">
                              {item.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                              {item.description}
                            </p>
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                              {item.readingTimeMinutes} min read
                              <span aria-hidden="true"> · </span>
                              <time dateTime={item.updatedAt}>
                                {formatGuideDate(item.updatedAt)}
                              </time>
                            </p>
                          </div>
                        </Link>
                      </article>
                    </li>
                  ))}
                </ul>
              </Container>
            </section>
          ) : null}
        </article>
      </GuideTocProvider>
    </>
  );
}

function FindAClinic({ guide }: { guide: Guide }) {
  return (
    <section
      aria-labelledby="find-a-clinic"
      className="mt-12 scroll-mt-36 rounded-lg border border-gray-200 p-5 lg:scroll-mt-28 dark:border-gray-800">
      <h2
        id="find-a-clinic"
        className="font-display text-2xl font-bold text-gray-900 dark:text-gray-50">
        Find a clinic
      </h2>
      <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
        These directory pages are a shortlist. Confirm the doctor and the LCP with the clinic and
        the public registers before you book.
      </p>
      <ul className="mt-4 space-y-3">
        {guide.relatedLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} prefetch={false} className="font-semibold">
              {link.title}
            </Link>
            {link.description ? (
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {link.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
