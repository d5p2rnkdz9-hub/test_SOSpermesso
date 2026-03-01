'use client';

import type { ResultSection } from '@/types/tree';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
    <Accordion type="single" collapsible defaultValue="section-0">
      {displaySections.map((section, index) => (
        <AccordionItem key={index} value={`section-${index}`}>
          <AccordionTrigger className="text-start text-base font-semibold">
            {section.heading}
          </AccordionTrigger>
          <AccordionContent>
            <p className="whitespace-pre-line text-foreground/80">
              {substituteVars(section.content)}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
