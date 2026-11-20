import { Metadata } from 'next';

import { siteConfig } from '@/config/site';

import { absoluteUrl } from '@/lib/utils';

import { getHeroStats, Hero } from '@/components/hero';
import { ExploreStates } from '@/components/listing/explore-states';
import { FeaturedClinics } from '@/components/listing/featured-clinics';
import { GuidesStrip } from '@/components/listing/guides-strip';
import { HomeAnswers } from '@/components/listing/home-answers';
import { RecentClinics } from '@/components/listing/recent-clinics';
import LogoJsonLd from '@/components/structured-data/logo-json-ld';

export async function generateMetadata(): Promise<Metadata> {
  const { clinicCount } = await getHeroStats();
  const title =
    clinicCount > 0
      ? `Aesthetic Clinics in Malaysia: ${clinicCount.toLocaleString('en-MY')} Clinics by State & City`
      : siteConfig.title;

  return {
    title: { absolute: title },
    description: siteConfig.description,
    alternates: { canonical: '/' },
    openGraph: {
      title,
      description: siteConfig.description,
      url: siteConfig.url,
    },
    twitter: {
      title,
      description: siteConfig.description,
    },
  };
}

export default function Home() {
  return (
    <>
      <LogoJsonLd logo={absoluteUrl('/images/logo.png')} url={absoluteUrl('/')} />
      <Hero />
      <FeaturedClinics />
      <ExploreStates />
      <HomeAnswers />
      <GuidesStrip />
      <RecentClinics />
    </>
  );
}
