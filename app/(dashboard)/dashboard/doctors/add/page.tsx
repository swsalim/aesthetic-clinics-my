import { Metadata } from 'next';

import { siteConfig } from '@/config/site';

import { createClient } from '@/lib/supabase/server';

import { Separator } from '@/components/ui/separator';

import FormAddDoctor from '../components/form-add-doctor';

const config = {
  title: 'Add Doctor',
  description: 'Add a doctor',
  url: '/dashboard/doctors/add',
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

export default async function AddDoctorPage() {
  const supabase = await createClient();

  const { data: clinicsData } = await supabase.from('clinics').select('id, name, slug');

  return (
    <div className="flex flex-row gap-6">
      <div className="flex-1 lg:max-w-full">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Add New Doctor</h3>
            <p className="text-sm text-gray-500">
              Create a new doctor listing that will be shown on the site.
            </p>
          </div>
          <Separator />
          <FormAddDoctor clinics={clinicsData || []} />
        </div>
      </div>
    </div>
  );
}
