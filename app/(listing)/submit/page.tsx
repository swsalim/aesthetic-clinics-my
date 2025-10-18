import { Metadata } from 'next';

import { ClinicArea, ClinicState } from '@/types/clinic';

import { siteConfig } from '@/config/site';

import { createClient } from '@/lib/supabase/server';

import SubmitClinicForm from '@/components/forms/submit-clinic-form';

const config = {
  title: 'List Your Clinic | Reach More Patients in Malaysia',
  description:
    'Promote your aesthetic clinic on Malaysia’s top local directory. Submit your listing on aestheticclinics.my for free and connect with nearby patients.',
  url: '/submit',
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

export default async function SubmitClinicPage() {
  const supabase = await createClient();

  const [{ data: statesData }, { data: areasData }] = await Promise.all([
    supabase.from('states').select('id, name', { count: 'exact' }),
    supabase.from('areas').select('id, name, state_id', { count: 'exact' }),
  ]);

  const states = (statesData || []) as ClinicState[];
  const areas = (areasData || []) as ClinicArea[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Join Aesthetic Clinics Malaysia Listing</h1>
      <p className="mb-6 text-gray-700 dark:text-gray-400">
        Submit your clinic and get exposure to thousands of potential customers.
      </p>
      <SubmitClinicForm states={states} areas={areas} />
    </div>
  );
}
