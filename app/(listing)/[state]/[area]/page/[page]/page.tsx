import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import AreaScreen, { generateAreaMetadata } from '../../screen';

type AreaPagedProps = {
  params: Promise<{
    state: string;
    area: string;
    page: string;
  }>;
};

export const revalidate = 86_400;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: AreaPagedProps): Promise<Metadata> {
  const resolved = await params;
  const page = Number(resolved.page);
  if (!Number.isInteger(page) || page < 2) {
    return {};
  }
  return generateAreaMetadata({ params });
}

export default async function AreaPagedPage({ params }: AreaPagedProps) {
  const { state, area, page } = await params;
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    notFound();
  }
  if (pageNumber === 1) {
    redirect(`/${state}/${area}`);
  }
  return <AreaScreen params={params} />;
}
