export type ClinicAddressInput = {
  address?: string | null;
  neighborhood?: string | null;
  postal_code?: string | null;
  city?: string | null;
  state?: { name?: string | null } | null;
};

export function buildFullAddress(clinic: ClinicAddressInput): string {
  const postalCity = [clinic.postal_code, clinic.city].filter(Boolean).join(' ');

  return [clinic.address, clinic.neighborhood, postalCity, clinic.state?.name]
    .filter(Boolean)
    .join(', ');
}
