import { slugify } from '@/lib/utils';

/**
 * There is no chain or brand column. Branches are grouped from clinic names.
 *
 * 1. Named rules cover the brands Search Console already shows as separate
 *    branch URLs (Dr Chong, Dr Ko, Aglow, MyClinic). A clinic joins a rule
 *    when its name matches. Nothing is added that is not in the clinic table.
 * 2. Remaining clinics are grouped only when at least three approved listings
 *    share the same leading name, after the clinic's own city and state words
 *    are removed. One-off and two-branch names stay on their place pages.
 */

export type ChainBranchInput = {
  name: string;
  slug: string;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  areaName?: string | null;
  areaSlug?: string | null;
  stateName?: string | null;
  stateSlug?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  phone?: string | null;
};

export type ChainGroup<T extends ChainBranchInput = ChainBranchInput> = {
  slug: string;
  name: string;
  source: 'named-rule' | 'shared-prefix';
  branches: T[];
};

const NAMED_RULES: Array<{ slug: string; name: string; pattern: RegExp }> = [
  { slug: 'dr-chong-clinic', name: 'Dr Chong Clinic', pattern: /\bdr\.?\s+chong\b/i },
  { slug: 'dr-ko-skin-specialist', name: 'Dr Ko Skin Specialist', pattern: /\bdr\.?\s+ko\b/i },
  { slug: 'aglow-clinic', name: 'Aglow Clinic', pattern: /\baglow\b/i },
  { slug: 'myclinic', name: 'MyClinic', pattern: /\bmyclinic\b|^my\s+clinic\b/i },
];

const GENERIC_TOKENS = new Set([
  'aesthetic',
  'aesthetics',
  'and',
  'beauty',
  'center',
  'centre',
  'clinic',
  'clinics',
  'dr',
  'klinik',
  'laser',
  'medical',
  'medispa',
  'skin',
  'specialist',
  'the',
]);

const MIN_PREFIX_BRANCHES = 3;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function locationTokens(branch: ChainBranchInput): Set<string> {
  const words = [branch.areaName, branch.city, branch.stateName, branch.neighborhood]
    .filter(Boolean)
    .join(' ');
  return new Set(normalizeName(words).split(' ').filter((token) => token.length > 2));
}

export function sharedPrefixKey(branch: ChainBranchInput): string | null {
  const tokens = normalizeName(branch.name).split(' ').filter(Boolean);
  const locations = locationTokens(branch);
  const kept: string[] = [];

  for (const token of tokens) {
    if (locations.has(token) && kept.length > 0) break;
    kept.push(token);
    if (kept.length >= 4) break;
  }

  while (kept.length > 0 && GENERIC_TOKENS.has(kept[kept.length - 1]!)) {
    kept.pop();
  }

  if (kept.length === 0) return null;
  if (GENERIC_TOKENS.has(kept[0]!)) return null;
  if (kept.length === 1 && kept[0]!.length < 4) return null;

  const key = kept.join(' ');
  if (key.length < 4) return null;
  return key;
}

function titleFromKey(key: string): string {
  return key
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function groupClinicChains<T extends ChainBranchInput>(branches: T[]): ChainGroup<T>[] {
  const claimed = new Set<string>();
  const groups: ChainGroup<T>[] = [];

  for (const rule of NAMED_RULES) {
    const matched = branches.filter((branch) => rule.pattern.test(branch.name));
    if (matched.length < 2) continue;
    matched.forEach((branch) => claimed.add(branch.slug));
    groups.push({
      slug: rule.slug,
      name: rule.name,
      source: 'named-rule',
      branches: sortBranches(matched),
    });
  }

  const prefixBuckets = new Map<string, T[]>();
  for (const branch of branches) {
    if (claimed.has(branch.slug)) continue;
    const key = sharedPrefixKey(branch);
    if (!key) continue;
    const bucket = prefixBuckets.get(key) ?? [];
    bucket.push(branch);
    prefixBuckets.set(key, bucket);
  }

  const usedSlugs = new Set(groups.map((group) => group.slug));

  for (const [key, bucket] of prefixBuckets) {
    if (bucket.length < MIN_PREFIX_BRANCHES) continue;
    let slug = slugify(key);
    if (!slug || usedSlugs.has(slug)) {
      slug = slugify(`${key}-branches`);
    }
    if (!slug || usedSlugs.has(slug)) continue;
    usedSlugs.add(slug);
    groups.push({
      slug,
      name: titleFromKey(key),
      source: 'shared-prefix',
      branches: sortBranches(bucket),
    });
  }

  return groups.sort((a, b) => b.branches.length - a.branches.length || a.name.localeCompare(b.name));
}

function sortBranches<T extends ChainBranchInput>(branches: T[]): T[] {
  return [...branches].sort((a, b) => {
    const state = (a.stateName ?? '').localeCompare(b.stateName ?? '');
    if (state !== 0) return state;
    const area = (a.areaName ?? '').localeCompare(b.areaName ?? '');
    if (area !== 0) return area;
    return a.name.localeCompare(b.name);
  });
}

export function chainStates<T extends ChainBranchInput>(group: ChainGroup<T>): string[] {
  const names = new Set<string>();
  for (const branch of group.branches) {
    if (branch.stateName) names.add(branch.stateName);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}
