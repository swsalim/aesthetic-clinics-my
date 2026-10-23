import type { ReactNode } from 'react';

import Link from 'next/link';

import { headingId } from '@/lib/guides/headings';

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
          <div key={`table-${index}`} className="my-6 overflow-x-auto overscroll-x-contain">
            <table className="my-0 w-full min-w-[42rem]">
              <thead>
                <tr>
                  {header.map((cell, cellIndex) => (
                    <th key={`th-${index}-${cellIndex}`}>
                      {renderInline(cell, `th-${index}-${cellIndex}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rowIndex) => (
                  <tr key={`tr-${index}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`td-${index}-${rowIndex}-${cellIndex}`}>
                        {renderInline(cell, `td-${index}-${rowIndex}-${cellIndex}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
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
