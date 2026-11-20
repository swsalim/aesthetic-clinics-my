import { Metadata } from 'next';

import StateScreen, { generateStateMetadata, generateStateStaticParams } from './screen';

type StatePageProps = {
  params: Promise<{
    state: string;
  }>;
};

export const revalidate = 86_400;
export const dynamicParams = true;

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  return generateStateMetadata({ params });
}

export async function generateStaticParams() {
  return generateStateStaticParams();
}

export default function StatePage({ params }: StatePageProps) {
  return <StateScreen params={params} />;
}
