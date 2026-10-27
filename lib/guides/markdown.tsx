import type { ReactNode } from 'react';

import Link from 'next/link';

import { headingId } from '@/lib/guides/headings';
import { cn } from '@/lib/utils';

const INLINE = /(\*\*[^*]+?\*\*|\*[^*]+?\*|\[[^\]]+?\]\((?:https?:\/\/|\/|mailto:)[^)\s]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const parts = text.split(INLINE);

  parts.forEach((part, index) => {
    if (!part) {
      return;
    }

    const key = `${keyPrefix}-${index}`;

    if (part.startsWith('**') && part.endsWith('**')) {
      nodes.push(<strong key={key}>{part.slice(2, -2)}</strong>);
      return;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      nodes.push(<em key={key}>{part.slice(1, -1)}</em>);
      return;
    }

    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith('/')) {
        nodes.push(
          <Link key={key} href={href} prefetch={false}>
            {label}
          </Link>,
        );
        return;
      }

      nodes.push(
        <a key={key} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>,
      );
      return;
    }

    nodes.push(part);
  });

  return nodes;
}

function isListLine(line: string) {
  return /^-\s+/.test(line) || /^\d+\.\s+/.test(line);
}

function isTableLine(line: string) {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|');
}

function isTableSeparator(line: string) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function GuideTable({ header, rows, tableKey }: { header: string[]; rows: string[][]; tableKey: string }) {
  const linkClass =
    '[&_a]:font-medium [&_a]:text-blue-700 [&_a]:underline dark:[&_a]:text-blue-300';

  return (
    <div className="not-prose my-6">
      <div className={cn('grid gap-3 md:hidden', linkClass)}>
        {rows.map((row, rowIndex) => (
          <div
            key={`card-${tableKey}-${rowIndex}`}
            className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <p className="text-base font-semibold leading-snug text-gray-900 dark:text-gray-50">
              {renderInline(row[0] ?? '', `card-title-${tableKey}-${rowIndex}`)}
            </p>
            {header.slice(1).length > 0 && (
              <dl className="mt-3 space-y-3 border-t border-blue-100 pt-3 dark:border-gray-700">
                {header.slice(1).map((label, offset) => {
                  const cellIndex = offset + 1;
                  return (
                    <div key={`card-field-${tableKey}-${rowIndex}-${cellIndex}`}>
                      <dt className="text-xs font-semibold text-blue-800 dark:text-blue-300">{label}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                        {renderInline(row[cellIndex] ?? '', `card-${tableKey}-${rowIndex}-${cellIndex}`)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>
        ))}
      </div>

      <div
        className={cn(
          'hidden overflow-hidden rounded-2xl border border-blue-100 md:block dark:border-gray-700',
          linkClass,
        )}
      >
        <table className="w-full table-fixed border-collapse text-left text-sm leading-relaxed text-gray-800 dark:text-gray-100">
          <thead>
            <tr className="bg-blue-50 dark:bg-gray-800/80">
              {header.map((cell, cellIndex) => (
                <th
                  key={`th-${tableKey}-${cellIndex}`}
                  scope="col"
                  className="border-b border-blue-100 px-4 py-3 align-bottom font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-50"
                >
                  {renderInline(cell, `th-${tableKey}-${cellIndex}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`tr-${tableKey}-${rowIndex}`}>
                {header.map((_, cellIndex) => {
                  const isTitle = cellIndex === 0;
                  const CellTag = isTitle ? 'th' : 'td';
                  return (
                    <CellTag
                      key={`td-${tableKey}-${rowIndex}-${cellIndex}`}
                      scope={isTitle ? 'row' : undefined}
                      className={cn(
                        'border-b border-blue-100 px-4 py-3 align-top text-left dark:border-gray-700',
                        rowIndex === rows.length - 1 && 'border-b-0',
                        isTitle
                          ? 'font-semibold text-gray-900 dark:text-gray-50'
                          : 'text-gray-700 dark:text-gray-200',
                      )}
                    >
                      {renderInline(row[cellIndex] ?? '', `td-${tableKey}-${rowIndex}-${cellIndex}`)}
                    </CellTag>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GuideInline({ text }: { text: string }) {
  return <>{renderInline(text, 'inline')}</>;
}

export function GuideMarkdown({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  const headingCounts = new Map<string, number>();
  let index = 0;

  const nextHeadingId = (text: string) => {
    const base = headingId(text);
    const seen = headingCounts.get(base) ?? 0;
    headingCounts.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen + 1}`;
  };

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4).trim();
      blocks.push(<h3 key={`h3-${index}`}>{renderInline(text, `h3-${index}`)}</h3>);
      index += 1;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3).trim();
      const id = nextHeadingId(text);
      blocks.push(
        <h2 key={`h2-${index}`} id={id}>
          {renderInline(text, `h2-${index}`)}
        </h2>,
      );
      index += 1;
      continue;
    }

    if (trimmed.startsWith('> ')) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('> ')) {
        quote.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push(
        <blockquote key={`q-${index}`}>
          <p>{renderInline(quote.join(' '), `q-${index}`)}</p>
        </blockquote>,
      );
      continue;
    }

    if (isTableLine(trimmed)) {
      const rows: string[][] = [];
      while (index < lines.length && isTableLine(lines[index].trim())) {
        const row = lines[index].trim();
        if (!isTableSeparator(row)) {
          rows.push(parseTableRow(row));
        }
        index += 1;
      }

      const [header, ...bodyRows] = rows;
      if (header) {
        blocks.push(
          <GuideTable key={`table-${index}`} tableKey={String(index)} header={header} rows={bodyRows} />,
        );
      }
      continue;
    }

    if (isListLine(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];
      while (index < lines.length && isListLine(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^(?:-|\d+\.)\s+/, ''));
        index += 1;
      }
      const ListTag = ordered ? 'ol' : 'ul';
      blocks.push(
        <ListTag key={`list-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`${index}-${itemIndex}`}>{renderInline(item, `li-${index}-${itemIndex}`)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('#') &&
      !lines[index].trim().startsWith('> ') &&
      !isListLine(lines[index].trim()) &&
      !isTableLine(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }

    blocks.push(<p key={`p-${index}`}>{renderInline(paragraph.join(' '), `p-${index}`)}</p>);
  }

  return <>{blocks}</>;
}
