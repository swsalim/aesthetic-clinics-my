import { Clinic, ClinicDetails } from '@/types/clinic';

import { siteConfig } from '@/config/site';

import {
  escapeMd,
  formatHours,
  htmlToText,
  joinSections,
  listItem,
  mdUrl,
} from '@/lib/llms/format';
import { absoluteUrl } from '@/lib/utils';

import { getAreaBySlug, getAreaListings } from '@/helpers/areas';
import { getClinicBySlug, getClinicListings } from '@/helpers/clinics';
import { getDoctorBySlug, getDoctorListings, getDoctorsByState } from '@/helpers/doctors';
import { getStateBySlug, getStateListings } from '@/helpers/states';

const LIST_LIMIT = 500;

function clinicLocation(clinic: Partial<Clinic> | ClinicDetails) {
  const area =
    clinic.area && typeof clinic.area === 'object' && 'name' in clinic.area
      ? clinic.area.name
      : undefined;
  const state =
    clinic.state && typeof clinic.state === 'object' && 'name' in clinic.state
      ? clinic.state.name
      : undefined;

  return [area, state].filter(Boolean).join(', ');
}

function clinicNote(clinic: Partial<Clinic>) {
  const parts = [clinicLocation(clinic)];

  if (typeof clinic.rating === 'number' && clinic.rating > 0) {
    parts.push(`${clinic.rating.toFixed(1)} rating`);
  }

  return parts.filter(Boolean).join(' · ') || undefined;
}

export async function markdownHome() {
  const [states, clinics, doctors] = await Promise.all([
    getStateListings(),
    getClinicListings(),
    getDoctorListings(),
  ]);

  const statesWithClinics = states.filter((state) => state.clinic_count > 0);
  const clinicCount = clinics.length;
  const statsLine = [
    clinicCount > 0 ? `${clinicCount.toLocaleString('en-MY')} listed clinics` : null,
    statesWithClinics.length > 0
      ? `${statesWithClinics.length.toLocaleString('en-MY')} states`
      : null,
    doctors.length > 0 ? `${doctors.length.toLocaleString('en-MY')} doctors` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return joinSections([
    `# ${siteConfig.siteName}`,
    `> ${siteConfig.description}`,
    statsLine
      ? `${statsLine}. Compare reviews, hours, and contact details near you.`
      : 'Compare reviews, hours, and contact details for aesthetic clinics in Malaysia.',
    '## Browse',
    [
      listItem('Browse by location', mdUrl('/browse'), 'Aesthetic clinics grouped by state and city'),
      listItem('Doctors', mdUrl('/doctors'), 'Aesthetic doctors practising in Malaysia'),
      listItem('About', mdUrl('/about'), 'What this directory covers'),
    ].join('\n'),
    '## States',
    statesWithClinics.length
      ? statesWithClinics
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((state) =>
            listItem(
              `Aesthetic clinics in ${state.name}`,
              mdUrl(`/${state.slug}`),
              `${state.clinic_count.toLocaleString('en-MY')} clinics`,
            ),
          )
          .join('\n')
      : '- No state listings yet.',
    '## For clinic owners',
    [
      listItem(
        'List your clinic',
        mdUrl('/submit'),
        'Free clinic listing form on aestheticclinics.my',
      ),
      listItem(
        'Advertise with us',
        mdUrl('/advertise-with-us'),
        'Featured placement for aesthetic clinics',
      ),
    ].join('\n'),
    `HTML version: ${absoluteUrl('/')}`,
  ]);
}

export async function markdownBrowse() {
  const [states, areas, clinics] = await Promise.all([
    getStateListings(),
    getAreaListings(),
    getClinicListings(),
  ]);

  const statesWithClinics = states.filter((state) => state.clinic_count > 0);
  const areasByState = new Map<string, typeof areas>();

  for (const area of areas) {
    if (area.clinic_count < 1) {
      continue;
    }
    const list = areasByState.get(area.state.slug) ?? [];
    list.push(area);
    areasByState.set(area.state.slug, list);
  }

  const stateSections = statesWithClinics
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((state) => {
      const stateAreas = (areasByState.get(state.slug) ?? [])
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name));
      const areaLines =
        stateAreas.length > 0
          ? stateAreas
              .map((area) =>
                listItem(
                  area.name,
                  mdUrl(`/${state.slug}/${area.slug}`),
                  `${area.clinic_count.toLocaleString('en-MY')} clinics in ${area.name}, ${state.name}`,
                ),
              )
              .join('\n')
          : '- No city pages with clinics yet.';

      return `### ${escapeMd(state.name)}\n\n${listItem(`All clinics in ${state.name}`, mdUrl(`/${state.slug}`), `${state.clinic_count.toLocaleString('en-MY')} clinics`)}\n${areaLines}`;
    });

  return joinSections([
    '# Browse aesthetic clinics in Malaysia by location',
    `> Browse ${clinics.length.toLocaleString('en-MY')} aesthetic clinics across ${statesWithClinics.length} states. Compare reviews, services, and opening hours.`,
    'Use a state or city page to find clinics near you. Each linked file is a Markdown version of the listing page.',
    '## States and cities',
    stateSections.join('\n\n') || '- No locations with clinics yet.',
    `HTML version: ${absoluteUrl('/browse')}`,
  ]);
}

