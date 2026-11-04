import { ClinicHours, ClinicSpecialHours } from '@/types/clinic';

export type FeaturedPartnerCard = {
  slug: string;
  name: string;
  address: string;
  neighborhood?: string;
  city?: string;
  postalCode: string;
  state: string;
  area: string;
  image?: string;
  rating?: number | null;
  hours: Partial<ClinicHours>[];
  specialHours: Partial<ClinicSpecialHours>[];
  isPermanentlyClosed: boolean;
};
