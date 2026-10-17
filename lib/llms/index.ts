import { unstable_cache } from 'next/cache';

import { siteConfig } from '@/config/site';

import { getAllGuides } from '@/lib/guides';
import { joinSections, listItem, LLMS_REVALIDATE_SECONDS, mdUrl } from '@/lib/llms/format';
import {
  markdownAbout,
  markdownAdvertise,
  markdownArea,
  markdownBrowse,
  markdownClinic,
  markdownClinicReviews,
  markdownDoctor,
  markdownDoctors,
  markdownGuide,
  markdownGuides,
  markdownHome,
  markdownState,
  markdownStateDoctors,
  markdownSubmit,
} from '@/lib/llms/pages';
import { absoluteUrl } from '@/lib/utils';

import { getStateListings } from '@/helpers/states';

export { LLMS_REVALIDATE_SECONDS, llmsTextResponse, mdUrl } from '@/lib/llms/format';

const RESERVED = new Set([
  'browse',
  'doctors',
  'doctor',
  'guides',
  'submit',
  'advertise-with-us',
  'about',
  'place',
  'index',
  'dashboard',
  'login',
  'api',
]);

async function buildLlmsIndex() {
  const [states, guides] = await Promise.all([getStateListings(), Promise.resolve(getAllGuides())]);
  const sortedStates = states
    .filter((state) => state.clinic_count > 0)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return joinSections([
    `# ${siteConfig.siteName}`,
    `> ${siteConfig.description}`,
    'This file is a menu of Markdown pages for AI agents. Append `.md` to any public listing URL for a token-efficient version of that page (homepage: `/index.md`). Clinic pages live at `/place/{slug}.md`; doctor pages at `/doctor/{slug}.md`.',
    '## Pages',
    [
      listItem('Home', mdUrl('/'), 'Directory of aesthetic clinics in Malaysia'),
      listItem(
        'Browse by location',
        mdUrl('/browse'),
        'States and cities with aesthetic clinic listings',
      ),
      listItem('Doctors', mdUrl('/doctors'), 'Aesthetic doctors practising in Malaysia'),
      listItem('About', mdUrl('/about'), 'What this directory covers'),
      listItem(
        'Guides',
        mdUrl('/guides'),
        'How to compare aesthetic clinics, check an LCP, and read a botulinum toxin listing',
      ),
      listItem(
        'Full content',
        absoluteUrl('/llms-full.txt'),
        'Concatenated Markdown of hub pages (home, browse, doctors, about, submit, advertise)',
      ),
    ].join('\n'),
    '## States',
    sortedStates.length
      ? sortedStates
          .map((state) =>
            listItem(
              `Aesthetic clinics in ${state.name}`,
              mdUrl(`/${state.slug}`),
              `${state.clinic_count.toLocaleString('en-MY')} clinics, plus cities and doctors in ${state.name}`,
            ),
          )
          .join('\n')
      : '- No state listings yet.',
    '## Guides',
    guides.length
      ? guides
          .map((guide) => listItem(guide.title, mdUrl(`/guides/${guide.slug}`), guide.description))
          .join('\n')
      : '- No guides yet.',
    '## Optional',
    [
      listItem('List your clinic', mdUrl('/submit'), 'Free clinic listing form'),
      listItem(
        'Advertise with us',
        mdUrl('/advertise-with-us'),
        'Featured placement and pricing for clinic owners',
      ),
    ].join('\n'),
  ]);
}

async function buildLlmsFull() {
  const [home, browse, doctors, about] = await Promise.all([
    markdownHome(),
    markdownBrowse(),
    markdownDoctors(),
    Promise.resolve(markdownAbout()),
  ]);

  return [home, browse, doctors, about, markdownSubmit(), markdownAdvertise()].join('\n\n---\n\n');
}

export const getLlmsIndex = unstable_cache(buildLlmsIndex, ['llms-index-v2'], {
  revalidate: LLMS_REVALIDATE_SECONDS,
  tags: ['clinics', 'states', 'areas', 'doctors'],
});

export const getLlmsFull = unstable_cache(buildLlmsFull, ['llms-full-v1'], {
  revalidate: LLMS_REVALIDATE_SECONDS,
  tags: ['clinics', 'states', 'areas', 'doctors'],
});

export async function getPageMarkdown(slug: string[]): Promise<string | null> {
  const segments = slug.filter(Boolean);

  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'index')) {
    return markdownHome();
  }

  const [first, second, third] = segments;

  if (segments.length === 1) {
    switch (first) {
      case 'browse':
        return markdownBrowse();
      case 'doctors':
        return markdownDoctors();
      case 'submit':
        return markdownSubmit();
      case 'advertise-with-us':
        return markdownAdvertise();
      case 'about':
        return markdownAbout();
      case 'guides':
        return markdownGuides();
      default:
        if (RESERVED.has(first)) {
          return null;
        }
        return markdownState(first);
    }
  }

  if (first === 'guides' && second && segments.length === 2) {
    return markdownGuide(second);
  }

  if (first === 'place' && second && segments.length === 2) {
    return markdownClinic(second);
  }

  if (first === 'place' && second && third === 'reviews' && segments.length === 3) {
    return markdownClinicReviews(second);
  }

  if (first === 'doctor' && second && segments.length === 2) {
    return markdownDoctor(second);
  }

  if (second === 'doctors' && segments.length === 2 && !RESERVED.has(first)) {
    return markdownStateDoctors(first);
  }

  if (segments.length === 2 && !RESERVED.has(first)) {
    return markdownArea(first, second);
  }

  return null;
}
