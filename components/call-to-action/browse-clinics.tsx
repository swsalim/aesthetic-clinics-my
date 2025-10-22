import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function BrowseClinics() {
  return (
    <div className="my-12 flex flex-col items-center justify-center gap-8 rounded-xl border-[1px] border-blue-400 bg-blue-100 p-6">
      <div className="not-prose mx-auto flex max-w-4xl flex-col items-center justify-center gap-3 rounded-xl">
        <h2 className="text-center text-xl font-black text-blue-800 md:text-4xl">
          Inspired by You. Perfected by Professionals.
        </h2>
        <p className="text-center text-lg font-medium text-blue-600">
          Browse top-rated LCP-certified aesthetic clinics and qualified aesthetic doctors in
          Malaysia with peace of mind.
        </p>
      </div>
      <div className="flex flex-col justify-center gap-4 md:flex-row">
        <Button variant="primary" className="rounded-full" asChild>
          <Link href="/browse" className="!text-white">
            Browse Clinics
          </Link>
        </Button>
        <Button variant="ghost" className="rounded-full">
          Contact Us
        </Button>
      </div>
    </div>
  );
}
