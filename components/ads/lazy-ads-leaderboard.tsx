import type { ComponentType } from 'react';

import dynamic from 'next/dynamic';

export const LazyAdsLeaderboard: ComponentType = dynamic(() => import('./ads-leaderboard'));
