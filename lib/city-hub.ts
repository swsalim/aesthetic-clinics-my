export type CityHubClinic = {
  name: string;
  slug: string;
  neighborhood?: string | null;
  city?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
};

export type CityHubService = {
  name: string;
  slug: string;
  count: number;
  exampleSlug: string;
  exampleName: string;
};

export type CityHubNeighborhood = {
  name: string;
  slug: string;
  count: number;
};

export type CityHubFacts = {
  clinicCount: number;
  clinics: CityHubClinic[];
  neighborhoods: CityHubNeighborhood[];
  services: CityHubService[];
  ratedCount: number;
  ratingAverage: number | null;
  skinSpecialistNames: string[];
};

export type CityHubFaq = {
  question: string;
  answer: string;
};

export type CityHubCopy = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  listingHeading: string;
  jsonLdName: string;
  faqs: CityHubFaq[];
};

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function slugifyLabel(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildCityHubFacts(clinics: CityHubClinic[], serviceRows: Array<{
  clinicSlug: string;
  clinicName: string;
  serviceName: string;
  serviceSlug: string;
}>): CityHubFacts {
  const neighborhoods = new Map<string, CityHubNeighborhood>();
  let ratingTotal = 0;
  let ratedCount = 0;
  const skinSpecialistNames: string[] = [];

  for (const clinic of clinics) {
    const label = clinic.neighborhood?.trim() || clinic.city?.trim();
    if (label) {
      const slug = slugifyLabel(label);
      const existing = neighborhoods.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        neighborhoods.set(slug, { name: label, slug, count: 1 });
      }
    }

    if (typeof clinic.rating === 'number' && clinic.rating > 0) {
      ratingTotal += clinic.rating;
      ratedCount += 1;
    }

    if (/\b(skin specialist|dermatolog)/i.test(clinic.name) && skinSpecialistNames.length < 8) {
      skinSpecialistNames.push(clinic.name);
    }
  }

  const services = new Map<string, CityHubService>();
  for (const row of serviceRows) {
    if (!row.serviceSlug || !row.serviceName) continue;
    const existing = services.get(row.serviceSlug);
    if (existing) {
      existing.count += 1;
    } else {
      services.set(row.serviceSlug, {
        name: row.serviceName,
        slug: row.serviceSlug,
        count: 1,
        exampleSlug: row.clinicSlug,
        exampleName: row.clinicName,
      });
    }
  }

  return {
    clinicCount: clinics.length,
    clinics,
    neighborhoods: [...neighborhoods.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    services: [...services.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 12),
    ratedCount,
    ratingAverage: ratedCount > 0 ? Math.round((ratingTotal / ratedCount) * 10) / 10 : null,
    skinSpecialistNames,
  };
}

export function buildCityHubCopy(input: {
  city: string;
  state: string;
  facts: CityHubFacts;
  nearbyNames: string[];
}): CityHubCopy {
  const { city, state, facts } = input;
  const count = facts.clinicCount;
  const countLabel = count === 1 ? '1 aesthetic clinic' : `${count} aesthetic clinics`;
  const h1 = `Aesthetic Clinics and Skin Specialists in ${city}`;
  const title =
    count > 0
      ? `${count} Aesthetic Clinics in ${city}, ${state}`
      : `Aesthetic Clinics in ${city}, ${state}`;

  const sample = facts.clinics
    .map((clinic) => clinic.name)
    .filter(Boolean)
    .slice(0, 3);
  const sampleSentence =
    sample.length > 0 ? ` Listings include ${joinList(sample)}.` : '';

  const description =
    count > 0
      ? `Aesthetic clinic and skin specialist options in ${city}, ${state}: ${countLabel} are listed here.${sampleSentence} Compare the recorded services, reviews and contact details.`
      : `Aesthetic clinics in ${city}, ${state}. No approved clinics are listed for this city yet.`;

  const intro =
    count > 0
      ? `This page lists ${countLabel} in ${city}, ${state}.${sampleSentence} Counts, names, neighbourhoods and services below come from those listings.`
      : `No approved aesthetic clinics are listed in ${city}, ${state} yet.`;

  const faqs: CityHubFaq[] = [
    {
      question: `How many aesthetic clinics in ${city} are listed?`,
      answer:
        count === 0
          ? `None. This directory does not currently list an approved aesthetic clinic in ${city}, ${state}.`
          : `${countLabel} in ${city}, ${state} ${count === 1 ? 'is' : 'are'} listed on this page.`,
    },
  ];

  if (sample.length > 0) {
    const extra = count - sample.length;
    faqs.push({
      question: `Which aesthetic clinics in ${city} are listed?`,
      answer:
        extra > 0
          ? `${joinList(sample)}, plus ${extra} more ${extra === 1 ? 'listing' : 'listings'} on this page.`
          : `${joinList(facts.clinics.map((clinic) => clinic.name))} ${count === 1 ? 'is' : 'are'} listed in ${city}.`,
    });
  }

  if (facts.skinSpecialistNames.length > 0) {
    faqs.push({
      question: `Is there a skin specialist clinic in ${city}?`,
      answer: `These listings in ${city} use “skin specialist” or “dermatolog” in the clinic name: ${joinList(facts.skinSpecialistNames)}.`,
    });
  } else if (count > 0) {
    faqs.push({
      question: `Is there a skin specialist clinic in ${city}?`,
      answer: `None of the ${count} clinic names listed in ${city} include “skin specialist” or “dermatolog”. The page still lists the aesthetic clinics recorded for ${city}, ${state}.`,
    });
  }

  if (facts.neighborhoods.length > 0) {
    const top = facts.neighborhoods.slice(0, 5).map((item) => `${item.name} (${item.count})`);
    faqs.push({
      question: `Which neighbourhoods in ${city} have aesthetic clinics?`,
      answer: `Listings in ${city} include ${joinList(top)}.`,
    });
  }

  if (facts.services.length > 0) {
    const top = facts.services.slice(0, 6).map((service) => `${service.name} (${service.count})`);
    faqs.push({
      question: `What services are recorded for clinics in ${city}?`,
      answer: `Services attached to listings in ${city}: ${joinList(top)}. A service is counted only when it is stored on that clinic. It is not shown here just because a description mentions it.`,
    });
  }

  if (facts.ratingAverage != null && facts.ratedCount > 0) {
    faqs.push({
      question: `What ratings do the ${city} listings have?`,
      answer: `${facts.ratedCount} of ${count} listings in ${city} have a rating. Their average is ${facts.ratingAverage.toFixed(1)}. Clinics without a rating are left out of that average.`,
    });
  }

  if (input.nearbyNames.length > 0) {
    faqs.push({
      question: `Which nearby cities can I compare with ${city}?`,
      answer: `Other cities listed in ${state} include ${joinList(input.nearbyNames.slice(0, 6))}.`,
    });
  }

  return {
    title,
    description,
    h1,
    intro,
    listingHeading: `${count} aesthetic clinics in ${city}, ${state}`,
    jsonLdName: `Aesthetic clinics and skin specialists in ${city}, ${state}`,
    faqs,
  };
}
