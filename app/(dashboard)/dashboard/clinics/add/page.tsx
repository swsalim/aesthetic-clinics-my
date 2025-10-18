import { Metadata } from 'next';

import { ClinicArea, ClinicService, ClinicState } from '@/types/clinic';

import { siteConfig } from '@/config/site';

import { createClient } from '@/lib/supabase/server';

import { Separator } from '@/components/ui/separator';

import FormAddClinic from '../components/form-add-clinic';

const config = {
  title: 'Add Clinic',
  description: 'Add a clinic',
  url: '/dashboard/clinics/add',
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

export default async function AddClinicPage() {
  const supabase = await createClient();

  const [{ data: servicesData }, { data: statesData }, { data: areasData }] = await Promise.all([
    supabase.from('clinic_services').select('*', { count: 'exact' }),
    supabase.from('states').select('*', { count: 'exact' }),
    supabase.from('areas').select('*', { count: 'exact' }),
  ]);

  // Ensure we have arrays even if data is null
  const services = (servicesData || []) as ClinicService[];
  const states = (statesData || []) as ClinicState[];
  const areas = (areasData || []) as ClinicArea[];

  return (
    <div className="flex flex-row gap-6">
      <div className="flex-1 lg:max-w-full">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Add New Clinic</h3>
            <p className="text-sm text-gray-500">
              Create a new clinic listing that will be shown on the site.
            </p>
          </div>
          <Separator />
          <FormAddClinic services={services} areas={areas} states={states} />
        </div>
      </div>
    </div>
  );
}
