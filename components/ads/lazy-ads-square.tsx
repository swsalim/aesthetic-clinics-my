import type { ComponentType } from 'react';

import dynamic from 'next/dynamic';

type AdsSquareProps = {
  className?: string;
  eager?: boolean;
  variant?: 'default' | 'compact';
};

export const LazyAdsSquare: ComponentType<AdsSquareProps> = dynamic(() => import('./ads-square'));
