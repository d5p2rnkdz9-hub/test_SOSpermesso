'use client';

import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { TreePlayer } from '@/components/tree';
import { useRouter } from '@/i18n/navigation';
import { italianTree } from '@/lib/tree-data';
import { isTerminalNode, getNode } from '@/lib/tree-engine';
import { getSlugFromNodeId } from '@/lib/outcome-slugs';
import { useTreeStore } from '@/store/tree-store';
import { useTrackStep } from '@/hooks/useTrackStep';
import { translateTree } from '@/i18n/translateTree';
import { getTranslationMap } from '@/i18n/loadTranslations';

export default function TreeContent() {
  const router = useRouter();
  const locale = useLocale();
  const tree = useMemo(() => translateTree(italianTree, getTranslationMap(locale)), [locale]);

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
    if (sessionStartedAt && !getNode(tree, currentNodeId)) {
      reset();
      router.replace('/');
    }
  }, [sessionStartedAt, currentNodeId, reset, router]);

  // Redirect to welcome if user accessed /tree directly without a session
  useEffect(() => {
    if (
      sessionStartedAt === null &&
      history.length === 0 &&
      currentNodeId === tree.startNodeId &&
      outcomeId === null
    ) {
      router.replace('/');
    }
  }, [sessionStartedAt, history.length, currentNodeId, outcomeId, router]);

  // Redirect to outcome page when tree reaches a terminal node
  useEffect(() => {
    if (outcomeId && isTerminalNode(tree, outcomeId)) {
      const slug = getSlugFromNodeId(outcomeId);
      if (slug) {
        router.replace(`/outcome/${slug}`);
      }
    }
  }, [outcomeId, router]);

  // Redirect in progress: show spinner while navigating to outcome page
  if (outcomeId && isTerminalNode(tree, outcomeId)) {
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
        tree={tree}
        currentNodeId={currentNodeId}
        answers={answers}
        historyLength={history.length}
        onSelectOption={selectOption}
      />
    </ContentColumn>
  );
}
