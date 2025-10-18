import { Metadata } from 'next';

import { siteConfig } from '@/config/site';

import { createServerClient } from '@/lib/supabase';

import { AreaTableData, columns } from './columns';
import { DataTable } from './components/data-table';

export const dynamic = 'force-dynamic';

const config = {
  title: 'Areas',
  description: 'List all areas',
  url: '/dashboard/areas',
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

export default async function DashboardAreasPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('areas')
    .select(
      `id,
      name,
      slug,
      short_description,
      image,
      clinics:clinics(name, slug),
      state:states(id, name, slug)`,
    )
    .order('modified_at', { ascending: false });

  if (error) {
    console.error('Error fetching areas:', error);
  }

  // Convert Supabase data to our expected format
  return <DataTable columns={columns} data={(data as unknown as AreaTableData[]) || []} />;
}
