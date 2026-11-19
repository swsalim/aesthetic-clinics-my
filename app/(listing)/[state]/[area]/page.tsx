import { Metadata } from 'next';

import { getAreaListings } from '@/helpers/areas';

import AreaScreen, { generateAreaMetadata } from './screen';

type AreaPageProps = {
  params: Promise<{
    state: string;
    area: string;
  }>;
};

export const revalidate = 86_400;
export const dynamicParams = true;

export async function generateMetadata({ params }: AreaPageProps): Promise<Metadata> {
  return generateAreaMetadata({ params });
}

export async function generateStaticParams() {
  const areas = await getAreaListings();

  return areas.map((area) => ({
    state: area.state?.slug,
    area: area.slug,
  }));
}

export default function AreaPage({ params }: AreaPageProps) {
  return <AreaScreen params={params} />;
}
