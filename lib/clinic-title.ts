const MAX_CLINIC_TITLE_LENGTH = 60;

/**
 * Clinic document titles are appended with the site-name template, so the
 * page title itself stays within about 60 characters.
 */
export function clinicPageTitle(
  name: string,
  area?: string | null,
  state?: string | null,
): string {
  const clean = name.replace(/\s+/g, ' ').trim();
  const city = area?.replace(/\s+/g, ' ').trim();
  const region = state?.replace(/\s+/g, ' ').trim();

  const candidates = [
    city && region ? `${clean} in ${city}, ${region}` : null,
    city ? `${clean} | ${city}` : null,
    region ? `${clean} | ${region}` : null,
    clean,
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    if (candidate.length <= MAX_CLINIC_TITLE_LENGTH) {
      return candidate;
    }
  }

  const suffix = city ? ` | ${city}` : region ? ` | ${region}` : '';
  if (!suffix || suffix.length >= MAX_CLINIC_TITLE_LENGTH - 1) {
    return truncate(clean, MAX_CLINIC_TITLE_LENGTH);
  }

  const room = MAX_CLINIC_TITLE_LENGTH - suffix.length;
  return `${truncate(clean, room)}${suffix}`;
}

function truncate(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }

  if (max <= 1) {
    return '…';
  }

  return `${value.slice(0, max - 1).trimEnd()}…`;
}
