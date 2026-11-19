import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/config/site';

import { absoluteUrl } from '@/lib/utils';

import { getChainBySlug, getChainGroups } from '@/helpers/chains';

import { ChainHub, chainCopy } from '@/components/listing/chain-hub';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import CollectionPageJsonLd from '@/components/structured-data/collection-page-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

export const revalidate = 86_400;
export const dynamicParams = true;

type ChainPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const chains = await getChainGroups();
  return chains.map((chain) => ({ slug: chain.slug }));
}

export async function generateMetadata({ params }: ChainPageProps): Promise<Metadata> {
  const { slug } = await params;
  const chain = await getChainBySlug(slug);
  if (!chain) notFound();

  const copy = chainCopy(chain);
  const url = absoluteUrl(`/chains/${chain.slug}`);

  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: url },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url,
      images: [
        {
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${encodeURIComponent(copy.title)}`),
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: copy.title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
  };
}

export default async function ChainPage({ params }: ChainPageProps) {
  const { slug } = await params;
  const chain = await getChainBySlug(slug);
  if (!chain) notFound();

  const copy = chainCopy(chain);

  return (
    <>
      <BreadcrumbJsonLd
        itemListElements={[
          { item: absoluteUrl('/'), name: 'Home', position: '1' },
          { item: absoluteUrl('/chains'), name: 'Chains', position: '2' },
          { item: absoluteUrl(`/chains/${chain.slug}`), name: chain.name, position: '3' },
        ]}
      />
      <CollectionPageJsonLd
        name={copy.h1}
        url={`/chains/${chain.slug}`}
        description={copy.description}
        clinics={chain.branches.slice(0, 20).map((branch) => ({
          slug: branch.slug,
          name: branch.name,
          address: branch.address,
          phone: branch.phone,
          postal_code: null,
          area: branch.areaName ? { name: branch.areaName } : null,
          state: branch.stateName ? { name: branch.stateName } : null,
        }))}
      />
      <Wrapper className="bg-gray-950">
        <Container>
          <div className="flex flex-col gap-4 py-12 md:py-20">
            <Breadcrumb
              theme="dark"
              items={[{ name: 'Chains', url: '/chains' }, { name: chain.name }]}
            />
            <h1 className="text-balance text-4xl font-black text-white">{copy.h1}</h1>
          </div>
        </Container>
      </Wrapper>
      <Wrapper size="sm">
        <Container>
          <ChainHub group={chain} />
        </Container>
      </Wrapper>
    </>
  );
}
