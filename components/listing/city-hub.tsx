import Link from 'next/link';

import { CityHubCopy, CityHubFacts } from '@/lib/city-hub';

import JsonLd from '@/components/structured-data/json-ld';

type NearbyCity = {
  name: string;
  href: string;
};

type ChainLink = {
  name: string;
  href: string;
  count: number;
};

export function CityHub({
  copy,
  facts,
  city,
  state,
  nearby,
  chains,
}: {
  copy: CityHubCopy;
  facts: CityHubFacts;
  city: string;
  state: string;
  nearby: NearbyCity[];
  chains: ChainLink[];
}) {
  return (
    <div className="mb-10 flex flex-col gap-8">
      <JsonLd id="city-faq-jsonld">
        {{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: copy.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }}
      </JsonLd>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-950">
          <dt className="text-sm text-gray-500">Listed clinics</dt>
          <dd className="text-2xl font-black">{facts.clinicCount}</dd>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-950">
          <dt className="text-sm text-gray-500">Neighbourhoods</dt>
          <dd className="text-2xl font-black">{facts.neighborhoods.length}</dd>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-950">
          <dt className="text-sm text-gray-500">Recorded services</dt>
          <dd className="text-2xl font-black">{facts.services.length}</dd>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-950">
          <dt className="text-sm text-gray-500">Average rating</dt>
          <dd className="text-2xl font-black">
            {facts.ratingAverage != null ? facts.ratingAverage.toFixed(1) : '—'}
          </dd>
        </div>
      </dl>
      {facts.neighborhoods.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-bold">Filter listings in {city}</h2>
          <ul className="flex flex-wrap gap-2">
            <li>
              <a href="#city-listings" className="inline-block rounded-full border border-gray-300 px-3 py-1 text-sm">
                All {facts.clinicCount} listings
              </a>
            </li>
            {facts.neighborhoods.slice(0, 12).map((item) => (
              <li key={item.slug}>
                <a
                  href={`#neighbourhood-${item.slug}`}
                  className="inline-block rounded-full border border-gray-300 px-3 py-1 text-sm"
                >
                  {item.name} ({item.count})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {facts.services.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-bold">Services recorded on {city} listings</h2>
          <ul className="flex flex-col gap-2">
            {facts.services.map((service) => (
              <li key={service.slug} className="text-sm">
                <span className="font-semibold">{service.name}</span>
                <span className="text-gray-600 dark:text-gray-300">
                  {' '}
                  — {service.count} {service.count === 1 ? 'listing' : 'listings'}. Example:{' '}
                </span>
                <Link href={`/place/${service.exampleSlug}`} prefetch={false}>
                  {service.exampleName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {facts.clinics.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-bold">All listings in {city}</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {facts.clinics.map((clinic) => (
              <li key={clinic.slug} id={`clinic-${clinic.slug}`}>
                <Link href={`/place/${clinic.slug}`} prefetch={false}>
                  {clinic.name}
                </Link>
                {clinic.neighborhood ? (
                  <span className="text-gray-600 dark:text-gray-300"> · {clinic.neighborhood}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
      {chains.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-bold">Chains with a branch in {city}</h2>
          <ul className="flex flex-col gap-2">
            {chains.map((chain) => (
              <li key={chain.href}>
                <Link href={chain.href} prefetch={false}>
                  {chain.name}
                </Link>
                <span className="text-gray-600 dark:text-gray-300">
                  {' '}
                  · {chain.count} {chain.count === 1 ? 'branch' : 'branches'} listed
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {nearby.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-bold">Nearby cities in {state}</h2>
          <ul className="flex flex-wrap gap-2">
            {nearby.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block rounded-full border border-gray-300 px-3 py-1 text-sm"
                  prefetch={false}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h2 className="mb-3 text-xl font-bold">Questions about aesthetic clinics in {city}</h2>
        <div className="flex flex-col gap-3">
          {copy.faqs.map((faq) => (
            <details key={faq.question} className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700" open>
              <summary className="cursor-pointer font-semibold">{faq.question}</summary>
              <p className="mt-2 text-gray-700 dark:text-gray-200">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
