import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/config/site';

import { createServerClient } from '@/lib/supabase';

import { getDashboardReview } from '@/helpers/reviews';

import { Separator } from '@/components/ui/separator';

import FormReview from '../../components/form-review';

const config = {
  title: 'Edit Review',
  description: 'Edit a clinic review',
  url: '/dashboard/reviews/edit/[id]',
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

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [review, clinicsResult] = await Promise.all([
    getDashboardReview(id),
    supabase.from('clinics').select('id, name, slug').order('name', { ascending: true }),
  ]);

  if (!review) {
    notFound();
  }

  return (
    <div className="flex flex-row gap-6">
      <div className="flex-1 lg:max-w-full">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">{review.author_name}</h3>
            <p className="text-sm text-gray-500">
              {review.clinic?.name
                ? `Review for ${review.clinic.name}`
                : 'Update this review and the clinic it belongs to.'}
            </p>
          </div>
          <Separator />
          <FormReview review={review} clinics={clinicsResult.data || []} />
        </div>
      </div>
    </div>
  );
}
