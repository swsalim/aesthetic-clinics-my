'use client';

import { cn } from '@/lib/utils';

import { AD_PLACEHOLDER_CLASS, useAdViewport } from './use-ad-viewport';

type AdsSquareProps = {
  className?: string;
  /** Request immediately. Use next to an above-fold result. */
  eager?: boolean;
  /** Tighter margins when the unit sits directly under a tool on mobile. */
  variant?: 'default' | 'compact';
};

export default function AdsSquare({
  className,
  eager = false,
  variant = 'default',
}: AdsSquareProps) {
  const { ref, isInView, adFilled } = useAdViewport({ eager });

  return (
    <aside
      ref={ref}
      className={cn('w-full', variant === 'compact' ? 'my-4' : 'my-4 md:my-8', className)}
    >
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
            className="adsbygoogle block min-h-[250px] w-full"
            style={{ display: 'block', textAlign: 'center' }}
            data-ad-client="ca-pub-3799479098488751"
            data-ad-slot="8411804064"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="min-h-[250px] w-full" aria-hidden />
        )}
      </div>
    </aside>
  );
}
