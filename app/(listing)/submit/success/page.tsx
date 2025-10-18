// app/submit/success/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import Stripe from 'stripe';

import { siteConfig } from '@/config/site';

import { ClinicSubmit } from '@/components/clinic-submit';

const config = {
  title: 'Thank you for your submission!',
  description:
    'We have received your submission and are processing your listing. You will be notified via email once your listing is live.',
  url: '/submit/success',
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
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SubmitSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; clinic_id?: string }>;
}) {
  const { session_id, clinic_id } = await searchParams;

  if (!session_id || !clinic_id) {
    redirect('/submit');
  }

  // Fetch the Stripe session to verify payment and get metadata
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  let session: Stripe.Checkout.Session | null = null;

  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch (error) {
    console.error('Failed to retrieve Stripe session:', error);
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <h1 className="mb-4 text-3xl font-bold text-red-600">Session Error</h1>
        <p className="mb-4">Unable to verify your payment session.</p>
        <p className="text-sm">
          Contact support at{' '}
          <a href="mailto:support@aestheticclinics.my" className="text-blue-600 hover:underline">
            support@aestheticclinics.my
          </a>{' '}
          if you need assistance.
        </p>
      </div>
    );
  }

  // Verify payment was successful
  if (session.payment_status !== 'paid') {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <h1 className="mb-4 text-3xl font-bold text-yellow-600">Payment Pending</h1>
        <p className="mb-4">Your payment is still being processed.</p>
        <p className="text-sm">
          Please check back in a few minutes or contact support if the issue persists.
        </p>
      </div>
    );
  }

  // Extract metadata from session
  const meta = session.metadata || {};

  // Validate that we have required data
  const canSubmit = Boolean(
    meta.clinic_name && meta.name && meta.email && clinic_id === meta.clinic_id, // Ensure clinic_id matches
  );

  if (!canSubmit) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <h1 className="mb-4 text-3xl font-bold text-red-600">Data Error</h1>
        <p className="mb-4">Missing required submission data.</p>
        <p className="text-sm">
          Contact support at{' '}
          <a href="mailto:support@aestheticclinics.my" className="text-blue-600 hover:underline">
            support@aestheticclinics.my
          </a>{' '}
          with your session ID: {session_id}
        </p>
      </div>
    );
  }

  // Pass session_id to component for polling/verification
  return (
    <ClinicSubmit meta={meta} canSubmit={canSubmit} clinic_id={clinic_id} session_id={session_id} />
  );
}
