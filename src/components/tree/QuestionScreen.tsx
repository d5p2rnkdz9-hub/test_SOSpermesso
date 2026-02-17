'use client';

import type { TreeEdge } from '@/types/tree';
import { substituteVariables } from '@/lib/text-utils';
import { useTreeStore } from '@/store/tree-store';

import { AnswerCard } from './AnswerCard';

interface QuestionScreenProps {
  question: string;
  description?: string;
  options: TreeEdge[];
  selectedOptionKey: string | null;
  onSelect: (optionKey: string) => void;
  disabled: boolean;
}

/**
 * Category grouping for the q_situazione node (9 options).
 * Purely visual -- each option is still a direct answer.
 */
const CATEGORY_MAP: Record<string, string> = {
  minore: 'La tua situazione personale',
  nato_italia: 'La tua situazione personale',
  salute: 'La tua situazione personale',
  gravidanza: 'La tua situazione personale',
  famiglia: 'Famiglia e relazioni',
  partner: 'Famiglia e relazioni',
  paura: 'Protezione e sicurezza',
  sfruttamento: 'Protezione e sicurezza',
  nessuna: 'Altro',
};

const CATEGORY_ORDER = [
  'La tua situazione personale',
  'Famiglia e relazioni',
  'Protezione e sicurezza',
  'Altro',
];

/**
 * Renders a single question with its answer options.
 *
 * When options.length > 5 (the q_situazione node), options are
 * grouped under category headings for easier scanning.
 */
export function QuestionScreen({
  question,
  description,
  options,
  selectedOptionKey,
  onSelect,
  disabled,
}: QuestionScreenProps) {
  const userName = useTreeStore((s) => s.userName);
  const answers = useTreeStore((s) => s.answers);
  const useCategories = false;

  const displayQuestion = substituteVariables(question, userName, answers);
  const displayDescription = description
    ? substituteVariables(description, userName, answers)
    : undefined;

  return (
    <div className="bg-foreground/5 rounded-2xl p-5">
      <h2 className="text-2xl font-bold leading-tight">{displayQuestion}</h2>
      {displayDescription && (
        <p className="mt-2 text-foreground/70">{displayDescription}</p>
      )}

      {useCategories ? (
        <div className="mt-8">
          {CATEGORY_ORDER.map((category) => {
            const categoryOptions = options.filter(
              (opt) => CATEGORY_MAP[opt.optionKey] === category,
            );
            if (categoryOptions.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="mt-8 first:mt-0 mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/60">
                  {category}
                </h3>
                <div className="flex flex-col gap-3">
                  {categoryOptions.map((option) => (
                    <AnswerCard
                      key={option.optionKey}
                      label={option.label}
                      description={option.description}
                      selected={option.optionKey === selectedOptionKey}
                      onSelect={() => onSelect(option.optionKey)}
                      disabled={disabled}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {options.map((option) => (
            <AnswerCard
              key={option.optionKey}
              label={option.label}
              description={option.description}
              selected={option.optionKey === selectedOptionKey}
              onSelect={() => onSelect(option.optionKey)}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
