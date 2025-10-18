import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/config/site';

import { createServerClient } from '@/lib/supabase';

import { DOCTOR_WITH_CLINICS_SELECT, transformDoctorData } from '@/helpers/doctors';

// Remove unused import
import { Separator } from '@/components/ui/separator';

import FormEditDoctor from '../../components/form-edit-doctor';

const config = {
  title: 'Edit Doctor Detail',
  description: 'Edit a doctor detail',
  url: '/dashboard/doctors/edit/[id]',
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

export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [{ data: doctorData }, { data: clinicsData }] = await Promise.all([
    supabase.from('clinic_doctors').select(DOCTOR_WITH_CLINICS_SELECT).match({ id }).single(),
    supabase.from('clinics').select('id, name, slug'),
  ]);

  if (!doctorData) {
    notFound();
  }

  const doctor = transformDoctorData(doctorData);

  return (
    <div className="flex flex-row gap-6">
      <div className="flex-1 lg:max-w-full">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">{doctor.name}</h3>
            <p className="text-sm text-gray-500">
              This is how others will see this listing on the site.
            </p>
          </div>
          <Separator />
          <FormEditDoctor doctor={doctor} clinics={clinicsData || []} />
        </div>
      </div>
    </div>
  );
}
