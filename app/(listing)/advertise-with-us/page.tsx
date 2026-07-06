import {
  ChartNoAxesCombinedIcon,
  HandCoinsIcon,
  HeartHandshakeIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SproutIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { PricingPlan } from '@/components/listing/pricing-plan';
import PageHeading from '@/components/page-heading';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

const seo = {
  title: 'Grow Your Aesthetic Clinic with Us - Get More Patients',
  description:
    "Join Malaysia's trusted aesthetic clinic directory. Get featured listings to grow your practice with targeted online visibility.",
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

const features = [
  {
    title: 'Boost Visibility',
    description:
      'Appear in top search results for <strong>“aesthetic clinic near me”</strong>—connect with high-intent patients searching for care now.',
    icon: (
      <div className="inline-block rounded-full bg-blue-100 p-4 dark:bg-blue-950/60">
        <MapPinIcon className="h-6 w-6 text-blue-500" />
      </div>
    ),
  },

  {
    title: 'Strengthen Reputation',
    description:
      'Stand out with <strong>verified listings</strong>, <strong>genuine reviews</strong>, and a <strong>professionally presented profile</strong>.​',
    icon: (
      <div className="inline-block rounded-full bg-yellow-100 p-4 dark:bg-yellow-950/40">
        <ShieldCheckIcon className="h-6 w-6 text-yellow-600" />
      </div>
    ),
  },
  {
    title: 'Improve SEO',
    description:
      'Get authoritative citations and backlinks to your website, enhancing your Google rankings.​',
    icon: (
      <div className="inline-block rounded-full bg-green-100 p-4 dark:bg-green-950/40">
        <ChartNoAxesCombinedIcon className="h-6 w-6 text-green-600" />
      </div>
    ),
  },
  {
    title: 'Affordable Marketing',
    description:
      'Enjoy <strong>cost-effective packages</strong> and <strong>flexible upgrades</strong> that deliver lasting results—just one new patient can cover your ad spend.​',
    icon: (
      <div className="inline-block rounded-full bg-orange-100 p-4 dark:bg-orange-950/40">
        <HandCoinsIcon className="text-orange-600 h-6 w-6" />
      </div>
    ),
  },

  {
    title: 'Dedicated Local Support',
    description:
      'Work with a <strong>responsive team</strong> ready to help you maximize your clinic’s exposure and tackle any questions—no complicated systems required.​',
    icon: (
      <div className="inline-block rounded-full bg-violet-100 p-4 dark:bg-violet-950/40">
        <HeartHandshakeIcon className="h-6 w-6 text-violet-600" />
      </div>
    ),
  },
  {
    title: 'Grow Fast',
    description:
      'Clinics choosing premium placements consistently receive more enquiries and bookings compared to standard listings.',
    icon: (
      <div className="inline-block rounded-full bg-cyan-100 p-4 dark:bg-cyan-950/40">
        <SproutIcon className="h-6 w-6 text-cyan-600" />
      </div>
    ),
  },
];

const advertiseHighlights = [
  'Over 7,000 nationwide audience',
  'Verified clinic listings',
  'Flexible ad packages',
];

function AdvertiseWhyUs() {
  return (
    <>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-4 mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 dark:text-gray-50">
          Why List Your Aesthetic Clinic With Us?
        </h2>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
          We offer a range of advertising options to help you reach more patients. Contact our team
          for a free consultation today.
        </p>
      </div>
      <div>
        <ul className="mt-8 grid grid-cols-1 gap-6 md:mt-12 md:grid-cols-3 md:gap-8 lg:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
              {feature.icon && <div className="">{feature.icon}</div>}
              <h3 className="text-lg font-semibold leading-snug tracking-tight text-gray-900 dark:text-gray-50">
                {feature.title}
              </h3>
              <p
                className="text-base text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: feature.description }}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function AdvertiseFooter() {
  return (
    <div className="not-prose flex flex-col items-center justify-center gap-8 rounded-xl border border-blue-100 bg-blue-50 p-16 text-center shadow-lg dark:border-blue-900/50 dark:bg-blue-950/30 dark:shadow-none">
      <div className="flex flex-col items-center justify-center gap-2">
        <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
          Ready to Grow Your Clinic’s Reach?
        </h2>
        <p className="text-blue-700 dark:text-blue-200">
          We offer a range of advertising options to help you reach more patients. Contact our team
          for a free consultation today.
        </p>
      </div>
      <a
        href="mailto:hello@aestheticclinics.my?subject=Advertise With Us Enquiry"
        className={cn(buttonVariants({ variant: 'primary' }))}>
        Contact us
      </a>
    </div>
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

      <Wrapper size="default" className="bg-gray-50 dark:bg-gray-900">
        <Container>
          <AdvertiseWhyUs />
        </Container>
      </Wrapper>

      <Wrapper size="default" className="bg-gray-50 dark:bg-gray-800/50">
        <Container>
          <PricingPlan />
        </Container>
      </Wrapper>

      <Wrapper size="default" className="">
        <Container className="max-w-4xl">
          <AdvertiseFooter />
        </Container>
      </Wrapper>
    </>
  );
}
