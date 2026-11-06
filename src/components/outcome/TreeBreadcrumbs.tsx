'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { getNode } from '@/lib/tree-engine';
import type { TreeData } from '@/types/tree';

interface TreeBreadcrumbsProps {
  history: string[];
  answers: Record<string, string>;
  tree: TreeData;
  /** Path to redirect when clicking "Cambia" (defaults to /tree) */
  treePath?: string;
  onGoBackTo: (nodeId: string) => void;
  /** Replaces [Parente selezionato] and similar placeholders */
  formatText?: (text: string) => string;
}

/**
 * "Le tue risposte": the answers given so far, each with a "Cambia" button
 * that reopens that question (same pattern as the SOS Flussi questionnaire).
 * Info nodes are skipped: their only answer is "go on".
 */
export function TreeBreadcrumbs({
  history,
  answers,
  tree,
  treePath = '/tree',
  onGoBackTo,
  formatText = (text) => text,
}: TreeBreadcrumbsProps) {
  const t = useTranslations('outcome');
  const router = useRouter();

  const rows = history
    .map((nodeId) => {
      const node = getNode(tree, nodeId);
      const optionKey = answers[nodeId];
      if (!node || node.type !== 'question' || !optionKey) return null;
      const edge = tree.edges.find((e) => e.from === nodeId && e.optionKey === optionKey);
      return {
        nodeId,
        question: formatText(node.short ?? node.question ?? ''),
        answer: formatText(edge?.label ?? optionKey),
      };
    })
    .filter((row): row is { nodeId: string; question: string; answer: string } => row !== null);

  // Direct URL access: no answers to show
  if (rows.length === 0) return null;

  const handleChange = (nodeId: string) => {
    onGoBackTo(nodeId);
    router.replace(treePath);
  };

  return (
    <details className="group rounded-xl border-2 border-foreground bg-card shadow-[3px_3px_0_hsl(var(--foreground))]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-4 font-semibold text-card-foreground [&::-webkit-details-marker]:hidden">
        {t('yourAnswers', { count: rows.length })}
        <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <ol className="flex flex-col border-t-2 border-foreground/10 px-5 pb-2">
        {rows.map((row) => (
          <li
            key={row.nodeId}
            className="flex items-center justify-between gap-3 border-b border-foreground/10 py-3 last:border-b-0"
          >
            <div className="flex min-w-0 flex-col">
              <span className="text-sm text-muted-foreground">{row.question}</span>
              <span className="font-semibold text-card-foreground">{row.answer}</span>
            </div>
            <button
              type="button"
              onClick={() => handleChange(row.nodeId)}
              className="min-h-11 shrink-0 rounded-md px-2 text-sm font-semibold text-foreground underline underline-offset-4 hover:bg-foreground/10"
            >
              {t('changeAnswer')}
            </button>
          </li>
        ))}
      </ol>
    </details>
  );
}
