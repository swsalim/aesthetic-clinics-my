'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import { buttonVariants } from './ui/button';

export function ClinicSubmit({
  meta,
  canSubmit,
  clinic_id,
  session_id,
}: {
  meta: Record<string, string>;
  canSubmit: boolean;
  clinic_id?: string;
  session_id?: string;
}) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!canSubmit || !clinic_id || !session_id) {
      setStatus('error');
      return;
    }

    const checkStatus = async () => {
      try {
        const supabase = createClient();

        // Poll for status updates (webhook should update this)
        let attempts = 0;
        const maxAttempts = 10; // 30 seconds total (3s intervals)

        const pollStatus = async (): Promise<void> => {
          const { data: clinic, error } = await supabase
            .from('clinics')
            .select('*')
            .eq('id', clinic_id)
            .single();

          if (error) {
            throw new Error(error.message);
          }

          if (clinic.status === 'pending') {
            // Webhook has processed the payment
            setStatus('success');
            return;
          }

          if (clinic.status === 'pending_payment' && attempts < maxAttempts) {
            // Still waiting for webhook
            attempts++;
            setTimeout(pollStatus, 3000);
            return;
          }

          if (attempts >= maxAttempts) {
            // Webhook might have failed, but payment succeeded
            // Show success anyway and let admin handle manually
            setStatus('success');
            return;
          }
        };

        await pollStatus();
      } catch (error) {
        console.error('Error checking status:', error);
        setStatus('error');
      }
    };

    checkStatus();
  }, [canSubmit, clinic_id, session_id]);

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <h1 className="mb-4 text-3xl font-bold">Payment Successful!</h1>
        <p className="mb-4">Processing your clinic submission...</p>
        <p className="text-sm text-gray-600">This usually takes just a few seconds.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <h1 className="mb-4 text-3xl font-bold text-red-600">Something went wrong</h1>
        <p className="mb-4">
          Your payment was successful, but we encountered an issue processing your submission.
        </p>
        <p className="mb-4">
          Don t worry - you won t be charged again. Our team will review your submission manually.
        </p>
        <p className="text-sm">
          Contact us at{' '}
          <a href="mailto:support@aestheticclinics.my" className="text-blue-600 hover:underline">
            support@aestheticclinics.my
          </a>{' '}
          with your payment confirmation if you need immediate assistance.
        </p>
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <div className="mb-4 text-4xl">✅</div>
      <h1 className="mb-4 text-3xl font-bold text-green-600">Submission Complete!</h1>
      <p className="mb-6 text-lg">
        Thank you for your payment. Your clinic listing has been submitted for review.
      </p>

      <div className="mt-6 rounded-lg bg-green-50 p-6 text-left dark:bg-green-900/20">
        <h2 className="mb-4 text-lg font-semibold text-green-800 dark:text-green-200">
          What happens next?
        </h2>
        <ul className="mb-4 space-y-2 text-sm text-green-700 dark:text-green-300">
          <li>• Our team will review your listing within 24 hours</li>
          <li>• You&apos;ll receive an email confirmation when it goes live</li>
          <li>• Your listing will include a DoFollow backlink</li>
        </ul>

        <div className="border-t border-green-200 pt-4 dark:border-green-800">
          <h3 className="font-medium text-green-800 dark:text-green-200">Submission Details:</h3>
          <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
            <li>
              <strong>Name:</strong> {meta.name}
            </li>
            <li>
              <strong>Email:</strong> {meta.email}
            </li>
            <li>
              <strong>Clinic:</strong> {meta.clinic_name}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/" className={cn(buttonVariants({ variant: 'primary' }))}>
          Return to Home
        </Link>
      </div>
    </div>
  );
}
