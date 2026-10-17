import { GuideHeading } from '@/lib/guides/types';

export function headingId(text: string) {
  const base = text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  return base || 'section';
}

export function extractHeadings(markdown: string): GuideHeading[] {
  const counts = new Map<string, number>();
  const headings: GuideHeading[] = [];

  for (const line of markdown.split('\n')) {
    const match = /^(##)\s+(.+)$/.exec(line.trim());
    if (!match) {
      continue;
    }
    const text = match[2].trim();
    const base = headingId(text);
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    headings.push({ id: seen === 0 ? base : `${base}-${seen + 1}`, text });
  }

  return headings;
}
