'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import { italianTree } from '@/lib/tree-data';
import { useRouter } from '@/i18n/navigation';
import { useTreeStore } from '@/store/tree-store';

interface TreeBreadcrumbsProps {
  history: string[];
  answers: Record<string, string>;
}

/**
 * Short question summaries for breadcrumb display.
 * Maps nodeId -> concise label (no [Nome] placeholders).
 */
const QUESTION_LABELS: Record<string, string> = {
  start: 'Cittadino UE?',
  q_situazione: 'Situazione',
  paura_start: 'Tipo di pericolo',
  brutta_start: 'Tipo di problema',
  minore_start: 'Genitore in Italia?',
  min_gen_pds: 'PdS genitore',
  min_parenti: 'Familiare convivente',
  min_par_ita1: 'Situazione parente',
  min_par_ita2: 'Situazione parente',
  min_par_ita3: 'Situazione parente',
  min_par_ita4: 'Situazione parente',
  min_par_ita5: 'Situazione parente',
  min_affido1: 'Affidamento?',
  min_affido2: 'Affidamento?',
  min_affido3: 'Affidamento?',
  min_affido4: 'Affidamento?',
  min_affido5: 'Affidamento?',
  famiglia_start: 'Chi in Italia?',
  figlio_start: 'Figlio italiano?',
  fig_ita_min: 'Figlio minorenne?',
  fig_mant: 'Figlio ti mantiene?',
  fig_conv: 'Convivenza figlio?',
  fig_ue: 'Figlio cittadino UE?',
  fig_ue_min: 'Figlio UE minorenne?',
  fig_ue_mant: 'Figlio UE ti mantiene?',
  fig_stra_min: 'Figlio minorenne?',
  fig_stra_pds: 'Avuto PdS in Italia?',
  fig_stra_mant: 'Figlio ti mantiene?',
  genitore_start: 'Genitore italiano/UE?',
  gen_ita_eta: 'Tra 18 e 21 anni?',
  gen_ita_tipo: 'Genitore italiano?',
  gen_mant: 'Genitore ti mantiene?',
  gen_mant_tipo: 'Tipo genitore',
  gen_ita_conv: 'Genitore italiano?',
  gen_pds: 'PdS familiare da minore?',
  gen_inv: 'Invalidita totale?',
  gen_inv_mant: 'A carico genitori?',
  nonno_frat: 'Familiare italiano?',
  coniuge_start: 'Partner/coniuge',
  con_ita_sposi: 'Sposati?',
  con_ita_conv: 'Convivenza registrata?',
  con_ue_sposi: 'Sposati?',
  con_ue_conv: 'Convivenza registrata?',
  con_str_sposi: 'Sposati?',
  con_str_pds: 'PdS del coniuge',
  con_str_prec: 'PdS precedente?',
};

/** Resolve the display label for the answer chosen at a given node */
function getAnswerLabel(nodeId: string, optionKey: string): string {
  const edge = italianTree.edges.find(
    (e) => e.from === nodeId && e.optionKey === optionKey,
  );
  return edge?.label ?? optionKey;
}

/** Build a crumb label: "Question: Answer" or just "Answer" if no short label */
function getCrumbLabel(nodeId: string, optionKey: string): string {
  const answerLabel = getAnswerLabel(nodeId, optionKey);
  const questionLabel = QUESTION_LABELS[nodeId];
  if (questionLabel) {
    return `${questionLabel} ${answerLabel}`;
  }
  return answerLabel;
}

export function TreeBreadcrumbs({ history, answers }: TreeBreadcrumbsProps) {
  const router = useRouter();
  const goBackTo = useTreeStore((s) => s.goBackTo);
  const [expanded, setExpanded] = useState(false);

  // Don't render if no history (direct URL access)
  if (history.length === 0) return null;

  // Build breadcrumb items: each history entry shows question + answer
  const crumbs = history
    .map((nodeId) => {
      const optionKey = answers[nodeId];
      if (!optionKey) return null;
      return {
        nodeId,
        label: getCrumbLabel(nodeId, optionKey),
      };
    })
    .filter(Boolean) as { nodeId: string; label: string }[];

  if (crumbs.length === 0) return null;

  const handleCrumbClick = (nodeId: string) => {
    goBackTo(nodeId);
    router.replace('/tree');
  };

  // Detect RTL from document
  const isRtl =
    typeof document !== 'undefined' &&
    document.documentElement.dir === 'rtl';
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  // Mobile truncation: show last 2 + expand button on small screens
  const shouldTruncate = crumbs.length > 2 && !expanded;
  const visibleCrumbs = shouldTruncate ? crumbs.slice(-2) : crumbs;

  return (
    <nav
      aria-label="breadcrumbs"
      className="flex flex-wrap items-center gap-1 text-sm text-foreground/60"
    >
      {/* Truncation indicator (mobile) */}
      {shouldTruncate && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded px-1 py-0.5 hover:bg-foreground/10 sm:hidden"
          >
            ...
          </button>
          <Chevron className="h-3 w-3 shrink-0 sm:hidden" />
        </>
      )}

      {/* Full crumbs on desktop when truncated on mobile */}
      {shouldTruncate &&
        crumbs.slice(0, -2).map((crumb) => (
          <span key={crumb.nodeId} className="hidden items-center gap-1 sm:inline-flex">
            <button
              type="button"
              onClick={() => handleCrumbClick(crumb.nodeId)}
              className="rounded px-1 py-0.5 hover:bg-foreground/10 hover:text-foreground"
            >
              {crumb.label}
            </button>
            <Chevron className="h-3 w-3 shrink-0" />
          </span>
        ))}

      {/* Always-visible crumbs */}
      {visibleCrumbs.map((crumb, index) => (
        <span key={crumb.nodeId} className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleCrumbClick(crumb.nodeId)}
            className="rounded px-1 py-0.5 hover:bg-foreground/10 hover:text-foreground"
          >
            {crumb.label}
          </button>
          {index < visibleCrumbs.length - 1 && (
            <Chevron className="h-3 w-3 shrink-0" />
          )}
        </span>
      ))}
    </nav>
  );
}
