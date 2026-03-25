'use client';

import type { ReactNode } from 'react';
import type { ResultSection } from '@/types/tree';

const BORDER_COLORS = ['#42A5F5', '#FFD700', '#FF5252'] as const;

const MD_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/** Turn markdown links [text](url) and plain URLs into clickable <a> tags. */
function linkify(text: string): ReactNode[] {
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  // First pass: extract markdown links [text](url)
  const segments: { start: number; end: number; label: string; href: string }[] = [];
  let match: RegExpExecArray | null;
  MD_LINK_REGEX.lastIndex = 0;
  while ((match = MD_LINK_REGEX.exec(text)) !== null) {
    segments.push({ start: match.index, end: match.index + match[0].length, label: match[1], href: match[2] });
  }

  for (const seg of segments) {
    // Text before this markdown link — linkify plain URLs in it
    if (seg.start > lastIndex) {
      result.push(...linkifyPlainUrls(text.slice(lastIndex, seg.start), key));
      key += 10;
    }
    // The markdown link itself
    result.push(
      <a key={key++} href={seg.href} target="_blank" rel="noopener noreferrer" className="underline text-primary">
        {seg.label}
      </a>,
    );
    lastIndex = seg.end;
  }

  // Remaining text after last markdown link
  if (lastIndex < text.length) {
    result.push(...linkifyPlainUrls(text.slice(lastIndex), key));
  }

  return result;
}

/** Fallback: turn plain URLs into clickable links. */
function linkifyPlainUrls(text: string, keyStart: number): ReactNode[] {
  const parts = text.split(URL_REGEX);
  let key = keyStart;
  return parts.map((part) =>
    URL_REGEX.test(part) ? (
      <a key={key++} href={part} target="_blank" rel="noopener noreferrer" className="underline text-primary">
        {part}
      </a>
    ) : (
      part
    ),
  );
}

interface FaqAccordionProps {
  sections: ResultSection[];
  substituteVars: (text: string) => string;
}

export function FaqAccordion({ sections, substituteVars }: FaqAccordionProps) {
  // Filter out sections absorbed into other UI elements
  const displaySections = sections.filter(
    (s) =>
      !s.heading.toLowerCase().includes('avvocato') &&
      !s.heading.toLowerCase().includes('quanto siamo sicuri') &&
      !s.heading.includes('\u2705'),
  );

  if (displaySections.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {displaySections.map((section, index) => (
        <div
          key={index}
          className="card-hover rounded-3xl bg-card p-6"
          style={{
            borderInlineStartWidth: '4px',
            borderInlineStartStyle: 'solid',
            borderInlineStartColor: BORDER_COLORS[index % BORDER_COLORS.length],
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <h3 className="text-base font-bold text-card-foreground">
            {section.heading}
          </h3>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">
            {linkify(substituteVars(section.content))}
          </p>
        </div>
      ))}
    </div>
  );
}
