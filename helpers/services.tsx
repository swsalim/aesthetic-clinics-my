import { createAdminClient, createServerClient } from '@/lib/supabase';

import * as Icons from '@/components/icons';

export async function getAllServices() {
  const supabase = createAdminClient();

  const { data: services } = await supabase
    .from('clinic_services')
    .select(
      `
      id,
      name,
      slug,
      description
    `,
    )
    .order('modified_at', { ascending: false });

  return services ?? [];
}

export async function getServiceBySlug(slug: string) {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from('clinic_services')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .single();

  return data;
}

/**
 * Fetches a service by its slug using admin client for static generation
 */
export async function getServiceBySlugStatic(slug: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('clinic_services')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .single();

  return data;
}

const slugToIcon: Record<string, React.ReactNode> = {
  veneers: (
    <Icons.DentalVeneer className="mx-auto h-16 w-16 text-blue-500" aria-label="Dental Veneer" />
  ),
  invisalign: (
    <Icons.Invisalign className="mx-auto h-16 w-16 text-blue-500" aria-label="Invisalign" />
  ),
  'cosmetic-dentistry': (
    <Icons.CosmeticDentistry
      className="mx-auto h-16 w-16 text-blue-500"
      aria-label="Cosmetic Dentistry"
    />
  ),
  periodontics: (
    <Icons.Periodontics className="mx-auto h-16 w-16 text-blue-500" aria-label="Periodontics" />
  ),
  'general-dentistry': (
    <Icons.GeneralDentistry
      className="mx-auto h-16 w-16 text-blue-500"
      aria-label="General Dentistry"
    />
  ),
  'emergency-dentistry': (
    <Icons.EmergencyDentistry
      className="mx-auto h-16 w-16 text-blue-500"
      aria-label="Emergency Dentistry"
    />
  ),
  'root-canal': (
    <Icons.RootCanal className="mx-auto h-16 w-16 text-blue-500" aria-label="Root Canal" />
  ),
  endodontics: (
    <Icons.RootCanal className="mx-auto h-16 w-16 text-blue-500" aria-label="Root Canal" />
  ),
  bacteria: <Icons.Bacteria className="mx-auto h-16 w-16 text-blue-500" aria-label="Bacteria" />,
  'pediatric-dentistry': (
    <Icons.PaediatricDentistry
      className="mx-auto h-16 w-16 text-blue-500"
      aria-label="Paediatric Dentistry"
    />
  ),
  'dental-xrays': (
    <Icons.DentalXrays className="mx-auto h-16 w-16 text-blue-500" aria-label="Dental Xrays" />
  ),
  crowning: <Icons.Crowning className="mx-auto h-16 w-16 text-blue-500" aria-label="Crowning" />,
  prosthodontics: (
    <Icons.Dentures className="mx-auto h-16 w-16 text-blue-500" aria-label="Dentures" />
  ),
  'tooth-extraction': (
    <Icons.ToothExtraction
      className="mx-auto h-16 w-16 text-blue-500"
      aria-label="Tooth Extraction"
    />
  ),
  'wisdom-tooth-extraction': (
    <Icons.ToothExtraction
      className="mx-auto h-16 w-16 text-blue-500"
      aria-label="Tooth Extraction"
    />
  ),
  'dental-implants': (
    <Icons.DentalImplant className="mx-auto h-16 w-16 text-blue-500" aria-label="Dental Implant" />
  ),
  'oral-surgery': (
    <Icons.DentalImplant className="mx-auto h-16 w-16 text-blue-500" aria-label="Dental Implant" />
  ),
  orthodontics: (
    <Icons.DentalBraces className="mx-auto h-16 w-16 text-blue-500" aria-label="Dental Braces" />
  ),
  braces: (
    <Icons.DentalBraces className="mx-auto h-16 w-16 text-blue-500" aria-label="Dental Braces" />
  ),
  'teeth-whitening': (
    <Icons.TeethWhitening
      className="mx-auto h-16 w-16 text-blue-500"
      aria-label="Teeth Whitening"
    />
  ),
};

export function getServiceIcon(slug: string): React.ReactNode {
  return (
    slugToIcon[slug] ?? (
      <Icons.Bacteria className="mx-auto h-16 w-16 text-blue-500" aria-label="Service" />
    )
  );
}
