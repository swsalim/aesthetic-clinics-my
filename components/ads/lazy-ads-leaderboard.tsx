import type { ComponentType } from 'react';

import dynamic from 'next/dynamic';

type AdsLeaderboardProps = {
  className?: string;
  variant?: 'default' | 'rail';
};

export const LazyAdsLeaderboard: ComponentType<AdsLeaderboardProps> = dynamic(
  () => import('./ads-leaderboard'),
);
