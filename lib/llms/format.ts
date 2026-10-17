import { ClinicHours } from '@/types/clinic';

import { absoluteUrl } from '@/lib/utils';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const LLMS_REVALIDATE_SECONDS = 1_209_600;

export function llmsTextResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': `public, s-maxage=${LLMS_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}

export function mdPath(path: string) {
  if (path === '/' || path === '') {
    return '/index.md';
  }

  return `${path}.md`;
}

export function mdUrl(path: string) {
  return absoluteUrl(mdPath(path));
}

export function htmlToText(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function escapeMd(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

export function listItem(title: string, url: string, notes?: string) {
  const note = notes?.replace(/\s+/g, ' ').trim();
  return note ? `- [${escapeMd(title)}](${url}): ${note}` : `- [${escapeMd(title)}](${url})`;
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(':');
  const hour = Number.parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
}

export function formatHours(hours: Partial<ClinicHours>[] | null | undefined): string[] {
  if (!hours?.length) {
    return [];
  }

  const byDay = new Map<number, string[]>();

  for (const hour of hours) {
    const dayIndex = hour.day_of_week ?? 0;
    const open = hour.open_time;
    const close = hour.close_time;

    if (!open || !close) {
      continue;
    }

    const shifts = byDay.get(dayIndex) ?? [];
    shifts.push(`${formatTime(open)} – ${formatTime(close)}`);
    byDay.set(dayIndex, shifts);
  }

  const displayOrder = [1, 2, 3, 4, 5, 6, 0];

  return displayOrder.map((dayIndex) => {
    const shifts = byDay.get(dayIndex);
    return `- ${DAYS[dayIndex]}: ${shifts?.join(', ') || 'Closed'}`;
  });
}

export function joinSections(sections: Array<string | null | undefined>) {
  return sections.filter((section): section is string => Boolean(section?.trim())).join('\n\n');
}
