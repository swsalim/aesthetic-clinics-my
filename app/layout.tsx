import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import { siteConfig } from '@/config/site';

import { cn } from '@/lib/utils';

import Footer from '@/components/site/footer';
import NavMobile from '@/components/site/nav-mobile';
import Navbar from '@/components/site/navbar';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import { Toaster } from '@/components/ui/toaster';

import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.siteName}`,
  },
  description: siteConfig.description,
  metadataBase: siteConfig.url,
  alternates: {
    canonical: '/',
  },
  authors: [
    {
      name: 'Yuyu',
      url: 'https://www.yuurrific.com',
    },
  ],
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: siteConfig.openGraph.image,
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: siteConfig.openGraph.imageAlt,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/icons/favicon-32x32.png',
    shortcut: '/icons/apple-touch-icon.png',
    apple: '/icons/apple-touch-icon.png',
  },
  twitter: {
    title: siteConfig.title,
    description: siteConfig.description,
    card: 'summary_large_image',
    creator: siteConfig.creator,
    images: [siteConfig.openGraph.image],
  },
  robots: {
    index: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" crossOrigin="" />
        <link rel="preconnect" href="https://analytics.ahrefs.com" />
        <link rel="preconnect" href="https://app.tinyadz.com" />
        <link rel="dns-prefetch" href="//www.google.com" />
        <link rel="dns-prefetch" href="//www.gstatic.com" />
        <link rel="dns-prefetch" href="//securepubads.g.doubleclick.net" />
        <script
          src="https://beamanalytics.b-cdn.net/beam.min.js"
          data-token="c2fbac7b-0b09-48f0-b925-7a5a61de2a3b"
          async></script>
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="oV+XGa0KW37ngKhI81Btzg"
          async></script>
        <script
          src="https://stats.aestheticclinics.my/ennui.js"
          data-api-host="https://stats.aestheticclinics.my"
          data-token="585a559b585c0c6"
          async></script>
      </head>
      <body
        className={cn(
          'flex min-h-screen flex-col font-sans antialiased dark:bg-gray-900 dark:text-gray-100',
          plusJakartaSans.variable,
        )}
        suppressHydrationWarning>
        <WebsiteJsonLd />
        <NavMobile />
        <Navbar />
        <main className="flex grow flex-col justify-center">{children}</main>
        <Footer />
        <Toaster />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3799479098488751"
          crossOrigin="anonymous"></script>
        <script
          src="https://cdn.apitiny.net/scripts/v2.0/main.js"
          data-site-id="6835de6cc1d791d83e38d6d1"
          async></script>
      </body>
    </html>
  );
}
