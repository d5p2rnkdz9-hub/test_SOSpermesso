'use client';

import type { ReactNode } from 'react';
import type { ResultSection } from '@/types/tree';

const BORDER_COLORS = ['#42A5F5', '#FFD700', '#FF5252'] as const;

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/** Turn plain-text URLs into clickable <a> tags. */
function linkify(text: string): ReactNode[] {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) =>
    URL_REGEX.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-primary"
      >
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
      !s.heading.toLowerCase().includes('quanto siamo sicuri'),
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
