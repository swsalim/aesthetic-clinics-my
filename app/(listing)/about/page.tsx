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
    'AestheticClinics.my is a directory of aesthetic clinics and aesthetic doctors in Malaysia, listed by state and city.',
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
        <PageHeading label="About" title={config.title}>
          <p>
            AestheticClinics.my is a directory of aesthetic clinics and aesthetic doctors in
            Malaysia. Listings are grouped by state and city so you can open a clinic and read the
            details stored for it.
          </p>
        </PageHeading>
        <Container>
          <Prose>
            <h2>What a listing contains</h2>
            <p>
              A public clinic page shows the name, address, hours, recorded services, doctor text,
              and reviews that are stored for that clinic. Fields that are empty stay empty. The
              directory does not add a credential, a rating, or a treatment that is not in the
              record.
            </p>
            <h2>How a clinic is included</h2>
            <p>
              A clinic sent through the public form is saved with status pending. State, city, and
              place pages list clinics whose status is approved and whose is_active flag is true.
            </p>
            <h2>Credentials</h2>
            <p>
              This directory does not check a Letter of Credentialing and Privileging, and it does
              not describe a listed doctor as credentialed. Check the doctor on the Malaysian
              Medical Council register and on the Ministry of Health national registry of registered
              medical practitioners practising aesthetic medical practice.
            </p>
            <h2>Guides</h2>
            <p>
              The guides are general information about comparing clinics and reading a public
              register. They are not medical advice, and they are not a check of any listing.
            </p>
            <BrowseClinics />
          </Prose>
        </Container>
      </Wrapper>
    </>
  );
}
