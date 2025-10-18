import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/config/site';

import { createClient } from '@/lib/supabase/server';

import { Separator } from '@/components/ui/separator';
import { SidebarNav } from '@/components/ui/sidebar-nav';

import FormEditArea from '../../components/form-edit-area';

const config = {
  title: 'Edit Area Detail',
  description: 'Edit a area detail',
  url: '/dashboard/areas/edit',
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

export default async function EditAreaPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: area } = await supabase
    .from('areas')
    .select(
      'id, name, slug, short_description, description, image, imagekit_file_id, states(id, name)',
    )
    .match({ id })
    .single();

  if (!area) {
    notFound();
  }

  const sidebarNavItems = [
    {
      title: 'Profile',
      href: `/dashboard/areas/edit/${id}`,
    },
    {
      title: 'Location',
      href: `/dashboard/areas/edit/location/${id}`,
    },
    {
      title: 'Social',
      href: `/dashboard/areas/edit/social/${id}`,
    },
    {
      title: 'Images',
      href: `/dashboard/areas/edit/images/${id}`,
    },
  ];

  return (
    <div className="flex flex-row gap-6">
      <aside className="lg:w-1/5">
        <SidebarNav items={sidebarNavItems} />
      </aside>
      <div className="flex-1 lg:max-w-full">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">{area.name}</h3>
            <p className="text-sm text-gray-500">
              This is how others will see this listing on the site.
            </p>
          </div>
          <Separator />
          <FormEditArea area={area} />
        </div>
      </div>
    </div>
  );
}
