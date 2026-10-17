import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'That page is not on Aesthetic Clinics MY.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: null,
  },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-24">
      <h1 className="text-3xl font-black">Page not found</h1>
      <p className="text-lg">That page is not on Aesthetic Clinics MY.</p>
      <Link href="/" className="font-semibold text-blue-700">
        Back to the homepage
      </Link>
    </div>
  );
}
