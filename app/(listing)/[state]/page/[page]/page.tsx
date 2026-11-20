import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import StateScreen, { generateStateMetadata } from '../../screen';

type StatePagedProps = {
  params: Promise<{
    state: string;
    page: string;
  }>;
};

export const revalidate = 86_400;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: StatePagedProps): Promise<Metadata> {
  const resolved = await params;
  const page = Number(resolved.page);
  if (!Number.isInteger(page) || page < 2) {
    return {};
  }
  return generateStateMetadata({ params });
}

export default async function StatePagedPage({ params }: StatePagedProps) {
  const { state, page } = await params;
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    notFound();
  }
  if (pageNumber === 1) {
    redirect(`/${state}`);
  }
  return <StateScreen params={params} />;
}
