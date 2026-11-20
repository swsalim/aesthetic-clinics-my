import { siteConfig } from '@/config/site';

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
        description: siteConfig.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.aestheticclinic.my/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }}
    </JsonLd>
  );
}
