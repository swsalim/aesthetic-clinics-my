'use client';

import { cn } from '@/lib/utils';

import { AD_PLACEHOLDER_CLASS, useAdViewport } from './use-ad-viewport';

export default function AdsArticle() {
  const { ref, isInView, adFilled } = useAdViewport();

  return (
    <aside ref={ref} className="my-4 w-full md:my-8">
      <div className="mb-1 text-center text-[10px] font-medium uppercase leading-4 text-gray-500">
        Advertisement
      </div>

      <div
        className={cn(
          'mx-auto flex min-h-[250px] w-full items-center justify-center overflow-hidden rounded-lg',
          !adFilled && AD_PLACEHOLDER_CLASS,
        )}
      >
        {isInView ? (
          <ins
            className="adsbygoogle block min-h-[250px] w-full max-w-full"
            style={{ display: 'block', textAlign: 'center' }}
            data-ad-layout="in-article"
            data-ad-format="fluid"
            data-ad-client="ca-pub-3799479098488751"
            data-ad-slot="1923127772"
          />
        ) : (
          <div className="min-h-[250px] w-full" aria-hidden />
        )}
      </div>
    </aside>
  );
}
