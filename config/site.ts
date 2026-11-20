import { SiteConfig } from '@/types';

import { absoluteUrl } from '@/lib/utils';

export const siteConfig: SiteConfig = {
  title: 'Aesthetic Clinics in Malaysia',
  description:
    'Browse aesthetic clinics in Malaysia by state and city. Compare listed services, reviews and contact details.',
  siteName: 'Aesthetic Clinics MY',
  url: new URL(absoluteUrl()),
  openGraph: {
    image: '/images/og-default.png',
    imageAlt: 'Banner for aestheticclinics.my',
    width: '1200',
    height: '630',
  },
  creator: '@swsalim',
};
