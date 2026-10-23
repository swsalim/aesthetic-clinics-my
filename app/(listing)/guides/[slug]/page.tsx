import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/config/site';

import { formatGuideDate, getAllGuides, getGuideBySlug, readingTimeLabel } from '@/lib/guides';
import { GuideMarkdown } from '@/lib/guides/markdown';
import { absoluteUrl } from '@/lib/utils';

import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import JsonLd from '@/components/structured-data/json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import Prose from '@/components/ui/prose';
import { Wrapper } from '@/components/ui/wrapper';

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
    title: pageTitle,
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
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: guide.imageAlt,
        },
      ],
      locale: 'en_US',
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

  const relatedGuides = getAllGuides().filter((item) => item.slug !== guide.slug);
  const pageUrl = absoluteUrl(`/guides/${guide.slug}`);
  const organization = {
    '@type': 'Organization',
    name: 'Aesthetic Clinics Malaysia',
    url: absoluteUrl('/'),
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/images/logo.png'),
    },
  };
  const toc = [
    ...guide.headings,
    { id: 'common-questions', text: 'Common questions' },
    { id: 'find-a-clinic', text: 'Find a clinic' },
  ];

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
      <Wrapper className="pt-8 md:pt-12">
        <Container className="flex flex-col gap-10">
          <Breadcrumb items={[{ name: 'Guides', url: '/guides' }, { name: guide.title }]} />

          <header className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(220px,340px)]">
            <div className="min-w-0">
              <h1 className="text-balance font-display text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl dark:text-gray-50">
                {guide.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                {guide.description}
              </p>
              <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
                <span>
                  Published{' '}
                  <time dateTime={guide.publishedAt}>{formatGuideDate(guide.publishedAt)}</time>
                </span>
                <span aria-hidden="true"> · </span>
                <span>
                  Updated <time dateTime={guide.updatedAt}>{formatGuideDate(guide.updatedAt)}</time>
                </span>
                <span aria-hidden="true"> · </span>
                <span>{readingTimeLabel(guide.readingTimeMinutes)}</span>
              </p>
            </div>
            <Image
              src={guide.image}
              alt={guide.imageAlt}
              width={1200}
              height={900}
              priority
              unoptimized
              className="aspect-[4/3] w-full rounded-2xl border border-blue-100 bg-blue-50 object-cover dark:border-gray-700"
            />
          </header>

          <aside className="rounded-2xl border border-blue-100 bg-blue-50/80 px-6 py-5 dark:border-gray-700 dark:bg-gray-900/60">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">The short version</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-gray-700 dark:text-gray-200">
              {guide.summary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>

          <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200">
            This is general information, not medical advice. Consult a registered practitioner.
          </p>

          <nav
            aria-label="Table of contents"
            className="rounded-2xl border border-gray-200 px-6 py-5 dark:border-gray-700"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              On this page
            </h2>
            <ol className="mt-3 space-y-2">
              {toc.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    className="text-base font-medium text-blue-700 no-underline hover:text-blue-800 dark:text-blue-300"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <Prose>
            <GuideMarkdown markdown={guide.body} />
          </Prose>

          <section
            aria-labelledby="common-questions"
            className="border-t border-gray-200 pt-8 dark:border-gray-800"
          >
            <h2
              id="common-questions"
              className="font-display text-2xl font-bold text-gray-900 dark:text-gray-50"
            >
              Common questions
            </h2>
            <dl className="mt-6 space-y-6">
              {guide.faq.map((item) => (
                <div key={item.question}>
                  <dt>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                      {item.question}
                    </h3>
                  </dt>
                  <dd className="mt-2 max-w-3xl text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            aria-labelledby="find-a-clinic"
            className="rounded-2xl border border-blue-100 bg-blue-50/70 px-6 py-6 dark:border-gray-700 dark:bg-gray-900/50"
          >
            <h2
              id="find-a-clinic"
              className="font-display text-2xl font-bold text-gray-900 dark:text-gray-50"
            >
              Find a clinic
            </h2>
            <p className="mt-2 max-w-3xl text-base text-gray-700 dark:text-gray-300">
              These directory pages are a shortlist. Confirm the doctor and the LCP with the clinic
              and the public registers before you book.
            </p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {guide.relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="block rounded-xl border border-blue-100 bg-white px-4 py-3 no-underline transition hover:border-blue-300 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <span className="font-semibold text-blue-800 dark:text-blue-300">
                      {link.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {link.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {relatedGuides.length > 0 && (
            <section
              aria-labelledby="related-guides"
              className="border-t border-gray-200 pt-8 dark:border-gray-800"
            >
              <h2
                id="related-guides"
                className="font-display text-2xl font-bold text-gray-900 dark:text-gray-50"
              >
                Related guides
              </h2>
              <ul className="mt-4 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {relatedGuides.map((item) => (
                  <li key={item.slug} className="py-4">
                    <Link
                      href={`/guides/${item.slug}`}
                      prefetch={false}
                      className="font-semibold text-gray-900 no-underline hover:text-blue-700 dark:text-gray-50 dark:hover:text-blue-300"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {readingTimeLabel(item.readingTimeMinutes)}
                    </p>
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
