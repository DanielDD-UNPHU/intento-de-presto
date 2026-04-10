import type { ReactNode } from 'react';
import { createElement, Fragment } from 'react';

export function normalizeText(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function textMatches(text: string | null | undefined, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  return normalizeText(text).includes(normalizedQuery);
}

export function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text;
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery || !normalizedText.includes(normalizedQuery)) return text;

  const nodes: ReactNode[] = [];
  let cursor = 0;
  const qLen = normalizedQuery.length;

  while (cursor < text.length) {
    const idx = normalizedText.indexOf(normalizedQuery, cursor);
    if (idx === -1) {
      nodes.push(text.slice(cursor));
      break;
    }
    if (idx > cursor) nodes.push(text.slice(cursor, idx));
    nodes.push(
      createElement(
        'mark',
        {
          key: idx,
          className: 'bg-yellow-200 text-slate-900 rounded-sm px-0.5 -mx-0.5',
        },
        text.slice(idx, idx + qLen)
      )
    );
    cursor = idx + qLen;
  }

  return createElement(Fragment, null, ...nodes);
}
