import { absoluteUrl } from '@/lib/utils';

import JsonLd from './json-ld';

interface WebsiteJsonLdProps {
  name?: string;
}

export default function WebsiteJsonLd({ name = 'Aesthetic Clinics Malaysia' }: WebsiteJsonLdProps) {
  return (
    <JsonLd id="website-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url: absoluteUrl('/'),
        inLanguage: 'en-US',
        description:
          'Discover top aesthetic clinics across Malaysia. Compare services, reviews, and prices to find trusted doctors for your beauty and skincare needs.',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.aestheticclinic.my/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }}
    </JsonLd>
  );
}
