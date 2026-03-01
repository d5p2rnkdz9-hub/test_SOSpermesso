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

/** Resolve the display label for the answer chosen at a given node */
function getAnswerLabel(nodeId: string, optionKey: string): string {
  const edge = italianTree.edges.find(
    (e) => e.from === nodeId && e.optionKey === optionKey,
  );
  return edge?.label ?? optionKey;
}

export function TreeBreadcrumbs({ history, answers }: TreeBreadcrumbsProps) {
  const router = useRouter();
  const goBackTo = useTreeStore((s) => s.goBackTo);
  const [expanded, setExpanded] = useState(false);

  // Don't render if no history (direct URL access)
  if (history.length === 0) return null;

  // Build breadcrumb items: each history entry shows the answer chosen at that node
  const crumbs = history
    .map((nodeId) => {
      const optionKey = answers[nodeId];
      if (!optionKey) return null;
      return {
        nodeId,
        label: getAnswerLabel(nodeId, optionKey),
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
        crumbs.slice(0, -2).map((crumb, index) => (
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
