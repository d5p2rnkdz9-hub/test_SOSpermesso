'use client';

import type { ResultSection } from '@/types/tree';

const BORDER_COLORS = ['#42A5F5', '#FFD700', '#FF5252'] as const;

interface FaqAccordionProps {
  sections: ResultSection[];
  substituteVars: (text: string) => string;
}

export function FaqAccordion({ sections, substituteVars }: FaqAccordionProps) {
  // Filter out the lawyer section -- its content is shown in LawyerBanner
  const displaySections = sections.filter(
    (s) => !s.heading.toLowerCase().includes('avvocato'),
  );

  if (displaySections.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {displaySections.map((section, index) => (
        <div
          key={index}
          className="rounded-[24px] bg-card p-5"
          style={{
            borderInlineStart: `4px solid ${BORDER_COLORS[index % BORDER_COLORS.length]}`,
            boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <h3 className="text-base font-semibold text-card-foreground">
            {section.heading}
          </h3>
          <p className="mt-2 whitespace-pre-line text-foreground/80">
            {substituteVars(section.content)}
          </p>
        </div>
      ))}
    </div>
  );
}
