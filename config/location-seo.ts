/**
 * Optional copy for a single location page.
 *
 * The public area template builds one title, description and intro for every
 * city. The `areas` table stores a description in the dashboard, and that
 * field is not rendered on the public page. These overrides keep the clinic
 * count and clinic names dynamic, and they apply only to the slugs listed
 * here.
 */
export type LocationSeo = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  listingHeading: string;
  jsonLdName: string;
};

type NamedClinic = {
  name?: string | null;
};

export function listedClinicNames(clinics: NamedClinic[] | null | undefined, limit = 3) {
  const names: string[] = [];

  for (const clinic of clinics ?? []) {
    const name = clinic.name?.trim();
    if (!name || names.includes(name)) {
      continue;
    }
    names.push(name);
    if (names.length >= limit) {
      break;
    }
  }

  return names;
}

function joinNames(names: string[]) {
  if (names.length <= 1) {
    return names[0] ?? '';
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function kepongSeo(clinicCount: number, clinicNames: string[]): LocationSeo {
  const title =
    clinicCount > 0
      ? `${clinicCount} Skin Specialist & Aesthetic Clinics in Kepong, KL`
      : 'Skin Specialist & Aesthetic Clinics in Kepong, KL';
  const description =
    clinicCount > 0
      ? `Skin specialist Kepong: compare ${clinicCount} aesthetic clinics in Kepong, Kuala Lumpur. Read reviews, services and contact details, then confirm the doctor.`
      : 'Skin specialist Kepong: compare aesthetic clinics in Kepong, Kuala Lumpur. Read reviews, services and contact details, then confirm the doctor.';
  const listed =
    clinicCount === 1 ? '1 aesthetic clinic is listed' : `${clinicCount} aesthetic clinics are listed`;
  const nameSentence =
    clinicNames.length > 0
      ? ` Clinics on this page include ${joinNames(clinicNames)}.`
      : '';

  return {
    title,
    description,
    h1: 'Skin Specialist & Aesthetic Clinics in Kepong, Kuala Lumpur',
    intro: `Compare skin specialists and aesthetic clinics in Kepong, Kuala Lumpur. ${listed} in this directory.${nameSentence} Open a listing for services, reviews and contact details, then confirm the practitioner before you book.`,
    listingHeading: `${clinicCount} Aesthetic Clinics in Kepong, Kuala Lumpur`,
    jsonLdName: 'Skin Specialist and Aesthetic Clinics in Kepong, Kuala Lumpur',
  };
}

export function locationSeoOverride(input: {
  stateSlug: string;
  areaSlug: string;
  clinicCount: number;
  clinicNames?: string[];
}): LocationSeo | null {
  if (input.stateSlug === 'kuala-lumpur' && input.areaSlug === 'kepong') {
    return kepongSeo(input.clinicCount, input.clinicNames ?? []);
  }

  return null;
}
