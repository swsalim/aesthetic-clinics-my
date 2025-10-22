import { getServerSideSitemap } from 'next-sitemap';

import { absoluteUrl } from '@/lib/utils';

import { getAreaListings } from '@/helpers/areas';
import { getClinicListings } from '@/helpers/clinics';
// import { getDoctorListings } from '@/helpers/doctors';
// import { getAllServices } from '@/helpers/services';
import { getStateListings } from '@/helpers/states';

interface SitemapEntry {
  loc: string;
  lastmod: string;
}

export async function GET() {
  const states = await getStateListings();
  const areas = await getAreaListings();
  const clinics = await getClinicListings();
  // const doctors = await getDoctorListings();
  // const services = await getAllServices();

  const fields: SitemapEntry[] = [];

  clinics.forEach((clinic) => {
    fields.push({
      loc: absoluteUrl(`/place/${clinic.slug}`),
      lastmod: new Date().toISOString(),
    });
    fields.push({
      loc: absoluteUrl(`/place/${clinic.slug}/reviews`),
      lastmod: new Date().toISOString(),
    });
  });

  states.forEach((state) => {
    fields.push({
      loc: absoluteUrl(`/${state.slug}`),
      lastmod: new Date().toISOString(),
    });
    fields.push({
      loc: absoluteUrl(`/${state.slug}/dentists`),
      lastmod: new Date().toISOString(),
    });
  });

  areas.forEach((area) => {
    fields.push({
      loc: absoluteUrl(`/${area.state.slug}/${area.slug}`),
      lastmod: new Date().toISOString(),
    });
  });

  // TODO: add doctors and services
  // doctors.forEach((doctor) => {
  //   fields.push({
  //     loc: absoluteUrl(`/dentist/${doctor.slug}`),
  //     lastmod: new Date().toISOString(),
  //   });
  // });

  // services.forEach((service) => {
  //   fields.push({
  //     loc: absoluteUrl(`/services/${service.slug}`),
  //     lastmod: new Date().toISOString(),
  //   });
  // });

  // Add static pages
  // const staticPages = ['/', '/browse', '/dentists', '/submit'];
  const staticPages = ['/', '/browse', '/about'];

  staticPages.forEach((page) => {
    fields.push({
      loc: absoluteUrl(page),
      lastmod: new Date().toISOString(),
    });
  });

  return getServerSideSitemap([...fields]);
}