export async function markdownDoctors() {
  const doctors = await getDoctorListings();
  const sorted = doctors.slice().sort((a, b) => a.name.localeCompare(b.name));

  return joinSections([
    `# Browse ${sorted.length} aesthetic doctors in Malaysia`,
    '> Find aesthetic doctors across Malaysia. Browse by state, city, or clinic to find a doctor near you.',
    '## Doctors',
    sorted.length > 0
      ? sorted.map((doctor) => listItem(doctor.name, mdUrl(`/doctor/${doctor.slug}`))).join('\n')
      : '- No doctor profiles yet.',
    `HTML version: ${absoluteUrl('/doctors')}`,
  ]);
}

export function markdownSubmit() {
  return joinSections([
    '# List your clinic | Reach more patients in Malaysia',
    '> Promote your aesthetic clinic on Malaysia’s directory. Submit your listing on aestheticclinics.my for free and connect with nearby patients.',
    'Submit your clinic for free and get exposure to patients searching for aesthetic care near them.',
    `HTML form: ${absoluteUrl('/submit')}`,
  ]);
}

export function markdownAdvertise() {
  return joinSections([
    '# Grow your aesthetic clinic with us',
    "> Join Malaysia's trusted aesthetic clinic directory. Get featured listings to grow your practice with premium placement options.",
    '## Why list with us',
    [
      '- Boost visibility in local “aesthetic clinic near me” searches',
      '- Verified listings, reviews, and a professionally presented profile',
      '- Authoritative citations and backlinks for SEO',
      '- Cost-effective packages — one new patient can cover ad spend',
      '- Dedicated local support',
    ].join('\n'),
    '## Plans',
    [
      '### Featured — RM 59/month or RM 565/year',
      'Priority placement in your selected city or area, featured badge, ad-free profile, do-follow backlink, and 1 promotional image.',
      '### Featured Plus — RM 89/month or RM 855/year',
      'Everything in Featured, plus up to 5 promotional images and rotation in the homepage Featured Clinics section.',
      '### Featured Partner — RM 149/month or RM 1,430/year',
      'Everything in Featured Plus, plus large rotating homepage hero placement and a Featured Partner badge.',
    ].join('\n\n'),
    'Questions: [hello@aestheticclinics.my](mailto:hello@aestheticclinics.my?subject=Advertise%20With%20Us%20Enquiry)',
    `HTML version: ${absoluteUrl('/advertise-with-us')}`,
  ]);
}

export function markdownAbout() {
  return joinSections([
    '# About AestheticClinics.my',
    '> AestheticClinics.my helps Malaysians discover trusted aesthetic and cosmetic clinics. Find certified professionals offering safe, effective, and evidence-based treatments in one directory.',
    'The directory lists LCP-certified aesthetic clinics and aesthetic doctors, with contact details, treatments, doctor credentials, and customer reviews where those are available.',
    'Clinics are listed across Malaysia, including Kuala Lumpur, Johor Bahru, Penang, Ipoh, and Kota Kinabalu.',
    `HTML version: ${absoluteUrl('/about')}`,
  ]);
}

