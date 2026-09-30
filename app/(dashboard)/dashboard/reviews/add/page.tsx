import { Metadata } from 'next';

import { siteConfig } from '@/config/site';

import { createServerClient } from '@/lib/supabase';

import { Separator } from '@/components/ui/separator';

import FormReview from '../components/form-review';

const config = {
  title: 'Add Review',
  description: 'Add a clinic review',
  url: '/dashboard/reviews/add',
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

export default async function AddReviewPage() {
  const supabase = await createServerClient();
  const { data: clinicsData } = await supabase
    .from('clinics')
    .select('id, name, slug')
    .order('name', { ascending: true });

  return (
    <div className="flex flex-row gap-6">
      <div className="flex-1 lg:max-w-full">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Add review</h3>
            <p className="text-sm text-gray-500">
              Create a review and attach it to a clinic. Approved reviews show on the clinic page.
            </p>
          </div>
          <Separator />
          <FormReview clinics={clinicsData || []} />
        </div>
      </div>
    </div>
  );
}
