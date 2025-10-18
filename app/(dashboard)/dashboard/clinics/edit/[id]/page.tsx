import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ClinicArea, ClinicService, ClinicServiceRelation, ClinicState } from '@/types/clinic';

import { siteConfig } from '@/config/site';

import { createClient } from '@/lib/supabase/server';

import { Separator } from '@/components/ui/separator';

// import { SidebarNav } from '@/components/ui/sidebar-nav';
import FormEditClinic from '../../components/form-edit-clinic';

const config = {
  title: 'Edit Clinic Detail',
  description: 'Edit a clinic detail',
  url: '/dashboard/clinics/edit',
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

export default async function EditClinicPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*, images:clinic_images(id,image_url, imagekit_file_id)')
    .match({ id })
    .single();

  if (!clinic) {
    notFound();
  }

  // const sidebarNavItems = [
  //   {
  //     title: 'Profile',
  //     href: `/dashboard/clinics/edit/${id}`,
  //   },
  //   {
  //     title: 'Location',
  //     href: `/dashboard/clinics/edit/location/${id}`,
  //   },
  //   {
  //     title: 'Social',
  //     href: `/dashboard/clinics/edit/social/${id}`,
  //   },
  //   {
  //     title: 'Images',
  //     href: `/dashboard/clinics/edit/images/${id}`,
  //   },
  // ];

  const [
    { data: servicesData },
    { data: servicesRelationsData },
    { data: statesData },
    { data: areasData },
    { data: hoursData },
  ] = await Promise.all([
    supabase.from('clinic_services').select('*', { count: 'exact' }),
    supabase.from('clinic_service_relations').select('*', { count: 'exact' }).eq('clinic_id', id),
    supabase.from('states').select('*', { count: 'exact' }),
    supabase.from('areas').select('*', { count: 'exact' }),
    supabase.from('clinic_hours').select('*', { count: 'exact' }).eq('clinic_id', id),
  ]);

  // Ensure we have arrays even if data is null
  const services = (servicesData || []) as ClinicService[];
  const servicesRelations = (servicesRelationsData || []) as ClinicServiceRelation[];
  const states = (statesData || []) as ClinicState[];
  const areas = (areasData || []) as ClinicArea[];
  const hours = hoursData || [];

  return (
    <div className="flex flex-row gap-6">
      <div className="flex-1 lg:max-w-full">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">{clinic.name}</h3>
            <p className="text-sm text-gray-500">
              This is how others will see this listing on the site.
            </p>
          </div>
          <Separator />
          <FormEditClinic
            clinic={clinic}
            services={services}
            areas={areas}
            states={states}
            hours={hours}
            selectedServices={servicesRelations}
          />
        </div>
      </div>
    </div>
  );
}
