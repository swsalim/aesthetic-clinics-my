import { absoluteUrl } from '@/lib/utils';

import JsonLd from './json-ld';

interface ArticleJsonLdProps {
  title: string;
  description: string;
  cover: string[];
  publishedAt: string;
  reviewedBy?: string;
}

export default function ArticleJsonLd({
  title,
  description,
  cover,
  publishedAt,
  reviewedBy = 'Yuyu',
}: ArticleJsonLdProps) {
  const image = cover.join('');

  return (
    <JsonLd id="article-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        datePublished: publishedAt,
        dateModified: publishedAt,
        image,
        author: [
          {
            '@type': 'Person',
            name: reviewedBy,
          },
        ],
        publisher: {
          '@type': 'Organization',
          name: 'Aesthetic Clinics Malaysia',
          logo: {
            '@type': 'ImageObject',
            url: absoluteUrl('/images/logo.png'),
          },
        },
      }}
    </JsonLd>
  );
}
