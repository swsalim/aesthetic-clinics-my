import { Clinic } from '@/types/clinic';

import { absoluteUrl } from '@/lib/utils';

import JsonLd from './json-ld';

interface CollectionPageJsonLdProps {
  name: string;
  url: string;
  description: string;
  clinics: Partial<Clinic>[];
}

export default function CollectionPageJsonLd({
  name,
  url,
  description,
  clinics,
}: CollectionPageJsonLdProps) {
  const itemListElements = clinics.map((clinic, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'MedicalBusiness',
      url: absoluteUrl(`/place/${clinic.slug}`),
      name: clinic.name,
      image: absoluteUrl(`/api/og?title=${clinic.name}`),
      address: {
        '@type': 'PostalAddress',
        addressLocality: clinic.area?.name,
        addressRegion: clinic.state?.name,
        postalCode: clinic.postal_code,
        streetAddress: clinic.address,
        addressCountry: 'MY',
      },
      telephone: clinic.phone,
    },
  }));

  return (
    <JsonLd id="collection-page-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        url: absoluteUrl(url),
        inLanguage: 'en-US',
        description,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: itemListElements,
        },
      }}
    </JsonLd>
  );
}
