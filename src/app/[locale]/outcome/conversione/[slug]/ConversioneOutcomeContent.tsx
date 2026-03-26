'use client';

import { OutcomePage } from '@/components/outcome';
import { conversioneTree } from '@/lib/conversione-tree';
import { getConversioneSlugFromNodeId } from '@/lib/conversione-outcome-slugs';
import {
  useConversioneHydration,
  useConversioneStore,
} from '@/store/conversione-store';
import { useTrackOutcome } from '@/hooks/useTrackOutcome';

interface ConversioneOutcomeContentProps {
  nodeId: string;
}

export default function ConversioneOutcomeContent({
  nodeId,
}: ConversioneOutcomeContentProps) {
  const isHydrated = useConversioneHydration();
  const answers = useConversioneStore((s) => s.answers);
  const history = useConversioneStore((s) => s.history);
  const sessionStartedAt = useConversioneStore((s) => s.sessionStartedAt);
  const reset = useConversioneStore((s) => s.reset);
  const goBackTo = useConversioneStore((s) => s.goBackTo);

  useTrackOutcome(nodeId, {
    treeType: 'conversione',
    answers,
    history,
    sessionStartedAt,
    getSlug: (id) => getConversioneSlugFromNodeId(id) ?? null,
    isHydrated,
  });

  return (
    <OutcomePage
      nodeId={nodeId}
      tree={conversioneTree}
      isHydrated={isHydrated}
      userName={null}
      answers={answers}
      history={history}
      onReset={reset}
      onGoBackTo={goBackTo}
      treePath="/tree/conversione"
    />
  );
}
