import JsonLd from './json-ld';

interface WebPageJsonLdProps {
  id: string;
  description: string;
  lastReviewed: string;
  reviewedBy: string | undefined;
}

export default function WebPageJsonLd({
  id,
  description,
  lastReviewed = new Date().toISOString(),
  reviewedBy = 'Aesthetic Clinics Malaysia',
}: WebPageJsonLdProps) {
  return (
    <JsonLd id="webpage-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': id,
        description,
        lastReviewed,
        reviewedBy: {
          '@type': 'Person',
          name: reviewedBy,
        },
      }}
    </JsonLd>
  );
}
