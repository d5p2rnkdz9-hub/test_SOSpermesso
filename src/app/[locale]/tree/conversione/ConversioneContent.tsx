'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { TreePlayer } from '@/components/tree';
import { useRouter } from '@/i18n/navigation';
import { conversioneTree } from '@/lib/conversione-tree';
import { isTerminalNode } from '@/lib/tree-engine';
import { getConversioneSlugFromNodeId } from '@/lib/conversione-outcome-slugs';
import {
  useConversioneHydration,
  useConversioneStore,
} from '@/store/conversione-store';
import { useTrackStep } from '@/hooks/useTrackStep';

export default function ConversioneContent() {
  const router = useRouter();

  const isHydrated = useConversioneHydration();
  const currentNodeId = useConversioneStore((s) => s.currentNodeId);
  const answers = useConversioneStore((s) => s.answers);
  const outcomeId = useConversioneStore((s) => s.outcomeId);
  const sessionStartedAt = useConversioneStore((s) => s.sessionStartedAt);
  const history = useConversioneStore((s) => s.history);
  const selectOption = useConversioneStore((s) => s.selectOption);
  const startSession = useConversioneStore((s) => s.startSession);

  useTrackStep('conversione', { currentNodeId, answers, history, sessionStartedAt });

  // Auto-start session on first visit (no welcome page for conversione test)
  useEffect(() => {
    if (isHydrated && sessionStartedAt === null) {
      startSession();
    }
  }, [isHydrated, sessionStartedAt, startSession]);

  // Redirect to outcome page when tree reaches a terminal node
  useEffect(() => {
    if (isHydrated && outcomeId && isTerminalNode(conversioneTree, outcomeId)) {
      const slug = getConversioneSlugFromNodeId(outcomeId);
      if (slug) {
        router.replace(`/outcome/conversione/${slug}`);
      }
    }
  }, [isHydrated, outcomeId, router]);

  // Hydration guard
  if (!isHydrated) {
    return (
      <ContentColumn>
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
          <div className="bg-foreground/5 rounded-2xl p-5">
            <Loader2 className="h-8 w-8 animate-spin text-foreground/40" />
          </div>
        </div>
      </ContentColumn>
    );
  }

  // Redirect in progress
  if (outcomeId && isTerminalNode(conversioneTree, outcomeId)) {
    return (
      <ContentColumn>
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
          <div className="bg-foreground/5 rounded-2xl p-5">
            <Loader2 className="h-8 w-8 animate-spin text-foreground/40" />
          </div>
        </div>
      </ContentColumn>
    );
  }

  return (
    <ContentColumn>
      <TreePlayer
        tree={conversioneTree}
        currentNodeId={currentNodeId}
        answers={answers}
        historyLength={history.length}
        onSelectOption={selectOption}
      />
    </ContentColumn>
  );
}
