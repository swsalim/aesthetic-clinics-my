import { getServerSideSitemap, type ISitemapField } from 'next-sitemap';

import { absoluteUrl } from '@/lib/utils';

import { getAreaListings } from '@/helpers/areas';
import { getClinicListings } from '@/helpers/clinics';
import { getDoctorListings } from '@/helpers/doctors';
import { getStateListings } from '@/helpers/states';

export const revalidate = 86_400;

function toLastmod(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

function latest(values: Array<string | null | undefined>): string | undefined {
  let max = 0;

  for (const value of values) {
    const iso = toLastmod(value);
    if (!iso) {
      continue;
    }
    const time = new Date(iso).getTime();
    if (time > max) {
      max = time;
    }
  }

  return max ? new Date(max).toISOString() : undefined;
}

function entry(path: string, lastmod?: string): ISitemapField {
  return lastmod ? { loc: absoluteUrl(path), lastmod } : { loc: absoluteUrl(path) };
}

export async function GET() {
  const [states, areas, clinics, doctors] = await Promise.all([
    getStateListings(),
    getAreaListings(),
    getClinicListings(),
    getDoctorListings(),
  ]);

  const indexableStates = states.filter((state) => state.clinic_count > 0);
  const indexableAreas = areas.filter(
    (area) => area.clinic_count > 0 && indexableStates.some((state) => state.slug === area.state.slug),
  );

  const contentLastmod = latest([
    ...clinics.map((clinic) => clinic.modified_at),
    ...doctors.map((doctor) => doctor.modified_at),
    ...states.map((state) => state.modified_at),
    ...areas.map((area) => area.modified_at),
  ]);

  const fields: ISitemapField[] = [];

  clinics.forEach((clinic) => {
    fields.push(entry(`/place/${clinic.slug}`, toLastmod(clinic.modified_at) ?? contentLastmod));
  });

  indexableStates.forEach((state) => {
    const lastmod = toLastmod(state.modified_at) ?? contentLastmod;
    fields.push(entry(`/${state.slug}`, lastmod));
    fields.push(entry(`/${state.slug}/doctors`, lastmod));
  });

  indexableAreas.forEach((area) => {
    fields.push(
      entry(`/${area.state.slug}/${area.slug}`, toLastmod(area.modified_at) ?? contentLastmod),
    );
  });

  doctors.forEach((doctor) => {
    fields.push(entry(`/doctor/${doctor.slug}`, toLastmod(doctor.modified_at) ?? contentLastmod));
  });

  const staticPages = ['/', '/browse', '/about', '/doctors', '/advertise-with-us', '/submit'];

  staticPages.forEach((page) => {
    fields.push(entry(page, contentLastmod));
  });

  const sitemap = await getServerSideSitemap(fields);
  sitemap.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  return sitemap;
}
