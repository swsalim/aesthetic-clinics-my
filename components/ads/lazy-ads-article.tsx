import type { ComponentType } from 'react';

import dynamic from 'next/dynamic';

export const LazyAdsArticle: ComponentType = dynamic(() => import('./ads-article'));