export async function markdownState(stateSlug: string) {
  const [stateData, doctorsResult] = await Promise.all([
    getStateBySlug(stateSlug, 0, LIST_LIMIT - 1),
    getDoctorsByState(stateSlug, 1, 0),
  ]);

  if (!stateData) {
    return null;
  }

  const totalClinics = stateData.total_clinics ?? stateData.clinics?.length ?? 0;
  const areas = (stateData.areas ?? []).filter((area) => area.slug && area.name);
  const nearbyAreas = areas
    .slice(0, 3)
    .map((area) => area.name)
    .join(', ');

  return joinSections([
    totalClinics > 0
      ? `# ${totalClinics} aesthetic clinics in ${stateData.name}`
      : `# Aesthetic clinics in ${stateData.name}`,
    `> Explore ${totalClinics} trusted aesthetic clinics${nearbyAreas ? ` across cities like ${nearbyAreas}` : ''} in ${stateData.name}. Find services, reviews, and opening hours.`,
    doctorsResult.count
      ? listItem(
          `Doctors in ${stateData.name}`,
          mdUrl(`/${stateSlug}/doctors`),
          `${doctorsResult.count} doctor profiles`,
        )
      : null,
    areas.length > 0
      ? joinSections([
          '## Cities',
          areas
            .slice()
            .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
            .map((area) =>
              listItem(
                area.name as string,
                mdUrl(`/${stateSlug}/${area.slug}`),
                `Aesthetic clinics in ${area.name}, ${stateData.name}`,
              ),
            )
            .join('\n'),
        ])
      : null,
    joinSections([
      '## Clinics',
      stateData.clinics?.length
        ? stateData.clinics
            .filter((clinic) => clinic.slug && clinic.name)
            .map((clinic) =>
              listItem(clinic.name as string, mdUrl(`/place/${clinic.slug}`), clinicNote(clinic)),
            )
            .join('\n')
        : '- No approved clinics yet.',
    ]),
    `HTML version: ${absoluteUrl(`/${stateSlug}`)}`,
  ]);
}

export async function markdownStateDoctors(stateSlug: string) {
  const [stateData, doctorsResult] = await Promise.all([
    getStateBySlug(stateSlug, 0, 0),
    getDoctorsByState(stateSlug, LIST_LIMIT, 0),
  ]);

  if (!stateData) {
    return null;
  }

  const doctors = doctorsResult.data ?? [];

  return joinSections([
    `# Aesthetic doctors in ${stateData.name}`,
    `> Find aesthetic doctors practising in ${stateData.name}, Malaysia.`,
    listItem(`Aesthetic clinics in ${stateData.name}`, mdUrl(`/${stateSlug}`)),
    '## Doctors',
    doctors.length > 0
      ? doctors
          .map((doctor) => {
            const clinic = doctor.clinics?.[0];
            const note = [clinic?.area?.name, clinic?.name].filter(Boolean).join(' · ');
            return listItem(doctor.name, mdUrl(`/doctor/${doctor.slug}`), note || undefined);
          })
          .join('\n')
      : '- No doctor profiles yet.',
    `HTML version: ${absoluteUrl(`/${stateSlug}/doctors`)}`,
  ]);
}

export async function markdownArea(stateSlug: string, areaSlug: string) {
  const areaData = await getAreaBySlug(areaSlug, 0, LIST_LIMIT - 1, stateSlug);

  if (!areaData || areaData.state?.slug !== stateSlug) {
    return null;
  }

  const stateName = areaData.state.name ?? stateSlug;
  const total = areaData.total_clinics ?? 0;

  return joinSections([
    total > 0
      ? `# ${total} aesthetic clinics in ${areaData.name}, ${stateName}`
      : `# Aesthetic clinics in ${areaData.name}, ${stateName}`,
    `> Explore ${total} trusted aesthetic clinics located in ${areaData.name}, ${stateName}. Find services, reviews, and opening hours.`,
    listItem(`All clinics in ${stateName}`, mdUrl(`/${stateSlug}`)),
    '## Clinics',
    areaData.clinics?.length
      ? areaData.clinics
          .filter((clinic) => clinic.slug && clinic.name)
          .map((clinic) =>
            listItem(clinic.name as string, mdUrl(`/place/${clinic.slug}`), clinicNote(clinic)),
          )
          .join('\n')
      : '- No approved clinics yet.',
    `HTML version: ${absoluteUrl(`/${stateSlug}/${areaSlug}`)}`,
  ]);
}

function clinicAddress(clinic: ClinicDetails) {
  return [
    clinic.address,
    clinic.neighborhood,
    [clinic.postal_code, clinic.area?.name].filter(Boolean).join(' '),
    clinic.state?.name,
    'Malaysia',
  ]
    .filter(Boolean)
    .join(', ');
}

