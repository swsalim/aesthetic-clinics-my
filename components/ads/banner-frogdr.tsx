import { ArrowUpRightIcon } from 'lucide-react';

import { ImageCloudinary } from '@/components/image/image-cloudinary';

export default function BannerFrogDr() {
  return (
    <a
      href="https://frogdr.com/?via=pfpresizer"
      target="_blank"
      className="relative flex items-center px-6 py-4 text-left transition-all duration-150 ease-in-out md:flex-row"
      rel="noreferrer"
      aria-label="Visit FrogDR to grow your website domain authority">
      <div className="flex flex-row items-center gap-x-4">
        <div className="flex flex-row items-center gap-x-4">
          <div className="mb-3 hidden w-12 sm:block md:mb-0 md:py-3">
            <div className="relative h-10 w-10">
              <ImageCloudinary
                src="frogdr.png"
                directory="logos"
                width={150}
                height={150}
                alt="FrogDR🔍"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="">
            <span className="mt-0 block text-base font-medium text-yellow-800">
              Want to grow your website domain authority? 🔍
            </span>
            <span className="block text-sm text-yellow-700">
              FrogDR helps you tracking and growing your Domain Rating. Get more backlinks, improve
              your SEO and increase your Domain Authority.
            </span>
            <div className="mt-2 inline-block rounded-md bg-yellow-600 px-2 py-1 text-xs font-medium uppercase text-yellow-100">
              Featured
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-md bg-yellow-200/50 p-3">
            <ArrowUpRightIcon className="h-4 w-4 text-yellow-700" />
          </div>
        </div>
      </div>
    </a>
  );
}
