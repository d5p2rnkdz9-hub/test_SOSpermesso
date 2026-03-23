'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { TreePlayer } from '@/components/tree';
import { useRouter } from '@/i18n/navigation';
import { rinnovoConversioneTree } from '@/lib/rinnovo-conversione-tree';
import { isTerminalNode } from '@/lib/tree-engine';
import { getRCSlugFromNodeId } from '@/lib/rinnovo-conversione-outcome-slugs';
import {
  useRinnovoConversioneHydration,
  useRinnovoConversioneStore,
} from '@/store/rinnovo-conversione-store';

export default function RinnovoConversioneContent() {
  const router = useRouter();

  const isHydrated = useRinnovoConversioneHydration();
  const currentNodeId = useRinnovoConversioneStore((s) => s.currentNodeId);
  const answers = useRinnovoConversioneStore((s) => s.answers);
  const outcomeId = useRinnovoConversioneStore((s) => s.outcomeId);
  const sessionStartedAt = useRinnovoConversioneStore((s) => s.sessionStartedAt);
  const history = useRinnovoConversioneStore((s) => s.history);
  const selectOption = useRinnovoConversioneStore((s) => s.selectOption);
  const startSession = useRinnovoConversioneStore((s) => s.startSession);

  // Auto-start session on first visit (no welcome page)
  useEffect(() => {
    if (isHydrated && sessionStartedAt === null) {
      startSession();
    }
  }, [isHydrated, sessionStartedAt, startSession]);

  // Redirect to outcome page when tree reaches a terminal node
  useEffect(() => {
    if (isHydrated && outcomeId && isTerminalNode(rinnovoConversioneTree, outcomeId)) {
      const slug = getRCSlugFromNodeId(outcomeId);
      if (slug) {
        router.replace(`/outcome/rinnovo-conversione/${slug}`);
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
  if (outcomeId && isTerminalNode(rinnovoConversioneTree, outcomeId)) {
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
        tree={rinnovoConversioneTree}
        currentNodeId={currentNodeId}
        answers={answers}
        historyLength={history.length}
        onSelectOption={selectOption}
      />
    </ContentColumn>
  );
}
