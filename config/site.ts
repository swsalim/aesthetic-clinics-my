import { SiteConfig } from '@/types';

import { absoluteUrl } from '@/lib/utils';

export const siteConfig: SiteConfig = {
  title: 'Find Top Aesthetic Clinics in Malaysia | Compare, Review & Book with Ease',
  description:
    'Discover the best aesthetic clinics in Malaysia. Browse verified clinic listings, read trusted reviews, and compare treatments. Your journey to better skin and beauty starts here.',
  siteName: 'Aesthetic Clinics',
  url: new URL(absoluteUrl()),
  openGraph: {
    image: '/images/og-default.png',
    imageAlt: 'Banner for aestheticclinics.com',
    width: '1200',
    height: '630',
  },
  creator: '@swsalim',
};
