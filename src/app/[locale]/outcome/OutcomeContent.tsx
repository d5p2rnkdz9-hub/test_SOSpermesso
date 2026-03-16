'use client';

import { OutcomePage } from '@/components/outcome';
import { italianTree } from '@/lib/tree-data';
import { useTreeHydration, useTreeStore } from '@/store/tree-store';

interface OutcomeContentProps {
  nodeId: string;
}

export default function OutcomeContent({ nodeId }: OutcomeContentProps) {
  const isHydrated = useTreeHydration();
  const userName = useTreeStore((s) => s.userName);
  const answers = useTreeStore((s) => s.answers);
  const history = useTreeStore((s) => s.history);
  const reset = useTreeStore((s) => s.reset);
  const goBackTo = useTreeStore((s) => s.goBackTo);

  return (
    <OutcomePage
      nodeId={nodeId}
      tree={italianTree}
      isHydrated={isHydrated}
      userName={userName}
      answers={answers}
      history={history}
      onReset={reset}
      onGoBackTo={goBackTo}
    />
  );
}
