import type { ComponentType } from 'react';

import dynamic from 'next/dynamic';

export const LazyAdsSquare: ComponentType = dynamic(() => import('./ads-square'));
