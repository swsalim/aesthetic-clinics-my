import { unstable_cache } from 'next/cache';

import { ChainBranchInput, ChainGroup, groupClinicChains } from '@/lib/chains';
import { hasAdminCredentials } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase';

type ChainRow = {
  name: string;
  slug: string;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  phone: string | null;
  rating: number | null;
  review_count: number | null;
  area:
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
  state:
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

async function fetchChainBranches(): Promise<ChainBranchInput[]> {
  if (!hasAdminCredentials()) return [];

  const supabase = createAdminClient();
  const pageSize = 1000;
  const branches: ChainBranchInput[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('clinics')
      .select(
        `
        name,
        slug,
        address,
        neighborhood,
        city,
        phone,
        rating,
        review_count,
        area:areas(name, slug),
        state:states(name, slug)
      `,
      )
      .eq('status', 'approved')
      .eq('is_active', true)
      .order('slug', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`Failed to list clinics for chain hubs: ${error.message}`);
    }

    const rows = (data ?? []) as unknown as ChainRow[];
    for (const row of rows) {
      const area = one(row.area);
      const state = one(row.state);
      branches.push({
        name: row.name,
        slug: row.slug,
        address: row.address,
        neighborhood: row.neighborhood,
        city: row.city,
        areaName: area?.name ?? null,
        areaSlug: area?.slug ?? null,
        stateName: state?.name ?? null,
        stateSlug: state?.slug ?? null,
        rating: row.rating,
        reviewCount: row.review_count,
        phone: row.phone,
      });
    }

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return branches;
}

export const getChainGroups = unstable_cache(
  async (): Promise<ChainGroup[]> => groupClinicChains(await fetchChainBranches()),
  ['chain-groups-v1'],
  { revalidate: 86_400, tags: ['clinics', 'chains'] },
);

export async function getChainBySlug(slug: string): Promise<ChainGroup | null> {
  const groups = await getChainGroups();
  return groups.find((group) => group.slug === slug) ?? null;
}
