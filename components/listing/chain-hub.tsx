import Link from 'next/link';

import { ChainGroup, chainStates } from '@/lib/chains';

import JsonLd from '@/components/structured-data/json-ld';

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function chainCopy(group: ChainGroup) {
  const count = group.branches.length;
  const states = chainStates(group);
  const branchWord = count === 1 ? 'branch' : 'branches';
  const stateSentence =
    states.length > 0 ? ` across ${joinList(states)}` : '';
  const title = `${group.name} branches in Malaysia`;
  const description = `${count} ${group.name} ${branchWord} are listed on Aesthetic Clinics MY${stateSentence}. Each branch links to its own clinic page.`;
  const intro = `This page lists every ${group.name} branch in the directory: ${count} ${branchWord}${stateSentence}. Branches are grouped from clinic names already in the database. Addresses and ratings are the values stored on each listing.`;

  const cities = [
    ...new Set(group.branches.map((branch) => branch.areaName).filter((name): name is string => Boolean(name))),
  ].sort((a, b) => a.localeCompare(b));

  const faqs = [
    {
      question: `How many ${group.name} branches are listed?`,
      answer: `${count} ${group.name} ${branchWord} ${count === 1 ? 'is' : 'are'} listed${stateSentence}.`,
    },
    {
      question: `Which cities list ${group.name}?`,
      answer:
        cities.length > 0
          ? `${group.name} listings are in ${joinList(cities.slice(0, 12))}${cities.length > 12 ? `, and ${cities.length - 12} more` : ''}.`
          : `City names are not stored on these ${group.name} listings.`,
    },
  ];

  return { title, description, h1: title, intro, faqs, count, states };
}

export function ChainHub({ group }: { group: ChainGroup }) {
  const copy = chainCopy(group);
  const byState = new Map<string, ChainGroup['branches']>();

  for (const branch of group.branches) {
    const key = branch.stateName || 'Other';
    const list = byState.get(key) ?? [];
    list.push(branch);
    byState.set(key, list);
  }

  return (
    <div className="flex flex-col gap-8">
      <JsonLd id="chain-faq-jsonld">
        {{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: copy.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }}
      </JsonLd>
      <p className="max-w-3xl text-lg text-gray-700 dark:text-gray-200">{copy.intro}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {copy.count} branches
        {copy.states.length > 0 ? ` · ${copy.states.length} ${copy.states.length === 1 ? 'state' : 'states'}` : ''}
        {group.source === 'named-rule'
          ? ' · grouped by brand name'
          : ' · grouped because these listings share the same opening name'}
      </p>
      {[...byState.entries()].map(([stateName, branches]) => (
        <section key={stateName}>
          <h2 className="mb-3 text-xl font-bold">
            {group.name} in {stateName}
          </h2>
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
            {branches.map((branch) => {
              const place = [branch.areaName, branch.stateName].filter(Boolean).join(', ');
              return (
                <li key={branch.slug} className="px-4 py-3">
                  <Link href={`/place/${branch.slug}`} className="font-semibold" prefetch={false}>
                    {branch.name}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {[place, branch.address, branch.phone].filter(Boolean).join(' · ')}
                    {typeof branch.rating === 'number' && branch.rating > 0
                      ? ` · ${branch.rating.toFixed(1)} rating`
                      : ''}
                  </p>
                  {branch.stateSlug && branch.areaSlug ? (
                    <p className="text-sm">
                      <Link href={`/${branch.stateSlug}/${branch.areaSlug}`} prefetch={false}>
                        Aesthetic clinics in {branch.areaName}
                      </Link>
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <div>
        <h2 className="mb-3 text-xl font-bold">Questions about {group.name}</h2>
        <div className="flex flex-col gap-3">
          {copy.faqs.map((faq) => (
            <details key={faq.question} className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700" open>
              <summary className="cursor-pointer font-semibold">{faq.question}</summary>
              <p className="mt-2">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
