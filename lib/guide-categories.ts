export type GuideCategory = {
  id: string;
  title: string;
  description: string;
  slugs: string[];
};

/** Stable groups for the guides index, homepage, and footer. */
export const guideCategories: GuideCategory[] = [
  {
    id: 'finding-a-clinic',
    title: 'Finding a clinic',
    description: 'Compare a listing, an LCP, and a registered doctor before you book.',
    slugs: [
      'the-complete-guide-to-finding-an-aesthetic-clinic-in-malaysia',
      'how-to-compare-lcp-certified-aesthetic-clinics',
      'check-registered-medical-practitioner-malaysia',
      'skin-specialist-clinic-malaysia',
    ],
  },
  {
    id: 'injectables',
    title: 'Injectables',
    description: 'Botulinum toxin, dermal filler, lips, and nasolabial folds.',
    slugs: [
      'botox-clinics-how-to-compare-them',
      'dermal-filler-injections-malaysia',
      'juvederm-lip-filler-malaysia',
      'filler-nasolabial-folds',
    ],
  },
  {
    id: 'laser-and-pigment',
    title: 'Laser and pigment',
    description: 'Laser listings, pigmentation, acne scars, and melasma.',
    slugs: [
      'laser-treatment-malaysia',
      'laser-treatment-hyperpigmentation',
      'acne-scar-laser-treatment',
      'melasma-treatment-malaysia',
    ],
  },
  {
    id: 'skin-treatments',
    title: 'Skin treatments',
    description: 'Peels, microneedling, tightening, and other skin procedures.',
    slugs: [
      'microneedling-treatment-malaysia',
      'chemical-peel-treatment-malaysia',
      'dermaplane-treatment',
      'whitehead-removal',
      'non-invasive-skin-tightening-treatments',
      'face-lifting-treatment-malaysia',
    ],
  },
];

export function guideCategoryHref(id: string): string {
  return `/guides#${id}`;
}
