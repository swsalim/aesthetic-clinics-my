import { Metadata } from 'next';

import { siteConfig } from '@/config/site';

import { createServerClient } from '@/lib/supabase';

import { ClinicTableData, columns } from './columns';
import { DataTable } from './components/data-table';

export const dynamic = 'force-dynamic';

const config = {
  title: 'Clinics',
  description: 'List all clinics',
  url: '/dashboard/clinics',
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

export default async function DashboardClinicsPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('clinics')
    .select(
      `id,
      name,
      slug,
      website,
      images:clinic_images(image_url, imagekit_file_id),
      area:area_id(name, slug),
      state:state_id(name, slug),
      is_active`,
    )
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clinics:', error);
  }

  // Convert Supabase data to our expected format
  return (
    <DataTable
      columns={columns}
      data={(data as unknown as ClinicTableData[]) || []}
      type="clinic"
    />
  );
}
