import JsonLd from './json-ld';

interface WebPageJsonLdProps {
  id: string;
  description: string;
  lastReviewed?: string | undefined;
  reviewedBy: string | undefined;
}

export default function WebPageJsonLd({
  id,
  description,
  lastReviewed,
  reviewedBy = 'Aesthetic Clinics Malaysia',
}: WebPageJsonLdProps) {
  return (
    <JsonLd id="webpage-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': id,
        description,
        ...(lastReviewed && { lastReviewed }),
        reviewedBy: {
          '@type': 'Person',
          name: reviewedBy,
        },
      }}
    </JsonLd>
  );
}
