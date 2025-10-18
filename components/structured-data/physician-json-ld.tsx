import JsonLd from './json-ld';

interface Location {
  area: string;
  state: string;
  country: string;
  postal_code: string;
  address: string;
}

interface Coordinate {
  lat: number;
  long: number;
}

interface Clinic {
  name: string;
  url: string;
}

interface DentistJsonLdProps {
  name: string;
  photo: string;
  clinic: Clinic;
  specialty: string;
  url: string;
  location: Location;
  coordinate: Coordinate;
  phone: string | undefined | null;
  email: string | undefined | null;
}

export default function DentistJsonLd({
  name,
  photo,
  clinic,
  specialty,
  url,
  location,
  coordinate,
  phone,
  email,
}: DentistJsonLdProps) {
  return (
    <JsonLd id="dentist-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': 'Dentist',
        name,
        image: photo,
        url,
        priceRange: '$$',
        paymentAccepted: 'Cash, Credit Cards, PayNow',
        telephone: phone,
        email,
        smokingAllowed: false,
        memberOf: {
          '@type': 'MedicalOrganization',
          '@id': clinic.url,
          name: clinic.name,
          address: {
            '@type': 'PostalAddress',
            addressLocality: location.area,
            addressRegion: location.state,
            postalCode: location.postal_code,
            streetAddress: location.address,
            addressCountry: {
              '@type': 'Country',
              name: location.country,
            },
          },
          url: clinic.url,
        },
        medicalSpecialty: {
          '@type': 'MedicalSpecialty',
          name: specialty,
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: location.area,
          addressRegion: location.state,
          postalCode: location.postal_code,
          streetAddress: location.address,
          addressCountry: {
            '@type': 'Country',
            name: location.country,
          },
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: coordinate.lat,
          longitude: coordinate.long,
        },
      }}
    </JsonLd>
  );
}
