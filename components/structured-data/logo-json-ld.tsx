import JsonLd from './json-ld';

interface LogoJsonLdProps {
  url: string;
  logo: string;
}

export default function LogoJsonLd({ url, logo }: LogoJsonLdProps) {
  return (
    <JsonLd id="logo-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Aesthetic Clinics Malaysia',
        logo,
        url,
      }}
    </JsonLd>
  );
}
