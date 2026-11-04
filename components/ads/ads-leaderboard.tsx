'use client';

import { cn } from '@/lib/utils';

import { AD_PLACEHOLDER_CLASS, useAdViewport } from './use-ad-viewport';

type AdsLeaderboardProps = {
  className?: string;
  /** Tighter margins when the ad sits in a sticky side rail beside the tool. */
  variant?: 'default' | 'rail';
};

export default function AdsLeaderboard({ className, variant = 'default' }: AdsLeaderboardProps) {
  const isRail = variant === 'rail';
  const { ref, isInView, adFilled } = useAdViewport({
    rootMargin: isRail ? '0px' : '250px',
    eager: isRail,
  });

  return (
    <aside
      ref={ref}
      className={cn(
        'w-full',
        variant === 'default' && 'my-4 md:my-8',
        variant === 'rail' && 'my-0',
        className,
      )}
    >
      <div className="mb-1 text-center text-[10px] font-medium uppercase leading-4 text-gray-500">
        Advertisement
      </div>

      <div
        className={cn(
          'mx-auto flex min-h-[90px] w-full max-w-[970px] items-center justify-center overflow-hidden rounded-lg',
          !adFilled && AD_PLACEHOLDER_CLASS,
        )}
      >
        {isInView ? (
          <ins
            className="adsbygoogle block min-h-[90px] w-full"
            style={{ display: 'block', textAlign: 'center' }}
            data-ad-client="ca-pub-3799479098488751"
            data-ad-slot="4134465948"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="min-h-[90px] w-full" aria-hidden />
        )}
      </div>
    </aside>
  );
}
