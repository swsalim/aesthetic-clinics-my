import { Metadata } from 'next';

import { siteConfig } from '@/config/site';

import BrowseClinics from '@/components/call-to-action/browse-clinics';
import PageHeading from '@/components/page-heading';
import Container from '@/components/ui/container';
import Prose from '@/components/ui/prose';
import { Wrapper } from '@/components/ui/wrapper';

const config = {
  title: 'About Us',
  description:
    'Learn about our mission to help customers find the best aesthetic clinics across Malaysia and book your appointment.',
  url: '/about',
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
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${config.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
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
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${config.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
  },
};

export default async function BrowsePage() {
  return (
    <>
      <Wrapper className="pt-0 md:pt-0">
        <PageHeading title="About Us">
          <p>
            AestheticClinics.my is dedicated to helping Malaysians discover trusted, high-quality
            aesthetic and cosmetic clinics across the country. Our goal is simple: to make it easy
            for you to find certified professionals offering safe, effective, and evidence-based
            treatments — all in one convenient directory.
          </p>
        </PageHeading>
        <Container>
          <Prose>
            <h2>Our Mission</h2>
            <p>
              We believe that everyone deserves to feel confident in their own skin. That’s why we
              created Malaysia’s most comprehensive aesthetic clinic directory — to connect you with
              licensed doctors, verified beauty specialists, and medical aesthetic centers that meet
              professional standards of care.
            </p>
            <p>
              Whether you’re exploring facial rejuvenation, body contouring, hair restoration, or
              laser treatments, our mission is to guide you toward reputable providers who can help
              you achieve your goals safely and confidently.
            </p>
            <h2>What Makes Us Different</h2>
            <p>
              Our database includes <strong>hundreds of verified aesthetic clinics</strong>{' '}
              throughout Malaysia - from bustling Kuala Lumpur and Johor Bahru to Penang, Ipoh, and
              Kota Kinabalu. Each listing features detailed contact information, available
              treatments, doctor credentials, and customer reviews where available.
            </p>
            <p>
              We focus on listing{' '}
              <strong>LCP-certified aesthetic clinics and aesthetic doctors</strong> to ensure that
              the clinics featured on our platform meet Malaysia’s healthcare and safety standards.
            </p>
            <h2>Find Trusted Aesthetic Clinics Near You</h2>
            <p>
              Use our easy-to-navigate search tools to find clinics in your city, state, or
              treatment category. Whether you’re comparing popular procedures like Botox, fillers,
              facials, or laser therapy, AestheticClinics.my helps you make informed choices before
              you book an appointment.
            </p>
            <p>
              Our platform is fully mobile-friendly, allowing you to browse trusted clinics anytime,
              anywhere — whether you’re researching from home or on the go.
            </p>
            <h2>Expertise You Can Trust</h2>
            <p>
              We continuously update our directory to ensure accuracy and reliability. Our team
              works tirelessly to verify medical licenses, clinic information, and new openings,
              giving you confidence that you’re getting up-to-date and trustworthy data.
            </p>
            <p>
              We also publish educational content on popular aesthetic treatments, skin health, and
              beauty trends, helping Malaysians understand procedures before they commit.
            </p>
            <h2>Your Journey to Confidence Starts Here</h2>
            <p>
              Whether you’re new to aesthetic medicine or a returning patient seeking the best-rated
              clinic, AestheticClinics.my is your trusted partner. Our goal is to help you:
            </p>
            <ul>
              <li>Compare clinics easily and transparently.</li>
              <li>Learn what to expect from medical aesthetic procedures.</li>
              <li>Connect with licensed professionals who care about your well-being.</li>
            </ul>
            <p>
              Browse our comprehensive directory today and take the first step toward discovering
              top-rated aesthetic clinics in Malaysia — verified, professional, and easy to find.
            </p>
            <BrowseClinics />
          </Prose>
        </Container>
      </Wrapper>
    </>
  );
}
