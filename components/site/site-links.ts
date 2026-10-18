import type { ElementType } from 'react';

import { BookOpenIcon, MapPinIcon, MegaphoneIcon, PlusIcon, StethoscopeIcon } from 'lucide-react';

export type SiteNavItem = {
  name: string;
  href: string;
  description: string;
  icon: ElementType;
  matchPaths?: string[];
};

/** Flat items for the mobile panel. Desktop nav keeps its own labels in navbar.tsx. */
export const primaryNavItems: SiteNavItem[] = [
  {
    name: 'Browse',
    href: '/browse',
    description: 'Find clinics by state and area',
    icon: MapPinIcon,
    matchPaths: ['/browse'],
  },
  {
    name: 'Doctors',
    href: '/doctors',
    description: 'Search doctors across Malaysia',
    icon: StethoscopeIcon,
    matchPaths: ['/doctors', '/doctor/'],
  },
  {
    name: 'Guides',
    href: '/guides',
    description: 'How to compare clinics and plan a visit',
    icon: BookOpenIcon,
    matchPaths: ['/guides'],
  },
  {
    name: 'Submit',
    href: '/submit',
    description: 'Add a clinic to the directory',
    icon: PlusIcon,
    matchPaths: ['/submit'],
  },
];

export const advertiseNavItem = {
  name: 'Advertise',
  href: '/advertise-with-us',
  description: 'Premium visibility for clinic owners',
  icon: MegaphoneIcon,
  matchPaths: ['/advertise-with-us'],
} satisfies SiteNavItem;

export function isNavItemActive(pathname: string | null, item: SiteNavItem): boolean {
  if (!pathname) return false;
  if (pathname === item.href) return true;
  return item.matchPaths?.some((path) => pathname.startsWith(path)) ?? false;
}
