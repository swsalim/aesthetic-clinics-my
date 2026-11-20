/**
 * Slugs in `states`, queried 20 Nov 2026. Used only to 301 `?page=` on a
 * state or state-doctor URL. A new state slug needs to be added here.
 * City, place, and reviews URLs are not in this list.
 */
export const STATE_SLUGS = [
  'johor',
  'kedah',
  'kelantan',
  'kuala-lumpur',
  'labuan',
  'malacca',
  'negeri-sembilan',
  'pahang',
  'penang',
  'perak',
  'perlis',
  'putrajaya',
  'sabah',
  'sarawak',
  'selangor',
  'terengganu',
] as const;

export const STATE_SLUG_SET = new Set<string>(STATE_SLUGS);
