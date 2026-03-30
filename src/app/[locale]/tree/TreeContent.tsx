'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { TreePlayer } from '@/components/tree';
import { useRouter } from '@/i18n/navigation';
import { italianTree } from '@/lib/tree-data';
import { isTerminalNode, getNode } from '@/lib/tree-engine';
import { getSlugFromNodeId } from '@/lib/outcome-slugs';
import { useTreeHydration, useTreeStore } from '@/store/tree-store';
import { useTrackStep } from '@/hooks/useTrackStep';

export default function TreeContent() {
  const router = useRouter();

  const isHydrated = useTreeHydration();
  const currentNodeId = useTreeStore((s) => s.currentNodeId);
  const answers = useTreeStore((s) => s.answers);
  const outcomeId = useTreeStore((s) => s.outcomeId);
  const sessionStartedAt = useTreeStore((s) => s.sessionStartedAt);
  const history = useTreeStore((s) => s.history);
  const userName = useTreeStore((s) => s.userName);
  const selectOption = useTreeStore((s) => s.selectOption);
  const reset = useTreeStore((s) => s.reset);

  useTrackStep('posso_avere', { currentNodeId, answers, history, sessionStartedAt, userName });

  // Reset stale session if current node no longer exists in tree
  useEffect(() => {
    if (isHydrated && sessionStartedAt && !getNode(italianTree, currentNodeId)) {
      reset();
      router.replace('/');
    }
  }, [isHydrated, sessionStartedAt, currentNodeId, reset, router]);

  // Redirect to welcome if user accessed /tree directly without a session
  useEffect(() => {
    if (
      isHydrated &&
      sessionStartedAt === null &&
      history.length === 0 &&
      currentNodeId === italianTree.startNodeId &&
      outcomeId === null
    ) {
      router.replace('/');
    }
  }, [isHydrated, sessionStartedAt, history.length, currentNodeId, outcomeId, router]);

  // Redirect to outcome page when tree reaches a terminal node
  useEffect(() => {
    if (isHydrated && outcomeId && isTerminalNode(italianTree, outcomeId)) {
      const slug = getSlugFromNodeId(outcomeId);
      if (slug) {
        router.replace(`/outcome/${slug}`);
      }
    }
  }, [isHydrated, outcomeId, router]);

  // Hydration guard: show spinner until localStorage state is loaded
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

  // Redirect in progress: show spinner while navigating to outcome page
  if (outcomeId && isTerminalNode(italianTree, outcomeId)) {
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

  // Question screen: render TreePlayer
  return (
    <ContentColumn>
      <TreePlayer
        tree={italianTree}
        currentNodeId={currentNodeId}
        answers={answers}
        historyLength={history.length}
        onSelectOption={selectOption}
      />
    </ContentColumn>
  );
}
