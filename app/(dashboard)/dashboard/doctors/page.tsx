import { Metadata } from 'next';

import { siteConfig } from '@/config/site';

import { getDoctors } from '@/helpers/doctors';

import { columns } from './columns';
import { DataTable } from './components/data-table';

export const dynamic = 'force-dynamic';

// Remove this interface as we'll use the helper function

const config = {
  title: 'Doctors',
  description: 'List all doctors',
  url: '/dashboard/doctors',
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

export default async function DashboardDoctorsPage() {
  const { data: doctors } = await getDoctors();

  return <DataTable columns={columns} data={doctors} type="doctor" />;
}
