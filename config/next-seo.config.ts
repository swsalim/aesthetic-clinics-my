interface SEOConfig {
  site_url: string;
  site_name: string;
  title: string;
  description: string;
  image: string;
  locale: string;
  lang: string;
  twitterHandle?: string;
}

export const seo: SEOConfig = {
  site_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
  site_name: 'aestheticclinics.my',
  title: 'Find Aesthetic Clinics Near You in Malaysia',
  description:
    'Explore top-rated aesthetic clinics across Malaysia. Search by location, compare services and reviews, and book your aesthetic appointment with ease.!',
  image: 'https://www.aestheticclinics.my/images/og-default.png',
  locale: 'en',
  lang: 'en',
  twitterHandle: '@aestheticclinicsmy',
};

export const config = {
  title: seo.title,
  defaultTitle: seo.title,
  titleTemplate: '%s  - AestheticClinics',
  description: seo.description,
  canonical: seo.site_url,
  openGraph: {
    type: 'website',
    url: seo.site_url,
    site_name: seo.site_name,
    title: seo.title,
    description: seo.description,
    locale: seo.locale,
    images: [
      {
        url: seo.image,
        width: 1200,
        height: 630,
        alt: seo.site_name,
      },
    ],
  },
  robotsProps: {
    nosnippet: false,
    notranslate: false,
    noimageindex: false,
    noarchive: false,
    maxSnippet: -1,
    maxImagePreview: 'large',
    maxVideoPreview: -1,
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1',
    },
    {
      name: 'theme-color',
      content: '#ffffff',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'default',
    },
  ],
  additionalLinkTags: [
    { rel: 'canonical', href: seo.site_url },
    // Performance optimization
    { rel: 'preconnect', href: '//airtable.com' },
    { rel: 'preconnect', href: '//api.mapbox.com' },
    { rel: 'preconnect', href: '//pagead2.googlesyndication.com' },
    { rel: 'preconnect', href: '//partner.googleadservices.com' },
    { rel: 'preconnect', href: '//fonts.googleapis.com' },
    { rel: 'preconnect', href: '//fonts.gstatic.com' },
    { rel: 'dns-prefetch', href: '//airtable.com' },
    { rel: 'dns-prefetch', href: '//api.mapbox.com' },
    { rel: 'dns-prefetch', href: '//pagead2.googlesyndication.com' },
    { rel: 'dns-prefetch', href: '//partner.googleadservices.com' },
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
    // Icons
    {
      rel: 'apple-touch-icon',
      sizes: '512x512',
      href: '/android-chrome-512x512.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '192x192',
      href: '/android-chrome-192x192.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    { rel: 'manifest', href: '/manifest.json' },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    // PWA
    {
      rel: 'mask-icon',
      href: '/safari-pinned-tab.svg',
      color: '#000000',
    },
  ],
};
