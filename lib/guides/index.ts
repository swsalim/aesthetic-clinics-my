import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import { guideCategories, type GuideCategory } from '@/lib/guide-categories';

import { extractHeadings } from '@/lib/guides/headings';
import { Guide, GuideFaq, GuideLink } from '@/lib/guides/types';

const GUIDES_DIR = path.join(process.cwd(), 'content/guides');

/** Pillar guide first, then the rest of the cluster. */
const GUIDE_ORDER = [
  'the-complete-guide-to-finding-an-aesthetic-clinic-in-malaysia',
  'how-to-compare-lcp-certified-aesthetic-clinics',
  'check-registered-medical-practitioner-malaysia',
  'skin-specialist-clinic-malaysia',
  'botox-clinics-how-to-compare-them',
  'microneedling-treatment-malaysia',
  'chemical-peel-treatment-malaysia',
  'dermaplane-treatment',
  'melasma-treatment-malaysia',
  'laser-treatment-malaysia',
  'laser-treatment-hyperpigmentation',
  'acne-scar-laser-treatment',
  'non-invasive-skin-tightening-treatments',
  'dermal-filler-injections-malaysia',
  'juvederm-lip-filler-malaysia',
  'face-lifting-treatment-malaysia',
  'filler-nasolabial-folds',
  'whitehead-removal',
];

const WORDS_PER_MINUTE = 200;

export const GUIDE_IMAGE_WIDTH = 1536;
export const GUIDE_IMAGE_HEIGHT = 864;

function optionalString(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requireString(value: unknown, file: string, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${file}: frontmatter "${field}" must be a non-empty string`);
  }
  return value.trim();
}

function requireStringList(value: unknown, file: string, field: string) {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== 'string')
  ) {
    throw new Error(`${file}: frontmatter "${field}" must be a list of strings`);
  }
  return value.map((item) => item.trim()).filter(Boolean);
}

function requireFaq(value: unknown, file: string): GuideFaq[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${file}: frontmatter "faq" must list at least one question`);
  }

  return value.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`${file}: faq item ${index + 1} is invalid`);
    }
    const record = item as Record<string, unknown>;
    return {
      question: requireString(record.question, file, `faq[${index}].question`),
      answer: requireString(record.answer, file, `faq[${index}].answer`),
    };
  });
}

function requireLinks(value: unknown, file: string): GuideLink[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${file}: frontmatter "relatedLinks" must list at least one link`);
  }

  return value.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`${file}: relatedLinks item ${index + 1} is invalid`);
    }
    const record = item as Record<string, unknown>;
    const href = requireString(record.href, file, `relatedLinks[${index}].href`);
    if (!href.startsWith('/')) {
      throw new Error(`${file}: relatedLinks[${index}].href must be a site path`);
    }
    return {
      title: requireString(record.title, file, `relatedLinks[${index}].title`),
      href,
      description: requireString(record.description, file, `relatedLinks[${index}].description`),
    };
  });
}

export function countWords(markdown: string) {
  const plain = markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_[\]]/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ');

  const words = plain.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function readGuideFile(filePath: string): Guide {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const file = path.basename(filePath);
  const data = parsed.data;
  const body = parsed.content.trim();
  const slug = requireString(data.slug, file, 'slug');

  if (slug !== path.basename(file, path.extname(file))) {
    throw new Error(`${file}: slug "${slug}" does not match the filename`);
  }

  const wordCount = countWords(body);

  return {
    title: requireString(data.title, file, 'title'),
    metaTitle: optionalString(data.metaTitle),
    description: requireString(data.description, file, 'description'),
    slug,
    publishedAt: requireString(data.publishedAt, file, 'publishedAt'),
    updatedAt: requireString(data.updatedAt, file, 'updatedAt'),
    image: requireString(data.image, file, 'image'),
    imageAlt: requireString(data.imageAlt, file, 'imageAlt'),
    primaryKeyword: requireString(data.primaryKeyword, file, 'primaryKeyword'),
    summary: requireStringList(data.summary, file, 'summary'),
    faq: requireFaq(data.faq, file),
    relatedLinks: requireLinks(data.relatedLinks, file),
    body,
    wordCount,
    readingTimeMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
    headings: extractHeadings(body),
  };
}

let cachedGuides: Guide[] | null = null;

export function getAllGuides(): Guide[] {
  if (cachedGuides) {
    return cachedGuides;
  }

  const files = fs
    .readdirSync(GUIDES_DIR)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));

  const guides = files.map((file) => readGuideFile(path.join(GUIDES_DIR, file)));
  const order = new Map(GUIDE_ORDER.map((slug, index) => [slug, index]));

  guides.sort((a, b) => {
    const aOrder = order.get(a.slug) ?? GUIDE_ORDER.length;
    const bOrder = order.get(b.slug) ?? GUIDE_ORDER.length;
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    return a.title.localeCompare(b.title);
  });

  cachedGuides = guides;
  return guides;
}

export function getGuideBySlug(slug: string) {
  return getAllGuides().find((guide) => guide.slug === slug) ?? null;
}

export function getGuideCategories(): { category: GuideCategory; guides: Guide[] }[] {
  const all = getAllGuides();
  const bySlug = new Map(all.map((guide) => [guide.slug, guide]));
  const used = new Set<string>();

  const groups = guideCategories.map((category) => {
    const guides = category.slugs.map((slug) => {
      const guide = bySlug.get(slug);
      if (!guide) {
        throw new Error(`Unknown guide in category ${category.id}: ${slug}`);
      }
      if (used.has(slug)) {
        throw new Error(`Guide is listed in more than one category: ${slug}`);
      }
      used.add(slug);
      return guide;
    });

    return { category, guides };
  });

  for (const guide of all) {
    if (!used.has(guide.slug)) {
      throw new Error(`Guide is missing a category: ${guide.slug}`);
    }
  }

  return groups;
}

/** Other guides in the same topic, then the rest of the catalog. */
export function getRelatedGuides(guide: Guide, limit = 4): Guide[] {
  const groups = getGuideCategories();
  const sameCategory =
    groups.find((group) => group.guides.some((item) => item.slug === guide.slug))?.guides ?? [];
  const rest = getAllGuides().filter(
    (item) => item.slug !== guide.slug && !sameCategory.some((related) => related.slug === item.slug),
  );

  return [...sameCategory.filter((item) => item.slug !== guide.slug), ...rest].slice(0, limit);
}

export function getGuidesIndexLastmod(): string {
  const dates = getAllGuides().map((guide) => guide.updatedAt);
  return dates.sort().at(-1) ?? '2026-01-01';
}

export function formatGuideDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }

  return new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function readingTimeLabel(minutes: number) {
  return `${minutes} min read`;
}
