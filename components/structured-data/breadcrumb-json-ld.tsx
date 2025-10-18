import JsonLd from './json-ld';

interface BreadcrumbItem {
  position: string;
  item?: string;
  name?: string;
}

interface BreadcrumbJsonLdProps {
  itemListElements: BreadcrumbItem[];
}

export default function BreadcrumbJsonLd({ itemListElements }: BreadcrumbJsonLdProps) {
  const listElement = itemListElements.map((item) => ({
    '@type': 'ListItem',
    position: item.position,
    item: {
      '@id': item.item,
      name: item.name,
    },
  }));

  return (
    <JsonLd id="breadcrumb-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: listElement,
      }}
    </JsonLd>
  );
}
