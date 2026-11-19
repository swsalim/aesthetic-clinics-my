/**
 * AI-written clinic descriptions sometimes name treatments that are not on
 * the clinic's service rows. The public page and the markdown export both
 * run the description through this guard before display.
 *
 * A sentence stays when every treatment it names is present in the recorded
 * service names or slugs. Sentences that name a treatment we cannot match
 * are dropped. When nothing factual remains, the fallback uses only the
 * clinic name, place, and recorded services.
 */

export type RecordedService = {
  name?: string | null;
  slug?: string | null;
};

type Claim = {
  label: string;
  pattern: RegExp;
  aliases: string[];
};

const CLAIMS: Claim[] = [
  { label: 'Botox', pattern: /\b(botox|dysport|xeomin|anti-?wrinkle)\b/i, aliases: ['botox', 'dysport', 'xeomin', 'anti-wrinkle', 'anti wrinkle'] },
  { label: 'dermal filler', pattern: /\b(fillers?|juvederm|restylane|belotero)\b/i, aliases: ['filler', 'juvederm', 'restylane', 'belotero'] },
  { label: 'laser treatment', pattern: /\b(laser|pico|picosecond|co2)\b/i, aliases: ['laser', 'pico', 'picosecond'] },
  { label: 'HIFU', pattern: /\b(hifu|ultherap(?:y|a)|ulthera)\b/i, aliases: ['hifu', 'ultherapy', 'ulthera'] },
  { label: 'thread lift', pattern: /\bthread\s*lifts?\b/i, aliases: ['thread'] },
  { label: 'chemical peel', pattern: /\b(chemical\s+peels?|peels?)\b/i, aliases: ['peel'] },
  { label: 'HydraFacial', pattern: /\bhydra\s*facials?\b/i, aliases: ['hydrafacial', 'hydra facial'] },
  { label: 'microneedling', pattern: /\b(microneedl\w*|dermapen|skin\s+needling)\b/i, aliases: ['microneedl', 'dermapen', 'needling'] },
  { label: 'hair restoration', pattern: /\b(hair\s+(transplant|restoration|loss)|prp)\b/i, aliases: ['hair', 'prp'] },
  { label: 'body contouring', pattern: /\b(slimming|fat\s+freezing|coolsculpt\w*|body\s+contour\w*)\b/i, aliases: ['slim', 'contour', 'coolsculpt', 'fat freezing'] },
  { label: 'acne treatment', pattern: /\bacne\b/i, aliases: ['acne'] },
  { label: 'skin whitening', pattern: /\b(whiten\w*|brighten\w*)\b/i, aliases: ['whiten', 'brighten'] },
  { label: 'facial', pattern: /\bfacials?\b/i, aliases: ['facial'] },
  { label: 'mole or skin tag removal', pattern: /\b(skin\s+tags?|mole\s+removal)\b/i, aliases: ['skin tag', 'mole'] },
];

const VAGUE_OFFER = /\b(offers?|provides?|speciali[sz]es in|wide range of|comprehensive range of|services include|treatments include)\b/i;

function serviceHaystack(services: RecordedService[]): string {
  return services
    .flatMap((service) => [service.name, service.slug])
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(' ')
    .toLowerCase();
}

function claimIsRecorded(claim: Claim, haystack: string): boolean {
  return claim.aliases.some((alias) => haystack.includes(alias.toLowerCase()));
}

export function unsupportedClaims(text: string, services: RecordedService[]): string[] {
  const haystack = serviceHaystack(services);
  const missing: string[] = [];

  for (const claim of CLAIMS) {
    if (claim.pattern.test(text) && !claimIsRecorded(claim, haystack)) {
      missing.push(claim.label);
    }
  }

  return missing;
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

export function htmlToPlainParagraphs(html: string): string[] {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n');
  const text = decodeBasicEntities(withBreaks.replace(/<[^>]+>/g, ' '));
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function sentencesOf(paragraph: string): string[] {
  const parts = paragraph.split(/(?<=[.!?])\s+/);
  return parts.map((part) => part.trim()).filter(Boolean);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function factualDescriptionHtml(input: {
  html: string | null | undefined;
  services: RecordedService[];
  name: string;
  area?: string | null;
  state?: string | null;
}): string {
  const services = (input.services ?? []).filter((service) => service.name || service.slug);
  const paragraphs = htmlToPlainParagraphs(input.html ?? '');
  const kept: string[] = [];

  for (const paragraph of paragraphs) {
    const sentences = sentencesOf(paragraph);
    const safe = sentences.filter((sentence) => {
      if (unsupportedClaims(sentence, services).length > 0) {
        return false;
      }
      if (services.length === 0 && VAGUE_OFFER.test(sentence)) {
        return false;
      }
      return true;
    });
    if (safe.length > 0) {
      kept.push(safe.join(' '));
    }
  }

  if (kept.length === 0) {
    kept.push(factualFallback(input.name, input.area, input.state, services));
  }

  return kept.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
}

export function factualDescriptionText(input: {
  html: string | null | undefined;
  services: RecordedService[];
  name: string;
  area?: string | null;
  state?: string | null;
}): string {
  return htmlToPlainParagraphs(
    factualDescriptionHtml(input),
  ).join('\n\n');
}

function factualFallback(
  name: string,
  area: string | null | undefined,
  state: string | null | undefined,
  services: RecordedService[],
): string {
  const place = [area, state].filter(Boolean).join(', ');
  const where = place ? ` in ${place}` : '';
  const names = services
    .map((service) => service.name?.trim())
    .filter((serviceName): serviceName is string => Boolean(serviceName));

  if (names.length === 0) {
    return `${name} is listed${where}. This directory does not have services recorded for this clinic. Confirm treatments with the clinic.`;
  }

  return `${name} is listed${where}. Services recorded for this clinic: ${joinList(names)}.`;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