export async function markdownClinic(clinicSlug: string) {
  const clinic = await getClinicBySlug(clinicSlug);

  if (!clinic) {
    return null;
  }

  const location = clinicLocation(clinic);
  const facts = [
    clinicAddress(clinic) ? `- Address: ${clinicAddress(clinic)}` : null,
    clinic.phone ? `- Phone: ${clinic.phone}` : null,
    clinic.email ? `- Email: ${clinic.email}` : null,
    clinic.website ? `- Website: ${clinic.website}` : null,
    clinic.rating
      ? `- Rating: ${clinic.rating.toFixed(1)}${clinic.review_count ? ` (${clinic.review_count} reviews)` : ''}`
      : null,
    clinic.is_permanently_closed ? '- Status: Permanently closed' : null,
    clinic.is_featured ? '- Featured listing' : null,
  ].filter(Boolean);

  const hours = formatHours(clinic.hours);
  const reviews = (clinic.reviews ?? [])
    .filter((review) => review.author_name)
    .map((review) => {
      const rating = review.rating ? ` (${review.rating}/5)` : '';
      const text = htmlToText(review.text);
      return `- ${escapeMd(review.author_name as string)}${rating}${text ? `: ${text}` : ''}`;
    });

  const serviceNames = (clinic.services ?? [])
    .map((service) => service.name)
    .filter((name): name is string => Boolean(name));

  return joinSections([
    `# ${clinic.name}`,
    `> Learn more about ${clinic.name}, an aesthetic clinic located in ${location || 'Malaysia'}. View services, hours, and contact info.`,
    facts.length > 0 ? facts.join('\n') : null,
    clinic.state?.slug && clinic.area?.slug
      ? listItem(
          `More clinics in ${clinic.area.name}`,
          mdUrl(`/${clinic.state.slug}/${clinic.area.slug}`),
        )
      : null,
    htmlToText(clinic.description)
      ? joinSections(['## About', htmlToText(clinic.description)])
      : null,
    serviceNames.length ? joinSections(['## Services', serviceNames.map((name) => `- ${name}`).join('\n')]) : null,
    clinic.doctors?.length
      ? joinSections([
          '## Doctors',
          clinic.doctors
            .filter((doctor) => doctor.name && doctor.slug)
            .map((doctor) => {
              const note = [doctor.specialty, doctor.qualification].filter(Boolean).join(' · ');
              return listItem(
                doctor.name as string,
                mdUrl(`/doctor/${doctor.slug}`),
                note || undefined,
              );
            })
            .join('\n'),
        ])
      : null,
    hours.length > 0 ? joinSections(['## Opening hours', hours.join('\n')]) : null,
    reviews.length > 0
      ? joinSections([
          '## Reviews',
          reviews.join('\n'),
          listItem('All reviews', mdUrl(`/place/${clinicSlug}/reviews`)),
        ])
      : listItem('Reviews', mdUrl(`/place/${clinicSlug}/reviews`)),
    `HTML version: ${absoluteUrl(`/place/${clinicSlug}`)}`,
  ]);
}

export async function markdownClinicReviews(clinicSlug: string) {
  const clinic = await getClinicBySlug(clinicSlug);

  if (!clinic) {
    return null;
  }

  const reviews = (clinic.reviews ?? [])
    .filter((review) => review.author_name)
    .map((review) => {
      const rating = review.rating ? `${review.rating}/5` : 'unrated';
      const text = htmlToText(review.text);
      return `### ${escapeMd(review.author_name as string)} — ${rating}\n\n${text || 'No written comment.'}`;
    });

  return joinSections([
    `# Reviews for ${clinic.name}`,
    `> Read reviews and ratings for ${clinic.name}, an aesthetic clinic located in ${clinic.area?.name ?? ''}, ${clinic.state?.name ?? ''}.`,
    listItem(clinic.name, mdUrl(`/place/${clinicSlug}`), 'Clinic profile'),
    clinic.rating
      ? `Average rating: ${clinic.rating.toFixed(1)}${clinic.review_count ? ` from ${clinic.review_count} reviews` : ''}.`
      : null,
    reviews.length > 0 ? reviews.join('\n\n') : 'No reviews yet.',
    `HTML version: ${absoluteUrl(`/place/${clinicSlug}/reviews`)}`,
  ]);
}

export async function markdownDoctor(slug: string) {
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    return null;
  }

  const clinic = doctor.clinics?.[0];
  const location = [clinic?.area?.name, clinic?.state?.name].filter(Boolean).join(', ');

  return joinSections([
    `# ${doctor.name}`,
    `> Learn more about ${doctor.name}, an aesthetic doctor based in ${location || 'Malaysia'}. View clinic location and contact details.`,
    [
      doctor.specialty ? `- Specialty: ${doctor.specialty}` : null,
      doctor.qualification ? `- Qualification: ${doctor.qualification}` : null,
    ]
      .filter(Boolean)
      .join('\n') || null,
    htmlToText(doctor.bio) ? joinSections(['## About', htmlToText(doctor.bio)]) : null,
    doctor.clinics?.length
      ? joinSections([
          '## Clinics',
          doctor.clinics
            .filter((item) => item?.slug && item.name)
            .map((item) => {
              const note = [item.area?.name, item.state?.name, item.phone].filter(Boolean).join(' · ');
              return listItem(item.name, mdUrl(`/place/${item.slug}`), note || undefined);
            })
            .join('\n'),
        ])
      : null,
    `HTML version: ${absoluteUrl(`/doctor/${slug}`)}`,
  ]);
}
