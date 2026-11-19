import { Metadata } from 'next';
import Link from 'next/link';

import { absoluteUrl } from '@/lib/utils';

import { getChainGroups } from '@/helpers/chains';

import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

export const revalidate = 86_400;

export const metadata: Metadata = {
  title: 'Aesthetic clinic chains in Malaysia',
  description:
    'Branch lists for aesthetic clinic chains in Malaysia. Each hub is built from clinic names already in the directory.',
  alternates: {
    canonical: absoluteUrl('/chains'),
  },
};

export default async function ChainsPage() {
  const chains = await getChainGroups();

  return (
    <>
      <BreadcrumbJsonLd
        itemListElements={[
          { item: absoluteUrl('/'), name: 'Home', position: '1' },
          { item: absoluteUrl('/chains'), name: 'Chains', position: '2' },
        ]}
      />
      <Wrapper size="sm">
        <Container>
          <Breadcrumb items={[{ name: 'Chains' }]} />
          <h1 className="mt-4 text-balance text-4xl font-black">Aesthetic clinic chains in Malaysia</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-700 dark:text-gray-200">
            {chains.length > 0
              ? `${chains.length} chains are grouped from approved clinic listings. A chain page only includes branches that are already in this directory.`
              : 'No chain has two or more approved listings yet.'}
          </p>
          <ul className="mt-8 divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
            {chains.map((chain) => (
              <li key={chain.slug} className="px-4 py-4">
                <Link href={`/chains/${chain.slug}`} className="text-lg font-semibold" prefetch={false}>
                  {chain.name}
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {chain.branches.length} {chain.branches.length === 1 ? 'branch' : 'branches'} listed
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Wrapper>
    </>
  );
}
