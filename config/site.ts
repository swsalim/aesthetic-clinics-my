import { SiteConfig } from '@/types';

import { absoluteUrl } from '@/lib/utils';

export const siteConfig: SiteConfig = {
  title: 'Find the Best Aesthetic Clinics in Malaysia | Aesthetic Clinic MY',
  description:
    'Discover top aesthetic clinics across Malaysia. Compare services, reviews, and prices to find trusted doctors for your beauty and skincare needs.',
  siteName: 'Aesthetic ClinicsY',
  url: new URL(absoluteUrl()),
  openGraph: {
    image: '/images/og-default.png',
    imageAlt: 'Banner for aestheticclinics.my',
    width: '1200',
    height: '630',
  },
  creator: '@swsalim',
};
