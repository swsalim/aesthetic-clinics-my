import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/config/site';

import { createClient } from '@/lib/supabase/server';

import { Separator } from '@/components/ui/separator';
import { SidebarNav } from '@/components/ui/sidebar-nav';

import FormEditState from '../../components/form-edit-state';

const config = {
  title: 'Edit State Detail',
  description: 'Edit a state detail',
  url: '/dashboard/states/edit',
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

export default async function EditStatePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: state } = await supabase
    .from('states')
    .select(
      'id, name, slug, short_description, description, image, imagekit_file_id, created_at, modified_at, clinics:clinics(id, name, slug, description, postal_code, address, phone, neighborhood, city, website, email, latitude, longitude, location, place_id, rating, review_count, is_active, is_featured, is_permanently_closed, open_on_public_holidays, images:clinic_images(id,image_url, imagekit_file_id), source, facebook_url, instagram_url, featured_video, youtube_url, area_id, state_id, status)',
    )
    .match({ id })
    .single();

  console.log('state');
  console.log(state);

  if (!state) {
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
            <h3 className="text-lg font-medium">{state.name}</h3>
            <p className="text-sm text-gray-500">
              This is how others will see this listing on the site.
            </p>
          </div>
          <Separator />
          <FormEditState state={state} />
        </div>
      </div>
    </div>
  );
}
