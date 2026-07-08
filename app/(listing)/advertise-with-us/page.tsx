import {
  ChartNoAxesCombinedIcon,
  HandCoinsIcon,
  HeartHandshakeIcon,
  type LucideIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SproutIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { ImageKit } from '@/components/image/image-kit';
import { PricingPlan } from '@/components/listing/pricing-plan';
import PageHeading from '@/components/page-heading';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

const seo = {
  title: 'Grow Your Aesthetic Clinic with Us - Get More Patients',
  description:
    "Join Malaysia's trusted aesthetic clinic directory. Get featured listings to grow your practice with premium placement options.",
  url: '/advertise-with-us',
  creator: '@swsalim',
  company: 'AestheticClinics.my',
};

const ogImage = 'https://ik.imagekit.io/yuurrific/aesthetic-clinics-my/images/og-advertise.png';

export const metadata = {
  title: seo.title,
  description: seo.description,
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: seo.url,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
      },
    ],
    siteName: seo.company,
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    title: seo.title,
    description: seo.description,
    images: [ogImage],
    card: 'summary_large_image',
    creator: seo.creator,
  },
  alternates: {
    canonical: seo.url,
  },
};

const features: {
  title: string;
  description: string;
  Icon: LucideIcon;
  card: string;
  icon: string;
  titleColor: string;
  descriptionColor: string;
}[] = [
  {
    title: 'Boost Visibility',
    description:
      'Appear in top search results for <strong>“aesthetic clinic near me”</strong>—connect with high-intent patients searching for care now.',
    Icon: MapPinIcon,
    card: 'bg-blue-100 border-blue-200/70 dark:bg-blue-950/50 dark:border-blue-800/40',
    icon: 'text-blue-600 dark:text-blue-300',
    titleColor: 'text-blue-950 dark:text-blue-50',
    descriptionColor:
      'text-blue-900/80 dark:text-blue-100/80 [&_strong]:font-semibold [&_strong]:text-blue-950 dark:[&_strong]:text-blue-50',
  },
  {
    title: 'Strengthen Reputation',
    description:
      'Stand out with <strong>verified listings</strong>, <strong>genuine reviews</strong>, and a <strong>professionally presented profile</strong>.​',
    Icon: ShieldCheckIcon,
    card: 'bg-amber-100 border-amber-200/70 dark:bg-amber-950/40 dark:border-amber-800/40',
    icon: 'text-amber-700 dark:text-amber-300',
    titleColor: 'text-amber-950 dark:text-amber-50',
    descriptionColor:
      'text-amber-900/80 dark:text-amber-100/80 [&_strong]:font-semibold [&_strong]:text-amber-950 dark:[&_strong]:text-amber-50',
  },
  {
    title: 'Improve SEO',
    description:
      'Get authoritative citations and backlinks to your website, enhancing your Google rankings.​',
    Icon: ChartNoAxesCombinedIcon,
    card: 'bg-green-100 border-green-200/70 dark:bg-green-950/40 dark:border-green-800/40',
    icon: 'text-green-700 dark:text-green-300',
    titleColor: 'text-green-950 dark:text-green-50',
    descriptionColor:
      'text-green-900/80 dark:text-green-100/80 [&_strong]:font-semibold [&_strong]:text-green-950 dark:[&_strong]:text-green-50',
  },
  {
    title: 'Affordable Marketing',
    description:
      'Enjoy <strong>cost-effective packages</strong> and <strong>flexible upgrades</strong> that deliver lasting results—just one new patient can cover your ad spend.​',
    Icon: HandCoinsIcon,
    card: 'bg-orange-100 border-orange-200/70 dark:bg-orange-950/40 dark:border-orange-800/40',
    icon: 'text-orange-700 dark:text-orange-300',
    titleColor: 'text-orange-950 dark:text-orange-50',
    descriptionColor:
      'text-orange-900/80 dark:text-orange-100/80 [&_strong]:font-semibold [&_strong]:text-orange-950 dark:[&_strong]:text-orange-50',
  },
  {
    title: 'Dedicated Local Support',
    description:
      'Work with a <strong>responsive team</strong> ready to help you maximize your clinic’s exposure and tackle any questions—no complicated systems required.​',
    Icon: HeartHandshakeIcon,
    card: 'bg-violet-100 border-violet-200/70 dark:bg-violet-950/40 dark:border-violet-800/40',
    icon: 'text-violet-700 dark:text-violet-300',
    titleColor: 'text-violet-950 dark:text-violet-50',
    descriptionColor:
      'text-violet-900/80 dark:text-violet-100/80 [&_strong]:font-semibold [&_strong]:text-violet-950 dark:[&_strong]:text-violet-50',
  },
  {
    title: 'Grow Fast',
    description:
      'Clinics choosing premium placements consistently receive more enquiries and bookings compared to standard listings.',
    Icon: SproutIcon,
    card: 'bg-cyan-100 border-cyan-200/70 dark:bg-cyan-950/40 dark:border-cyan-800/40',
    icon: 'text-cyan-700 dark:text-cyan-300',
    titleColor: 'text-cyan-950 dark:text-cyan-50',
    descriptionColor: 'text-cyan-900/80 dark:text-cyan-100/80',
  },
];

const advertiseHighlights = [
  'Nationwide patient audience',
  'Verified clinic listings',
  'Priority city placement',
];

function AdvertiseWhyUs() {
  return (
    <section aria-labelledby="why-list-heading">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="why-list-heading"
          className="text-balance font-display text-3xl font-black text-gray-900 sm:text-4xl dark:text-gray-50">
          Why list your clinic with us?
        </h2>
        <p className="mt-4 text-lg font-medium leading-relaxed text-gray-600">
          Patients search for aesthetic care by location. A featured listing puts your clinic where
          they are already looking — with tools to stand out and convert interest into enquiries.
        </p>
      </div>
      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {features.map((feature) => (
          <li
            key={feature.title}
            className={cn('flex min-w-0 flex-col gap-4 rounded-xl border p-5', feature.card)}>
            <feature.Icon className={cn('size-7 shrink-0', feature.icon)} aria-hidden="true" />
            <div className="min-w-0">
              <h3 className={cn('font-display text-lg font-bold leading-snug', feature.titleColor)}>
                {feature.title}
              </h3>
              <p
                className={cn('mt-2 text-sm leading-relaxed', feature.descriptionColor)}
                dangerouslySetInnerHTML={{ __html: feature.description }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AdvertiseFooter() {
  return (
    <div className="dark:from-blue-950/40 my-12 flex flex-col items-center justify-center gap-6 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100/50 px-6 py-10 md:px-10 md:py-12 dark:border-blue-800/60 dark:via-gray-900 dark:to-gray-900">
      <div className="not-prose mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <h2 className="text-balance font-display text-2xl font-black text-gray-900 md:text-3xl dark:text-gray-50">
          Not sure which plan fits?
        </h2>
        <p className="text-base font-medium leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
          Tell us about your clinic and goals — we will recommend the right tier and walk you
          through setup.
        </p>
      </div>
      <Button variant="primary" asChild className="min-h-11">
        <a
          href="mailto:hello@aestheticclinics.my?subject=Advertise With Us Enquiry"
          className="!text-white no-underline hover:!border-transparent hover:!text-white dark:!text-white dark:hover:!text-white">
          Get a free consultation
        </a>
      </Button>
    </div>
  );
}

function FeaturedListingPreview() {
  return (
    <section aria-labelledby="featured-preview-heading">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="featured-preview-heading"
          className="text-balance font-display text-3xl font-black text-gray-900 sm:text-4xl dark:text-gray-50">
          See how featured placements look live
        </h2>
        <p className="mt-4 text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-300">
          Preview where your clinic appears on our homepage and in listing results before choosing a
          package.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <figure className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
          <ImageKit
            src="sample-homepage-listing.png"
            directory="images"
            alt="Sample homepage featured listing placement"
            width={1587}
            height={1208}
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={85}
            className="h-auto w-full object-cover"
          />
          <figcaption className="border-t border-gray-100 px-4 py-3 text-sm font-medium text-gray-600 dark:border-gray-800 dark:text-gray-300">
            Homepage featured spotlight placement
          </figcaption>
        </figure>

        <figure className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
          <ImageKit
            src="sample-featured-listing.png"
            directory="images"
            alt="Sample featured clinic card in listing page results"
            width={1587}
            height={1208}
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={85}
            className="h-auto w-full object-cover"
          />
          <figcaption className="border-t border-gray-100 px-4 py-3 text-sm font-medium text-gray-600 dark:border-gray-800 dark:text-gray-300">
            Listing page featured clinic card placement
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export default async function AdvertisePage() {
  return (
    <>
      <WebsiteJsonLd name={seo.company} />
      <WebPageJsonLd
        description={seo.description}
        id={seo.url}
        reviewedBy={process.env.NEXT_PUBLIC_SCHEMA_REVIEWER}
      />

      <Wrapper className="pt-0 md:pt-0">
        <PageHeading
          label="For clinics"
          title="Reach Malaysia's aesthetic patients directly"
          highlights={advertiseHighlights}>
          <p>
            Showcase your clinic, highlight your expertise, and connect with patients searching for
            aesthetic care across Malaysia.
          </p>
        </PageHeading>
      </Wrapper>

      <Wrapper size="default" className="bg-white dark:bg-gray-950">
        <Container>
          <AdvertiseWhyUs />
        </Container>
      </Wrapper>

      <Wrapper
        size="default"
        className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
        <Container className="max-w-5xl">
          <PricingPlan />
        </Container>
      </Wrapper>

      <Wrapper
        size="default"
        className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
        <Container className="max-w-6xl">
          <FeaturedListingPreview />
        </Container>
      </Wrapper>

      <Wrapper size="default" className="dark:bg-gray-900">
        <Container className="max-w-4xl">
          <AdvertiseFooter />
        </Container>
      </Wrapper>
    </>
  );
}
